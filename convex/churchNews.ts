import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { category: v.optional(v.string()) },
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

    let news;
    if (args.category) {
      news = await ctx.db
        .query("churchNews")
        .withIndex("by_church_category", (q) =>
          q.eq("churchId", member.churchId).eq("category", args.category as "local" | "national" | "global" | "ministry" | "missions" | "culture"),
        )
        .order("desc")
        .take(50);
    } else {
      news = await ctx.db
        .query("churchNews")
        .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
        .order("desc")
        .take(50);
    }
    return news;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    content: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    category: v.union(
      v.literal("local"),
      v.literal("national"),
      v.literal("global"),
      v.literal("ministry"),
      v.literal("missions"),
      v.literal("culture"),
    ),
    isBreaking: v.boolean(),
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
    return await ctx.db.insert("churchNews", {
      churchId: member.churchId,
      createdBy: member._id,
      publishedAt: Date.now(),
      ...args,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("churchNews") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
