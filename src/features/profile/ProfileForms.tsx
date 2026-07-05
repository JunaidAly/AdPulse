import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppDispatch } from "@/app/hooks";
import { setLegal, setUser } from "@/features/auth/authSlice";
import { services } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const accountSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
});

export function AccountForm() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;
    const updated = await services.users.updateAccount(user.id, values);
    dispatch(setUser(updated));
    toast.success("Account updated");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-email">Email</Label>
          <Input id="acc-email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

const legalSchema = z.object({
  accountType: z.enum(["individual", "company"]),
  fullName: z.string().min(2, "Required"),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().max(3, "Use a 2–3 letter code").optional(),
});

export function LegalForm() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(legalSchema),
    defaultValues: {
      accountType: user?.legal?.accountType ?? "individual",
      fullName: user?.legal?.fullName ?? "",
      address: user?.legal?.address ?? "",
      city: user?.legal?.city ?? "",
      postalCode: user?.legal?.postalCode ?? "",
      countryCode: user?.legal?.countryCode ?? "",
    },
  });
  const accountType = watch("accountType");

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;
    const legal = { ...values, address: values.address ?? "", city: values.city ?? "", postalCode: values.postalCode ?? "", countryCode: values.countryCode ?? "" };
    await services.users.updateLegal(user.id, legal);
    dispatch(setLegal(legal));
    toast.success("Legal details saved");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Account type</Label>
        <RadioGroup
          value={accountType}
          onValueChange={(v) => setValue("accountType", v as "individual" | "company")}
          className="grid grid-cols-2 gap-3"
        >
          {(["individual", "company"] as const).map((type) => (
            <label
              key={type}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm capitalize",
                accountType === type ? "border-primary bg-accent" : "hover:bg-muted/50",
              )}
            >
              {type}
              <RadioGroupItem value={type} />
            </label>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name / company</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" {...register("postalCode")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="countryCode">Country code</Label>
          <Input id="countryCode" placeholder="AE" {...register("countryCode")} />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Required"),
    next: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 400));
    reset();
    toast.success("Password updated");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {([
        ["current", "Current Password"],
        ["next", "New Password"],
        ["confirm", "Confirm Password"],
      ] as const).map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={key}>{label}</Label>
          <Input id={key} type="password" {...register(key)} />
          {errors[key] && <p className="text-xs text-destructive">{errors[key]?.message as string}</p>}
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
