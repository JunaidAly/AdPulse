/**
 * In-memory database for the mock backend. Seeded once per session; mutated by
 * the mock services. Swapping to Firebase means replacing the services that read
 * this module — nothing in slices/components references it directly.
 */
import type { Payout, Site, User } from "@/services/api";
import {
  generateRawMetrics,
  seedPayouts,
  seedSites,
  seedUsers,
  type RawMetric,
} from "./seed";

const REFERENCE_DATE = new Date();

const usersById = new Map(seedUsers.map((u) => [u.id, { ...u }]));
const userName = (id: string) => usersById.get(id)?.name ?? "Unknown";

export const db = {
  referenceDate: REFERENCE_DATE,
  users: seedUsers.map((u) => ({ ...u })) as User[],
  sites: seedSites.map((s) => ({ ...s, ownerName: userName(s.ownerId) })) as Site[],
  payouts: seedPayouts.map((p) => ({ ...p, userName: userName(p.userId) })) as Payout[],
  rawMetrics: generateRawMetrics(REFERENCE_DATE) as RawMetric[],
};

/** Simulate network latency so loading skeletons are visible. */
export function delay<T>(value: T): Promise<T> {
  const ms = 300 + Math.floor(Math.random() * 300);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * MODULE 3 SHIM: a Firebase-authenticated user has a real uid with no seeded
 * mock data. Map any unknown uid to the demo publisher so reports/sites/
 * payouts keep returning data for a logged-in publisher. Known seeded ids
 * (used by the admin screens) pass through unchanged. This dies in
 * Modules 5–7 once real data backs those services.
 */
export const DEMO_PUBLISHER_ID = "u_pub";

export function resolveUserId(userId: string): string {
  return db.users.some((u) => u.id === userId) ? userId : DEMO_PUBLISHER_ID;
}

export function findUser(userId: string): User | undefined {
  return db.users.find((u) => u.id === resolveUserId(userId));
}

let idCounter = 1000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}
