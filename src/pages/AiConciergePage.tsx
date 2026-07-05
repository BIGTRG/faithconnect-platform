import { useQuery, useMutation, useAction } from "convex/react";
import { MessageCircle, Plus, Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Id } from "../../convex/_generated/dataModel";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function AiConciergePage() {
  const conversations = useQuery(api.aiConcierge.listConversations);
  const createConversation = useMutation(api.aiConcierge.createConversation);
  const chat = useAction(api.aiConcierge.chat);
  const generateDevotional = useAction(api.aiConcierge.generateDevotional);

  const [activeConv, setActiveConv] = useState<Id<"aiConversations"> | null>(null);
  const activeConvData = useQuery(
    api.aiConcierge.getConversation,
    activeConv ? { conversationId: activeConv } : "skip",
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [devotional, setDevotional] = useState<string | null>(null);
  const [devLoading, setDevLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvData?.messages]);

  const handleNewConversation = async () => {
    const id = await createConversation({});
    setActiveConv(id);
  };

  const handleSend = async () => {
    if (!message.trim() || !activeConv || loading) return;
    const msg = message.trim();
    setMessage("");
    setLoading(true);
    try {
      await chat({ conversationId: activeConv, message: msg });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDevotional = async () => {
    setDevLoading(true);
    try {
      const result = await generateDevotional({});
      setDevotional(result);
    } catch (e) {
      console.error(e);
    }
    setDevLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "What does the Bible say about anxiety?",
    "Explain the meaning of communion",
    "How can I pray more effectively?",
    "What are the fruits of the Spirit?",
    "Help me understand the Trinity",
    "Give me a verse for encouragement today",
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircle className="size-6" /> AI Church Concierge
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your personal faith companion -- ask anything
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDevotional} disabled={devLoading}>
            {devLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
            Daily Devotional
          </Button>
          <Button onClick={handleNewConversation}>
            <Plus className="size-4 mr-2" /> New Chat
          </Button>
        </div>
      </div>

      {/* Devotional Modal */}
      {devotional && (
        <Card className="mb-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="size-5 text-amber-500" /> Today's Devotional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{devotional}</div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setDevotional(null)}>
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Conversation List */}
        <div className="hidden md:flex flex-col w-64 shrink-0 border rounded-xl overflow-hidden bg-card">
          <div className="p-3 border-b bg-muted/50">
            <p className="text-sm font-semibold">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations?.map((c: any) => (
              <button
                key={c._id}
                onClick={() => setActiveConv(c._id)}
                className={`w-full text-left p-3 border-b hover:bg-accent transition-colors ${
                  activeConv === c._id ? "bg-accent" : ""
                }`}
              >
                <p className="text-sm font-medium truncate">{c.title || "New conversation"}</p>
                <p className="text-xs text-muted-foreground">
                  {c.messages?.length ?? 0} messages
                </p>
              </button>
            ))}
            {conversations?.length === 0 && (
              <p className="text-xs text-muted-foreground text-center p-4">
                Start a new conversation
              </p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-card">
          {activeConv && activeConvData ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConvData.messages?.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <MessageCircle className="size-16 text-primary/20 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">How can I help today?</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Ask me about Scripture, church life, spiritual guidance, or anything on your mind.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
                      {suggestions.map((s) => (
                        <Button
                          key={s}
                          variant="outline"
                          size="sm"
                          className="text-xs text-left h-auto py-2 px-3"
                          onClick={() => {
                            setMessage(s);
                          }}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {activeConvData.messages?.map((m: any, i: number) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {m.timestamp ? formatTime(m.timestamp) : ""}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button onClick={handleSend} disabled={!message.trim() || loading} size="icon">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="size-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI Church Concierge</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-md">
                Your AI-powered faith companion. Ask questions about Scripture, get spiritual guidance, or explore church programs.
              </p>
              <Button onClick={handleNewConversation}>
                <Plus className="size-4 mr-2" /> Start New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
