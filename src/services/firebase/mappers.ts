/**
 * Shared mappers between Firestore/callable payloads and the app's `api.ts`
 * types. Lives inside services/firebase so the rest of the app stays
 * firebase-ignorant. Handles both raw Firestore docs (Timestamps) and
 * callable responses (ISO strings).
 */
import { Timestamp } from "firebase/firestore";
import type { LegalInfo, PayoutDetails, Site, User } from "@/services/api";
import type { Role, UserStatus } from "@/lib/constants";

type MaybeTimestamp = Timestamp | string | null | undefined;

export function tsToIso(value: MaybeTimestamp): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

/** Raw shape of a users/{uid} doc or the callable's userResponse. */
export interface RawUser {
  uid?: string;
  email?: string | null;
  name?: string;
  role?: string;
  status?: string;
  revenueShare?: number;
  createdAt?: MaybeTimestamp;
  payoutMethod?: {
    type?: "usdt" | "bank";
    walletAddress?: string;
    bankName?: string;
    accountTitle?: string;
    iban?: string;
  } | null;
  legal?: LegalInfo | null;
}

/** Raw shape of a sites/{id} doc or the callable's siteResponse. */
export interface RawSite {
  ownerUid?: string;
  domain?: string;
  gamSiteName?: string | null;
  status?: string;
  revenueShare?: number | null;
  createdAt?: MaybeTimestamp;
  ownerName?: string; // present on callable responses only
}

// Backend user.status includes "pending"; the app's User type only knows
// active/suspended. Pending is treated as usable (active) for now.
function mapStatus(status?: string): UserStatus {
  return status === "suspended" ? "suspended" : "active";
}

function mapPayout(
  method?: RawUser["payoutMethod"],
): PayoutDetails | undefined {
  if (!method || !method.type) return undefined;
  const details: PayoutDetails = { method: method.type };
  if (method.walletAddress) details.walletAddress = method.walletAddress;
  if (method.bankName) details.bankName = method.bankName;
  if (method.accountTitle) details.accountTitle = method.accountTitle;
  if (method.iban) details.iban = method.iban;
  return details;
}

export function toUser(id: string, data: RawUser): User {
  return {
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    role: (data.role as Role) ?? "publisher",
    revenueShare:
      typeof data.revenueShare === "number" ? data.revenueShare : 0.8,
    status: mapStatus(data.status),
    joinedAt: tsToIso(data.createdAt),
    legal: data.legal ?? undefined,
    payout: mapPayout(data.payoutMethod),
  };
}

export function toSite(id: string, data: RawSite, ownerName = ""): Site {
  return {
    id,
    ownerId: data.ownerUid ?? "",
    ownerName: data.ownerName ?? ownerName,
    domain: data.domain ?? "",
    status: (data.status as Site["status"]) ?? "pending",
    addedAt: tsToIso(data.createdAt),
    gamMappingName: data.gamSiteName ?? undefined,
  };
}

/** Extract a friendly message from a Firebase callable/SDK error. */
export function errorMessage(err: unknown, fallback: string): string {
  const msg = (err as { message?: string })?.message;
  return typeof msg === "string" && msg.length > 0 ? msg : fallback;
}
