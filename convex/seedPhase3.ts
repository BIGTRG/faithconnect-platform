import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const seedPhase3 = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return null;
    const churchId = member.churchId;

    // Check if Phase 3 data already seeded
    const existingOnboarding = await ctx.db
      .query("stripeOnboardingStatus")
      .withIndex("by_churchId", (q) => q.eq("churchId", churchId))
      .first();

    if (existingOnboarding) return null;

    const now = Date.now();

    // ── Stripe Onboarding Status (completed) ──────────────
    await ctx.db.insert("stripeOnboardingStatus", {
      churchId,
      status: "active",
      stripeAccountId: "acct_1Nv2r4Grace2026",
      businessType: "non_profit",
      contactEmail: "finance@gracecommunity.org",
      contactPhone: "(404) 555-0100",
      bankLast4: "4567",
      bankName: "Chase Bank",
      payoutsEnabled: true,
      paymentsEnabled: true,
      currentStep: 4,
      completedSteps: ["business_info", "bank_info", "revenue_sharing", "review_submit"],
      submittedAt: now - 14 * 86400000,
      activatedAt: now - 12 * 86400000,
      revenueShareBookPercent: 50,
      revenueShareStorePercent: 20,
      revenueShareMarketplacePercent: 20,
      monthlyVolume: 45000,
      updatedAt: now,
    });

    // ── Error Logs (realistic mix) ────────────────────────
    const errorLogs = [
      { severity: "info" as const, source: "auth", message: "Demo user signed in successfully", createdAt: now - 2 * 3600000 },
      { severity: "info" as const, source: "seed", message: "Phase 2 data seeded for Grace Community Church", createdAt: now - 4 * 3600000 },
      { severity: "warning" as const, source: "giving", message: "Rate limit approaching for member rapid transactions (8/10 in window)", createdAt: now - 6 * 3600000 },
      { severity: "error" as const, source: "notification", message: "Failed to deliver push notification: FCM token expired for member mx7cnhfm464c", createdAt: now - 8 * 3600000, resolved: true, resolvedAt: now - 7 * 3600000 },
      { severity: "warning" as const, source: "ai_concierge", message: "AI response latency exceeded 3s threshold (4.2s)", createdAt: now - 12 * 3600000 },
      { severity: "info" as const, source: "stripe", message: "Payout of $2,340.00 initiated to Chase Bank ending 4567", createdAt: now - 18 * 3600000 },
      { severity: "error" as const, source: "file_upload", message: "Image upload failed: file size exceeds 10MB limit", createdAt: now - 24 * 3600000, resolved: true, resolvedAt: now - 23 * 3600000 },
      { severity: "warning" as const, source: "database", message: "Query performance degraded: members collection scan took 340ms", createdAt: now - 30 * 3600000 },
      { severity: "info" as const, source: "auth", message: "Password reset email sent to sarah.mitchell@email.com", createdAt: now - 36 * 3600000 },
      { severity: "error" as const, source: "api", message: "External API timeout: Bible verse lookup service unreachable", createdAt: now - 48 * 3600000, resolved: true, resolvedAt: now - 47 * 3600000 },
      { severity: "info" as const, source: "event", message: "Event registration capacity reached for Youth Bible Study (50/50)", createdAt: now - 52 * 3600000 },
      { severity: "warning" as const, source: "security", message: "3 failed login attempts from IP 192.168.1.45 in 5 minutes", createdAt: now - 60 * 3600000 },
      { severity: "info" as const, source: "giving", message: "Weekly giving report generated: $8,450 from 34 transactions", createdAt: now - 72 * 3600000 },
      { severity: "error" as const, source: "email", message: "SMTP connection failed: email service temporarily unavailable", createdAt: now - 96 * 3600000, resolved: true, resolvedAt: now - 95 * 3600000 },
      { severity: "info" as const, source: "backup", message: "Database backup completed successfully (2.3GB compressed)", createdAt: now - 120 * 3600000 },
    ];

    for (const log of errorLogs) {
      await ctx.db.insert("errorLogs", {
        churchId,
        severity: log.severity,
        source: log.source,
        message: log.message,
        userId,
        resolved: log.resolved ?? false,
        resolvedAt: log.resolvedAt,
        createdAt: log.createdAt,
      });
    }

    // ── Analytics Snapshots (12 weeks) ────────────────────
    for (let i = 11; i >= 0; i--) {
      const weekDate = now - i * 7 * 86400000;
      const baseMembers = 280 + (11 - i) * 6;
      const seasonalMultiplier = 0.85 + Math.sin((11 - i) * 0.5) * 0.15;
      await ctx.db.insert("analyticsSnapshots", {
        churchId,
        period: "weekly",
        date: weekDate,
        memberCount: baseMembers + Math.floor(Math.random() * 10),
        activeMembers: Math.floor(baseMembers * 0.72 + Math.random() * 15),
        newMembers: Math.floor(3 + Math.random() * 8),
        totalGiving: Math.round((6500 + Math.random() * 4000) * seasonalMultiplier),
        averageAttendance: Math.floor(180 + Math.random() * 60),
        eventCount: Math.floor(3 + Math.random() * 5),
        groupEngagement: Math.floor(45 + Math.random() * 30),
        prayerRequests: Math.floor(8 + Math.random() * 12),
        newTestimonies: Math.floor(1 + Math.random() * 4),
        storeRevenue: Math.round(800 + Math.random() * 1200),
        marketplaceRevenue: Math.round(1500 + Math.random() * 2500),
        bookRevenue: Math.round(400 + Math.random() * 800),
      });
    }

    // ── Compliance Checks ─────────────────────────────────
    const complianceChecks = [
      { category: "HIPAA Compliance", checkName: "PHI Data Encryption at Rest", status: "passed" as const, description: "All protected health information encrypted using AES-256." },
      { category: "HIPAA Compliance", checkName: "PHI Data Encryption in Transit", status: "passed" as const, description: "TLS 1.3 enforced for all data transmission." },
      { category: "HIPAA Compliance", checkName: "Access Controls for Health Data", status: "passed" as const, description: "Role-based access restricts health data to authorized roles." },
      { category: "HIPAA Compliance", checkName: "Audit Trail for PHI Access", status: "passed" as const, description: "All health record access logged with timestamps." },
      { category: "HIPAA Compliance", checkName: "Business Associate Agreement", status: "warning" as const, description: "BAA template available but not signed by all vendors.", recommendation: "Execute BAAs with Convex and Stripe." },
      { category: "Data Privacy", checkName: "Privacy Policy", status: "passed" as const, description: "Comprehensive privacy policy published." },
      { category: "Data Privacy", checkName: "Data Subject Access Requests", status: "passed" as const, description: "Members can export personal data." },
      { category: "Data Privacy", checkName: "Right to Deletion", status: "warning" as const, description: "Giving records retained for tax compliance.", recommendation: "Disclose financial record retention." },
      { category: "Payment Security", checkName: "Card Data Handling", status: "passed" as const, description: "No card data stored. Stripe handles all payment data." },
      { category: "Payment Security", checkName: "Transaction Logging", status: "passed" as const, description: "All transactions logged with unique IDs." },
      { category: "Application Security", checkName: "Input Validation", status: "passed" as const, description: "All inputs sanitized against XSS and injection." },
      { category: "Application Security", checkName: "Rate Limiting", status: "passed" as const, description: "Sensitive operations rate-limited per user." },
      { category: "Application Security", checkName: "MFA", status: "failed" as const, description: "Multi-factor auth not implemented for admins.", recommendation: "Implement TOTP-based MFA." },
    ];

    for (const check of complianceChecks) {
      await ctx.db.insert("complianceChecks", {
        churchId,
        category: check.category,
        checkName: check.checkName,
        status: check.status,
        description: check.description,
        recommendation: check.recommendation,
        lastChecked: now,
        checkedBy: "FaithConnect Automated Assessment",
      });
    }

    return null;
  },
});
