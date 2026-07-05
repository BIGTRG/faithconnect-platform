import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/* eslint-disable @typescript-eslint/no-explicit-any */
function pick(arr: any[]): any { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const DAY = 86400000;

async function getChurchAndMembers(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const church = await ctx.db.query("churches").first();
  if (!church) throw new Error("No church");
  const members = await ctx.db.query("members").withIndex("by_churchId", (q: any) => q.eq("churchId", church._id)).collect();
  return { userId, church, members, churchId: church._id };
}

// ── FaithMatch Profiles + Likes/Matches ─────────────────────
export const seedFaithMatch = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const existing = await ctx.db.query("datingProfiles").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existing.length >= 100) return null;
    const now = Date.now();
    const verses = ["Jeremiah 29:11","Philippians 4:13","Psalm 23:1","Proverbs 3:5-6","Romans 8:28","Isaiah 40:31","Matthew 6:33","John 3:16","Psalm 46:10","1 Corinthians 13:4-7","Ephesians 2:8-9","Galatians 5:22","Joshua 1:9","Psalm 37:4","Proverbs 31:10"];
    const hobbiesPool = ["hiking","cooking","reading","worship music","volunteering","travel","gardening","painting","running","photography","board games","fishing","singing","writing","baking","cycling","meditation","crafts","movie nights","coffee dates"];
    const headlines = ["Walking by faith, not by sight","Seeking a partner in faith and life","God's timing is perfect","Looking for my Proverbs 31 match","Ready for a Christ-centered relationship","Faith, family, and fellowship","Trusting God's plan for love","Let's grow in faith together","Heart on fire for the Lord","Blessed and highly favored","Love is patient, love is kind","Ready to write our love story","Seeking a godly companion","My heart belongs to Jesus first","Grace upon grace"];
    const aboutMes = ["I love Sunday morning worship and Wednesday night Bible study. Looking for someone who shares my passion for serving others.","Active in church ministry for over 5 years. I believe God has someone special planned for me.","I enjoy long walks, deep conversations about faith, and trying new restaurants. Family means everything to me.","Music is my love language -- you'll find me in the choir loft every Sunday. Looking for someone who loves to praise.","I volunteer at the food pantry every Saturday. Service is how I show love. Hoping to find someone with a servant's heart.","Coffee lover, book reader, and devoted believer. I'm looking for genuine connection rooted in Christ.","I coach the youth basketball team and lead a small group. Looking for a partner who loves community.","Recently relocated and fell in love with this church family. Ready to meet someone special here.","I believe the best relationships start with friendship and a shared love for God.","Passionate about missions work -- I've been on 3 international trips. Seeking an adventurous spirit."];
    const involvements = ["Choir member and worship team","Youth ministry volunteer","Sunday school teacher","Usher and greeter","Small group leader","Mission trip coordinator","Prayer team intercessor","Community outreach","Tech and media team","Children's church helper"];
    const genders: Array<"male" | "female"> = ["male", "female"];
    const profileIds: any[] = [];
    // Create 200 FaithMatch profiles from random members
    const shuffled = [...members].sort(() => Math.random() - 0.5).slice(0, 200);
    for (const m of shuffled) {
      const gender = pick(genders);
      const interestedIn = Math.random() > 0.5 ? (gender === "male" ? "female" : "male") : "everyone";
      const pid = await ctx.db.insert("datingProfiles", {
        churchId,
        memberId: m._id,
        headline: pick(headlines),
        aboutMe: pick(aboutMes),
        lookingFor: pick(["Serious relationship","Marriage-minded","Friendship first","Life partner","Godly companionship"]),
        ageRange: pick(["25-35","30-45","35-50","40-55","21-30","28-40"]),
        gender,
        interestedIn: interestedIn as "male" | "female" | "everyone",
        favoriteVerse: pick(verses),
        hobbies: [pick(hobbiesPool), pick(hobbiesPool), pick(hobbiesPool)],
        churchInvolvement: pick(involvements),
        isVisible: true,
        createdAt: now - randInt(1, 180) * DAY,
        updatedAt: now - randInt(0, 30) * DAY,
      });
      profileIds.push(pid);
    }
    // Create 150 likes with 40 matches
    for (let i = 0; i < 150; i++) {
      const from = pick(profileIds);
      const to = pick(profileIds);
      if (from === to) continue;
      await ctx.db.insert("datingLikes", {
        fromProfileId: from,
        toProfileId: to,
        isMatch: i < 40,
        createdAt: now - randInt(0, 90) * DAY,
      });
    }
    // Create 25 match conversations
    for (let i = 0; i < 25; i++) {
      const p1 = profileIds[i];
      const p2 = profileIds[i + 100] ?? profileIds[i + 50];
      if (!p2) continue;
      const msgs = ["Hey! I noticed we both love worship music. What's your favorite hymn?","Hi there! Your profile really resonated with me. I'd love to chat!","Hello! I see you're in the choir too -- we should connect!","Grace and peace! I loved reading about your mission trip experiences.","Hey! Your favorite verse is one of mine too. That's a great sign!"];
      for (let j = 0; j < 3; j++) {
        await ctx.db.insert("datingMessages", {
          matchFromId: p1,
          matchToId: p2,
          senderId: j % 2 === 0 ? p1 : p2,
          content: pick(msgs),
          isRead: j < 2,
          sentAt: now - randInt(0, 30) * DAY + j * 3600000,
        });
      }
    }
    return null;
  },
});

// ── Prayer Requests (200+) ──────────────────────────────────
export const seedMassivePrayers = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const existing = await ctx.db.query("prayerRequests").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existing.length >= 150) return null;
    const now = Date.now();
    const titles = ["Healing for my mother","Strength during job loss","Guidance for career change","Protection for my family","Wisdom for a big decision","Peace in my marriage","Recovery from surgery","Safe travel mercies","Breakthrough in finances","Deliverance from anxiety","Health for my newborn","Comfort after a loss","Restoration of relationships","Direction for my ministry","Salvation for my brother","Overcoming addiction","Healing from depression","Provision for bills","Peace in difficult times","Strength for caregiving","Protection for deployed son","Guidance for college choice","Healing for cancer diagnosis","Comfort for grieving friend","Patience during waiting season","Wisdom for parenting teens","Safe pregnancy and delivery","Job interview this week","Moving to a new city","Starting a new business","Church growth and revival","Unity in our congregation","Youth camp safety","Mission trip provision","Pastor's health and strength"];
    const contents = ["Please keep my family in prayer as we navigate this difficult season. God is faithful and we trust His plan.","I am asking for prayer warriors to lift this situation up. I know God hears our prayers and He is able.","This has been weighing on my heart heavily. I believe in the power of corporate prayer and ask for your support.","Standing on the promises of God during this trial. Your prayers mean more than you know.","Requesting urgent prayer for a breakthrough. I know that where two or three are gathered, He is in the midst.","My heart is heavy but my faith is strong. Please join me in prayer for this need.","Trusting God for a miracle in this situation. Please agree with me in prayer.","I need the prayer covering of my church family right now. Thank you for your faithfulness."];
    const categories: Array<"health" | "family" | "financial" | "spiritual" | "work" | "relationships" | "gratitude" | "other"> = ["health","family","financial","spiritual","work","relationships","gratitude","other"];
    for (let i = 0; i < 200; i++) {
      const isAnswered = Math.random() < 0.35;
      const createdDaysAgo = randInt(0, 365);
      await ctx.db.insert("prayerRequests", {
        churchId,
        memberId: pick(members)._id,
        title: pick(titles),
        content: pick(contents),
        isAnonymous: Math.random() < 0.15,
        isAnswered,
        answeredNote: isAnswered ? "God answered this prayer! Praise the Lord!" : undefined,
        answeredAt: isAnswered ? now - randInt(0, createdDaysAgo) * DAY : undefined,
        prayerCount: randInt(3, 85),
        category: pick(categories),
      });
    }
    return null;
  },
});

