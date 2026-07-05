import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Church,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Shield,
  Activity,
  BarChart3,
  Globe,
  Zap,
  UserPlus,
  Building2,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`size-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    free: "bg-gray-100 text-gray-600",
    starter: "bg-blue-100 text-blue-700",
    growth: "bg-purple-100 text-purple-700",
    enterprise: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[tier] || styles.free}`}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

export function SuperAdminPage() {
  const stats = useQuery(api.superAdmin.getPlatformStats);
  const churches = useQuery(api.superAdmin.getAllChurches);
  const toggleActive = useMutation(api.superAdmin.toggleChurchActive);
  const updateTier = useMutation(api.superAdmin.updateChurchTier);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  const filtered = (churches || []).filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "all" || (c.subscriptionTier || "free") === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Shield className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FaithConnect Platform Admin</h1>
                <p className="text-slate-300 text-sm">Multi-Church Management Console</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg text-sm flex items-center gap-2">
                <Activity className="size-4 text-green-400" />
                All Systems Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Churches"
            value={stats?.totalChurches ?? "..."}
            icon={Church}
            color="bg-indigo-100 text-indigo-600"
            sub={`${stats?.recentChurches ?? 0} new this month`}
          />
          <StatCard
            label="Total Members"
            value={stats ? stats.totalMembers.toLocaleString() : "..."}
            icon={Users}
            color="bg-blue-100 text-blue-600"
            sub={`${stats?.recentMembers ?? 0} joined this month`}
          />
          <StatCard
            label="Platform Revenue"
            value={stats ? `$${stats.totalRevenue.toLocaleString()}` : "..."}
            icon={DollarSign}
            color="bg-green-100 text-green-600"
            sub={`${stats?.totalGivingTransactions ?? 0} transactions`}
          />
          <StatCard
            label="Total Events"
            value={stats?.totalEvents ?? "..."}
            icon={Calendar}
            color="bg-amber-100 text-amber-600"
            sub={`${stats?.totalGroups ?? 0} active groups`}
          />
        </div>

        {/* Tier Distribution */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(["free", "starter", "growth", "enterprise"] as const).map((tier) => {
              const count = stats.tierCounts[tier] || 0;
              const icons = { free: Globe, starter: Zap, growth: TrendingUp, enterprise: Building2 };
              const colors = {
                free: "bg-gray-100 text-gray-600",
                starter: "bg-blue-100 text-blue-600",
                growth: "bg-purple-100 text-purple-600",
                enterprise: "bg-amber-100 text-amber-600",
              };
              const TierIcon = icons[tier];
              return (
                <div key={tier} className="bg-white rounded-xl border p-4 flex items-center gap-3">
                  <div className={`size-10 rounded-lg flex items-center justify-center ${colors[tier]}`}>
                    <TierIcon className="size-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{count}</div>
                    <div className="text-xs text-gray-500 capitalize">{tier} Tier</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Church List */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Churches</h2>
              <p className="text-sm text-gray-500">{filtered.length} churches on platform</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search churches..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Church</th>
                  <th className="px-5 py-3 text-left">Location</th>
                  <th className="px-5 py-3 text-center">Members</th>
                  <th className="px-5 py-3 text-center">Events</th>
                  <th className="px-5 py-3 text-center">Groups</th>
                  <th className="px-5 py-3 text-right">Giving</th>
                  <th className="px-5 py-3 text-center">Tier</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((church) => (
                  <tr key={church._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: church.primaryColor || "#4338ca" }}
                        >
                          {church.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{church.name}</div>
                          <div className="text-xs text-gray-400">{church.denomination || "---"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {church.city && church.state
                        ? `${church.city}, ${church.state}`
                        : church.city || church.state || "---"}
                    </td>
                    <td className="px-5 py-4 text-sm text-center font-medium">{church.totalMembers}</td>
                    <td className="px-5 py-4 text-sm text-center">{church.eventCount}</td>
                    <td className="px-5 py-4 text-sm text-center">{church.groupCount}</td>
                    <td className="px-5 py-4 text-sm text-right font-medium text-green-600">
                      ${church.totalGiving.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <TierBadge tier={church.subscriptionTier || "free"} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          church.isActive !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <div
                          className={`size-1.5 rounded-full ${church.isActive !== false ? "bg-green-500" : "bg-red-500"}`}
                        />
                        {church.isActive !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <select
                          value={church.subscriptionTier || "free"}
                          onChange={(e) =>
                            updateTier({
                              churchId: church._id as Id<"churches">,
                              tier: e.target.value as "free" | "starter" | "growth" | "enterprise",
                            })
                          }
                          className="text-xs px-2 py-1 rounded border bg-white"
                        >
                          <option value="free">Free</option>
                          <option value="starter">Starter</option>
                          <option value="growth">Growth</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                        <button
                          onClick={() =>
                            toggleActive({
                              churchId: church._id as Id<"churches">,
                              isActive: church.isActive === false,
                            })
                          }
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            church.isActive !== false
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {church.isActive !== false ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Church className="size-12 mx-auto mb-3 opacity-50" />
              <p>No churches found</p>
            </div>
          )}
        </div>

        {/* Platform Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-indigo-600" />
              Engagement
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prayer Requests</span>
                <span className="font-medium">{stats?.totalPrayers ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Groups</span>
                <span className="font-medium">{stats?.totalGroups ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Events Created</span>
                <span className="font-medium">{stats?.totalEvents ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserPlus className="size-4 text-green-600" />
              Growth (30 days)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Churches</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  +{stats?.recentChurches ?? 0}
                  <ArrowUpRight className="size-3" />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Members</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  +{stats?.recentMembers ?? 0}
                  <ArrowUpRight className="size-3" />
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="size-4 text-amber-600" />
              Revenue Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Processed</span>
                <span className="font-medium">${stats ? stats.totalRevenue.toLocaleString() : "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transactions</span>
                <span className="font-medium">{stats?.totalGivingTransactions ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg per Church</span>
                <span className="font-medium">
                  ${stats && stats.totalChurches > 0
                    ? Math.round(stats.totalRevenue / stats.totalChurches).toLocaleString()
                    : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
