import { useMemo, useState } from "react";
import { endOfMonth, format, startOfMonth, subDays } from "date-fns";
import { DATE_PRESETS, type DatePresetId } from "@/lib/constants";

export interface ResolvedRange {
  from: string; // yyyy-MM-dd
  to: string; // yyyy-MM-dd
}

/** Resolve a preset id (and optional custom range) into concrete ISO dates. */
export function resolveRange(preset: DatePresetId, custom?: ResolvedRange): ResolvedRange {
  const today = new Date();
  const iso = (d: Date) => format(d, "yyyy-MM-dd");

  switch (preset) {
    case "today":
      return { from: iso(today), to: iso(today) };
    case "7d":
      return { from: iso(subDays(today, 6)), to: iso(today) };
    case "30d":
      return { from: iso(subDays(today, 29)), to: iso(today) };
    case "month":
      return { from: iso(startOfMonth(today)), to: iso(endOfMonth(today)) };
    case "custom":
      return custom ?? { from: iso(subDays(today, 6)), to: iso(today) };
  }
}

export function useDateRange(initial: DatePresetId = "7d") {
  const [preset, setPreset] = useState<DatePresetId>(initial);
  const [custom, setCustom] = useState<ResolvedRange | undefined>(undefined);

  const range = useMemo(() => resolveRange(preset, custom), [preset, custom]);
  const label = DATE_PRESETS.find((p) => p.id === preset)?.label ?? "Last 7 Days";

  return { preset, setPreset, custom, setCustom, range, label };
}
