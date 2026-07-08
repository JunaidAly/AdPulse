/// <reference types="vite/client" />

// Type declarations for the Firebase-related Vite env vars so
// `import.meta.env.VITE_FIREBASE_*` is strongly typed. These merge with
// Vite's built-in ImportMetaEnv (MODE/DEV/PROD/…).
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** "true" routes dev traffic to the local Firebase emulators. */
  readonly VITE_USE_EMULATORS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
