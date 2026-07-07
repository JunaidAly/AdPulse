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
import { httpsCallable } from "firebase/functions";
import type { LegalInfo, User, UsersService } from "@/services/api";
import type { UserStatus } from "@/lib/constants";
import { db, functions } from "./config";
import { errorMessage, toUser, type RawUser } from "./mappers";

const callAdminUpdateUser = httpsCallable<
  { uid: string; revenueShare?: number; status?: string },
  RawUser & { id: string }
>(functions, "adminUpdateUser");

async function readUser(userId: string): Promise<User> {
  const snap = await getDoc(doc(db, "users", userId));
  return toUser(userId, (snap.data() ?? {}) as RawUser);
}

// Deterministic per-uid value so the admin "raw → user sees" preview shows
// something stable. Real numbers arrive in Module 7.
function mockRawCents(uid: string): number {
  let h = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 200000 + (Math.abs(h) % 900000); // $2,000–$11,000 in cents
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
    // TODO Module 7: real revenue from reports_raw (share-adjusted preview).
    return mockRawCents(userId);
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
};
