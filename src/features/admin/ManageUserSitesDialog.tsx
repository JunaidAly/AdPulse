import { useState } from "react";
import { toast } from "sonner";
import { Globe, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SiteStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppDispatch } from "@/app/hooks";
import { deleteSite } from "@/features/sites/sitesSlice";
import type { Site, User } from "@/services";

interface ManageUserSitesDialogProps {
  user: User | null;
  sites: Site[];
  onClose: () => void;
}

// Admin-only: lets an admin remove a specific site domain from a publisher's
// account without deleting the whole account. Historical revenue rows for
// the site are kept — only the site doc (and future ingestion matching) stops.
export function ManageUserSitesDialog({ user, sites, onClose }: ManageUserSitesDialogProps) {
  const dispatch = useAppDispatch();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!user) return null;

  const handleDelete = async (site: Site) => {
    setDeleting(site.id);
    const result = await dispatch(deleteSite(site.id));
    setDeleting(null);
    setConfirming(null);

    if (deleteSite.fulfilled.match(result)) {
      toast.success(`${site.domain} deleted`);
    } else {
      toast.error(result.error?.message ?? "Could not delete site");
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name}'s sites</DialogTitle>
          <DialogDescription>
            Delete a domain to stop future ingestion for it. Historical revenue is kept.
          </DialogDescription>
        </DialogHeader>

        {sites.length === 0 ? (
          <EmptyState icon={Globe} title="No sites" description="This publisher has no sites yet." />
        ) : (
          <div className="space-y-2">
            {sites.map((site) => (
              <div key={site.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{site.domain}</span>
                  <SiteStatusBadge status={site.status} />
                </div>
                {confirming === site.id ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setConfirming(null)}>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => setConfirming(site.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
