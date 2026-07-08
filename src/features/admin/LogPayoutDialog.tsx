import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { adminLogPayout, fetchAllPayouts } from "@/features/payments/paymentsSlice";
import { ROLES } from "@/lib/constants";

// Admin-only: records a payout that was already paid externally (bank
// transfer, USDT, etc). There is no publisher self-service request flow —
// this is how payout records get created, always as "paid" immediately.
export function LogPayoutDialog() {
  const dispatch = useAppDispatch();
  const publishers = useAppSelector((s) => s.users.items.filter((u) => u.role === ROLES.PUBLISHER));
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [periodStart, setPeriodStart] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [periodEnd, setPeriodEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setUserId("");
    setAmount("");
    setPeriodStart(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    setPeriodEnd(format(new Date(), "yyyy-MM-dd"));
  };

  const submit = async () => {
    if (!userId) return;
    const amountCents = amount.trim() ? Math.round(Number(amount) * 100) : undefined;
    if (amount.trim() && (!Number.isFinite(amountCents) || (amountCents ?? 0) <= 0)) {
      toast.error("Amount must be a positive number.");
      return;
    }

    setSaving(true);
    const result = await dispatch(adminLogPayout({ userId, periodStart, periodEnd, amountCents }));
    setSaving(false);

    if (adminLogPayout.fulfilled.match(result)) {
      toast.success(
        `Logged payout of ${(result.payload.amountCents / 100).toFixed(2)} for the selected publisher`,
      );
      setOpen(false);
      reset();
      dispatch(fetchAllPayouts());
    } else {
      toast.error(result.error?.message ?? "Could not log payout");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button>Log payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a payment</DialogTitle>
          <DialogDescription>
            Record a payout you already sent externally. It's marked as paid immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Publisher</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a publisher" />
              </SelectTrigger>
              <SelectContent>
                {publishers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="periodStart">Period start</Label>
              <Input
                id="periodStart"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="periodEnd">Period end</Label>
              <Input
                id="periodEnd"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="Leave blank to pay their full current balance"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !userId}>
            {saving ? "Logging…" : "Log payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
