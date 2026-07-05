import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
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

    const groups = await ctx.db
      .query("groups")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .collect();

    const withDetails = await Promise.all(
      groups.map(async (g) => {
        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_groupId", (q) => q.eq("groupId", g._id))
          .collect();
        const leader = g.leaderId ? await ctx.db.get(g.leaderId) : null;
        const isMember = members.some((m) => m.memberId === member._id);
        return {
          ...g,
          memberCount: members.length,
          leaderName: leader?.displayName ?? "No leader",
          isMember,
          currentMemberId: member._id,
        };
      }),
    );

    return withDetails;
  },
});

export const get = query({
  args: { groupId: v.id("groups") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return null;

    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    const groupMembers = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    const membersWithDetails = await Promise.all(
      groupMembers.map(async (gm) => {
        const m = await ctx.db.get(gm.memberId);
        return { ...gm, displayName: m?.displayName ?? "Unknown", avatarUrl: m?.avatarUrl };
      }),
    );

    const leader = group.leaderId ? await ctx.db.get(group.leaderId) : null;
    const isMember = groupMembers.some((m) => m.memberId === member._id);

    return {
      ...group,
      members: membersWithDetails,
      memberCount: groupMembers.length,
      leaderName: leader?.displayName ?? "No leader",
      isMember,
      currentMemberId: member._id,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("ministry"),
      v.literal("bible_study"),
      v.literal("small_group"),
      v.literal("youth"),
      v.literal("outreach"),
      v.literal("worship"),
      v.literal("other"),
    ),
    isPrivate: v.optional(v.boolean()),
    meetingSchedule: v.optional(v.string()),
    meetingLocation: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
  },
  returns: v.id("groups"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const groupId = await ctx.db.insert("groups", {
      churchId: member.churchId,
      name: args.name,
      description: args.description,
      category: args.category,
      isPrivate: args.isPrivate ?? false,
      meetingSchedule: args.meetingSchedule,
      meetingLocation: args.meetingLocation,
      maxMembers: args.maxMembers,
      leaderId: member._id,
      isActive: true,
    });

    // Auto-join as leader
    await ctx.db.insert("groupMembers", {
      groupId,
      memberId: member._id,
      role: "leader",
      joinedAt: Date.now(),
    });

    return groupId;
  },
});

export const join = mutation({
  args: { groupId: v.id("groups") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_member", (q) =>
        q.eq("groupId", args.groupId).eq("memberId", member._id),
      )
      .first();
    if (existing) return null;

    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      memberId: member._id,
      role: "member",
      joinedAt: Date.now(),
    });

    return null;
  },
});

export const leave = mutation({
  args: { groupId: v.id("groups") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const gm = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_member", (q) =>
        q.eq("groupId", args.groupId).eq("memberId", member._id),
      )
      .first();
    if (gm) {
      await ctx.db.delete(gm._id);
    }

    return null;
  },
});
