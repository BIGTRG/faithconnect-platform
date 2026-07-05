import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listTherapists = query({
  args: { churchId: v.id("churches"), specialty: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.specialty && args.specialty !== "all") {
      return await ctx.db
        .query("therapists")
        .withIndex("by_church_specialty", (q) =>
          q.eq("churchId", args.churchId).eq("specialty", args.specialty as any),
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    return await ctx.db
      .query("therapists")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", args.churchId).eq("isActive", true),
      )
      .collect();
  },
});

export const addTherapist = mutation({
  args: {
    churchId: v.id("churches"),
    name: v.string(),
    title: v.string(),
    specialty: v.union(
      v.literal("general"),
      v.literal("marriage"),
      v.literal("grief"),
      v.literal("addiction"),
      v.literal("youth"),
      v.literal("trauma"),
      v.literal("anxiety"),
      v.literal("depression"),
      v.literal("family"),
    ),
    bio: v.string(),
    credentials: v.array(v.string()),
    isFaithBased: v.boolean(),
    sessionRate: v.number(),
    isFree: v.boolean(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    videoLink: v.optional(v.string()),
    availability: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("therapists", {
      ...args,
      imageUrl: undefined,
      isActive: true,
      rating: undefined,
      totalSessions: 0,
      createdAt: Date.now(),
    });
  },
});

export const listSessions = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("therapySessions")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();
  },
});

export const bookSession = mutation({
  args: {
    churchId: v.id("churches"),
    therapistId: v.id("therapists"),
    memberId: v.id("members"),
    scheduledAt: v.number(),
    duration: v.number(),
    type: v.union(v.literal("video"), v.literal("phone"), v.literal("in_person")),
    notes: v.optional(v.string()),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("therapySessions", {
      ...args,
      status: "requested",
      createdAt: Date.now(),
    });
  },
});

export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("therapySessions"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { status: args.status });
  },
});
