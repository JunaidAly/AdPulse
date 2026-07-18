import { useEffect } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Clock, CreditCard, FileText, TriangleAlert, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PayoutStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { PayoutMethodForm } from "./PayoutMethodForm";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchMyPayouts } from "./paymentsSlice";
import { fetchUsers } from "@/features/admin/usersSlice";
import { useAuth } from "@/hooks/useAuth";
import { PAYOUT_METHODS, PAYOUT_METHOD_LABELS, PAYOUT_STATUS, ROLES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { PayoutDetails } from "@/services/api";

function isPayoutMethodReady(payout: PayoutDetails | undefined): boolean {
  return Boolean(
    payout?.method === PAYOUT_METHODS.USDT
      ? payout.walletAddress
      : payout?.method === PAYOUT_METHODS.BANK
        ? payout.bankName && payout.accountTitle && payout.iban
        : false,
  );
}

export function PaymentsPage() {
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAuth();
  const { payouts, totalPaidCents, pendingCents, status } = useAppSelector((s) => s.payments);
  const publishers = useAppSelector((s) => s.users.items.filter((u) => u.role === ROLES.PUBLISHER));
  const usersStatus = useAppSelector((s) => s.users.status);

  useEffect(() => {
    if (user) dispatch(fetchMyPayouts());
  }, [dispatch, user]);

  useEffect(() => {
    if (isAdmin) dispatch(fetchUsers());
  }, [dispatch, isAdmin]);

  const ready = status === "ready";
  const paid = payouts
    .filter((p) => p.status === PAYOUT_STATUS.PAID)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latest = paid[0];

  const methodReady = isPayoutMethodReady(user?.payout);

  return (
    <>
      <PageHeader title="Payments" description="Payout readiness and payment history." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!isAdmin && (
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
          )}

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-primary" /> Publisher payout methods
                </CardTitle>
                <p className="text-sm text-muted-foreground">Where each publisher's payouts are sent.</p>
              </CardHeader>
              <CardContent className="p-0">
                {usersStatus !== "ready" ? (
                  <div className="p-6">
                    <TableSkeleton rows={4} cols={4} />
                  </div>
                ) : publishers.length === 0 ? (
                  <EmptyState icon={Wallet} title="No publishers" description="Publisher payout methods will appear here." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Publisher</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {publishers.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {p.payout ? PAYOUT_METHOD_LABELS[p.payout.method] : "—"}
                          </TableCell>
                          <TableCell className="max-w-xs break-all text-muted-foreground">
                            {!p.payout
                              ? "—"
                              : p.payout.method === PAYOUT_METHODS.USDT
                                ? p.payout.walletAddress ?? "—"
                                : [p.payout.bankName, p.payout.accountTitle, p.payout.iban]
                                    .filter(Boolean)
                                    .join(" · ") || "—"}
                          </TableCell>
                          <TableCell>
                            {isPayoutMethodReady(p.payout) ? (
                              <Badge className="bg-success/15 text-success hover:bg-success/15">Ready</Badge>
                            ) : (
                              <Badge variant="secondary">Not set</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment history</CardTitle>
              <p className="text-sm text-muted-foreground">Created payouts and processed payment records.</p>
            </CardHeader>
            <CardContent className="p-0">
              {!ready ? (
                <div className="p-6">
                  <TableSkeleton rows={4} cols={4} />
                </div>
              ) : paid.length === 0 ? (
                <EmptyState icon={Wallet} title="No payments yet" description="Payment records will appear here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paid.map((p, i) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="font-medium">#{paid.length - i}</p>
                          <p className="text-xs text-muted-foreground">{p.periodLabel}</p>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(p.amountCents)}</TableCell>
                        <TableCell>
                          <PayoutStatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(p.createdAt), "MMM d, yyyy")}
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
          {!isAdmin && (
            <Card className={methodReady ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}>
              <CardContent className="flex items-start gap-3 p-6">
                {methodReady ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                ) : (
                  <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                )}
                <div>
                  <p className="font-semibold">
                    {methodReady ? "Payment method ready" : "Add your payout method"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {methodReady
                      ? "Payouts will use your saved payment details."
                      : "Set your payout details so we can pay you."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden border-t-2 border-t-success">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Total paid</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(totalPaidCents)}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 rounded-lg bg-success/10 p-1.5 text-success" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-t-2 border-t-warning">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(pendingCents)}</p>
              </div>
              <Clock className="h-8 w-8 rounded-lg bg-warning/10 p-1.5 text-warning" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-t-2 border-t-primary">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Latest payment</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {latest ? formatCurrency(latest.amountCents) : "—"}
                </p>
              </div>
              <FileText className="h-8 w-8 rounded-lg bg-primary/10 p-1.5 text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
