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
  const [lkzSiteDomain, setLkzSiteDomain] = useState("");
  const [shareInput, setShareInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (site) {
      setGamSiteName(site.domain);
      setLkzSiteDomain(site.lkzSiteDomain ?? "");
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
      approveSite({
        siteId: site.id,
        gamMappingName: gamSiteName.trim(),
        revenueShare,
        // Blank clears the mapping, so this site's lkz rows stop being
        // attributed rather than silently keeping a stale domain.
        lkzSiteDomain: lkzSiteDomain.trim() || null,
      }),
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
            <Label htmlFor="lkzSiteDomain">lkz site domain (optional)</Label>
            <Input
              id="lkzSiteDomain"
              value={lkzSiteDomain}
              placeholder="Leave blank if this site has no lkz inventory"
              onChange={(e) => setLkzSiteDomain(e.target.value.trim().toLowerCase())}
            />
            <p className="text-xs text-muted-foreground">
              The domain as it appears in lkz reports.
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
