import { mutation } from "./_generated/server";

export const seedV3 = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existingVerses = await ctx.db.query("dailyVerses").take(1);
    if (existingVerses.length > 0) return { status: "already_seeded" };

    // Get the first church and some members
    const church = await ctx.db.query("churches").first();
    if (!church) return { status: "no_church" };
    const churchId = church._id;

    const members = await ctx.db
      .query("members")
      .withIndex("by_churchId", (q) => q.eq("churchId", churchId))
      .take(10);
    if (members.length === 0) return { status: "no_members" };

    const admin = members.find((m) => m.role === "admin") ?? members[0];
    const pastor = members.find((m) => m.role === "pastor") ?? members[1] ?? admin;

    // ── Welcome Videos ─────────────────────────────────────
    await ctx.db.insert("welcomeVideos", {
      churchId,
      title: "Welcome to Our Church Family",
      description: "A warm greeting from our pastor and congregation.",
      type: "welcome",
      isActive: true,
      sortOrder: 1,
      createdAt: Date.now(),
    });
    await ctx.db.insert("welcomeVideos", {
      churchId,
      title: "A Message from the Pastor",
      description: "Pastor James shares his vision for our community.",
      type: "pastor_greeting",
      isActive: true,
      sortOrder: 2,
      createdAt: Date.now(),
    });
    await ctx.db.insert("welcomeVideos", {
      churchId,
      title: "Campus Tour",
      description: "Take a virtual tour of our beautiful campus and facilities.",
      type: "campus_tour",
      isActive: true,
      sortOrder: 3,
      createdAt: Date.now(),
    });

    // ── Daily Verses (7 days) ──────────────────────────────
    const verses = [
      { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", theme: "Hope" },
      { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me.", theme: "Strength" },
      { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want.", theme: "Provision" },
      { ref: "Romans 8:28", text: "And we know that all things work together for good to them that love God.", theme: "Faith" },
      { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.", theme: "Trust" },
      { ref: "Isaiah 40:31", text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.", theme: "Patience" },
      { ref: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.", theme: "Courage" },
    ];
    const today = new Date();
    for (let i = 0; i < verses.length; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      await ctx.db.insert("dailyVerses", {
        churchId,
        date: dateStr,
        reference: verses[i].ref,
        text: verses[i].text,
        translation: "KJV",
        theme: verses[i].theme,
        reflection: `Meditate on this verse and let it guide your day. ${verses[i].theme} is a cornerstone of our faith.`,
        createdAt: Date.now(),
      });
    }

    // ── Bible Reading Plan ─────────────────────────────────
    await ctx.db.insert("bibleReadingPlans", {
      churchId,
      title: "30-Day Psalms Journey",
      description: "Read through the Psalms in 30 days. Perfect for new believers and seasoned saints alike.",
      totalDays: 30,
      readings: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        reference: `Psalm ${i * 5 + 1}-${(i + 1) * 5}`,
        title: `Day ${i + 1}: Psalms ${i * 5 + 1}-${(i + 1) * 5}`,
      })),
      isActive: true,
      createdBy: pastor._id,
      createdAt: Date.now(),
    });
    await ctx.db.insert("bibleReadingPlans", {
      churchId,
      title: "Gospel of John — 21 Days",
      description: "Explore the Gospel of John chapter by chapter over 21 days.",
      totalDays: 21,
      readings: Array.from({ length: 21 }, (_, i) => ({
        day: i + 1,
        reference: `John ${i + 1}`,
        title: `Day ${i + 1}: John Chapter ${i + 1}`,
      })),
      isActive: true,
      createdBy: pastor._id,
      createdAt: Date.now(),
    });

    // ── Teen Posts ──────────────────────────────────────────
    const teenMember = members[3] ?? members[1];
    const teenTopics = [
      { content: "Just finished youth group tonight and feeling so blessed. The topic on identity in Christ really hit home. Anyone else feel the same?", cat: "discussion" as const },
      { content: "Prayer request: My friend at school is going through a really tough time. Please keep them in your prayers.", cat: "prayer" as const },
      { content: "Youth lock-in this Friday! Who's coming? We're doing worship, games, and a midnight pizza run.", cat: "event" as const },
      { content: "Today's devotion: Matthew 5:16 — Let your light shine before others. How are you shining this week?", cat: "devotion" as const },
      { content: "Caption contest! Best caption for the youth group photo from Sunday wins a free smoothie.", cat: "fun" as const },
    ];
    for (const tp of teenTopics) {
      await ctx.db.insert("teenPosts", {
        churchId,
        authorId: teenMember._id,
        content: tp.content,
        category: tp.cat,
        likeCount: Math.floor(Math.random() * 20) + 3,
        commentCount: Math.floor(Math.random() * 8),
        isActive: true,
        postedAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    // ── Teen Chat Messages ─────────────────────────────────
    const chatMessages = [
      "Hey everyone! What's the verse for tonight's study?",
      "It's James 1:2-4. Really good one about perseverance!",
      "Can't wait for the retreat next month!",
      "Who's volunteering for the community service day?",
      "I am! Let's get a big group together.",
    ];
    for (let i = 0; i < chatMessages.length; i++) {
      const sender = members[i % members.length];
      await ctx.db.insert("teenMessages", {
        churchId,
        senderId: sender._id,
        roomName: "general",
        content: chatMessages[i],
        sentAt: Date.now() - (chatMessages.length - i) * 60000,
      });
    }

    // ── Children's Check-in Rooms ──────────────────────────
    const nurseryId = await ctx.db.insert("checkinRooms", {
      churchId, name: "Nursery (0-2)", ageRange: "0-2 years", capacity: 12, currentCount: 3, isActive: true,
    });
    const toddlerId = await ctx.db.insert("checkinRooms", {
      churchId, name: "Toddlers (2-4)", ageRange: "2-4 years", capacity: 15, currentCount: 5, isActive: true,
    });
    const kidsId = await ctx.db.insert("checkinRooms", {
      churchId, name: "Kids Church (5-8)", ageRange: "5-8 years", capacity: 25, currentCount: 8, isActive: true,
    });
    await ctx.db.insert("checkinRooms", {
      churchId, name: "Tweens (9-12)", ageRange: "9-12 years", capacity: 20, currentCount: 4, isActive: true,
    });

    // ── Child Profiles ─────────────────────────────────────
    const childrenData = [
      { first: "Lily", last: "Johnson", age: 3, allergies: ["Peanuts", "Tree Nuts"], guardian: "Sarah Johnson", phone: "(404) 555-0101", rel: "Mother", room: toddlerId },
      { first: "Ethan", last: "Williams", age: 6, allergies: [], guardian: "Marcus Williams", phone: "(404) 555-0102", rel: "Father", room: kidsId },
      { first: "Sophia", last: "Brown", age: 1, allergies: ["Dairy"], guardian: "Angela Brown", phone: "(404) 555-0103", rel: "Mother", room: nurseryId },
      { first: "Noah", last: "Davis", age: 7, allergies: [], guardian: "Robert Davis", phone: "(404) 555-0104", rel: "Father", room: kidsId },
      { first: "Ava", last: "Martinez", age: 4, allergies: ["Gluten"], guardian: "Maria Martinez", phone: "(404) 555-0105", rel: "Mother", room: toddlerId },
      { first: "Liam", last: "Taylor", age: 10, allergies: [], guardian: "David Taylor", phone: "(404) 555-0106", rel: "Father", room: kidsId },
      { first: "Emma", last: "Anderson", age: 2, allergies: [], guardian: "Jennifer Anderson", phone: "(404) 555-0107", rel: "Mother", room: toddlerId },
      { first: "Mason", last: "Thomas", age: 8, allergies: ["Bee Stings"], guardian: "Kevin Thomas", phone: "(404) 555-0108", rel: "Father", room: kidsId },
    ];

    for (const c of childrenData) {
      const childId = await ctx.db.insert("childProfiles", {
        churchId,
        firstName: c.first,
        lastName: c.last,
        age: c.age,
        allergies: c.allergies.length > 0 ? c.allergies : undefined,
        guardians: [{ name: c.guardian, relationship: c.rel, phone: c.phone, isAuthorizedPickup: true }],
        isActive: true,
        createdAt: Date.now(),
      });

      // Create active check-in for some children
      if (Math.random() > 0.4) {
        const code = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}`;
        await ctx.db.insert("childCheckins", {
          churchId,
          childId,
          roomId: c.room,
          securityCode: code,
          checkedInAt: Date.now() - Math.floor(Math.random() * 60 * 60 * 1000),
          checkedInBy: admin._id,
          guardianName: c.guardian,
          stickerPrinted: true,
          allergyAlertShown: c.allergies.length > 0,
          status: "checked_in",
        });
      }
    }

    // ── Job Postings ───────────────────────────────────────
    await ctx.db.insert("jobPostings", {
      churchId,
      title: "Worship Director",
      description: "Lead our worship team in planning and executing Sunday services. Must have experience leading a worship band and strong knowledge of both traditional hymns and contemporary worship music.",
      department: "Worship Ministry",
      type: "full_time",
      location: "On-site",
      salaryRange: "$45,000 - $55,000",
      requirements: ["3+ years worship leadership", "Music degree preferred", "Strong vocal ability"],
      contactEmail: "hiring@gracecommunity.church",
      isActive: true,
      postedBy: admin._id,
      postedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    });
    await ctx.db.insert("jobPostings", {
      churchId,
      title: "Youth Ministry Coordinator",
      description: "Oversee our thriving youth program (ages 12-18). Plan weekly meetings, retreats, community service projects, and mentorship programs.",
      department: "Youth Ministry",
      type: "part_time",
      location: "On-site / Hybrid",
      salaryRange: "$25,000 - $35,000",
      requirements: ["Background check required", "CPR certified", "Experience with youth groups"],
      isActive: true,
      postedBy: admin._id,
      postedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    });
    await ctx.db.insert("jobPostings", {
      churchId,
      title: "Administrative Assistant",
      description: "Support the church office with scheduling, communications, member management, and event coordination.",
      department: "Administration",
      type: "full_time",
      location: "On-site",
      salaryRange: "$30,000 - $38,000",
      isActive: true,
      postedBy: admin._id,
      postedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    });

    // ── Volunteer Needs ────────────────────────────────────
    await ctx.db.insert("volunteerNeeds", {
      churchId,
      title: "Sunday School Teachers",
      description: "We need teachers for our growing children's ministry. Classes are Sunday mornings 9:30-10:30 AM.",
      ministry: "Children's Ministry",
      urgency: "high",
      spotsAvailable: 4,
      spotsFilled: 1,
      schedule: "Sundays 9:30 AM - 10:30 AM",
      skills: ["Teaching", "Patience", "Background Check"],
      isActive: true,
      postedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    });
    await ctx.db.insert("volunteerNeeds", {
      churchId,
      title: "Parking Lot Greeters",
      description: "Help welcome families as they arrive on Sunday mornings. Direct traffic and assist with accessibility needs.",
      ministry: "Hospitality",
      urgency: "medium",
      spotsAvailable: 6,
      spotsFilled: 2,
      schedule: "Sundays 8:45 AM - 10:15 AM",
      isActive: true,
      postedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    });
    await ctx.db.insert("volunteerNeeds", {
      churchId,
      title: "Sound & Media Team",
      description: "Operate sound board, projector, and live stream equipment during services. Training provided.",
      ministry: "Worship / Tech",
      urgency: "critical",
      spotsAvailable: 3,
      spotsFilled: 0,
      schedule: "Sundays & Wednesdays",
      skills: ["Tech-savvy", "Reliable", "Detail-oriented"],
      isActive: true,
      postedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    });
    await ctx.db.insert("volunteerNeeds", {
      churchId,
      title: "Food Pantry Helpers",
      description: "Sort donations, pack bags, and distribute food to families in need. Our pantry serves 200+ families monthly.",
      ministry: "Outreach",
      urgency: "medium",
      spotsAvailable: 8,
      spotsFilled: 3,
      schedule: "Saturdays 9:00 AM - 12:00 PM",
      isActive: true,
      postedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    });

    // ── Recurring Giving Schedules ─────────────────────────
    for (let i = 0; i < Math.min(5, members.length); i++) {
      const m = members[i];
      const types = ["tithe", "offering", "mission", "building", "benevolence"] as const;
      const freqs = ["weekly", "biweekly", "monthly", "quarterly"] as const;
      const amounts = [50, 100, 150, 200, 25];
      await ctx.db.insert("recurringSchedules", {
        churchId,
        memberId: m._id,
        type: types[i % types.length],
        amount: amounts[i],
        frequency: freqs[i % freqs.length],
        paymentMethod: "trgpay",
        nextDate: Date.now() + (7 + i * 3) * 24 * 60 * 60 * 1000,
        startDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
        isActive: true,
        totalGiven: amounts[i] * (12 - i * 2),
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      });
    }

    // ── Notifications ──────────────────────────────────────
    const notifData = [
      { title: "Welcome to FaithConnect!", body: "We're so glad you're here. Start by watching the welcome video and meeting your church family.", type: "welcome" as const },
      { title: "Sunday Service Reminder", body: "Don't forget — Sunday worship is at 10:00 AM. See you there!", type: "event_reminder" as const },
      { title: "New Prayer Request", body: "A member has posted a new prayer request. Take a moment to lift them up.", type: "prayer_update" as const },
      { title: "Giving Receipt", body: "Your tithe of $150.00 has been received. Thank you for your generosity!", type: "giving_receipt" as const },
      { title: "Community Event", body: "Church picnic this Saturday at 11 AM in Memorial Park. Bring your family!", type: "announcement" as const },
      { title: "New Life Event", body: "Congratulations! The Williams family welcomed a new baby boy.", type: "life_event" as const },
    ];
    for (const n of notifData) {
      await ctx.db.insert("notifications", {
        churchId,
        memberId: admin._id,
        title: n.title,
        body: n.body,
        type: n.type,
        isRead: Math.random() > 0.5,
        createdAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    // ── Virtual Meetings ───────────────────────────────────
    await ctx.db.insert("virtualMeetings", {
      churchId,
      title: "Sunday Live Stream",
      description: "Join us live every Sunday for worship service.",
      meetingUrl: "https://youtube.com/live/gracecommunity",
      platform: "youtube_live",
      scheduledAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
      duration: 90,
      isRecurring: true,
      isLive: false,
      attendeeCount: 85,
      createdAt: Date.now(),
    });
    await ctx.db.insert("virtualMeetings", {
      churchId,
      title: "Wednesday Bible Study (Zoom)",
      description: "Mid-week Bible study via Zoom. All are welcome.",
      meetingUrl: "https://zoom.us/j/1234567890",
      platform: "zoom",
      scheduledAt: Date.now() + 4 * 24 * 60 * 60 * 1000,
      duration: 60,
      isRecurring: true,
      isLive: false,
      createdAt: Date.now(),
    });
    await ctx.db.insert("virtualMeetings", {
      churchId,
      title: "Youth Group Google Meet",
      description: "Virtual youth hangout for teens who can't make it in person.",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      platform: "google_meet",
      scheduledAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
      duration: 45,
      isRecurring: true,
      isLive: false,
      createdAt: Date.now(),
    });

    return { status: "seeded" };
  },
});
