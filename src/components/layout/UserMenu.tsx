import { useNavigate } from "react-router-dom";
import { ChevronUp, LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppDispatch } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (!user) return null;
  const initials = user.name.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent",
            collapsed && "justify-center",
          )}
        >
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-56">
        <button
          onClick={() => navigate("/profile")}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
        >
          <UserIcon className="h-4 w-4" /> Profile
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </PopoverContent>
    </Popover>
  );
}
