import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Auth Hardening: Role-Based Permissions ──────────────────

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 100,
  admin: 90,
  pastor: 80,
  associate_pastor: 70,
  elder: 60,
  deacon: 50,
  leader: 40,
  volunteer: 30,
  member: 20,
  visitor: 10,
};

export const getMyRole = query({
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

    // Check if super admin
    const platformAdmin = await ctx.db
      .query("platformAdmins")
      .collect();
    const isSuperAdmin = platformAdmin.some((a) => a.userId === userId);

    return {
      memberId: member._id,
      role: member.role,
      churchId: member.churchId,
      isSuperAdmin,
      permissions: getPermissionsForRole(member.role, isSuperAdmin),
    };
  },
});

function getPermissionsForRole(role: string, isSuperAdmin: boolean) {
  const level = ROLE_HIERARCHY[role] ?? 10;
  return {
    canManageMembers: level >= 40 || isSuperAdmin,
    canManageEvents: level >= 30 || isSuperAdmin,
    canManageGroups: level >= 40 || isSuperAdmin,
    canManageAnnouncements: level >= 40 || isSuperAdmin,
    canManageSermons: level >= 50 || isSuperAdmin,
    canManageGiving: level >= 70 || isSuperAdmin,
    canManageSettings: level >= 80 || isSuperAdmin,
    canManageCrisisTeam: level >= 60 || isSuperAdmin,
    canViewReports: level >= 50 || isSuperAdmin,
    canApproveContent: level >= 40 || isSuperAdmin,
    canManageStore: level >= 60 || isSuperAdmin,
    canCheckInChildren: level >= 30 || isSuperAdmin,
    canManageJobs: level >= 50 || isSuperAdmin,
    canBroadcastNotifications: level >= 50 || isSuperAdmin,
    isSuperAdmin,
  };
}

export const updateMemberRole = mutation({
  args: {
    memberId: v.id("members"),
    newRole: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const actor = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!actor) throw new Error("Member not found");

    const actorLevel = ROLE_HIERARCHY[actor.role] ?? 10;
    const targetLevel = ROLE_HIERARCHY[args.newRole] ?? 10;

    // Can only assign roles below your own level
    if (targetLevel >= actorLevel) {
      throw new Error("Cannot assign a role equal to or higher than your own");
    }

    await ctx.db.patch(args.memberId, { role: args.newRole as "admin" | "pastor" | "leader" | "member" | "visitor" });
    return null;
  },
});

export const getSecurityLog = query({
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
    
    // Return last login info from member record
    return {
      lastActiveAt: member.lastActiveAt ?? null,
      joinedAt: member._creationTime,
      role: member.role,
      email: member.email ?? null,
      isActive: member.isActive,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.displayName = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.email !== undefined) updates.email = args.email;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(member._id, updates);
    }
    return null;
  },
});

export const deactivateMember = mutation({
  args: { memberId: v.id("members") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const actor = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!actor) throw new Error("Member not found");

    const actorLevel = ROLE_HIERARCHY[actor.role] ?? 10;
    if (actorLevel < 40) throw new Error("Insufficient permissions");

    await ctx.db.patch(args.memberId, { isActive: false });
    return null;
  },
});
