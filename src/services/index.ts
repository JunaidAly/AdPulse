/**
 * Active service implementation. Today this is the in-memory mock backend.
 *
 * To move to Firebase later: create `services/firebase/*` implementing the same
 * interfaces from `api.ts`, then swap the imports below. Nothing in the Redux
 * slices or React components imports the mock directly — they only use `services`.
 */
import type { Services } from "./api";
import { mockAuth } from "./mock/mockAuth";
import { mockReports } from "./mock/mockReports";
import { mockSites } from "./mock/mockSites";
import { mockPayouts } from "./mock/mockPayouts";
import { mockUsers } from "./mock/mockUsers";

export const services: Services = {
  auth: mockAuth,
  reports: mockReports,
  sites: mockSites,
  payouts: mockPayouts,
  users: mockUsers,
};

export * from "./api";