// ── Giving Records (500+) ───────────────────────────────────
export const seedMassiveGiving = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const existing = await ctx.db.query("givingRecords").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existing.length >= 300) return null;
    const now = Date.now();
    const types: Array<"tithe" | "offering" | "mission" | "building" | "benevolence" | "campaign" | "other"> = ["tithe","tithe","tithe","offering","offering","mission","building","benevolence","campaign","other"];
    const methods: Array<"trgpay" | "card" | "cash" | "check" | "bank_transfer"> = ["trgpay","trgpay","card","card","cash","check","bank_transfer"];
    for (let i = 0; i < 500; i++) {
      const t = pick(types);
      const amount = t === "tithe" ? randInt(50, 2000) : t === "building" ? randInt(100, 5000) : t === "mission" ? randInt(25, 500) : randInt(10, 300);
      const isP2P = Math.random() < 0.08;
      await ctx.db.insert("givingRecords", {
        churchId,
        memberId: pick(members)._id,
        amount,
        type: t,
        paymentMethod: pick(methods),
        transactionId: `TXN-${Date.now()}-${i}`,
        note: Math.random() < 0.3 ? pick(["God bless this ministry","For the building fund","Monthly tithe","Special offering","Mission support","In memory of loved one"]) : undefined,
        date: now - randInt(0, 365) * DAY,
        isRecurring: t === "tithe" && Math.random() < 0.4,
        recipientMemberId: isP2P ? pick(members)._id : undefined,
      });
    }
    return null;
  },
});

// ── Social Posts + Testimonies ──────────────────────────────
export const seedMassiveSocial = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const existingPosts = await ctx.db.query("socialPosts").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingPosts.length >= 100) return null;
    const now = Date.now();
    const postContents = [
      "What an incredible worship service today! The presence of God was so strong in the sanctuary.",
      "Our youth group just finished their community service project -- 500 meals packed for families in need!",
      "Blessed to be part of this amazing church family. God is doing great things here!",
      "Bible study tonight was life-changing. The book of James is hitting different this time around.",
      "Got baptized today! New life in Christ. Thank you all for your prayers and support!",
      "The choir absolutely brought the house down this Sunday. That rendition of Amazing Grace was everything!",
      "Volunteered at the homeless shelter with our outreach team. Served 200 meals. God is good!",
      "Just finished reading through the entire book of Psalms in 30 days. What a journey!",
      "Our small group had an incredible discussion about forgiveness tonight. So grateful for this community.",
      "Prayer walk around our neighborhood this morning. Covering every house in prayer!",
      "The women's conference was phenomenal! Speaker brought powerful words about identity in Christ.",
      "Thankful for our pastors who pour into us every single week. You are appreciated!",
      "Just signed up for the mission trip to Guatemala! Who else is going?",
      "Movie night at church was a blast! Great fellowship and amazing snacks.",
      "Sunday school class is growing -- we had 45 people today! Time to split into two groups!",
      "The marriage retreat weekend changed our lives. If you haven't gone, sign up now!",
      "Our food pantry served 300 families this month. That's a new record! God provides!",
      "Beautiful baby dedication ceremony today. Welcome to the family, little ones!",
      "Night of worship was absolutely incredible. We didn't want it to end!",
      "So proud of our young adults stepping up into leadership roles. The future of our church is bright!",
      "Easter service preparations are underway! This is going to be our biggest celebration yet!",
      "Finished my first year as a Sunday school teacher. These kids have taught ME so much.",
      "Community garden is producing like crazy! Fresh veggies for everyone after service!",
      "VBS registration is open! We need 50 more volunteers -- who's in?",
      "What a powerful testimony from Sister Johnson tonight. God's faithfulness never fails!",
    ];
    const types: Array<"text" | "photo" | "testimony" | "prayer_update" | "event_share"> = ["text","text","text","photo","testimony","prayer_update","event_share","text","text","photo"];
    for (let i = 0; i < 150; i++) {
      const post = await ctx.db.insert("socialPosts", {
        churchId,
        authorId: pick(members)._id,
        content: pick(postContents),
        type: pick(types),
        likeCount: randInt(2, 120),
        commentCount: randInt(0, 35),
        isActive: true,
        postedAt: now - randInt(0, 180) * DAY,
      });
      // Add some likes
      for (let j = 0; j < randInt(1, 8); j++) {
        await ctx.db.insert("socialLikes", {
          postId: post,
          memberId: pick(members)._id,
          createdAt: now - randInt(0, 180) * DAY,
        });
      }
      // Add some comments
      if (Math.random() < 0.6) {
        const commentTexts = ["Amen!","So beautiful!","God is good!","Praying for you!","This is amazing!","Love this!","Hallelujah!","What a blessing!","Praise God!","So inspiring!"];
        for (let j = 0; j < randInt(1, 4); j++) {
          await ctx.db.insert("socialComments", {
            postId: post,
            authorId: pick(members)._id,
            content: pick(commentTexts),
            postedAt: now - randInt(0, 180) * DAY,
          });
        }
      }
    }
    // Testimonies
    const existingTest = await ctx.db.query("testimonies").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingTest.length < 50) {
      const testimonyContents = [
        "God healed me from stage 3 cancer. The doctors said it was impossible, but we serve a God of miracles! After months of prayer from this congregation, my latest scans came back completely clear.",
        "I was addicted to alcohol for 15 years. Through the recovery ministry at this church and the unwavering support of my brothers in Christ, I have been sober for 2 years. To God be the glory!",
        "After being unemployed for 8 months, God opened a door I never expected. I'm now working my dream job and earning more than I ever have. He is Jehovah Jireh!",
        "My marriage was on the brink of divorce. Through the couples counseling ministry and fervent prayer, God restored what was broken. We are stronger than ever!",
        "I lost my home in a fire last year. This church family rallied around us, providing shelter, clothes, and love. We now have a new home and a testimony of God's faithfulness.",
        "After years of infertility, God blessed us with twins! We are overwhelmed with gratitude for every prayer that was lifted on our behalf.",
        "I was living on the streets when someone from this church invited me in. That changed everything. I'm now housed, employed, and serving in the very ministry that saved me.",
        "God delivered me from crippling anxiety and depression. Through the mental health ministry and prayer, I found peace that surpasses all understanding.",
        "My prodigal son came home. After 7 years of praying without ceasing, he walked back into church last Sunday. There wasn't a dry eye in the building.",
        "I started a small business with nothing but a prayer and $200. God multiplied it. This year we crossed $1 million in revenue and we tithe faithfully to this church.",
      ];
      for (let i = 0; i < 60; i++) {
        await ctx.db.insert("testimonies", {
          churchId,
          memberId: pick(members)._id,
          content: pick(testimonyContents),
          isApproved: Math.random() < 0.85,
        });
      }
    }
    return null;
  },
});

