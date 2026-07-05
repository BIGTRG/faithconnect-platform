import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentMember = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    return member;
  },
});

export const getOrCreateMember = mutation({
  args: {
    displayName: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing;

    // Get or create the default church
    let church = await ctx.db.query("churches").first();
    if (!church) {
      const churchId = await ctx.db.insert("churches", {
        name: "My Church",
        timezone: "America/New_York",
        serviceSchedule: "Sundays at 10:00 AM",
      });
      church = await ctx.db.get(churchId);
    }

    const memberId = await ctx.db.insert("members", {
      userId,
      churchId: church!._id,
      role: "member",
      displayName: args.displayName,
      isActive: true,
      joinedAt: Date.now(),
      isNewcomer: true,
      newcomerStep: 1,
    });

    return await ctx.db.get(memberId);
  },
});

export const listMembers = query({
  args: { churchId: v.optional(v.id("churches")) },
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return [];

    return await ctx.db
      .query("members")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", member.churchId).eq("isActive", true),
      )
      .collect();
  },
});

export const getMember = query({
  args: { memberId: v.id("members") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.memberId);
  },
});

export const updateProfile = mutation({
  args: {
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    birthday: v.optional(v.string()),
    address: v.optional(v.string()),
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

    await ctx.db.patch(member._id, args);
    return null;
  },
});

export const getMemberStats = query({
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

    const allMembers = await ctx.db
      .query("members")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", member.churchId).eq("isActive", true),
      )
      .collect();

    const groups = await ctx.db
      .query("groups")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .collect();

    const activeGroups = groups.filter((g) => g.isActive);

    const activePrayers = await ctx.db
      .query("prayerRequests")
      .withIndex("by_church_answered", (q) =>
        q.eq("churchId", member.churchId).eq("isAnswered", false),
      )
      .collect();

    const events = await ctx.db
      .query("events")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .collect();
    const upcomingEvents = events.filter((e) => e.startTime > Date.now());

    return {
      totalMembers: allMembers.length,
      activeGroups: activeGroups.length,
      activePrayers: activePrayers.length,
      upcomingEvents: upcomingEvents.length,
    };
  },
});
