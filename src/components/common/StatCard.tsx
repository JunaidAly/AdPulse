import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDelta } from "@/lib/format";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number; // ratio; omit to hide the badge
  icon: LucideIcon;
  accent?: "green" | "blue" | "violet" | "amber";
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  green: "from-emerald-400 to-emerald-500 text-emerald-600 bg-emerald-50",
  blue: "from-sky-400 to-sky-500 text-sky-600 bg-sky-50",
  violet: "from-violet-400 to-violet-500 text-violet-600 bg-violet-50",
  amber: "from-amber-400 to-amber-500 text-amber-600 bg-amber-50",
};

export function StatCard({ label, value, delta, icon: Icon, accent = "violet" }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  const [, , iconText, iconBg] = ACCENTS[accent].split(" ");

  return (
    <Card className="relative overflow-hidden p-5">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", ACCENTS[accent])} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg, iconText)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
              positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatDelta(delta)}
          </span>
          <span className="text-muted-foreground">vs previous period</span>
        </div>
      )}
    </Card>
  );
}
