import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { services } from "@/services";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await services.auth.requestPasswordReset(values.email);
    } catch (err) {
      // Never reveal whether the email exists (avoid account enumeration);
      // only surface genuine failures like network errors.
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("network")) {
        toast.error(message);
        return;
      }
    }
    setSent(true);
    toast.success("Reset link sent");
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a link to reset your password."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/40 py-8 text-center">
          <MailCheck className="h-8 w-8 text-success" />
          <p className="text-sm text-muted-foreground">
            If an account exists, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
