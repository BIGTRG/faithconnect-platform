import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ALL_MILESTONES = [
  { type: "salvation", title: "Salvation", emoji: "✝️", order: 1 },
  { type: "baptism", title: "Baptism", emoji: "💧", order: 2 },
  { type: "first_group", title: "Joined First Group", emoji: "👥", order: 3 },
  { type: "first_volunteer", title: "First Volunteer Service", emoji: "🤝", order: 4 },
  { type: "first_tithe", title: "First Tithe", emoji: "💝", order: 5 },
  { type: "read_bible_30", title: "30-Day Bible Reading", emoji: "📖", order: 6 },
  { type: "prayer_warrior", title: "Prayer Warrior (100 Prayers)", emoji: "🙏", order: 7 },
  { type: "mentorship", title: "Mentorship Program", emoji: "🎓", order: 8 },
  { type: "leader_training", title: "Leader Training", emoji: "⭐", order: 9 },
  { type: "missions_trip", title: "Missions Trip", emoji: "🌍", order: 10 },
];

export const getMyJourney = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { milestones: [], allMilestones: ALL_MILESTONES, progress: 0 };
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return { milestones: [], allMilestones: ALL_MILESTONES, progress: 0 };
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!member) return { milestones: [], allMilestones: ALL_MILESTONES, progress: 0 };
    const achieved = await ctx.db
      .query("growthMilestones")
      .withIndex("by_church_member", (q) =>
        q.eq("churchId", member.churchId).eq("memberId", member._id),
      )
      .collect();
    const progress = Math.round((achieved.length / ALL_MILESTONES.length) * 100);
    return { milestones: achieved, allMilestones: ALL_MILESTONES, progress };
  },
});

export const addMilestone = mutation({
  args: {
    type: v.union(
      v.literal("salvation"),
      v.literal("baptism"),
      v.literal("first_group"),
      v.literal("first_volunteer"),
      v.literal("first_tithe"),
      v.literal("read_bible_30"),
      v.literal("prayer_warrior"),
      v.literal("mentorship"),
      v.literal("leader_training"),
      v.literal("missions_trip"),
      v.literal("custom"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    badgeEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!member) throw new Error("Member not found");
    return await ctx.db.insert("growthMilestones", {
      churchId: member.churchId,
      memberId: member._id,
      achievedAt: Date.now(),
      ...args,
    });
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!member) return [];
    const allMembers = await ctx.db
      .query("members")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", member.churchId).eq("isActive", true),
      )
      .take(100);
    const leaderboard = await Promise.all(
      allMembers.map(async (m) => {
        const milestones = await ctx.db
          .query("growthMilestones")
          .withIndex("by_church_member", (q) =>
            q.eq("churchId", member.churchId).eq("memberId", m._id),
          )
          .collect();
        return {
          memberId: m._id,
          name: m.displayName,
          count: milestones.length,
          progress: Math.round((milestones.length / ALL_MILESTONES.length) * 100),
        };
      }),
    );
    return leaderboard.filter((l) => l.count > 0).sort((a, b) => b.count - a.count);
  },
});

export const getPartner = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!member) return null;
    const pair = await ctx.db
      .query("accountabilityPairs")
      .withIndex("by_member1", (q) => q.eq("member1Id", member._id))
      .first();
    if (pair) {
      const partner = await ctx.db.get(pair.member2Id);
      return { ...pair, partnerName: partner?.displayName ?? "Unknown" };
    }
    const pair2 = await ctx.db
      .query("accountabilityPairs")
      .withIndex("by_member2", (q) => q.eq("member2Id", member._id))
      .first();
    if (pair2) {
      const partner = await ctx.db.get(pair2.member1Id);
      return { ...pair2, partnerName: partner?.displayName ?? "Unknown" };
    }
    return null;
  },
});
