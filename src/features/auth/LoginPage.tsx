import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthShell } from "./AuthShell";
import { login, loginWithGoogle } from "./authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { services } from "@/services";
import { useAppDispatch } from "@/app/hooks";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name}`);
      navigate("/dashboard");
    } else {
      toast.error(result.error?.message ?? "Login failed");
    }
  };

  const onGoogle = async () => {
    const result = await dispatch(loginWithGoogle());
    if (loginWithGoogle.fulfilled.match(result)) {
      toast.success(`Welcome, ${result.payload.name}`);
      navigate("/dashboard");
    } else {
      toast.error(result.error?.message ?? "Google sign-in failed");
    }
  };

  const googleEnabled = typeof services.auth.loginWithGoogle === "function";

  const fillDemo = (email: string) => {
    setValue("email", email);
    setValue("password", "demo1234");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your AdPulse workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="Enter password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Log in"} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting}
            onClick={onGoogle}
          >
            Continue with Google
          </Button>
        </>
      )}

      <div className="mt-5 rounded-lg border border-dashed bg-muted/40 p-3 text-xs">
        <p className="mb-2 font-medium text-foreground">Demo accounts</p>
        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={() => fillDemo("admin@demo.com")} className="text-left text-muted-foreground hover:text-primary">
            admin@demo.com — Admin
          </button>
          <button type="button" onClick={() => fillDemo("publisher@demo.com")} className="text-left text-muted-foreground hover:text-primary">
            publisher@demo.com — Publisher
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
