import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // ── Church Configuration ──────────────────────────────────
  churches: defineTable({
    name: v.string(),
    slug: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    timezone: v.optional(v.string()),
    description: v.optional(v.string()),
    pastorName: v.optional(v.string()),
    denomination: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    memberCount: v.optional(v.number()),
    serviceSchedule: v.optional(v.string()),
    trgpayMerchantId: v.optional(v.string()),
    stripeConnectId: v.optional(v.string()),
    subscriptionTier: v.optional(v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("growth"),
      v.literal("enterprise"),
    )),
    isActive: v.optional(v.boolean()),
    onboardingComplete: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    featuresEnabled: v.optional(v.array(v.string())),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  // ── Platform Admins (super admins managing all churches) ──
  platformAdmins: defineTable({
    userId: v.id("users"),
    email: v.string(),
    displayName: v.string(),
    role: v.union(v.literal("superadmin"), v.literal("support")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // ── Members (extends auth users) ─────────────────────────
  members: defineTable({
    userId: v.id("users"),
    churchId: v.id("churches"),
    role: v.union(
      v.literal("admin"),
      v.literal("pastor"),
      v.literal("leader"),
      v.literal("member"),
      v.literal("visitor"),
    ),
    displayName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    birthday: v.optional(v.string()),
    anniversary: v.optional(v.string()),
    address: v.optional(v.string()),
    isActive: v.boolean(),
    joinedAt: v.number(),
    lastActiveAt: v.optional(v.number()),
    isNewcomer: v.boolean(),
    newcomerStep: v.optional(v.number()),
    buddyId: v.optional(v.id("members")),
    invitedBy: v.optional(v.id("members")),
    invitedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_churchId", ["churchId"])
    .index("by_church_role", ["churchId", "role"])
    .index("by_church_active", ["churchId", "isActive"]),

  // ── Community Groups ──────────────────────────────────────
  groups: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("ministry"),
      v.literal("bible_study"),
      v.literal("small_group"),
      v.literal("youth"),
      v.literal("outreach"),
      v.literal("worship"),
      v.literal("other"),
    ),
    imageUrl: v.optional(v.string()),
    leaderId: v.optional(v.id("members")),
    isPrivate: v.boolean(),
    maxMembers: v.optional(v.number()),
    meetingSchedule: v.optional(v.string()),
    meetingLocation: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_category", ["churchId", "category"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    memberId: v.id("members"),
    role: v.union(v.literal("leader"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_memberId", ["memberId"])
    .index("by_group_member", ["groupId", "memberId"]),

  // ── Announcements / News ──────────────────────────────────
  announcements: defineTable({
    churchId: v.id("churches"),
    authorId: v.id("members"),
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("event"),
      v.literal("urgent"),
      v.literal("ministry"),
      v.literal("youth"),
      v.literal("missions"),
    ),
    isPinned: v.boolean(),
    imageUrl: v.optional(v.string()),
    publishedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_pinned", ["churchId", "isPinned"]),

  // ── Prayer Network ────────────────────────────────────────
  prayerRequests: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    title: v.string(),
    content: v.string(),
    isAnonymous: v.boolean(),
    isAnswered: v.boolean(),
    answeredNote: v.optional(v.string()),
    answeredAt: v.optional(v.number()),
    prayerCount: v.number(),
    category: v.union(
      v.literal("health"),
      v.literal("family"),
      v.literal("financial"),
      v.literal("spiritual"),
      v.literal("work"),
      v.literal("relationships"),
      v.literal("gratitude"),
      v.literal("other"),
    ),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_answered", ["churchId", "isAnswered"]),

  prayerPartners: defineTable({
    prayerRequestId: v.id("prayerRequests"),
    memberId: v.id("members"),
    prayedAt: v.number(),
  })
    .index("by_prayerRequestId", ["prayerRequestId"])
    .index("by_memberId", ["memberId"]),

  // ── Digital Testimony Wall ────────────────────────────────
  testimonies: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    isApproved: v.boolean(),
    approvedBy: v.optional(v.id("members")),
    approvedAt: v.optional(v.number()),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_approved", ["churchId", "isApproved"]),

  // ── Sermons & Media ───────────────────────────────────────
  sermons: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    speaker: v.string(),
    date: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    transcript: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    series: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    scripture: v.optional(v.string()),
    duration: v.optional(v.number()),
    viewCount: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_series", ["churchId", "series"])
    .index("by_church_date", ["churchId", "date"]),

  studyGuides: defineTable({
    sermonId: v.id("sermons"),
    content: v.string(),
    questions: v.array(v.string()),
    keyVerses: v.array(v.string()),
    generatedAt: v.number(),
  }).index("by_sermonId", ["sermonId"]),

  // ── Events ────────────────────────────────────────────────
  events: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    location: v.optional(v.string()),
    type: v.union(
      v.literal("service"),
      v.literal("bible_study"),
      v.literal("youth"),
      v.literal("outreach"),
      v.literal("fellowship"),
      v.literal("meeting"),
      v.literal("workshop"),
      v.literal("other"),
    ),
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    maxAttendees: v.optional(v.number()),
    createdBy: v.id("members"),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_type", ["churchId", "type"])
    .index("by_church_start", ["churchId", "startTime"]),

  eventAttendees: defineTable({
    eventId: v.id("events"),
    memberId: v.id("members"),
    status: v.union(v.literal("going"), v.literal("maybe"), v.literal("not_going")),
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.number()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_memberId", ["memberId"]),

  // ── Giving & Financial ────────────────────────────────────
  givingRecords: defineTable({
    churchId: v.id("churches"),
    memberId: v.optional(v.id("members")),
    amount: v.number(),
    type: v.union(
      v.literal("tithe"),
      v.literal("offering"),
      v.literal("mission"),
      v.literal("building"),
      v.literal("benevolence"),
      v.literal("campaign"),
      v.literal("other"),
    ),
    category: v.optional(v.string()),
    paymentMethod: v.union(
      v.literal("trgpay"),
      v.literal("card"),
      v.literal("cash"),
      v.literal("check"),
      v.literal("bank_transfer"),
    ),
    transactionId: v.optional(v.string()),
    campaignId: v.optional(v.id("campaigns")),
    note: v.optional(v.string()),
    date: v.number(),
    isRecurring: v.boolean(),
    recipientMemberId: v.optional(v.id("members")),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_type", ["churchId", "type"])
    .index("by_church_date", ["churchId", "date"]),

  campaigns: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    description: v.optional(v.string()),
    goalAmount: v.number(),
    currentAmount: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("members"),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_active", ["churchId", "isActive"]),

  // ── Check-In & Attendance ─────────────────────────────────
  checkIns: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    eventId: v.optional(v.id("events")),
    method: v.union(v.literal("manual"), v.literal("wifi"), v.literal("qr")),
    checkedInAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_eventId", ["eventId"]),

  // ── Volunteer Tracking ────────────────────────────────────
  volunteerHours: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    activity: v.string(),
    description: v.optional(v.string()),
    hours: v.number(),
    date: v.number(),
    verifiedBy: v.optional(v.id("members")),
    isVerified: v.boolean(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"]),

  // ── Emergency Alerts ──────────────────────────────────────
  emergencyAlerts: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    message: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    sentBy: v.id("members"),
    sentAt: v.number(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_active", ["churchId", "isActive"]),

  // ── Business Directory & Marketplace ──────────────────────
  businessListings: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    businessName: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    adTier: v.union(v.literal("free"), v.literal("basic"), v.literal("premium"), v.literal("featured")),
    isApproved: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_approved", ["churchId", "isApproved"]),

  marketplaceItems: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    title: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isFree: v.boolean(),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    status: v.union(v.literal("available"), v.literal("pending"), v.literal("sold"), v.literal("given")),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_status", ["churchId", "status"]),

  // ── Care & Wellbeing ──────────────────────────────────────
  mealTrains: defineTable({
    churchId: v.id("churches"),
    recipientId: v.id("members"),
    reason: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("members"),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_active", ["churchId", "isActive"]),

  mealSignups: defineTable({
    mealTrainId: v.id("mealTrains"),
    memberId: v.id("members"),
    date: v.number(),
    mealType: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_mealTrainId", ["mealTrainId"])
    .index("by_memberId", ["memberId"]),

  milestones: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    type: v.union(
      v.literal("birthday"),
      v.literal("anniversary"),
      v.literal("baptism"),
      v.literal("membership"),
      v.literal("baby"),
      v.literal("graduation"),
      v.literal("loss"),
      v.literal("other"),
    ),
    date: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"]),

  rideRequests: defineTable({
    churchId: v.id("churches"),
    requesterId: v.id("members"),
    eventId: v.optional(v.id("events")),
    pickupAddress: v.string(),
    seatsNeeded: v.number(),
    notes: v.optional(v.string()),
    driverId: v.optional(v.id("members")),
    status: v.union(v.literal("open"), v.literal("matched"), v.literal("completed"), v.literal("cancelled")),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_status", ["churchId", "status"]),

  skillExchanges: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    skillName: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    isOffering: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"]),

  // ── FaithMatch (Dating) ────────────────────────────────────
  datingProfiles: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    headline: v.optional(v.string()),
    aboutMe: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    ageRange: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    interestedIn: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("everyone"))),
    favoriteVerse: v.optional(v.string()),
    hobbies: v.optional(v.array(v.string())),
    churchInvolvement: v.optional(v.string()),
    photoUrls: v.optional(v.array(v.string())),
    isVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_visible", ["churchId", "isVisible"]),

  datingLikes: defineTable({
    fromProfileId: v.id("datingProfiles"),
    toProfileId: v.id("datingProfiles"),
    isMatch: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_fromProfileId", ["fromProfileId"])
    .index("by_toProfileId", ["toProfileId"])
    .index("by_from_to", ["fromProfileId", "toProfileId"]),

  datingMessages: defineTable({
    matchFromId: v.id("datingProfiles"),
    matchToId: v.id("datingProfiles"),
    senderId: v.id("datingProfiles"),
    content: v.string(),
    sentAt: v.number(),
    isRead: v.boolean(),
  })
    .index("by_matchFromId", ["matchFromId"])
    .index("by_matchToId", ["matchToId"]),

  // ── Social Feed ───────────────────────────────────────────
  socialPosts: defineTable({
    churchId: v.id("churches"),
    authorId: v.id("members"),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    type: v.union(
      v.literal("text"),
      v.literal("photo"),
      v.literal("video"),
      v.literal("event_share"),
      v.literal("testimony"),
      v.literal("prayer_update"),
    ),
    likeCount: v.number(),
    commentCount: v.number(),
    isActive: v.boolean(),
    postedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_authorId", ["authorId"])
    .index("by_church_posted", ["churchId", "postedAt"]),

  socialLikes: defineTable({
    postId: v.id("socialPosts"),
    memberId: v.id("members"),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_memberId", ["memberId"])
    .index("by_post_member", ["postId", "memberId"]),

  socialComments: defineTable({
    postId: v.id("socialPosts"),
    authorId: v.id("members"),
    content: v.string(),
    postedAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_authorId", ["authorId"]),

  // ── Meet the Pastor ────────────────────────────────────────
  pastorProfiles: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    name: v.string(),
    title: v.optional(v.string()),
    bio: v.string(),
    journey: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    favoriteVerse: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    bookingEnabled: v.boolean(),
    bookingUrl: v.optional(v.string()),
    socialLinks: v.optional(v.array(v.object({
      platform: v.string(),
      url: v.string(),
    }))),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"]),

  // ── Church News Live ──────────────────────────────────────
  churchNews: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    summary: v.string(),
    content: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    category: v.union(
      v.literal("local"),
      v.literal("national"),
      v.literal("global"),
      v.literal("ministry"),
      v.literal("missions"),
      v.literal("culture"),
    ),
    isBreaking: v.boolean(),
    publishedAt: v.number(),
    createdBy: v.optional(v.id("members")),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_category", ["churchId", "category"]),

  // ── Awards & Recognition ──────────────────────────────────
  awards: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    category: v.union(
      v.literal("top_giver"),
      v.literal("top_volunteer"),
      v.literal("top_attendance"),
      v.literal("most_prayers"),
      v.literal("community_hero"),
      v.literal("newcomer_welcome"),
      v.literal("ministry_mvp"),
      v.literal("custom"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    period: v.string(),
    year: v.number(),
    metric: v.optional(v.number()),
    metricLabel: v.optional(v.string()),
    awardedAt: v.number(),
    awardedBy: v.optional(v.id("members")),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_year", ["churchId", "year"]),

  // ── Worship Radio ─────────────────────────────────────────
  worshipTracks: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    artist: v.string(),
    album: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    streamUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    genre: v.optional(v.string()),
    addedBy: v.optional(v.id("members")),
    playCount: v.number(),
    isActive: v.boolean(),
  })
    .index("by_churchId", ["churchId"]),

  songRequests: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    trackTitle: v.string(),
    artistName: v.string(),
    message: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("played"), v.literal("declined")),
    requestedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"]),

  // ── Spiritual Growth Tracker ──────────────────────────────
  growthMilestones: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    type: v.union(
      v.literal("salvation"),
      v.literal("baptism"),
      v.literal("first_group"),
      v.literal("first_volunteer"),
      v.literal("first_tithe"),
      v.literal("read_bible_30"),
      v.literal("prayer_warrior"),
      v.literal("mentorship"),
      v.literal("leader_training"),
      v.literal("missions_trip"),
      v.literal("custom"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    achievedAt: v.number(),
    verifiedBy: v.optional(v.id("members")),
    badgeEmoji: v.optional(v.string()),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_member", ["churchId", "memberId"]),

  accountabilityPairs: defineTable({
    churchId: v.id("churches"),
    member1Id: v.id("members"),
    member2Id: v.id("members"),
    goalDescription: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_member1", ["member1Id"])
    .index("by_member2", ["member2Id"]),

  // ── Grief & Crisis Support ────────────────────────────────
  supportRooms: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("grief"),
      v.literal("addiction"),
      v.literal("divorce"),
      v.literal("anxiety"),
      v.literal("parenting"),
      v.literal("financial_stress"),
      v.literal("general"),
    ),
    isAnonymous: v.boolean(),
    moderatorId: v.optional(v.id("members")),
    isActive: v.boolean(),
    memberCount: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_category", ["churchId", "category"]),

  supportMessages: defineTable({
    roomId: v.id("supportRooms"),
    memberId: v.optional(v.id("members")),
    displayName: v.string(),
    content: v.string(),
    isAnonymous: v.boolean(),
    postedAt: v.number(),
  })
    .index("by_roomId", ["roomId"]),

  crisisResources: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    type: v.union(v.literal("hotline"), v.literal("counselor"), v.literal("program"), v.literal("website")),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_churchId", ["churchId"]),

  // ── Digital Certificates ──────────────────────────────────
  certificates: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    type: v.union(
      v.literal("baptism"),
      v.literal("membership"),
      v.literal("bible_study"),
      v.literal("volunteer_milestone"),
      v.literal("leadership"),
      v.literal("missions"),
      v.literal("custom"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    issuedAt: v.number(),
    issuedBy: v.optional(v.id("members")),
    certificateNumber: v.string(),
    metadata: v.optional(v.string()),
    isShared: v.boolean(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_type", ["churchId", "type"]),

  // ── Sermon Quote Cards (AI Summarizer) ────────────────────
  sermonQuoteCards: defineTable({
    sermonId: v.id("sermons"),
    quote: v.string(),
    speaker: v.string(),
    scripture: v.optional(v.string()),
    theme: v.optional(v.string()),
    generatedAt: v.number(),
  })
    .index("by_sermonId", ["sermonId"]),

  // ── Expert Q&A Marketplace ─────────────────────────────────
  expertCategories: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    pricePerQuestion: v.number(),
    isFree: v.boolean(),
    expertName: v.optional(v.string()),
    expertTitle: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_active", ["churchId", "isActive"]),

  expertQuestions: defineTable({
    churchId: v.id("churches"),
    categoryId: v.id("expertCategories"),
    askerId: v.id("members"),
    question: v.string(),
    answer: v.optional(v.string()),
    answeredBy: v.optional(v.id("members")),
    answeredAt: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("answered"), v.literal("closed")),
    isPaid: v.boolean(),
    amountPaid: v.optional(v.number()),
    transactionId: v.optional(v.string()),
    askedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_categoryId", ["categoryId"])
    .index("by_askerId", ["askerId"])
    .index("by_church_status", ["churchId", "status"]),

  // ── I Need Help / Local Resources ─────────────────────────
  helpResources: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    category: v.union(
      v.literal("food"),
      v.literal("shelter"),
      v.literal("clothing"),
      v.literal("medical"),
      v.literal("legal"),
      v.literal("financial"),
      v.literal("childcare"),
      v.literal("transportation"),
      v.literal("education"),
      v.literal("employment"),
      v.literal("mental_health"),
      v.literal("other"),
    ),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(v.string()),
    eligibility: v.optional(v.string()),
    isFree: v.boolean(),
    isChurchSponsored: v.boolean(),
    addedBy: v.optional(v.id("members")),
    isActive: v.boolean(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_category", ["churchId", "category"]),

  helpRequests: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    category: v.string(),
    description: v.string(),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    isAnonymous: v.boolean(),
    assignedTo: v.optional(v.id("members")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_status", ["churchId", "status"]),

  // ── Crisis Team Management (One Care Crisis Network) ──────
  crisisTeams: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    description: v.optional(v.string()),
    leaderId: v.optional(v.id("members")),
    managementPartner: v.optional(v.string()), // e.g. "One Care Crisis Network"
    partnerPhone: v.optional(v.string()),
    partnerEmail: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"]),

  crisisTeamMembers: defineTable({
    teamId: v.id("crisisTeams"),
    memberId: v.id("members"),
    role: v.union(v.literal("leader"), v.literal("coordinator"), v.literal("volunteer"), v.literal("counselor")),
    specialization: v.optional(v.string()),
    isOnCall: v.boolean(),
    pairedWith: v.optional(v.id("crisisTeamMembers")), // volunteer pair
    joinedAt: v.number(),
  })
    .index("by_teamId", ["teamId"])
    .index("by_memberId", ["memberId"]),

  crisisIncidents: defineTable({
    churchId: v.id("churches"),
    teamId: v.id("crisisTeams"),
    reportedBy: v.id("members"),
    title: v.string(),
    description: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    status: v.union(v.literal("reported"), v.literal("assigned"), v.literal("dispatched"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    assignedTo: v.optional(v.id("members")),
    dispatchedPair: v.optional(v.array(v.id("crisisTeamMembers"))), // pair dispatched
    dispatchLocation: v.optional(v.union(v.literal("hospital"), v.literal("church"), v.literal("home"), v.literal("other"))),
    dispatchAddress: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    reportedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_teamId", ["teamId"])
    .index("by_church_status", ["churchId", "status"]),

  // ── Life Events & Alerts ──────────────────────────────────
  lifeEvents: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    type: v.union(
      v.literal("death"),
      v.literal("birth"),
      v.literal("marriage"),
      v.literal("baptism"),
      v.literal("graduation"),
      v.literal("hospital"),
      v.literal("anniversary"),
      v.literal("other"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    personName: v.string(),
    eventDate: v.number(),
    imageUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    createdBy: v.id("members"),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_type", ["churchId", "type"])
    .index("by_church_date", ["churchId", "eventDate"]),

  // ── One-on-One Therapy ─────────────────────────────────────
  therapists: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    title: v.string(),
    specialty: v.union(
      v.literal("general"),
      v.literal("marriage"),
      v.literal("grief"),
      v.literal("addiction"),
      v.literal("youth"),
      v.literal("trauma"),
      v.literal("anxiety"),
      v.literal("depression"),
      v.literal("family"),
    ),
    bio: v.string(),
    imageUrl: v.optional(v.string()),
    credentials: v.array(v.string()),
    isFaithBased: v.boolean(),
    sessionRate: v.number(),
    isFree: v.boolean(),
    availability: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    videoLink: v.optional(v.string()),
    isActive: v.boolean(),
    rating: v.optional(v.number()),
    totalSessions: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_specialty", ["churchId", "specialty"])
    .index("by_church_active", ["churchId", "isActive"]),

  therapySessions: defineTable({
    churchId: v.id("churches"),
    therapistId: v.id("therapists"),
    memberId: v.id("members"),
    scheduledAt: v.number(),
    duration: v.number(),
    type: v.union(v.literal("video"), v.literal("phone"), v.literal("in_person")),
    status: v.union(
      v.literal("requested"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    notes: v.optional(v.string()),
    isAnonymous: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_therapistId", ["therapistId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_status", ["churchId", "status"]),

  // ── Mental & Behavioral Health ────────────────────────────
  mentalHealthResources: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("anxiety"),
      v.literal("depression"),
      v.literal("grief"),
      v.literal("addiction"),
      v.literal("ptsd"),
      v.literal("eating_disorder"),
      v.literal("adhd"),
      v.literal("bipolar"),
      v.literal("ocd"),
      v.literal("anger"),
      v.literal("self_harm"),
      v.literal("general"),
    ),
    type: v.union(
      v.literal("article"),
      v.literal("video"),
      v.literal("hotline"),
      v.literal("app"),
      v.literal("workbook"),
      v.literal("support_group"),
    ),
    url: v.optional(v.string()),
    phone: v.optional(v.string()),
    isFree: v.boolean(),
    isFaithBased: v.boolean(),
    createdBy: v.optional(v.id("members")),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_category", ["churchId", "category"])
    .index("by_church_type", ["churchId", "type"]),

  selfAssessments: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    type: v.union(
      v.literal("anxiety"),
      v.literal("depression"),
      v.literal("stress"),
      v.literal("burnout"),
      v.literal("grief"),
      v.literal("relationship"),
    ),
    score: v.number(),
    severity: v.union(v.literal("low"), v.literal("moderate"), v.literal("high"), v.literal("severe")),
    responses: v.optional(v.array(v.number())),
    recommendations: v.optional(v.array(v.string())),
    takenAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_church_type", ["churchId", "type"]),

  // ── Medical Directory ─────────────────────────────────────
  medicalProviders: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    practice: v.optional(v.string()),
    specialty: v.union(
      v.literal("primary_care"),
      v.literal("dentist"),
      v.literal("pediatrics"),
      v.literal("obgyn"),
      v.literal("cardiology"),
      v.literal("dermatology"),
      v.literal("orthopedics"),
      v.literal("optometry"),
      v.literal("psychiatry"),
      v.literal("physical_therapy"),
      v.literal("chiropractic"),
      v.literal("pharmacy"),
      v.literal("urgent_care"),
      v.literal("telehealth"),
      v.literal("other"),
    ),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    acceptsInsurance: v.boolean(),
    insuranceList: v.optional(v.array(v.string())),
    isFaithAligned: v.boolean(),
    isChurchMember: v.boolean(),
    offersTelemedicine: v.boolean(),
    rating: v.optional(v.number()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    hours: v.optional(v.string()),
    addedBy: v.optional(v.id("members")),
    isVerified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_specialty", ["churchId", "specialty"])
    .index("by_church_verified", ["churchId", "isVerified"]),

  // ── Church Store ───────────────────────────────────────────
  storeProducts: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("apparel"),
      v.literal("accessories"),
      v.literal("books"),
      v.literal("media"),
      v.literal("supplies"),
      v.literal("food"),
      v.literal("art"),
      v.literal("gifts"),
      v.literal("other"),
    ),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    inventory: v.optional(v.number()),
    isDigital: v.boolean(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    tags: v.optional(v.array(v.string())),
    addedBy: v.optional(v.id("members")),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_category", ["churchId", "category"])
    .index("by_church_featured", ["churchId", "isFeatured"])
    .index("by_church_active", ["churchId", "isActive"]),

  storeOrders: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    items: v.array(
      v.object({
        productId: v.id("storeProducts"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    total: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    shippingAddress: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_status", ["churchId", "status"]),

  // ── AI Book Library ───────────────────────────────────────
  bookLibrary: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    author: v.string(),
    description: v.string(),
    coverImageUrl: v.optional(v.string()),
    category: v.union(
      v.literal("devotional"),
      v.literal("theology"),
      v.literal("marriage"),
      v.literal("parenting"),
      v.literal("leadership"),
      v.literal("youth"),
      v.literal("prayer"),
      v.literal("healing"),
      v.literal("finance"),
      v.literal("missions"),
      v.literal("testimony"),
      v.literal("study_guide"),
    ),
    price: v.number(),
    pageCount: v.optional(v.number()),
    isAiGenerated: v.boolean(),
    isFeatured: v.boolean(),
    isPublished: v.boolean(),
    downloadUrl: v.optional(v.string()),
    sampleUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
    totalSales: v.optional(v.number()),
    denomination: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    generatedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_category", ["churchId", "category"])
    .index("by_church_featured", ["churchId", "isFeatured"])
    .index("by_church_published", ["churchId", "isPublished"]),

  bookPurchases: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    bookId: v.id("bookLibrary"),
    price: v.number(),
    purchasedAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_bookId", ["bookId"]),

  // ── AI Concierge ──────────────────────────────────────────
  aiConversations: defineTable({
    memberId: v.id("members"),
    churchId: v.id("churches"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        timestamp: v.number(),
      }),
    ),
    title: v.optional(v.string()),
    lastMessageAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_churchId", ["churchId"]),

  // ── Daily Devotionals ─────────────────────────────────────
  devotionals: defineTable({
    churchId: v.id("churches"),
    memberId: v.optional(v.id("members")),
    date: v.string(),
    title: v.string(),
    content: v.string(),
    verse: v.string(),
    verseText: v.optional(v.string()),
    isPersonalized: v.boolean(),
    generatedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_date", ["churchId", "date"]),

  // ── Welcome & Member Onboarding ───────────────────────────
  welcomeVideos: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    type: v.union(
      v.literal("welcome"),
      v.literal("pastor_greeting"),
      v.literal("campus_tour"),
      v.literal("ministry_intro"),
    ),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"]),

  memberOnboardingProgress: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    step: v.number(),
    stepsCompleted: v.array(v.string()),
    welcomeVideoWatched: v.boolean(),
    metKeyLeaders: v.boolean(),
    calendarReviewed: v.boolean(),
    groupJoined: v.boolean(),
    firstGift: v.boolean(),
    profileComplete: v.boolean(),
    completedAt: v.optional(v.number()),
    startedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_member", ["churchId", "memberId"]),

  // ── Bible & Verse of the Day ──────────────────────────────
  dailyVerses: defineTable({
    churchId: v.id("churches"),
    date: v.string(),
    reference: v.string(),
    text: v.string(),
    translation: v.string(),
    theme: v.optional(v.string()),
    reflection: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_date", ["churchId", "date"]),

  bibleReadingPlans: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    description: v.optional(v.string()),
    totalDays: v.number(),
    readings: v.array(v.object({
      day: v.number(),
      reference: v.string(),
      title: v.optional(v.string()),
    })),
    isActive: v.boolean(),
    createdBy: v.optional(v.id("members")),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"]),

  bibleReadingProgress: defineTable({
    memberId: v.id("members"),
    planId: v.id("bibleReadingPlans"),
    currentDay: v.number(),
    completedDays: v.array(v.number()),
    startedAt: v.number(),
    lastReadAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_planId", ["planId"]),

  // ── Teen Ministry ─────────────────────────────────────────
  teenPosts: defineTable({
    churchId: v.id("churches"),
    authorId: v.id("members"),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    category: v.union(
      v.literal("discussion"),
      v.literal("prayer"),
      v.literal("event"),
      v.literal("devotion"),
      v.literal("fun"),
    ),
    likeCount: v.number(),
    commentCount: v.number(),
    isActive: v.boolean(),
    postedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_authorId", ["authorId"]),

  teenMessages: defineTable({
    churchId: v.id("churches"),
    senderId: v.id("members"),
    roomName: v.string(),
    content: v.string(),
    sentAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_room", ["churchId", "roomName"]),

  // ── Children's Check-in (KidCheck-style) ──────────────────
  childProfiles: defineTable({
    churchId: v.id("churches"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.optional(v.string()),
    age: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    photoUrl: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalNotes: v.optional(v.string()),
    specialNeeds: v.optional(v.string()),
    guardians: v.array(v.object({
      name: v.string(),
      relationship: v.string(),
      phone: v.string(),
      isAuthorizedPickup: v.boolean(),
    })),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    })),
    parentMemberId: v.optional(v.id("members")),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_parentMemberId", ["parentMemberId"]),

  checkinRooms: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    ageRange: v.optional(v.string()),
    capacity: v.optional(v.number()),
    currentCount: v.number(),
    leaderId: v.optional(v.id("members")),
    isActive: v.boolean(),
  })
    .index("by_churchId", ["churchId"]),

  childCheckins: defineTable({
    churchId: v.id("churches"),
    childId: v.id("childProfiles"),
    roomId: v.id("checkinRooms"),
    securityCode: v.string(),
    checkedInAt: v.number(),
    checkedOutAt: v.optional(v.number()),
    checkedInBy: v.id("members"),
    checkedOutBy: v.optional(v.id("members")),
    guardianName: v.string(),
    stickerPrinted: v.boolean(),
    allergyAlertShown: v.boolean(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("checked_in"), v.literal("checked_out")),
  })
    .index("by_churchId", ["churchId"])
    .index("by_childId", ["childId"])
    .index("by_roomId", ["roomId"])
    .index("by_church_status", ["churchId", "status"]),

  // ── Job Board & Volunteer Needs ───────────────────────────
  jobPostings: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    description: v.string(),
    department: v.optional(v.string()),
    type: v.union(v.literal("full_time"), v.literal("part_time"), v.literal("contract"), v.literal("intern")),
    location: v.optional(v.string()),
    salaryRange: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    contactEmail: v.optional(v.string()),
    isActive: v.boolean(),
    postedBy: v.id("members"),
    postedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_active", ["churchId", "isActive"]),

  volunteerNeeds: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    description: v.string(),
    ministry: v.optional(v.string()),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    spotsAvailable: v.number(),
    spotsFilled: v.number(),
    schedule: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    contactId: v.optional(v.id("members")),
    isActive: v.boolean(),
    postedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_active", ["churchId", "isActive"]),

  // ── Recurring Giving Schedules ────────────────────────────
  recurringSchedules: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    type: v.union(
      v.literal("tithe"),
      v.literal("offering"),
      v.literal("mission"),
      v.literal("building"),
      v.literal("benevolence"),
      v.literal("other"),
    ),
    amount: v.number(),
    frequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
    ),
    paymentMethod: v.union(
      v.literal("trgpay"),
      v.literal("card"),
      v.literal("bank_transfer"),
    ),
    nextDate: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    isActive: v.boolean(),
    totalGiven: v.number(),
    lastProcessedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_active", ["churchId", "isActive"]),

  // ── Event Registrations ───────────────────────────────────
  eventRegistrations: defineTable({
    eventId: v.id("events"),
    memberId: v.id("members"),
    guestCount: v.optional(v.number()),
    dietaryNeeds: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(v.literal("registered"), v.literal("waitlisted"), v.literal("cancelled")),
    registeredAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_memberId", ["memberId"]),

  // ── Notifications ─────────────────────────────────────────
  notifications: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    title: v.string(),
    body: v.string(),
    type: v.union(
      v.literal("event_reminder"),
      v.literal("announcement"),
      v.literal("prayer_update"),
      v.literal("giving_receipt"),
      v.literal("group_message"),
      v.literal("life_event"),
      v.literal("crisis_alert"),
      v.literal("welcome"),
      v.literal("general"),
    ),
    linkTo: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_church_member", ["churchId", "memberId"])
    .index("by_member_read", ["memberId", "isRead"]),

  notificationPreferences: defineTable({
    memberId: v.id("members"),
    eventReminders: v.boolean(),
    announcements: v.boolean(),
    prayerUpdates: v.boolean(),
    givingReceipts: v.boolean(),
    groupMessages: v.boolean(),
    lifeEvents: v.boolean(),
    crisisAlerts: v.boolean(),
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
  })
    .index("by_memberId", ["memberId"]),

  // ── Virtual Meetings ──────────────────────────────────────
  virtualMeetings: defineTable({
    churchId: v.id("churches"),
    title: v.string(),
    description: v.optional(v.string()),
    meetingUrl: v.string(),
    platform: v.union(
      v.literal("zoom"),
      v.literal("google_meet"),
      v.literal("teams"),
      v.literal("facebook_live"),
      v.literal("youtube_live"),
      v.literal("custom"),
    ),
    hostId: v.optional(v.id("members")),
    eventId: v.optional(v.id("events")),
    scheduledAt: v.number(),
    duration: v.optional(v.number()),
    isRecurring: v.boolean(),
    isLive: v.boolean(),
    attendeeCount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_eventId", ["eventId"]),
  // ── Audit Logs ───────────────────────────────────────────────
  auditLogs: defineTable({
    churchId: v.id("churches"),
    memberId: v.id("members"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_memberId", ["memberId"])
    .index("by_church_action", ["churchId", "action"]),

  // ── Rate Limits (for sensitive operations) ─────────────────
  rateLimits: defineTable({
    memberId: v.id("members"),
    action: v.string(),
    count: v.number(),
    windowStart: v.number(),
  })
    .index("by_member_action", ["memberId", "action"]),

  // ── Stripe Connect Onboarding ─────────────────────────────
  stripeOnboardingStatus: defineTable({
    churchId: v.id("churches"),
    status: v.union(
      v.literal("not_started"),
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("active"),
      v.literal("restricted"),
    ),
    stripeAccountId: v.optional(v.string()),
    businessType: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    bankLast4: v.optional(v.string()),
    bankName: v.optional(v.string()),
    payoutsEnabled: v.optional(v.boolean()),
    paymentsEnabled: v.optional(v.boolean()),
    currentStep: v.optional(v.number()),
    completedSteps: v.optional(v.array(v.string())),
    submittedAt: v.optional(v.number()),
    activatedAt: v.optional(v.number()),
    revenueShareBookPercent: v.optional(v.number()),
    revenueShareStorePercent: v.optional(v.number()),
    revenueShareMarketplacePercent: v.optional(v.number()),
    monthlyVolume: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_status", ["status"]),

  // ── Error Tracking & Platform Health ──────────────────────
  errorLogs: defineTable({
    churchId: v.optional(v.id("churches")),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical"),
    ),
    source: v.string(),
    message: v.string(),
    stackTrace: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    metadata: v.optional(v.string()),
    resolved: v.optional(v.boolean()),
    resolvedBy: v.optional(v.id("members")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_severity", ["severity"])
    .index("by_created", ["createdAt"]),

  // ── Compliance Checks ─────────────────────────────────────
  complianceChecks: defineTable({
    churchId: v.id("churches"),
    category: v.string(),
    checkName: v.string(),
    status: v.union(
      v.literal("passed"),
      v.literal("failed"),
      v.literal("warning"),
      v.literal("not_applicable"),
    ),
    description: v.string(),
    recommendation: v.optional(v.string()),
    lastChecked: v.number(),
    checkedBy: v.optional(v.string()),
  })
    .index("by_churchId", ["churchId"])
    .index("by_category", ["category"]),

  // ── Analytics Snapshots ───────────────────────────────────
  analyticsSnapshots: defineTable({
    churchId: v.id("churches"),
    period: v.string(),
    date: v.number(),
    memberCount: v.number(),
    activeMembers: v.number(),
    newMembers: v.number(),
    totalGiving: v.number(),
    averageAttendance: v.number(),
    eventCount: v.number(),
    groupEngagement: v.number(),
    prayerRequests: v.number(),
    newTestimonies: v.number(),
    storeRevenue: v.number(),
    marketplaceRevenue: v.number(),
    bookRevenue: v.number(),
  })
    .index("by_churchId", ["churchId"])
    .index("by_church_date", ["churchId", "date"]),
});

export default schema;
