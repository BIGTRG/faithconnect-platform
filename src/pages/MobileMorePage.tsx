import {
  Activity,
  Baby,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileCheck,
  HandHelping,
  HandHeart,
  Heart,
  HeartHandshake,
  HeartPulse,
  Library,
  MessageCircle,
  MessageSquare,
  Newspaper,
  Radio,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Tag,
  TrendingUp,
  Trophy,
  Users,
  Video,
  Church,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "Community",
    items: [
      { href: "/sermons", label: "Sermons", icon: BookOpen, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" },
      { href: "/directory", label: "Directory", icon: Users, color: "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300" },
      { href: "/faithmatch", label: "FaithMatch", icon: Sparkles, color: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300" },
      { href: "/announcements", label: "Announce", icon: Newspaper, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
      { href: "/prayers", label: "Prayer", icon: Heart, color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
      { href: "/testimonies", label: "Testimonies", icon: HandHeart, color: "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300" },
      { href: "/groups", label: "Groups", icon: Church, color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" },
      { href: "/teen-ministry", label: "Teen Ministry", icon: Zap, color: "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300" },
      { href: "/welcome", label: "Welcome", icon: Heart, color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
      { href: "/bible", label: "Bible KJV", icon: BookOpen, color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
    ],
  },
  {
    title: "Ministry & Support",
    items: [
      { href: "/crisis-team", label: "Crisis Team", icon: Shield, color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" },
      { href: "/mental-health", label: "Mental Health", icon: Brain, color: "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300" },
      { href: "/therapist", label: "Therapist", icon: HeartPulse, color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
      { href: "/medical", label: "Medical", icon: Stethoscope, color: "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300" },
      { href: "/expert-qa", label: "Expert Q&A", icon: MessageSquare, color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
      { href: "/help-center", label: "Help Center", icon: HandHelping, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" },
      { href: "/meet-pastor", label: "Meet Pastor", icon: Video, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300" },
      { href: "/support", label: "Crisis Support", icon: HeartHandshake, color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" },
      { href: "/life-events", label: "Life Events", icon: Bell, color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900 dark:text-fuchsia-300" },
      { href: "/child-checkin", label: "Kids Check-in", icon: Baby, color: "bg-lime-100 text-lime-600 dark:bg-lime-900 dark:text-lime-300" },
    ],
  },
  {
    title: "Tools & Content",
    items: [
      { href: "/ai-concierge", label: "AI Concierge", icon: MessageCircle, color: "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300" },
      { href: "/church-store", label: "Church Store", icon: Tag, color: "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300" },
      { href: "/book-library", label: "Book Library", icon: Library, color: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300" },
      { href: "/worship-radio", label: "Worship Radio", icon: Radio, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
      { href: "/church-news", label: "Church News", icon: Newspaper, color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
      { href: "/awards", label: "Awards", icon: Trophy, color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" },
      { href: "/marketplace", label: "Marketplace", icon: ShoppingBag, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" },
      { href: "/growth", label: "Growth Track", icon: TrendingUp, color: "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300" },
      { href: "/certificates", label: "Certificates", icon: FileCheck, color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
      { href: "/giving", label: "Giving", icon: DollarSign, color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" },
      { href: "/job-board", label: "Jobs", icon: Briefcase, color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" },
      { href: "/giving-statement", label: "Tax Statement", icon: FileCheck, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
      { href: "/notifications", label: "Notifications", icon: Bell, color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
      { href: "/security", label: "Security", icon: Shield, color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" },
      { href: "/audit-log", label: "Audit Log", icon: ClipboardList, color: "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300" },
      { href: "/stripe-setup", label: "Payment Setup", icon: CreditCard, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" },
      { href: "/analytics", label: "Analytics", icon: BarChart3, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
      { href: "/platform-health", label: "Platform Health", icon: Activity, color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" },
      { href: "/compliance", label: "Compliance", icon: ShieldCheck, color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
      { href: "/settings", label: "Settings", icon: Calendar, color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
    ],
  },
];

export function MobileMorePage() {
  return (
    <div className="pb-24 px-4 pt-2">
      <h1 className="text-2xl font-bold mb-1">More</h1>
      <p className="text-sm text-muted-foreground mb-4">All 50+ Features</p>

      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            {section.title}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {section.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}
                >
                  <item.icon className="size-5" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
