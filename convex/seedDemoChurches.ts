import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const seedDemoChurches = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already seeded — look for more than 1 church
    const existingChurches = await ctx.db.query("churches").collect();
    if (existingChurches.length >= 4) return null;

    const now = Date.now();
    const DAY = 86400000;

    const demoChurches = [
      {
        name: "New Hope Baptist Church",
        slug: "new-hope-baptist",
        denomination: "Baptist",
        city: "Houston",
        state: "Texas",
        address: "4500 MLK Boulevard",
        pastorName: "Pastor Michael Williams",
        serviceSchedule: "Sundays at 8:00 AM & 11:00 AM",
        description: "A vibrant community of believers serving Houston's Third Ward since 1952.",
        memberCount: 450,
        primaryColor: "#7c3aed",
        accentColor: "#f97316",
        subscriptionTier: "growth" as const,
        isActive: true,
        onboardingComplete: true,
        createdAt: now - 45 * DAY,
      },
      {
        name: "Cornerstone Community Fellowship",
        slug: "cornerstone-community",
        denomination: "Non-Denominational",
        city: "Dallas",
        state: "Texas",
        address: "1200 Faith Lane",
        pastorName: "Pastor David Chen",
        serviceSchedule: "Sundays at 10:00 AM",
        description: "Building faith, serving families, and reaching the community with the love of Christ.",
        memberCount: 280,
        primaryColor: "#16a34a",
        accentColor: "#9333ea",
        subscriptionTier: "starter" as const,
        isActive: true,
        onboardingComplete: true,
        createdAt: now - 30 * DAY,
      },
      {
        name: "Mount Zion AME",
        slug: "mount-zion-ame",
        denomination: "AME",
        city: "Charlotte",
        state: "North Carolina",
        address: "800 Freedom Drive",
        pastorName: "Bishop Angela Thompson",
        serviceSchedule: "Sundays at 9:30 AM & 12:00 PM",
        description: "Historic church serving the Charlotte community for over 100 years with love, faith, and service.",
        memberCount: 1200,
        primaryColor: "#1e3a5f",
        accentColor: "#eab308",
        subscriptionTier: "enterprise" as const,
        isActive: true,
        onboardingComplete: true,
        createdAt: now - 60 * DAY,
      },
      {
        name: "Living Waters Church of God",
        slug: "living-waters-cog",
        denomination: "Church of God in Christ (COGIC)",
        city: "Memphis",
        state: "Tennessee",
        address: "3300 Beale Street Extension",
        pastorName: "Elder James Franklin",
        serviceSchedule: "Sundays at 11:00 AM, Wednesdays at 7:00 PM",
        description: "Where the spirit flows freely and the Word is taught with power.",
        memberCount: 340,
        primaryColor: "#881337",
        accentColor: "#d4a373",
        subscriptionTier: "growth" as const,
        isActive: true,
        onboardingComplete: true,
        createdAt: now - 20 * DAY,
      },
      {
        name: "Faith Chapel International",
        slug: "faith-chapel-intl",
        denomination: "Pentecostal",
        city: "Miami",
        state: "Florida",
        address: "5600 Biscayne Blvd",
        pastorName: "Pastor Roberto Sanchez",
        serviceSchedule: "Sundays at 10:30 AM (English) & 1:00 PM (Spanish)",
        description: "A bilingual, multicultural house of worship serving Miami's diverse community.",
        memberCount: 620,
        primaryColor: "#0d9488",
        accentColor: "#e11d48",
        subscriptionTier: "starter" as const,
        isActive: true,
        onboardingComplete: true,
        createdAt: now - 15 * DAY,
      },
      {
        name: "Bethel Community Church",
        slug: "bethel-community",
        denomination: "Non-Denominational",
        city: "Chicago",
        state: "Illinois",
        address: "900 South Michigan Ave",
        pastorName: "Pastor Rachel Kim",
        serviceSchedule: "Sundays at 9:00 AM & 11:30 AM",
        description: "Urban ministry focused on community development, youth empowerment, and spiritual growth.",
        memberCount: 380,
        primaryColor: "#dc2626",
        accentColor: "#1d4ed8",
        subscriptionTier: "free" as const,
        isActive: true,
        onboardingComplete: true,
        createdAt: now - 5 * DAY,
      },
      {
        name: "Harvest Tabernacle",
        slug: "harvest-tabernacle",
        denomination: "Assemblies of God",
        city: "Phoenix",
        state: "Arizona",
        address: "2200 Desert View Road",
        pastorName: "Pastor Thomas Wright",
        serviceSchedule: "Sundays at 10:00 AM",
        description: "Gathering the harvest one soul at a time in the heart of the desert.",
        memberCount: 190,
        primaryColor: "#475569",
        accentColor: "#f59e0b",
        subscriptionTier: "free" as const,
        isActive: true,
        onboardingComplete: false,
        createdAt: now - 2 * DAY,
      },
    ];

    // Seed the churches with some members and data for each
    for (const churchData of demoChurches) {
      const churchId = await ctx.db.insert("churches", churchData);

      // Add a few members to each church
      const memberNames = [
        "Admin User", "Associate Pastor", "Youth Director",
        "Worship Leader", "Head Deacon", "Church Secretary",
      ];

      for (let i = 0; i < Math.min(memberNames.length, Math.floor(Math.random() * 4) + 3); i++) {
        await ctx.db.insert("members", {
          userId,
          churchId,
          role: i === 0 ? "admin" : i === 1 ? "pastor" : "leader",
          displayName: memberNames[i],
          isActive: true,
          joinedAt: now - Math.floor(Math.random() * 365) * DAY,
          isNewcomer: false,
        });
      }

      // Add some giving records
      const givingTypes = ["tithe", "offering", "mission"] as const;
      for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
        await ctx.db.insert("givingRecords", {
          churchId,
          amount: Math.floor(Math.random() * 50000) + 2500,
          type: givingTypes[i % givingTypes.length],
          paymentMethod: "trgpay",
          date: now - i * DAY,
          isRecurring: false,
        });
      }

      // Add a couple events
      await ctx.db.insert("events", {
        churchId,
        title: "Sunday Worship Service",
        startTime: now + 7 * DAY,
        endTime: now + 7 * DAY + 2 * 3600000,
        type: "service",
        isRecurring: true,
        recurringPattern: "weekly",
        createdBy: (await ctx.db.query("members").withIndex("by_churchId", (q) => q.eq("churchId", churchId)).first())!._id,
      });

      // Add a group
      await ctx.db.insert("groups", {
        churchId,
        name: "Main Bible Study",
        description: "Weekly Bible study open to all members",
        category: "bible_study",
        isPrivate: false,
        isActive: true,
      });
    }

    return null;
  },
});
