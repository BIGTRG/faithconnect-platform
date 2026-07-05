import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getWelcomeVideos = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("welcomeVideos")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
  },
});

export const getOnboardingProgress = query({
  args: { churchId: v.id("churches"), memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memberOnboardingProgress")
      .withIndex("by_church_member", (q) =>
        q.eq("churchId", args.churchId).eq("memberId", args.memberId)
      )
      .first();
  },
});

export const getKeyLeaders = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const leaders = await ctx.db
      .query("members")
      .withIndex("by_church_role", (q) => q.eq("churchId", args.churchId))
      .collect();
    return leaders.filter(
      (m) => m.role === "pastor" || m.role === "leader" || m.role === "admin"
    );
  },
});

export const startOnboarding = mutation({
  args: { churchId: v.id("churches"), memberId: v.id("members") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("memberOnboardingProgress")
      .withIndex("by_church_member", (q) =>
        q.eq("churchId", args.churchId).eq("memberId", args.memberId)
      )
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("memberOnboardingProgress", {
      churchId: args.churchId,
      memberId: args.memberId,
      step: 1,
      stepsCompleted: [],
      welcomeVideoWatched: false,
      metKeyLeaders: false,
      calendarReviewed: false,
      groupJoined: false,
      firstGift: false,
      profileComplete: false,
      startedAt: Date.now(),
    });
  },
});

export const completeStep = mutation({
  args: { progressId: v.id("memberOnboardingProgress"), stepName: v.string() },
  handler: async (ctx, args) => {
    const progress = await ctx.db.get(args.progressId);
    if (!progress) return;
    const steps = progress.stepsCompleted.includes(args.stepName)
      ? progress.stepsCompleted
      : [...progress.stepsCompleted, args.stepName];
    const updates: Record<string, boolean | string[] | number | undefined> = { stepsCompleted: steps };
    if (args.stepName === "welcome_video") updates.welcomeVideoWatched = true;
    if (args.stepName === "met_leaders") updates.metKeyLeaders = true;
    if (args.stepName === "calendar_review") updates.calendarReviewed = true;
    if (args.stepName === "join_group") updates.groupJoined = true;
    if (args.stepName === "first_gift") updates.firstGift = true;
    if (args.stepName === "profile") updates.profileComplete = true;
    if (steps.length >= 6) updates.completedAt = Date.now();
    await ctx.db.patch(args.progressId, updates);
  },
});
