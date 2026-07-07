/**
 * PayoutsService (Module 5) — hybrid.
 *
 * Listing, balance, and processing stay MOCK (real in Module 8). Only
 * savePayoutDetails is real: it writes payoutMethod to the user's own
 * Firestore doc (a rules-whitelisted field), so the payout method the
 * publisher sets on the Payments page persists to the real profile.
 */
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import type { PayoutDetails, PayoutsService, User } from "@/services/api";
import { mockPayouts } from "../mock/mockPayouts";
import { db } from "./config";
import { errorMessage, toUser, type RawUser } from "./mappers";

export const firebasePayouts: PayoutsService = {
  ...mockPayouts,

  async savePayoutDetails(
    userId: string,
    details: PayoutDetails,
  ): Promise<User> {
    const payoutMethod: Record<string, string> = { type: details.method };
    if (details.walletAddress) payoutMethod.walletAddress = details.walletAddress;
    if (details.bankName) payoutMethod.bankName = details.bankName;
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
