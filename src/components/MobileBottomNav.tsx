import {
  Calendar,
  DollarSign,
  Home,
  Menu,
  Rss,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/giving", label: "Give", icon: DollarSign },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/more", label: "More", icon: Menu },
] as const;

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/more") {
      // "More" is active when on the more page or any page not in the main 4 tabs
      const mainPaths = ["/dashboard", "/feed", "/giving", "/events"];
      return (
        location.pathname === "/more" ||
        !mainPaths.includes(location.pathname)
      );
    }
    return location.pathname === href;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`size-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span
                className={`text-[10px] leading-tight ${
                  active ? "font-semibold" : "font-medium"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
