import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import { useAppDispatch } from "@/app/hooks";
import { updateRevenueShare, updateUserStatus } from "./usersSlice";
import { services, type User } from "@/services";
import { REVENUE_SHARE_MAX, REVENUE_SHARE_MIN, REVENUE_SHARE_STEP, USER_STATUS, type UserStatus } from "@/lib/constants";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface EditUserDialogProps {
  user: User | null;
  onClose: () => void;
}

export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  const dispatch = useAppDispatch();
  const [share, setShare] = useState(0.8);
  const [status, setStatus] = useState<UserStatus>(USER_STATUS.ACTIVE);
  const [rawCents, setRawCents] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setShare(user.revenueShare);
    setStatus(user.status);
    setRawCents(null);
    services.users.getRawMonthlyRevenueCents(user.id).then(setRawCents);
  }, [user]);

  if (!user) return null;

  const suspended = status === USER_STATUS.SUSPENDED;
  const userSeesCents = rawCents !== null ? Math.round(rawCents * share) : null;

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      dispatch(updateRevenueShare({ userId: user.id, share })),
      dispatch(updateUserStatus({ userId: user.id, status })),
    ]);
    setSaving(false);
    toast.success(`Updated ${user.name}`);
    onClose();
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {user.name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Revenue share</Label>
              <span className="text-sm font-semibold text-primary">{formatPercent(share, 0)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[share]}
                min={REVENUE_SHARE_MIN}
                max={REVENUE_SHARE_MAX}
                step={REVENUE_SHARE_STEP}
                onValueChange={([v]) => setShare(v)}
                className="flex-1"
              />
              <Input
                type="number"
                min={REVENUE_SHARE_MIN * 100}
                max={REVENUE_SHARE_MAX * 100}
                step={REVENUE_SHARE_STEP * 100}
                value={Math.round(share * 100)}
                onChange={(e) => {
                  const pct = Math.max(50, Math.min(100, Number(e.target.value) || 50));
                  setShare(pct / 100);
                }}
                className="w-20"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This month preview
            </p>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted-foreground">Raw revenue</p>
                <p className="text-lg font-bold">
                  {rawCents !== null ? formatCurrency(rawCents) : "…"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-muted-foreground">User sees</p>
                <p className="text-lg font-bold text-primary">
                  {userSeesCents !== null ? formatCurrency(userSeesCents) : "…"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Account status</p>
              <p className="text-xs text-muted-foreground">
                {suspended ? "Suspended — cannot access the dashboard." : "Active."}
              </p>
            </div>
            <Button
              type="button"
              variant={suspended ? "outline" : "destructive"}
              size="sm"
              onClick={() => setStatus(suspended ? USER_STATUS.ACTIVE : USER_STATUS.SUSPENDED)}
              className={cn(suspended && "border-success/40 text-success")}
            >
              {suspended ? "Reactivate" : "Suspend"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
