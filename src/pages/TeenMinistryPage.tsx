import { useQuery } from "convex/react";
import {
  Hash,
  Heart,
  MessageCircle,
  Music,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const categoryColors: Record<string, string> = {
  discussion: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  prayer: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  event: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  devotion: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  fun: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export function TeenMinistryPage() {
  const member = useCurrentMember();
  const posts = useQuery(
    api.teenMinistry.getPosts,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const chatMessages = useQuery(
    api.teenMinistry.getChatMessages,
    member?.churchId ? { churchId: member.churchId, roomName: "general" } : "skip"
  );
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="size-6" />
            Teen Ministry
          </h1>
          <p className="text-white/80">Your space to connect, grow, and have fun in faith</p>
        </div>
        <Star className="absolute right-6 top-4 size-20 text-white/10" />
        <Music className="absolute right-24 bottom-2 size-14 text-white/10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="feed">
            <Sparkles className="size-4 mr-1" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="size-4 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <Hash className="size-4 mr-1" />
            Rooms
          </TabsTrigger>
        </TabsList>

        {/* Teen Feed */}
        <TabsContent value="feed" className="space-y-4">
          {(posts ?? []).map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 text-sm font-medium">
                      {post.authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {post.authorName}
                      </span>
                      <Badge
                        className={`text-xs ${categoryColors[post.category] ?? ""}`}
                        variant="secondary"
                      >
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(post.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-muted-foreground">
                      <button className="flex items-center gap-1 text-xs hover:text-red-500 transition-colors">
                        <Heart className="size-4" />
                        {post.likeCount}
                      </button>
                      <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
                        <MessageCircle className="size-4" />
                        {post.commentCount}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!posts || posts.length === 0) && (
            <Card className="p-8 text-center text-muted-foreground">
              No teen posts yet. Be the first to share!
            </Card>
          )}
        </TabsContent>

        {/* Chat */}
        <TabsContent value="chat">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="size-4" />
                general
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {(chatMessages ?? []).map((msg) => (
                  <div key={msg._id} className="flex items-start gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                        {msg.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {msg.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {(!chatMessages || chatMessages.length === 0) && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the conversation!
                  </p>
                )}
              </div>
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                  />
                  <Button size="sm">Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Rooms */}
        <TabsContent value="rooms" className="space-y-3">
          {[
            { name: "general", desc: "Main teen chat", members: 24, icon: Hash },
            { name: "prayer-wall", desc: "Share prayer requests", members: 18, icon: Heart },
            { name: "bible-study", desc: "Discuss weekly studies", members: 15, icon: Sparkles },
            { name: "hangout", desc: "Just vibes", members: 21, icon: Users },
          ].map((room) => (
            <Card
              key={room.name}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <room.icon className="size-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">#{room.name}</p>
                  <p className="text-sm text-muted-foreground">{room.desc}</p>
                </div>
                <Badge variant="outline">{room.members} members</Badge>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
