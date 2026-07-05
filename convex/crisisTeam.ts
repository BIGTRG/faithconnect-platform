import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/* ── Helpers ─────────────────────────────────────────────── */
async function getChurchMember(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db.query("users").filter((q: any) => q.eq(q.field("email"), identity.email)).first();
  if (!user) return null;
  const member = await ctx.db.query("members").withIndex("by_userId", (q: any) => q.eq("userId", user._id)).first();
  return member;
}

/* ── Queries ─────────────────────────────────────────────── */
export const getTeam = query({
  args: {},
  handler: async (ctx) => {
    const member = await getChurchMember(ctx);
    if (!member) return null;
    const teams = await ctx.db.query("crisisTeams").withIndex("by_churchId", (q) => q.eq("churchId", member.churchId)).collect();
    const activeTeam = teams.find((t) => t.isActive) ?? null;
    if (!activeTeam) return null;
    const teamMembers = await ctx.db.query("crisisTeamMembers").withIndex("by_teamId", (q) => q.eq("teamId", activeTeam._id)).collect();
    const enriched = await Promise.all(teamMembers.map(async (tm) => {
      const m = await ctx.db.get(tm.memberId);
      const pairedMember = tm.pairedWith ? await ctx.db.get(tm.pairedWith) : null;
      let pairedName: string | undefined;
      if (pairedMember) {
        const pm = await ctx.db.get(pairedMember.memberId);
        pairedName = pm?.displayName ?? undefined;
      }
      return { ...tm, memberName: m?.displayName ?? "Unknown", phone: m?.phone, pairedName };
    }));
    return { ...activeTeam, members: enriched };
  },
});

export const listIncidents = query({
  args: {},
  handler: async (ctx) => {
    const member = await getChurchMember(ctx);
    if (!member) return [];
    const incidents = await ctx.db.query("crisisIncidents").withIndex("by_churchId", (q) => q.eq("churchId", member.churchId)).order("desc").take(50);
    const enriched = await Promise.all(incidents.map(async (inc) => {
      const reporter = await ctx.db.get(inc.reportedBy);
      const assignee = inc.assignedTo ? await ctx.db.get(inc.assignedTo) : null;
      return {
        ...inc,
        reporterName: reporter?.displayName ?? "Unknown",
        assigneeName: assignee?.displayName,
      };
    }));
    return enriched;
  },
});

export const getIncidentStats = query({
  args: {},
  handler: async (ctx) => {
    const member = await getChurchMember(ctx);
    if (!member) return { total: 0, active: 0, resolved: 0, dispatched: 0 };
    const incidents = await ctx.db.query("crisisIncidents").withIndex("by_churchId", (q) => q.eq("churchId", member.churchId)).collect();
    return {
      total: incidents.length,
      active: incidents.filter((i) => ["reported", "assigned", "dispatched", "in_progress"].includes(i.status)).length,
      resolved: incidents.filter((i) => ["resolved", "closed"].includes(i.status)).length,
      dispatched: incidents.filter((i) => i.status === "dispatched").length,
    };
  },
});

/* ── Mutations ───────────────────────────────────────────── */
export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    managementPartner: v.optional(v.string()),
    partnerPhone: v.optional(v.string()),
    partnerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const member = await getChurchMember(ctx);
    if (!member) throw new Error("Not authenticated");
    return await ctx.db.insert("crisisTeams", {
      churchId: member.churchId,
      leaderId: member._id,
      isActive: true,
      createdAt: Date.now(),
      ...args,
    });
  },
});

export const addTeamMember = mutation({
  args: {
    teamId: v.id("crisisTeams"),
    memberId: v.id("members"),
    role: v.union(v.literal("leader"), v.literal("coordinator"), v.literal("volunteer"), v.literal("counselor")),
    specialization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crisisTeamMembers", { ...args, isOnCall: false, joinedAt: Date.now() });
  },
});

export const pairVolunteers = mutation({
  args: {
    member1Id: v.id("crisisTeamMembers"),
    member2Id: v.id("crisisTeamMembers"),
  },
  handler: async (ctx, { member1Id, member2Id }) => {
    await ctx.db.patch(member1Id, { pairedWith: member2Id });
    await ctx.db.patch(member2Id, { pairedWith: member1Id });
  },
});

export const toggleOnCall = mutation({
  args: { teamMemberId: v.id("crisisTeamMembers") },
  handler: async (ctx, { teamMemberId }) => {
    const tm = await ctx.db.get(teamMemberId);
    if (!tm) throw new Error("Not found");
    await ctx.db.patch(teamMemberId, { isOnCall: !tm.isOnCall });
  },
});

export const reportIncident = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const member = await getChurchMember(ctx);
    if (!member) throw new Error("Not authenticated");
    const team = await ctx.db.query("crisisTeams").withIndex("by_churchId", (q) => q.eq("churchId", member.churchId)).first();
    if (!team) throw new Error("No crisis team found");
    return await ctx.db.insert("crisisIncidents", {
      churchId: member.churchId,
      teamId: team._id,
      reportedBy: member._id,
      status: "reported",
      reportedAt: Date.now(),
      ...args,
    });
  },
});

export const dispatchPair = mutation({
  args: {
    incidentId: v.id("crisisIncidents"),
    pairMemberIds: v.array(v.id("crisisTeamMembers")),
    location: v.union(v.literal("hospital"), v.literal("church"), v.literal("home"), v.literal("other")),
    address: v.optional(v.string()),
  },
  handler: async (ctx, { incidentId, pairMemberIds, location, address }) => {
    await ctx.db.patch(incidentId, {
      status: "dispatched",
      dispatchedPair: pairMemberIds,
      dispatchLocation: location,
      dispatchAddress: address,
    });
  },
});

export const updateIncidentStatus = mutation({
  args: {
    incidentId: v.id("crisisIncidents"),
    status: v.union(v.literal("reported"), v.literal("assigned"), v.literal("dispatched"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { incidentId, status, notes }) => {
    const patch: Record<string, any> = { status };
    if (notes) patch.notes = notes;
    if (status === "resolved" || status === "closed") patch.resolvedAt = Date.now();
    await ctx.db.patch(incidentId, patch);
  },
});
