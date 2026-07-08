import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteStatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { ApproveSiteDialog } from "./ApproveSiteDialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { deleteSite, fetchAllSites, rejectSite } from "@/features/sites/sitesSlice";
import { SITE_STATUS, type SiteStatus } from "@/lib/constants";
import type { Site } from "@/services";

export function AdminSitesPage() {
  const dispatch = useAppDispatch();
  const { items: sites, status } = useAppSelector((s) => s.sites);
  const [filter, setFilter] = useState<SiteStatus | "all">("all");
  const [approving, setApproving] = useState<Site | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllSites());
  }, [dispatch]);

  const visible = sites.filter((s) => filter === "all" || s.status === filter);
  const loading = status !== "ready";

  const handleReject = async (site: Site) => {
    await dispatch(rejectSite(site.id));
    toast.success(`${site.domain} rejected`);
  };

  const handleDelete = async (site: Site) => {
    setDeleting(site.id);
    const result = await dispatch(deleteSite(site.id));
    setDeleting(null);
    setConfirmingDelete(null);

    if (deleteSite.fulfilled.match(result)) {
      toast.success(`${site.domain} deleted`);
    } else {
      toast.error(result.error?.message ?? "Could not delete site");
    }
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
                      {confirmingDelete === site.id ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(null)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(site)}
                            disabled={deleting === site.id}
                          >
                            {deleting === site.id ? "Deleting…" : "Confirm delete"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {site.status === SITE_STATUS.PENDING ? (
                            <>
                              <Button size="sm" onClick={() => setApproving(site)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleReject(site)}>
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {site.gamMappingName ?? "—"}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => setConfirmingDelete(site.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
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
