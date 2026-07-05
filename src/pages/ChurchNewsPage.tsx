import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ExternalLink,
  Newspaper,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "local", label: "Local Church", icon: "🏠" },
  { value: "national", label: "National", icon: "🇺🇸" },
  { value: "global", label: "Global", icon: "🌍" },
  { value: "ministry", label: "Ministry", icon: "⛪" },
  { value: "missions", label: "Missions", icon: "✈️" },
  { value: "culture", label: "Culture & Faith", icon: "📖" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ChurchNewsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const news = useQuery(api.churchNews.list, filter === "all" ? {} : { category: filter });
  const create = useMutation(api.churchNews.create);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    sourceUrl: "",
    sourceName: "",
    category: "local" as CategoryValue,
    isBreaking: false,
  });

  async function handleCreate() {
    if (!form.title.trim() || !form.summary.trim()) return;
    await create({
      title: form.title,
      summary: form.summary,
      content: form.content || undefined,
      sourceUrl: form.sourceUrl || undefined,
      sourceName: form.sourceName || undefined,
      category: form.category,
      isBreaking: form.isBreaking,
    });
    setForm({ title: "", summary: "", content: "", sourceUrl: "", sourceName: "", category: "local", isBreaking: false });
    setOpen(false);
    toast.success("News story published");
  }

  const breaking = (news ?? []).filter((n) => n.isBreaking);
  const regular = (news ?? []).filter((n) => !n.isBreaking);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Church News Live</h1>
          <p className="text-muted-foreground mt-1">What is happening across the faith community</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> Post News</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Post News Story</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Headline</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Breaking: ..." /></div>
              <div><Label>Summary</Label><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Brief summary..." rows={2} /></div>
              <div><Label>Full Story (optional)</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Full article..." rows={4} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as CategoryValue })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Source Name</Label><Input value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} placeholder="CNN, AP, etc." /></div>
              </div>
              <div><Label>Source URL (optional)</Label><Input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://..." /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isBreaking} onChange={(e) => setForm({ ...form, isBreaking: e.target.checked })} className="rounded" />
                Mark as Breaking News
              </label>
              <Button onClick={handleCreate} className="w-full">Publish Story</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
        {CATEGORIES.map((c) => (
          <Button key={c.value} variant={filter === c.value ? "default" : "outline"} size="sm" onClick={() => setFilter(c.value)}>
            {c.icon} {c.label}
          </Button>
        ))}
      </div>

      {breaking.length > 0 && (
        <div className="mb-6 space-y-3">
          {breaking.map((item) => (
            <Card key={item._id} className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Breaking</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(item.publishedAt)}</span>
                    </div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground mt-1">{item.summary}</p>
                    {item.sourceUrl && (
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline">
                        {item.sourceName ?? "Read More"} <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {regular.length === 0 && breaking.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Newspaper className="size-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No News Yet</h3>
            <p className="text-muted-foreground">Post the first news story for your church community.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {regular.map((item) => {
            const cat = CATEGORIES.find((c) => c.value === item.category);
            return (
              <Card key={item._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>{cat?.icon} {cat?.label}</span>
                    <span>·</span>
                    <span>{timeAgo(item.publishedAt)}</span>
                    {item.sourceName && <><span>·</span><span>{item.sourceName}</span></>}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.summary}</p>
                  {item.content && <p className="mt-3 text-sm">{item.content}</p>}
                  {item.sourceUrl && (
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary mt-3 hover:underline">
                      Read Full Story <ExternalLink className="size-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
