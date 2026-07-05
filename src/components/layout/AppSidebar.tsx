import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ChevronsLeft,
  CreditCard,
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const PUBLISHER_NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/sites", label: "Sites", icon: Globe },
  { to: "/payments", label: "Payments", icon: CreditCard },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/overview", label: "Overview", icon: ShieldCheck },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/sites", label: "Sites approval", icon: Globe },
  { to: "/admin/payouts", label: "Payouts", icon: Wallet },
];

function NavRow({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function AppSidebar({ collapsed, onToggleCollapse, onNavigate }: AppSidebarProps) {
  const { isAdmin } = useAuth();

  return (
    <div className="flex h-full flex-col bg-card">
      <div className={cn("flex h-16 items-center gap-2 px-4", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <span className="text-xl font-extrabold tracking-tight">
            Ad<span className="text-primary">Pulse</span>
          </span>
        )}
        {onToggleCollapse && (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="hidden lg:inline-flex">
            <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {PUBLISHER_NAV.map((item) => (
          <NavRow key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}

        {isAdmin && (
          <div className="pt-4">
            {!collapsed && (
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Admin
              </p>
            )}
            <div className="space-y-1">
              {ADMIN_NAV.map((item) => (
                <NavRow key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t p-3">
        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  );
}
