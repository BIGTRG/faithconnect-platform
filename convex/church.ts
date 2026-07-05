import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return null;

    return await ctx.db.get(member.churchId);
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    pastorName: v.optional(v.string()),
    denomination: v.optional(v.string()),
    serviceSchedule: v.optional(v.string()),
    trgpayMerchantId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");
    if (member.role !== "admin" && member.role !== "pastor") {
      throw new Error("Only admins and pastors can update church settings");
    }

    await ctx.db.patch(member.churchId, args);
    return null;
  },
});

export const getDashboardData = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return null;

    const church = await ctx.db.get(member.churchId);

    // Recent announcements
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(5);

    const announcementsWithAuthors = await Promise.all(
      announcements.map(async (a) => {
        const author = await ctx.db.get(a.authorId);
        return { ...a, authorName: author?.displayName ?? "Unknown" };
      }),
    );

    // Upcoming events
    const events = await ctx.db
      .query("events")
      .withIndex("by_church_start", (q) =>
        q.eq("churchId", member.churchId).gte("startTime", Date.now()),
      )
      .order("asc")
      .take(5);

    // Active prayer requests
    const prayers = await ctx.db
      .query("prayerRequests")
      .withIndex("by_church_answered", (q) =>
        q.eq("churchId", member.churchId).eq("isAnswered", false),
      )
      .order("desc")
      .take(5);

    // Member count
    const members = await ctx.db
      .query("members")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", member.churchId).eq("isActive", true),
      )
      .collect();

    // Active alerts
    const alerts = await ctx.db
      .query("emergencyAlerts")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", member.churchId).eq("isActive", true),
      )
      .order("desc")
      .take(3);

    // Recent testimonies
    const testimonies = await ctx.db
      .query("testimonies")
      .withIndex("by_church_approved", (q) =>
        q.eq("churchId", member.churchId).eq("isApproved", true),
      )
      .order("desc")
      .take(3);

    const testimoniesWithNames = await Promise.all(
      testimonies.map(async (t) => {
        const m = await ctx.db.get(t.memberId);
        return { ...t, memberName: m?.displayName ?? "Anonymous" };
      }),
    );

    return {
      church,
      member,
      announcements: announcementsWithAuthors,
      events,
      prayers,
      memberCount: members.length,
      alerts,
      testimonies: testimoniesWithNames,
    };
  },
});
