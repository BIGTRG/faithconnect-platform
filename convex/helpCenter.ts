import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listResources = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) return [];
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) return [];
    if (args.category) {
      return await ctx.db.query("helpResources").withIndex("by_church_category", (q) => q.eq("churchId", member.churchId).eq("category", args.category as any)).collect();
    }
    return await ctx.db.query("helpResources").withIndex("by_churchId", (q) => q.eq("churchId", member.churchId)).collect();
  },
});

export const addResource = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("food"), v.literal("shelter"), v.literal("clothing"), v.literal("medical"),
      v.literal("legal"), v.literal("financial"), v.literal("childcare"), v.literal("transportation"),
      v.literal("education"), v.literal("employment"), v.literal("mental_health"), v.literal("other"),
    ),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(v.string()),
    eligibility: v.optional(v.string()),
    isFree: v.boolean(),
    isChurchSponsored: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) throw new Error("User not found");
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) throw new Error("Member not found");
    return await ctx.db.insert("helpResources", { churchId: member.churchId, addedBy: member._id, isActive: true, ...args });
  },
});

export const listRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) return [];
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) return [];
    return await ctx.db.query("helpRequests").withIndex("by_churchId", (q) => q.eq("churchId", member.churchId)).order("desc").take(50);
  },
});

export const submitRequest = mutation({
  args: {
    category: v.string(),
    description: v.string(),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) throw new Error("User not found");
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) throw new Error("Member not found");
    return await ctx.db.insert("helpRequests", { churchId: member.churchId, memberId: member._id, status: "open", createdAt: Date.now(), ...args });
  },
});
