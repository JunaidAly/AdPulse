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
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchMyPayouts, requestPayout } from "./paymentsSlice";
import { formatCurrency } from "@/lib/format";

export function RequestPayoutDialog({ disabled }: { disabled?: boolean }) {
  const dispatch = useAppDispatch();
  const { balanceCents, requesting } = useAppSelector((s) => s.payments);
  const [open, setOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [periodEnd, setPeriodEnd] = useState(format(new Date(), "yyyy-MM-dd"));

  const submit = async () => {
    const result = await dispatch(requestPayout({ periodStart, periodEnd }));
    if (requestPayout.fulfilled.match(result)) {
      toast.success(
        `Payout requested: ${formatCurrency(result.payload.amountCents)}`,
      );
      setOpen(false);
      dispatch(fetchMyPayouts());
    } else {
      toast.error(result.error?.message ?? "Payout request failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 w-full" disabled={disabled}>
          Request payout
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request payout</DialogTitle>
          <DialogDescription>
            Your full available balance of {formatCurrency(balanceCents)} will
            be requested for review.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={requesting}>
            {requesting
              ? "Requesting…"
              : `Request ${formatCurrency(balanceCents)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
