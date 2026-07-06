import type { Site, SitesService } from "@/services/api";
import { SITE_STATUS } from "@/lib/constants";
import { db, delay, findUser, nextId, resolveUserId } from "./db";

export const mockSites: SitesService = {
  async listByUser(userId: string): Promise<Site[]> {
    const ownerId = resolveUserId(userId);
    return delay(db.sites.filter((s) => s.ownerId === ownerId).map((s) => ({ ...s })));
  },

  async listAll(): Promise<Site[]> {
    return delay(db.sites.map((s) => ({ ...s })));
  },

  async addSite(userId: string, domain: string): Promise<Site> {
    const site: Site = {
      id: nextId("s"),
      ownerId: resolveUserId(userId),
      ownerName: findUser(userId)?.name ?? "Unknown",
      domain: domain.trim().toLowerCase(),
      status: SITE_STATUS.PENDING,
      addedAt: new Date().toISOString(),
    };
    db.sites.push(site);
    return delay({ ...site });
  },

  async approveSite(siteId: string, gamMappingName: string): Promise<Site> {
    const site = db.sites.find((s) => s.id === siteId);
    if (!site) throw new Error("Site not found");
    site.status = SITE_STATUS.APPROVED;
    site.gamMappingName = gamMappingName.trim();
    return delay({ ...site });
  },

  async rejectSite(siteId: string): Promise<Site> {
    const site = db.sites.find((s) => s.id === siteId);
    if (!site) throw new Error("Site not found");
    site.status = SITE_STATUS.REJECTED;
    return delay({ ...site });
  },
};
