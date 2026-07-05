import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPosts = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("teenPosts")
      .withIndex("by_churchId", (q) => q.eq("churchId", args.churchId))
      .order("desc")
      .take(50);
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { ...post, authorName: author?.displayName ?? "Teen Member" };
      })
    );
    return postsWithAuthors;
  },
});

export const createPost = mutation({
  args: {
    churchId: v.id("churches"),
    authorId: v.id("members"),
    content: v.string(),
    category: v.union(
      v.literal("discussion"),
      v.literal("prayer"),
      v.literal("event"),
      v.literal("devotion"),
      v.literal("fun"),
    ),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("teenPosts", {
      churchId: args.churchId,
      authorId: args.authorId,
      content: args.content,
      category: args.category,
      imageUrl: args.imageUrl,
      likeCount: 0,
      commentCount: 0,
      isActive: true,
      postedAt: Date.now(),
    });
  },
});

export const getChatMessages = query({
  args: { churchId: v.id("churches"), roomName: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("teenMessages")
      .withIndex("by_church_room", (q) =>
        q.eq("churchId", args.churchId).eq("roomName", args.roomName)
      )
      .order("desc")
      .take(100);
    const withSenders = await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return { ...msg, senderName: sender?.displayName ?? "Teen" };
      })
    );
    return withSenders.reverse();
  },
});

export const sendMessage = mutation({
  args: {
    churchId: v.id("churches"),
    senderId: v.id("members"),
    roomName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("teenMessages", {
      churchId: args.churchId,
      senderId: args.senderId,
      roomName: args.roomName,
      content: args.content,
      sentAt: Date.now(),
    });
  },
});
