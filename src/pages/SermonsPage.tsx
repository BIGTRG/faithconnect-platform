import { useQuery, useMutation } from "convex/react";
import { BookOpen, Plus, Play, Eye, Clock, Trash2, Search } from "lucide-react";
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

export function SermonsPage() {
  const sermons = useQuery(api.sermons.list, {});
  const createSermon = useMutation(api.sermons.create);
  const incrementView = useMutation(api.sermons.incrementView);
  const removeSermon = useMutation(api.sermons.remove);
  const member = useQuery(api.members.getCurrentMember);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [scripture, setScripture] = useState("");
  const [series, setSeries] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !speaker.trim() || !date) return;
    await createSermon({
      title: title.trim(), speaker: speaker.trim(), date,
      description: description.trim() || undefined, videoUrl: videoUrl.trim() || undefined,
      scripture: scripture.trim() || undefined, series: series.trim() || undefined,
    });
    toast.success("Sermon added!");
    setOpen(false);
    setTitle(""); setSpeaker(""); setDate(""); setDescription(""); setVideoUrl(""); setScripture(""); setSeries("");
  };

  const handleWatch = async (sermon: any) => {
    await incrementView({ sermonId: sermon._id });
    if (sermon.videoUrl) {
      window.open(sermon.videoUrl, "_blank");
    }
  };

  const filtered = sermons?.filter((s: any) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.speaker.toLowerCase().includes(search.toLowerCase()) ||
    (s.series ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (s.scripture ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Group by series
  const seriesMap: Record<string, any[]> = {};
  const noSeries: any[] = [];
  for (const s of filtered ?? []) {
    if (s.series) {
      if (!seriesMap[s.series]) seriesMap[s.series] = [];
      seriesMap[s.series].push(s);
    } else {
      noSeries.push(s);
    }
  }

  const renderSermon = (s: any) => (
    <Card key={s._id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center bg-primary/10 rounded-xl size-14 shrink-0">
            <BookOpen className="size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.speaker}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {s.scripture && <Badge variant="secondary" className="text-[10px]">{s.scripture}</Badge>}
              {s.series && <Badge variant="outline" className="text-[10px]">{s.series}</Badge>}
            </div>
            {s.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span className="flex items-center gap-1"><Eye className="size-3" />{s.viewCount} views</span>
              {s.duration && <span className="flex items-center gap-1"><Clock className="size-3" />{Math.floor(s.duration / 60)}m</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {s.videoUrl && (
              <Button size="sm" onClick={() => handleWatch(s)}>
                <Play className="size-4 mr-1" /> Watch
              </Button>
            )}
            {member && (member.role === "admin" || member.role === "pastor") && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeSermon({ id: s._id })}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="size-6" /> Sermons
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Watch, listen, and grow</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search sermons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          {member && (member.role === "admin" || member.role === "pastor") && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Add</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Sermon</DialogTitle><DialogDescription>Upload a sermon to the library.</DialogDescription></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sermon title" /></div>
                  <div><Label>Speaker</Label><Input value={speaker} onChange={(e) => setSpeaker(e.target.value)} placeholder="Pastor name" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                    <div><Label>Scripture</Label><Input value={scripture} onChange={(e) => setScripture(e.target.value)} placeholder="John 3:16" /></div>
                  </div>
                  <div><Label>Series</Label><Input value={series} onChange={(e) => setSeries(e.target.value)} placeholder="Optional series name" /></div>
                  <div><Label>Video URL</Label><Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." /></div>
                  <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." /></div>
                  <Button onClick={handleCreate} className="w-full" disabled={!title.trim() || !speaker.trim() || !date}>Add Sermon</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {Object.entries(seriesMap).map(([seriesName, sermonsList]) => (
        <div key={seriesName} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Series: {seriesName}</h2>
          {sermonsList.map(renderSermon)}
        </div>
      ))}

      {noSeries.length > 0 && (
        <div className="space-y-3">
          {Object.keys(seriesMap).length > 0 && <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Individual Sermons</h2>}
          {noSeries.map(renderSermon)}
        </div>
      )}

      {filtered?.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="size-12 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground mt-2">{search ? "No sermons match your search." : "No sermons yet."}</p>
        </div>
      )}
    </div>
  );
}
