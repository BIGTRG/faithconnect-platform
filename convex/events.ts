import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return [];

    const events = await ctx.db
      .query("events")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(100);

    const withDetails = await Promise.all(
      events.map(async (e) => {
        const attendees = await ctx.db
          .query("eventAttendees")
          .withIndex("by_eventId", (q) => q.eq("eventId", e._id))
          .collect();
        const myRsvp = attendees.find((a) => a.memberId === member._id);
        return {
          ...e,
          attendeeCount: attendees.filter((a) => a.status === "going").length,
          myStatus: myRsvp?.status ?? null,
          currentMemberId: member._id,
        };
      }),
    );

    return withDetails;
  },
});

export const listUpcoming = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return [];

    const events = await ctx.db
      .query("events")
      .withIndex("by_church_start", (q) =>
        q.eq("churchId", member.churchId).gte("startTime", Date.now()),
      )
      .order("asc")
      .take(20);

    const withDetails = await Promise.all(
      events.map(async (e) => {
        const attendees = await ctx.db
          .query("eventAttendees")
          .withIndex("by_eventId", (q) => q.eq("eventId", e._id))
          .collect();
        return {
          ...e,
          attendeeCount: attendees.filter((a) => a.status === "going").length,
        };
      }),
    );

    return withDetails;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    location: v.optional(v.string()),
    type: v.union(
      v.literal("service"),
      v.literal("bible_study"),
      v.literal("youth"),
      v.literal("outreach"),
      v.literal("fellowship"),
      v.literal("meeting"),
      v.literal("workshop"),
      v.literal("other"),
    ),
    isRecurring: v.optional(v.boolean()),
    maxAttendees: v.optional(v.number()),
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("events", {
      churchId: member.churchId,
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      type: args.type,
      isRecurring: args.isRecurring ?? false,
      maxAttendees: args.maxAttendees,
      createdBy: member._id,
    });
  },
});

export const rsvp = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("going"), v.literal("maybe"), v.literal("not_going")),
  },
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
      .query("eventAttendees")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    const mine = existing.find((a) => a.memberId === member._id);

    if (mine) {
      await ctx.db.patch(mine._id, { status: args.status });
    } else {
      await ctx.db.insert("eventAttendees", {
        eventId: args.eventId,
        memberId: member._id,
        status: args.status,
        checkedIn: false,
      });
    }

    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect();
    for (const a of attendees) {
      await ctx.db.delete(a._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
