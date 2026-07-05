import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyNotifications = query({
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
    return await ctx.db
      .query("notifications")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return 0;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_member_read", (q) =>
        q.eq("memberId", member._id).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_member_read", (q) =>
        q.eq("memberId", member._id).eq("isRead", false)
      )
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

export const createNotification = mutation({
  args: {
    churchId: v.id("churches"),
    memberId: v.id("members"),
    title: v.string(),
    body: v.string(),
    type: v.union(
      v.literal("event_reminder"),
      v.literal("announcement"),
      v.literal("prayer_update"),
      v.literal("giving_receipt"),
      v.literal("group_message"),
      v.literal("life_event"),
      v.literal("crisis_alert"),
      v.literal("welcome"),
      v.literal("general"),
    ),
    linkTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check member's notification preferences
    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .first();
    
    // Default to all enabled
    const typeMap: Record<string, string> = {
      event_reminder: "eventReminders",
      announcement: "announcements",
      prayer_update: "prayerUpdates",
      giving_receipt: "givingReceipts",
      group_message: "groupMessages",
      life_event: "lifeEvents",
      crisis_alert: "crisisAlerts",
    };
    
    const prefKey = typeMap[args.type];
    if (prefs && prefKey && !(prefs as any)[prefKey]) {
      return null; // User has this type disabled
    }

    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const broadcastNotification = mutation({
  args: {
    churchId: v.id("churches"),
    title: v.string(),
    body: v.string(),
    type: v.union(
      v.literal("event_reminder"),
      v.literal("announcement"),
      v.literal("prayer_update"),
      v.literal("giving_receipt"),
      v.literal("group_message"),
      v.literal("life_event"),
      v.literal("crisis_alert"),
      v.literal("welcome"),
      v.literal("general"),
    ),
    linkTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
    
    let count = 0;
    for (const member of members) {
      if (!member.isActive) continue;
      await ctx.db.insert("notifications", {
        churchId: args.churchId,
        memberId: member._id,
        title: args.title,
        body: args.body,
        type: args.type,
        linkTo: args.linkTo,
        isRead: false,
        createdAt: Date.now(),
      });
      count++;
    }
    return count;
  },
});

export const getPreferences = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return null;

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .first();
    if (prefs) return prefs;
    return {
      eventReminders: true,
      announcements: true,
      prayerUpdates: true,
      givingReceipts: true,
      groupMessages: true,
      lifeEvents: true,
      crisisAlerts: true,
      emailNotifications: true,
      pushNotifications: true,
    };
  },
});

export const updatePreferences = mutation({
  args: {
    eventReminders: v.boolean(),
    announcements: v.boolean(),
    prayerUpdates: v.boolean(),
    givingReceipts: v.boolean(),
    groupMessages: v.boolean(),
    lifeEvents: v.boolean(),
    crisisAlerts: v.boolean(),
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("notificationPreferences", {
        memberId: member._id,
        ...args,
      });
    }
  },
});
