import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function generateSecurityCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const getChildren = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("childProfiles")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
  },
});

export const getRooms = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("checkinRooms")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
  },
});

export const getActiveCheckins = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const checkins = await ctx.db
      .query("childCheckins")
      .withIndex("by_church_status", (q) =>
        q.eq("churchId", args.churchId).eq("status", "checked_in")
      )
      .collect();
    const withDetails = await Promise.all(
      checkins.map(async (ci) => {
        const child = await ctx.db.get(ci.childId);
        const room = await ctx.db.get(ci.roomId);
        return {
          ...ci,
          childName: child ? `${child.firstName} ${child.lastName}` : "Unknown",
          childAllergies: child?.allergies ?? [],
          childMedicalNotes: child?.medicalNotes,
          roomName: room?.name ?? "Unknown",
        };
      })
    );
    return withDetails;
  },
});

export const getCheckinStats = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const active = await ctx.db
      .query("childCheckins")
      .withIndex("by_church_status", (q) =>
        q.eq("churchId", args.churchId).eq("status", "checked_in")
      )
      .collect();
    const rooms = await ctx.db
      .query("checkinRooms")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
    const children = await ctx.db
      .query("childProfiles")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
    return {
      checkedInCount: active.length,
      totalRooms: rooms.filter((r) => r.isActive).length,
      totalChildren: children.filter((c) => c.isActive).length,
      roomOccupancy: rooms.map((r) => ({
        roomId: r._id,
        roomName: r.name,
        capacity: r.capacity ?? 0,
        current: active.filter((ci) => ci.roomId === r._id).length,
      })),
    };
  },
});

export const checkinChild = mutation({
  args: {
    churchId: v.id("churches"),
    childId: v.id("childProfiles"),
    roomId: v.id("checkinRooms"),
    checkedInBy: v.id("members"),
    guardianName: v.string(),
  },
  handler: async (ctx, args) => {
    const child = await ctx.db.get(args.childId);
    const securityCode = generateSecurityCode();
    const hasAllergies = (child?.allergies?.length ?? 0) > 0;

    const checkinId = await ctx.db.insert("childCheckins", {
      churchId: args.churchId,
      childId: args.childId,
      roomId: args.roomId,
      securityCode,
      checkedInAt: Date.now(),
      checkedInBy: args.checkedInBy,
      guardianName: args.guardianName,
      stickerPrinted: false,
      allergyAlertShown: hasAllergies,
      status: "checked_in",
    });

    // Update room count
    const room = await ctx.db.get(args.roomId);
    if (room) {
      await ctx.db.patch(args.roomId, {
        currentCount: room.currentCount + 1,
      });
    }

    return { checkinId, securityCode, hasAllergies, allergies: child?.allergies ?? [] };
  },
});

export const checkoutChild = mutation({
  args: {
    checkinId: v.id("childCheckins"),
    securityCode: v.string(),
    checkedOutBy: v.id("members"),
  },
  handler: async (ctx, args) => {
    const checkin = await ctx.db.get(args.checkinId);
    if (!checkin) throw new Error("Check-in not found");
    if (checkin.securityCode !== args.securityCode) {
      throw new Error("Invalid security code");
    }
    await ctx.db.patch(args.checkinId, {
      checkedOutAt: Date.now(),
      checkedOutBy: args.checkedOutBy,
      status: "checked_out",
    });
    const room = await ctx.db.get(checkin.roomId);
    if (room && room.currentCount > 0) {
      await ctx.db.patch(checkin.roomId, {
        currentCount: room.currentCount - 1,
      });
    }
    return { success: true };
  },
});

export const markStickerPrinted = mutation({
  args: { checkinId: v.id("childCheckins") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.checkinId, { stickerPrinted: true });
  },
});

export const addChild = mutation({
  args: {
    churchId: v.id("churches"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.optional(v.string()),
    age: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    allergies: v.optional(v.array(v.string())),
    medicalNotes: v.optional(v.string()),
    guardianName: v.string(),
    guardianPhone: v.string(),
    guardianRelationship: v.string(),
    parentMemberId: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("childProfiles", {
      churchId: args.churchId,
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
      age: args.age,
      gender: args.gender,
      allergies: args.allergies,
      medicalNotes: args.medicalNotes,
      guardians: [
        {
          name: args.guardianName,
          relationship: args.guardianRelationship,
          phone: args.guardianPhone,
          isAuthorizedPickup: true,
        },
      ],
      parentMemberId: args.parentMemberId,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});
