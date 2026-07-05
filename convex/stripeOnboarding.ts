import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Stripe Connect Onboarding for Churches ──────────────────

export const getOnboardingStatus = query({
  args: { churchId: v.id("churches") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const status = await ctx.db
      .query("stripeOnboardingStatus")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .first();
    if (!status) {
      return {
        churchId: args.churchId,
        status: "not_started",
        currentStep: 0,
        completedSteps: [],
      };
    }
    return status;
  },
});

export const startOnboarding = mutation({
  args: {
    churchId: v.id("churches"),
    businessType: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("stripeOnboardingStatus")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        businessType: args.businessType,
        contactEmail: args.contactEmail,
        contactPhone: args.contactPhone,
        currentStep: 1,
        completedSteps: ["business_info"],
        status: "pending",
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const id = await ctx.db.insert("stripeOnboardingStatus", {
      churchId: args.churchId,
      status: "pending",
      businessType: args.businessType,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      currentStep: 1,
      completedSteps: ["business_info"],
      payoutsEnabled: false,
      paymentsEnabled: false,
      revenueShareBookPercent: 50,
      revenueShareStorePercent: 20,
      revenueShareMarketplacePercent: 20,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const updateBankInfo = mutation({
  args: {
    churchId: v.id("churches"),
    bankLast4: v.string(),
    bankName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const status = await ctx.db
      .query("stripeOnboardingStatus")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .first();
    if (!status) throw new Error("Start onboarding first");

    const steps = status.completedSteps ?? [];
    if (!steps.includes("bank_info")) steps.push("bank_info");

    await ctx.db.patch(status._id, {
      bankLast4: args.bankLast4,
      bankName: args.bankName,
      currentStep: 2,
      completedSteps: steps,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const configureRevenueSharing = mutation({
  args: {
    churchId: v.id("churches"),
    revenueShareBookPercent: v.number(),
    revenueShareStorePercent: v.number(),
    revenueShareMarketplacePercent: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const status = await ctx.db
      .query("stripeOnboardingStatus")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .first();
    if (!status) throw new Error("Start onboarding first");

    const steps = status.completedSteps ?? [];
    if (!steps.includes("revenue_sharing")) steps.push("revenue_sharing");

    await ctx.db.patch(status._id, {
      revenueShareBookPercent: args.revenueShareBookPercent,
      revenueShareStorePercent: args.revenueShareStorePercent,
      revenueShareMarketplacePercent: args.revenueShareMarketplacePercent,
      currentStep: 3,
      completedSteps: steps,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const submitForReview = mutation({
  args: { churchId: v.id("churches") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const status = await ctx.db
      .query("stripeOnboardingStatus")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .first();
    if (!status) throw new Error("Start onboarding first");

    const steps = status.completedSteps ?? [];
    if (!steps.includes("review_submit")) steps.push("review_submit");

    await ctx.db.patch(status._id, {
      status: "reviewing",
      currentStep: 4,
      completedSteps: steps,
      submittedAt: Date.now(),
      stripeAccountId: `acct_${Date.now().toString(36)}`,
      updatedAt: Date.now(),
    });

    // Auto-approve in demo mode (simulates Stripe approval)
    await ctx.db.patch(status._id, {
      status: "active",
      payoutsEnabled: true,
      paymentsEnabled: true,
      activatedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update church with Stripe info
    await ctx.db.patch(args.churchId, {
      stripeConnectId: `acct_${Date.now().toString(36)}`,
      trgpayMerchantId: `trgpay_${Date.now().toString(36)}`,
    });

    return null;
  },
});

export const getRevenueProjections = query({
  args: { churchId: v.id("churches") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const status = await ctx.db
      .query("stripeOnboardingStatus")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .first();

    const bookPct = status?.revenueShareBookPercent ?? 50;
    const storePct = status?.revenueShareStorePercent ?? 20;
    const mktPct = status?.revenueShareMarketplacePercent ?? 20;

    return {
      bookstore: {
        monthlyGross: 20000,
        costOfGoods: 5000,
        grossProfit: 15000,
        churchShare: Math.round(15000 * bookPct / 100),
        platformShare: Math.round(15000 * (100 - bookPct) / 100),
        sharePercent: bookPct,
      },
      store: {
        monthlyGross: 35000,
        costOfGoods: 12000,
        grossProfit: 23000,
        churchShare: Math.round(23000 * storePct / 100),
        platformShare: Math.round(23000 * (100 - storePct) / 100),
        sharePercent: storePct,
      },
      marketplace: {
        monthlyGross: 100000,
        costOfGoods: 40000,
        grossProfit: 60000,
        churchShare: Math.round(60000 * mktPct / 100),
        platformShare: Math.round(60000 * (100 - mktPct) / 100),
        sharePercent: mktPct,
      },
      merchantProcessing: {
        note: "Church receives $0 from merchant processing fees",
        monthlyVolume: 155000,
        processingFee: 2.9,
        monthlyFees: 4495,
        churchShare: 0,
      },
    };
  },
});
