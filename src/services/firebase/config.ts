/**
 * Firebase client SDK initialization for AdPulse.
 *
 * MODULE 2 — CONFIG PLUMBING ONLY. This file initializes the Firebase
 * app, Auth, Firestore, and Functions (pinned to region asia-south1),
 * and connects to local emulators during development. It is intentionally
 * NOT wired into the app's service layer yet — the dashboard still runs
 * entirely on the mock services in `src/services/mock`. The real service
 * swap happens in a later module.
 *
 * All values come from Vite env vars (see `.env.example`). Only the
 * public Firebase web config lives here — no secrets.
 */
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// Functions MUST be pinned to asia-south1 to match the deployed region.
export const functions = getFunctions(app, "asia-south1");

// In local development, route all SDK traffic to the Firebase emulators.
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
