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

export function findUser(userId: string): User | undefined {
  return db.users.find((u) => u.id === userId);
}

let idCounter = 1000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}
