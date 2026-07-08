/**
 * Service-layer contracts. This is the ONLY boundary the app talks to for data.
 * The mock implementation in `services/mock/*` is exported from `services/index.ts`
 * and will later be swapped for a Firebase-backed implementation with no changes
 * required in slices or components.
 */
import type {
  PayoutMethod,
  PayoutStatus,
  Role,
  SiteStatus,
  UserStatus,
} from "@/lib/constants";

export interface LegalInfo {
  accountType: "individual" | "company";
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
}

export interface PayoutDetails {
  method: PayoutMethod;
  walletAddress?: string;
  bankName?: string;
  accountTitle?: string;
  bankAccount?: string;
  iban?: string;
}

export interface PayoutHistory {
  payouts: Payout[];
  balanceCents: number;
  totalPaidCents: number;
  pendingCents: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  revenueShare: number; // 0..1, applied by ReportsService for publishers
  status: UserStatus;
  joinedAt: string; // ISO
  legal?: LegalInfo;
  payout?: PayoutDetails;
}

export interface Site {
  id: string;
  ownerId: string;
  ownerName: string;
  domain: string;
  status: SiteStatus;
  addedAt: string; // ISO
  gamMappingName?: string;
}

export interface Payout {
  id: string;
  userId: string;
  userName: string;
  periodLabel: string;
  amountCents: number;
  method: PayoutMethod;
  status: PayoutStatus;
  createdAt: string; // ISO
}

/** A single aggregated row shown in tables/charts. Revenue is integer cents. */
export interface ReportRow {
  key: string;
  date?: string; // ISO date when grouped by date
  siteId?: string;
  siteDomain?: string;
  impressions: number;
  clicks: number;
  revenueCents: number;
  ecpmCents: number;
  ctr: number; // 0..1
  viewability: number; // 0..1
}

export interface ReportTotals {
  impressions: number;
  clicks: number;
  revenueCents: number;
  ecpmCents: number;
  ctr: number;
  viewability: number;
}

export interface MetricWithDelta {
  value: number;
  /** ratio change vs previous equal-length period, 0..±1 space */
  delta: number;
}

export interface DashboardSummary {
  revenueCents: MetricWithDelta;
  impressions: MetricWithDelta;
  ecpmCents: MetricWithDelta;
  ctr: MetricWithDelta;
  viewability: MetricWithDelta;
  clicks: number;
  matchRate: number; // 0..1
  activeSites: number;
}

export interface TimeseriesPoint {
  date: string; // ISO date
  revenueCents: number;
  impressions: number;
  ecpmCents: number;
  ctr: number;
}

export interface DeviceSlice {
  device: string;
  share: number; // 0..1
}

export interface CountrySlice {
  code: string;
  name: string;
  revenueCents: number;
  share: number; // 0..1
}

export interface DashboardData {
  summary: DashboardSummary;
  timeseries: TimeseriesPoint[];
  siteBreakdown: ReportRow[];
  deviceMix: DeviceSlice[];
  topCountries: CountrySlice[];
}

export interface DateRange {
  from: string; // ISO date (inclusive)
  to: string; // ISO date (inclusive)
}

export interface ReportQuery extends DateRange {
  /** Requesting user; determines revenue-share multiplier. */
  userId: string;
  role: Role;
  /** Restrict to these site ids. Empty/undefined = all sites visible to user. */
  siteIds?: string[];
  groupBy: "date" | "site";
}

export interface DashboardQuery extends DateRange {
  userId: string;
  role: Role;
}

// ---- Service interfaces ---------------------------------------------------

export interface AuthService {
  login(email: string, password: string): Promise<User>;
  register(name: string, email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  /**
   * Google popup sign-in. Optional: the mock backend does not implement it,
   * so callers must feature-detect (`services.auth.loginWithGoogle?.()`).
   */
  loginWithGoogle?(): Promise<User>;
  /** Change password for a password-provider account (reauth required). */
  changePassword?(currentPassword: string, newPassword: string): Promise<void>;
  /** True when the signed-in user has an email/password provider. */
  hasPasswordProvider?(): boolean;
}

export interface ReportsService {
  getDashboard(query: DashboardQuery): Promise<DashboardData>;
  getReport(query: ReportQuery): Promise<{ rows: ReportRow[]; totals: ReportTotals }>;
}

export interface SitesService {
  listByUser(userId: string): Promise<Site[]>;
  listAll(): Promise<Site[]>;
  addSite(userId: string, domain: string): Promise<Site>;
  /** Admin approve. Optional per-site revenueShare override (0.5–1.0). */
  approveSite(
    siteId: string,
    gamMappingName: string,
    revenueShare?: number,
  ): Promise<Site>;
  rejectSite(siteId: string): Promise<Site>;
  /** Module 9 — checks a site's ads.txt for the GAM publisher line. */
  checkAdsTxt?(domain: string): Promise<AdsTxtResult>;
}

export interface AdsTxtResult {
  found: boolean;
  hasRequiredLine: boolean;
  url: string;
  lineCount?: number;
}

export interface PayoutsService {
  listByUser(userId: string): Promise<Payout[]>;
  listAll(): Promise<Payout[]>;
  listPending(): Promise<Payout[]>;
  getBalanceCents(userId: string): Promise<number>;
  markPaid(payoutId: string): Promise<Payout>;
  savePayoutDetails(userId: string, details: PayoutDetails): Promise<User>;
  /** Module 8 — real payout flow (optional; mock backend omits these). */
  getPayoutHistory?(): Promise<PayoutHistory>;
  requestPayout?(
    periodStart: string,
    periodEnd: string,
  ): Promise<{ payoutId: string; amountCents: number; method: PayoutMethod }>;
  adminProcessPayout?(
    payoutId: string,
    action: "approve" | "reject",
  ): Promise<{ payoutId: string; newStatus: PayoutStatus }>;
}

export interface UsersService {
  list(): Promise<User[]>;
  updateRevenueShare(userId: string, share: number): Promise<User>;
  updateStatus(userId: string, status: UserStatus): Promise<User>;
  /** Raw (100%) revenue this month in integer cents, for admin preview. */
  getRawMonthlyRevenueCents(userId: string): Promise<number>;
  updateAccount(userId: string, patch: { name?: string; email?: string }): Promise<User>;
  updateLegal(userId: string, legal: LegalInfo): Promise<User>;
}

export interface Services {
  auth: AuthService;
  reports: ReportsService;
  sites: SitesService;
  payouts: PayoutsService;
  users: UsersService;
}
