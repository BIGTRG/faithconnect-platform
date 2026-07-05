import { Link } from "react-router-dom";
import {
  Church,
  Heart,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Smartphone,
  Shield,
  Zap,
  Bell,
  HandHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

const features = [
  {
    icon: BookOpen,
    title: "Sermon Library",
    description: "Watch, listen, and study with AI-generated study guides for every message.",
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: Heart,
    title: "Prayer Network",
    description: "Submit prayer requests, pray for others, and celebrate answered prayers together.",
    color: "text-rose-500 bg-rose-100 dark:bg-rose-900/30",
  },
  {
    icon: Users,
    title: "Community Groups",
    description: "Join small groups, Bible studies, and ministry teams. Find your place to serve.",
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Calendar,
    title: "Events & RSVP",
    description: "Stay updated on church events with one-tap RSVP and calendar integration.",
    color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: DollarSign,
    title: "Secure Giving",
    description: "Give tithes and offerings seamlessly with TRGpay integration and giving history.",
    color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
  },
  {
    icon: MessageCircle,
    title: "AI Concierge",
    description: "Get answers about Scripture, church programs, and spiritual questions anytime.",
    color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Emergency alerts, announcements, and personalized updates for your church family.",
    color: "text-red-500 bg-red-100 dark:bg-red-900/30",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Support church family businesses, buy and sell items, and exchange skills.",
    color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: HandHeart,
    title: "Care Network",
    description: "Meal trains, ride requests, newcomer journeys, and milestone celebrations.",
    color: "text-pink-500 bg-pink-100 dark:bg-pink-900/30",
  },
];

const stats = [
  { label: "Features", value: "32+" },
  { label: "Churches", value: "Free" },
  { label: "AI Powered", value: "100%" },
  { label: "Platforms", value: "Web + Mobile" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
            <Zap className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Church Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            Your Church,{" "}
            <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              Connected
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            {APP_NAME} brings your entire church community together in one platform.
            Live streaming, smart giving, AI concierge, prayer networks, and 32 features
            built for modern ministry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 h-14 rounded-xl">
                Register Your Church
                <ArrowRight className="size-5 ml-2" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-xl">
                Live Demo
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="text-lg px-8 h-14 rounded-xl">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything Your Church Needs
          </h2>
          <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">
            32 features across 7 categories, powered by AI and designed for real ministry.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="hover:shadow-lg transition-shadow border-0 bg-card/50">
              <CardContent className="p-6">
                <div className={`size-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="size-6" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {f.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mobile + Cross Platform */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
                <Smartphone className="size-4 text-primary" />
                <span className="text-sm font-medium text-primary">Mobile Ready</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Your Church in Your Pocket
              </h2>
              <p className="text-muted-foreground text-lg mt-4 leading-relaxed">
                Install {APP_NAME} as a native app on iOS and Android. Get push notifications
                for prayer requests, event reminders, and emergency alerts. Works offline with
                full functionality.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <div className="flex items-center gap-3">
                  <Shield className="size-5 text-primary" />
                  <span className="text-sm">Enterprise-grade security with end-to-end encryption</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="size-5 text-primary" />
                  <span className="text-sm">Lightning fast -- built with real-time database technology</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="size-5 text-primary" />
                  <span className="text-sm">Secure giving powered by TRGpay with Stripe overlay</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-[500px] rounded-[3rem] border-4 border-foreground/20 bg-background shadow-2xl overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-primary/5 to-amber-500/5">
                    <div className="size-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
                      <Church className="size-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-xl">{APP_NAME}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your complete church community platform
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-8 w-full">
                      {[Heart, BookOpen, Calendar, Users, DollarSign, MessageCircle].map((Icon, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-card border flex items-center justify-center">
                          <Icon className="size-5 text-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRGpay Integration */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Secure Giving with{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            TRGpay
          </span>
        </h2>
        <p className="text-muted-foreground text-lg mt-4 max-w-xl mx-auto">
          Built on TRGpay.com with Stripe overlay for PCI-compliant, secure transactions.
          Tithes, offerings, missions, building funds -- all tracked with full transparency.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="p-6 text-center">
              <DollarSign className="size-8 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold">One-Tap Giving</h3>
              <p className="text-sm text-muted-foreground mt-1">Quick amounts or custom gifts with saved payment methods</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="p-6 text-center">
              <Shield className="size-8 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold">Bank-Level Security</h3>
              <p className="text-sm text-muted-foreground mt-1">PCI DSS compliant with encrypted transactions via Stripe</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="p-6 text-center">
              <HandHeart className="size-8 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold">Campaign Tracking</h3>
              <p className="text-sm text-muted-foreground mt-1">Real-time progress bars and year-end tax receipts</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Transform Your Church?
          </h2>
          <p className="text-primary-foreground/80 text-lg mt-4 max-w-xl mx-auto">
            Join the future of church management. Set up in minutes, not months.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 text-lg px-8 h-14 rounded-xl"
            >
              Get Started Today
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Church className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">{APP_NAME}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by TRG Tech Link -- Built with purpose
          </p>
        </div>
      </footer>
    </div>
  );
}
