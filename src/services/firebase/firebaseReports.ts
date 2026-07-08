/**
 * Firebase-backed ReportsService (Module 7).
 *
 * Calls the `getReports` callable (which applies the revenue-share
 * multiplier SERVER-SIDE — never here) and maps its per-(date×site) rows
 * into the app's existing DashboardData / report shapes. eCPM/CTR are
 * recomputed with the same lib/format helpers the mock used, for exact
 * contract parity. No artificial delay.
 *
 * Note: reports_raw only has date×site metrics — device mix, top countries,
 * viewability, and match rate are not available from GAM's current report
 * (returned empty / 0). Those need extra GAM dimensions (future module).
 */
import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import { httpsCallable } from "firebase/functions";
import type {
  DashboardData,
  DashboardQuery,
  DashboardSummary,
  ReportQuery,
  ReportRow,
  ReportsService,
  ReportTotals,
  TimeseriesPoint,
} from "@/services/api";
import { computeCtr, computeEcpmCents } from "@/lib/format";
import { functions } from "./config";
import { errorMessage } from "./mappers";

export interface GetReportsRow {
  date: string;
  siteId: string;
  siteDomain: string;
  impressions: number;
  clicks: number;
  revenueCents: number;
  eCPM: number;
  CTR: number;
  viewableImpressions: number;
  measurableImpressions: number;
  ownerUid?: string;
  ownerEmail?: string;
}

export interface GetReportsResponse {
  rows: GetReportsRow[];
  summary: {
    impressions: number;
    clicks: number;
    revenueCents: number;
    eCPM: number;
    CTR: number;
    viewableImpressions: number;
    measurableImpressions: number;
    byOwner?: {
      uid: string;
      ownerEmail: string;
      impressions: number;
      clicks: number;
      revenueCents: number;
    }[];
  };
  sites: { id: string; domain: string }[];
  dateRange: { startDate: string; endDate: string };
}

export const callGetReports = httpsCallable<
  { startDate: string; endDate: string; siteIds?: string[] },
  GetReportsResponse
>(functions, "getReports");

async function fetchRange(
  from: string,
  to: string,
  siteIds?: string[],
): Promise<GetReportsResponse> {
  try {
    const res = await callGetReports({
      startDate: from,
      endDate: to,
      siteIds: siteIds && siteIds.length ? siteIds : undefined,
    });
    return res.data;
  } catch (err) {
    throw new Error(errorMessage(err, "Could not load reports."));
  }
}

interface Acc {
  impressions: number;
  clicks: number;
  revenueCents: number;
  viewable: number;
  measurable: number;
}
function emptyAcc(): Acc {
  return { impressions: 0, clicks: 0, revenueCents: 0, viewable: 0, measurable: 0 };
}
function viewRate(viewable: number, measurable: number): number {
  return measurable > 0 ? viewable / measurable : 0;
}

function deltaRatio(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}

