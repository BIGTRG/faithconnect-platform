import { useQuery, useMutation } from "convex/react";
import { useEffect } from "react";
import {
  Calendar,
  Church,
  DollarSign,
  Heart,
  MessageCircle,
  Newspaper,
  Users,
  AlertTriangle,
  ArrowRight,
  HandHeart,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatEventDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const categoryColors: Record<string, string> = {
  general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  event: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  ministry: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  youth: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  missions: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
};

export function DashboardPage() {
  const dashboardData = useQuery(api.church.getDashboardData);
  const member = useQuery(api.members.getCurrentMember);
  const user = useQuery(api.auth.currentUser);
  const getOrCreateMember = useMutation(api.members.getOrCreateMember);

  useEffect(() => {
    if (user && !member) {
      getOrCreateMember({ displayName: user.name ?? "Member" });
    }
  }, [user, member, getOrCreateMember]);

  if (!dashboardData) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { church, announcements, events, prayers, memberCount, alerts, testimonies } = dashboardData;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">
      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any) => (
            <div
              key={alert._id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                alert.severity === "critical"
                  ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                  : alert.severity === "warning"
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                    : "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
              }`}
            >
              <AlertTriangle className="size-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome back{member?.displayName ? `, ${member.displayName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          {church?.name ?? "Your Church"} — {church?.serviceSchedule ?? "Services every Sunday"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link to="/directory">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="size-5 text-primary" />
                <span className="text-2xl font-bold">{memberCount}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Members</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/prayers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 bg-gradient-to-br from-rose-100/80 to-rose-50/80 dark:from-rose-950/30 dark:to-rose-950/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Heart className="size-5 text-rose-500" />
                <span className="text-2xl font-bold">{prayers?.length ?? 0}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Prayer Needs</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/events">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 bg-gradient-to-br from-emerald-100/80 to-emerald-50/80 dark:from-emerald-950/30 dark:to-emerald-950/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Calendar className="size-5 text-emerald-600" />
                <span className="text-2xl font-bold">{events?.length ?? 0}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Upcoming</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/giving">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 bg-gradient-to-br from-amber-100/80 to-amber-50/80 dark:from-amber-950/30 dark:to-amber-950/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <DollarSign className="size-5 text-amber-600" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Give Now</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Link to="/ai-concierge">
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <MessageCircle className="size-5" />
            <span className="text-xs">AI Concierge</span>
          </Button>
        </Link>
        <Link to="/sermons">
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <BookOpen className="size-5" />
            <span className="text-xs">Sermons</span>
          </Button>
        </Link>
        <Link to="/groups">
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <Church className="size-5" />
            <span className="text-xs">Groups</span>
          </Button>
        </Link>
        <Link to="/testimonies">
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <HandHeart className="size-5" />
            <span className="text-xs">Testimonies</span>
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Newspaper className="size-5" />
                Latest News
              </CardTitle>
              <Link to="/announcements">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="size-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements && announcements.length > 0 ? (
              announcements.map((a: any) => (
                <div key={a._id} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {a.isPinned && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Pinned
                          </Badge>
                        )}
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${categoryColors[a.category] ?? ""}`}>
                          {a.category}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {a.content}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {a.authorName} -- {formatDate(a.publishedAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No announcements yet. Create one to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="size-5" />
                Upcoming Events
              </CardTitle>
              <Link to="/events">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="size-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {events && events.length > 0 ? (
              events.map((e: any) => (
                <div key={e._id} className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[48px]">
                    <span className="text-xs font-medium text-primary">
                      {new Date(e.startTime).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {new Date(e.startTime).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatEventDate(e.startTime)}
                    </p>
                    {e.location && (
                      <p className="text-xs text-muted-foreground">{e.location}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No upcoming events. Create one to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prayer Requests + Testimonies Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Prayer Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="size-5 text-rose-500" />
                Prayer Requests
              </CardTitle>
              <Link to="/prayers">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="size-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {prayers && prayers.length > 0 ? (
              prayers.map((p: any) => (
                <div key={p._id} className="border-b last:border-0 pb-3 last:pb-0">
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {p.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {p.prayerCount} praying
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No active prayer requests.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Testimonies */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <HandHeart className="size-5 text-amber-500" />
                Testimonies
              </CardTitle>
              <Link to="/testimonies">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="size-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {testimonies && testimonies.length > 0 ? (
              testimonies.map((t: any) => (
                <div key={t._id} className="border-b last:border-0 pb-3 last:pb-0">
                  <p className="text-sm line-clamp-3">{t.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    -- {t.memberName}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No testimonies yet. Share yours!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
