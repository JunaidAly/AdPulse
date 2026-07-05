import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import reportsReducer from "@/features/reports/reportsSlice";
import sitesReducer from "@/features/sites/sitesSlice";
import paymentsReducer from "@/features/payments/paymentsSlice";
import usersReducer from "@/features/admin/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportsReducer,
    sites: sitesReducer,
    payments: paymentsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
