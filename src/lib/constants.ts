export const ROLES = {
  ADMIN: "admin",
  PUBLISHER: "publisher",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Minimum balance (in integer cents) before a payout can be processed. */
export const PAYOUT_MINIMUM_CENTS = 5000;

export const PAYOUT_METHODS = {
  USDT: "usdt",
  BANK: "bank",
} as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[keyof typeof PAYOUT_METHODS];

export const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  usdt: "USDT (min. $50.00)",
  bank: "Bank transfer",
};

export type DatePresetId = "today" | "7d" | "30d" | "month" | "custom";

export interface DatePreset {
  id: DatePresetId;
  label: string;
  days: number | null; // null = special handling (today / month / custom)
}

export const DATE_PRESETS: DatePreset[] = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "Last 7 Days", days: 7 },
  { id: "30d", label: "Last 30 Days", days: 30 },
  { id: "month", label: "This Month", days: null },
  { id: "custom", label: "Custom", days: null },
];

export const REVENUE_SHARE_MIN = 0.5;
export const REVENUE_SHARE_MAX = 1.0;
export const REVENUE_SHARE_STEP = 0.05;

export const SITE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type SiteStatus = (typeof SITE_STATUS)[keyof typeof SITE_STATUS];

export const PAYOUT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REJECTED: "rejected",
} as const;

export type PayoutStatus = (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
