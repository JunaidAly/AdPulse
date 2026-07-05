import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
    iban: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.method === PAYOUT_METHODS.USDT && !v.walletAddress?.trim()) {
      ctx.addIssue({ code: "custom", path: ["walletAddress"], message: "Wallet address is required" });
    }
    if (v.method === PAYOUT_METHODS.BANK) {
      if (!v.bankName?.trim()) ctx.addIssue({ code: "custom", path: ["bankName"], message: "Bank name is required" });
      if (!v.iban?.trim()) ctx.addIssue({ code: "custom", path: ["iban"], message: "IBAN / account is required" });
    }
  });

type FormValues = z.infer<typeof schema>;

export function PayoutMethodForm() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      method: user?.payout?.method ?? PAYOUT_METHODS.USDT,
      walletAddress: user?.payout?.walletAddress ?? "",
      bankName: user?.payout?.bankName ?? "",
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
      details.iban = values.iban;
    }
    const result = await dispatch(savePayoutDetails({ userId: user.id, details }));
    if (savePayoutDetails.fulfilled.match(result)) {
      dispatch(setPayout(details));
      toast.success("Payout method saved");
    } else {
      toast.error("Failed to save payout method");
    }
  };

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
          <Label htmlFor="walletAddress">USDT wallet address (TRC-20)</Label>
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
            <Label htmlFor="iban">IBAN / account</Label>
            <Input id="iban" placeholder="IBAN or account number" {...register("iban")} />
            {errors.iban && <p className="text-xs text-destructive">{errors.iban.message}</p>}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">Minimum payout is $50.00.</p>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
