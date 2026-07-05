import type { AuthService, User } from "@/services/api";
import { ROLES, USER_STATUS } from "@/lib/constants";
import { db, delay, nextId } from "./db";

export const mockAuth: AuthService = {
  async login(email: string): Promise<User> {
    const existing = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (existing) return delay({ ...existing });

    // Any unknown email logs in as a fresh publisher (demo convenience).
    const user: User = {
      id: nextId("u"),
      name: email.split("@")[0] || "Publisher",
      email: email.trim(),
      role: ROLES.PUBLISHER,
      revenueShare: 0.8,
      status: USER_STATUS.ACTIVE,
      joinedAt: new Date().toISOString(),
    };
    db.users.push(user);
    return delay({ ...user });
  },

  async register(name: string, email: string): Promise<User> {
    const user: User = {
      id: nextId("u"),
      name: name.trim() || "Publisher",
      email: email.trim(),
      role: ROLES.PUBLISHER,
      revenueShare: 0.8,
      status: USER_STATUS.ACTIVE,
      joinedAt: new Date().toISOString(),
    };
    db.users.push(user);
    return delay({ ...user });
  },

  async logout(): Promise<void> {
    return delay(undefined);
  },

  async requestPasswordReset(): Promise<void> {
    return delay(undefined);
  },
};