// ── Events + Registrations ──────────────────────────────────
export const seedMassiveEvents = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const existing = await ctx.db.query("events").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existing.length >= 30) return null;
    const now = Date.now();
    const events = [
      { title: "Sunday Morning Worship", type: "service" as const, loc: "Main Sanctuary", max: 500, desc: "Join us for our weekly worship celebration with praise, prayer, and the Word." },
      { title: "Wednesday Night Bible Study", type: "bible_study" as const, loc: "Fellowship Hall", max: 200, desc: "Deep dive into the book of Romans. All are welcome!" },
      { title: "Youth Night - Game Night Edition", type: "youth" as const, loc: "Youth Center", max: 100, desc: "Fun, games, and fellowship for teens ages 13-18." },
      { title: "Community Food Drive", type: "outreach" as const, loc: "Church Parking Lot", max: 50, desc: "Help us collect and distribute food to families in need." },
      { title: "Church Anniversary Celebration", type: "fellowship" as const, loc: "Main Sanctuary", max: 800, desc: "Celebrating 25 years of faithful ministry in our community!" },
      { title: "Leadership Team Meeting", type: "meeting" as const, loc: "Conference Room", max: 30, desc: "Monthly leadership planning and vision casting session." },
      { title: "Financial Peace Workshop", type: "workshop" as const, loc: "Room 201", max: 60, desc: "Learn biblical principles of money management and stewardship." },
      { title: "Men's Prayer Breakfast", type: "fellowship" as const, loc: "Fellowship Hall", max: 75, desc: "Brothers in Christ coming together for food, fellowship, and prayer." },
      { title: "Women's Conference 2026", type: "other" as const, loc: "Main Sanctuary", max: 400, desc: "Annual women's conference: 'Fearfully and Wonderfully Made'" },
      { title: "Vacation Bible School", type: "youth" as const, loc: "Education Building", max: 200, desc: "A week of fun, learning, and growing in faith for kids K-6th grade." },
      { title: "Marriage Enrichment Retreat", type: "fellowship" as const, loc: "Mountain Lodge Retreat Center", max: 40, desc: "A weekend away for couples to strengthen their bond in Christ." },
      { title: "New Members Orientation", type: "meeting" as const, loc: "Room 101", max: 50, desc: "Welcome session for those interested in joining our church family." },
      { title: "Easter Sunrise Service", type: "service" as const, loc: "Church Garden", max: 300, desc: "Celebrate the resurrection at dawn with praise and communion." },
      { title: "Back to School Prayer Walk", type: "outreach" as const, loc: "Local Schools", max: 100, desc: "Walk and pray over our children's schools for the upcoming year." },
      { title: "Christmas Cantata Rehearsal", type: "other" as const, loc: "Choir Room", max: 60, desc: "Practice for our annual Christmas musical presentation." },
      { title: "Singles Mixer & Fellowship", type: "fellowship" as const, loc: "Coffee Shop", max: 40, desc: "A casual evening for singles to connect in a faith-based setting." },
      { title: "Senior Saints Luncheon", type: "fellowship" as const, loc: "Fellowship Hall", max: 80, desc: "Monthly gathering for our beloved senior members. Lunch provided!" },
      { title: "Mission Trip Info Session", type: "meeting" as const, loc: "Room 203", max: 30, desc: "Learn about our upcoming mission trip to Guatemala." },
      { title: "Praise & Worship Night", type: "service" as const, loc: "Main Sanctuary", max: 500, desc: "An evening dedicated entirely to worship. Come as you are!" },
      { title: "Health & Wellness Fair", type: "outreach" as const, loc: "Gymnasium", max: 200, desc: "Free health screenings, fitness demos, and wellness resources for the community." },
    ];
    for (const e of events) {
      const daysOffset = randInt(-30, 60);
      const startTime = now + daysOffset * DAY + randInt(8, 19) * 3600000;
      const eventId = await ctx.db.insert("events", {
        churchId,
        title: e.title,
        description: e.desc,
        startTime,
        endTime: startTime + randInt(1, 3) * 3600000,
        location: e.loc,
        type: e.type,
        isRecurring: e.type === "service" || e.type === "bible_study",
        maxAttendees: e.max,
        createdBy: pick(members)._id,
      });
      // Register random members
      const regCount = randInt(15, Math.min(e.max, 80));
      const regMembers = [...members].sort(() => Math.random() - 0.5).slice(0, regCount);
      for (const m of regMembers) {
        await ctx.db.insert("eventRegistrations", {
          eventId,
          memberId: m._id,
          status: Math.random() < 0.9 ? "registered" : "waitlisted",
          registeredAt: now - randInt(0, 30) * DAY,
        });
      }
    }
    return null;
  },
});

