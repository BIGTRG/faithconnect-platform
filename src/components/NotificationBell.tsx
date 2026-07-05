import { useQuery, useMutation } from "convex/react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "./ui/popover";

const typeIcons: Record<string, string> = {
  event_reminder: "📅",
  announcement: "📢",
  prayer_update: "🙏",
  giving_receipt: "💝",
  group_message: "👥",
  life_event: "🎉",
  crisis_alert: "🚨",
  welcome: "✨",
  general: "🔔",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export function NotificationBell() {
  const unreadCount = useQuery(api.notificationsBackend.getUnreadCount);
  const notifications = useQuery(api.notificationsBackend.getMyNotifications);
  const markAsRead = useMutation(api.notificationsBackend.markAsRead);
  const navigate = useNavigate();

  const recent = (notifications ?? []).slice(0, 8);
  const count = typeof unreadCount === "number" ? unreadCount : 0;

  const handleClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead({ notificationId: notif._id });
    }
    if (notif.linkTo) {
      navigate(notif.linkTo);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="size-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {count > 0 && <span className="text-xs text-muted-foreground">{count} unread</span>}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {recent.length > 0 ? (
            recent.map((n: any) => (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                className={`w-full text-left p-3 hover:bg-muted/50 border-b last:border-0 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{typeIcons[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm truncate ${!n.isRead ? "font-semibold" : ""}`}>{n.title}</span>
                      {!n.isRead && <span className="size-1.5 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button variant="ghost" className="w-full text-sm h-8" onClick={() => navigate("/notifications")}>
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
