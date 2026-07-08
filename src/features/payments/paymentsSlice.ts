import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { services, type Payout, type PayoutDetails } from "@/services";

interface PaymentsState {
  payouts: Payout[];
  balanceCents: number;
  totalPaidCents: number;
  pendingCents: number;
  status: "idle" | "loading" | "ready" | "error";
  saving: boolean;
  requesting: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payouts: [],
  balanceCents: 0,
  totalPaidCents: 0,
  pendingCents: 0,
  status: "idle",
  saving: false,
  requesting: false,
  error: null,
};

// userId kept for call-site compatibility; the callable uses the auth uid.
export const fetchMyPayouts = createAsyncThunk("payments/fetchMine", () =>
  services.payouts.getPayoutHistory!(),
);

export const fetchAllPayouts = createAsyncThunk("payments/fetchAll", async () =>
  (await services.payouts.getPayoutHistory!()).payouts,
);

export const requestPayout = createAsyncThunk(
  "payments/request",
  (args: { periodStart: string; periodEnd: string }) =>
    services.payouts.requestPayout!(args.periodStart, args.periodEnd),
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
      .addCase(requestPayout.pending, (state) => {
        state.requesting = true;
        state.error = null;
      })
      .addCase(requestPayout.fulfilled, (state) => {
        state.requesting = false;
      })
      .addCase(requestPayout.rejected, (state, action) => {
        state.requesting = false;
        state.error = action.error.message ?? "Payout request failed";
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
