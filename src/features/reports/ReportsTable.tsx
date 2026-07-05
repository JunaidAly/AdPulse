import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReportRow, ReportTotals } from "@/services/api";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SortKey = "date" | "siteDomain" | "impressions" | "clicks" | "ctr" | "ecpmCents" | "revenueCents";
export type SortDir = "asc" | "desc";

interface Column {
  key: SortKey;
  label: string;
  numeric?: boolean;
  render: (r: ReportRow) => string;
}

const COLUMNS: Column[] = [
  { key: "date", label: "Date", render: (r) => (r.date ? format(parseISO(r.date), "MMM d, yyyy") : "—") },
  { key: "siteDomain", label: "Site", render: (r) => r.siteDomain ?? "—" },
  { key: "impressions", label: "Impressions", numeric: true, render: (r) => formatNumber(r.impressions) },
  { key: "clicks", label: "Clicks", numeric: true, render: (r) => formatNumber(r.clicks) },
  { key: "ctr", label: "CTR", numeric: true, render: (r) => formatPercent(r.ctr, 2) },
  { key: "ecpmCents", label: "eCPM", numeric: true, render: (r) => formatCurrency(r.ecpmCents) },
  { key: "revenueCents", label: "Revenue", numeric: true, render: (r) => formatCurrency(r.revenueCents) },
];

interface ReportsTableProps {
  rows: ReportRow[];
  totals: ReportTotals;
  groupBy: "date" | "site";
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

export function ReportsTable({ rows, totals, groupBy, sortKey, sortDir, onSort }: ReportsTableProps) {
  const cols = COLUMNS.filter((c) => (groupBy === "date" ? c.key !== "siteDomain" : c.key !== "date"));

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
          <TableCell>Totals</TableCell>
          <TableCell className="text-right tabular-nums">{formatNumber(totals.impressions)}</TableCell>
          <TableCell className="text-right tabular-nums">{formatNumber(totals.clicks)}</TableCell>
          <TableCell className="text-right tabular-nums">{formatPercent(totals.ctr, 2)}</TableCell>
          <TableCell className="text-right tabular-nums">{formatCurrency(totals.ecpmCents)}</TableCell>
          <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(totals.revenueCents)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
