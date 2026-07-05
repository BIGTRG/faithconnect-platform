import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) return [];
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) return [];
    return await ctx.db.query("expertCategories").withIndex("by_church_active", (q) => q.eq("churchId", member.churchId).eq("isActive", true)).collect();
  },
});

export const listQuestions = query({
  args: { categoryId: v.optional(v.id("expertCategories")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) return [];
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) return [];
    if (args.categoryId) {
      return await ctx.db.query("expertQuestions").withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!)).order("desc").take(50);
    }
    return await ctx.db.query("expertQuestions").withIndex("by_askerId", (q) => q.eq("askerId", member._id)).order("desc").take(50);
  },
});

export const askQuestion = mutation({
  args: {
    categoryId: v.id("expertCategories"),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) throw new Error("User not found");
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) throw new Error("Member not found");
    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");
    return await ctx.db.insert("expertQuestions", {
      churchId: member.churchId,
      categoryId: args.categoryId,
      askerId: member._id,
      question: args.question,
      status: "pending",
      isPaid: !cat.isFree,
      amountPaid: cat.isFree ? undefined : cat.pricePerQuestion,
      askedAt: Date.now(),
    });
  },
});

export const answerQuestion = mutation({
  args: { id: v.id("expertQuestions"), answer: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) throw new Error("User not found");
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) throw new Error("Member not found");
    await ctx.db.patch(args.id, { answer: args.answer, answeredBy: member._id, answeredAt: Date.now(), status: "answered" });
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    pricePerQuestion: v.number(),
    isFree: v.boolean(),
    expertName: v.optional(v.string()),
    expertTitle: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), identity.email)).first();
    if (!user) throw new Error("User not found");
    const member = await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!member) throw new Error("Member not found");
    return await ctx.db.insert("expertCategories", { churchId: member.churchId, isActive: true, ...args });
  },
});
