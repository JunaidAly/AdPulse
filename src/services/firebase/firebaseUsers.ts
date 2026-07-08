/**
 * Firebase-backed UsersService (Module 5).
 *
 * Admin reads are direct Firestore (rules allow admin). Admin mutations
 * (revenueShare, status) go through the adminUpdateUser callable. Self
 * profile edits (name, legal) are direct owner writes (rules-whitelisted).
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { httpsCallable } from "firebase/functions";
import type { LegalInfo, User, UsersService } from "@/services/api";
import type { UserStatus } from "@/lib/constants";
import { db, functions } from "./config";
import { errorMessage, toUser, type RawUser } from "./mappers";
import { callGetReports } from "./firebaseReports";

const callAdminUpdateUser = httpsCallable<
  { uid: string; revenueShare?: number; status?: string },
  RawUser & { id: string }
>(functions, "adminUpdateUser");
const callAdminDeleteUser = httpsCallable<
  { uid: string },
  { uid: string; deleted: boolean; sitesDeleted: number }
>(functions, "adminDeleteUser");

async function readUser(userId: string): Promise<User> {
  const snap = await getDoc(doc(db, "users", userId));
  return toUser(userId, (snap.data() ?? {}) as RawUser);
}

export const firebaseUsers: UsersService = {
  async list(): Promise<User[]> {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => toUser(d.id, d.data() as RawUser));
  },

  async updateRevenueShare(userId: string, share: number): Promise<User> {
    try {
      const res = await callAdminUpdateUser({ uid: userId, revenueShare: share });
      return toUser(res.data.id, res.data);
    } catch (err) {
      throw new Error(errorMessage(err, "Could not update revenue share."));
    }
  },

  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    try {
      const res = await callAdminUpdateUser({ uid: userId, status });
      return toUser(res.data.id, res.data);
    } catch (err) {
      throw new Error(errorMessage(err, "Could not update status."));
    }
  },

  async getRawMonthlyRevenueCents(userId: string): Promise<number> {
    // Real raw (100%) revenue for this owner, this month. Only admins call
    // this (EditUserDialog), so getReports returns all sites at share 1.0;
    // we sum the rows owned by the target user.
    const now = new Date();
    const from = format(startOfMonth(now), "yyyy-MM-dd");
    const to = format(endOfMonth(now), "yyyy-MM-dd");
    try {
      const res = await callGetReports({ startDate: from, endDate: to });
      return res.data.rows
        .filter((r) => r.ownerUid === userId)
        .reduce((sum, r) => sum + r.revenueCents, 0);
    } catch {
      return 0;
    }
  },

  async updateAccount(
    userId: string,
    patch: { name?: string; email?: string },
  ): Promise<User> {
    // Email change is out of scope this module (see AccountForm); the email
    // field is disabled, so only the name is persisted.
    const update: { updatedAt: unknown; name?: string } = {
      updatedAt: serverTimestamp(),
    };
    if (patch.name !== undefined) update.name = patch.name;
    await updateDoc(doc(db, "users", userId), update);
    return readUser(userId);
  },

  async updateLegal(userId: string, legal: LegalInfo): Promise<User> {
    await updateDoc(doc(db, "users", userId), {
      legal,
      updatedAt: serverTimestamp(),
    });
    return readUser(userId);
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await callAdminDeleteUser({ uid: userId });
    } catch (err) {
      throw new Error(errorMessage(err, "Could not delete user."));
    }
  },
};
