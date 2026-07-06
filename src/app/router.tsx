import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/app/hooks";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/features/landing/LandingPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { SitesPage } from "@/features/sites/SitesPage";
import { PaymentsPage } from "@/features/payments/PaymentsPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { AdminOverviewPage } from "@/features/admin/AdminOverviewPage";
import { AdminUsersPage } from "@/features/admin/AdminUsersPage";
import { AdminSitesPage } from "@/features/admin/AdminSitesPage";
import { AdminPayoutsPage } from "@/features/admin/AdminPayoutsPage";

/** Full-screen loader shown while the Firebase session is being restored. */
function SessionLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

/** Requires an authenticated session. Waits for session restore first. */
function ProtectedRoute() {
  const initialized = useAppSelector((s) => s.auth.initialized);
  const { isAuthenticated } = useAuth();
  if (!initialized) return <SessionLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Requires the admin role; publishers are bounced to the dashboard. */
function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Sends already-authenticated users away from auth screens. */
function PublicOnlyRoute() {
  const initialized = useAppSelector((s) => s.auth.initialized);
  const { isAuthenticated } = useAuth();
  if (!initialized) return <SessionLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/sites", element: <SitesPage /> },
          { path: "/payments", element: <PaymentsPage /> },
          { path: "/profile", element: <ProfilePage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: "/admin/overview", element: <AdminOverviewPage /> },
              { path: "/admin/users", element: <AdminUsersPage /> },
              { path: "/admin/sites", element: <AdminSitesPage /> },
              { path: "/admin/payouts", element: <AdminPayoutsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
