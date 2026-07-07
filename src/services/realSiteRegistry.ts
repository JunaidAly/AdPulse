/**
 * MODULE 5 bridge: reports/dashboard are still mock (real in Module 7), but
 * sites are now real. This in-memory registry lets the mock reports service
 * key its deterministic metrics off REAL site ids so the dashboard/reports/
 * sites pages render for a real publisher. Populated by firebaseSites as it
 * reads sites. Not firebase-aware (no SDK import), so any layer may read it.
 * Dies when reports go real in Module 7.
 */
import type { Site } from "@/services/api";

interface Entry {
  id: string;
  ownerId: string;
}

const byId = new Map<string, Entry>();

export function registerSites(sites: Site[]): void {
  for (const s of sites) byId.set(s.id, { id: s.id, ownerId: s.ownerId });
}

export function realSiteIdsForOwner(ownerId: string): string[] {
  return [...byId.values()]
    .filter((e) => e.ownerId === ownerId)
    .map((e) => e.id);
}

export function allRealSiteIds(): string[] {
  return [...byId.values()].map((e) => e.id);
}
