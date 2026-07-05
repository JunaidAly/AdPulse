import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-6 text-2xl font-extrabold tracking-tight">
        Ad<span className="text-primary">Pulse</span>
      </div>
      <Card className="w-full max-w-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-sky-400 to-emerald-400" />
        <div className="p-8">
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </Card>
      <p className="mt-6 text-xs text-muted-foreground">© 2026 AdPulse Yield.</p>
    </div>
  );
}
