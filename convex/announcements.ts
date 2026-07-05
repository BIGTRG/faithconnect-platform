import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return [];

    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(50);

    const withAuthors = await Promise.all(
      announcements.map(async (a) => {
        const author = await ctx.db.get(a.authorId);
        return { ...a, authorName: author?.displayName ?? "Unknown" };
      }),
    );

    return withAuthors;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("event"),
      v.literal("urgent"),
      v.literal("ministry"),
      v.literal("youth"),
      v.literal("missions"),
    ),
    isPinned: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("announcements"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("announcements", {
      churchId: member.churchId,
      authorId: member._id,
      title: args.title,
      content: args.content,
      category: args.category,
      isPinned: args.isPinned ?? false,
      imageUrl: args.imageUrl,
      publishedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("announcements") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
    return null;
  },
});

export const togglePin = mutation({
  args: { id: v.id("announcements") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const a = await ctx.db.get(args.id);
    if (!a) throw new Error("Not found");
    await ctx.db.patch(args.id, { isPinned: !a.isPinned });
    return null;
  },
});
