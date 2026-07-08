/**
 * Firebase-backed PayoutsService (Module 8) — fully real, no mock.
 *
 * Payout history + balance come from the getPayoutHistory callable (balance
 * reuses the server-side revenue-share math). Requesting and admin
 * approve/reject go through callables (Firestore rules block direct client
 * writes to payouts). savePayoutDetails writes payoutMethod to the user doc.
 */
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { format, parseISO } from "date-fns";
import type {
  Payout,
  PayoutDetails,
  PayoutHistory,
  PayoutsService,
  User,
} from "@/services/api";
import { PAYOUT_STATUS, type PayoutMethod, type PayoutStatus } from "@/lib/constants";
import { db, functions } from "./config";
import { errorMessage, toUser, type RawUser } from "./mappers";

interface PayoutRow {
  id: string;
  uid: string;
  ownerName: string;
  ownerEmail: string;
  periodStart: string;
  periodEnd: string;
  amountCents: number;
  method: string;
  status: string;
  requestedAt: string | null;
}
interface HistoryResponse {
  payouts: PayoutRow[];
  balance: number;
  totalPaid: number;
  pendingAmount: number;
}

const callGetPayoutHistory = httpsCallable<Record<string, never>, HistoryResponse>(
  functions,
  "getPayoutHistory",
);
const callAdminLogPayout = httpsCallable<
  { uid: string; periodStart: string; periodEnd: string; amountCents?: number },
  { payoutId: string; amountCents: number; method: string }
>(functions, "adminLogPayout");
const callAdminProcessPayout = httpsCallable<
  { payoutId: string; action: "approve" | "reject" },
  { payoutId: string; newStatus: string }
>(functions, "adminProcessPayout");

function formatPeriod(start: string, end: string): string {
  if (!start || !end) return "—";
  if (start === end) return format(parseISO(start), "MMM d, yyyy");
  return `${format(parseISO(start), "MMM d")} – ${format(
    parseISO(end),
    "MMM d, yyyy",
  )}`;
}

function rowToPayout(r: PayoutRow): Payout {
  return {
    id: r.id,
    userId: r.uid,
    userName: r.ownerName || r.ownerEmail || "—",
    periodLabel: formatPeriod(r.periodStart, r.periodEnd),
    amountCents: r.amountCents,
    method: r.method as PayoutMethod,
    status: r.status as PayoutStatus,
    createdAt: r.requestedAt ?? new Date().toISOString(),
  };
}

async function history(): Promise<PayoutHistory> {
  try {
    const res = await callGetPayoutHistory({});
    return {
      payouts: res.data.payouts.map(rowToPayout),
      balanceCents: res.data.balance,
      totalPaidCents: res.data.totalPaid,
      pendingCents: res.data.pendingAmount,
    };
  } catch (err) {
    throw new Error(errorMessage(err, "Could not load payout history."));
  }
}

export const firebasePayouts: PayoutsService = {
  // --- Module 8 primary methods ---
  getPayoutHistory: history,

  async adminLogPayout(userId, periodStart, periodEnd, amountCents) {
    try {
      const res = await callAdminLogPayout({
        uid: userId,
        periodStart,
        periodEnd,
        ...(amountCents !== undefined ? { amountCents } : {}),
      });
      return {
        payoutId: res.data.payoutId,
        amountCents: res.data.amountCents,
        method: res.data.method as PayoutMethod,
      };
    } catch (err) {
      throw new Error(errorMessage(err, "Could not log payout."));
    }
  },

  async adminProcessPayout(payoutId, action) {
    try {
      const res = await callAdminProcessPayout({ payoutId, action });
      return {
        payoutId: res.data.payoutId,
        newStatus: res.data.newStatus as PayoutStatus,
      };
    } catch (err) {
      throw new Error(errorMessage(err, "Could not process payout."));
    }
  },

  // --- Existing contract methods, backed by the callables above ---
  async listByUser() {
    return (await history()).payouts;
  },
  async listAll() {
    return (await history()).payouts;
  },
  async listPending() {
    return (await history()).payouts.filter(
      (p) => p.status === PAYOUT_STATUS.PENDING,
    );
  },
  async getBalanceCents() {
    return (await history()).balanceCents;
  },
  async markPaid(payoutId) {
    await callAdminProcessPayout({ payoutId, action: "approve" });
    const found = (await history()).payouts.find((p) => p.id === payoutId);
    if (!found) throw new Error("Payout not found");
    return found;
  },

  async savePayoutDetails(userId: string, details: PayoutDetails): Promise<User> {
    const payoutMethod: Record<string, string> = { type: details.method };
    if (details.walletAddress) payoutMethod.walletAddress = details.walletAddress;
    if (details.bankName) payoutMethod.bankName = details.bankName;
    if (details.accountTitle) payoutMethod.accountTitle = details.accountTitle;
    if (details.iban) payoutMethod.iban = details.iban;
    try {
      await updateDoc(doc(db, "users", userId), {
        payoutMethod,
        updatedAt: serverTimestamp(),
      });
      const snap = await getDoc(doc(db, "users", userId));
      return toUser(userId, (snap.data() ?? {}) as RawUser);
    } catch (err) {
      throw new Error(errorMessage(err, "Could not save payout method."));
    }
  },
};
