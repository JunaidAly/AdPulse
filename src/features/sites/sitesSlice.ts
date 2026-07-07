import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { services, type Site } from "@/services";

interface SitesState {
  items: Site[];
  status: "idle" | "loading" | "ready" | "error";
  mutating: boolean;
  error: string | null;
}

const initialState: SitesState = {
  items: [],
  status: "idle",
  mutating: false,
  error: null,
};

export const fetchMySites = createAsyncThunk("sites/fetchMine", (userId: string) =>
  services.sites.listByUser(userId),
);

export const fetchAllSites = createAsyncThunk("sites/fetchAll", () => services.sites.listAll());

export const addSite = createAsyncThunk("sites/add", (args: { userId: string; domain: string }) =>
  services.sites.addSite(args.userId, args.domain),
);

export const approveSite = createAsyncThunk(
  "sites/approve",
  (args: { siteId: string; gamMappingName: string; revenueShare?: number }) =>
    services.sites.approveSite(
      args.siteId,
      args.gamMappingName,
      args.revenueShare,
    ),
);

export const rejectSite = createAsyncThunk("sites/reject", (siteId: string) =>
  services.sites.rejectSite(siteId),
);

function upsert(items: Site[], site: Site): Site[] {
  const idx = items.findIndex((s) => s.id === site.id);
  if (idx === -1) return [...items, site];
  const next = [...items];
  next[idx] = site;
  return next;
}

const sitesSlice = createSlice({
  name: "sites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySites.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMySites.fulfilled, (state, action) => {
        state.status = "ready";
        state.items = action.payload;
      })
      .addCase(fetchAllSites.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllSites.fulfilled, (state, action) => {
        state.status = "ready";
        state.items = action.payload;
      })
      .addCase(addSite.pending, (state) => {
        state.mutating = true;
      })
      .addCase(addSite.fulfilled, (state, action) => {
        state.mutating = false;
        state.items = upsert(state.items, action.payload);
      })
      .addCase(addSite.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.error.message ?? "Failed to add site";
      })
      .addCase(approveSite.fulfilled, (state, action) => {
        state.items = upsert(state.items, action.payload);
      })
      .addCase(rejectSite.fulfilled, (state, action) => {
        state.items = upsert(state.items, action.payload);
      });
  },
});

export default sitesSlice.reducer;