// ── Groups + Group Members ──────────────────────────────────
export const seedMassiveGroups = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const existing = await ctx.db.query("groups").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existing.length >= 15) return null;
    const now = Date.now();
    const groups = [
      { name: "Men of Valor", desc: "Men's fellowship and accountability group meeting every other Saturday.", cat: "fellowship", schedule: "Bi-weekly Saturdays 8AM" },
      { name: "Women of Purpose", desc: "Empowering women through study, prayer, and community service.", cat: "fellowship", schedule: "Weekly Tuesdays 7PM" },
      { name: "Young Adults Connect", desc: "For ages 18-30. Life, faith, and navigating adulthood together.", cat: "study", schedule: "Weekly Fridays 7PM" },
      { name: "Married Couples Circle", desc: "Strengthening marriages through biblical principles and fellowship.", cat: "fellowship", schedule: "Monthly 1st Saturdays" },
      { name: "Intercessory Prayer Team", desc: "Dedicated prayer warriors covering the church and community.", cat: "prayer", schedule: "Daily 6AM, Weekly Thursdays 6PM" },
      { name: "Worship Arts Ministry", desc: "Choir, praise band, dance ministry, and creative arts.", cat: "ministry", schedule: "Weekly Wednesdays 6PM" },
      { name: "Community Outreach Team", desc: "Serving our neighbors through food drives, clothing, and support.", cat: "service", schedule: "Monthly 3rd Saturdays" },
      { name: "Bible Scholars", desc: "Deep theological study group for serious students of the Word.", cat: "study", schedule: "Weekly Mondays 7PM" },
      { name: "Senior Saints Fellowship", desc: "Activities, trips, and fellowship for our beloved seniors.", cat: "fellowship", schedule: "Monthly 2nd Wednesdays" },
      { name: "Single Parents Support", desc: "Encouragement, resources, and community for single parents.", cat: "support", schedule: "Bi-weekly Sundays 5PM" },
      { name: "Tech & Media Ministry", desc: "Running sound, livestream, social media, and church tech.", cat: "ministry", schedule: "Weekly Sundays + Wednesdays" },
      { name: "Financial Stewardship", desc: "Learning biblical money management and building wealth God's way.", cat: "study", schedule: "6-week course quarterly" },
      { name: "Grief & Loss Support", desc: "Walking alongside those experiencing loss with compassion.", cat: "support", schedule: "Weekly Tuesdays 6PM" },
      { name: "Missions & Global Impact", desc: "Planning and executing local and international mission work.", cat: "ministry", schedule: "Monthly 1st Mondays" },
      { name: "New Believers Class", desc: "Foundations of faith for those new to Christianity.", cat: "study", schedule: "Weekly Sundays 9AM" },
      { name: "Health & Fitness Fellowship", desc: "Honoring God with our bodies through exercise and wellness.", cat: "fellowship", schedule: "Weekly Mon/Wed/Fri 6AM" },
      { name: "Recovery & Restoration", desc: "Christ-centered recovery from addiction and life struggles.", cat: "support", schedule: "Weekly Thursdays 7PM" },
      { name: "Creative Writing Circle", desc: "Expressing faith through poetry, devotionals, and storytelling.", cat: "fellowship", schedule: "Monthly 4th Saturdays" },
    ];
    const catMap: Record<string, "ministry" | "bible_study" | "small_group" | "youth" | "outreach" | "worship" | "other"> = {
      fellowship: "small_group", study: "bible_study", prayer: "other", ministry: "ministry", service: "outreach", support: "other",
    };
    for (const g of groups) {
      const groupId = await ctx.db.insert("groups", {
        churchId,
        name: g.name,
        description: g.desc,
        category: catMap[g.cat] ?? "other",
        meetingSchedule: g.schedule,
        isActive: true,
        isPrivate: Math.random() < 0.2,
        leaderId: pick(members)._id,
      });
      // Add 20-80 members to each group
      const groupSize = randInt(20, 80);
      const groupMembers = [...members].sort(() => Math.random() - 0.5).slice(0, groupSize);
      for (const m of groupMembers) {
        await ctx.db.insert("groupMembers", {
          groupId,
          memberId: m._id,
          role: Math.random() < 0.05 ? "leader" : "member",
          joinedAt: now - randInt(0, 365) * DAY,
        });
      }
    }
    return null;
  },
});

