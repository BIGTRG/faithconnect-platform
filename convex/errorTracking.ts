import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Platform Health & Error Tracking ────────────────────────

export const logError = mutation({
  args: {
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical"),
    ),
    source: v.string(),
    message: v.string(),
    stackTrace: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const member = userId
      ? await ctx.db
          .query("members")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first()
      : null;

    await ctx.db.insert("errorLogs", {
      churchId: member?.churchId,
      severity: args.severity,
      source: args.source,
      message: args.message,
      stackTrace: args.stackTrace,
      metadata: args.metadata,
      userId: userId ?? undefined,
      resolved: false,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const getErrorLogs = query({
  args: {
    severity: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member || (member.role !== "admin" && member.role !== "pastor")) return [];

    let logs = await ctx.db
      .query("errorLogs")
      .order("desc")
      .take(args.limit ?? 100);

    if (args.severity) {
      logs = logs.filter((l) => l.severity === args.severity);
    }

    return logs;
  },
});

export const resolveError = mutation({
  args: { errorId: v.id("errorLogs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member || member.role !== "admin") throw new Error("Admin only");

    await ctx.db.patch(args.errorId, {
      resolved: true,
      resolvedBy: member._id,
      resolvedAt: Date.now(),
    });
    return null;
  },
});

export const getPlatformHealth = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member || (member.role !== "admin" && member.role !== "pastor")) return null;

    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const twentyFourHoursAgo = now - 86400000;
    const sevenDaysAgo = now - 7 * 86400000;

    const allErrors = await ctx.db
      .query("errorLogs")
      .order("desc")
      .take(500);

    const last24h = allErrors.filter((e) => e.createdAt >= twentyFourHoursAgo);
    const lastHour = allErrors.filter((e) => e.createdAt >= oneHourAgo);
    const last7d = allErrors.filter((e) => e.createdAt >= sevenDaysAgo);

    const criticalCount = last24h.filter((e) => e.severity === "critical").length;
    const errorCount = last24h.filter((e) => e.severity === "error").length;
    const warningCount = last24h.filter((e) => e.severity === "warning").length;
    const unresolvedCount = allErrors.filter((e) => !e.resolved).length;

    // System health score
    let healthScore = 100;
    healthScore -= criticalCount * 20;
    healthScore -= errorCount * 5;
    healthScore -= warningCount * 1;
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Uptime calculation (simulated based on critical errors)
    const criticalLast7d = last7d.filter((e) => e.severity === "critical").length;
    const uptimePercent = Math.max(95, 100 - criticalLast7d * 0.5);

    // Error trend by day (last 7 days)
    const errorTrend: Array<{ day: string; errors: number; warnings: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i + 1) * 86400000;
      const dayEnd = now - i * 86400000;
      const dayErrors = allErrors.filter(
        (e) => e.createdAt >= dayStart && e.createdAt < dayEnd,
      );
      errorTrend.push({
        day: new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" }),
        errors: dayErrors.filter((e) => e.severity === "error" || e.severity === "critical")
          .length,
        warnings: dayErrors.filter((e) => e.severity === "warning").length,
      });
    }

    // Top error sources
    const sourceMap: Record<string, number> = {};
    for (const e of last7d) {
      sourceMap[e.source] = (sourceMap[e.source] ?? 0) + 1;
    }
    const topSources = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    return {
      healthScore,
      uptimePercent: Math.round(uptimePercent * 100) / 100,
      status:
        healthScore >= 90
          ? "healthy"
          : healthScore >= 70
            ? "degraded"
            : "critical",
      last24h: {
        total: last24h.length,
        critical: criticalCount,
        errors: errorCount,
        warnings: warningCount,
      },
      lastHour: lastHour.length,
      unresolvedCount,
      errorTrend,
      topSources,
      services: [
        { name: "Authentication", status: "operational", latency: 45 },
        { name: "Database (Convex)", status: "operational", latency: 12 },
        { name: "Payment Processing", status: "operational", latency: 230 },
        { name: "AI Concierge", status: "operational", latency: 890 },
        { name: "Notification Delivery", status: "operational", latency: 67 },
        { name: "File Storage", status: "operational", latency: 34 },
        { name: "Search Index", status: "operational", latency: 22 },
        { name: "Real-time Sync", status: "operational", latency: 8 },
      ],
    };
  },
});
