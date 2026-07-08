import { Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DATE_PRESETS, type DatePresetId } from "@/lib/constants";
import type { ResolvedRange } from "@/hooks/useDateRange";

interface DateRangePickerProps {
  preset: DatePresetId;
  label: string;
  range: ResolvedRange;
  onPreset: (id: DatePresetId) => void;
  custom?: ResolvedRange;
  onCustom: (range: ResolvedRange) => void;
}

export function DateRangePicker({ preset, label, range, onPreset, onCustom }: DateRangePickerProps) {
  const pretty = `${format(parseISO(range.from), "MMM d")} – ${format(parseISO(range.to), "MMM d")}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>{label}</span>
          <span className="hidden text-muted-foreground sm:inline">· {pretty}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {DATE_PRESETS.filter((p) => p.id !== "custom").map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => onPreset(p.id)}>
            {p.label}
            {preset === p.id && <span className="ml-auto text-xs text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="space-y-2 p-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-xs text-muted-foreground">Custom range</Label>
          <div className="space-y-2">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">From</span>
              <Input
                type="date"
                value={range.from}
                max={range.to}
                onChange={(e) => {
                  onPreset("custom");
                  onCustom({ from: e.target.value, to: range.to });
                }}
                className="h-9 w-full min-w-0 text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">To</span>
              <Input
                type="date"
                value={range.to}
                min={range.from}
                onChange={(e) => {
                  onPreset("custom");
                  onCustom({ from: range.from, to: e.target.value });
                }}
                className="h-9 w-full min-w-0 text-xs"
              />
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