export const firebaseReports: ReportsService = {
  async getReport(query: ReportQuery): Promise<{
    rows: ReportRow[];
    totals: ReportTotals;
  }> {
    const data = await fetchRange(query.from, query.to, query.siteIds);

    const groups = new Map<string, Acc & { domain?: string }>();
    for (const r of data.rows) {
      const key = query.groupBy === "date" ? r.date : r.siteId;
      const g = groups.get(key) ?? { ...emptyAcc(), domain: r.siteDomain };
      g.impressions += r.impressions;
      g.clicks += r.clicks;
      g.revenueCents += r.revenueCents;
      g.viewable += r.viewableImpressions;
      g.measurable += r.measurableImpressions;
      groups.set(key, g);
    }

    const rows: ReportRow[] = [...groups.entries()].map(([key, g]) => ({
      key,
      date: query.groupBy === "date" ? key : undefined,
      siteId: query.groupBy === "site" ? key : undefined,
      siteDomain: query.groupBy === "site" ? g.domain : undefined,
      impressions: g.impressions,
      clicks: g.clicks,
      revenueCents: g.revenueCents,
      ecpmCents: computeEcpmCents(g.revenueCents, g.impressions),
      ctr: computeCtr(g.clicks, g.impressions),
      viewability: viewRate(g.viewable, g.measurable),
    }));

    const totals: ReportTotals = {
      impressions: data.summary.impressions,
      clicks: data.summary.clicks,
      revenueCents: data.summary.revenueCents,
      ecpmCents: computeEcpmCents(
        data.summary.revenueCents,
        data.summary.impressions,
      ),
      ctr: computeCtr(data.summary.clicks, data.summary.impressions),
      viewability: viewRate(
        data.summary.viewableImpressions,
        data.summary.measurableImpressions,
      ),
    };

    return { rows, totals };
  },

  async getDashboard(query: DashboardQuery): Promise<DashboardData> {
    const spanDays =
      differenceInCalendarDays(parseISO(query.to), parseISO(query.from)) + 1;
    const prevTo = format(subDays(parseISO(query.from), 1), "yyyy-MM-dd");
    const prevFrom = format(
      subDays(parseISO(query.from), spanDays),
      "yyyy-MM-dd",
    );

    const [current, previous] = await Promise.all([
      fetchRange(query.from, query.to),
      fetchRange(prevFrom, prevTo),
    ]);

    // Timeseries grouped by date.
    const byDate = new Map<string, Acc>();
    for (const r of current.rows) {
      const g = byDate.get(r.date) ?? emptyAcc();
      g.impressions += r.impressions;
      g.clicks += r.clicks;
      g.revenueCents += r.revenueCents;
      byDate.set(r.date, g);
    }
    const timeseries: TimeseriesPoint[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, g]) => ({
        date,
        revenueCents: g.revenueCents,
        impressions: g.impressions,
        ecpmCents: computeEcpmCents(g.revenueCents, g.impressions),
        ctr: computeCtr(g.clicks, g.impressions),
      }));

    // Per-site breakdown.
    const bySite = new Map<string, Acc & { domain: string }>();
    for (const r of current.rows) {
      const g = bySite.get(r.siteId) ?? { ...emptyAcc(), domain: r.siteDomain };
      g.impressions += r.impressions;
      g.clicks += r.clicks;
      g.revenueCents += r.revenueCents;
      g.viewable += r.viewableImpressions;
      g.measurable += r.measurableImpressions;
      bySite.set(r.siteId, g);
    }
    const siteBreakdown: ReportRow[] = [...bySite.entries()]
      .map(([siteId, g]) => ({
        key: siteId,
        siteId,
        siteDomain: g.domain,
        impressions: g.impressions,
        clicks: g.clicks,
        revenueCents: g.revenueCents,
        ecpmCents: computeEcpmCents(g.revenueCents, g.impressions),
        ctr: computeCtr(g.clicks, g.impressions),
        viewability: viewRate(g.viewable, g.measurable),
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents);

    const cur = current.summary;
    const prev = previous.summary;
    const curEcpm = computeEcpmCents(cur.revenueCents, cur.impressions);
    const prevEcpm = computeEcpmCents(prev.revenueCents, prev.impressions);
    const curCtr = computeCtr(cur.clicks, cur.impressions);
    const prevCtr = computeCtr(prev.clicks, prev.impressions);
    const curView = viewRate(cur.viewableImpressions, cur.measurableImpressions);
    const prevView = viewRate(
      prev.viewableImpressions,
      prev.measurableImpressions,
    );

    const summary: DashboardSummary = {
      revenueCents: {
        value: cur.revenueCents,
        delta: deltaRatio(cur.revenueCents, prev.revenueCents),
      },
      impressions: {
        value: cur.impressions,
        delta: deltaRatio(cur.impressions, prev.impressions),
      },
      ecpmCents: { value: curEcpm, delta: deltaRatio(curEcpm, prevEcpm) },
      ctr: { value: curCtr, delta: deltaRatio(curCtr, prevCtr) },
      viewability: { value: curView, delta: deltaRatio(curView, prevView) },
      clicks: cur.clicks,
      matchRate: 0,
      activeSites: current.sites.length,
    };

    return { summary, timeseries, siteBreakdown, deviceMix: [], topCountries: [] };
  },
};
