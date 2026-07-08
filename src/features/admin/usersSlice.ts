import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { services, type User } from "@/services";
import type { UserStatus } from "@/lib/constants";

interface UsersState {
  items: User[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchAll", () => services.users.list());

export const updateRevenueShare = createAsyncThunk(
  "users/updateShare",
  (args: { userId: string; share: number }) =>
    services.users.updateRevenueShare(args.userId, args.share),
);

export const updateUserStatus = createAsyncThunk(
  "users/updateStatus",
  (args: { userId: string; status: UserStatus }) =>
    services.users.updateStatus(args.userId, args.status),
);

export const deleteUser = createAsyncThunk("users/delete", async (userId: string) => {
  await services.users.deleteUser(userId);
  return userId;
});

function replace(items: User[], user: User): User[] {
  return items.map((u) => (u.id === user.id ? user : u));
}

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "ready";
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Failed to load users";
      })
      .addCase(updateRevenueShare.fulfilled, (state, action) => {
        state.items = replace(state.items, action.payload);
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.items = replace(state.items, action.payload);
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
