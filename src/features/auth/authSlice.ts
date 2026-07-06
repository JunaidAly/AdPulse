import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { services, type User } from "@/services";
import type { LegalInfo, PayoutDetails } from "@/services/api";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
  /** False until the first Firebase session restore resolves. Route guards
   *  must wait for this to avoid flashing the login page for a logged-in
   *  user (or spinning forever for a logged-out one). */
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  initialized: false,
};

export const login = createAsyncThunk("auth/login", (creds: { email: string; password: string }) =>
  services.auth.login(creds.email, creds.password),
);

export const register = createAsyncThunk(
  "auth/register",
  (data: { name: string; email: string; password: string }) =>
    services.auth.register(data.name, data.email, data.password),
);

export const loginWithGoogle = createAsyncThunk("auth/loginWithGoogle", () => {
  if (!services.auth.loginWithGoogle) {
    throw new Error("Google sign-in is not available.");
  }
  return services.auth.loginWithGoogle();
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await services.auth.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Applied by the app-level Firebase session subscription on every auth
     * change (restore on load, cross-tab login/logout, token refresh).
     * Marks auth as initialized so route guards can stop waiting.
     */
    sessionResolved(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "idle";
      state.initialized = true;
    },
    /** Keep the session user in sync when profile/payout details change. */
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setLegal(state, action: PayloadAction<LegalInfo>) {
      if (state.user) state.user.legal = action.payload;
    },
    setPayout(state, action: PayloadAction<PayoutDetails>) {
      if (state.user) state.user.payout = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Registration failed";
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Google sign-in failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      });
  },
});

export const { sessionResolved, setUser, setLegal, setPayout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
