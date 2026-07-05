import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Stripe Connect Integration for Church Payments ──────────

export const getChurchPaymentConfig = query({
  args: { churchId: v.id("churches") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const church = await ctx.db.get(args.churchId);
    if (!church) return null;
    return {
      churchId: church._id,
      churchName: church.name,
      stripeConnectedAccountId: church.trgpayMerchantId ?? null,
      isPaymentsEnabled: !!church.trgpayMerchantId,
      processingFeeRate: 2.9,
      platformFeeRate: 0,
      currency: "usd",
    };
  },
});

export const processGiving = mutation({
  args: {
    amount: v.number(),
    type: v.union(
      v.literal("tithe"),
      v.literal("offering"),
      v.literal("mission"),
      v.literal("building"),
      v.literal("benevolence"),
      v.literal("campaign"),
      v.literal("other"),
    ),
    paymentMethod: v.union(
      v.literal("trgpay"),
      v.literal("card"),
      v.literal("cash"),
      v.literal("check"),
      v.literal("bank_transfer"),
    ),
    note: v.optional(v.string()),
    campaignId: v.optional(v.id("campaigns")),
    recipientMemberId: v.optional(v.id("members")),
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

    const recordId = await ctx.db.insert("givingRecords", {
      churchId: member.churchId,
      memberId: member._id,
      amount: args.amount,
      type: args.type,
      paymentMethod: args.paymentMethod,
      note: args.note,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: Date.now(),
      isRecurring: false,
      recipientMemberId: args.recipientMemberId,
    });

    // Create notification for giving receipt
    await ctx.db.insert("notifications", {
      churchId: member.churchId,
      memberId: member._id,
      title: "Gift Received",
      body: `Your ${args.type} of $${args.amount.toFixed(2)} has been ${args.paymentMethod === "cash" || args.paymentMethod === "check" ? "recorded" : "processed"}. Thank you for your generosity.`,
      type: "giving_receipt",
      linkTo: "/giving",
      isRead: false,
      createdAt: Date.now(),
    });

    return { recordId, status: "success" };
  },
});

export const getGivingStatement = query({
  args: { year: v.number() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return null;

    const allGiving = await ctx.db
      .query("givingRecords")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .collect();

    const yearStart = new Date(args.year, 0, 1).getTime();
    const yearEnd = new Date(args.year + 1, 0, 1).getTime();
    const yearGiving = allGiving.filter(
      (g) => g.date >= yearStart && g.date < yearEnd
    );

    const byType: Record<string, number> = {};
    let total = 0;
    for (const g of yearGiving) {
      byType[g.type] = (byType[g.type] ?? 0) + g.amount;
      total += g.amount;
    }

    const church = await ctx.db.get(member.churchId);

    return {
      memberName: member.displayName,
      churchName: church?.name ?? "Church",
      churchAddress: church?.address,
      year: args.year,
      total,
      byType,
      transactionCount: yearGiving.length,
      records: yearGiving.map((g) => ({
        date: new Date(g.date).toLocaleDateString(),
        amount: g.amount,
        type: g.type,
        method: g.paymentMethod,
        transactionId: g.transactionId,
      })),
    };
  },
});

export const getChurchGivingReport = query({
  args: { churchId: v.id("churches") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("givingRecords")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .order("desc")
      .take(500);

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const thisMonth = records.filter((r) => r.date >= thirtyDaysAgo);

    const byType: Record<string, number> = {};
    let totalAll = 0;
    let totalMonth = 0;
    for (const r of records) {
      totalAll += r.amount;
      byType[r.type] = (byType[r.type] ?? 0) + r.amount;
    }
    for (const r of thisMonth) {
      totalMonth += r.amount;
    }

    const uniqueDonors = new Set(records.map((r) => r.memberId?.toString()).filter(Boolean));

    return {
      totalAllTime: totalAll,
      totalThisMonth: totalMonth,
      transactionCount: records.length,
      uniqueDonors: uniqueDonors.size,
      byType,
      averageGift: records.length > 0 ? totalAll / records.length : 0,
    };
  },
});
