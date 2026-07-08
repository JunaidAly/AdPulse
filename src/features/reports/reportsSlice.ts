import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  services,
  type DashboardData,
  type DashboardQuery,
  type ReportQuery,
  type ReportRow,
  type ReportTotals,
} from "@/services";

interface ReportsState {
  dashboard: DashboardData | null;
  dashboardStatus: "idle" | "loading" | "ready" | "error";
  report: { rows: ReportRow[]; totals: ReportTotals } | null;
  reportStatus: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

const initialState: ReportsState = {
  dashboard: null,
  dashboardStatus: "idle",
  report: null,
  reportStatus: "idle",
  error: null,
};

export const fetchDashboard = createAsyncThunk("reports/fetchDashboard", (query: DashboardQuery) =>
  services.reports.getDashboard(query),
);

export const fetchReport = createAsyncThunk("reports/fetchReport", (query: ReportQuery) =>
  services.reports.getReport(query),
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        // Only show the loading skeleton on the very first fetch. Later
        // dispatches (date-range change, background poll) already have
        // data on screen — swap it in on fulfilled instead of flashing.
        if (state.dashboardStatus !== "ready") {
          state.dashboardStatus = "loading";
        }
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardStatus = "ready";
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboardStatus = "error";
        state.error = action.error.message ?? "Failed to load dashboard";
      })
      .addCase(fetchReport.pending, (state) => {
        state.reportStatus = "loading";
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.reportStatus = "ready";
        state.report = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.reportStatus = "error";
        state.error = action.error.message ?? "Failed to load report";
      });
  },
});

export default reportsSlice.reducer;
