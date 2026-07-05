import { useQuery, useMutation } from "convex/react";
import { HandHeart, Plus, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TestimoniesPage() {
  const approved = useQuery(api.testimonies.list);
  const pending = useQuery(api.testimonies.listPending);
  const createTestimony = useMutation(api.testimonies.create);
  const approveTestimony = useMutation(api.testimonies.approve);
  const removeTestimony = useMutation(api.testimonies.remove);
  const member = useQuery(api.members.getCurrentMember);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  const isAdmin = member && (member.role === "admin" || member.role === "pastor");

  const handleCreate = async () => {
    if (!content.trim()) return;
    await createTestimony({ content: content.trim() });
    toast.success("Testimony submitted for review!");
    setOpen(false);
    setContent("");
  };

  const handleApprove = async (id: any) => {
    await approveTestimony({ id });
    toast.success("Testimony approved!");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <HandHeart className="size-6 text-amber-500" /> Testimonies
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            "Let the redeemed of the Lord tell their story" — Psalm 107:2
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Share Testimony</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Testimony</DialogTitle>
              <DialogDescription>Tell the community how God has been working in your life. Testimonies are reviewed before being published.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Your Testimony</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share what God has done in your life..." rows={6} />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!content.trim()}>Submit Testimony</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">Published ({approved?.length ?? 0})</TabsTrigger>
          {isAdmin && <TabsTrigger value="pending">Pending Review ({pending?.length ?? 0})</TabsTrigger>}
        </TabsList>

        <TabsContent value="published" className="space-y-4 mt-4">
          {approved?.map((t: any) => (
            <Card key={t._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                    <HandHeart className="size-5 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.content}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <span className="font-medium">{t.memberName}</span>
                      <span>--</span>
                      <span>{timeAgo(t._creationTime)}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="size-8 text-destructive shrink-0" onClick={() => removeTestimony({ id: t._id })}>
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {approved?.length === 0 && (
            <div className="text-center py-12">
              <HandHeart className="size-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No testimonies yet. Be the first to share!</p>
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="pending" className="space-y-4 mt-4">
            {pending?.map((t: any) => (
              <Card key={t._id} className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-5">
                  <Badge variant="secondary" className="text-[10px] mb-2">Pending Review</Badge>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">{t.memberName} -- {timeAgo(t._creationTime)}</span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(t._id)}>
                        <Check className="size-4 mr-1" /> Approve
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeTestimony({ id: t._id })}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pending?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No pending testimonies.</p>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
