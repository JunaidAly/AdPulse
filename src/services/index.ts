/**
 * Active service implementation. Today this is the in-memory mock backend.
 *
 * To move to Firebase later: create `services/firebase/*` implementing the same
 * interfaces from `api.ts`, then swap the imports below. Nothing in the Redux
 * slices or React components imports the mock directly — they only use `services`.
 */
import type { Services } from "./api";
import { firebaseAuth } from "./firebase/firebaseAuth";
import { mockReports } from "./mock/mockReports";
import { mockSites } from "./mock/mockSites";
import { mockPayouts } from "./mock/mockPayouts";
import { mockUsers } from "./mock/mockUsers";

// Module 3: auth is now Firebase-backed. Everything else stays on mocks and
// keeps working for a Firebase-authenticated user via the current-user shim
// in `mock/db.ts` (resolveUserId). Reports/sites/payouts/users move to real
// data in Modules 5–7.
export const services: Services = {
  auth: firebaseAuth,
  reports: mockReports,
  sites: mockSites,
  payouts: mockPayouts,
  users: mockUsers,
};

// Session-change subscription (login/logout/refresh/restore). Re-exported
// here so the app consumes it via `@/services` and stays firebase-ignorant.
export { subscribeToSession } from "./firebase/firebaseAuth";

export * from "./api";
