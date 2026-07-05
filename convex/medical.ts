import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listProviders = query({
  args: { churchId: v.id("churches"), specialty: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.specialty && args.specialty !== "all") {
      return await ctx.db
        .query("medicalProviders")
        .withIndex("by_church_specialty", (q) =>
          q.eq("churchId", args.churchId).eq("specialty", args.specialty as any),
        )
        .collect();
    }
    return await ctx.db
      .query("medicalProviders")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .collect();
  },
});

export const addProvider = mutation({
  args: {
    churchId: v.id("churches"),
    name: v.string(),
    practice: v.optional(v.string()),
    specialty: v.union(
      v.literal("primary_care"),
      v.literal("dentist"),
      v.literal("pediatrics"),
      v.literal("obgyn"),
      v.literal("cardiology"),
      v.literal("dermatology"),
      v.literal("orthopedics"),
      v.literal("optometry"),
      v.literal("psychiatry"),
      v.literal("physical_therapy"),
      v.literal("chiropractic"),
      v.literal("pharmacy"),
      v.literal("urgent_care"),
      v.literal("telehealth"),
      v.literal("other"),
    ),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    acceptsInsurance: v.boolean(),
    insuranceList: v.optional(v.array(v.string())),
    isFaithAligned: v.boolean(),
    isChurchMember: v.boolean(),
    offersTelemedicine: v.boolean(),
    bio: v.optional(v.string()),
    hours: v.optional(v.string()),
    addedBy: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("medicalProviders", {
      ...args,
      imageUrl: undefined,
      rating: undefined,
      isVerified: false,
      createdAt: Date.now(),
    });
  },
});

export const verifyProvider = mutation({
  args: { providerId: v.id("medicalProviders"), isVerified: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.providerId, { isVerified: args.isVerified });
  },
});
