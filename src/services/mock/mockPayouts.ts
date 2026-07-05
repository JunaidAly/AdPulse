import { endOfMonth, format, startOfMonth } from "date-fns";
import type { PayoutDetails, PayoutsService, User } from "@/services/api";
import { PAYOUT_STATUS, ROLES } from "@/lib/constants";
import { db, delay, findUser } from "./db";

/** Balance = share-adjusted revenue this month minus payouts already created. */
function currentMonthRevenueCents(userId: string): number {
  const user = findUser(userId);
  if (!user) return 0;
  const share = user.role === ROLES.ADMIN ? 1 : user.revenueShare;
  const from = format(startOfMonth(db.referenceDate), "yyyy-MM-dd");
  const to = format(endOfMonth(db.referenceDate), "yyyy-MM-dd");
  const siteIds = new Set(db.sites.filter((s) => s.ownerId === userId).map((s) => s.id));
  const raw = db.rawMetrics
    .filter((r) => siteIds.has(r.siteId) && r.date >= from && r.date <= to)
    .reduce((s, r) => s + r.revenueCents, 0);
  return Math.round(raw * share);
}

export const mockPayouts: PayoutsService = {
  async listByUser(userId: string) {
    return delay(
      db.payouts
        .filter((p) => p.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((p) => ({ ...p })),
    );
  },

  async listAll() {
    return delay(
      [...db.payouts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((p) => ({ ...p })),
    );
  },

  async listPending() {
    return delay(db.payouts.filter((p) => p.status === PAYOUT_STATUS.PENDING).map((p) => ({ ...p })));
  },

  async getBalanceCents(userId: string) {
    const pending = db.payouts
      .filter((p) => p.userId === userId && p.status === PAYOUT_STATUS.PENDING)
      .reduce((s, p) => s + p.amountCents, 0);
    return delay(Math.max(0, currentMonthRevenueCents(userId) - pending));
  },

  async markPaid(payoutId: string) {
    const payout = db.payouts.find((p) => p.id === payoutId);
    if (!payout) throw new Error("Payout not found");
    payout.status = PAYOUT_STATUS.PAID;
    return delay({ ...payout });
  },

  async savePayoutDetails(userId: string, details: PayoutDetails): Promise<User> {
    const user = findUser(userId);
    if (!user) throw new Error("User not found");
    user.payout = { ...details };
    return delay({ ...user });
  },
};
