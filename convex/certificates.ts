import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listMy = query({
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
      .query("certificates")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .order("desc")
      .take(50);
  },
});

export const listAll = query({
  args: { type: v.optional(v.string()) },
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
    if (args.type) {
      return await ctx.db
        .query("certificates")
        .withIndex("by_church_type", (q) =>
          q.eq("churchId", member.churchId).eq("type", args.type as "baptism" | "membership" | "bible_study" | "volunteer_milestone" | "leadership" | "missions" | "custom"),
        )
        .order("desc")
        .take(100);
    }
    return await ctx.db
      .query("certificates")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(100);
  },
});

export const issue = mutation({
  args: {
    memberId: v.id("members"),
    type: v.union(
      v.literal("baptism"),
      v.literal("membership"),
      v.literal("bible_study"),
      v.literal("volunteer_milestone"),
      v.literal("leadership"),
      v.literal("missions"),
      v.literal("custom"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.string()),
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
    const certNum = `FC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return await ctx.db.insert("certificates", {
      churchId: member.churchId,
      memberId: args.memberId,
      type: args.type,
      title: args.title,
      description: args.description,
      metadata: args.metadata,
      issuedAt: Date.now(),
      issuedBy: member._id,
      certificateNumber: certNum,
      isShared: false,
    });
  },
});

export const toggleShare = mutation({
  args: { id: v.id("certificates") },
  handler: async (ctx, args) => {
    const cert = await ctx.db.get(args.id);
    if (!cert) throw new Error("Certificate not found");
    await ctx.db.patch(args.id, { isShared: !cert.isShared });
  },
});
