/**
 * Firebase client SDK initialization for AdPulse.
 *
 * Initializes the Firebase app, Auth, Firestore, and Functions (pinned to
 * region asia-south1). By default the app talks to PRODUCTION — including
 * `npm run dev`. Set `VITE_USE_EMULATORS=true` in `.env` (and run the
 * emulators) to route local dev traffic to the Firebase emulators instead.
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

// Opt-in: route SDK traffic to the local emulators (dev only). Without
// VITE_USE_EMULATORS=true, dev and prod both use the live backend.
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
