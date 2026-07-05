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

    const testimonies = await ctx.db
      .query("testimonies")
      .withIndex("by_church_approved", (q) =>
        q.eq("churchId", member.churchId).eq("isApproved", true),
      )
      .order("desc")
      .take(50);

    const withNames = await Promise.all(
      testimonies.map(async (t) => {
        const m = await ctx.db.get(t.memberId);
        return { ...t, memberName: m?.displayName ?? "Anonymous" };
      }),
    );

    return withNames;
  },
});

export const listPending = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member || (member.role !== "admin" && member.role !== "pastor")) return [];

    const testimonies = await ctx.db
      .query("testimonies")
      .withIndex("by_church_approved", (q) =>
        q.eq("churchId", member.churchId).eq("isApproved", false),
      )
      .collect();

    const withNames = await Promise.all(
      testimonies.map(async (t) => {
        const m = await ctx.db.get(t.memberId);
        return { ...t, memberName: m?.displayName ?? "Anonymous" };
      }),
    );

    return withNames;
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  returns: v.id("testimonies"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("testimonies", {
      churchId: member.churchId,
      memberId: member._id,
      content: args.content,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      isApproved: false,
    });
  },
});

export const approve = mutation({
  args: { id: v.id("testimonies") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    await ctx.db.patch(args.id, {
      isApproved: true,
      approvedBy: member._id,
      approvedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("testimonies") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
