import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const seedPhase1Data = mutation({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    // Auto-find the current user's church
    const userId = await getAuthUserId(ctx);
    if (!userId) return { error: "Not authenticated" };
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return { error: "Member not found" };
    const churchId = member.churchId;

    // Get members for this church
    const members = await ctx.db
      .query("members")
      .withIndex("by_churchId", (q) => q.eq("churchId", churchId))
      .collect();
    if (members.length === 0) return { error: "No members found" };

    // ── Seed Event Registrations ─────────────────────────────
    const events = await ctx.db
      .query("events")
      .withIndex("by_churchId", (q) => q.eq("churchId", churchId))
      .collect();
    
    let regCount = 0;
    for (const event of events) {
      // Check if already has registrations
      const existingRegs = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect();
      if (existingRegs.length > 0) continue;

      // Register random members
      const numToReg = Math.min(Math.floor(Math.random() * 15) + 5, members.length);
      const shuffled = [...members].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numToReg; i++) {
        const m = shuffled[i];
        await ctx.db.insert("eventRegistrations", {
          eventId: event._id,
          memberId: m._id,
          guestCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : undefined,
          dietaryNeeds: Math.random() > 0.8 ? ["Vegetarian", "Gluten-free", "Nut allergy", "Vegan"][Math.floor(Math.random() * 4)] : undefined,
          notes: Math.random() > 0.85 ? "Looking forward to it!" : undefined,
          status: Math.random() > 0.9 ? "waitlisted" : "registered",
          registeredAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
        regCount++;
      }

      // Check in some attendees for past events
      if (event.startTime < Date.now()) {
        const attendees = await ctx.db
          .query("eventAttendees")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();
        for (const att of attendees) {
          if (Math.random() > 0.3) {
            await ctx.db.patch(att._id, {
              checkedIn: true,
              checkedInAt: event.startTime + Math.floor(Math.random() * 1800000),
            });
          }
        }
      }
    }

    // ── Seed Notifications ───────────────────────────────────
    const notifTemplates = [
      { title: "Sunday Service Reminder", body: "Don't forget! Sunday worship service at 10:00 AM. See you there.", type: "event_reminder" as const, linkTo: "/events" },
      { title: "New Announcement", body: "Pastor James posted a new announcement about the upcoming revival week.", type: "announcement" as const, linkTo: "/announcements" },
      { title: "Prayer Answered!", body: "Sister Williams' prayer request for healing has been marked as answered. Praise God!", type: "prayer_update" as const, linkTo: "/prayers" },
      { title: "Gift Received", body: "Your tithe of $150.00 has been processed. Thank you for your generosity.", type: "giving_receipt" as const, linkTo: "/giving" },
      { title: "New Group Message", body: "Deacon Brown posted in the Men's Fellowship group.", type: "group_message" as const, linkTo: "/groups" },
      { title: "Life Event: New Baby!", body: "Congratulations to the Johnson family on the birth of baby Grace!", type: "life_event" as const, linkTo: "/life-events" },
      { title: "Crisis Alert", body: "A member in your area needs immediate prayer support. Check the Crisis Team dashboard.", type: "crisis_alert" as const, linkTo: "/crisis-team" },
      { title: "Welcome to FaithConnect!", body: "We're glad you're here. Explore your church community, join groups, and stay connected.", type: "welcome" as const, linkTo: "/welcome" },
      { title: "Bible Study Tonight", body: "Join us at 7 PM for Wednesday night Bible study. Topic: The Book of James.", type: "event_reminder" as const, linkTo: "/events" },
      { title: "Volunteer Opportunity", body: "The food pantry needs volunteers this Saturday from 9 AM - 12 PM.", type: "general" as const, linkTo: "/job-board" },
      { title: "VBS Registration Open", body: "Vacation Bible School registration is now open for ages 4-12. Space is limited!", type: "announcement" as const, linkTo: "/events" },
      { title: "Giving Statement Ready", body: "Your 2025 giving statement is now available for download.", type: "giving_receipt" as const, linkTo: "/giving" },
    ];

    let notifCount = 0;
    for (const m of members.slice(0, 30)) {
      // Give each member 3-8 notifications
      const numNotifs = Math.floor(Math.random() * 6) + 3;
      const shuffledNotifs = [...notifTemplates].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numNotifs && i < shuffledNotifs.length; i++) {
        const template = shuffledNotifs[i];
        await ctx.db.insert("notifications", {
          churchId,
          memberId: m._id,
          title: template.title,
          body: template.body,
          type: template.type,
          linkTo: template.linkTo,
          isRead: Math.random() > 0.4,
          createdAt: Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000),
        });
        notifCount++;
      }
    }

    return {
      eventRegistrations: regCount,
      notifications: notifCount,
      message: "Phase 1 demo data seeded successfully",
    };
  },
});
