import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getAllChurches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const churches = await ctx.db.query("churches").collect();

    const churchesWithStats = [];
    for (const church of churches) {
      const members = await ctx.db
        .query("members")
        .withIndex("by_churchId", (q) => q.eq("churchId", church._id))
        .collect();

      const activeMembers = members.filter((m) => m.isActive);
      const admins = members.filter((m) => m.role === "admin" || m.role === "pastor");

      const givingRecords = await ctx.db
        .query("givingRecords")
        .withIndex("by_churchId", (q) => q.eq("churchId", church._id))
        .collect();
      const totalGiving = givingRecords.reduce((sum, r) => sum + r.amount, 0);

      const events = await ctx.db
        .query("events")
        .withIndex("by_churchId", (q) => q.eq("churchId", church._id))
        .collect();

      const groups = await ctx.db
        .query("groups")
        .withIndex("by_churchId", (q) => q.eq("churchId", church._id))
        .collect();

      churchesWithStats.push({
        ...church,
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        adminCount: admins.length,
        totalGiving: totalGiving / 100,
        eventCount: events.length,
        groupCount: groups.length,
      });
    }

    return churchesWithStats;
  },
});

export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const churches = await ctx.db.query("churches").collect();
    const activeChurches = churches.filter((c) => c.isActive !== false);

    const allMembers = await ctx.db.query("members").collect();
    const activeMembers = allMembers.filter((m) => m.isActive);

    const allGiving = await ctx.db.query("givingRecords").collect();
    const totalRevenue = allGiving.reduce((sum, r) => sum + r.amount, 0) / 100;

    const allEvents = await ctx.db.query("events").collect();
    const allGroups = await ctx.db.query("groups").collect();
    const allPrayers = await ctx.db.query("prayerRequests").collect();

    // Churches by tier
    const tierCounts: Record<string, number> = { free: 0, starter: 0, growth: 0, enterprise: 0 };
    for (const c of churches) {
      const tier = c.subscriptionTier || "free";
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    }

    // Recent signups (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const recentChurches = churches.filter((c) => (c.createdAt || 0) > thirtyDaysAgo).length;
    const recentMembers = allMembers.filter((m) => m.joinedAt > thirtyDaysAgo).length;

    return {
      totalChurches: churches.length,
      activeChurches: activeChurches.length,
      totalMembers: allMembers.length,
      activeMembers: activeMembers.length,
      totalRevenue,
      totalEvents: allEvents.length,
      totalGroups: allGroups.length,
      totalPrayers: allPrayers.length,
      totalGivingTransactions: allGiving.length,
      tierCounts,
      recentChurches,
      recentMembers,
    };
  },
});

export const toggleChurchActive = mutation({
  args: { churchId: v.id("churches"), isActive: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { churchId, isActive }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(churchId, { isActive });
    return null;
  },
});

export const updateChurchTier = mutation({
  args: {
    churchId: v.id("churches"),
    tier: v.union(v.literal("free"), v.literal("starter"), v.literal("growth"), v.literal("enterprise")),
  },
  returns: v.null(),
  handler: async (ctx, { churchId, tier }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(churchId, { subscriptionTier: tier });
    return null;
  },
});
