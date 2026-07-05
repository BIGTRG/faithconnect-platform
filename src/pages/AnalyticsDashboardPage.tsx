import { useQuery } from "convex/react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  DollarSign,
  Heart,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsDashboardPage() {
  const member = useCurrentMember();
  const analytics = useQuery(
    api.analytics.getDashboardAnalytics,
    member?.churchId ? { churchId: member.churchId } : "skip",
  );
  const engagement = useQuery(
    api.analytics.getMemberEngagementBreakdown,
    member?.churchId ? { churchId: member.churchId } : "skip",
  );
  const snapshots = useQuery(
    api.analytics.getAnalyticsSnapshots,
    member?.churchId ? { churchId: member.churchId } : "skip",
  );

  if (!member) return null;
  if (!analytics)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin size-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="size-7 text-indigo-600" />
          Church Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Deep insights into your church's growth, engagement, and financials
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Members"
          value={analytics.overview.totalMembers}
          change={analytics.overview.newThisMonth}
          changeLabel="new this month"
          icon={Users}
          color="indigo"
        />
        <MetricCard
          label="Monthly Giving"
          value={`$${analytics.giving.totalThisMonth.toLocaleString()}`}
          change={analytics.giving.growthRate}
          changeLabel="vs last month"
          isPercent
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          label="Engagement Score"
          value={analytics.overview.engagementScore}
          suffix="/100"
          icon={Zap}
          color="amber"
        />
        <MetricCard
          label="Active Members"
          value={analytics.overview.activeMembers}
          subtext={`${Math.round((analytics.overview.activeMembers / Math.max(1, analytics.overview.totalMembers)) * 100)}% of total`}
          icon={Heart}
          color="rose"
        />
      </div>

      {/* Giving Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Giving Trend (12 Weeks)</CardTitle>
          <CardDescription>Weekly giving totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-1">
            {analytics.giving.trend.map(
              (week: { week: string; amount: number }, idx: number) => {
                const maxAmount = Math.max(
                  ...analytics.giving.trend.map((w: { amount: number }) => w.amount),
                  1,
                );
                const height = Math.max(4, (week.amount / maxAmount) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-muted-foreground hidden md:block">
                      ${Math.round(week.amount / 1000)}k
                    </span>
                    <div
                      className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-default"
                      style={{ height: `${height}%` }}
                      title={`${week.week}: $${week.amount.toLocaleString()}`}
                    />
                    <span className="text-[9px] text-muted-foreground hidden lg:block truncate w-full text-center">
                      {week.week}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Giving Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giving by Category</CardTitle>
            <CardDescription>This month's giving breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.giving.byType as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .map(([type, amount]) => {
                  const total = analytics.giving.totalThisMonth || 1;
                  const pct = Math.round((amount / total) * 100);
                  const colors: Record<string, string> = {
                    tithe: "bg-indigo-500",
                    offering: "bg-amber-500",
                    mission: "bg-emerald-500",
                    building: "bg-blue-500",
                    benevolence: "bg-rose-500",
                    campaign: "bg-purple-500",
                  };
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type}</span>
                        <span className="font-medium">${amount.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[type] ?? "bg-slate-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(analytics.giving.byType).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No giving data this month
                </p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Avg Gift</p>
                <p className="text-lg font-bold">${analytics.giving.averageGift}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Donors</p>
                <p className="text-lg font-bold">{analytics.giving.uniqueDonors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Member Engagement</CardTitle>
            <CardDescription>Engagement levels across your congregation</CardDescription>
          </CardHeader>
          <CardContent>
            {engagement ? (
              <div className="space-y-4">
                <EngagementBar
                  label="High Engagement"
                  count={engagement.high}
                  total={engagement.total}
                  color="bg-emerald-500"
                  description="Active givers with consistent participation"
                />
                <EngagementBar
                  label="Medium Engagement"
                  count={engagement.medium}
                  total={engagement.total}
                  color="bg-amber-500"
                  description="Recent givers or newcomers"
                />
                <EngagementBar
                  label="Low Engagement"
                  count={engagement.low}
                  total={engagement.total}
                  color="bg-orange-400"
                  description="Active but not giving this month"
                />
                <EngagementBar
                  label="Inactive"
                  count={engagement.inactive}
                  total={engagement.total}
                  color="bg-slate-300"
                  description="Not currently active"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin size-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Activity</CardTitle>
            <CardDescription>Groups, prayers, and social engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <StatBlock
                icon={Users}
                label="Active Groups"
                value={analytics.community.activeGroups}
                sub={`${analytics.community.totalGroups} total`}
              />
              <StatBlock
                icon={Heart}
                label="Prayer Requests"
                value={analytics.community.totalPrayers}
                sub={`${analytics.community.prayerAnswerRate}% answered`}
              />
              <StatBlock
                icon={MessageSquare}
                label="Social Posts"
                value={analytics.community.socialPosts}
                sub={`${analytics.community.postsThisMonth} this month`}
              />
              <StatBlock
                icon={Zap}
                label="Testimonies"
                value={analytics.community.testimonies}
                sub="shared"
              />
            </div>
          </CardContent>
        </Card>

        {/* Events & Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events Overview</CardTitle>
            <CardDescription>Upcoming and recent events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-indigo-50">
                <Calendar className="size-5 mx-auto text-indigo-600 mb-1" />
                <p className="text-2xl font-bold text-indigo-700">
                  {analytics.events.upcoming}
                </p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50">
                <Calendar className="size-5 mx-auto text-emerald-600 mb-1" />
                <p className="text-2xl font-bold text-emerald-700">
                  {analytics.events.pastThisQuarter}
                </p>
                <p className="text-xs text-muted-foreground">Past 90 Days</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50">
                <Calendar className="size-5 mx-auto text-amber-600 mb-1" />
                <p className="text-2xl font-bold text-amber-700">
                  {analytics.events.totalEvents}
                </p>
                <p className="text-xs text-muted-foreground">All Time</p>
              </div>
            </div>

            {/* Weekly trend from snapshots */}
            {snapshots && snapshots.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Attendance Trend</p>
                <div className="h-24 flex items-end gap-1">
                  {snapshots
                    .slice()
                    .reverse()
                    .slice(0, 12)
                    .map(
                      (
                        snap: { averageAttendance: number; date: number },
                        idx: number,
                      ) => {
                        const maxAtt = Math.max(
                          ...snapshots.map(
                            (s: { averageAttendance: number }) => s.averageAttendance,
                          ),
                          1,
                        );
                        const h = Math.max(4, (snap.averageAttendance / maxAtt) * 100);
                        return (
                          <div
                            key={idx}
                            className="flex-1 bg-emerald-400 rounded-t hover:bg-emerald-500 transition-colors cursor-default"
                            style={{ height: `${h}%` }}
                            title={`Week ${idx + 1}: ${snap.averageAttendance} avg`}
                          />
                        );
                      },
                    )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Weekly average attendance (12 weeks)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Growth Summary</CardTitle>
          <CardDescription>Month-over-month performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GrowthMetric
              label="Member Growth"
              value={`${analytics.overview.memberGrowthRate > 0 ? "+" : ""}${analytics.overview.memberGrowthRate}%`}
              positive={analytics.overview.memberGrowthRate >= 0}
            />
            <GrowthMetric
              label="Giving Growth"
              value={`${analytics.giving.growthRate > 0 ? "+" : ""}${analytics.giving.growthRate}%`}
              positive={analytics.giving.growthRate >= 0}
            />
            <GrowthMetric
              label="Store Products"
              value={`${analytics.store.activeProducts}`}
              sub={`${analytics.store.totalProducts} total`}
              positive
            />
            <GrowthMetric
              label="Transactions"
              value={`${analytics.giving.transactionsThisMonth}`}
              sub="this month"
              positive
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  changeLabel,
  isPercent,
  suffix,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  isPercent?: boolean;
  suffix?: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    indigo: "bg-indigo-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    rose: "bg-rose-50",
  };
  const iconColorMap: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div
            className={`size-10 rounded-lg ${bgMap[color] ?? "bg-slate-50"} flex items-center justify-center`}
          >
            <Icon className={`size-5 ${iconColorMap[color] ?? ""}`} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">
            {value}
            {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {change !== undefined && (
            <p
              className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              {change >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {isPercent ? `${Math.abs(change)}%` : `+${change}`} {changeLabel}
            </p>
          )}
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function EngagementBar({
  label,
  count,
  total,
  color,
  description,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  description: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span>
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/30">
      <Icon className="size-5 mx-auto text-indigo-500 mb-1" />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function GrowthMetric({
  label,
  value,
  positive,
  sub,
}: {
  label: string;
  value: string;
  positive: boolean;
  sub?: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        {positive ? (
          <TrendingUp className="size-4 text-emerald-500" />
        ) : (
          <ArrowDown className="size-4 text-red-500" />
        )}
        <span
          className={`text-xl font-bold ${positive ? "text-emerald-600" : "text-red-500"}`}
        >
          {value}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
