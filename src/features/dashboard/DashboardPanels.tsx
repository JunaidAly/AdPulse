import { Smartphone, Monitor, Tv, Tablet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CountrySlice, DeviceSlice, ReportRow } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";

const DEVICE_ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Desktop: Monitor,
  "Connected TV": Tv,
  Tablet,
};

export function DeviceMix({ data }: { data: DeviceSlice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Device mix</CardTitle>
      </CardHeader>
      <CardContent className="h-52 space-y-3 overflow-y-auto scrollbar-hide">
        {data.map((d) => {
          const Icon = DEVICE_ICONS[d.device] ?? Smartphone;
          return (
            <div key={d.device} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" /> {d.device}
                </span>
                <span className="font-medium">{formatPercent(d.share)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${d.share * 100}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function TopCountries({ data }: { data: CountrySlice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top countries</CardTitle>
      </CardHeader>
      <CardContent className="h-48 space-y-3 overflow-y-auto scrollbar-hide">
        {data.map((c) => (
          <div key={c.code} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {c.code}
              </span>
              {c.name}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-medium">{formatCurrency(c.revenueCents)}</span>
              <span className="text-xs text-muted-foreground">{formatPercent(c.share)}</span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SummaryCard({
  clicks,
  ctr,
  matchRate,
  activeSites,
}: {
  clicks: number;
  ctr: number;
  matchRate: number;
  activeSites: number;
}) {
  const rows = [
    ["Clicks", formatNumber(clicks)],
    ["CTR", formatPercent(ctr, 3)],
    ["Match rate", formatPercent(matchRate)],
    ["Active sites", String(activeSites)],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Summary</CardTitle>
      </CardHeader>
      <CardContent className="h-48 space-y-3 overflow-y-auto scrollbar-hide">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SiteBreakdownTable({ rows }: { rows: ReportRow[] }) {
  const totalRevenue = rows.reduce((s, r) => s + r.revenueCents, 0);
  if (!rows.length) {
    return <EmptyState title="No inventory data" description="No revenue recorded for this period yet." />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">eCPM</TableHead>
          <TableHead className="text-right">Impressions</TableHead>
          <TableHead className="w-40">Share</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const share = totalRevenue > 0 ? r.revenueCents / totalRevenue : 0;
          return (
            <TableRow key={r.key}>
              <TableCell className="font-medium">{r.siteDomain}</TableCell>
              <TableCell className="text-right">{formatCurrency(r.revenueCents)}</TableCell>
              <TableCell className="text-right">{formatCurrency(r.ecpmCents)}</TableCell>
              <TableCell className="text-right">{formatNumber(r.impressions)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${share * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {formatPercent(share, 0)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
