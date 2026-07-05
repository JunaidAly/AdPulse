import type { ReactNode } from "react";
import type { Role } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

interface RoleGateProps {
  role: Role;
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only when the authenticated user has the given role. */
export function RoleGate({ role, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth();
  if (user?.role !== role) return <>{fallback}</>;
  return <>{children}</>;
}
