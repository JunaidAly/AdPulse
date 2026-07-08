import { useEffect } from "react";
import { DollarSign, Eye, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueAreaChart } from "@/components/charts/RevenueAreaChart";
import { SiteBreakdownTable } from "@/features/dashboard/DashboardPanels";
import { StatCardsSkeleton, ChartSkeleton, TableSkeleton } from "@/components/common/LoadingSkeleton";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchDashboard } from "@/features/reports/reportsSlice";
import { fetchUsers } from "./usersSlice";
import { useAuth } from "@/hooks/useAuth";
import { useDateRange } from "@/hooks/useDateRange";
import { DASHBOARD_POLL_INTERVAL_MS } from "@/lib/constants";
import { formatCompact, formatCurrency } from "@/lib/format";

export function AdminOverviewPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { preset, setPreset, range, label, setCustom } = useDateRange("30d");
  const { dashboard, dashboardStatus } = useAppSelector((s) => s.reports);
  const users = useAppSelector((s) => s.users.items);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchDashboard({ userId: user.id, role: user.role, from: range.from, to: range.to }));
    dispatch(fetchUsers());

    const interval = setInterval(() => {
      dispatch(fetchDashboard({ userId: user.id, role: user.role, from: range.from, to: range.to }));
    }, DASHBOARD_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [dispatch, user, range.from, range.to]);

  const loading = dashboardStatus !== "ready" || !dashboard;
  const s = dashboard?.summary;
  const publishers = users.filter((u) => u.role === "publisher").length;

  return (
    <>
      <PageHeader
        title="Network overview"
        description="Network-wide performance across all publishers (raw 100% data)."
        actions={
          <DateRangePicker preset={preset} label={label} range={range} onPreset={setPreset} onCustom={setCustom} />
        }
      />

      {loading || !s ? (
        <>
          <StatCardsSkeleton />
          <ChartSkeleton />
          <TableSkeleton />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Network revenue" value={formatCurrency(s.revenueCents.value)} delta={s.revenueCents.delta} icon={DollarSign} accent="green" />
            <StatCard label="Impressions" value={formatCompact(s.impressions.value)} delta={s.impressions.delta} icon={Eye} accent="blue" />
            <StatCard label="eCPM" value={formatCurrency(s.ecpmCents.value)} delta={s.ecpmCents.delta} icon={TrendingUp} accent="violet" />
            <StatCard label="Publishers" value={String(publishers)} icon={Users} accent="amber" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network performance trend</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueAreaChart data={dashboard.timeseries} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top sites</CardTitle>
              <p className="text-sm text-muted-foreground">Highest revenue sources across the network.</p>
            </CardHeader>
            <CardContent>
              <SiteBreakdownTable rows={dashboard.siteBreakdown.slice(0, 5)} />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
