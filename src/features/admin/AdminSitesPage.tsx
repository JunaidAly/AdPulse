import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteStatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { ApproveSiteDialog } from "./ApproveSiteDialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAllSites, rejectSite } from "@/features/sites/sitesSlice";
import { SITE_STATUS, type SiteStatus } from "@/lib/constants";
import type { Site } from "@/services";

export function AdminSitesPage() {
  const dispatch = useAppDispatch();
  const { items: sites, status } = useAppSelector((s) => s.sites);
  const [filter, setFilter] = useState<SiteStatus | "all">("all");
  const [approving, setApproving] = useState<Site | null>(null);

  useEffect(() => {
    dispatch(fetchAllSites());
  }, [dispatch]);

  const visible = sites.filter((s) => filter === "all" || s.status === filter);
  const loading = status !== "ready";

  const handleReject = async (site: Site) => {
    await dispatch(rejectSite(site.id));
    toast.success(`${site.domain} rejected`);
  };

  return (
    <>
      <PageHeader
        title="Sites approval"
        description="Review and approve publisher domains across the network."
        actions={
          <Select value={filter} onValueChange={(v) => setFilter(v as SiteStatus | "all")}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={SITE_STATUS.PENDING}>Pending</SelectItem>
              <SelectItem value={SITE_STATUS.APPROVED}>Approved</SelectItem>
              <SelectItem value={SITE_STATUS.REJECTED}>Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.domain}</TableCell>
                    <TableCell className="text-muted-foreground">{site.ownerName}</TableCell>
                    <TableCell>
                      <SiteStatusBadge status={site.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(site.addedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {site.status === SITE_STATUS.PENDING ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => setApproving(site)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(site)}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {site.gamMappingName ?? "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ApproveSiteDialog site={approving} onClose={() => setApproving(null)} />
    </>
  );
}
