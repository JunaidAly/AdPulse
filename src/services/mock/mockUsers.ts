import { endOfMonth, format, startOfMonth } from "date-fns";
import type { LegalInfo, User, UsersService } from "@/services/api";
import type { UserStatus } from "@/lib/constants";
import { db, delay, findUser } from "./db";

export const mockUsers: UsersService = {
  async list() {
    return delay(db.users.map((u) => ({ ...u })));
  },

  async updateRevenueShare(userId: string, share: number) {
    const user = findUser(userId);
    if (!user) throw new Error("User not found");
    user.revenueShare = Math.max(0.5, Math.min(1, share));
    return delay({ ...user });
  },

  async updateStatus(userId: string, status: UserStatus) {
    const user = findUser(userId);
    if (!user) throw new Error("User not found");
    user.status = status;
    return delay({ ...user });
  },

  async getRawMonthlyRevenueCents(userId: string) {
    const from = format(startOfMonth(db.referenceDate), "yyyy-MM-dd");
    const to = format(endOfMonth(db.referenceDate), "yyyy-MM-dd");
    const siteIds = new Set(db.sites.filter((s) => s.ownerId === userId).map((s) => s.id));
    const raw = db.rawMetrics
      .filter((r) => siteIds.has(r.siteId) && r.date >= from && r.date <= to)
      .reduce((s, r) => s + r.revenueCents, 0);
    return delay(raw);
  },

  async updateAccount(userId: string, patch: { name?: string; email?: string }) {
    const user = findUser(userId);
    if (!user) throw new Error("User not found");
    if (patch.name !== undefined) user.name = patch.name;
    if (patch.email !== undefined) user.email = patch.email;
    return delay({ ...user });
  },

  async updateLegal(userId: string, legal: LegalInfo) {
    const user = findUser(userId);
    if (!user) throw new Error("User not found");
    user.legal = { ...legal };
    return delay({ ...user });
  },
};
