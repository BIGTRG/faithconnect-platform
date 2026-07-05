import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { showAnswered: v.optional(v.boolean()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return [];

    const isAnswered = args.showAnswered ?? false;
    const requests = await ctx.db
      .query("prayerRequests")
      .withIndex("by_church_answered", (q) =>
        q.eq("churchId", member.churchId).eq("isAnswered", isAnswered),
      )
      .order("desc")
      .take(100);

    const withNames = await Promise.all(
      requests.map(async (r) => {
        if (r.isAnonymous) {
          return { ...r, memberName: "Anonymous", currentMemberId: member._id };
        }
        const requestMember = await ctx.db.get(r.memberId);
        return {
          ...r,
          memberName: requestMember?.displayName ?? "Unknown",
          currentMemberId: member._id,
        };
      }),
    );

    return withNames;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    isAnonymous: v.boolean(),
    category: v.union(
      v.literal("health"),
      v.literal("family"),
      v.literal("financial"),
      v.literal("spiritual"),
      v.literal("work"),
      v.literal("relationships"),
      v.literal("gratitude"),
      v.literal("other"),
    ),
  },
  returns: v.id("prayerRequests"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("prayerRequests", {
      churchId: member.churchId,
      memberId: member._id,
      title: args.title,
      content: args.content,
      isAnonymous: args.isAnonymous,
      isAnswered: false,
      prayerCount: 0,
      category: args.category,
    });
  },
});

export const pray = mutation({
  args: { prayerRequestId: v.id("prayerRequests") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const existing = await ctx.db
      .query("prayerPartners")
      .withIndex("by_prayerRequestId", (q) =>
        q.eq("prayerRequestId", args.prayerRequestId),
      )
      .collect();

    const alreadyPrayed = existing.find((p) => p.memberId === member._id);
    if (alreadyPrayed) return null;

    await ctx.db.insert("prayerPartners", {
      prayerRequestId: args.prayerRequestId,
      memberId: member._id,
      prayedAt: Date.now(),
    });

    const request = await ctx.db.get(args.prayerRequestId);
    if (request) {
      await ctx.db.patch(args.prayerRequestId, {
        prayerCount: request.prayerCount + 1,
      });
    }

    return null;
  },
});

export const markAnswered = mutation({
  args: {
    id: v.id("prayerRequests"),
    answeredNote: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isAnswered: true,
      answeredNote: args.answeredNote,
      answeredAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("prayerRequests") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Delete associated prayer partners
    const partners = await ctx.db
      .query("prayerPartners")
      .withIndex("by_prayerRequestId", (q) => q.eq("prayerRequestId", args.id))
      .collect();
    for (const p of partners) {
      await ctx.db.delete(p._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
