import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Deep Church Analytics ───────────────────────────────────

export const getDashboardAnalytics = query({
  args: { churchId: v.id("churches") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 86400000;
    const sixtyDaysAgo = now - 60 * 86400000;
    const ninetyDaysAgo = now - 90 * 86400000;

    // Members
    const allMembers = await ctx.db
      .query("members")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
    const activeMembers = allMembers.filter((m) => m.isActive);
    const newThisMonth = allMembers.filter((m) => m.joinedAt && m.joinedAt >= thirtyDaysAgo);
    const newLastMonth = allMembers.filter(
      (m) => m.joinedAt && m.joinedAt >= sixtyDaysAgo && m.joinedAt < thirtyDaysAgo,
    );

    // Giving
    const allGiving = await ctx.db
      .query("givingRecords")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
    const givingThisMonth = allGiving.filter((g) => g.date >= thirtyDaysAgo);
    const givingLastMonth = allGiving.filter(
      (g) => g.date >= sixtyDaysAgo && g.date < thirtyDaysAgo,
    );
    const totalThisMonth = givingThisMonth.reduce((s, g) => s + g.amount, 0);
    const totalLastMonth = givingLastMonth.reduce((s, g) => s + g.amount, 0);

    // Giving by type
    const givingByType: Record<string, number> = {};
    for (const g of givingThisMonth) {
      givingByType[g.type] = (givingByType[g.type] ?? 0) + g.amount;
    }

    // Giving trend (last 12 weeks)
    const givingTrend: Array<{ week: string; amount: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = now - (i + 1) * 7 * 86400000;
      const weekEnd = now - i * 7 * 86400000;
      const weekGiving = allGiving.filter((g) => g.date >= weekStart && g.date < weekEnd);
      const weekLabel = new Date(weekStart).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      givingTrend.push({
        week: weekLabel,
        amount: weekGiving.reduce((s, g) => s + g.amount, 0),
      });
    }

    // Events
    const allEvents = await ctx.db
      .query("events")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
    const upcomingEvents = allEvents.filter((e) => e.startTime >= now);
    const pastEvents = allEvents.filter((e) => e.startTime < now && e.startTime >= ninetyDaysAgo);

    // Groups
    const allGroups = await ctx.db
      .query("groups")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();

    // Prayer requests
    const allPrayers = await ctx.db
      .query("prayerRequests")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
    const prayersThisMonth = allPrayers.filter((p) => p._creationTime >= thirtyDaysAgo);
    const answeredPrayers = allPrayers.filter((p) => p.isAnswered);

    // Social feed
    const allPosts = await ctx.db
      .query("socialPosts")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
    const postsThisMonth = allPosts.filter((p) => p.postedAt >= thirtyDaysAgo);

    // Testimonies
    const allTestimonies = await ctx.db
      .query("testimonies")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();

    // Store
    const storeProducts = await ctx.db
      .query("storeProducts")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();

    // Member engagement score (0-100)
    const engagementScore = Math.min(
      100,
      Math.round(
        (givingThisMonth.length * 5 +
          prayersThisMonth.length * 3 +
          postsThisMonth.length * 2 +
          upcomingEvents.length * 4) /
          Math.max(1, activeMembers.length) *
          10,
      ),
    );

    // Top givers this month (anonymized)
    const giverTotals: Record<string, number> = {};
    for (const g of givingThisMonth) {
      if (g.memberId) {
        const key = g.memberId.toString();
        giverTotals[key] = (giverTotals[key] ?? 0) + g.amount;
      }
    }
    const topGiverCount = Object.keys(giverTotals).length;

    // Growth rate
    const memberGrowthRate =
      newLastMonth.length > 0
        ? Math.round(((newThisMonth.length - newLastMonth.length) / newLastMonth.length) * 100)
        : newThisMonth.length > 0
          ? 100
          : 0;
    const givingGrowthRate =
      totalLastMonth > 0
        ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)
        : totalThisMonth > 0
          ? 100
          : 0;

    return {
      overview: {
        totalMembers: allMembers.length,
        activeMembers: activeMembers.length,
        newThisMonth: newThisMonth.length,
        memberGrowthRate,
        engagementScore,
      },
      giving: {
        totalThisMonth,
        totalLastMonth,
        growthRate: givingGrowthRate,
        transactionsThisMonth: givingThisMonth.length,
        uniqueDonors: topGiverCount,
        byType: givingByType,
        trend: givingTrend,
        averageGift:
          givingThisMonth.length > 0
            ? Math.round(totalThisMonth / givingThisMonth.length)
            : 0,
      },
      events: {
        upcoming: upcomingEvents.length,
        pastThisQuarter: pastEvents.length,
        totalEvents: allEvents.length,
      },
      community: {
        totalGroups: allGroups.length,
        activeGroups: allGroups.filter((g) => g.isActive).length,
        totalPrayers: allPrayers.length,
        answeredPrayers: answeredPrayers.length,
        prayerAnswerRate:
          allPrayers.length > 0
            ? Math.round((answeredPrayers.length / allPrayers.length) * 100)
            : 0,
        socialPosts: allPosts.length,
        postsThisMonth: postsThisMonth.length,
        testimonies: allTestimonies.length,
      },
      store: {
        totalProducts: storeProducts.length,
        activeProducts: storeProducts.filter((p) => p.isActive).length,
      },
    };
  },
});

export const getAnalyticsSnapshots = query({
  args: { churchId: v.id("churches") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analyticsSnapshots")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .order("desc")
      .take(52);
  },
});

export const getMemberEngagementBreakdown = query({
  args: { churchId: v.id("churches") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const members = await ctx.db
      .query("members")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 86400000;

    const giving = await ctx.db
      .query("givingRecords")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();

    const recentGivers = new Set(
      giving.filter((g) => g.date >= thirtyDaysAgo).map((g) => g.memberId?.toString()),
    );

    let highEngagement = 0;
    let mediumEngagement = 0;
    let lowEngagement = 0;
    let inactive = 0;

    for (const m of members) {
      if (!m.isActive) {
        inactive++;
        continue;
      }
      const isRecentGiver = recentGivers.has(m._id.toString());
      const isNewcomer = m.joinedAt && m.joinedAt >= thirtyDaysAgo;

      if (isRecentGiver && !isNewcomer) {
        highEngagement++;
      } else if (isRecentGiver || isNewcomer) {
        mediumEngagement++;
      } else {
        lowEngagement++;
      }
    }

    return {
      high: highEngagement,
      medium: mediumEngagement,
      low: lowEngagement,
      inactive,
      total: members.length,
    };
  },
});
