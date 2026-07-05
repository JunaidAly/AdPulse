import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, DollarSign, Eye, Target, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueAreaChart } from "@/components/charts/RevenueAreaChart";
import { StatCardsSkeleton, ChartSkeleton, TableSkeleton } from "@/components/common/LoadingSkeleton";
import { DeviceMix, SiteBreakdownTable, SummaryCard, TopCountries } from "./DashboardPanels";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchDashboard } from "@/features/reports/reportsSlice";
import { useAuth } from "@/hooks/useAuth";
import { useDateRange } from "@/hooks/useDateRange";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { preset, setPreset, range, label, setCustom } = useDateRange("7d");
  const { dashboard, dashboardStatus } = useAppSelector((s) => s.reports);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchDashboard({ userId: user.id, role: user.role, from: range.from, to: range.to }));
  }, [dispatch, user, range.from, range.to]);

  const loading = dashboardStatus !== "ready" || !dashboard;
  const s = dashboard?.summary;

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="Dashboard"
            description={`Performance, inventory, and demand signals for ${user?.email ?? ""}.`}
          />
          <Button onClick={() => navigate("/reports")} className="gap-2">
            <BarChart3 className="h-4 w-4" /> Reports
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <DateRangePicker
          preset={preset}
          label={label}
          range={range}
          onPreset={setPreset}
          onCustom={setCustom}
        />
        {isAdmin && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Network totals (100%)
          </span>
        )}
      </div>

      {loading || !s ? (
        <>
          <StatCardsSkeleton />
          <ChartSkeleton />
          <TableSkeleton />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatCurrency(s.revenueCents.value)} delta={s.revenueCents.delta} icon={DollarSign} accent="green" />
            <StatCard label="Impressions" value={formatCompact(s.impressions.value)} delta={s.impressions.delta} icon={Eye} accent="blue" />
            <StatCard label="eCPM" value={formatCurrency(s.ecpmCents.value)} delta={s.ecpmCents.delta} icon={TrendingUp} accent="violet" />
            <StatCard label="Viewability" value={formatPercent(s.viewability.value)} delta={s.viewability.delta} icon={Target} accent="amber" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Performance trend
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Revenue and impressions for the selected period.
              </p>
            </CardHeader>
            <CardContent>
              <RevenueAreaChart data={dashboard.timeseries} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory performance</CardTitle>
              <p className="text-sm text-muted-foreground">Top revenue sources for this period.</p>
            </CardHeader>
            <CardContent>
              <SiteBreakdownTable rows={dashboard.siteBreakdown} />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <DeviceMix data={dashboard.deviceMix} />
            <TopCountries data={dashboard.topCountries} />
            <SummaryCard clicks={s.clicks} ctr={s.ctr.value} matchRate={s.matchRate} activeSites={s.activeSites} />
          </div>
        </>
      )}
    </>
  );
}
