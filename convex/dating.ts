import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyProfile = query({
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

    const profile = await ctx.db
      .query("datingProfiles")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .first();

    return profile ? { ...profile, member } : { member, noProfile: true };
  },
});

export const browseProfiles = query({
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

    const myProfile = await ctx.db
      .query("datingProfiles")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .first();

    const profiles = await ctx.db
      .query("datingProfiles")
      .withIndex("by_church_visible", (q) =>
        q.eq("churchId", member.churchId).eq("isVisible", true),
      )
      .collect();

    // Exclude own profile
    const filtered = profiles.filter((p) => p.memberId !== member._id);

    // Get member details and like status for each
    const withDetails = await Promise.all(
      filtered.map(async (p) => {
        const m = await ctx.db.get(p.memberId);
        let hasLiked = false;
        let isMatch = false;
        if (myProfile) {
          const like = await ctx.db
            .query("datingLikes")
            .withIndex("by_from_to", (q) =>
              q.eq("fromProfileId", myProfile._id).eq("toProfileId", p._id),
            )
            .first();
          hasLiked = !!like;
          isMatch = !!like?.isMatch;
        }
        return {
          ...p,
          displayName: m?.displayName ?? "Unknown",
          avatarUrl: m?.avatarUrl,
          hasLiked,
          isMatch,
        };
      }),
    );

    return withDetails;
  },
});

export const getMatches = query({
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

    const myProfile = await ctx.db
      .query("datingProfiles")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .first();
    if (!myProfile) return [];

    const sentLikes = await ctx.db
      .query("datingLikes")
      .withIndex("by_fromProfileId", (q) => q.eq("fromProfileId", myProfile._id))
      .collect();
    const matches = sentLikes.filter((l) => l.isMatch);

    const withDetails = await Promise.all(
      matches.map(async (l) => {
        const profile = await ctx.db.get(l.toProfileId);
        if (!profile) return null;
        const m = await ctx.db.get(profile.memberId);
        return {
          ...profile,
          displayName: m?.displayName ?? "Unknown",
          avatarUrl: m?.avatarUrl,
          matchedAt: l.createdAt,
        };
      }),
    );

    return withDetails.filter(Boolean);
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    headline: v.optional(v.string()),
    aboutMe: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    ageRange: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    interestedIn: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("everyone"))),
    favoriteVerse: v.optional(v.string()),
    hobbies: v.optional(v.array(v.string())),
    churchInvolvement: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
  },
  returns: v.id("datingProfiles"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const existing = await ctx.db
      .query("datingProfiles")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("datingProfiles", {
      churchId: member.churchId,
      memberId: member._id,
      headline: args.headline,
      aboutMe: args.aboutMe,
      lookingFor: args.lookingFor,
      ageRange: args.ageRange,
      gender: args.gender,
      interestedIn: args.interestedIn,
      favoriteVerse: args.favoriteVerse,
      hobbies: args.hobbies,
      churchInvolvement: args.churchInvolvement,
      isVisible: args.isVisible ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const likeProfile = mutation({
  args: { profileId: v.id("datingProfiles") },
  returns: v.object({ isMatch: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const myProfile = await ctx.db
      .query("datingProfiles")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .first();
    if (!myProfile) throw new Error("Create a profile first");

    // Check if already liked
    const existing = await ctx.db
      .query("datingLikes")
      .withIndex("by_from_to", (q) =>
        q.eq("fromProfileId", myProfile._id).eq("toProfileId", args.profileId),
      )
      .first();
    if (existing) return { isMatch: existing.isMatch };

    // Check if they already liked us (mutual match)
    const theirLike = await ctx.db
      .query("datingLikes")
      .withIndex("by_from_to", (q) =>
        q.eq("fromProfileId", args.profileId).eq("toProfileId", myProfile._id),
      )
      .first();

    const isMatch = !!theirLike;

    await ctx.db.insert("datingLikes", {
      fromProfileId: myProfile._id,
      toProfileId: args.profileId,
      isMatch,
      createdAt: Date.now(),
    });

    // Update their like to reflect the match too
    if (theirLike && !theirLike.isMatch) {
      await ctx.db.patch(theirLike._id, { isMatch: true });
    }

    return { isMatch };
  },
});
