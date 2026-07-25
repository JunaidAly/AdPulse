import { useMemo, useState } from "react";
import { DATE_PRESETS, type DatePresetId } from "@/lib/constants";

export interface ResolvedRange {
  from: string; // yyyy-MM-dd
  to: string; // yyyy-MM-dd
}

// GAM report dates are bucketed in IST (Asia/Kolkata, UTC+5:30) — see
// backend/functions/src/lib/dates.ts. The date-range presets MUST resolve
// "today" the same way, or a browser whose local calendar day hasn't
// rolled over to match IST (or has already rolled past it) ends up
// querying a date nothing was ingested under. Never use the browser's
// local Date getters or date-fns's local-time helpers here.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function formatDateIST(date: Date): string {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayIST(): string {
  return formatDateIST(new Date());
}

/** Add (or subtract) whole days from an ISO date string, DST/timezone-safe. */
function addDaysIso(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function startOfMonthIso(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function endOfMonthIso(iso: string): string {
  const d = new Date(`${iso.slice(0, 7)}-01T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(0); // day 0 of next month = last day of this month
  return d.toISOString().slice(0, 10);
}

/** Resolve a preset id (and optional custom range) into concrete ISO dates. */
export function resolveRange(preset: DatePresetId, custom?: ResolvedRange): ResolvedRange {
  const today = todayIST();

  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "7d":
      return { from: addDaysIso(today, -6), to: today };
    case "30d":
      return { from: addDaysIso(today, -29), to: today };
    case "month":
      return { from: startOfMonthIso(today), to: endOfMonthIso(today) };
    case "custom":
      return custom ?? { from: addDaysIso(today, -6), to: today };
  }
}

export function useDateRange(initial: DatePresetId = "7d") {
  const [preset, setPreset] = useState<DatePresetId>(initial);
  const [custom, setCustom] = useState<ResolvedRange | undefined>(undefined);

  const range = useMemo(() => resolveRange(preset, custom), [preset, custom]);
  const label = DATE_PRESETS.find((p) => p.id === preset)?.label ?? "Last 7 Days";

  return { preset, setPreset, custom, setCustom, range, label };
}
