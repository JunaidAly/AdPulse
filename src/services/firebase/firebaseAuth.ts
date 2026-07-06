/**
 * Firebase-backed AuthService (Module 3).
 *
 * Replaces the mock auth. Role is read from Firebase custom claims (the
 * authorization source of truth); the rest of the profile comes from the
 * `getMyProfile` callable — client Firestore is locked down until Module 4,
 * so we never read the user doc directly from the browser.
 *
 * This is the ONLY place (with ./config) allowed to import the firebase SDK.
 */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getIdTokenResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import type {
  AuthService,
  LegalInfo,
  PayoutDetails,
  User,
} from "@/services/api";
import { ROLES, USER_STATUS, type Role, type UserStatus } from "@/lib/constants";
import { auth, functions } from "./config";

const DEFAULT_REVENUE_SHARE = 0.8;
const CLAIM_RETRY_MS = 1500;

/** Shape returned by the backend `getMyProfile` callable. */
interface ProfileResponse {
  uid: string;
  email: string | null;
  name: string;
  role: string;
  status: string;
  revenueShare: number;
  createdAt: string; // ISO
  legal: LegalInfo | null;
  payout: PayoutDetails | null;
}

const callGetMyProfile = httpsCallable<Record<string, never>, ProfileResponse>(
  functions,
  "getMyProfile",
);

/** Friendly, user-facing messages for raw Firebase `auth/*` error codes. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/email-already-in-use": "That email is already registered.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/popup-blocked": "Popup blocked by the browser. Allow popups and retry.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

function friendlyAuthError(err: unknown): Error {
  const code = (err as { code?: string })?.code;
  const message =
    (code && AUTH_ERROR_MESSAGES[code]) ||
    "Something went wrong. Please try again.";
  return new Error(message);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Read the role from custom claims. Force-refresh is REQUIRED right after
 * registration/first Google sign-in because onUserCreate sets the claim
 * server-side after the token was issued. If it's still missing (trigger
 * latency), retry once, then default to publisher (what the trigger sets).
 */
async function resolveRole(user: FirebaseUser): Promise<Role> {
  const read = async () => {
    const res = await getIdTokenResult(user, true);
    return res.claims.role as string | undefined;
  };

  let role = await read();
  if (!role) {
    await sleep(CLAIM_RETRY_MS);
    role = await read();
  }
  return role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.PUBLISHER;
}

async function fetchProfile(): Promise<ProfileResponse | null> {
  try {
    const res = await callGetMyProfile({});
    return res.data;
  } catch {
    // Best-effort: fall back to defaults so a session is still usable.
    return null;
  }
}

// Backend allows status "pending"; the frontend User type only knows
// active/suspended. Pending is treated as usable (active) for now.
function mapStatus(status?: string | null): UserStatus {
  return status === USER_STATUS.SUSPENDED
    ? USER_STATUS.SUSPENDED
    : USER_STATUS.ACTIVE;
}

function buildUser(
  user: FirebaseUser,
  role: Role,
  profile: ProfileResponse | null,
): User {
  const emailPrefix = user.email ? user.email.split("@")[0] : "Publisher";
  return {
    id: user.uid,
    name: profile?.name || user.displayName || emailPrefix,
    email: user.email ?? profile?.email ?? "",
    role,
    revenueShare:
      typeof profile?.revenueShare === "number"
        ? profile.revenueShare
        : DEFAULT_REVENUE_SHARE,
    status: mapStatus(profile?.status),
    joinedAt: profile?.createdAt || new Date().toISOString(),
    legal: profile?.legal ?? undefined,
    payout: profile?.payout ?? undefined,
  };
}

/** Firebase user -> app User (claims role + profile doc). */
async function resolveAppUser(user: FirebaseUser): Promise<User> {
  // Sequential: resolveRole's retry also gives the trigger time to write
  // the profile doc before we read it.
  const role = await resolveRole(user);
  const profile = await fetchProfile();
  return buildUser(user, role, profile);
}

export const firebaseAuth: AuthService = {
  async login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return await resolveAppUser(cred.user);
    } catch (err) {
      throw friendlyAuthError(err);
    }
  },

  async register(name, email, password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name.trim() });
      return await resolveAppUser(cred.user);
    } catch (err) {
      throw friendlyAuthError(err);
    }
  },

  async loginWithGoogle() {
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      return await resolveAppUser(cred.user);
    } catch (err) {
      throw friendlyAuthError(err);
    }
  },

  async logout() {
    await signOut(auth);
  },

  async requestPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw friendlyAuthError(err);
    }
  },
};

/**
 * Subscribe to Firebase session changes (login, logout, refresh, and — on
 * page load — restoration of a persisted session). Resolves the full app
 * User (role claim + profile) before invoking the callback. Returns an
 * unsubscribe function. Lives here so the app stays firebase-ignorant; the
 * app consumes it via `@/services`.
 */
export function subscribeToSession(
  onSession: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      onSession(null);
      return;
    }
    try {
      onSession(await resolveAppUser(fbUser));
    } catch {
      onSession(null);
    }
  });
}
