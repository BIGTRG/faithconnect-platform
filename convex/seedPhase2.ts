import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const seedPhase2 = mutation({
  args: {},
  returns: undefined,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return;

    // Check if already seeded
    const existingLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .first();
    if (existingLogs) return;

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // Get some member IDs for realistic targets
    const members = await ctx.db
      .query("members")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .take(10);

    const adminMember = members.find((m) => m.role === "admin") ?? member;
    const pastorMember = members.find((m) => m.role === "pastor") ?? member;

    // Seed audit log entries
    const auditEntries = [
      {
        memberId: adminMember._id,
        action: "role_change",
        targetType: "member",
        targetId: members[2]?._id?.toString(),
        details: "Changed role from member to leader",
        timestamp: now - 2 * day,
      },
      {
        memberId: adminMember._id,
        action: "config_update",
        targetType: "church",
        details: "Updated church service schedule",
        timestamp: now - 3 * day,
      },
      {
        memberId: pastorMember._id,
        action: "notification_broadcast",
        targetType: "notification",
        details: "Sent announcement to all members: Sunday service time change",
        timestamp: now - 4 * day,
      },
      {
        memberId: adminMember._id,
        action: "event_created",
        targetType: "event",
        details: "Created Community Block Party event",
        timestamp: now - 5 * day,
      },
      {
        memberId: adminMember._id,
        action: "giving_processed",
        targetType: "giving",
        details: "Processed batch of 15 offering records from Sunday service",
        timestamp: now - 6 * day,
      },
      {
        memberId: adminMember._id,
        action: "member_deactivate",
        targetType: "member",
        targetId: members[5]?._id?.toString(),
        details: "Member moved to inactive status - relocated",
        timestamp: now - 7 * day,
      },
      {
        memberId: pastorMember._id,
        action: "crisis_dispatch",
        targetType: "crisis",
        details: "Dispatched crisis team to hospital visit - Jones family",
        timestamp: now - 8 * day,
      },
      {
        memberId: adminMember._id,
        action: "profile_update",
        targetType: "church",
        details: "Updated church logo and cover image",
        timestamp: now - 9 * day,
      },
      {
        memberId: pastorMember._id,
        action: "role_change",
        targetType: "member",
        targetId: members[3]?._id?.toString(),
        details: "Promoted to deacon after board approval",
        timestamp: now - 10 * day,
      },
      {
        memberId: adminMember._id,
        action: "config_update",
        targetType: "payment",
        details: "Connected Stripe account for online giving",
        timestamp: now - 12 * day,
      },
      {
        memberId: adminMember._id,
        action: "event_created",
        targetType: "event",
        details: "Created Youth Bible Study series - 8 weeks",
        timestamp: now - 14 * day,
      },
      {
        memberId: pastorMember._id,
        action: "notification_broadcast",
        targetType: "notification",
        details: "Welcome message sent to 12 new members",
        timestamp: now - 15 * day,
      },
    ];

    for (const entry of auditEntries) {
      await ctx.db.insert("auditLogs", {
        churchId: member.churchId,
        ...entry,
        ipAddress: "system",
      });
    }

    console.log(`Seeded ${auditEntries.length} audit log entries`);
  },
});
