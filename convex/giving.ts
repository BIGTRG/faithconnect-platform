import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listMyGiving = query({
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
      .query("givingRecords")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .order("desc")
      .take(100);
  },
});

export const getMyGivingStats = query({
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

    const records = await ctx.db
      .query("givingRecords")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .collect();

    const now = Date.now();
    const thisYear = new Date(now).getFullYear();
    const yearStart = new Date(thisYear, 0, 1).getTime();
    const monthStart = new Date(thisYear, new Date(now).getMonth(), 1).getTime();

    const yearTotal = records
      .filter((r) => r.date >= yearStart)
      .reduce((sum, r) => sum + r.amount, 0);
    const monthTotal = records
      .filter((r) => r.date >= monthStart)
      .reduce((sum, r) => sum + r.amount, 0);
    const lifetime = records.reduce((sum, r) => sum + r.amount, 0);

    const byType: Record<string, number> = {};
    for (const r of records.filter((r) => r.date >= yearStart)) {
      byType[r.type] = (byType[r.type] ?? 0) + r.amount;
    }

    return {
      yearTotal,
      monthTotal,
      lifetime,
      byType,
      totalGifts: records.length,
    };
  },
});

export const getChurchGivingStats = query({
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

    const records = await ctx.db
      .query("givingRecords")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .collect();

    const now = Date.now();
    const thisYear = new Date(now).getFullYear();
    const yearStart = new Date(thisYear, 0, 1).getTime();
    const monthStart = new Date(thisYear, new Date(now).getMonth(), 1).getTime();

    const yearTotal = records
      .filter((r) => r.date >= yearStart)
      .reduce((sum, r) => sum + r.amount, 0);
    const monthTotal = records
      .filter((r) => r.date >= monthStart)
      .reduce((sum, r) => sum + r.amount, 0);

    const uniqueGivers = new Set(
      records.filter((r) => r.memberId).map((r) => r.memberId),
    ).size;

    return {
      yearTotal,
      monthTotal,
      uniqueGivers,
      totalTransactions: records.length,
    };
  },
});

export const recordGiving = mutation({
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
    transactionId: v.optional(v.string()),
    campaignId: v.optional(v.id("campaigns")),
    note: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
  },
  returns: v.id("givingRecords"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("givingRecords", {
      churchId: member.churchId,
      memberId: member._id,
      amount: args.amount,
      type: args.type,
      paymentMethod: args.paymentMethod,
      transactionId: args.transactionId,
      campaignId: args.campaignId,
      note: args.note,
      date: Date.now(),
      isRecurring: args.isRecurring ?? false,
    });
  },
});

export const listCampaigns = query({
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
      .query("campaigns")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", member.churchId).eq("isActive", true),
      )
      .collect();
  },
});

// --- Member-to-Member (P2P) Giving ---

export const listMembers = query({
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
    const members = await ctx.db
      .query("members")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", member.churchId).eq("isActive", true),
      )
      .collect();
    return members.filter((m) => m._id !== member._id).map((m) => ({
      _id: m._id,
      displayName: m.displayName,
      phone: m.phone,
    }));
  },
});

export const sendToMember = mutation({
  args: {
    recipientId: v.id("members"),
    amount: v.number(),
    note: v.optional(v.string()),
    paymentMethod: v.union(
      v.literal("trgpay"),
      v.literal("card"),
      v.literal("bank_transfer"),
    ),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const sender = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!sender) throw new Error("Member not found");
    if (args.amount <= 0) throw new Error("Amount must be positive");

    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient) throw new Error("Recipient not found");

    // Record outgoing transfer
    const recordId = await ctx.db.insert("givingRecords", {
      churchId: sender.churchId,
      memberId: sender._id,
      amount: args.amount,
      type: "benevolence" as const,
      paymentMethod: args.paymentMethod,
      note: `Member-to-member: sent to ${recipient.displayName}${args.note ? " — " + args.note : ""}`,
      date: Date.now(),
      isRecurring: false,
      recipientMemberId: args.recipientId,
    });

    return {
      recordId,
      recipientName: recipient.displayName,
      amount: args.amount,
    };
  },
});

export const listMyP2PTransfers = query({
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

    const sent = await ctx.db
      .query("givingRecords")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .collect();

    const p2pSent = sent.filter((r) => r.recipientMemberId);

    // Get received
    const allRecords = await ctx.db
      .query("givingRecords")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .collect();
    const p2pReceived = allRecords.filter(
      (r) => r.recipientMemberId === member._id,
    );

    const transfers = [];
    for (const r of p2pSent) {
      const rec = r.recipientMemberId ? await ctx.db.get(r.recipientMemberId) : null;
      transfers.push({
        ...r,
        direction: "sent" as const,
        otherPartyName: rec?.displayName ?? "Unknown",
      });
    }
    for (const r of p2pReceived) {
      const senderMember = r.memberId ? await ctx.db.get(r.memberId) : null;
      transfers.push({
        ...r,
        direction: "received" as const,
        otherPartyName: senderMember?.displayName ?? "Unknown",
      });
    }

    return transfers.sort((a, b) => b.date - a.date);
  },
});

export const createCampaign = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    goalAmount: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
  },
  returns: v.id("campaigns"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("campaigns", {
      churchId: member.churchId,
      title: args.title,
      description: args.description,
      goalAmount: args.goalAmount,
      currentAmount: 0,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      createdBy: member._id,
    });
  },
});
