import {
  Calendar,
  HandCoins,
  Home,
  LayoutGrid,
  Rss,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const leftTabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: Rss },
] as const;

const rightTabs = [
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/more", label: "More", icon: LayoutGrid },
] as const;

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      to={href}
      className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full"
    >
      <div
        className={`flex items-center justify-center rounded-full px-4 py-1 transition-all ${
          active ? "bg-primary/10" : ""
        }`}
      >
        <Icon
          className={`size-[22px] transition-colors ${
            active ? "text-primary stroke-[2.4]" : "text-muted-foreground"
          }`}
        />
      </div>
      <span
        className={`text-[10px] leading-none transition-colors ${
          active ? "font-semibold text-primary" : "font-medium text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/more") {
      const mainPaths = ["/dashboard", "/feed", "/giving", "/events"];
      return (
        location.pathname === "/more" || !mainPaths.includes(location.pathname)
      );
    }
    return location.pathname === href;
  };

  const giveActive = location.pathname === "/giving";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      {/* Frosted glass bar */}
      <div className="relative bg-background/90 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center h-[68px] px-1">
          {leftTabs.map((tab) => (
            <TabLink
              key={tab.href}
              href={tab.href}
              label={tab.label}
              icon={tab.icon}
              active={isActive(tab.href)}
            />
          ))}

          {/* Raised center Give button */}
          <div className="relative flex-1 flex flex-col items-center justify-end h-full pb-1.5">
            <Link
              to="/giving"
              className="absolute -top-6 flex items-center justify-center"
            >
              <div
                className={`flex items-center justify-center size-14 rounded-full shadow-lg transition-all ${
                  giveActive
                    ? "bg-primary ring-4 ring-primary/25 scale-105"
                    : "bg-primary hover:scale-105"
                }`}
              >
                <HandCoins className="size-6 text-primary-foreground" />
              </div>
            </Link>
            <span
              className={`text-[10px] leading-none ${
                giveActive
                  ? "font-semibold text-primary"
                  : "font-medium text-muted-foreground"
              }`}
            >
              Give
            </span>
          </div>

          {rightTabs.map((tab) => (
            <TabLink
              key={tab.href}
              href={tab.href}
              label={tab.label}
              icon={tab.icon}
              active={isActive(tab.href)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
