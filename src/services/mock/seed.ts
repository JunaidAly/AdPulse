/**
 * Deterministic seed data. A seeded PRNG makes all generated metrics stable
 * across reloads. Revenue is stored as integer cents everywhere.
 */
import { addDays, format, startOfDay, subDays } from "date-fns";
import type { LegalInfo, Payout, Site, User } from "@/services/api";
import {
  PAYOUT_METHODS,
  PAYOUT_STATUS,
  ROLES,
  SITE_STATUS,
  USER_STATUS,
} from "@/lib/constants";

export const HISTORY_DAYS = 90;

/** Small deterministic PRNG (mulberry32). */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface RawMetric {
  siteId: string;
  date: string; // yyyy-MM-dd
  impressions: number;
  clicks: number;
  revenueCents: number;
  ecpmCents: number;
  viewability: number; // 0..1
}

export interface SiteProfile {
  base: number; // baseline daily impressions
  ecpmFloor: number; // dollars
  ecpmRange: number; // dollars
  ctrFloor: number; // ratio
  ctrRange: number; // ratio
  viewFloor: number;
  devices: { device: string; share: number }[];
  countries: { code: string; name: string; weight: number }[];
}

const DEVICE_TEMPLATES = [
  { device: "Smartphone", share: 0.82 },
  { device: "Desktop", share: 0.11 },
  { device: "Connected TV", share: 0.04 },
  { device: "Tablet", share: 0.03 },
];

const COUNTRY_POOL = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "EG", name: "Egypt" },
  { code: "AE", name: "UAE" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
];

const legal = (over: Partial<LegalInfo> = {}): LegalInfo => ({
  accountType: "individual",
  fullName: "",
  address: "",
  city: "",
  postalCode: "",
  countryCode: "",
  ...over,
});

// ---- Users ----------------------------------------------------------------

export const seedUsers: User[] = [
  {
    id: "u_admin",
    name: "Admin",
    email: "admin@demo.com",
    role: ROLES.ADMIN,
    revenueShare: 1.0,
    status: USER_STATUS.ACTIVE,
    joinedAt: "2025-09-01T09:00:00.000Z",
  },
  {
    id: "u_pub",
    name: "Imran",
    email: "publisher@demo.com",
    role: ROLES.PUBLISHER,
    revenueShare: 0.8,
    status: USER_STATUS.ACTIVE,
    joinedAt: "2025-11-14T10:30:00.000Z",
    legal: legal({ fullName: "Imran Ali", city: "Dubai", countryCode: "AE" }),
    payout: { method: PAYOUT_METHODS.USDT, walletAddress: "0x3369994d7fe4aeb61bc3c2ece8b49" },
  },
  {
    id: "u_maria",
    name: "Maria Santos",
    email: "maria@newsly.com",
    role: ROLES.PUBLISHER,
    revenueShare: 0.75,
    status: USER_STATUS.ACTIVE,
    joinedAt: "2025-10-02T08:15:00.000Z",
    payout: { method: PAYOUT_METHODS.BANK, bankName: "Novo Banco", iban: "PT50000201231234567890154" },
  },
  {
    id: "u_sam",
    name: "Sam Wright",
    email: "sam@techbeat.io",
    role: ROLES.PUBLISHER,
    revenueShare: 0.85,
    status: USER_STATUS.ACTIVE,
    joinedAt: "2025-12-20T14:45:00.000Z",
    payout: { method: PAYOUT_METHODS.USDT, walletAddress: "0x91ab77cc22de55ff88aa1234bc90de" },
  },
  {
    id: "u_lena",
    name: "Lena Fischer",
    email: "lena@foodiehub.co",
    role: ROLES.PUBLISHER,
    revenueShare: 0.7,
    status: USER_STATUS.SUSPENDED,
    joinedAt: "2026-02-11T11:00:00.000Z",
  },
];

// ---- Sites ----------------------------------------------------------------

interface SiteSeed extends Omit<Site, "ownerName"> {}

export const seedSites: SiteSeed[] = [
  { id: "s_1", ownerId: "u_pub", domain: "dailyscope.com", status: SITE_STATUS.APPROVED, addedAt: "2025-11-15T10:00:00.000Z", gamMappingName: "MI delegation" },
  { id: "s_2", ownerId: "u_pub", domain: "sportspulse.net", status: SITE_STATUS.APPROVED, addedAt: "2025-12-01T10:00:00.000Z", gamMappingName: "SP delegation" },
  { id: "s_3", ownerId: "u_maria", domain: "newsly.com", status: SITE_STATUS.APPROVED, addedAt: "2025-10-03T10:00:00.000Z", gamMappingName: "NW delegation" },
  { id: "s_4", ownerId: "u_maria", domain: "worldwatch.org", status: SITE_STATUS.APPROVED, addedAt: "2025-10-20T10:00:00.000Z", gamMappingName: "WW delegation" },
  { id: "s_5", ownerId: "u_maria", domain: "culturewire.com", status: SITE_STATUS.PENDING, addedAt: "2026-06-28T10:00:00.000Z" },
  { id: "s_6", ownerId: "u_sam", domain: "techbeat.io", status: SITE_STATUS.APPROVED, addedAt: "2025-12-21T10:00:00.000Z", gamMappingName: "TB delegation" },
  { id: "s_7", ownerId: "u_sam", domain: "gadgetflow.dev", status: SITE_STATUS.PENDING, addedAt: "2026-06-30T10:00:00.000Z" },
  { id: "s_8", ownerId: "u_lena", domain: "foodiehub.co", status: SITE_STATUS.REJECTED, addedAt: "2026-02-12T10:00:00.000Z" },
];

