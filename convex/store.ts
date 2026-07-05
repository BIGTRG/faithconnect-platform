import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listProducts = query({
  args: { churchId: v.id("churches"), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category && args.category !== "all") {
      return await ctx.db
        .query("storeProducts")
        .withIndex("by_church_category", (q) =>
          q.eq("churchId", args.churchId).eq("category", args.category as any),
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    return await ctx.db
      .query("storeProducts")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", args.churchId).eq("isActive", true),
      )
      .collect();
  },
});

export const getFeaturedProducts = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("storeProducts")
      .withIndex("by_church_featured", (q) =>
        q.eq("churchId", args.churchId).eq("isFeatured", true),
      )
      .collect();
  },
});

export const addProduct = mutation({
  args: {
    churchId: v.id("churches"),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("apparel"),
      v.literal("accessories"),
      v.literal("books"),
      v.literal("media"),
      v.literal("supplies"),
      v.literal("food"),
      v.literal("art"),
      v.literal("gifts"),
      v.literal("other"),
    ),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    inventory: v.optional(v.number()),
    isDigital: v.boolean(),
    isFeatured: v.boolean(),
    tags: v.optional(v.array(v.string())),
    addedBy: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("storeProducts", {
      ...args,
      imageUrl: undefined,
      images: undefined,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const listOrders = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("storeOrders")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();
  },
});

export const createOrder = mutation({
  args: {
    churchId: v.id("churches"),
    memberId: v.id("members"),
    items: v.array(
      v.object({
        productId: v.id("storeProducts"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    total: v.number(),
    shippingAddress: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("storeOrders", {
      ...args,
      status: "pending",
      trackingNumber: undefined,
      createdAt: Date.now(),
    });
  },
});
