import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!member) return [];

    const targetYear = args.year ?? new Date().getFullYear();
    const all = await ctx.db
      .query("awards")
      .withIndex("by_church_year", (q) =>
        q.eq("churchId", member.churchId).eq("year", targetYear),
      )
      .order("desc")
      .take(100);

    const enriched = await Promise.all(
      all.map(async (award) => {
        const awardee = await ctx.db.get(award.memberId);
        return { ...award, memberName: awardee?.displayName ?? "Unknown" };
      }),
    );
    return enriched;
  },
});

export const getMyAwards = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!member) return [];
    return await ctx.db
      .query("awards")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .order("desc")
      .take(50);
  },
});

export const create = mutation({
  args: {
    memberId: v.id("members"),
    category: v.union(
      v.literal("top_giver"),
      v.literal("top_volunteer"),
      v.literal("top_attendance"),
      v.literal("most_prayers"),
      v.literal("community_hero"),
      v.literal("newcomer_welcome"),
      v.literal("ministry_mvp"),
      v.literal("custom"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    period: v.string(),
    year: v.number(),
    metric: v.optional(v.number()),
    metricLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!member) throw new Error("Member not found");
    return await ctx.db.insert("awards", {
      churchId: member.churchId,
      awardedBy: member._id,
      awardedAt: Date.now(),
      ...args,
    });
  },
});