function buildProfile(siteId: string): SiteProfile {
  const rand = mulberry32(hashString(siteId));
  const base = 8000 + Math.floor(rand() * 42000); // 8k..50k
  const devices = DEVICE_TEMPLATES.map((d) => ({
    device: d.device,
    share: d.share * (0.85 + rand() * 0.3),
  }));
  const total = devices.reduce((s, d) => s + d.share, 0);
  devices.forEach((d) => (d.share = d.share / total));

  const countries = [...COUNTRY_POOL]
    .sort(() => rand() - 0.5)
    .slice(0, 5)
    .map((c) => ({ ...c, weight: 0.2 + rand() }));

  return {
    base,
    ecpmFloor: 0.3,
    ecpmRange: 2.2,
    ctrFloor: 0.004,
    ctrRange: 0.012,
    viewFloor: 0.55 + rand() * 0.1,
    devices,
    countries,
  };
}

export const siteProfiles: Record<string, SiteProfile> = Object.fromEntries(
  seedSites.map((s) => [s.id, buildProfile(s.id)]),
);

/** Generate `HISTORY_DAYS` of raw daily metrics per approved/rejected site. */
export function generateRawMetrics(referenceDate: Date): RawMetric[] {
  const rows: RawMetric[] = [];
  const end = startOfDay(referenceDate);
  const start = subDays(end, HISTORY_DAYS - 1);

  for (const site of seedSites) {
    const profile = siteProfiles[site.id];
    for (let i = 0; i < HISTORY_DAYS; i++) {
      const day = addDays(start, i);
      const dateStr = format(day, "yyyy-MM-dd");
      const rand = mulberry32(hashString(site.id + dateStr));

      const dow = day.getDay();
      const weekend = dow === 0 || dow === 6 ? 0.72 : 1;
      const trend = 0.85 + (i / HISTORY_DAYS) * 0.3; // slow growth over window
      const noise = 0.8 + rand() * 0.4;

      const impressions = Math.max(
        1500,
        Math.round(profile.base * weekend * trend * noise),
      );
      const ctr = profile.ctrFloor + rand() * profile.ctrRange;
      const clicks = Math.round(impressions * ctr);
      const ecpm = profile.ecpmFloor + rand() * profile.ecpmRange; // dollars
      const ecpmCents = Math.round(ecpm * 100);
      const revenueCents = Math.round((impressions * ecpmCents) / 1000);
      const viewability = Math.min(0.92, profile.viewFloor + rand() * 0.2);

      rows.push({ siteId: site.id, date: dateStr, impressions, clicks, revenueCents, ecpmCents, viewability });
    }
  }
  return rows;
}

// ---- Payouts --------------------------------------------------------------

export const seedPayouts: Omit<Payout, "userName">[] = [
  { id: "p_1", userId: "u_pub", periodLabel: "March 2026", amountCents: 8420, method: PAYOUT_METHODS.USDT, status: PAYOUT_STATUS.PAID, createdAt: "2026-04-03T12:00:00.000Z" },
  { id: "p_2", userId: "u_pub", periodLabel: "April 2026", amountCents: 9130, method: PAYOUT_METHODS.USDT, status: PAYOUT_STATUS.PAID, createdAt: "2026-05-04T12:00:00.000Z" },
  { id: "p_3", userId: "u_pub", periodLabel: "May 2026", amountCents: 10240, method: PAYOUT_METHODS.USDT, status: PAYOUT_STATUS.PAID, createdAt: "2026-06-05T12:00:00.000Z" },
  { id: "p_4", userId: "u_pub", periodLabel: "June 2026", amountCents: 7860, method: PAYOUT_METHODS.USDT, status: PAYOUT_STATUS.PENDING, createdAt: "2026-07-02T12:00:00.000Z" },
  { id: "p_5", userId: "u_maria", periodLabel: "April 2026", amountCents: 15320, method: PAYOUT_METHODS.BANK, status: PAYOUT_STATUS.PAID, createdAt: "2026-05-04T12:00:00.000Z" },
  { id: "p_6", userId: "u_maria", periodLabel: "May 2026", amountCents: 16110, method: PAYOUT_METHODS.BANK, status: PAYOUT_STATUS.PAID, createdAt: "2026-06-05T12:00:00.000Z" },
  { id: "p_7", userId: "u_maria", periodLabel: "June 2026", amountCents: 14980, method: PAYOUT_METHODS.BANK, status: PAYOUT_STATUS.PENDING, createdAt: "2026-07-02T12:00:00.000Z" },
  { id: "p_8", userId: "u_sam", periodLabel: "May 2026", amountCents: 6220, method: PAYOUT_METHODS.USDT, status: PAYOUT_STATUS.PAID, createdAt: "2026-06-05T12:00:00.000Z" },
  { id: "p_9", userId: "u_sam", periodLabel: "June 2026", amountCents: 6890, method: PAYOUT_METHODS.USDT, status: PAYOUT_STATUS.PENDING, createdAt: "2026-07-02T12:00:00.000Z" },
];
