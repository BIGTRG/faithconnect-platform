import { Church } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { NotificationBell } from "./NotificationBell";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:contents">
        <AppSidebar />
      </div>
      <SidebarInset>
        {/* Mobile app-style header */}
        <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between px-4 bg-background/90 backdrop-blur-xl border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Church className="size-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <NotificationBell />
        </header>

        {/* Desktop header */}
        <header className="hidden md:flex h-12 items-center justify-end px-4">
          <NotificationBell />
        </header>

        <main className="flex-1 p-4 lg:p-6 pb-28 md:pb-6">
          <Outlet />
        </main>
      </SidebarInset>
      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </SidebarProvider>
  );
}
