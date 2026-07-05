import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listTracks = query({
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
      .query("worshipTracks")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(100);
  },
});

export const listRequests = query({
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
    const requests = await ctx.db
      .query("songRequests")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(50);
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const m = await ctx.db.get(r.memberId);
        return { ...r, memberName: m?.displayName ?? "Unknown" };
      }),
    );
    return enriched;
  },
});

export const addTrack = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    album: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    streamUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    genre: v.optional(v.string()),
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
    return await ctx.db.insert("worshipTracks", {
      churchId: member.churchId,
      addedBy: member._id,
      playCount: 0,
      isActive: true,
      ...args,
    });
  },
});

export const requestSong = mutation({
  args: {
    trackTitle: v.string(),
    artistName: v.string(),
    message: v.optional(v.string()),
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
    return await ctx.db.insert("songRequests", {
      churchId: member.churchId,
      memberId: member._id,
      status: "pending",
      requestedAt: Date.now(),
      ...args,
    });
  },
});
