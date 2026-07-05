import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const seedBulkMembers = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const DAY = 86400000;

    const church = await ctx.db.query("churches").first();
    if (!church) throw new Error("No church found — run seedDemoData first");
    const churchId = church._id;

    // Check if bulk seed already ran
    const existingMembers = await ctx.db
      .query("members")
      .withIndex("by_churchId", (q) => q.eq("churchId", churchId))
      .collect();

    if (existingMembers.length >= 40) return null;

    const demoMember = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!demoMember) throw new Error("No demo member");

    const bulkNames = [
      { n: "Patricia Robinson", r: "leader" as const, bio: "Women's ministry coordinator, 12 years serving", phone: "(404) 555-1001" },
      { n: "Marcus Johnson", r: "member" as const, bio: "Usher team captain, Sunday school", phone: "(404) 555-1002" },
      { n: "Evelyn Carter", r: "member" as const, bio: "Senior choir soprano, hospitality", phone: "(404) 555-1003" },
      { n: "Terrence Brooks", r: "leader" as const, bio: "Head deacon, community outreach lead", phone: "(404) 555-1004" },
      { n: "Diane Washington", r: "member" as const, bio: "Bible study facilitator, food pantry", phone: "(404) 555-1005" },
      { n: "Calvin Harris", r: "member" as const, bio: "Parking ministry, security team", phone: "(404) 555-1006" },
      { n: "Brenda Scott", r: "member" as const, bio: "Nursery volunteer, new mothers group", phone: "(404) 555-1007" },
      { n: "Jerome Adams", r: "member" as const, bio: "Audio/visual ministry, tech team", phone: "(404) 555-1008" },
      { n: "Tamika Lee", r: "member" as const, bio: "Dance ministry, youth mentor", phone: "(404) 555-1009" },
      { n: "Frederick Coleman", r: "member" as const, bio: "Trustee board, finance committee", phone: "(404) 555-1010" },
      { n: "Gloria Jenkins", r: "member" as const, bio: "Kitchen ministry lead, fellowship dinners", phone: "(404) 555-1011" },
      { n: "Anthony Reed", r: "member" as const, bio: "Men's prayer breakfast host", phone: "(404) 555-1012" },
      { n: "Cynthia Wright", r: "member" as const, bio: "Church secretary, bulletins team", phone: "(404) 555-1013" },
      { n: "Reginald King", r: "member" as const, bio: "Jail ministry volunteer", phone: "(404) 555-1014" },
      { n: "Michelle Turner", r: "member" as const, bio: "Grief support group facilitator", phone: "(404) 555-1015" },
      { n: "Darnell Mitchell", r: "member" as const, bio: "Youth basketball coach, sports ministry", phone: "(404) 555-1016" },
      { n: "Sylvia Moore", r: "member" as const, bio: "Senior saints coordinator, visitation", phone: "(404) 555-1017" },
      { n: "Lorenzo Price", r: "member" as const, bio: "Mission trip coordinator", phone: "(404) 555-1018" },
      { n: "Vivian Howard", r: "member" as const, bio: "Church garden project, eco ministry", phone: "(404) 555-1019" },
      { n: "Clarence Young", r: "member" as const, bio: "Building & grounds maintenance", phone: "(404) 555-1020" },
      { n: "Deborah Stewart", r: "member" as const, bio: "Social media ministry, communications", phone: "(404) 555-1021" },
      { n: "Keith Foster", r: "member" as const, bio: "Drummer, praise band", phone: "(404) 555-1022" },
      { n: "Tanya Russell", r: "member" as const, bio: "Health & wellness ministry", phone: "(404) 555-1023" },
      { n: "Raymond Bennett", r: "member" as const, bio: "Small group leader — Eastside", phone: "(404) 555-1024" },
      { n: "Sandra Gray", r: "member" as const, bio: "Greeter team, first-time visitor follow-up", phone: "(404) 555-1025" },
      { n: "Harold Patterson", r: "member" as const, bio: "Retired pastor, elder emeritus", phone: "(404) 555-1026" },
      { n: "Karen Simmons", r: "member" as const, bio: "Vacation Bible School director", phone: "(404) 555-1027" },
      { n: "Troy Alexander", r: "member" as const, bio: "Worship leader, guitarist", phone: "(404) 555-1028" },
      { n: "Vanessa Cooper", r: "member" as const, bio: "Marriage ministry, couples retreat planner", phone: "(404) 555-1029" },
      { n: "Deandre Jackson", r: "member" as const, bio: "Youth group volunteer, mentoring", phone: "(404) 555-1030" },
      { n: "Phyllis Richardson", r: "member" as const, bio: "Sunday school teacher — 3rd grade", phone: "(404) 555-1031" },
      { n: "Omar Edwards", r: "member" as const, bio: "College ministry advisor", phone: "(404) 555-1032" },
      { n: "Cheryl Barnes", r: "member" as const, bio: "Altar worker, intercessor", phone: "(404) 555-1033" },
      { n: "Wayne Murphy", r: "member" as const, bio: "Van ministry driver, transportation", phone: "(404) 555-1034" },
      { n: "Jasmine Collins", r: "member" as const, bio: "Singles ministry coordinator", phone: "(404) 555-1035" },
      { n: "Derek Henderson", r: "member" as const, bio: "Men's conference organizer", phone: "(404) 555-1036" },
      { n: "Monique Rivera", r: "member" as const, bio: "Hispanic outreach liaison", phone: "(404) 555-1037" },
      { n: "Curtis Bell", r: "visitor" as const, bio: "Recently joined, exploring membership", phone: "(404) 555-1038" },
      { n: "Natasha Perry", r: "visitor" as const, bio: "New to the community", phone: "(404) 555-1039" },
      { n: "Rodney Butler", r: "visitor" as const, bio: "First-time guest, invited by friend", phone: "(404) 555-1040" },
      { n: "Felicia Morgan", r: "member" as const, bio: "Bookstore volunteer, book club host", phone: "(404) 555-1041" },
      { n: "Lamar Sanders", r: "member" as const, bio: "Sound engineer, live-stream team", phone: "(404) 555-1042" },
      { n: "Rhonda Diaz", r: "member" as const, bio: "ESL teacher, community classes", phone: "(404) 555-1043" },
      { n: "Tyrone Hughes", r: "member" as const, bio: "Grounds crew, landscaping team", phone: "(404) 555-1044" },
      { n: "April Watson", r: "member" as const, bio: "Drama ministry, Easter pageant director", phone: "(404) 555-1045" },
    ];

    for (const m of bulkNames) {
      await ctx.db.insert("members", {
        userId,
        churchId,
        role: m.r,
        displayName: m.n,
        phone: m.phone,
        bio: m.bio,
        isActive: true,
        joinedAt: now - Math.floor(Math.random() * 730) * DAY,
        isNewcomer: m.r === "visitor",
      });
    }

    // Refresh all IDs
    const allMembers = await ctx.db
      .query("members")
      .withIndex("by_churchId", (q) => q.eq("churchId", churchId))
      .collect();
    const allIds = allMembers.map((m) => m._id);

    // ── Social Posts ──
    const socialPosts = [
      { content: "What a powerful word from Pastor Johnson this morning! God is truly working in our midst.", lc: 24 },
      { content: "Our youth group did an incredible job serving at the food bank today. So proud of these kids!", lc: 31 },
      { content: "Please keep the Williams family in prayer. They are going through a difficult season.", lc: 18 },
      { content: "Reminder: Bible study Wednesday at 7pm! We are finishing the book of Romans this week.", lc: 12 },
      { content: "Just got baptized today! Best decision of my life. Thank you Grace Community for the support.", lc: 67 },
      { content: "The choir was absolutely on fire this Sunday! That arrangement of How Great Thou Art brought tears.", lc: 42 },
      { content: "Volunteered at the homeless shelter with our outreach team. Served 200 meals. God is good!", lc: 35 },
      { content: "Marriage retreat registration is open! My wife and I went last year and it transformed our relationship.", lc: 19 },
      { content: "Our small group finished a 6-week study on forgiveness. Life-changing conversations.", lc: 15 },
      { content: "Shout out to Brother Calvin and the security team for keeping us safe every Sunday!", lc: 28 },
      { content: "The women's conference was incredible. Still processing everything God spoke to my heart.", lc: 54 },
      { content: "New here! Just moved from Houston. Looking for a church family and Grace Community feels like home.", lc: 39 },
      { content: "Happy anniversary to Grace Community! 39 years of serving the Lord in this community.", lc: 71 },
      { content: "My son got accepted into Morehouse! All glory to God and the mentors at this church who poured into him.", lc: 88 },
      { content: "Prayer walk around the neighborhood tonight at 6pm. Meet at the front entrance. All welcome!", lc: 22 },
      { content: "The Easter pageant rehearsals are going amazing. April and the drama team are so talented.", lc: 26 },
      { content: "Thank you to everyone who donated to the building fund. We are 80% to our renovation goal!", lc: 44 },
      { content: "Men's breakfast this Saturday. Brother Anthony is cooking his famous grits and salmon croquettes.", lc: 33 },
      { content: "Just finished my first week teaching Sunday school. The kids are a blessing!", lc: 21 },
      { content: "Worship practice tonight was so anointed we didn't want to stop. Something special is coming Sunday.", lc: 37 },
    ];

    for (let i = 0; i < socialPosts.length; i++) {
      const authorIdx = (i * 3 + 1) % allIds.length;
      await ctx.db.insert("socialPosts", {
        churchId,
        authorId: allIds[authorIdx],
        content: socialPosts[i].content,
        type: "text",
        likeCount: socialPosts[i].lc,
        commentCount: Math.floor(Math.random() * 12),
        isActive: true,
        postedAt: now - (i + 1) * DAY * 0.7,
      });
    }

    // ── Prayer Requests ──
    const prayerCats = ["health", "family", "financial", "spiritual", "work", "relationships", "gratitude", "other"] as const;
    const prayers = [
      { title: "Healing for my mother", content: "My mother was diagnosed with breast cancer. Please lift her up in prayer for complete healing.", ans: false, cat: 0 },
      { title: "Job interview tomorrow", content: "I have a big interview at Emory Healthcare. Praying for God's favor and peace.", ans: false, cat: 4 },
      { title: "Traveling mercies", content: "Our mission team leaves for Haiti on Saturday. Pray for safe travels and open hearts.", ans: false, cat: 7 },
      { title: "Marriage restoration", content: "Asking for prayer over my marriage. We are separated but I believe God can restore us.", ans: false, cat: 5 },
      { title: "Financial breakthrough", content: "Facing unexpected medical bills. Trusting God for provision and wisdom.", ans: false, cat: 2 },
      { title: "College guidance for my daughter", content: "She is deciding between three schools. Praying for clarity and God's direction.", ans: true, cat: 1 },
      { title: "Addiction recovery", content: "Celebrating 6 months of sobriety. Please pray for continued strength and deliverance.", ans: false, cat: 0 },
      { title: "New baby — pray for healthy delivery", content: "Due date is next month. First-time parents trusting God for a smooth delivery.", ans: false, cat: 1 },
      { title: "Grief and healing", content: "Lost my father two weeks ago. Asking for God's comfort and peace that surpasses understanding.", ans: false, cat: 3 },
      { title: "Praise report — surgery went well!", content: "Thank you for your prayers! The tumor was benign. God is faithful!", ans: true, cat: 6 },
    ];

    for (let i = 0; i < prayers.length; i++) {
      const authorIdx = (i * 5 + 2) % allIds.length;
      await ctx.db.insert("prayerRequests", {
        churchId,
        memberId: allIds[authorIdx],
        title: prayers[i].title,
        content: prayers[i].content,
        isAnonymous: i === 3 || i === 6,
        isAnswered: prayers[i].ans,
        category: prayerCats[prayers[i].cat],
        prayerCount: Math.floor(Math.random() * 30) + 5,
      });
    }

    // ── Giving Records ──
    const givingTypes = ["tithe", "offering", "mission", "building", "benevolence"] as const;
    const payMethods = ["trgpay", "card", "cash"] as const;
    for (let i = 0; i < 30; i++) {
      const mIdx = (i * 7) % allIds.length;
      await ctx.db.insert("givingRecords", {
        churchId,
        memberId: allIds[mIdx],
        amount: Math.floor(Math.random() * 500) * 100 + 2500,
        type: givingTypes[i % givingTypes.length],
        paymentMethod: payMethods[i % payMethods.length],
        note: i % 4 === 0 ? "God bless this church" : undefined,
        date: now - i * DAY * 0.8,
        isRecurring: i % 5 === 0,
      });
    }

    // ── Testimonies ──
    const testimonies = [
      "After 3 years of back pain, God healed me during Sunday worship. I can walk without pain for the first time in years!",
      "My business was about to close. The church prayed over it and this month we had our best month ever. God provides!",
      "We were separated for 8 months. Through marriage ministry and prayer, God restored our family. We renewed our vows last month.",
      "The growth tracker and pastoral counseling helped me discover my calling to youth ministry. I am now a certified youth counselor.",
      "12 years of alcohol dependency. The therapist connection through FaithConnect and the support group changed my life. 2 years sober and counting.",
    ];

    for (let i = 0; i < testimonies.length; i++) {
      const mIdx = (i * 11 + 3) % allIds.length;
      await ctx.db.insert("testimonies", {
        churchId,
        memberId: allIds[mIdx],
        content: testimonies[i],
        isApproved: true,
      });
    }

    // ── Announcements ──
    const announcements = [
      { title: "Summer VBS Registration Open", content: "Vacation Bible School is July 14-18. Ages 5-12. Register at the welcome desk or online. Volunteers still needed!", cat: "event" as const },
      { title: "Church Renovation Phase 2", content: "Phase 2 of our building renovation begins June 1. Sanctuary will have temporary seating for 3 weeks.", cat: "general" as const },
      { title: "New Members Class", content: "Interested in membership? Join our 4-week new members class starting this Sunday at 9am in Room 204.", cat: "ministry" as const },
      { title: "Community Blood Drive", content: "Red Cross Blood Drive in our fellowship hall next Saturday 9am-3pm. Sign up at the info desk.", cat: "event" as const },
    ];

    for (let i = 0; i < announcements.length; i++) {
      await ctx.db.insert("announcements", {
        churchId,
        authorId: demoMember._id,
        title: announcements[i].title,
        content: announcements[i].content,
        category: announcements[i].cat,
        isPinned: i === 0,
        publishedAt: now - i * DAY * 2,
      });
    }

    // ── Events ──
    const events = [
      { title: "Community Block Party", desc: "Free food, games, live music, and bouncy houses! Invite your neighbors.", date: now + 14 * DAY, loc: "Church Parking Lot", type: "outreach" as const },
      { title: "Women's Brunch", desc: "A morning of fellowship, worship, and testimony. Guest speaker: Minister Patricia Robinson.", date: now + 7 * DAY, loc: "Fellowship Hall", type: "fellowship" as const },
      { title: "Youth Lock-In", desc: "Friday night lock-in for teens grades 6-12. Games, worship, pizza, and devotional.", date: now + 10 * DAY, loc: "Youth Center", type: "youth" as const },
      { title: "Financial Wellness Workshop", desc: "Free workshop on budgeting, debt elimination, and tithing. Led by Brother Frederick Coleman, CPA.", date: now + 5 * DAY, loc: "Room 108", type: "workshop" as const },
      { title: "Senior Saints Luncheon", desc: "Monthly luncheon for our beloved seniors. Entertainment by the children's choir.", date: now + 3 * DAY, loc: "Fellowship Hall", type: "fellowship" as const },
    ];

    for (const e of events) {
      await ctx.db.insert("events", {
        churchId,
        title: e.title,
        description: e.desc,
        startTime: e.date,
        endTime: e.date + 3 * 3600000,
        location: e.loc,
        type: e.type,
        isRecurring: false,
        createdBy: demoMember._id,
      });
    }

    // ── Life Events ──
    const lifeEvents = [
      { mIdx: 5, type: "birth" as const, title: "Baby Girl Born!", desc: "Marcus and Keisha Johnson welcomed baby Zoe, 7 lbs 4 oz.", person: "Zoe Johnson", date: now - 3 * DAY },
      { mIdx: 12, type: "marriage" as const, title: "Wedding Celebration", desc: "Congratulations to Troy Alexander and Vanessa Cooper!", person: "Troy Alexander & Vanessa Cooper", date: now - 10 * DAY },
      { mIdx: 20, type: "death" as const, title: "In Loving Memory", desc: "Deacon Frank Carter passed peacefully at age 78. Service Saturday at 11am.", person: "Deacon Frank Carter", date: now - 2 * DAY },
      { mIdx: 8, type: "baptism" as const, title: "Baptism Celebration", desc: "Curtis Bell, Natasha Perry, and 3 others were baptized this Sunday.", person: "Curtis Bell", date: now - 7 * DAY },
    ];

    for (const le of lifeEvents) {
      const memberIdx = le.mIdx % allIds.length;
      await ctx.db.insert("lifeEvents", {
        churchId,
        memberId: allIds[memberIdx],
        type: le.type,
        title: le.title,
        description: le.desc,
        personName: le.person,
        eventDate: le.date,
        isPublic: true,
        createdBy: demoMember._id,
        createdAt: le.date,
      });
    }

    return null;
  },
});
