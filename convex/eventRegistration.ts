import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Event Registration System ───────────────────────────────

export const register = mutation({
  args: {
    eventId: v.id("events"),
    guestCount: v.optional(v.number()),
    dietaryNeeds: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    // Check if already registered
    const existing = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    const myReg = existing.find((r) => r.memberId === member._id);
    if (myReg) {
      // Update existing registration
      await ctx.db.patch(myReg._id, {
        guestCount: args.guestCount,
        dietaryNeeds: args.dietaryNeeds,
        notes: args.notes,
        status: "registered" as const,
      });
      return myReg._id;
    }

    // Check capacity
    const event = await ctx.db.get(args.eventId);
    if (event?.maxAttendees) {
      const registered = existing.filter((r) => r.status === "registered");
      if (registered.length >= event.maxAttendees) {
        // Waitlist
        return await ctx.db.insert("eventRegistrations", {
          eventId: args.eventId,
          memberId: member._id,
          guestCount: args.guestCount,
          dietaryNeeds: args.dietaryNeeds,
          notes: args.notes,
          status: "waitlisted",
          registeredAt: Date.now(),
        });
      }
    }

    // Also RSVP as "going" in eventAttendees
    const attendee = await ctx.db
      .query("eventAttendees")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    const myAttendee = attendee.find((a) => a.memberId === member._id);
    if (myAttendee) {
      await ctx.db.patch(myAttendee._id, { status: "going" });
    } else {
      await ctx.db.insert("eventAttendees", {
        eventId: args.eventId,
        memberId: member._id,
        status: "going",
        checkedIn: false,
      });
    }

    return await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      memberId: member._id,
      guestCount: args.guestCount,
      dietaryNeeds: args.dietaryNeeds,
      notes: args.notes,
      status: "registered",
      registeredAt: Date.now(),
    });
  },
});

export const cancelRegistration = mutation({
  args: { eventId: v.id("events") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const regs = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    const myReg = regs.find((r) => r.memberId === member._id);
    if (myReg) {
      await ctx.db.patch(myReg._id, { status: "cancelled" as const });
    }
    return null;
  },
});

export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const regs = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const withMembers = await Promise.all(
      regs.map(async (r) => {
        const member = await ctx.db.get(r.memberId);
        return { ...r, memberName: member?.displayName ?? "Unknown", memberPhone: member?.phone };
      })
    );
    return withMembers;
  },
});

export const getMyRegistrations = query({
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

    const regs = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .collect();

    const withEvents = await Promise.all(
      regs.map(async (r) => {
        const event = await ctx.db.get(r.eventId);
        return { ...r, event };
      })
    );
    return withEvents.filter((r) => r.event !== null);
  },
});

export const checkIn = mutation({
  args: { eventId: v.id("events"), memberId: v.id("members") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check in a member for an event
    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    const attendee = attendees.find((a) => a.memberId === args.memberId);
    if (attendee) {
      await ctx.db.patch(attendee._id, {
        checkedIn: true,
        checkedInAt: Date.now(),
      });
    } else {
      await ctx.db.insert("eventAttendees", {
        eventId: args.eventId,
        memberId: args.memberId,
        status: "going",
        checkedIn: true,
        checkedInAt: Date.now(),
      });
    }
    return null;
  },
});

export const getAttendanceReport = query({
  args: { eventId: v.id("events") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const regs = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const withDetails = await Promise.all(
      attendees.map(async (a) => {
        const member = await ctx.db.get(a.memberId);
        const reg = regs.find((r) => r.memberId === a.memberId);
        return {
          ...a,
          memberName: member?.displayName ?? "Unknown",
          memberPhone: member?.phone,
          memberRole: member?.role,
          registration: reg ?? null,
        };
      })
    );

    return {
      event,
      total: attendees.length,
      going: attendees.filter((a) => a.status === "going").length,
      checkedIn: attendees.filter((a) => a.checkedIn).length,
      registered: regs.filter((r) => r.status === "registered").length,
      waitlisted: regs.filter((r) => r.status === "waitlisted").length,
      attendees: withDetails,
    };
  },
});
