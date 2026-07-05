import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listRooms = query({
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
      .query("supportRooms")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(50);
  },
});

export const listMessages = query({
  args: { roomId: v.id("supportRooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("supportMessages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(100);
  },
});

export const listResources = query({
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
      .query("crisisResources")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .collect();
  },
});

export const createRoom = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("grief"),
      v.literal("addiction"),
      v.literal("divorce"),
      v.literal("anxiety"),
      v.literal("parenting"),
      v.literal("financial_stress"),
      v.literal("general"),
    ),
    isAnonymous: v.boolean(),
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
    return await ctx.db.insert("supportRooms", {
      churchId: member.churchId,
      moderatorId: member._id,
      isActive: true,
      memberCount: 0,
      ...args,
    });
  },
});

export const sendMessage = mutation({
  args: {
    roomId: v.id("supportRooms"),
    content: v.string(),
    isAnonymous: v.boolean(),
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
    return await ctx.db.insert("supportMessages", {
      roomId: args.roomId,
      memberId: args.isAnonymous ? undefined : member._id,
      displayName: args.isAnonymous ? "Anonymous" : member.displayName,
      content: args.content,
      isAnonymous: args.isAnonymous,
      postedAt: Date.now(),
    });
  },
});

export const addResource = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("hotline"), v.literal("counselor"), v.literal("program"), v.literal("website")),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
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
    return await ctx.db.insert("crisisResources", {
      churchId: member.churchId,
      isActive: true,
      ...args,
    });
  },
});
