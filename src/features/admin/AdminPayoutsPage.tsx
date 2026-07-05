import { useEffect } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PayoutStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAllPayouts, markPayoutPaid } from "@/features/payments/paymentsSlice";
import { PAYOUT_METHOD_LABELS, PAYOUT_STATUS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export function AdminPayoutsPage() {
  const dispatch = useAppDispatch();
  const { payouts, status } = useAppSelector((s) => s.payments);

  useEffect(() => {
    dispatch(fetchAllPayouts());
  }, [dispatch]);

  const loading = status !== "ready";
  const pendingTotal = payouts
    .filter((p) => p.status === PAYOUT_STATUS.PENDING)
    .reduce((s, p) => s + p.amountCents, 0);

  const handlePay = async (id: string, name: string) => {
    await dispatch(markPayoutPaid(id));
    toast.success(`Payout to ${name} marked as paid`);
  };

  return (
    <>
      <PageHeader
        title="Payouts"
        description="Approve pending payout requests across all publishers."
        actions={
          <span className="rounded-lg bg-warning/15 px-3 py-1.5 text-sm font-medium text-warning">
            {formatCurrency(pendingTotal)} pending
          </span>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : payouts.length === 0 ? (
        <Card>
          <EmptyState title="No payouts" description="Payout requests will appear here." />
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.userName}</TableCell>
                    <TableCell className="text-muted-foreground">{p.periodLabel}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.amountCents)}</TableCell>
                    <TableCell className="text-muted-foreground">{PAYOUT_METHOD_LABELS[p.method]}</TableCell>
                    <TableCell>
                      <PayoutStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === PAYOUT_STATUS.PENDING ? (
                        <Button size="sm" onClick={() => handlePay(p.id, p.userName)}>
                          Mark paid
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(p.createdAt), "MMM d, yyyy")}
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
    </>
  );
}
