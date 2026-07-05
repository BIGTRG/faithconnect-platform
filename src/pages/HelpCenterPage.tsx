import { useMutation, useQuery } from "convex/react";
import {
  ExternalLink,
  HandHelping,
  Heart,
  MapPin,
  Phone,
  Plus,
  Search,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const HELP_CATEGORIES = [
  { value: "food", label: "Food Assistance", icon: "🍽️" },
  { value: "shelter", label: "Shelter & Housing", icon: "🏠" },
  { value: "clothing", label: "Clothing", icon: "👕" },
  { value: "medical", label: "Medical Care", icon: "🏥" },
  { value: "legal", label: "Legal Aid", icon: "⚖️" },
  { value: "financial", label: "Financial Help", icon: "💵" },
  { value: "childcare", label: "Childcare", icon: "👶" },
  { value: "transportation", label: "Transportation", icon: "🚗" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "employment", label: "Job Search", icon: "💼" },
  { value: "mental_health", label: "Mental Health", icon: "🧠" },
  { value: "other", label: "Other Help", icon: "🤝" },
] as const;

type HelpCategory = (typeof HELP_CATEGORIES)[number]["value"];

export function HelpCenterPage() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const resources = useQuery(api.helpCenter.listResources, filter === "all" ? {} : { category: filter });
  const submitRequest = useMutation(api.helpCenter.submitRequest);
  const addResource = useMutation(api.helpCenter.addResource);

  const [resForm, setResForm] = useState({ name: "", category: "food" as HelpCategory, description: "", address: "", phone: "", website: "", hours: "", isFree: true, isChurchSponsored: false });
  const [reqForm, setReqForm] = useState({ category: "food", description: "", urgency: "medium" as "low" | "medium" | "high" | "critical", isAnonymous: false });

  const filtered = (resources ?? []).filter((r) => r.isActive && (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase())));

  async function handleAddResource() {
    if (!resForm.name) return;
    await addResource({
      name: resForm.name,
      category: resForm.category,
      description: resForm.description || undefined,
      address: resForm.address || undefined,
      phone: resForm.phone || undefined,
      website: resForm.website || undefined,
      hours: resForm.hours || undefined,
      isFree: resForm.isFree,
      isChurchSponsored: resForm.isChurchSponsored,
    });
    setResForm({ name: "", category: "food", description: "", address: "", phone: "", website: "", hours: "", isFree: true, isChurchSponsored: false });
    setAddOpen(false);
    toast.success("Resource added");
  }

  async function handleSubmitRequest() {
    if (!reqForm.description) return;
    await submitRequest(reqForm);
    setReqForm({ category: "food", description: "", urgency: "medium", isAnonymous: false });
    setReqOpen(false);
    toast.success("Help request submitted. Your church will reach out.");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <HandHelping className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">I Need Help</h1>
      </div>
      <p className="text-muted-foreground mb-6">Free resources and assistance for members in need</p>

      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Heart className="size-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">Need immediate help?</p>
              <p className="text-sm text-muted-foreground">Submit a request below and your church family will step in.</p>
            </div>
            <Dialog open={reqOpen} onOpenChange={setReqOpen}>
              <DialogTrigger asChild>
                <Button>Request Help</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request Help</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>What do you need help with?</Label>
                    <Select value={reqForm.category} onValueChange={(v) => setReqForm({ ...reqForm, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{HELP_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Describe your situation</Label><Textarea value={reqForm.description} onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })} placeholder="Tell us how we can help..." rows={3} /></div>
                  <div><Label>Urgency</Label>
                    <Select value={reqForm.urgency} onValueChange={(v) => setReqForm({ ...reqForm, urgency: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - When you get a chance</SelectItem>
                        <SelectItem value="medium">Medium - This week</SelectItem>
                        <SelectItem value="high">High - Today</SelectItem>
                        <SelectItem value="critical">Critical - Right now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={reqForm.isAnonymous} onChange={(e) => setReqForm({ ...reqForm, isAnonymous: e.target.checked })} className="rounded" />
                    Submit anonymously
                  </label>
                  <Button onClick={handleSubmitRequest} className="w-full">Submit Request</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="pl-9" />
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Plus className="size-4 mr-2" /> Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Community Resource</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Resource Name</Label><Input value={resForm.name} onChange={(e) => setResForm({ ...resForm, name: e.target.value })} placeholder="e.g. Local Food Bank" /></div>
              <div><Label>Category</Label>
                <Select value={resForm.category} onValueChange={(v) => setResForm({ ...resForm, category: v as HelpCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{HELP_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={resForm.description} onChange={(e) => setResForm({ ...resForm, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Address</Label><Input value={resForm.address} onChange={(e) => setResForm({ ...resForm, address: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={resForm.phone} onChange={(e) => setResForm({ ...resForm, phone: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Website</Label><Input value={resForm.website} onChange={(e) => setResForm({ ...resForm, website: e.target.value })} /></div>
                <div><Label>Hours</Label><Input value={resForm.hours} onChange={(e) => setResForm({ ...resForm, hours: e.target.value })} placeholder="Mon-Fri 9-5" /></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={resForm.isFree} onChange={(e) => setResForm({ ...resForm, isFree: e.target.checked })} className="rounded" /> Free resource</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={resForm.isChurchSponsored} onChange={(e) => setResForm({ ...resForm, isChurchSponsored: e.target.checked })} className="rounded" /> Church sponsored</label>
              </div>
              <Button onClick={handleAddResource} className="w-full">Add Resource</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
        {HELP_CATEGORIES.slice(0, 8).map((c) => (
          <Button key={c.value} variant={filter === c.value ? "default" : "outline"} size="sm" onClick={() => setFilter(c.value)}>
            {c.icon} {c.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <HandHelping className="size-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Resources Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your church can add local food banks, shelters, legal aid, medical clinics, and other
              community resources here to help members find what they need.
            </p>
            <div className="grid gap-3 sm:grid-cols-4 mt-8 max-w-xl mx-auto">
              {HELP_CATEGORIES.slice(0, 4).map((c) => (
                <div key={c.value} className="p-3 bg-muted/50 rounded-lg text-center">
                  <span className="text-2xl">{c.icon}</span>
                  <p className="text-xs font-medium mt-1">{c.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((res) => {
            const cat = HELP_CATEGORIES.find((c) => c.value === res.category);
            return (
              <Card key={res._id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cat?.icon ?? "🤝"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{res.name}</h3>
                        {res.isFree && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Free</span>}
                        {res.isChurchSponsored && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Church</span>}
                      </div>
                      {res.description && <p className="text-sm text-muted-foreground mt-1">{res.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {res.address && <span className="flex items-center gap-1"><MapPin className="size-3" /> {res.address}</span>}
                        {res.phone && <a href={`tel:${res.phone}`} className="flex items-center gap-1 text-primary"><Phone className="size-3" /> {res.phone}</a>}
                        {res.website && <a href={res.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary"><ExternalLink className="size-3" /> Website</a>}
                      </div>
                      {res.hours && <p className="text-xs text-muted-foreground mt-1">Hours: {res.hours}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
