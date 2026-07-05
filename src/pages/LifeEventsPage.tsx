import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  CalendarHeart,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const EVENT_TYPES = [
  { value: "death", label: "Passing", icon: "🕊️", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  { value: "birth", label: "New Baby", icon: "👶", color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
  { value: "marriage", label: "Marriage", icon: "💍", color: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
  { value: "baptism", label: "Baptism", icon: "💧", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { value: "graduation", label: "Graduation", icon: "🎓", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { value: "hospital", label: "Hospitalization", icon: "🏥", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { value: "anniversary", label: "Anniversary", icon: "🎉", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { value: "other", label: "Other", icon: "📌", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
] as const;

type EventType = (typeof EVENT_TYPES)[number]["value"];

export function LifeEventsPage() {
  const [tab, setTab] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const events = useQuery(api.lifeEvents.list, tab === "all" ? {} : { type: tab });
  const createEvent = useMutation(api.lifeEvents.create);

  const [form, setForm] = useState({
    type: "birth" as EventType,
    title: "",
    description: "",
    personName: "",
    eventDate: new Date().toISOString().split("T")[0],
    isPublic: true,
  });

  async function handleCreate() {
    if (!form.title || !form.personName) return;
    await createEvent({
      type: form.type,
      title: form.title,
      description: form.description || undefined,
      personName: form.personName,
      eventDate: new Date(form.eventDate).getTime(),
      isPublic: form.isPublic,
    });
    setForm({ type: "birth", title: "", description: "", personName: "", eventDate: new Date().toISOString().split("T")[0], isPublic: true });
    setCreateOpen(false);
    toast.success("Life event shared with the congregation");
  }

  const getTypeInfo = (type: string) => EVENT_TYPES.find((t) => t.value === type) ?? EVENT_TYPES[7];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Life Events</h1>
            <p className="text-muted-foreground">Celebrating and supporting our church family</p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> Share Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Share a Life Event</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Event Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as EventType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Person's Name</Label><Input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} placeholder="Who is this about?" /></div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Welcome Baby Grace!" /></div>
              <div><Label>Details (optional)</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div><Label>Date</Label><Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="rounded" />
                Share with entire congregation
              </label>
              <Button onClick={handleCreate} className="w-full">Share Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          {EVENT_TYPES.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              <span className="mr-1">{t.icon}</span> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab}>
          {events && events.length > 0 ? (
            <div className="space-y-3">
              {events.map((ev) => {
                const info = getTypeInfo(ev.type);
                return (
                  <Card key={ev._id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${info.color}`}>
                          <span className="text-xl">{info.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{ev.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded ${info.color}`}>{info.label}</span>
                          </div>
                          <p className="text-sm font-medium text-primary mt-0.5">{ev.personName}</p>
                          {ev.description && <p className="text-sm text-muted-foreground mt-1">{ev.description}</p>}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(ev.eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarHeart className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Life Events Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Share births, marriages, passings, baptisms, and other milestones with your church family.
                  Everyone stays connected through life's biggest moments.
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-w-lg mx-auto">
                  {EVENT_TYPES.map((t) => (
                    <div key={t.value} className="text-center">
                      <div className={`size-10 rounded-full flex items-center justify-center mx-auto ${t.color}`}>
                        <span>{t.icon}</span>
                      </div>
                      <p className="text-xs mt-1 text-muted-foreground">{t.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
