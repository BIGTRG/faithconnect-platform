import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  HeartHandshake,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Shield,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ROOM_CATEGORIES = [
  { value: "grief", label: "Grief & Loss", emoji: "💔" },
  { value: "addiction", label: "Addiction Recovery", emoji: "🔗" },
  { value: "divorce", label: "Divorce & Separation", emoji: "💍" },
  { value: "anxiety", label: "Anxiety & Depression", emoji: "🧠" },
  { value: "parenting", label: "Parenting Challenges", emoji: "👶" },
  { value: "financial_stress", label: "Financial Stress", emoji: "💰" },
  { value: "general", label: "General Support", emoji: "🤝" },
] as const;

type RoomCategory = (typeof ROOM_CATEGORIES)[number]["value"];

export function SupportPage() {
  const rooms = useQuery(api.support.listRooms);
  const resources = useQuery(api.support.listResources);
  const createRoom = useMutation(api.support.createRoom);
  const sendMessage = useMutation(api.support.sendMessage);

  const [activeRoom, setActiveRoom] = useState<Id<"supportRooms"> | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [roomForm, setRoomForm] = useState({ name: "", description: "", category: "general" as RoomCategory, isAnonymous: true });

  const messages = useQuery(
    api.support.listMessages,
    activeRoom ? { roomId: activeRoom } : "skip",
  );
  const activeRoomData = rooms?.find((r) => r._id === activeRoom);

  async function handleCreateRoom() {
    if (!roomForm.name) return;
    await createRoom({
      name: roomForm.name,
      description: roomForm.description || undefined,
      category: roomForm.category,
      isAnonymous: roomForm.isAnonymous,
    });
    setRoomForm({ name: "", description: "", category: "general", isAnonymous: true });
    setCreateOpen(false);
    toast.success("Support room created");
  }

  async function handleSend() {
    if (!msg.trim() || !activeRoom) return;
    await sendMessage({ roomId: activeRoom, content: msg.trim(), isAnonymous: isAnon });
    setMsg("");
  }

  if (activeRoom && activeRoomData) {
    const catMeta = ROOM_CATEGORIES.find((c) => c.value === activeRoomData.category);
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => setActiveRoom(null)} className="mb-4">
          <ArrowLeft className="size-4 mr-2" /> Back to Rooms
        </Button>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{catMeta?.emoji}</span>
          <div>
            <h2 className="text-xl font-bold">{activeRoomData.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {activeRoomData.isAnonymous && <><Shield className="size-3" /> Anonymous Room</>}
            </div>
          </div>
        </div>

        <div className="border rounded-lg mb-4 min-h-[300px] max-h-[500px] overflow-y-auto p-4 space-y-3 bg-muted/30">
          {(!messages || messages.length === 0) ? (
            <p className="text-center text-muted-foreground py-8">No messages yet. Share what is on your heart.</p>
          ) : (
            [...messages].reverse().map((m) => (
              <div key={m._id} className="p-3 bg-background rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{m.displayName}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.postedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm">{m.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <label className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} className="rounded" />
            Anonymous
          </label>
          <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message..." onKeyDown={(e) => e.key === "Enter" && handleSend()} />
          <Button onClick={handleSend}><Send className="size-4" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <HeartHandshake className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Grief &amp; Crisis Support</h1>
      </div>
      <p className="text-muted-foreground mb-6">You are not alone. Find support, share anonymously, get help.</p>

      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Phone className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Crisis Hotline: 988 Suicide &amp; Crisis Lifeline</p>
              <p className="text-sm text-muted-foreground">Call or text <strong>988</strong> available 24/7</p>
            </div>
            <a href="tel:988" className="ml-auto">
              <Button variant="outline" size="sm"><Phone className="size-4 mr-1" /> Call Now</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Support Rooms</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> Create Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Support Room</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Room Name</Label><Input value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} placeholder="e.g. Grief Support Circle" /></div>
              <div><Label>Description</Label><Textarea value={roomForm.description} onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} placeholder="What this room is about..." rows={2} /></div>
              <div><Label>Category</Label>
                <Select value={roomForm.category} onValueChange={(v) => setRoomForm({ ...roomForm, category: v as RoomCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROOM_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={roomForm.isAnonymous} onChange={(e) => setRoomForm({ ...roomForm, isAnonymous: e.target.checked })} className="rounded" />
                Allow anonymous messages
              </label>
              <Button onClick={handleCreateRoom} className="w-full">Create Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(!rooms || rooms.length === 0) ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {ROOM_CATEGORIES.map((cat) => (
            <Card key={cat.value} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setCreateOpen(true)}>
              <CardContent className="py-6 text-center">
                <span className="text-3xl">{cat.emoji}</span>
                <p className="font-medium mt-2">{cat.label}</p>
                <p className="text-xs text-muted-foreground mt-1">Start a support room</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 mb-8">
          {rooms.filter(r => r.isActive).map((room) => {
            const catMeta = ROOM_CATEGORIES.find((c) => c.value === room.category);
            return (
              <Card key={room._id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveRoom(room._id)}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{catMeta?.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{room.name}</h3>
                      {room.description && <p className="text-sm text-muted-foreground mt-0.5">{room.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {room.isAnonymous && <span className="flex items-center gap-1"><Shield className="size-3" /> Anonymous</span>}
                        <span>{room.memberCount} members</span>
                      </div>
                    </div>
                    <MessageCircle className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Crisis Resources</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Phone className="size-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">988 Suicide &amp; Crisis Lifeline</p>
                <p className="text-sm text-muted-foreground">Call or text 988, 24/7</p>
                <a href="tel:988" className="text-sm text-primary hover:underline mt-1 inline-block">Call Now</a>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="size-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-semibold">Crisis Text Line</p>
                <p className="text-sm text-muted-foreground">Text HOME to 741741</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Heart className="size-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-semibold">GriefShare</p>
                <p className="text-sm text-muted-foreground">Grief recovery support group</p>
                <a href="https://www.griefshare.org" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-flex items-center gap-1">
                  Visit <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <HeartHandshake className="size-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold">Celebrate Recovery</p>
                <p className="text-sm text-muted-foreground">Christ-centered recovery program</p>
                <a href="https://www.celebraterecovery.com" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-flex items-center gap-1">
                  Visit <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        {(resources ?? []).map((res) => (
          <Card key={res._id}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">{res.name}</p>
                  {res.description && <p className="text-sm text-muted-foreground">{res.description}</p>}
                  {res.phone && <a href={`tel:${res.phone}`} className="text-sm text-primary hover:underline block mt-1">{res.phone}</a>}
                  {res.url && <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-flex items-center gap-1">Visit <ExternalLink className="size-3" /></a>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
