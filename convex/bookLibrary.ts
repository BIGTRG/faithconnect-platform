import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listBooks = query({
  args: { churchId: v.id("churches"), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category && args.category !== "all") {
      return await ctx.db
        .query("bookLibrary")
        .withIndex("by_church_category", (q) =>
          q.eq("churchId", args.churchId).eq("category", args.category as any),
        )
        .filter((q) => q.eq(q.field("isPublished"), true))
        .collect();
    }
    return await ctx.db
      .query("bookLibrary")
      .withIndex("by_church_published", (q) =>
        q.eq("churchId", args.churchId).eq("isPublished", true),
      )
      .collect();
  },
});

export const getFeaturedBooks = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookLibrary")
      .withIndex("by_church_featured", (q) =>
        q.eq("churchId", args.churchId).eq("isFeatured", true),
      )
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});

export const addBook = mutation({
  args: {
    churchId: v.id("churches"),
    title: v.string(),
    author: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("devotional"),
      v.literal("theology"),
      v.literal("marriage"),
      v.literal("parenting"),
      v.literal("leadership"),
      v.literal("youth"),
      v.literal("prayer"),
      v.literal("healing"),
      v.literal("finance"),
      v.literal("missions"),
      v.literal("testimony"),
      v.literal("study_guide"),
    ),
    price: v.number(),
    pageCount: v.optional(v.number()),
    isAiGenerated: v.boolean(),
    isFeatured: v.boolean(),
    denomination: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookLibrary", {
      ...args,
      coverImageUrl: undefined,
      isPublished: true,
      downloadUrl: undefined,
      sampleUrl: undefined,
      rating: undefined,
      totalSales: 0,
      generatedAt: args.isAiGenerated ? Date.now() : undefined,
      publishedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const purchaseBook = mutation({
  args: {
    churchId: v.id("churches"),
    memberId: v.id("members"),
    bookId: v.id("bookLibrary"),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (book) {
      await ctx.db.patch(args.bookId, {
        totalSales: (book.totalSales || 0) + 1,
      });
    }
    return await ctx.db.insert("bookPurchases", {
      ...args,
      purchasedAt: Date.now(),
    });
  },
});

export const getMyPurchases = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookPurchases")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();
  },
});
