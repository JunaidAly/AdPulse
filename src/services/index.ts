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
import { firebaseReports } from "./firebase/firebaseReports";

// Module 7: auth, sites, users, and reports are Firebase-backed. Reports go
// through the getReports callable, which applies the revenue-share
// multiplier server-side (publishers see adjusted data, admins see raw).
// Payouts is still a hybrid (payout METHOD real; listing/balance/processing
// mock until Module 8).
export const services: Services = {
  auth: firebaseAuth,
  reports: firebaseReports,
  sites: firebaseSites,
  payouts: firebasePayouts,
  users: firebaseUsers,
};

// Session-change subscription (login/logout/refresh/restore). Re-exported
// here so the app consumes it via `@/services` and stays firebase-ignorant.
export { subscribeToSession } from "./firebase/firebaseAuth";

export * from "./api";
