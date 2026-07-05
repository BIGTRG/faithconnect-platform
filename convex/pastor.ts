import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!member) return null;
    const profile = await ctx.db
      .query("pastorProfiles")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .first();
    return profile;
  },
});

export const createOrUpdate = mutation({
  args: {
    name: v.string(),
    title: v.optional(v.string()),
    bio: v.string(),
    journey: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    favoriteVerse: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    bookingEnabled: v.boolean(),
    bookingUrl: v.optional(v.string()),
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
    const existing = await ctx.db
      .query("pastorProfiles")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
      return existing._id;
    }
    return await ctx.db.insert("pastorProfiles", {
      churchId: member.churchId,
      memberId: member._id,
      ...args,
    });
  },
});
