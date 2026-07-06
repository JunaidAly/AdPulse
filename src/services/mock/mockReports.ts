import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import type {
  CountrySlice,
  DashboardData,
  DashboardQuery,
  DashboardSummary,
  DeviceSlice,
  ReportQuery,
  ReportRow,
  ReportsService,
  ReportTotals,
} from "@/services/api";
import { ROLES } from "@/lib/constants";
import { computeCtr, computeEcpmCents } from "@/lib/format";
import { db, delay, findUser, resolveUserId } from "./db";
import { siteProfiles, type RawMetric } from "./seed";

interface AdjustedMetric {
  siteId: string;
  date: string;
  impressions: number;
  clicks: number;
  revenueCents: number;
  viewability: number;
}

/**
 * Apply the publisher revenue-share exactly as the real backend will: scale the
 * absolute counts, then RECOMPUTE ratios from the adjusted numbers. Admin (share
 * 1.0) is a no-op. This multiplier lives only here — slices/components never see it.
 */
function applyShare(row: RawMetric, share: number): AdjustedMetric {
  return {
    siteId: row.siteId,
    date: row.date,
    impressions: Math.round(row.impressions * share),
    clicks: Math.round(row.clicks * share),
    revenueCents: Math.round(row.revenueCents * share),
    viewability: row.viewability,
  };
}

function effectiveShare(userId: string, role: string): number {
  if (role === ROLES.ADMIN) return 1.0;
  return findUser(userId)?.revenueShare ?? 1.0;
}

function visibleSiteIds(userId: string, role: string, filter?: string[]): string[] {
  const owned =
    role === ROLES.ADMIN
      ? db.sites.map((s) => s.id)
      : db.sites
          .filter((s) => s.ownerId === resolveUserId(userId))
          .map((s) => s.id);
  if (filter && filter.length) return owned.filter((id) => filter.includes(id));
  return owned;
}

function collect(
  siteIds: string[],
  from: string,
  to: string,
  share: number,
): AdjustedMetric[] {
  const set = new Set(siteIds);
  return db.rawMetrics
    .filter((r) => set.has(r.siteId) && r.date >= from && r.date <= to)
    .map((r) => applyShare(r, share));
}

function totalsOf(rows: AdjustedMetric[]): ReportTotals {
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const revenueCents = rows.reduce((s, r) => s + r.revenueCents, 0);
  const viewability =
    impressions > 0
      ? rows.reduce((s, r) => s + r.viewability * r.impressions, 0) / impressions
      : 0;
  return {
    impressions,
    clicks,
    revenueCents,
    ecpmCents: computeEcpmCents(revenueCents, impressions),
    ctr: computeCtr(clicks, impressions),
    viewability,
  };
}

function deltaRatio(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}

