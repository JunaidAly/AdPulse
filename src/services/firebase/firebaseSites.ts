/**
 * Firebase-backed SitesService (Module 5).
 *
 * Reads are direct client Firestore (permitted by the security rules):
 * publishers list their own sites; admin lists all. Writes go through
 * server-authoritative callables (createSite, adminReviewSite).
 */
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type { AdsTxtResult, Site, SitesService } from "@/services/api";
import { db, functions } from "./config";
import { errorMessage, toSite, type RawSite } from "./mappers";
import { registerSites } from "@/services/realSiteRegistry";

const callCreateSite = httpsCallable<{ domain: string }, RawSite & { id: string }>(
  functions,
  "createSite",
);
const callReviewSite = httpsCallable<
  {
    siteId: string;
    action: "approve" | "reject";
    gamSiteName?: string;
    revenueShare?: number;
  },
  RawSite & { id: string }
>(functions, "adminReviewSite");
const callCheckAdsTxt = httpsCallable<{ domain: string }, AdsTxtResult>(
  functions,
  "checkAdsTxt",
);

export const firebaseSites: SitesService = {
  async listByUser(userId: string): Promise<Site[]> {
    const snap = await getDocs(
      query(
        collection(db, "sites"),
        where("ownerUid", "==", userId),
        orderBy("createdAt", "desc"),
      ),
    );
    const sites = snap.docs.map((d) => toSite(d.id, d.data() as RawSite));
    registerSites(sites);
    return sites;
  },

  async listAll(): Promise<Site[]> {
    const [sitesSnap, usersSnap] = await Promise.all([
      getDocs(query(collection(db, "sites"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "users")),
    ]);
    const names = new Map<string, string>(
      usersSnap.docs.map((d) => [d.id, (d.data().name as string) ?? ""]),
    );
    const sites = sitesSnap.docs.map((d) => {
      const data = d.data() as RawSite;
      return toSite(d.id, data, names.get(data.ownerUid ?? "") ?? "");
    });
    registerSites(sites);
    return sites;
  },

  // userId is ignored — the callable derives the owner from the caller.
  async addSite(_userId: string, domain: string): Promise<Site> {
    try {
      const res = await callCreateSite({ domain });
      const site = toSite(res.data.id, res.data);
      registerSites([site]);
      return site;
    } catch (err) {
      throw new Error(errorMessage(err, "Could not add site."));
    }
  },

  async approveSite(
    siteId: string,
    gamMappingName: string,
    revenueShare?: number,
  ): Promise<Site> {
    try {
      const res = await callReviewSite({
        siteId,
        action: "approve",
        gamSiteName: gamMappingName,
        ...(revenueShare !== undefined ? { revenueShare } : {}),
      });
      return toSite(res.data.id, res.data);
    } catch (err) {
      throw new Error(errorMessage(err, "Could not approve site."));
    }
  },

  async rejectSite(siteId: string): Promise<Site> {
    try {
      const res = await callReviewSite({ siteId, action: "reject" });
      return toSite(res.data.id, res.data);
    } catch (err) {
      throw new Error(errorMessage(err, "Could not reject site."));
    }
  },

  async checkAdsTxt(domain: string): Promise<AdsTxtResult> {
    const res = await callCheckAdsTxt({ domain });
    return res.data;
  },
};
