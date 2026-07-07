/**
 * Active service implementation. Today this is the in-memory mock backend.
 *
 * To move to Firebase later: create `services/firebase/*` implementing the same
 * interfaces from `api.ts`, then swap the imports below. Nothing in the Redux
 * slices or React components imports the mock directly — they only use `services`.
 */
import type { Services } from "./api";
import { firebaseAuth } from "./firebase/firebaseAuth";
import { firebaseSites } from "./firebase/firebaseSites";
import { firebaseUsers } from "./firebase/firebaseUsers";
import { firebasePayouts } from "./firebase/firebasePayouts";
import { mockReports } from "./mock/mockReports";

// Module 5: auth, sites, and users are Firebase-backed. Payouts is a hybrid
// (payout METHOD is real on the user doc; listing/balance/processing stay
// mock until Module 8). Reports stays mock until Module 7 — it keys its
// deterministic metrics off REAL site ids via the realSiteRegistry so the
// dashboard/reports pages still render for a real publisher.
export const services: Services = {
  auth: firebaseAuth,
  reports: mockReports,
  sites: firebaseSites,
  payouts: firebasePayouts,
  users: firebaseUsers,
};

// Session-change subscription (login/logout/refresh/restore). Re-exported
// here so the app consumes it via `@/services` and stays firebase-ignorant.
export { subscribeToSession } from "./firebase/firebaseAuth";

export * from "./api";