// ── Life Events, Crisis, Therapists, Medical ────────────────
export const seedMassiveSupport = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const now = Date.now();

    // Life Events (100+)
    const existingLE = await ctx.db.query("lifeEvents").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingLE.length < 50) {
      const leTypes: Array<"birth" | "death" | "marriage" | "baptism" | "anniversary" | "graduation" | "other"> = ["birth","death","marriage","baptism","anniversary","graduation","other"];
      const leTitles: Record<string, string[]> = {
        birth: ["Baby Boy Johnson Arrives!","Welcome Baby Girl Smith!","Twin Blessings for the Davis Family","New Addition to the Williams Family","Bundle of Joy for the Browns"],
        death: ["Homegoing of Mother Henderson","In Loving Memory of Deacon Parker","Celebrating the Life of Sister Adams","Rest in Peace Brother Coleman","Memorial for Elder Washington"],
        marriage: ["Mr. & Mrs. Robinson Wedding","Johnson-Williams Union","Love Conquers: Anderson Wedding","Two Become One: Carter-Mitchell","Holy Matrimony: Lee-Foster"],
        baptism: ["Baptism Celebration - 12 New Believers","Youth Baptism Sunday","Adult Baptism - Brother Marcus","Family Baptism Day","New Life in Christ Baptism Service"],
        anniversary: ["50th Wedding Anniversary Celebration","25 Years of Marriage - The Greens","Church Anniversary - 30 Years","10th Anniversary Celebration","Silver Anniversary Dinner"],
        graduation: ["High School Graduation Class of 2026","College Graduate - Sister Thompson","Seminary Graduation Celebration","GED Achievement Celebration","Master's Degree - Brother Hall"],
        other: ["New Home Blessing","Job Promotion Celebration","Retirement Celebration","Missionary Commissioning","Ministry Ordination"],
      };
      for (let i = 0; i < 120; i++) {
        const type = pick(leTypes);
        const m = pick(members);
        await ctx.db.insert("lifeEvents", {
          churchId,
          memberId: m._id,
          type,
          title: pick(leTitles[type]),
          description: "The church family celebrates and supports during this significant moment.",
          personName: m.displayName,
          eventDate: now - randInt(0, 365) * DAY,
          isPublic: type !== "death" || Math.random() < 0.8,
          createdBy: pick(members)._id,
          createdAt: now - randInt(0, 365) * DAY,
        });
      }
    }

    // Crisis Teams first
    const existingCT = await ctx.db.query("crisisTeams").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    let teamId: any;
    if (existingCT.length === 0) {
      teamId = await ctx.db.insert("crisisTeams", {
        churchId,
        name: "One Care Crisis Network",
        description: "Church crisis response team supported by One Care Crisis Network management company",
        leaderId: pick(members)._id,
        managementPartner: "One Care Crisis Network",
        partnerPhone: "(404) 555-9111",
        partnerEmail: "crisis@onecarenetwork.org",
        isActive: true,
        createdAt: now - 365 * DAY,
      });
      // Add 5 team members
      for (let i = 0; i < 5; i++) {
        await ctx.db.insert("crisisTeamMembers", {
          teamId,
          memberId: pick(members)._id,
          role: i === 0 ? "coordinator" : "volunteer",
          isOnCall: Math.random() > 0.3,
          joinedAt: now - randInt(30, 365) * DAY,
        });
      }
    } else {
      teamId = existingCT[0]._id;
    }

    // Crisis Incidents (30)
    const existingCI = await ctx.db.query("crisisIncidents").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingCI.length < 10) {
      const crisisTitles = ["Hospital Visit Needed","Family in Crisis","Bereavement Support","Emergency Shelter Needed","Mental Health Check-in","Financial Emergency","Home Disaster Response","Post-Surgery Care","Community Crisis Response","Youth Emergency"];
      const crisisDescs = ["Member hospitalized after accident -- dispatch pair for hospital visit","Family displaced by house fire -- need immediate shelter and supplies","Death in the family -- bereavement support and meal train needed","Mental health emergency -- crisis coordinator notified for wellness check","Financial hardship -- bills due immediately, benevolence fund activated","Natural disaster impact on member's home -- response team mobilizing","Post-surgery recovery -- need visitation and meal support for 2 weeks"];
      const statuses: Array<"reported" | "assigned" | "dispatched" | "in_progress" | "resolved" | "closed"> = ["reported","assigned","dispatched","in_progress","resolved","resolved","closed"];
      for (let i = 0; i < 30; i++) {
        const status = pick(statuses);
        await ctx.db.insert("crisisIncidents", {
          churchId,
          teamId,
          reportedBy: pick(members)._id,
          title: pick(crisisTitles),
          description: pick(crisisDescs),
          severity: pick(["low","medium","high","critical"] as const),
          status,
          assignedTo: status !== "reported" ? pick(members)._id : undefined,
          dispatchLocation: status === "dispatched" || status === "in_progress" ? pick(["hospital","church","home","other"] as const) : undefined,
          resolvedAt: status === "resolved" || status === "closed" ? now - randInt(0, 30) * DAY : undefined,
          notes: Math.random() < 0.5 ? "Follow-up scheduled. Pair dispatched and confirmed arrival." : undefined,
          reportedAt: now - randInt(0, 180) * DAY,
        });
      }
    }

    // Therapists (15)
    const existingTh = await ctx.db.query("therapists").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingTh.length < 5) {
      const specs: Array<"general" | "marriage" | "grief" | "addiction" | "youth" | "trauma" | "anxiety" | "depression" | "family"> = ["marriage","grief","addiction","youth","trauma","anxiety","depression","family","general","marriage","grief","addiction","youth","trauma","anxiety"];
      const therapistNames = ["Dr. Angela Morrison","Dr. Kenneth Williams","Rev. Sandra Hughes","Dr. Tyrone Mitchell","Dr. Patricia Grant","Dr. Marcus Cole","Rev. Deborah Foster","Dr. Raymond Scott","Dr. Crystal Washington","Dr. Jerome Adams","Dr. Vanessa Bell","Rev. Harold Patterson","Dr. Jasmine Collins","Dr. Curtis Howard","Dr. Monique Rivera"];
      const titles = ["Licensed Professional Counselor","Licensed Marriage & Family Therapist","Licensed Clinical Social Worker","Doctor of Psychology","Pastoral Counselor","Licensed Professional Counselor","Ordained Minister & Counselor","Licensed Professional Counselor","Licensed Marriage & Family Therapist","Doctor of Psychology","Licensed Clinical Social Worker","Pastoral Counselor","Doctor of Philosophy in Psychology","Licensed Professional Counselor","Licensed Marriage & Family Therapist"];
      for (let i = 0; i < 15; i++) {
        await ctx.db.insert("therapists", {
          churchId,
          name: therapistNames[i],
          title: titles[i],
          specialty: specs[i],
          credentials: ["Licensed", pick(["LPC","LMFT","LCSW","PsyD","MDiv","PhD"])],
          bio: `Experienced faith-based counselor specializing in ${specs[i]} counseling. Over ${randInt(5, 25)} years serving church communities.`,
          isFaithBased: true,
          sessionRate: randInt(50, 150),
          isFree: Math.random() < 0.2,
          phone: `(${randInt(200,999)}) ${randInt(100,999)}-${String(randInt(1000,9999))}`,
          email: `dr.${therapistNames[i].split(" ")[2]?.toLowerCase() ?? therapistNames[i].split(" ")[1].toLowerCase()}@faithcounseling.org`,
          isActive: Math.random() > 0.1,
          availability: ["Monday 9AM-5PM","Wednesday 10AM-6PM","Friday 9AM-3PM"],
          rating: randInt(40, 50) / 10,
          totalSessions: randInt(50, 500),
          createdAt: now - randInt(90, 730) * DAY,
        });
      }
    }

    // Medical Providers (15)
    const existingMed = await ctx.db.query("medicalProviders").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingMed.length < 5) {
      const providerData: Array<{ name: string; spec: "primary_care" | "dentist" | "pediatrics" | "obgyn" | "cardiology" | "dermatology" | "orthopedics" | "optometry" | "psychiatry" | "physical_therapy" | "chiropractic" | "pharmacy" | "urgent_care" | "telehealth" | "other"; fac: string }> = [
        { name: "Dr. James Washington, MD", spec: "primary_care", fac: "Grace Medical Center" },
        { name: "Dr. Lisa Thompson, DO", spec: "pediatrics", fac: "Children's Health Partners" },
        { name: "Dr. Robert Brown, DDS", spec: "dentist", fac: "Bright Smile Dental" },
        { name: "Dr. Maria Garcia, OD", spec: "optometry", fac: "Clear Vision Eye Care" },
        { name: "Dr. David Lee, PharmD", spec: "pharmacy", fac: "Community Health Pharmacy" },
        { name: "Dr. Sarah Mitchell, MD", spec: "obgyn", fac: "Women's Wellness Center" },
        { name: "Dr. Kevin Harris, DC", spec: "chiropractic", fac: "Spine & Wellness Clinic" },
        { name: "Dr. Angela Foster, PsyD", spec: "psychiatry", fac: "Mind & Spirit Wellness" },
        { name: "Dr. Marcus Young, MD", spec: "primary_care", fac: "Premier Internal Medicine" },
        { name: "Dr. Jennifer White, DPT", spec: "physical_therapy", fac: "Restore Physical Therapy" },
        { name: "Dr. Thomas Adams, MD", spec: "cardiology", fac: "Heart Health Associates" },
        { name: "Dr. Patricia Cole, MD", spec: "dermatology", fac: "Skin Care Specialists" },
        { name: "Dr. William Scott, MD", spec: "orthopedics", fac: "Joint & Bone Center" },
        { name: "Dr. Diane Jackson, APRN", spec: "urgent_care", fac: "Community Health Clinic" },
        { name: "Dr. Charles Moore, MD", spec: "psychiatry", fac: "Behavioral Health Associates" },
      ];
      for (const p of providerData) {
        await ctx.db.insert("medicalProviders", {
          churchId,
          name: p.name,
          specialty: p.spec,
          practice: p.fac,
          phone: `(${randInt(200,999)}) ${randInt(100,999)}-${String(randInt(1000,9999))}`,
          email: `${p.name.split(" ")[1].toLowerCase()}@${p.fac.toLowerCase().replace(/[^a-z]/g, "")}.com`,
          address: `${randInt(100,9999)} ${pick(["Main","Oak","Elm","Church","Peachtree","MLK","Highland","Ponce"])} ${pick(["St","Ave","Blvd","Dr","Rd"])}`,
          acceptsInsurance: Math.random() > 0.2,
          insuranceList: ["Blue Cross","United Healthcare","Aetna","Cigna"],
          isFaithAligned: true,
          isChurchMember: Math.random() < 0.4,
          offersTelemedicine: Math.random() < 0.5,
          rating: randInt(40, 50) / 10,
          bio: `Experienced ${p.spec.replace("_", " ")} provider serving our church community.`,
          hours: "Mon-Fri 8AM-5PM",
          isVerified: true,
          createdAt: now - randInt(90, 365) * DAY,
        });
      }
    }

    return null;
  },
});

