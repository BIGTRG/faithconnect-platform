import { useMutation, useQuery } from "convex/react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Server,
  Shield,
  XCircle,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentMember } from "@/hooks/useCurrentMember";

export function PlatformHealthPage() {
  const member = useCurrentMember();
  const health = useQuery(api.errorTracking.getPlatformHealth);
  const errorLogs = useQuery(api.errorTracking.getErrorLogs, { limit: 50 });
  const resolveError = useMutation(api.errorTracking.resolveError);

  if (!member) return null;
  if (member.role !== "admin" && member.role !== "pastor") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Shield className="size-12 mx-auto text-muted-foreground/30" />
          <h2 className="text-lg font-semibold">Access Restricted</h2>
          <p className="text-sm text-muted-foreground">
            Platform health is only accessible to administrators.
          </p>
        </div>
      </div>
    );
  }

  if (!health)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin size-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );

  const statusColor =
    health.status === "healthy"
      ? "text-emerald-600"
      : health.status === "degraded"
        ? "text-amber-600"
        : "text-red-600";
  const statusBg =
    health.status === "healthy"
      ? "bg-emerald-50 border-emerald-200"
      : health.status === "degraded"
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="size-7 text-indigo-600" />
          Platform Health
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time system monitoring, error tracking, and service status
        </p>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`border ${statusBg}`}>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">{health.healthScore}</p>
            <p className={`text-sm font-medium capitalize ${statusColor}`}>
              {health.status}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Health Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-emerald-600">
              {health.uptimePercent}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Uptime (7 days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold">{health.last24h.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Events (24h)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-amber-600">
              {health.unresolvedCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Unresolved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Status</CardTitle>
            <CardDescription>Real-time status of all platform services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(
                health.services as Array<{
                  name: string;
                  status: string;
                  latency: number;
                }>
              ).map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-2 rounded-full ${
                        service.status === "operational"
                          ? "bg-emerald-500"
                          : service.status === "degraded"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {service.latency}ms
                    </span>
                    <span
                      className={`text-xs font-medium capitalize ${
                        service.status === "operational"
                          ? "text-emerald-600"
                          : service.status === "degraded"
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Error Trend (7 Days)</CardTitle>
            <CardDescription>Daily error and warning counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-end gap-2">
              {(
                health.errorTrend as Array<{
                  day: string;
                  errors: number;
                  warnings: number;
                }>
              ).map((day, idx) => {
                const maxVal = Math.max(
                  ...health.errorTrend.map(
                    (d: { errors: number; warnings: number }) => d.errors + d.warnings,
                  ),
                  1,
                );
                const total = day.errors + day.warnings;
                const h = Math.max(4, (total / maxVal) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{total}</span>
                    <div className="w-full flex flex-col" style={{ height: `${h}%` }}>
                      {day.errors > 0 && (
                        <div
                          className="w-full bg-red-400 rounded-t"
                          style={{
                            height: `${(day.errors / total) * 100}%`,
                          }}
                        />
                      )}
                      {day.warnings > 0 && (
                        <div
                          className={`w-full bg-amber-400 ${day.errors === 0 ? "rounded-t" : ""}`}
                          style={{
                            height: `${(day.warnings / total) * 100}%`,
                          }}
                        />
                      )}
                      {total === 0 && (
                        <div className="w-full bg-emerald-200 rounded-t h-1" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{day.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-red-400" />
                <span className="text-xs text-muted-foreground">Errors</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-amber-400" />
                <span className="text-xs text-muted-foreground">Warnings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Error Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Error Sources</CardTitle>
            <CardDescription>Most frequent error origins (7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(health.topSources as Array<{ source: string; count: number }>).map(
                (src) => {
                  const maxCount = Math.max(
                    ...health.topSources.map((s: { count: number }) => s.count),
                    1,
                  );
                  return (
                    <div key={src.source} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono">{src.source}</span>
                        <span className="font-medium">{src.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${(src.count / maxCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
              {health.topSources.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No errors recorded
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 24h Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last 24 Hours</CardTitle>
            <CardDescription>Event severity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-red-50 text-center">
                <XCircle className="size-5 mx-auto text-red-500 mb-1" />
                <p className="text-2xl font-bold text-red-600">
                  {health.last24h.critical}
                </p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 text-center">
                <AlertTriangle className="size-5 mx-auto text-orange-500 mb-1" />
                <p className="text-2xl font-bold text-orange-600">
                  {health.last24h.errors}
                </p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 text-center">
                <Eye className="size-5 mx-auto text-amber-500 mb-1" />
                <p className="text-2xl font-bold text-amber-600">
                  {health.last24h.warnings}
                </p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50 text-center">
                <Clock className="size-5 mx-auto text-indigo-500 mb-1" />
                <p className="text-2xl font-bold text-indigo-600">
                  {health.lastHour}
                </p>
                <p className="text-xs text-muted-foreground">Last Hour</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Error Log</CardTitle>
          <CardDescription>Latest platform events and errors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {errorLogs && errorLogs.length > 0 ? (
              (errorLogs as Array<Record<string, unknown>>).map(
                (log) => (
                  <div
                    key={log._id as string}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      log.resolved ? "bg-muted/30 opacity-60" : ""
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {log.severity === "critical" ? (
                        <XCircle className="size-4 text-red-600" />
                      ) : log.severity === "error" ? (
                        <AlertTriangle className="size-4 text-orange-500" />
                      ) : log.severity === "warning" ? (
                        <Eye className="size-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="size-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            log.severity === "critical"
                              ? "bg-red-100 text-red-700"
                              : log.severity === "error"
                                ? "bg-orange-100 text-orange-700"
                                : log.severity === "warning"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {String(log.severity)}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {String(log.source)}
                        </span>
                        {Boolean(log.resolved) && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1">{String(log.message)}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(log.createdAt as number).toLocaleString()}
                      </p>
                    </div>
                    {!log.resolved &&
                      (log.severity === "error" || log.severity === "critical") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-xs"
                          onClick={() => resolveError({ errorId: log._id as never })}
                        >
                          Resolve
                        </Button>
                      )}
                  </div>
                ),
              )
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <Server className="size-8 mx-auto text-emerald-400" />
                  <p className="text-sm text-muted-foreground">
                    All systems operating normally
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlatformHealthPage;
