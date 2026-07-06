import { useEffect } from "react";
import { CheckCircle2, CreditCard, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayoutStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { PayoutMethodForm } from "./PayoutMethodForm";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchMyPayouts } from "./paymentsSlice";
import { useAuth } from "@/hooks/useAuth";
import { PAYOUT_METHOD_LABELS, PAYOUT_MINIMUM_CENTS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export function PaymentsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { payouts, balanceCents, status } = useAppSelector((s) => s.payments);

  useEffect(() => {
    if (user) dispatch(fetchMyPayouts(user.id));
  }, [dispatch, user]);

  const ready = status === "ready";
  const eligible = balanceCents >= PAYOUT_MINIMUM_CENTS;

  return (
    <>
      <PageHeader title="Payments" description="Payout method, balance, and payment history." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" /> Payout method
              </CardTitle>
              <p className="text-sm text-muted-foreground">Where payouts are sent.</p>
            </CardHeader>
            <CardContent>
              <PayoutMethodForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payout history</CardTitle>
              <p className="text-sm text-muted-foreground">Created payouts and processed payments.</p>
            </CardHeader>
            <CardContent className="p-0">
              {!ready ? (
                <div className="p-6">
                  <TableSkeleton rows={4} cols={4} />
                </div>
              ) : payouts.length === 0 ? (
                <EmptyState icon={Wallet} title="No payments yet" description="Payment records will appear here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.periodLabel}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(p.amountCents)}</TableCell>
                        <TableCell className="text-muted-foreground">{PAYOUT_METHOD_LABELS[p.method]}</TableCell>
                        <TableCell>
                          <PayoutStatusBadge status={p.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={eligible ? "border-success/30 bg-success/5" : undefined}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className={eligible ? "h-4 w-4 text-success" : "h-4 w-4 text-muted-foreground"} />
                Current balance
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">{formatCurrency(balanceCents)}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Payouts are processed when your balance exceeds {formatCurrency(PAYOUT_MINIMUM_CENTS)}.
              </p>
              {eligible ? (
                <p className="mt-3 text-sm font-medium text-success">You're eligible for the next payout.</p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {formatCurrency(PAYOUT_MINIMUM_CENTS - balanceCents)} to go until your next payout.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
