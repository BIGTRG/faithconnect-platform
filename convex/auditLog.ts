import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Log an admin action to the audit trail */
export const logAction = mutation({
  args: {
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return null;

    await ctx.db.insert("auditLogs", {
      churchId: member.churchId,
      memberId: member._id,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId,
      details: args.details,
      metadata: args.metadata,
      timestamp: Date.now(),
    });

    return null;
  },
});

/** Get audit logs for a church (admin/pastor only) */
export const getAuditLogs = query({
  args: { churchId: v.id("churches") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return [];

    // Only admin and pastor can view audit logs
    if (member.role !== "admin" && member.role !== "pastor") return [];

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .order("desc")
      .take(200);

    // Enrich with actor names
    const enriched = await Promise.all(
      logs.map(async (log) => {
        const actor = await ctx.db.get(log.memberId);
        return {
          ...log,
          actorName: actor?.displayName ?? "Unknown",
        };
      })
    );

    return enriched;
  },
});

/** Get my own audit trail */
export const getMyAuditTrail = query({
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

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .order("desc")
      .take(50);

    return logs;
  },
});
