import { useQuery, useMutation } from "convex/react";
import {
  Heart,
  MessageCircle,
  Send,
  Image,
  PenSquare,
  ThumbsUp,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const typeLabels: Record<string, { label: string; color: string }> = {
  text: { label: "Post", color: "bg-blue-100 text-blue-700" },
  photo: { label: "Photo", color: "bg-green-100 text-green-700" },
  video: { label: "Video", color: "bg-purple-100 text-purple-700" },
  event_share: { label: "Event", color: "bg-orange-100 text-orange-700" },
  testimony: { label: "Testimony", color: "bg-yellow-100 text-yellow-700" },
  prayer_update: { label: "Prayer", color: "bg-pink-100 text-pink-700" },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function SocialFeedPage() {
  const posts = useQuery(api.socialFeed.list);
  const createPost = useMutation(api.socialFeed.create);
  const toggleLike = useMutation(api.socialFeed.toggleLike);
  const addComment = useMutation(api.socialFeed.addComment);

  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<"text" | "photo" | "testimony" | "prayer_update">("text");
  const [imageUrl, setImageUrl] = useState("");
  const [composing, setComposing] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const handlePost = async () => {
    if (!newPost.trim()) return;
    await createPost({
      content: newPost,
      type: postType,
      imageUrl: imageUrl || undefined,
    });
    setNewPost("");
    setImageUrl("");
    setComposing(false);
  };

  const handleComment = async (postId: any) => {
    if (!commentText.trim()) return;
    await addComment({ postId, content: commentText });
    setCommentText("");
    setCommentingOn(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="size-6 text-primary" />
          FaithFeed
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share, connect, and uplift your church community
        </p>
      </div>

      {/* Composer */}
      <Card>
        <CardContent className="p-4">
          {!composing ? (
            <button
              onClick={() => setComposing(true)}
              className="w-full text-left px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground"
            >
              <PenSquare className="size-4 inline mr-2" />
              What's on your heart today?
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["text", "photo", "testimony", "prayer_update"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPostType(t)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                      postType === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t === "text" && "Post"}
                    {t === "photo" && "Photo"}
                    {t === "testimony" && "Testimony"}
                    {t === "prayer_update" && "Prayer Update"}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder={
                  postType === "testimony"
                    ? "Share what God has done in your life..."
                    : postType === "prayer_update"
                      ? "Share a prayer update..."
                      : "What's on your heart?"
                }
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={3}
                autoFocus
              />
              {(postType === "photo") && (
                <div className="flex items-center gap-2">
                  <Image className="size-4 text-muted-foreground" />
                  <Input
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setComposing(false);
                    setNewPost("");
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handlePost} disabled={!newPost.trim()}>
                  <Send className="size-4 mr-1" /> Post
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {posts?.filter((p: any) => p.isActive).map((post: any) => {
          const tl = typeLabels[post.type] ?? typeLabels.text;
          return (
            <Card key={post._id} className="overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {post.authorName?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{post.authorName}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 border-0 ${tl.color}`}>
                        {tl.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(post.postedAt)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-3">
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="rounded-lg w-full max-h-80 object-cover"
                  />
                )}

                {post.sharedEvent && (
                  <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2">
                    <Calendar className="size-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{post.sharedEvent.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.sharedEvent.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-1 border-t">
                  <button
                    onClick={() => toggleLike({ postId: post._id })}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.hasLiked
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <ThumbsUp className={`size-4 ${post.hasLiked ? "fill-current" : ""}`} />
                    {post.likeCount > 0 ? post.likeCount : "Like"}
                  </button>
                  <button
                    onClick={() =>
                      setCommentingOn(commentingOn === post._id ? null : post._id)
                    }
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="size-4" />
                    {post.commentCount > 0 ? post.commentCount : "Comment"}
                  </button>
                </div>

                {/* Comments */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-2 pl-2 border-l-2 border-muted">
                    {post.comments.map((c: any) => (
                      <div key={c._id} className="text-sm">
                        <span className="font-medium">{c.authorName}</span>{" "}
                        <span className="text-muted-foreground">{c.content}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {timeAgo(c.postedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                {commentingOn === post._id && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(post._id);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post._id)}
                      disabled={!commentText.trim()}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {posts?.length === 0 && (
        <div className="text-center py-12">
          <Heart className="size-12 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground mt-2">
            No posts yet. Be the first to share something with the community!
          </p>
        </div>
      )}
    </div>
  );
}
