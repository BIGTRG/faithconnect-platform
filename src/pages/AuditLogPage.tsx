import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import {
  ClipboardList,
  Shield,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useState } from "react";

const actionColors: Record<string, string> = {
  role_change: "bg-purple-100 text-purple-800",
  member_deactivate: "bg-red-100 text-red-800",
  giving_processed: "bg-green-100 text-green-800",
  profile_update: "bg-blue-100 text-blue-800",
  notification_broadcast: "bg-amber-100 text-amber-800",
  config_update: "bg-indigo-100 text-indigo-800",
  event_created: "bg-teal-100 text-teal-800",
  crisis_dispatch: "bg-orange-100 text-orange-800",
  login: "bg-gray-100 text-gray-800",
};

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AuditLogPage() {
  const member = useCurrentMember();
  const logs = useQuery(
    api.auditLog.getAuditLogs,
    member?.churchId ? { churchId: member.churchId } : "skip"
  ) as any;
  const [filterAction, setFilterAction] = useState<string>("all");

  if (!member) return <PageSkeleton />;

  if (member.role !== "admin" && member.role !== "pastor") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Access Restricted</h3>
            <p className="text-sm text-muted-foreground">
              Audit logs are only accessible to administrators and pastors.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!logs) return <PageSkeleton />;

  const uniqueActions = [...new Set((logs as any[]).map((l: any) => l.action))];
  const filtered =
    filterAction === "all"
      ? logs
      : (logs as any[]).filter((l: any) => l.action === filterAction);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-indigo-600" />
          Audit Log
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all administrative actions across your church
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{(logs as any[]).length}</p>
            <p className="text-xs text-muted-foreground">Total Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{uniqueActions.length}</p>
            <p className="text-xs text-muted-foreground">Action Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">
              {new Set((logs as any[]).map((l: any) => l.actorName)).size}
            </p>
            <p className="text-xs text-muted-foreground">Active Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">
              {(logs as any[]).filter(
                (l: any) => l.timestamp > Date.now() - 24 * 60 * 60 * 1000
              ).length}
            </p>
            <p className="text-xs text-muted-foreground">Last 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => setFilterAction("all")}
          className={`px-3 py-1 rounded-full text-sm ${filterAction === "all" ? "bg-indigo-600 text-white" : "bg-muted"}`}
        >
          All
        </button>
        {uniqueActions.map((action) => (
          <button
            key={action}
            onClick={() => setFilterAction(action)}
            className={`px-3 py-1 rounded-full text-sm ${filterAction === action ? "bg-indigo-600 text-white" : "bg-muted"}`}
          >
            {(action as string).replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {(filtered as any[]).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No audit log entries yet. Actions will appear here as admins perform them.
            </p>
          ) : (
            <div className="space-y-1">
              {(filtered as any[]).map((log: any) => (
                <div
                  key={log._id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-0"
                >
                  <div className="mt-0.5">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.actorName}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${actionColors[log.action] ?? "bg-gray-100 text-gray-800"}`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {log.details}
                      </p>
                    )}
                    {log.targetType && (
                      <p className="text-xs text-muted-foreground">
                        Target: {log.targetType}
                        {log.targetId ? ` (${log.targetId.slice(0, 12)}...)` : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
