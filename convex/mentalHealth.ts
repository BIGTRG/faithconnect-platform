import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listResources = query({
  args: { churchId: v.id("churches"), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category && args.category !== "all") {
      return await ctx.db
        .query("mentalHealthResources")
        .withIndex("by_church_category", (q) =>
          q.eq("churchId", args.churchId).eq("category", args.category as any),
        )
        .collect();
    }
    return await ctx.db
      .query("mentalHealthResources")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
  },
});

export const addResource = mutation({
  args: {
    churchId: v.id("churches"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("anxiety"),
      v.literal("depression"),
      v.literal("grief"),
      v.literal("addiction"),
      v.literal("ptsd"),
      v.literal("eating_disorder"),
      v.literal("adhd"),
      v.literal("bipolar"),
      v.literal("ocd"),
      v.literal("anger"),
      v.literal("self_harm"),
      v.literal("general"),
    ),
    type: v.union(
      v.literal("article"),
      v.literal("video"),
      v.literal("hotline"),
      v.literal("app"),
      v.literal("workbook"),
      v.literal("support_group"),
    ),
    url: v.optional(v.string()),
    phone: v.optional(v.string()),
    isFree: v.boolean(),
    isFaithBased: v.boolean(),
    createdBy: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mentalHealthResources", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listAssessments = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("selfAssessments")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();
  },
});

export const submitAssessment = mutation({
  args: {
    churchId: v.id("churches"),
    memberId: v.id("members"),
    type: v.union(
      v.literal("anxiety"),
      v.literal("depression"),
      v.literal("stress"),
      v.literal("burnout"),
      v.literal("grief"),
      v.literal("relationship"),
    ),
    score: v.number(),
    severity: v.union(v.literal("low"), v.literal("moderate"), v.literal("high"), v.literal("severe")),
    responses: v.optional(v.array(v.number())),
    recommendations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("selfAssessments", {
      ...args,
      takenAt: Date.now(),
    });
  },
});
