import { useQuery, useMutation } from "convex/react";
import {
  Bell, BellOff, CheckCheck, Trash2, Calendar, Megaphone,
  Heart, DollarSign, Users, AlertTriangle, Gift, Sparkles, Settings2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const typeIcons: Record<string, any> = {
  event_reminder: Calendar,
  announcement: Megaphone,
  prayer_update: Heart,
  giving_receipt: DollarSign,
  group_message: Users,
  life_event: Gift,
  crisis_alert: AlertTriangle,
  welcome: Sparkles,
  general: Bell,
};

const typeColors: Record<string, string> = {
  event_reminder: "text-blue-500",
  announcement: "text-purple-500",
  prayer_update: "text-pink-500",
  giving_receipt: "text-green-500",
  group_message: "text-indigo-500",
  life_event: "text-amber-500",
  crisis_alert: "text-red-500",
  welcome: "text-emerald-500",
  general: "text-gray-500",
};

const typeLabels: Record<string, string> = {
  event_reminder: "Event Reminder",
  announcement: "Announcement",
  prayer_update: "Prayer Update",
  giving_receipt: "Giving Receipt",
  group_message: "Group Message",
  life_event: "Life Event",
  crisis_alert: "Crisis Alert",
  welcome: "Welcome",
  general: "General",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function NotificationsPage() {
  const notifications = useQuery(api.notificationsBackend.getMyNotifications);
  const preferences = useQuery(api.notificationsBackend.getPreferences);
  const markAsRead = useMutation(api.notificationsBackend.markAsRead);
  const markAllRead = useMutation(api.notificationsBackend.markAllRead);
  const deleteNotif = useMutation(api.notificationsBackend.deleteNotification);
  const updatePrefs = useMutation(api.notificationsBackend.updatePreferences);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");

  const unread = notifications?.filter((n: any) => !n.isRead) ?? [];
  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
      ? unread
      : notifications?.filter((n: any) => n.type === filter);

  const handleMarkAllRead = async () => {
    await markAllRead({});
    toast.success("All notifications marked as read");
  };

  const handleClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead({ notificationId: notif._id });
    }
    if (notif.linkTo) {
      navigate(notif.linkTo);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notifId: any) => {
    e.stopPropagation();
    await deleteNotif({ notificationId: notifId });
    toast.success("Notification deleted");
  };

  const handleTogglePref = async (key: string, value: boolean) => {
    if (!preferences) return;
    await updatePrefs({
      eventReminders: key === "eventReminders" ? value : (preferences.eventReminders ?? true),
      announcements: key === "announcements" ? value : (preferences.announcements ?? true),
      prayerUpdates: key === "prayerUpdates" ? value : (preferences.prayerUpdates ?? true),
      givingReceipts: key === "givingReceipts" ? value : (preferences.givingReceipts ?? true),
      groupMessages: key === "groupMessages" ? value : (preferences.groupMessages ?? true),
      lifeEvents: key === "lifeEvents" ? value : (preferences.lifeEvents ?? true),
      crisisAlerts: key === "crisisAlerts" ? value : (preferences.crisisAlerts ?? true),
      emailNotifications: key === "emailNotifications" ? value : (preferences.emailNotifications ?? true),
      pushNotifications: key === "pushNotifications" ? value : (preferences.pushNotifications ?? true),
    });
    toast.success("Preferences updated");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="size-6" /> Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unread.length > 0 ? `${unread.length} unread notification${unread.length !== 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="size-4 mr-2" />Mark All Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">
            Notifications {unread.length > 0 && `(${unread.length})`}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings2 className="size-4 mr-1" />Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "event_reminder", label: "Events" },
              { key: "announcement", label: "Announcements" },
              { key: "prayer_update", label: "Prayers" },
              { key: "giving_receipt", label: "Giving" },
              { key: "crisis_alert", label: "Crisis" },
            ].map((f) => (
              <Button
                key={f.key} size="sm"
                variant={filter === f.key ? "default" : "outline"}
                className="whitespace-nowrap text-xs"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Notification List */}
          <div className="space-y-2">
            {(filtered ?? []).map((n: any) => {
              const Icon = typeIcons[n.type] ?? Bell;
              const color = typeColors[n.type] ?? "text-gray-500";
              return (
                <Card
                  key={n._id}
                  className={`cursor-pointer transition-all hover:shadow-md ${!n.isRead ? "border-l-4 border-l-primary bg-primary/5" : "opacity-80"}`}
                  onClick={() => handleClick(n)}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className={`mt-0.5 ${color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}>{n.title}</h4>
                        {!n.isRead && <div className="size-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{typeLabels[n.type] ?? n.type}</Badge>
                        <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDelete(e, n._id)}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {(filtered ?? []).length === 0 && (
              <div className="text-center py-12">
                <BellOff className="size-12 text-muted-foreground/50 mx-auto" />
                <p className="text-muted-foreground mt-2">
                  {filter === "unread" ? "No unread notifications" : "No notifications"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "eventReminders", label: "Event Reminders", desc: "Upcoming services, Bible studies, and gatherings", icon: Calendar },
                { key: "announcements", label: "Announcements", desc: "Church-wide announcements and updates", icon: Megaphone },
                { key: "prayerUpdates", label: "Prayer Updates", desc: "Prayer request updates and answered prayers", icon: Heart },
                { key: "givingReceipts", label: "Giving Receipts", desc: "Confirmations for tithes, offerings, and donations", icon: DollarSign },
                { key: "groupMessages", label: "Group Messages", desc: "New posts in your groups and ministries", icon: Users },
                { key: "lifeEvents", label: "Life Events", desc: "Births, weddings, memorials, and celebrations", icon: Gift },
                { key: "crisisAlerts", label: "Crisis Alerts", desc: "Urgent alerts from the Crisis Team", icon: AlertTriangle },
              ].map(({ key, label, desc, icon: PrefIcon }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <PrefIcon className="size-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences ? (preferences as any)[key] !== false : true}
                    onCheckedChange={(checked) => handleTogglePref(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={preferences ? (preferences as any).emailNotifications !== false : true}
                  onCheckedChange={(checked) => handleTogglePref("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch
                  checked={preferences ? (preferences as any).pushNotifications !== false : true}
                  onCheckedChange={(checked) => handleTogglePref("pushNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
