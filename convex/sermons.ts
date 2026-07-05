import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { series: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return [];

    if (args.series) {
      return await ctx.db
        .query("sermons")
        .withIndex("by_church_series", (q) =>
          q.eq("churchId", member.churchId).eq("series", args.series),
        )
        .order("desc")
        .take(50);
    }

    return await ctx.db
      .query("sermons")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: { sermonId: v.id("sermons") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const sermon = await ctx.db.get(args.sermonId);
    if (!sermon) return null;

    const studyGuide = await ctx.db
      .query("studyGuides")
      .withIndex("by_sermonId", (q) => q.eq("sermonId", args.sermonId))
      .first();

    return { ...sermon, studyGuide };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    speaker: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    transcript: v.optional(v.string()),
    series: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    scripture: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  returns: v.id("sermons"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("sermons", {
      churchId: member.churchId,
      title: args.title,
      speaker: args.speaker,
      date: args.date,
      description: args.description,
      videoUrl: args.videoUrl,
      audioUrl: args.audioUrl,
      transcript: args.transcript,
      series: args.series,
      tags: args.tags,
      scripture: args.scripture,
      duration: args.duration,
      viewCount: 0,
    });
  },
});

export const incrementView = mutation({
  args: { sermonId: v.id("sermons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sermon = await ctx.db.get(args.sermonId);
    if (sermon) {
      await ctx.db.patch(args.sermonId, { viewCount: sermon.viewCount + 1 });
    }
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("sermons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const guides = await ctx.db
      .query("studyGuides")
      .withIndex("by_sermonId", (q) => q.eq("sermonId", args.id))
      .collect();
    for (const g of guides) {
      await ctx.db.delete(g._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
