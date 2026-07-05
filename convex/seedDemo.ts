import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/* Force-reseed: deletes all demo data and re-creates it */
export const reseedDemoData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete all churches and cascade
    const churches = await ctx.db.query("churches").collect();
    for (const c of churches) {
      // Delete members
      const members = await ctx.db.query("members").withIndex("by_churchId", (q: any) => q.eq("churchId", c._id)).collect();
      for (const m of members) await ctx.db.delete(m._id);
      // Delete other tables
      const tables = [
        "groups", "events", "announcements", "prayerRequests", "sermons",
        "testimonies", "givingRecords", "socialPosts", "pastorProfiles",
        "churchNews", "awards", "storeProducts", "bookLibrary", "lifeEvents",
        "therapists", "mentalHealthResources", "medicalProviders",
        "expertCategories", "helpResources", "worshipTracks", "supportRooms",
        "growthMilestones",
      ] as const;
      for (const t of tables) {
        try {
          const rows = await ctx.db.query(t).withIndex("by_churchId", (q: any) => q.eq("churchId", c._id)).collect();
          for (const r of rows) await ctx.db.delete(r._id);
        } catch { /* table may not have this index */ }
      }
      // Crisis tables
      const teams = await ctx.db.query("crisisTeams").withIndex("by_churchId", (q: any) => q.eq("churchId", c._id)).collect();
      for (const t of teams) {
        const tms = await ctx.db.query("crisisTeamMembers").withIndex("by_teamId", (q: any) => q.eq("teamId", t._id)).collect();
        for (const tm of tms) await ctx.db.delete(tm._id);
        const incs = await ctx.db.query("crisisIncidents").withIndex("by_teamId", (q: any) => q.eq("teamId", t._id)).collect();
        for (const inc of incs) await ctx.db.delete(inc._id);
        await ctx.db.delete(t._id);
      }
      await ctx.db.delete(c._id);
    }

    return null;
  },
});

