import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) return [];
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) return [];
    if (args.type) {
      return await ctx.db.query("lifeEvents").withIndex("by_church_type", (q) => q.eq("churchId", member.churchId).eq("type", args.type as any)).order("desc").take(50);
    }
    return await ctx.db.query("lifeEvents").withIndex("by_churchId", (q) => q.eq("churchId", member.churchId)).order("desc").take(50);
  },
});

export const create = mutation({
  args: {
    type: v.union(
      v.literal("death"), v.literal("birth"), v.literal("marriage"),
      v.literal("baptism"), v.literal("graduation"), v.literal("hospital"),
      v.literal("anniversary"), v.literal("other"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    personName: v.string(),
    eventDate: v.number(),
    imageUrl: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) throw new Error("User not found");
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) throw new Error("Member not found");
    return await ctx.db.insert("lifeEvents", {
      churchId: member.churchId,
      memberId: member._id,
      createdBy: member._id,
      createdAt: Date.now(),
      ...args,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("lifeEvents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
