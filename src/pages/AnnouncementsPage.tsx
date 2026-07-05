import { useQuery, useMutation } from "convex/react";
import { Newspaper, Plus, Pin, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const categoryOptions = [
  { value: "general", label: "General" },
  { value: "event", label: "Event" },
  { value: "urgent", label: "Urgent" },
  { value: "ministry", label: "Ministry" },
  { value: "youth", label: "Youth" },
  { value: "missions", label: "Missions" },
];

const categoryColors: Record<string, string> = {
  general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  event: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  ministry: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  youth: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  missions: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function AnnouncementsPage() {
  const announcements = useQuery(api.announcements.list);
  const create = useMutation(api.announcements.create);
  const remove = useMutation(api.announcements.remove);
  const togglePin = useMutation(api.announcements.togglePin);
  const member = useQuery(api.members.getCurrentMember);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    await create({ title: title.trim(), content: content.trim(), category: category as any });
    toast.success("Announcement posted!");
    setOpen(false);
    setTitle("");
    setContent("");
  };

  const pinned = announcements?.filter((a: any) => a.isPinned) ?? [];
  const regular = announcements?.filter((a: any) => !a.isPinned) ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Newspaper className="size-6" />
            Church News
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Stay connected with what's happening</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Post Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Announcement</DialogTitle>
              <DialogDescription>Share news with your church community.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" /></div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your announcement..." rows={5} /></div>
              <Button onClick={handleCreate} className="w-full" disabled={!title.trim() || !content.trim()}>Post Announcement</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pinned.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Pin className="size-4" /> Pinned
          </h2>
          {pinned.map((a: any) => (
            <Card key={a._id} className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-[10px] px-1.5 py-0 border-0 ${categoryColors[a.category] ?? ""}`}>{a.category}</Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pinned</Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{a.authorName} -- {formatDate(a.publishedAt)}</p>
                  </div>
                  {member && (member.role === "admin" || member.role === "pastor") && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => togglePin({ id: a._id })}><Pin className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove({ id: a._id })}><Trash2 className="size-4" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {regular.map((a: any) => (
          <Card key={a._id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${categoryColors[a.category] ?? ""}`}>{a.category}</Badge>
                  </div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{a.authorName} -- {formatDate(a.publishedAt)}</p>
                </div>
                {member && (member.role === "admin" || member.role === "pastor") && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => togglePin({ id: a._id })}><Pin className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove({ id: a._id })}><Trash2 className="size-4" /></Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {announcements?.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="size-12 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground mt-2">No announcements yet.</p>
        </div>
      )}
    </div>
  );
}
