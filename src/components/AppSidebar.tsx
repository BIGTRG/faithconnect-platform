import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
  Activity,
  Baby,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  Church,
  CreditCard,
  DollarSign,
  FileCheck,
  HandHelping,
  HandHeart,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  Library,
  LogOut,
  MessageCircle,
  MessageSquare,
  Moon,
  Newspaper,
  Radio,
  Rss,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Sun,
  Tag,
  TrendingUp,
  Trophy,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { APP_NAME } from "@/lib/constants";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

const mainNav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/welcome", label: "Welcome", icon: Heart },
  { href: "/feed", label: "FaithFeed", icon: Rss },
  { href: "/church-news", label: "Church News", icon: Newspaper },
  { href: "/announcements", label: "Announcements", icon: Newspaper },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/sermons", label: "Sermons", icon: BookOpen },
  { href: "/bible", label: "Bible KJV", icon: BookOpen },
  { href: "/worship-radio", label: "Worship Radio", icon: Radio },
];

const communityNav = [
  { href: "/directory", label: "Directory", icon: Users },
  { href: "/groups", label: "Groups", icon: Church },
  { href: "/prayers", label: "Prayer", icon: Heart },
  { href: "/testimonies", label: "Testimonies", icon: HandHeart },
  { href: "/faithmatch", label: "FaithMatch", icon: Sparkles },
  { href: "/meet-pastor", label: "Meet the Pastor", icon: Video },
  { href: "/teen-ministry", label: "Teen Ministry", icon: Zap },
  { href: "/child-checkin", label: "Children Check-in", icon: Baby },
  { href: "/support", label: "Crisis Support", icon: HeartHandshake },
  { href: "/life-events", label: "Life Events", icon: Bell },
  { href: "/crisis-team", label: "Crisis Team", icon: Shield },
  { href: "/therapist", label: "Therapist", icon: Brain },
  { href: "/mental-health", label: "Mental Health", icon: HeartPulse },
  { href: "/medical", label: "Medical Directory", icon: Stethoscope },
];

const toolsNav = [
  { href: "/giving", label: "Give", icon: DollarSign },
  { href: "/ai-concierge", label: "AI Concierge", icon: MessageCircle },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/job-board", label: "Jobs & Volunteering", icon: Briefcase },
  { href: "/growth", label: "Growth Tracker", icon: TrendingUp },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/certificates", label: "Certificates", icon: FileCheck },
  { href: "/expert-qa", label: "Expert Q&A", icon: MessageSquare },
  { href: "/help-center", label: "I Need Help", icon: HandHelping },
  { href: "/church-store", label: "Church Store", icon: Tag },
  { href: "/book-library", label: "Book Library", icon: Library },
  { href: "/giving-statement", label: "Giving Statement", icon: FileCheck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/security", label: "Account Security", icon: Shield },
  { href: "/audit-log", label: "Audit Log", icon: FileCheck },
  { href: "/stripe-setup", label: "Payment Setup", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/platform-health", label: "Platform Health", icon: Activity },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/admin", label: "Platform Admin", icon: Shield },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={href} onClick={() => setOpenMobile(false)}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarNav() {
  const location = useLocation();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Community</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {communityNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Tools</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {toolsNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function SidebarUserMenu() {
  const user = useQuery(api.auth.currentUser);
  const { signOut } = useAuthActions();
  const { theme, toggleTheme, switchable } = useTheme();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarFooter className="border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium truncate">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              <DropdownMenuItem asChild>
                <Link to="/settings" onClick={() => setOpenMobile(false)}>
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/churches" onClick={() => setOpenMobile(false)}>
                  <Church className="size-4" />
                  Switch Church
                </Link>
              </DropdownMenuItem>
              {switchable && (
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "light" ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function SidebarHeaderContent() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <Link
        to="/dashboard"
        onClick={() => setOpenMobile(false)}
        className="flex items-center gap-2.5 px-2 py-1 font-semibold text-lg"
      >
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
          <Church className="size-4 text-primary-foreground" />
        </div>
        <span>{APP_NAME}</span>
      </Link>
    </SidebarHeader>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeaderContent />
      <SidebarNav />
      <SidebarUserMenu />
    </Sidebar>
  );
}
