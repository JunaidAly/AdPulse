import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { services, type User } from "@/services";
import type { LegalInfo, PayoutDetails } from "@/services/api";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk("auth/login", (creds: { email: string; password: string }) =>
  services.auth.login(creds.email, creds.password),
);

export const register = createAsyncThunk(
  "auth/register",
  (data: { name: string; email: string; password: string }) =>
    services.auth.register(data.name, data.email, data.password),
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await services.auth.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      });
  },
});

export const { setUser, setLegal, setPayout, clearError } = authSlice.actions;
export default authSlice.reducer;
