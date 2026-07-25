import { useEffect, useMemo, useState } from "react";
import { Download, Globe, Layers } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ReportsTable, type SortDir, type SortKey } from "./ReportsTable";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchReport } from "./reportsSlice";
import { fetchAllSites, fetchMySites } from "@/features/sites/sitesSlice";
import { useAuth } from "@/hooks/useAuth";
import { useDateRange } from "@/hooks/useDateRange";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { ReportGroupKey, ReportRow } from "@/services/api";

const PAGE_SIZE = 25;

const GROUP_BY_LABELS: Record<ReportGroupKey, string> = {
  date: "Date",
  site: "Site",
  country: "Country",
  adUnit: "Ad unit",
};
const GROUP_BY_ORDER: ReportGroupKey[] = ["date", "site", "country", "adUnit"];

export function ReportsPage() {
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAuth();
  const { preset, setPreset, range, label, setCustom } = useDateRange("30d");
  const { report, reportStatus } = useAppSelector((s) => s.reports);
  const sites = useAppSelector((s) => s.sites.items);

  const [groupBy, setGroupBy] = useState<ReportGroupKey[]>(["date"]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    if (isAdmin) dispatch(fetchAllSites());
    else dispatch(fetchMySites(user.id));
  }, [dispatch, user, isAdmin]);

  useEffect(() => {
    if (!user) return;
    dispatch(
      fetchReport({
        userId: user.id,
        role: user.role,
        from: range.from,
        to: range.to,
        siteIds: selectedSites,
        groupBy,
      }),
    );
    setPage(1);
  }, [dispatch, user, range.from, range.to, selectedSites, groupBy]);

  useEffect(() => {
    setSortKey(groupBy.includes("date") ? "date" : "revenueCents");
  }, [groupBy]);

  const rows = report?.rows ?? [];

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stringSortKeys: SortKey[] = ["date", "siteDomain", "country", "adUnit"];
  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(stringSortKeys.includes(key) ? "asc" : "desc");
    }
  };

  const hasEngagement = !groupBy.includes("country") && !groupBy.includes("adUnit");

  const exportCsv = () => {
    const dimHeaders = groupBy.map((k) => GROUP_BY_LABELS[k]);
    const headers = [
      ...dimHeaders,
      "Impressions",
      ...(hasEngagement ? ["Clicks", "CTR"] : []),
      "eCPM",
      "Revenue",
    ];
    const dimValue = (r: ReportRow, k: ReportGroupKey) =>
      k === "date" ? r.date : k === "site" ? r.siteDomain : k === "country" ? r.country : r.adUnit;
    const line = (r: ReportRow) =>
      [
        ...groupBy.map((k) => dimValue(r, k) ?? ""),
        r.impressions,
        ...(hasEngagement ? [r.clicks ?? 0, formatPercent(r.ctr ?? 0, 2)] : []),
        formatCurrency(r.ecpmCents),
        formatCurrency(r.revenueCents),
      ].join(",");
    const csv = [headers.join(","), ...sorted.map(line)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adpulse-report-${range.from}_to_${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const toggleSite = (id: string) =>
    setSelectedSites((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const toggleGroupBy = (key: ReportGroupKey) =>
    setGroupBy((prev) => {
      if (prev.includes(key)) {
        // Always keep at least one dimension selected.
        return prev.length === 1 ? prev : prev.filter((k) => k !== key);
      }
      return GROUP_BY_ORDER.filter((k) => prev.includes(k) || k === key);
    });

  const loading = reportStatus !== "ready" || !report;

  return (
    <>
      <PageHeader
        title="Reports"
        description="Break down performance by date, site, country, or ad unit, then export."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!sorted.length} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <DateRangePicker preset={preset} label={label} range={range} onPreset={setPreset} onCustom={setCustom} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Globe className="h-4 w-4" />
                {selectedSites.length ? `${selectedSites.length} site(s)` : "All sites"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter sites</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sites.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s.id}
                  checked={selectedSites.includes(s.id)}
                  onCheckedChange={() => toggleSite(s.id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {s.domain}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Layers className="h-4 w-4" />
                Group by {groupBy.map((k) => GROUP_BY_LABELS[k]).join(" + ")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Group by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {GROUP_BY_ORDER.map((k) => (
                <DropdownMenuCheckboxItem
                  key={k}
                  checked={groupBy.includes(k)}
                  onCheckedChange={() => toggleGroupBy(k)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {GROUP_BY_LABELS[k]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="ml-auto text-sm text-muted-foreground">
            {format(parseISO(range.from), "MMM d")} – {format(parseISO(range.to), "MMM d, yyyy")}
          </span>
        </CardContent>
      </Card>

      {loading ? (
        <TableSkeleton rows={10} cols={6} />
      ) : sorted.length === 0 ? (
        <Card>
          <EmptyState title="No data for these filters" description="Try a wider date range or clear site filters." />
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ReportsTable
              rows={paged}
              totals={report!.totals}
              groupBy={groupBy}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                {sorted.length} rows · page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
