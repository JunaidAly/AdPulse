import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch } from "@/app/hooks";
import { savePayoutDetails } from "./paymentsSlice";
import { setPayout } from "@/features/auth/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { PAYOUT_METHODS, PAYOUT_METHOD_LABELS } from "@/lib/constants";
import type { PayoutDetails } from "@/services/api";

const schema = z
  .object({
    method: z.enum([PAYOUT_METHODS.USDT, PAYOUT_METHODS.BANK]),
    walletAddress: z.string().optional(),
    bankName: z.string().optional(),
    accountTitle: z.string().optional(),
    iban: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.method === PAYOUT_METHODS.USDT && !v.walletAddress?.trim()) {
      ctx.addIssue({ code: "custom", path: ["walletAddress"], message: "Wallet address is required" });
    }
    if (v.method === PAYOUT_METHODS.BANK) {
      if (!v.bankName?.trim()) ctx.addIssue({ code: "custom", path: ["bankName"], message: "Bank name is required" });
      if (!v.accountTitle?.trim()) ctx.addIssue({ code: "custom", path: ["accountTitle"], message: "Account title is required" });
      if (!v.iban?.trim()) ctx.addIssue({ code: "custom", path: ["iban"], message: "IBAN / account is required" });
    }
  });

type FormValues = z.infer<typeof schema>;

/** Read-only summary shown once a payout method is on file. */
function PayoutMethodView({ payout, onEdit }: { payout: PayoutDetails; onEdit: () => void }) {
  const rows =
    payout.method === PAYOUT_METHODS.USDT
      ? [["USDT wallet address (ERC-20)", payout.walletAddress ?? "—"]]
      : [
          ["Bank name", payout.bankName ?? "—"],
          ["Account title", payout.accountTitle ?? "—"],
          ["IBAN / account", payout.iban ?? "—"],
        ];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Method</Label>
        <p className="text-sm font-medium">{PAYOUT_METHOD_LABELS[payout.method]}</p>
      </div>
      {rows.map(([label, value]) => (
        <div key={label} className="space-y-1.5">
          <Label>{label}</Label>
          <p className="break-all text-sm font-medium">{value}</p>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={onEdit} className="gap-2">
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Button>
    </div>
  );
}

export function PayoutMethodForm() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [editing, setEditing] = useState(!user?.payout);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      method: user?.payout?.method ?? PAYOUT_METHODS.USDT,
      walletAddress: user?.payout?.walletAddress ?? "",
      bankName: user?.payout?.bankName ?? "",
      accountTitle: user?.payout?.accountTitle ?? "",
      iban: user?.payout?.iban ?? "",
    },
  });

  const method = watch("method");

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    const details: PayoutDetails = { method: values.method };
    if (values.method === PAYOUT_METHODS.USDT) details.walletAddress = values.walletAddress;
    else {
      details.bankName = values.bankName;
      details.accountTitle = values.accountTitle;
      details.iban = values.iban;
    }
    const result = await dispatch(savePayoutDetails({ userId: user.id, details }));
    if (savePayoutDetails.fulfilled.match(result)) {
      dispatch(setPayout(details));
      toast.success("Payout method saved");
      setEditing(false);
    } else {
      toast.error("Failed to save payout method");
    }
  };

  if (!editing && user?.payout) {
    return (
      <PayoutMethodView
        payout={user.payout}
        onEdit={() => {
          reset({
            method: user.payout?.method ?? PAYOUT_METHODS.USDT,
            walletAddress: user.payout?.walletAddress ?? "",
            bankName: user.payout?.bankName ?? "",
            accountTitle: user.payout?.accountTitle ?? "",
            iban: user.payout?.iban ?? "",
          });
          setEditing(true);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Method</Label>
        <Select value={method} onValueChange={(v) => setValue("method", v as FormValues["method"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PAYOUT_METHODS.USDT}>{PAYOUT_METHOD_LABELS.usdt}</SelectItem>
            <SelectItem value={PAYOUT_METHODS.BANK}>{PAYOUT_METHOD_LABELS.bank}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {method === PAYOUT_METHODS.USDT ? (
        <div className="space-y-1.5">
          <Label htmlFor="walletAddress">USDT wallet address (ERC-20)</Label>
          <Input id="walletAddress" placeholder="0x…" {...register("walletAddress")} />
          {errors.walletAddress && <p className="text-xs text-destructive">{errors.walletAddress.message}</p>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Bank name</Label>
            <Input id="bankName" placeholder="Bank name" {...register("bankName")} />
            {errors.bankName && <p className="text-xs text-destructive">{errors.bankName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountTitle">Account title</Label>
            <Input id="accountTitle" placeholder="Account holder name" {...register("accountTitle")} />
            {errors.accountTitle && <p className="text-xs text-destructive">{errors.accountTitle.message}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="iban">IBAN / account</Label>
            <Input id="iban" placeholder="IBAN or account number" {...register("iban")} />
            {errors.iban && <p className="text-xs text-destructive">{errors.iban.message}</p>}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">Minimum payout is $50.00.</p>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
        {user?.payout && (
          <Button type="button" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
