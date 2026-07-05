import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/app/hooks";
import { approveSite } from "@/features/sites/sitesSlice";
import type { Site } from "@/services";

export function ApproveSiteDialog({ site, onClose }: { site: Site | null; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [mapping, setMapping] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (site) setMapping(site.domain.split(".")[0].toUpperCase() + " delegation");
  }, [site]);

  if (!site) return null;

  const handleApprove = async () => {
    if (!mapping.trim()) return;
    setSaving(true);
    await dispatch(approveSite({ siteId: site.id, gamMappingName: mapping }));
    setSaving(false);
    toast.success(`${site.domain} approved`);
    onClose();
  };

  return (
    <Dialog open={!!site} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve {site.domain}</DialogTitle>
          <DialogDescription>
            Owned by {site.ownerName}. The GAM mapping name is an internal label linking this site to its Google
            Ad Manager delegation — it's stored for reference only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="mapping">GAM mapping name</Label>
          <Input id="mapping" value={mapping} onChange={(e) => setMapping(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={saving || !mapping.trim()}>
            {saving ? "Approving…" : "Approve site"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