export const seedDemoData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    // Check if already seeded (member exists)
    const existing = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Always ensure demo user is admin
      if (existing.role !== "admin") {
        await ctx.db.patch(existing._id, { role: "admin" as const, displayName: "Demo Admin" });
      }
      // Already seeded — just ensure crisis team has new fields
      const churchId = existing.churchId;
      const oldTeam = await ctx.db.query("crisisTeams")
        .withIndex("by_churchId", (q) => q.eq("churchId", churchId)).first();
      if (oldTeam && !oldTeam.managementPartner) {
        // Delete old crisis data and let it be recreated below
        const oldMembers = await ctx.db.query("crisisTeamMembers")
          .withIndex("by_teamId", (q) => q.eq("teamId", oldTeam._id)).collect();
        for (const m of oldMembers) await ctx.db.delete(m._id);
        const oldIncs = await ctx.db.query("crisisIncidents")
          .withIndex("by_teamId", (q) => q.eq("teamId", oldTeam._id)).collect();
        for (const inc of oldIncs) await ctx.db.delete(inc._id);
        await ctx.db.delete(oldTeam._id);
        // Get all member IDs for crisis team seeding
        const allMembers = await ctx.db.query("members")
          .withIndex("by_churchId", (q) => q.eq("churchId", churchId)).collect();
        const mIds = allMembers.map((m) => m._id);
        const demoId = existing._id;
        // Re-seed crisis team with One Care model
        const teamId = await ctx.db.insert("crisisTeams", {
          churchId, name: "Grace Community Crisis Response",
          description: "Church-led crisis response team supported by One Care Crisis Network. Volunteers serve in pairs and are dispatched to hospitals, churches, and homes.",
          leaderId: demoId, managementPartner: "One Care Crisis Network",
          partnerPhone: "(800) 555-0199", partnerEmail: "dispatch@onecare.network",
          isActive: true, createdAt: now,
        });
        await ctx.db.insert("crisisTeamMembers", { teamId, memberId: mIds[4] ?? demoId, role: "coordinator", specialization: "Crisis intake & dispatch", isOnCall: true, joinedAt: now });
        const v1 = await ctx.db.insert("crisisTeamMembers", { teamId, memberId: mIds[6] ?? demoId, role: "volunteer", specialization: "Hospital visits", isOnCall: true, joinedAt: now });
        const v2 = await ctx.db.insert("crisisTeamMembers", { teamId, memberId: mIds[8] ?? demoId, role: "volunteer", specialization: "Hospital visits", isOnCall: true, joinedAt: now });
        await ctx.db.patch(v1, { pairedWith: v2 }); await ctx.db.patch(v2, { pairedWith: v1 });
        const v3 = await ctx.db.insert("crisisTeamMembers", { teamId, memberId: mIds[5] ?? demoId, role: "volunteer", specialization: "Home visits & meals", isOnCall: false, joinedAt: now });
        const v4 = await ctx.db.insert("crisisTeamMembers", { teamId, memberId: mIds[9] ?? demoId, role: "volunteer", specialization: "Home visits & prayer", isOnCall: false, joinedAt: now });
        await ctx.db.patch(v3, { pairedWith: v4 }); await ctx.db.patch(v4, { pairedWith: v3 });
        await ctx.db.insert("crisisTeamMembers", { teamId, memberId: mIds[1] ?? demoId, role: "counselor", specialization: "Pastoral crisis counseling", isOnCall: true, joinedAt: now });
        await ctx.db.insert("crisisIncidents", { churchId, teamId, reportedBy: mIds[7] ?? demoId, title: "Member hospitalized — cardiac event", description: "Brother Thomas Jackson admitted to Emory Hospital after a heart episode.", severity: "high", status: "dispatched", dispatchedPair: [v1, v2], dispatchLocation: "hospital", dispatchAddress: "Emory University Hospital, 1364 Clifton Rd NE", reportedAt: now - 2*86400000 });
        await ctx.db.insert("crisisIncidents", { churchId, teamId, reportedBy: mIds[3] ?? demoId, title: "Family house fire — Johnson residence", description: "The Johnson family lost their home to a fire. Four family members displaced.", severity: "critical", status: "in_progress", assignedTo: mIds[4] ?? demoId, dispatchedPair: [v3, v4], dispatchLocation: "home", dispatchAddress: "428 Maple Drive, Decatur GA 30030", reportedAt: now - 5*86400000, notes: "Red Cross contacted. Temporary housing secured." });
        await ctx.db.insert("crisisIncidents", { churchId, teamId, reportedBy: demoId, title: "Bereavement — Sister Martha Collins", description: "Sister Martha's husband of 42 years passed away peacefully.", severity: "medium", status: "resolved", resolvedAt: now - 3*86400000, dispatchLocation: "church", dispatchAddress: "Grace Community Church — Chapel", reportedAt: now - 10*86400000, notes: "Funeral held at church. Grief support group connected." });
      }
      return null;
    }

    // ── Church ──
    let church = await ctx.db.query("churches").first();
    if (!church) {
      const cId = await ctx.db.insert("churches", {
        name: "Grace Community Church",
        slug: "grace-community",
        address: "1234 Faith Avenue",
        city: "Atlanta",
        state: "Georgia",
        zipCode: "30301",
        phone: "(404) 555-0100",
        email: "info@gracecommunity.org",
        website: "https://gracecommunity.org",
        timezone: "America/New_York",
        description:
          "A vibrant, multi-generational church committed to faith, family, and community since 1985.",
        pastorName: "Pastor David Johnson",
        denomination: "Non-Denominational",
        foundedYear: 1985,
        serviceSchedule: "Sundays at 9:00 AM and 11:00 AM",
        primaryColor: "#4338ca",
        accentColor: "#d97706",
        subscriptionTier: "enterprise",
        isActive: true,
        onboardingComplete: true,
        createdAt: Date.now() - 90 * 86400000,
        memberCount: 350,
      });
      church = (await ctx.db.get(cId))!;
    }
    const churchId = church._id;

    // ── Demo member (admin) ──
    const demoId = await ctx.db.insert("members", {
      userId,
      churchId,
      role: "admin",
      displayName: "Demo Admin",
      phone: "(404) 555-0100",
      bio: "Church administrator exploring FaithConnect.",
      interests: ["Technology", "Community Building", "Worship"],
      skills: ["Leadership", "Administration"],
      isActive: true,
      joinedAt: now,
      isNewcomer: false,
    });

    // ── Helper members (using demo userId -- only for display) ──
    const names = [
      { n: "Sarah Mitchell", r: "pastor" as const, bio: "Associate Pastor" },
      { n: "James Anderson", r: "leader" as const, bio: "Youth Ministry Director" },
      { n: "Maria Garcia", r: "leader" as const, bio: "Worship team lead" },
      { n: "Robert Williams", r: "member" as const, bio: "Deacon, outreach coordinator" },
      { n: "Lisa Thompson", r: "member" as const, bio: "Children's ministry volunteer" },
      { n: "Michael Brown", r: "member" as const, bio: "Men's group facilitator" },
      { n: "Jennifer Davis", r: "member" as const, bio: "Choir director" },
      { n: "David Wilson", r: "member" as const, bio: "Sunday school teacher" },
      { n: "Angela Martinez", r: "member" as const, bio: "Prayer team intercessor" },
      { n: "Chris Taylor", r: "visitor" as const, bio: "New to the church" },
    ];
    const mIds: any[] = [demoId];
    for (const m of names) {
      const mid = await ctx.db.insert("members", {
        userId,
        churchId,
        role: m.r,
        displayName: m.n,
        phone: `(404) 555-${String(mIds.length).padStart(4, "0")}`,
        bio: m.bio,
        isActive: true,
        joinedAt: now - Math.random() * 365 * 86400000,
        isNewcomer: m.r === "visitor",
      });
      mIds.push(mid);
    }

    // ── Groups ──
    const groups = [
      { name: "Men's Bible Study", cat: "bible_study" as const, desc: "Weekly deep-dive into Scripture. Wednesdays at 7 PM." },
      { name: "Women's Fellowship", cat: "small_group" as const, desc: "Connection, prayer, and encouragement for women." },
      { name: "Youth Ignite", cat: "youth" as const, desc: "High-energy youth group for ages 13-18." },
      { name: "Worship Team", cat: "worship" as const, desc: "Rehearsals, planning, and serving through music." },
      { name: "Community Outreach", cat: "outreach" as const, desc: "Food drives, tutoring, and neighborhood service." },
    ];
    for (const g of groups) {
      await ctx.db.insert("groups", {
        churchId,
        name: g.name,
        description: g.desc,
        category: g.cat,
        isPrivate: false,
        meetingSchedule: "Weekly",
        isActive: true,
      });
    }

    // ── Events ──
    const events = [
      { title: "Sunday Worship Service", desc: "Praise, worship, and the Word.", dt: 2, loc: "Main Sanctuary", tp: "service" as const },
      { title: "Community Food Drive", desc: "Collecting food for local families.", dt: 5, loc: "Church Parking Lot", tp: "outreach" as const },
      { title: "Youth Summer Camp Info Night", desc: "Learn about summer camp for teens.", dt: 7, loc: "Fellowship Hall", tp: "youth" as const },
      { title: "Marriage Enrichment Workshop", desc: "Strengthening marriages through faith.", dt: 10, loc: "Room 204", tp: "fellowship" as const },
      { title: "Easter Planning Meeting", desc: "Volunteer coordination for Easter.", dt: 14, loc: "Conference Room", tp: "meeting" as const },
    ];
    for (const e of events) {
      await ctx.db.insert("events", {
        churchId,
        title: e.title,
        description: e.desc,
        startTime: now + e.dt * 86400000,
        endTime: now + e.dt * 86400000 + 7200000,
        location: e.loc,
        type: e.tp,
        isRecurring: false,
        maxAttendees: 200,
        createdBy: demoId,
      });
    }

    // ── Announcements ──
    const anns = [
      { title: "New Parking Lot Now Open", content: "Our expanded parking lot is officially open! Please use the new south entrance.", cat: "general" as const },
      { title: "VBS Registration Open", content: "Vacation Bible School is July 14-18. Register your kids today!", cat: "event" as const },
      { title: "Building Fund Update", content: "We have reached 73% of our building fund goal. Thank you for your generous giving.", cat: "general" as const },
    ];
    for (const a of anns) {
      await ctx.db.insert("announcements", {
        churchId,
        authorId: demoId,
        title: a.title,
        content: a.content,
        category: a.cat,
        isPinned: false,
        publishedAt: now - Math.random() * 7 * 86400000,
      });
    }

    // ── Prayer Requests ──
    const prayers = [
      { title: "Healing for my mother", content: "My mom is undergoing surgery next week. Pray for a successful procedure and quick recovery.", cat: "health" as const },
      { title: "Job transition guidance", content: "Facing a career change and need wisdom and peace about the next steps.", cat: "work" as const },
      { title: "Family restoration", content: "Praying for reconciliation in our family. God can heal all wounds.", cat: "family" as const },
      { title: "Safe travel mercies", content: "Our mission team is traveling to Guatemala next month.", cat: "other" as const },
    ];
    for (const p of prayers) {
      await ctx.db.insert("prayerRequests", {
        churchId,
        memberId: demoId,
        title: p.title,
        content: p.content,
        isAnonymous: false,
        isAnswered: false,
        prayerCount: Math.floor(Math.random() * 20) + 3,
        category: p.cat,
      });
    }

    // ── Sermons ──
    const sermons = [
      { title: "Walking in Purpose", speaker: "Pastor David Johnson", desc: "Discovering God's unique plan for your life.", series: "Identity Series" },
      { title: "The Power of Community", speaker: "Pastor Sarah Mitchell", desc: "Why we were never meant to walk alone.", series: "Stronger Together" },
      { title: "Faith Over Fear", speaker: "Pastor David Johnson", desc: "When the world shakes, our foundation holds.", series: "Unshakeable" },
    ];
    for (const s of sermons) {
      await ctx.db.insert("sermons", {
        churchId,
        title: s.title,
        speaker: s.speaker,
        description: s.desc,
        series: s.series,
        date: new Date(now - Math.random() * 30 * 86400000).toISOString().slice(0, 10),
        viewCount: Math.floor(Math.random() * 200) + 50,
      });
    }

    // ── Testimonies ──
    const tess = [
      "God provided in ways I never expected. Through faithful tithing and a surprise job promotion, our family is now completely debt-free!",
      "The prayer team and my small group walked with me through the darkest season. Today I stand free from crippling anxiety.",
    ];
    for (const t of tess) {
      await ctx.db.insert("testimonies", {
        churchId,
        memberId: demoId,
        content: t,
        isApproved: true,
      });
    }

    // ── Giving Records ──
    const gTypes = ["tithe", "offering", "building", "mission"] as const;
    for (let i = 0; i < 8; i++) {
      await ctx.db.insert("givingRecords", {
        churchId,
        memberId: demoId,
        amount: Math.floor(Math.random() * 500 + 50) * 100,
        type: gTypes[i % gTypes.length],
        paymentMethod: "card",
        date: now - i * 7 * 86400000,
        isRecurring: false,
      });
    }

    // ── Social Posts ──
    const posts = [
      "What a powerful worship service today! The presence of God was so real. Grateful for this church family.",
      "Our small group just finished the book of James. Every chapter hit different.",
      "Volunteered at the food drive this morning. 200 families served! This church shows up.",
    ];
    for (const p of posts) {
      await ctx.db.insert("socialPosts", {
        churchId,
        authorId: demoId,
        content: p,
        type: "text",
        likeCount: Math.floor(Math.random() * 25) + 5,
        commentCount: Math.floor(Math.random() * 8),
        isActive: true,
        postedAt: now - Math.random() * 14 * 86400000,
      });
    }

    // ── Pastor Profile ──
    await ctx.db.insert("pastorProfiles", {
      churchId,
      memberId: mIds[1], // Sarah Mitchell
      name: "Pastor David Johnson",
      title: "Senior Pastor",
      bio: "Pastor David has led Grace Community Church for 18 years. Passionate about expository preaching and raising up the next generation of leaders.",
      journey: "Called to ministry at age 19 during a mission trip to Kenya. Served as youth pastor for 6 years before planting Grace Community in 2007.",
      bookingEnabled: true,
    });

    // ── Church News ──
    const news = [
      { title: "Local Church Feeds 500 Families This Easter", summary: "Grace Community partnered with three congregations for the largest Easter food distribution.", cat: "local" as const },
      { title: "Youth Ministry Launches Mental Health Initiative", summary: "New support program with licensed counselors for teens every Wednesday.", cat: "ministry" as const },
    ];
    for (const n of news) {
      await ctx.db.insert("churchNews", {
        churchId,
        title: n.title,
        summary: n.summary,
        category: n.cat,
        isBreaking: false,
        publishedAt: now - Math.random() * 14 * 86400000,
        createdBy: demoId,
      });
    }

    // ── Awards ──
    await ctx.db.insert("awards", {
      churchId,
      memberId: mIds[4], // Robert Williams
      category: "top_volunteer",
      title: "Volunteer of the Year",
      description: "Outstanding dedication to community outreach and youth ministry.",
      period: "Annual",
      year: 2025,
      awardedAt: now - 60 * 86400000,
    });
    await ctx.db.insert("awards", {
      churchId,
      memberId: mIds[5], // Lisa Thompson
      category: "top_giver",
      title: "Generous Heart Award",
      description: "Consistent and sacrificial giving throughout the year.",
      period: "Annual",
      year: 2025,
      awardedAt: now - 60 * 86400000,
    });

    // ── Store Products ──
    const products = [
      { name: "Grace Community T-Shirt", desc: "Soft cotton tee with church logo.", price: 2500, cat: "apparel" as const },
      { name: "Faith Journal", desc: "Hardcover lined journal with daily devotional prompts.", price: 1800, cat: "books" as const },
      { name: "Worship Album — Live 2025", desc: "12-track live worship recording.", price: 1200, cat: "media" as const },
      { name: "Coffee Mug — Blessed", desc: "Ceramic 14oz mug with gold lettering.", price: 1400, cat: "gifts" as const },
    ];
    for (const p of products) {
      await ctx.db.insert("storeProducts", {
        churchId,
        name: p.name,
        description: p.desc,
        price: p.price,
        category: p.cat,
        isDigital: false,
        isActive: true,
        isFeatured: true,
        createdAt: now,
      });
    }

    // ── Book Library ──
    const books = [
      { title: "Walking With God Daily", author: "AI Faith Author", desc: "A 30-day devotional exploring daily communion with God.", price: 999, cat: "devotional" as const },
      { title: "Prayers That Move Mountains", author: "AI Faith Author", desc: "The power of persistent, faith-filled prayer through 12 biblical examples.", price: 1499, cat: "prayer" as const },
      { title: "Raising Kingdom Kids", author: "AI Faith Author", desc: "Practical wisdom for parents raising children rooted in faith.", price: 1299, cat: "parenting" as const },
    ];
    for (const b of books) {
      await ctx.db.insert("bookLibrary", {
        churchId,
        title: b.title,
        author: b.author,
        description: b.desc,
        price: b.price,
        category: b.cat,
        isAiGenerated: true,
        isFeatured: true,
        isPublished: true,
        publishedAt: now - Math.random() * 30 * 86400000,
        createdAt: now,
      });
    }

    // ── Life Events ──
    await ctx.db.insert("lifeEvents", {
      churchId,
      memberId: mIds[5],
      type: "birth",
      title: "Baby Girl Born!",
      description: "The Thompson family welcomes baby Emma Grace, 7 lbs 4 oz.",
      personName: "Lisa Thompson",
      eventDate: now - 3 * 86400000,
      isPublic: true,
      createdBy: demoId,
      createdAt: now,
    });
    await ctx.db.insert("lifeEvents", {
      churchId,
      memberId: mIds[3],
      type: "marriage",
      title: "Wedding Celebration",
      description: "Maria Garcia and Daniel Lopez were married in a beautiful ceremony.",
      personName: "Maria Garcia",
      eventDate: now - 14 * 86400000,
      isPublic: true,
      createdBy: demoId,
      createdAt: now,
    });

    // ── Therapists ──
    const therapists = [
      { name: "Dr. Rebecca Stone", title: "Licensed Clinical Psychologist", spec: "general" as const, bio: "15 years experience in faith-integrated therapy.", rate: 12000 },
      { name: "Dr. Marcus Hayes", title: "Licensed Marriage & Family Therapist", spec: "marriage" as const, bio: "Specializing in couples counseling with a biblical foundation.", rate: 15000 },
    ];
    for (const t of therapists) {
      await ctx.db.insert("therapists", {
        churchId,
        name: t.name,
        title: t.title,
        specialty: t.spec,
        bio: t.bio,
        credentials: ["Licensed", "Faith-Based Certified"],
        isFaithBased: true,
        sessionRate: t.rate,
        isFree: false,
        isActive: true,
        createdAt: now,
      });
    }

    // ── Mental Health Resources ──
    await ctx.db.insert("mentalHealthResources", {
      churchId,
      title: "Understanding Anxiety — A Faith Perspective",
      description: "Learn how to manage anxiety using both clinical strategies and scriptural truth.",
      category: "anxiety",
      type: "article",
      isFree: true,
      isFaithBased: true,
      createdAt: now,
    });
    await ctx.db.insert("mentalHealthResources", {
      churchId,
      title: "988 Suicide & Crisis Lifeline",
      description: "Free, confidential support 24/7. Call or text 988.",
      category: "general",
      type: "hotline",
      phone: "988",
      isFree: true,
      isFaithBased: false,
      createdAt: now,
    });

    // ── Medical Providers ──
    await ctx.db.insert("medicalProviders", {
      churchId,
      name: "Dr. Angela Brooks",
      practice: "Grace Family Medicine",
      specialty: "primary_care",
      address: "2100 Peachtree Rd NW, Atlanta, GA 30309",
      phone: "(404) 555-0200",
      acceptsInsurance: true,
      insuranceList: ["Blue Cross", "Aetna", "United"],
      isFaithAligned: true,
      isChurchMember: true,
      offersTelemedicine: true,
      bio: "Board-certified family physician and active church member for 12 years.",
      isVerified: true,
      createdAt: now,
    });

    // ── Expert Q&A Categories ──
    const cats = [
      { name: "Ask the Pastor", slug: "pastor", desc: "Spiritual guidance and biblical interpretation.", price: 0, free: true, icon: "book-open" },
      { name: "Faith & Legal", slug: "legal", desc: "Faith-aligned legal guidance and counsel.", price: 199, free: false, icon: "scale" },
      { name: "Financial Guidance", slug: "finance", desc: "Biblical principles of stewardship and financial planning.", price: 99, free: false, icon: "dollar-sign" },
    ];
    for (let i = 0; i < cats.length; i++) {
      await ctx.db.insert("expertCategories", {
        churchId,
        name: cats[i].name,
        slug: cats[i].slug,
        description: cats[i].desc,
        icon: cats[i].icon,
        pricePerQuestion: cats[i].price,
        isFree: cats[i].free,
        isActive: true,
        sortOrder: i,
      });
    }

    // ── Help Resources ──
    await ctx.db.insert("helpResources", {
      churchId,
      name: "Atlanta Community Food Bank",
      category: "food",
      description: "Free groceries for families in need. No ID required.",
      address: "3400 North Desert Dr, Atlanta, GA 30344",
      phone: "(404) 555-0300",
      isFree: true,
      isChurchSponsored: false,
      isActive: true,
    });

    // ── Crisis Team (One Care Crisis Network model) ──
    const teamId = await ctx.db.insert("crisisTeams", {
      churchId,
      name: "Grace Community Crisis Response",
      description: "Church-led crisis response team supported by One Care Crisis Network. Volunteers serve in pairs and are dispatched to hospitals, churches, and homes.",
      leaderId: demoId,
      managementPartner: "One Care Crisis Network",
      partnerPhone: "(800) 555-0199",
      partnerEmail: "dispatch@onecare.network",
      isActive: true,
      createdAt: now,
    });

    // Coordinator
    await ctx.db.insert("crisisTeamMembers", {
      teamId,
      memberId: mIds[4], // Robert Williams
      role: "coordinator",
      specialization: "Crisis intake & dispatch",
      isOnCall: true,
      joinedAt: now - 180 * 86400000,
    });

    // Volunteer Pair 1
    const v1 = await ctx.db.insert("crisisTeamMembers", {
      teamId,
      memberId: mIds[6], // Michael Brown
      role: "volunteer",
      specialization: "Hospital visits",
      isOnCall: true,
      joinedAt: now - 120 * 86400000,
    });
    const v2 = await ctx.db.insert("crisisTeamMembers", {
      teamId,
      memberId: mIds[8], // David Wilson
      role: "volunteer",
      specialization: "Hospital visits",
      isOnCall: true,
      joinedAt: now - 120 * 86400000,
    });
    // Pair them
    await ctx.db.patch(v1, { pairedWith: v2 });
    await ctx.db.patch(v2, { pairedWith: v1 });

    // Volunteer Pair 2
    const v3 = await ctx.db.insert("crisisTeamMembers", {
      teamId,
      memberId: mIds[5], // Lisa Thompson
      role: "volunteer",
      specialization: "Home visits & meals",
      isOnCall: false,
      joinedAt: now - 90 * 86400000,
    });
    const v4 = await ctx.db.insert("crisisTeamMembers", {
      teamId,
      memberId: mIds[9], // Angela Martinez
      role: "volunteer",
      specialization: "Home visits & prayer",
      isOnCall: false,
      joinedAt: now - 90 * 86400000,
    });
    await ctx.db.patch(v3, { pairedWith: v4 });
    await ctx.db.patch(v4, { pairedWith: v3 });

    // Counselor
    await ctx.db.insert("crisisTeamMembers", {
      teamId,
      memberId: mIds[1], // Sarah Mitchell (pastor)
      role: "counselor",
      specialization: "Pastoral crisis counseling",
      isOnCall: true,
      joinedAt: now - 365 * 86400000,
    });

    // Sample incidents
    await ctx.db.insert("crisisIncidents", {
      churchId,
      teamId,
      reportedBy: mIds[7], // Jennifer Davis
      title: "Member hospitalized — cardiac event",
      description: "Brother Thomas Jackson admitted to Emory Hospital after a heart episode during Sunday service. Family requesting prayer and support at the hospital.",
      severity: "high",
      status: "dispatched",
      dispatchedPair: [v1, v2],
      dispatchLocation: "hospital",
      dispatchAddress: "Emory University Hospital, 1364 Clifton Rd NE",
      reportedAt: now - 2 * 86400000,
    });
    await ctx.db.insert("crisisIncidents", {
      churchId,
      teamId,
      reportedBy: mIds[3], // Maria Garcia
      title: "Family house fire — Johnson residence",
      description: "The Johnson family lost their home to a fire. Four family members displaced. Need immediate temporary housing, clothing, and meals coordination.",
      severity: "critical",
      status: "in_progress",
      assignedTo: mIds[4],
      dispatchedPair: [v3, v4],
      dispatchLocation: "home",
      dispatchAddress: "428 Maple Drive, Decatur GA 30030",
      reportedAt: now - 5 * 86400000,
      notes: "Red Cross contacted. Temporary housing secured at Comfort Inn. Meal train organized for 2 weeks.",
    });
    await ctx.db.insert("crisisIncidents", {
      churchId,
      teamId,
      reportedBy: demoId,
      title: "Bereavement — Sister Martha Collins",
      description: "Sister Martha's husband of 42 years passed away peacefully. Family is preparing for funeral arrangements and needs support.",
      severity: "medium",
      status: "resolved",
      resolvedAt: now - 3 * 86400000,
      dispatchLocation: "church",
      dispatchAddress: "Grace Community Church — Chapel",
      reportedAt: now - 10 * 86400000,
      notes: "Funeral held at the church. Grief support group connected. Meal train completed.",
    });

    // ── Worship Tracks ──
    const tracks = [
      { title: "How Great Is Our God", artist: "Chris Tomlin" },
      { title: "Oceans", artist: "Hillsong UNITED" },
      { title: "Way Maker", artist: "Sinach" },
    ];
    for (const t of tracks) {
      await ctx.db.insert("worshipTracks", {
        churchId,
        title: t.title,
        artist: t.artist,
        playCount: Math.floor(Math.random() * 100) + 20,
        isActive: true,
      });
    }

    // ── Support Rooms ──
    await ctx.db.insert("supportRooms", {
      churchId,
      name: "Grief Support Circle",
      description: "A safe space to share and heal after loss.",
      category: "grief",
      isAnonymous: true,
      isActive: true,
      memberCount: 8,
    });
    await ctx.db.insert("supportRooms", {
      churchId,
      name: "Anxiety & Stress Support",
      description: "Faith-based coping strategies and community encouragement.",
      category: "anxiety",
      isAnonymous: true,
      isActive: true,
      memberCount: 12,
    });

    // ── Growth Milestones ──
    await ctx.db.insert("growthMilestones", {
      churchId,
      memberId: demoId,
      type: "salvation",
      title: "Salvation",
      description: "Accepted Christ",
      achievedAt: now - 365 * 86400000,
      badgeEmoji: "✝️",
    });
    await ctx.db.insert("growthMilestones", {
      churchId,
      memberId: demoId,
      type: "first_tithe",
      title: "First Tithe",
      description: "Gave first tithe",
      achievedAt: now - 300 * 86400000,
      badgeEmoji: "💰",
    });

    return null;
  },
});
