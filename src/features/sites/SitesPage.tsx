import { useEffect, useMemo } from "react";
import { format, parseISO, subDays } from "date-fns";
import { Globe } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SiteStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { AddSiteDialog } from "./AddSiteDialog";
import { AdsTxtCell } from "./AdsTxtCell";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchMySites } from "./sitesSlice";
import { fetchReport } from "@/features/reports/reportsSlice";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/format";

export function SitesPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { items: sites, status } = useAppSelector((s) => s.sites);
  const report = useAppSelector((s) => s.reports.report);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchMySites(user.id));
    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), 29), "yyyy-MM-dd");
    dispatch(fetchReport({ userId: user.id, role: user.role, from, to, groupBy: ["site"] }));
  }, [dispatch, user]);

  const revenueBySite = useMemo(() => {
    const map = new Map<string, number>();
    report?.rows.forEach((r) => r.siteId && map.set(r.siteId, r.revenueCents));
    return map;
  }, [report]);

  const loading = status !== "ready";
  const domains = sites.map((s) => s.domain);

  return (
    <>
      <PageHeader
        title="Sites"
        description="Add domains you monetize and follow their approval status."
        actions={<AddSiteDialog existingDomains={domains} />}
      />

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : sites.length === 0 ? (
        <Card>
          <EmptyState
            icon={Globe}
            title="No sites yet"
            description="Add your first domain to start monetizing your inventory."
            action={<AddSiteDialog existingDomains={domains} />}
          />
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ads.txt</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">30-day revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" /> {site.domain}
                      </span>
                    </TableCell>
                    <TableCell>
                      <SiteStatusBadge status={site.status} />
                    </TableCell>
                    <TableCell>
                      {site.status === "approved" ? (
                        <AdsTxtCell domain={site.domain} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(site.addedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(revenueBySite.get(site.id) ?? 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
