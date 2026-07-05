import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export const createChurch = mutation({
  args: {
    name: v.string(),
    denomination: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    address: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    pastorName: v.optional(v.string()),
    serviceSchedule: v.optional(v.string()),
    description: v.optional(v.string()),
    memberCount: v.optional(v.number()),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    adminDisplayName: v.string(),
    adminPhone: v.optional(v.string()),
  },
  returns: v.object({
    churchId: v.id("churches"),
    memberId: v.id("members"),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate unique slug
    let slug = generateSlug(args.name);
    const existingSlug = await ctx.db
      .query("churches")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existingSlug) {
      slug = slug + "-" + Date.now().toString(36).slice(-4);
    }

    const churchId = await ctx.db.insert("churches", {
      name: args.name,
      slug,
      denomination: args.denomination,
      city: args.city,
      state: args.state,
      address: args.address,
      zipCode: args.zipCode,
      phone: args.phone,
      email: args.email,
      website: args.website,
      pastorName: args.pastorName,
      serviceSchedule: args.serviceSchedule,
      description: args.description,
      memberCount: args.memberCount,
      primaryColor: args.primaryColor || "#4338ca",
      accentColor: args.accentColor || "#d97706",
      subscriptionTier: "free",
      isActive: true,
      onboardingComplete: true,
      createdAt: Date.now(),
      featuresEnabled: [
        "dashboard", "directory", "groups", "prayers", "announcements",
        "events", "sermons", "giving", "testimonies", "ai_concierge",
        "social_feed", "meet_pastor", "church_news", "awards",
        "worship_radio", "growth_tracker", "support", "certificates",
        "expert_qa", "help_center", "crisis_team", "life_events",
        "therapist", "mental_health", "medical", "church_store",
        "book_library", "faithmatch", "marketplace",
      ],
    });

    const memberId = await ctx.db.insert("members", {
      userId,
      churchId,
      role: "admin",
      displayName: args.adminDisplayName,
      phone: args.adminPhone,
      isActive: true,
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
      isNewcomer: false,
    });

    return { churchId, memberId };
  },
});

export const getMyChurches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const churches = [];
    for (const m of memberships) {
      const church = await ctx.db.get(m.churchId);
      if (church && church.isActive !== false) {
        churches.push({
          ...church,
          memberRole: m.role,
          memberId: m._id,
        });
      }
    }
    return churches;
  },
});

export const checkSlugAvailable = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const existing = await ctx.db
      .query("churches")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    return !existing;
  },
});
