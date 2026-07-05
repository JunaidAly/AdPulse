import { useAppSelector } from "@/app/hooks";
import { ROLES } from "@/lib/constants";

/** Convenience accessor for the authenticated session. */
export function useAuth() {
  const user = useAppSelector((s) => s.auth.user);
  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === ROLES.ADMIN,
    isPublisher: user?.role === ROLES.PUBLISHER,
  };
}
