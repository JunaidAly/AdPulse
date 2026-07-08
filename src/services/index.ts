// All services are real Firebase implementations as of Module 8.
// Mock implementations remain in services/mock/ for reference and local dev
// without Firebase — they are no longer imported by the app.
import type { Services } from "./api";
import { firebaseAuth } from "./firebase/firebaseAuth";
import { firebaseSites } from "./firebase/firebaseSites";
import { firebaseUsers } from "./firebase/firebaseUsers";
import { firebasePayouts } from "./firebase/firebasePayouts";
import { firebaseReports } from "./firebase/firebaseReports";

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
