import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMySchedules = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recurringSchedules")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .collect();
  },
});

export const getChurchSchedules = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const schedules = await ctx.db
      .query("recurringSchedules")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", args.churchId).eq("isActive", true)
      )
      .collect();
    const withMembers = await Promise.all(
      schedules.map(async (s) => {
        const member = await ctx.db.get(s.memberId);
        return { ...s, memberName: member?.displayName ?? "Member" };
      })
    );
    return withMembers;
  },
});

export const createSchedule = mutation({
  args: {
    churchId: v.id("churches"),
    memberId: v.id("members"),
    type: v.union(
      v.literal("tithe"),
      v.literal("offering"),
      v.literal("mission"),
      v.literal("building"),
      v.literal("benevolence"),
      v.literal("other"),
    ),
    amount: v.number(),
    frequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
    ),
    paymentMethod: v.union(
      v.literal("trgpay"),
      v.literal("card"),
      v.literal("bank_transfer"),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nextMap: Record<string, number> = {
      weekly: 7 * 24 * 60 * 60 * 1000,
      biweekly: 14 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
      quarterly: 90 * 24 * 60 * 60 * 1000,
    };
    return await ctx.db.insert("recurringSchedules", {
      churchId: args.churchId,
      memberId: args.memberId,
      type: args.type,
      amount: args.amount,
      frequency: args.frequency,
      paymentMethod: args.paymentMethod,
      nextDate: now + nextMap[args.frequency],
      startDate: now,
      isActive: true,
      totalGiven: 0,
      createdAt: now,
    });
  },
});

export const cancelSchedule = mutation({
  args: { scheduleId: v.id("recurringSchedules") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scheduleId, { isActive: false, endDate: Date.now() });
  },
});
