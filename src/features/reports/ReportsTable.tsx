import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReportGroupKey, ReportRow, ReportTotals } from "@/services/api";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SortKey =
  | "date"
  | "siteDomain"
  | "country"
  | "adUnit"
  | "impressions"
  | "clicks"
  | "ctr"
  | "ecpmCents"
  | "revenueCents";
export type SortDir = "asc" | "desc";

interface Column {
  key: SortKey;
  label: string;
  numeric?: boolean;
  render: (r: ReportRow) => string;
}

const DIMENSION_COLUMNS: Record<ReportGroupKey, Column> = {
  date: { key: "date", label: "Date", render: (r) => (r.date ? format(parseISO(r.date), "MMM d, yyyy") : "—") },
  site: { key: "siteDomain", label: "Site", render: (r) => r.siteDomain ?? "—" },
  country: {
    key: "country",
    label: "Country",
    render: (r) => (r.country ? `${r.country}${r.countryCode ? ` (${r.countryCode})` : ""}` : "—"),
  },
  adUnit: { key: "adUnit", label: "Ad unit", render: (r) => r.adUnit ?? "—" },
};

interface ReportsTableProps {
  rows: ReportRow[];
  totals: ReportTotals;
  groupBy: ReportGroupKey[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

export function ReportsTable({ rows, totals, groupBy, sortKey, sortDir, onSort }: ReportsTableProps) {
  // GAM can't attribute clicks/CTR to country or ad unit, so those columns
  // only make sense when grouping purely by date/site.
  const hasEngagement = !groupBy.includes("country") && !groupBy.includes("adUnit");

  const dimCols = groupBy.map((k) => DIMENSION_COLUMNS[k]);
  const metricCols: Column[] = [
    { key: "impressions", label: "Impressions", numeric: true, render: (r) => formatNumber(r.impressions) },
    ...(hasEngagement
      ? [
          { key: "clicks" as const, label: "Clicks", numeric: true, render: (r: ReportRow) => formatNumber(r.clicks ?? 0) },
          { key: "ctr" as const, label: "CTR", numeric: true, render: (r: ReportRow) => formatPercent(r.ctr ?? 0, 2) },
        ]
      : []),
    { key: "ecpmCents", label: "eCPM", numeric: true, render: (r) => formatCurrency(r.ecpmCents) },
    { key: "revenueCents", label: "Revenue", numeric: true, render: (r) => formatCurrency(r.revenueCents) },
  ];
  const cols = [...dimCols, ...metricCols];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {cols.map((c) => (
            <TableHead key={c.key} className={cn(c.numeric && "text-right")}>
              <button
                onClick={() => onSort(c.key)}
                className={cn("inline-flex items-center gap-1 hover:text-foreground", c.numeric && "flex-row-reverse")}
              >
                {c.label}
                {sortKey === c.key ? (
                  sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                ) : (
                  <ChevronsUpDown className="h-3 w-3 opacity-40" />
                )}
              </button>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.key}>
            {cols.map((c) => (
              <TableCell key={c.key} className={cn(c.numeric && "text-right tabular-nums", c.key === "revenueCents" && "font-medium")}>
                {c.render(r)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={dimCols.length}>Totals</TableCell>
          <TableCell className="text-right tabular-nums">{formatNumber(totals.impressions)}</TableCell>
          {hasEngagement && (
            <>
              <TableCell className="text-right tabular-nums">{formatNumber(totals.clicks ?? 0)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPercent(totals.ctr ?? 0, 2)}</TableCell>
            </>
          )}
          <TableCell className="text-right tabular-nums">{formatCurrency(totals.ecpmCents)}</TableCell>
          <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(totals.revenueCents)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
