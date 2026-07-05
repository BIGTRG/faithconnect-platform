import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { NotificationBell } from "./NotificationBell";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export function AppLayout() {
  return (
    <SidebarProvider>
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:contents">
        <AppSidebar />
      </div>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between px-4">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </SidebarInset>
      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </SidebarProvider>
  );
}
