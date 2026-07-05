import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { services, type Payout, type PayoutDetails } from "@/services";

interface PaymentsState {
  payouts: Payout[];
  balanceCents: number;
  status: "idle" | "loading" | "ready" | "error";
  saving: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payouts: [],
  balanceCents: 0,
  status: "idle",
  saving: false,
  error: null,
};

export const fetchMyPayouts = createAsyncThunk("payments/fetchMine", async (userId: string) => {
  const [payouts, balanceCents] = await Promise.all([
    services.payouts.listByUser(userId),
    services.payouts.getBalanceCents(userId),
  ]);
  return { payouts, balanceCents };
});

export const fetchAllPayouts = createAsyncThunk("payments/fetchAll", () =>
  services.payouts.listAll(),
);

export const markPayoutPaid = createAsyncThunk("payments/markPaid", (payoutId: string) =>
  services.payouts.markPaid(payoutId),
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
      })
      .addCase(fetchAllPayouts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllPayouts.fulfilled, (state, action) => {
        state.status = "ready";
        state.payouts = action.payload;
      })
      .addCase(markPayoutPaid.fulfilled, (state, action) => {
        const idx = state.payouts.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.payouts[idx] = action.payload;
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
