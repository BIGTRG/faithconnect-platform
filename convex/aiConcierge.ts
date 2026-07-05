import { v } from "convex/values";
import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

const VIKTOR_API_URL = process.env.VIKTOR_SPACES_API_URL!;
const PROJECT_NAME = process.env.VIKTOR_SPACES_PROJECT_NAME!;
const PROJECT_SECRET = process.env.VIKTOR_SPACES_PROJECT_SECRET!;

async function callTool(role: string, args: Record<string, unknown> = {}): Promise<{ search_response: string }> {
  const response = await fetch(`${VIKTOR_API_URL}/api/viktor-spaces/tools/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_name: PROJECT_NAME,
      project_secret: PROJECT_SECRET,
      role,
      arguments: args,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error ?? "Tool call failed");
  }
  return json.result as { search_response: string };
}

export const listConversations = query({
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

    return await ctx.db
      .query("aiConversations")
      .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
      .order("desc")
      .take(20);
  },
});

export const getConversation = query({
  args: { conversationId: v.id("aiConversations") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const createConversation = mutation({
  args: {},
  returns: v.id("aiConversations"),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!member) throw new Error("Member not found");

    return await ctx.db.insert("aiConversations", {
      memberId: member._id,
      churchId: member.churchId,
      messages: [],
      lastMessageAt: Date.now(),
    });
  },
});

// Internal mutations to avoid circular type references
export const internalAddUserMessage = internalMutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const messages = [
      ...conv.messages,
      { role: "user" as const, content: args.content, timestamp: Date.now() },
    ];

    await ctx.db.patch(args.conversationId, {
      messages,
      lastMessageAt: Date.now(),
      title: conv.title || args.content.slice(0, 50),
    });

    return null;
  },
});

export const internalAddAiResponse = internalMutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const messages = [
      ...conv.messages,
      { role: "assistant" as const, content: args.content, timestamp: Date.now() },
    ];

    await ctx.db.patch(args.conversationId, {
      messages,
      lastMessageAt: Date.now(),
    });

    return null;
  },
});

export const internalGetConversation = internalQuery({
  args: { conversationId: v.id("aiConversations") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const internalGetSermon = internalQuery({
  args: { sermonId: v.id("sermons") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const sermon = await ctx.db.get(args.sermonId);
    if (!sermon) return null;
    const studyGuide = await ctx.db
      .query("studyGuides")
      .withIndex("by_sermonId", (q) => q.eq("sermonId", args.sermonId))
      .first();
    return { ...sermon, studyGuide };
  },
});

// Public mutations (called from frontend)
export const addUserMessage = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const messages = [
      ...conv.messages,
      { role: "user" as const, content: args.content, timestamp: Date.now() },
    ];

    await ctx.db.patch(args.conversationId, {
      messages,
      lastMessageAt: Date.now(),
      title: conv.title || args.content.slice(0, 50),
    });

    return null;
  },
});

export const addAiResponse = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    const messages = [
      ...conv.messages,
      { role: "assistant" as const, content: args.content, timestamp: Date.now() },
    ];

    await ctx.db.patch(args.conversationId, {
      messages,
      lastMessageAt: Date.now(),
    });

    return null;
  },
});

export const chat = action({
  args: {
    conversationId: v.id("aiConversations"),
    message: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    // Save user message
    await ctx.runMutation(internal.aiConcierge.internalAddUserMessage, {
      conversationId: args.conversationId,
      content: args.message,
    });

    // Get conversation context
    const conv: any = await ctx.runQuery(internal.aiConcierge.internalGetConversation, {
      conversationId: args.conversationId,
    });

    const recentMessages: Array<{ role: string; content: string }> = conv?.messages?.slice(-10) ?? [];
    const chatHistory: string = recentMessages
      .map((m: { role: string; content: string }) => `${m.role === "user" ? "Member" : "Concierge"}: ${m.content}`)
      .join("\n");

    const systemPrompt: string = `You are the AI Church Concierge — a warm, knowledgeable, and helpful assistant for a church community. You help members with:
- Answering questions about church services, events, and programs
- Providing spiritual guidance, Bible verse references, and devotional content
- Helping with church operations (directions, service times, group info)
- Offering prayer support and encouragement
- Explaining church traditions, theology, and faith concepts

Be warm, welcoming, and pastoral in tone. Use Scripture references when relevant. Keep responses concise but caring.

Recent conversation:
${chatHistory}

Member's question: ${args.message}`;

    try {
      const result: { search_response: string } = await callTool("quick_ai_search", {
        search_question: systemPrompt,
      });

      const aiResponse: string = result.search_response;

      // Save AI response
      await ctx.runMutation(internal.aiConcierge.internalAddAiResponse, {
        conversationId: args.conversationId,
        content: aiResponse,
      });

      return aiResponse;
    } catch (error) {
      const fallback: string = "I'm here to help! I'm having a moment connecting to my knowledge base, but I'd love to assist you. Could you try asking again in a moment?";
      await ctx.runMutation(internal.aiConcierge.internalAddAiResponse, {
        conversationId: args.conversationId,
        content: fallback,
      });
      return fallback;
    }
  },
});

export const generateStudyGuide = action({
  args: { sermonId: v.id("sermons") },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const sermon: any = await ctx.runQuery(internal.aiConcierge.internalGetSermon, { sermonId: args.sermonId });
    if (!sermon) throw new Error("Sermon not found");

    const prompt: string = `Generate a comprehensive Bible study guide for this sermon:
Title: ${sermon.title}
Speaker: ${sermon.speaker}
Scripture: ${sermon.scripture ?? "Not specified"}
Description: ${sermon.description ?? ""}
${sermon.transcript ? `Transcript excerpt: ${sermon.transcript.slice(0, 2000)}` : ""}

Create:
1. A brief overview/summary (2-3 sentences)
2. 5 discussion questions for small groups
3. 3-5 key Bible verses referenced or related
4. Practical application points
5. A closing prayer prompt

Format it in a clear, readable way.`;

    const result: { search_response: string } = await callTool("quick_ai_search", {
      search_question: prompt,
    });

    return result.search_response;
  },
});

export const generateDevotional = action({
  args: {},
  returns: v.string(),
  handler: async (): Promise<string> => {
    const prompt: string = `Generate a daily devotional for today. Include:
1. A title
2. A key Bible verse (with the full text)
3. A 2-3 paragraph reflection
4. A practical application for today
5. A short prayer

Make it warm, encouraging, and applicable to everyday life. Keep it under 300 words total.`;

    const result: { search_response: string } = await callTool("quick_ai_search", {
      search_question: prompt,
    });

    return result.search_response;
  },
});
