import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r transition-[width] duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <AppSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AppSidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-extrabold tracking-tight">
            Ad<span className="text-primary">Pulse</span>
          </span>
        </div>

        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
