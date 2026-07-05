import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getVerseOfDay = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const verse = await ctx.db
      .query("dailyVerses")
      .withIndex("by_church_date", (q) =>
        q.eq("churchId", args.churchId).eq("date", today)
      )
      .first();
    if (verse) return verse;
    // Return latest verse if today's not set
    const verses = await ctx.db
      .query("dailyVerses")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .order("desc")
      .take(1);
    return verses[0] ?? null;
  },
});

export const getReadingPlans = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bibleReadingPlans")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
  },
});

export const getMyReadingProgress = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bibleReadingProgress")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .collect();
  },
});

export const markDayComplete = mutation({
  args: { progressId: v.id("bibleReadingProgress"), day: v.number() },
  handler: async (ctx, args) => {
    const progress = await ctx.db.get(args.progressId);
    if (!progress) return;
    const completed = progress.completedDays.includes(args.day)
      ? progress.completedDays
      : [...progress.completedDays, args.day];
    await ctx.db.patch(args.progressId, {
      completedDays: completed,
      currentDay: Math.max(progress.currentDay, args.day + 1),
      lastReadAt: Date.now(),
    });
  },
});

export const joinPlan = mutation({
  args: { memberId: v.id("members"), planId: v.id("bibleReadingPlans") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bibleReadingProgress")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .collect();
    const alreadyJoined = existing.find((p) => p.planId === args.planId);
    if (alreadyJoined) return alreadyJoined._id;
    return await ctx.db.insert("bibleReadingProgress", {
      memberId: args.memberId,
      planId: args.planId,
      currentDay: 1,
      completedDays: [],
      startedAt: Date.now(),
      lastReadAt: Date.now(),
    });
  },
});
