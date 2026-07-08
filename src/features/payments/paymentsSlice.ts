import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { services, type Payout, type PayoutDetails } from "@/services";

interface PaymentsState {
  payouts: Payout[];
  balanceCents: number;
  totalPaidCents: number;
  pendingCents: number;
  status: "idle" | "loading" | "ready" | "error";
  saving: boolean;
  logging: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payouts: [],
  balanceCents: 0,
  totalPaidCents: 0,
  pendingCents: 0,
  status: "idle",
  saving: false,
  logging: false,
  error: null,
};

// userId kept for call-site compatibility; the callable uses the auth uid.
export const fetchMyPayouts = createAsyncThunk("payments/fetchMine", () =>
  services.payouts.getPayoutHistory!(),
);

export const fetchAllPayouts = createAsyncThunk("payments/fetchAll", async () =>
  (await services.payouts.getPayoutHistory!()).payouts,
);

export const adminLogPayout = createAsyncThunk(
  "payments/adminLog",
  (args: { userId: string; periodStart: string; periodEnd: string; amountCents?: number }) =>
    services.payouts.adminLogPayout!(
      args.userId,
      args.periodStart,
      args.periodEnd,
      args.amountCents,
    ),
);

export const processPayout = createAsyncThunk(
  "payments/process",
  (args: { payoutId: string; action: "approve" | "reject" }) =>
    services.payouts.adminProcessPayout!(args.payoutId, args.action),
);

export const savePayoutDetails = createAsyncThunk(
  "payments/saveDetails",
  (args: { userId: string; details: PayoutDetails }) =>
    services.payouts.savePayoutDetails(args.userId, args.details),
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPayouts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyPayouts.fulfilled, (state, action) => {
        state.status = "ready";
        state.payouts = action.payload.payouts;
        state.balanceCents = action.payload.balanceCents;
        state.totalPaidCents = action.payload.totalPaidCents;
        state.pendingCents = action.payload.pendingCents;
      })
      .addCase(fetchMyPayouts.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Failed to load payouts";
      })
      .addCase(fetchAllPayouts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllPayouts.fulfilled, (state, action) => {
        state.status = "ready";
        state.payouts = action.payload;
      })
      .addCase(processPayout.fulfilled, (state, action) => {
        const p = state.payouts.find((x) => x.id === action.payload.payoutId);
        if (p) p.status = action.payload.newStatus;
      })
      .addCase(adminLogPayout.pending, (state) => {
        state.logging = true;
        state.error = null;
      })
      .addCase(adminLogPayout.fulfilled, (state) => {
        state.logging = false;
      })
      .addCase(adminLogPayout.rejected, (state, action) => {
        state.logging = false;
        state.error = action.error.message ?? "Could not log payout";
      })
      .addCase(savePayoutDetails.pending, (state) => {
        state.saving = true;
      })
      .addCase(savePayoutDetails.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(savePayoutDetails.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default paymentsSlice.reducer;
