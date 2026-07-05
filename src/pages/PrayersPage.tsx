import { useQuery, useMutation } from "convex/react";
import { Heart, Plus, HandHeart, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "health", label: "Health" },
  { value: "family", label: "Family" },
  { value: "financial", label: "Financial" },
  { value: "spiritual", label: "Spiritual Growth" },
  { value: "work", label: "Work / Career" },
  { value: "relationships", label: "Relationships" },
  { value: "gratitude", label: "Gratitude" },
  { value: "other", label: "Other" },
];

const categoryColors: Record<string, string> = {
  health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  family: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  financial: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  spiritual: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  work: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  relationships: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  gratitude: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function PrayersPage() {
  const activeRequests = useQuery(api.prayers.list, { showAnswered: false });
  const answeredRequests = useQuery(api.prayers.list, { showAnswered: true });
  const createPrayer = useMutation(api.prayers.create);
  const prayFor = useMutation(api.prayers.pray);
  const markAnswered = useMutation(api.prayers.markAnswered);
  const removePrayer = useMutation(api.prayers.remove);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("other");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    await createPrayer({
      title: title.trim(),
      content: content.trim(),
      isAnonymous,
      category: category as any,
    });
    toast.success("Prayer request shared with the community");
    setOpen(false);
    setTitle("");
    setContent("");
    setIsAnonymous(false);
  };

  const handlePray = async (id: any) => {
    await prayFor({ prayerRequestId: id });
    toast.success("Praying with you");
  };

  const renderRequest = (r: any, showAnswered = false) => (
    <Card key={r._id} className={showAnswered ? "opacity-80" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className={`text-[10px] px-1.5 py-0 border-0 ${categoryColors[r.category] ?? ""}`}>
                {categories.find((c) => c.value === r.category)?.label ?? r.category}
              </Badge>
              {r.isAnonymous && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Anonymous</Badge>
              )}
              {r.isAnswered && (
                <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                  Answered
                </Badge>
              )}
            </div>
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{r.content}</p>
            {r.answeredNote && (
              <p className="text-sm text-green-700 dark:text-green-400 mt-2 italic">
                "{r.answeredNote}"
              </p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span>{r.memberName}</span>
              <span>{timeAgo(r._creationTime)}</span>
              <span className="flex items-center gap-1">
                <Heart className="size-3" /> {r.prayerCount} praying
              </span>
            </div>
          </div>
        </div>

        {!showAnswered && (
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePray(r._id)}
              className="flex-1"
            >
              <HandHeart className="size-4 mr-1" />
              I'm Praying
            </Button>
            {r.memberId === r.currentMemberId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAnswered({ id: r._id })}
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePrayer({ id: r._id })}
                  className="text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="size-6 text-rose-500" />
            Prayer Network
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bear one another's burdens
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Share Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share a Prayer Request</DialogTitle>
              <DialogDescription>
                Your church community is here to pray with you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Details</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what's on your heart..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                <Label>Post anonymously</Label>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!title.trim() || !content.trim()}>
                Share Prayer Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeRequests?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="answered">
            Answered ({answeredRequests?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeRequests?.map((r: any) => renderRequest(r))}
          {activeRequests?.length === 0 && (
            <div className="text-center py-12">
              <Heart className="size-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No active prayer requests. Share yours!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="answered" className="space-y-3 mt-4">
          {answeredRequests?.map((r: any) => renderRequest(r, true))}
          {answeredRequests?.length === 0 && (
            <div className="text-center py-12">
              <Check className="size-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No answered prayers yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
