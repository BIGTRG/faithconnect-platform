import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getJobs = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("jobPostings")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", args.churchId).eq("isActive", true)
      )
      .collect();
    const withPosters = await Promise.all(
      jobs.map(async (job) => {
        const poster = await ctx.db.get(job.postedBy);
        return { ...job, postedByName: poster?.displayName ?? "Church Admin" };
      })
    );
    return withPosters;
  },
});

export const getVolunteerNeeds = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("volunteerNeeds")
      .withIndex("by_church_active", (q) =>
        q.eq("churchId", args.churchId).eq("isActive", true)
      )
      .collect();
  },
});

export const createJob = mutation({
  args: {
    churchId: v.id("churches"),
    title: v.string(),
    description: v.string(),
    department: v.optional(v.string()),
    type: v.union(v.literal("full_time"), v.literal("part_time"), v.literal("contract"), v.literal("intern")),
    location: v.optional(v.string()),
    salaryRange: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    contactEmail: v.optional(v.string()),
    postedBy: v.id("members"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobPostings", {
      ...args,
      isActive: true,
      postedAt: Date.now(),
    });
  },
});

export const createVolunteerNeed = mutation({
  args: {
    churchId: v.id("churches"),
    title: v.string(),
    description: v.string(),
    ministry: v.optional(v.string()),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    spotsAvailable: v.number(),
    schedule: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    contactId: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("volunteerNeeds", {
      ...args,
      spotsFilled: 0,
      isActive: true,
      postedAt: Date.now(),
    });
  },
});