// ── Store Products + Orders, Book Library, Expert Q&A ───────
export const seedMassiveCommerce = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const now = Date.now();

    // Store Products (30+)
    const existingSP = await ctx.db.query("storeProducts").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingSP.length < 15) {
      const products = [
        { name: "Grace Community T-Shirt", cat: "apparel", price: 25, desc: "Premium cotton tee with church logo. Available in S-3XL." },
        { name: "Faith Over Fear Hoodie", cat: "apparel", price: 45, desc: "Warm fleece hoodie with inspirational message." },
        { name: "Church Logo Baseball Cap", cat: "apparel", price: 18, desc: "Adjustable cap with embroidered church emblem." },
        { name: "Prayer Journal - Leather Bound", cat: "books", price: 22, desc: "Beautiful leather journal for daily prayer and reflection." },
        { name: "Sunday Best Coffee Mug", cat: "accessories", price: 15, desc: "Ceramic mug with scripture art. Dishwasher safe." },
        { name: "Blessed & Grateful Water Bottle", cat: "accessories", price: 20, desc: "Insulated stainless steel bottle. Keeps drinks cold 24hrs." },
        { name: "Church Anniversary Commemorative Pin", cat: "accessories", price: 10, desc: "Limited edition 25th anniversary collectible pin." },
        { name: "Kids Ministry Backpack", cat: "gifts", price: 28, desc: "Durable backpack with fun faith graphics for kids." },
        { name: "Worship Night Live Album", cat: "media", price: 12, desc: "Recorded live at our annual worship night. 14 tracks." },
        { name: "Pastor's Sermon Series USB", cat: "media", price: 15, desc: "Complete 2025 sermon series on USB drive." },
        { name: "Church Cookbook - Soul Food Edition", cat: "books", price: 20, desc: "100+ recipes from our church family kitchen." },
        { name: "Faith & Family Board Game", cat: "gifts", price: 30, desc: "Fun Bible trivia game for the whole family." },
        { name: "Scripture Art Canvas Print", cat: "art", price: 35, desc: "Beautifully designed canvas with Jeremiah 29:11." },
        { name: "Church Tote Bag", cat: "accessories", price: 12, desc: "Eco-friendly canvas tote with church branding." },
        { name: "Youth Group Wristband Set", cat: "accessories", price: 8, desc: "Set of 5 silicone wristbands with faith messages." },
        { name: "Anointing Oil Gift Set", cat: "gifts", price: 18, desc: "Premium anointing oil in decorative glass bottle." },
        { name: "Baptism Certificate Frame", cat: "gifts", price: 25, desc: "Elegant frame designed for baptism certificates." },
        { name: "Church Calendar 2026", cat: "accessories", price: 10, desc: "Full-color wall calendar with church events and photos." },
        { name: "Daily Devotional Book", cat: "books", price: 16, desc: "365 days of devotional readings by our pastoral team." },
        { name: "Communion Wine Goblet Set", cat: "supplies", price: 40, desc: "Handcrafted wooden goblet set for home communion." },
      ];
      const productIds: any[] = [];
      for (const p of products) {
        const pid = await ctx.db.insert("storeProducts", {
          churchId,
          name: p.name,
          description: p.desc,
          price: p.price,
          category: p.cat as any,
          inventory: randInt(10, 200),
          isDigital: p.cat === "media",
          isActive: true,
          isFeatured: Math.random() < 0.2,
          createdAt: now - randInt(30, 365) * DAY,
        });
        productIds.push(pid);
      }
      // Store Orders (100+)
      const statuses: Array<"pending" | "paid" | "shipped" | "delivered" | "cancelled"> = ["pending","paid","shipped","delivered","delivered","delivered","delivered","cancelled"];
      for (let i = 0; i < 120; i++) {
        const qty = randInt(1, 3);
        const price = randInt(10, 45);
        await ctx.db.insert("storeOrders", {
          churchId,
          memberId: pick(members)._id,
          items: [{ productId: pick(productIds), name: "Church Product", price, quantity: qty }],
          total: price * qty,
          status: pick(statuses),
          shippingAddress: `${randInt(100,9999)} ${pick(["Main St","Oak Ave","Church Blvd","Elm Dr","Peachtree Rd"])}`,
          paymentMethod: pick(["TRGPay","Credit Card","Debit Card"]),
          createdAt: now - randInt(0, 180) * DAY,
        });
      }
    }

    // Book Library (25+)
    const existingBooks = await ctx.db.query("bookLibrary").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingBooks.length < 10) {
      const books: Array<{ title: string; author: string; price: number; cat: "devotional" | "theology" | "marriage" | "parenting" | "leadership" | "youth" | "prayer" | "healing" | "finance" | "missions" | "testimony" | "study_guide" }> = [
        { title: "Walking in Purpose: A 30-Day Devotional", author: "AI Generated", price: 9.99, cat: "devotional" },
        { title: "Marriage God's Way", author: "AI Generated", price: 14.99, cat: "marriage" },
        { title: "Raising Godly Children in a Digital Age", author: "AI Generated", price: 12.99, cat: "parenting" },
        { title: "Financial Freedom Through Faith", author: "AI Generated", price: 11.99, cat: "finance" },
        { title: "The Prayer Warrior's Handbook", author: "AI Generated", price: 8.99, cat: "prayer" },
        { title: "Overcoming Anxiety with Scripture", author: "AI Generated", price: 7.99, cat: "healing" },
        { title: "Leadership Lessons from the Bible", author: "AI Generated", price: 15.99, cat: "leadership" },
        { title: "Youth on Fire: Teen Devotional", author: "AI Generated", price: 6.99, cat: "youth" },
        { title: "Songs of the Soul: Worship Reflections", author: "AI Generated", price: 10.99, cat: "devotional" },
        { title: "Healing After Loss: A Grief Journey", author: "AI Generated", price: 9.99, cat: "healing" },
        { title: "The Armor of God: Daily Readings", author: "AI Generated", price: 8.99, cat: "theology" },
        { title: "Kingdom Business: Entrepreneurship & Faith", author: "AI Generated", price: 19.99, cat: "leadership" },
        { title: "Fasting for Breakthrough", author: "AI Generated", price: 7.99, cat: "prayer" },
        { title: "Women of the Bible: Modern Lessons", author: "AI Generated", price: 13.99, cat: "study_guide" },
        { title: "Men of Honor: Biblical Masculinity", author: "AI Generated", price: 13.99, cat: "study_guide" },
        { title: "From Broken to Blessed", author: "AI Generated", price: 11.99, cat: "testimony" },
        { title: "Church Planting 101", author: "AI Generated", price: 24.99, cat: "missions" },
        { title: "Understanding the Book of Revelation", author: "AI Generated", price: 16.99, cat: "theology" },
        { title: "Grace Under Pressure", author: "AI Generated", price: 10.99, cat: "devotional" },
        { title: "The Single Christian's Guide", author: "AI Generated", price: 9.99, cat: "marriage" },
      ];
      for (const b of books) {
        await ctx.db.insert("bookLibrary", {
          churchId,
          title: b.title,
          author: b.author,
          description: `AI-generated faith-based book tailored for our church community. Category: ${b.cat}.`,
          price: b.price,
          category: b.cat,
          isAiGenerated: true,
          isFeatured: Math.random() < 0.2,
          isPublished: true,
          pageCount: randInt(80, 350),
          rating: randInt(35, 50) / 10,
          totalSales: randInt(5, 150),
          generatedAt: now - randInt(7, 180) * DAY,
          publishedAt: now - randInt(7, 180) * DAY,
          createdAt: now - randInt(7, 180) * DAY,
        });
      }
    }

    // Expert Q&A (50+ questions)
    const existingEQ = await ctx.db.query("expertQuestions").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingEQ.length < 20) {
      const categories = await ctx.db.query("expertCategories").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
      let catIds = categories.map((c: any) => c._id);
      if (catIds.length === 0) {
        const cats = [
          { name: "Ask the Pastor", slug: "ask-pastor", desc: "Spiritual guidance and biblical questions", price: 0.99 },
          { name: "Ask Faith Legal", slug: "faith-legal", desc: "Legal questions with a faith perspective", price: 1.99 },
          { name: "Marriage Counseling", slug: "marriage", desc: "Relationship advice rooted in scripture", price: 1.49 },
          { name: "Financial Guidance", slug: "financial", desc: "Biblical stewardship and money management", price: 0.99 },
          { name: "Youth Questions", slug: "youth", desc: "Teens and young adults seeking direction", price: 0 },
          { name: "Health & Wellness", slug: "health", desc: "Faith-based health guidance", price: 0.99 },
        ];
        for (let ci = 0; ci < cats.length; ci++) {
          const c = cats[ci];
          const id = await ctx.db.insert("expertCategories", {
            churchId,
            name: c.name,
            slug: c.slug,
            description: c.desc,
            pricePerQuestion: c.price,
            isFree: c.price === 0,
            isActive: true,
            sortOrder: ci,
          });
          catIds.push(id);
        }
      }
      const questions = [
        "How do I know God's will for my career?",
        "What does the Bible say about dating non-believers?",
        "How should I handle conflict in my marriage?",
        "Is it a sin to have doubts about my faith?",
        "How do I forgive someone who hurt me deeply?",
        "What does the Bible teach about tithing?",
        "How can I help my teenager who is struggling with faith?",
        "What is the biblical view on anxiety medication?",
        "How do I start a prayer life?",
        "What does it mean to be equally yoked?",
        "How do I deal with grief as a Christian?",
        "Is it okay to change churches?",
        "What does the Bible say about divorce and remarriage?",
        "How can I grow spiritually when I feel stuck?",
        "What is the role of the Holy Spirit in daily life?",
        "How should Christians handle political disagreements?",
        "What does the Bible say about self-care?",
        "How do I teach my children to pray?",
        "Is it wrong to be angry at God?",
        "How do I know if I'm called to ministry?",
      ];
      const answers = [
        "Great question! The Bible tells us in Proverbs 3:5-6 to trust in the Lord with all your heart. Let me share some practical steps...",
        "This is something many believers wrestle with. Scripture provides clear guidance on this topic. Let's look at 2 Corinthians 6:14...",
        "I appreciate you reaching out about this. Biblical conflict resolution starts with Matthew 18:15-17...",
        "You are not alone in this struggle. Even great men and women of faith had moments of doubt. Consider Thomas in John 20...",
      ];
      for (let i = 0; i < 50; i++) {
        const hasAnswer = Math.random() < 0.7;
        await ctx.db.insert("expertQuestions", {
          churchId,
          categoryId: pick(catIds),
          askerId: pick(members)._id,
          question: pick(questions),
          answer: hasAnswer ? pick(answers) : undefined,
          status: hasAnswer ? "answered" : "pending",
          answeredBy: hasAnswer ? pick(members)._id : undefined,
          answeredAt: hasAnswer ? now - randInt(0, 30) * DAY : undefined,
          askedAt: now - randInt(0, 90) * DAY,
          isPaid: Math.random() < 0.6,
          amountPaid: Math.random() < 0.6 ? pick([0.99, 1.49, 1.99]) : undefined,
        });
      }
    }

    return null;
  },
});

