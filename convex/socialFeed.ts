import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) return [];

    const posts = await ctx.db
      .query("socialPosts")
      .withIndex("by_churchId", (q) => q.eq("churchId", member.churchId))
      .order("desc")
      .take(50);

    const withDetails = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const myLike = await ctx.db
          .query("socialLikes")
          .withIndex("by_post_member", (q) =>
            q.eq("postId", post._id).eq("memberId", member._id),
          )
          .first();

        // Get latest 3 comments
        const comments = await ctx.db
          .query("socialComments")
          .withIndex("by_postId", (q) => q.eq("postId", post._id))
          .order("desc")
          .take(3);

        const commentsWithAuthors = await Promise.all(
          comments.map(async (c) => {
            const a = await ctx.db.get(c.authorId);
            return { ...c, authorName: a?.displayName ?? "Unknown" };
          }),
        );

        // Get shared event details if applicable
        let sharedEvent = null;
        if (post.eventId) {
          sharedEvent = await ctx.db.get(post.eventId);
        }

        return {
          ...post,
          authorName: author?.displayName ?? "Unknown",
          authorAvatar: author?.avatarUrl,
          hasLiked: !!myLike,
          comments: commentsWithAuthors.reverse(),
          sharedEvent,
          currentMemberId: member._id,
        };
      }),
    );

    return withDetails;
  },
});

export const create = mutation({
  args: {
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
  },
  returns: v.id("socialPosts"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("socialPosts", {
      churchId: member.churchId,
      authorId: member._id,
      content: args.content,
      imageUrl: args.imageUrl,
      videoUrl: args.videoUrl,
      eventId: args.eventId,
      type: args.type,
      likeCount: 0,
      commentCount: 0,
      isActive: true,
      postedAt: Date.now(),
    });
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("socialPosts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    const existing = await ctx.db
      .query("socialLikes")
      .withIndex("by_post_member", (q) =>
        q.eq("postId", args.postId).eq("memberId", member._id),
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, { likeCount: Math.max(0, post.likeCount - 1) });
    } else {
      await ctx.db.insert("socialLikes", {
        postId: args.postId,
        memberId: member._id,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.postId, { likeCount: post.likeCount + 1 });
    }

    return null;
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("socialPosts"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    await ctx.db.insert("socialComments", {
      postId: args.postId,
      authorId: member._id,
      content: args.content,
      postedAt: Date.now(),
    });

    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, { commentCount: post.commentCount + 1 });
    }

    return null;
  },
});

export const remove = mutation({
  args: { postId: v.id("socialPosts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.postId, { isActive: false });
    return null;
  },
});