export const mockReports: ReportsService = {
  async getDashboard(query: DashboardQuery): Promise<DashboardData> {
    const { userId, role, from, to } = query;
    const share = effectiveShare(userId, role);
    const siteIds = visibleSiteIds(userId, role);

    const current = collect(siteIds, from, to, share);
    const totals = totalsOf(current);

    // Previous equal-length period for deltas.
    const spanDays = differenceInCalendarDays(parseISO(to), parseISO(from)) + 1;
    const prevTo = format(subDays(parseISO(from), 1), "yyyy-MM-dd");
    const prevFrom = format(subDays(parseISO(from), spanDays), "yyyy-MM-dd");
    const prevTotals = totalsOf(collect(siteIds, prevFrom, prevTo, share));

    const summary: DashboardSummary = {
      revenueCents: { value: totals.revenueCents, delta: deltaRatio(totals.revenueCents, prevTotals.revenueCents) },
      impressions: { value: totals.impressions, delta: deltaRatio(totals.impressions, prevTotals.impressions) },
      ecpmCents: { value: totals.ecpmCents, delta: deltaRatio(totals.ecpmCents, prevTotals.ecpmCents) },
      ctr: { value: totals.ctr, delta: deltaRatio(totals.ctr, prevTotals.ctr) },
      viewability: { value: totals.viewability, delta: deltaRatio(totals.viewability, prevTotals.viewability) },
      clicks: totals.clicks,
      matchRate: 0.7 + Math.min(0.2, totals.impressions / 5_000_000),
      activeSites: siteIds.filter((id) => db.sites.find((s) => s.id === id)?.status === "approved").length,
    };

    // Timeseries grouped by date.
    const byDate = new Map<string, AdjustedMetric[]>();
    for (const r of current) {
      (byDate.get(r.date) ?? byDate.set(r.date, []).get(r.date)!).push(r);
    }
    const timeseries = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rows]) => {
        const t = totalsOf(rows);
        return { date, revenueCents: t.revenueCents, impressions: t.impressions, ecpmCents: t.ecpmCents, ctr: t.ctr };
      });

    // Per-site breakdown.
    const bySite = new Map<string, AdjustedMetric[]>();
    for (const r of current) {
      (bySite.get(r.siteId) ?? bySite.set(r.siteId, []).get(r.siteId)!).push(r);
    }
    const siteBreakdown: ReportRow[] = [...bySite.entries()]
      .map(([siteId, rows]) => {
        const t = totalsOf(rows);
        const site = db.sites.find((s) => s.id === siteId);
        return {
          key: siteId,
          siteId,
          siteDomain: site?.domain ?? siteId,
          impressions: t.impressions,
          clicks: t.clicks,
          revenueCents: t.revenueCents,
          ecpmCents: t.ecpmCents,
          ctr: t.ctr,
          viewability: t.viewability,
        };
      })
      .sort((a, b) => b.revenueCents - a.revenueCents);

    // Device mix (revenue-weighted across visible sites).
    const deviceAcc = new Map<string, number>();
    let deviceTotal = 0;
    for (const [siteId, rows] of bySite) {
      const rev = rows.reduce((s, r) => s + r.revenueCents, 0);
      for (const d of siteProfiles[siteId]?.devices ?? []) {
        deviceAcc.set(d.device, (deviceAcc.get(d.device) ?? 0) + d.share * rev);
        deviceTotal += d.share * rev;
      }
    }
    const deviceMix: DeviceSlice[] = [...deviceAcc.entries()]
      .map(([device, w]) => ({ device, share: deviceTotal > 0 ? w / deviceTotal : 0 }))
      .sort((a, b) => b.share - a.share);

    // Top countries (revenue-weighted).
    const countryAcc = new Map<string, { name: string; w: number }>();
    let countryTotal = 0;
    for (const [siteId, rows] of bySite) {
      const rev = rows.reduce((s, r) => s + r.revenueCents, 0);
      for (const c of siteProfiles[siteId]?.countries ?? []) {
        const prev = countryAcc.get(c.code) ?? { name: c.name, w: 0 };
        prev.w += c.weight * rev;
        countryAcc.set(c.code, prev);
        countryTotal += c.weight * rev;
      }
    }
    const topCountries: CountrySlice[] = [...countryAcc.entries()]
      .map(([code, { name, w }]) => ({
        code,
        name,
        share: countryTotal > 0 ? w / countryTotal : 0,
        revenueCents: Math.round((countryTotal > 0 ? w / countryTotal : 0) * totals.revenueCents),
      }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 5);

    return delay({ summary, timeseries, siteBreakdown, deviceMix, topCountries });
  },

  async getReport(query: ReportQuery): Promise<{ rows: ReportRow[]; totals: ReportTotals }> {
    const { userId, role, from, to, siteIds, groupBy } = query;
    const share = effectiveShare(userId, role);
    const ids = visibleSiteIds(userId, role, siteIds);
    const rows = collect(ids, from, to, share);
    const totals = totalsOf(rows);

    const groups = new Map<string, AdjustedMetric[]>();
    for (const r of rows) {
      const key = groupBy === "date" ? r.date : r.siteId;
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(r);
    }

    const out: ReportRow[] = [...groups.entries()].map(([key, g]) => {
      const t = totalsOf(g);
      const site = groupBy === "site" ? db.sites.find((s) => s.id === key) : undefined;
      return {
        key,
        date: groupBy === "date" ? key : undefined,
        siteId: groupBy === "site" ? key : undefined,
        siteDomain: site?.domain,
        impressions: t.impressions,
        clicks: t.clicks,
        revenueCents: t.revenueCents,
        ecpmCents: t.ecpmCents,
        ctr: t.ctr,
        viewability: t.viewability,
      };
    });

    out.sort((a, b) =>
      groupBy === "date"
        ? (b.date ?? "").localeCompare(a.date ?? "")
        : b.revenueCents - a.revenueCents,
    );

    return delay({ rows: out, totals });
  },
};
