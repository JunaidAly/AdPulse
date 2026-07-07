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
  const [gamSiteName, setGamSiteName] = useState("");
  const [shareInput, setShareInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (site) {
      setGamSiteName(site.domain);
      setShareInput("");
    }
  }, [site]);

  if (!site) return null;

  const handleApprove = async () => {
    if (!gamSiteName.trim()) return;

    let revenueShare: number | undefined;
    if (shareInput.trim()) {
      const pct = Number(shareInput);
      if (!Number.isFinite(pct) || pct < 50 || pct > 100) {
        toast.error("Revenue share override must be between 50 and 100%.");
        return;
      }
      revenueShare = Math.round(pct) / 100;
    }

    setSaving(true);
    const result = await dispatch(
      approveSite({ siteId: site.id, gamMappingName: gamSiteName.trim(), revenueShare }),
    );
    setSaving(false);

    if (approveSite.fulfilled.match(result)) {
      toast.success(`${site.domain} approved`);
      onClose();
    } else {
      toast.error(result.error?.message ?? "Could not approve site");
    }
  };

  return (
    <Dialog open={!!site} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve {site.domain}</DialogTitle>
          <DialogDescription>
            Owned by {site.ownerName}. Approving lets this site serve ads.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="gamSiteName">GAM site name</Label>
            <Input
              id="gamSiteName"
              value={gamSiteName}
              onChange={(e) => setGamSiteName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Must exactly match the SITE_NAME value in Google Ad Manager.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shareOverride">Revenue share override (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="shareOverride"
                type="number"
                min={50}
                max={100}
                placeholder="Leave blank to use the user's share"
                value={shareInput}
                onChange={(e) => setShareInput(e.target.value)}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={saving || !gamSiteName.trim()}>
            {saving ? "Approving…" : "Approve site"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