// ── Notifications, Child Check-in, Teen Ministry, Jobs ──────
export const seedMassiveMisc = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { churchId, members } = await getChurchAndMembers(ctx);
    const now = Date.now();

    // Child Profiles + Check-ins (50 children)
    const existingCP = await ctx.db.query("childProfiles").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingCP.length < 20) {
      const childFirstNames = ["Elijah","Noah","Liam","Sophia","Olivia","Emma","Ava","Isabella","Mia","Aiden","Caleb","Ethan","Jayden","Mason","Lucas","Amara","Zion","Naomi","Faith","Hope","Grace","Destiny","Trinity","Aaliyah","Layla","Aria","Chloe","Maya","Kai","Isaiah","Josiah","Micah","Samuel","David","Daniel","Ruth","Esther","Miriam","Joshua","Aaron","Abigail","Hannah","Sarah","Rachel","Leah","Lydia","Tabitha","Priscilla","Timothy","Titus"];
      const rooms = await ctx.db.query("checkinRooms").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
      let roomIds = rooms.map((r: any) => r._id);
      if (roomIds.length === 0) {
        const roomData = [
          { name: "Nursery (0-2)", ageRange: "0-2", cap: 15 },
          { name: "Toddlers (2-3)", ageRange: "2-3", cap: 20 },
          { name: "Pre-K (4-5)", ageRange: "4-5", cap: 25 },
          { name: "Elementary (6-8)", ageRange: "6-8", cap: 30 },
          { name: "Pre-Teen (9-12)", ageRange: "9-12", cap: 25 },
        ];
        for (const r of roomData) {
          const rid = await ctx.db.insert("checkinRooms", {
            churchId,
            name: r.name,
            ageRange: r.ageRange,
            capacity: r.cap,
            currentCount: 0,
            isActive: true,
          });
          roomIds.push(rid);
        }
      }
      const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Davis","Jackson","Wilson","Thomas","Anderson","Harris","Robinson","Clark","Lewis","Walker"];
      const childIds: any[] = [];
      for (let i = 0; i < 50; i++) {
        const age = randInt(0, 12);
        const parent = pick(members);
        const cLast = pick(lastNames);
        const cid = await ctx.db.insert("childProfiles", {
          churchId,
          firstName: pick(childFirstNames),
          lastName: cLast,
          dateOfBirth: `${2026 - age}-${String(randInt(1,12)).padStart(2,"0")}-${String(randInt(1,28)).padStart(2,"0")}`,
          age,
          gender: Math.random() < 0.5 ? "male" : "female",
          allergies: Math.random() < 0.2 ? [pick(["Peanuts","Dairy","Gluten"])] : undefined,
          specialNeeds: Math.random() < 0.1 ? "Requires additional supervision" : undefined,
          guardians: [{
            name: parent.displayName,
            relationship: pick(["Mother","Father","Guardian","Grandparent"]),
            phone: `(${randInt(200,999)}) ${randInt(100,999)}-${String(randInt(1000,9999))}`,
            isAuthorizedPickup: true,
          }],
          isActive: true,
          createdAt: now - randInt(30, 365) * DAY,
        });
        childIds.push(cid);
      }
      // Check-ins for recent Sundays
      for (let week = 0; week < 8; week++) {
        const sunday = now - week * 7 * DAY;
        const checkedIn = [...childIds].sort(() => Math.random() - 0.5).slice(0, randInt(25, 45));
        for (const cid of checkedIn) {
          const checkedOut = Math.random() < 0.9;
          await ctx.db.insert("childCheckins", {
            churchId,
            childId: cid,
            roomId: pick(roomIds),
            securityCode: `FC-${String(randInt(1000,9999))}`,
            checkedInAt: sunday + 9 * 3600000 + randInt(0, 30) * 60000,
            checkedOutAt: checkedOut ? sunday + 12 * 3600000 + randInt(0, 30) * 60000 : undefined,
            checkedInBy: pick(members)._id,
            checkedOutBy: checkedOut ? pick(members)._id : undefined,
            guardianName: pick(members).displayName,
            stickerPrinted: true,
            allergyAlertShown: Math.random() < 0.2,
            status: checkedOut ? "checked_out" : "checked_in",
          });
        }
      }
    }

    // Teen Posts (40+)
    const existingTP = await ctx.db.query("teenPosts").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingTP.length < 20) {
      const teenContents = [
        "Youth group was fire tonight! Can't wait for camp this summer!",
        "Just finished memorizing Psalm 23. Who wants to do a challenge?",
        "Shoutout to our youth pastor for always keeping it real with us!",
        "Does anyone want to start a prayer group before school?",
        "The basketball game against First Baptist was so close! We'll get them next time!",
        "Who's coming to the lock-in Friday night? It's gonna be epic!",
        "Just got accepted to college! God is so faithful!",
        "Worship night was amazing. That new song hit different.",
        "Started reading through Proverbs this month. Day 15 and going strong!",
        "Community service day was so rewarding. We painted the whole community center!",
        "Any other teens doing the Daniel Fast this month?",
        "Movie night suggestion: The Chosen Season 4! Who's in?",
        "Prayer request: My friend is going through a tough time at home.",
        "Just got my driver's license! Praise God!",
        "Youth choir practice was amazing today. Christmas concert is going to be lit!",
      ];
      const teenCats: Array<"discussion" | "prayer" | "event" | "devotion" | "fun"> = ["discussion","prayer","event","devotion","fun"];
      for (let i = 0; i < 40; i++) {
        await ctx.db.insert("teenPosts", {
          churchId,
          authorId: pick(members)._id,
          content: pick(teenContents),
          category: pick(teenCats),
          likeCount: randInt(3, 45),
          commentCount: randInt(0, 15),
          isActive: true,
          postedAt: now - randInt(0, 90) * DAY,
        });
      }
    }

    // Job Postings (15)
    const existingJP = await ctx.db.query("jobPostings").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingJP.length < 5) {
      const jobs = [
        { title: "Youth Pastor", type: "full_time", dept: "Youth Ministry", sal: "$45,000 - $60,000" },
        { title: "Worship Leader", type: "part_time", dept: "Worship Arts", sal: "$25,000 - $35,000" },
        { title: "Administrative Assistant", type: "full_time", dept: "Church Office", sal: "$32,000 - $40,000" },
        { title: "Children's Ministry Director", type: "full_time", dept: "Children's Ministry", sal: "$38,000 - $50,000" },
        { title: "Custodian", type: "part_time", dept: "Facilities", sal: "$15-18/hr" },
        { title: "Sound Engineer", type: "part_time", dept: "Tech Ministry", sal: "$20-25/hr" },
        { title: "Social Media Coordinator", type: "part_time", dept: "Communications", sal: "$18-22/hr" },
        { title: "Nursery Attendant", type: "part_time", dept: "Nursery", sal: "$14-16/hr" },
        { title: "Outreach Coordinator", type: "full_time", dept: "Missions", sal: "$35,000 - $45,000" },
        { title: "Bookkeeper", type: "part_time", dept: "Finance", sal: "$20-28/hr" },
        { title: "Van Driver", type: "part_time", dept: "Transportation", sal: "$15-18/hr" },
        { title: "Graphic Designer", type: "contract", dept: "Communications", sal: "$25-40/hr" },
        { title: "IT Support Specialist", type: "part_time", dept: "Technology", sal: "$22-30/hr" },
        { title: "Food Service Coordinator", type: "part_time", dept: "Kitchen Ministry", sal: "$16-20/hr" },
        { title: "Associate Pastor", type: "full_time", dept: "Pastoral", sal: "$55,000 - $75,000" },
      ];
      for (const j of jobs) {
        await ctx.db.insert("jobPostings", {
          churchId,
          title: j.title,
          description: `We are seeking a dedicated ${j.title} to join our growing church family. This ${j.type.replace("_", " ")} position is in our ${j.dept} department.`,
          department: j.dept,
          type: j.type as any,
          salaryRange: j.sal,
          requirements: ["Active church member preferred","Background check required","Heart for ministry"],
          isActive: Math.random() > 0.15,
          postedBy: pick(members)._id,
          postedAt: now - randInt(0, 90) * DAY,
        });
      }
    }

    // Volunteer Needs (12)
    const existingVN = await ctx.db.query("volunteerNeeds").withIndex("by_churchId", (q: any) => q.eq("churchId", churchId)).collect();
    if (existingVN.length < 5) {
      const needs = [
        { title: "Sunday Greeters", slots: 8, desc: "Welcome visitors with a warm smile every Sunday morning." },
        { title: "Food Pantry Helpers", slots: 12, desc: "Sort and distribute food donations on Saturdays." },
        { title: "VBS Teachers", slots: 20, desc: "Lead engaging Bible lessons for kids during Vacation Bible School." },
        { title: "Choir Members", slots: 15, desc: "Join our choir for Sunday services and special events." },
        { title: "Tech Team Operators", slots: 5, desc: "Run sound, lights, and livestream during services." },
        { title: "Nursery Helpers", slots: 6, desc: "Care for infants and toddlers during worship services." },
        { title: "Parking Lot Attendants", slots: 8, desc: "Direct traffic and assist members on Sunday mornings." },
        { title: "Event Setup Crew", slots: 10, desc: "Help set up and tear down for church events." },
        { title: "Youth Mentors", slots: 8, desc: "Be a positive role model for teens in our youth program." },
        { title: "Kitchen Ministry Team", slots: 10, desc: "Prepare meals for church fellowship dinners." },
        { title: "Hospital Visitation Team", slots: 6, desc: "Visit and pray with sick members in hospitals." },
        { title: "Transportation Drivers", slots: 4, desc: "Drive the church van to pick up members for services." },
      ];
      for (const n of needs) {
        await ctx.db.insert("volunteerNeeds", {
          churchId,
          title: n.title,
          description: n.desc,
          urgency: pick(["low","medium","high"] as const),
          spotsAvailable: n.slots,
          spotsFilled: randInt(0, n.slots),
          isActive: true,
          contactId: pick(members)._id,
          postedAt: now - randInt(0, 60) * DAY,
        });
      }
    }

    return null;
  },
});
