import { useQuery, useMutation } from "convex/react";
import { DollarSign, Plus, TrendingUp, Heart, Target, CreditCard, Send, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const givingTypes = [
  { value: "tithe", label: "Tithe" },
  { value: "offering", label: "Offering" },
  { value: "mission", label: "Missions" },
  { value: "building", label: "Building Fund" },
  { value: "benevolence", label: "Benevolence" },
  { value: "campaign", label: "Campaign" },
  { value: "other", label: "Other" },
];

const paymentMethods = [
  { value: "trgpay", label: "TRGpay" },
  { value: "card", label: "Credit/Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const typeColors: Record<string, string> = {
  tithe: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  offering: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  mission: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  building: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  benevolence: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  campaign: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount / 100);
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function GivingPage() {
  const myStats = useQuery(api.giving.getMyGivingStats);
  const churchStats = useQuery(api.giving.getChurchGivingStats);
  const myGiving = useQuery(api.giving.listMyGiving);
  const campaigns = useQuery(api.giving.listCampaigns);
  const recordGiving = useMutation(api.giving.recordGiving);
  const createCampaign = useMutation(api.giving.createCampaign);
  const member = useQuery(api.members.getCurrentMember);

  const membersList = useQuery(api.giving.listMembers);
  const p2pTransfers = useQuery(api.giving.listMyP2PTransfers);
  const sendToMember = useMutation(api.giving.sendToMember);

  const [giveOpen, setGiveOpen] = useState(false);
  const [campOpen, setCampOpen] = useState(false);
  const [p2pOpen, setP2pOpen] = useState(false);
  const [p2pRecipient, setP2pRecipient] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");
  const [p2pNote, setP2pNote] = useState("");
  const [p2pMethod, setP2pMethod] = useState("trgpay");

  const handleSendToMember = async () => {
    const cents = Math.round(parseFloat(p2pAmount) * 100);
    if (!p2pRecipient || !cents || cents <= 0) return;
    const result = await sendToMember({
      recipientId: p2pRecipient as any,
      amount: cents,
      note: p2pNote.trim() || undefined,
      paymentMethod: p2pMethod as any,
    });
    toast.success(`Sent ${formatCurrency(cents)} to ${result.recipientName}`);
    setP2pOpen(false);
    setP2pRecipient("");
    setP2pAmount("");
    setP2pNote("");
  };
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("tithe");
  const [method, setMethod] = useState("trgpay");
  const [note, setNote] = useState("");

  const [campTitle, setCampTitle] = useState("");
  const [campDesc, setCampDesc] = useState("");
  const [campGoal, setCampGoal] = useState("");

  const quickAmounts = [1000, 2500, 5000, 10000, 25000]; // in cents

  const handleGive = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents <= 0) return;

    if (method === "trgpay") {
      // Open TRGpay checkout in a new window
      const trgpayUrl = `https://trgpay.com/checkout?amount=${cents}&description=${encodeURIComponent(givingTypes.find(t => t.value === type)?.label ?? type)}&merchant=church`;
      window.open(trgpayUrl, "_blank", "width=500,height=700");
    }

    await recordGiving({
      amount: cents, type: type as any, paymentMethod: method as any,
      note: note.trim() || undefined,
    });
    toast.success("Gift recorded! Thank you for your generosity.");
    setGiveOpen(false);
    setAmount(""); setNote("");
  };

  const handleCreateCampaign = async () => {
    const goal = Math.round(parseFloat(campGoal) * 100);
    if (!campTitle.trim() || !goal) return;
    await createCampaign({
      title: campTitle.trim(), description: campDesc.trim() || undefined,
      goalAmount: goal, startDate: Date.now(),
    });
    toast.success("Campaign created!");
    setCampOpen(false);
    setCampTitle(""); setCampDesc(""); setCampGoal("");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="size-6" /> Giving
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            "Each of you should give what you have decided in your heart" — 2 Corinthians 9:7
          </p>
        </div>
        <div className="flex gap-2">
        <Dialog open={p2pOpen} onOpenChange={setP2pOpen}>
          <DialogTrigger asChild><Button variant="outline" size="lg"><Send className="size-4 mr-2" />Send to Member</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send to a Member</DialogTitle>
              <DialogDescription>Send funds directly to a church member in need. Powered by TRGpay P2P.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Recipient</Label>
                <Select value={p2pRecipient} onValueChange={setP2pRecipient}>
                  <SelectTrigger><SelectValue placeholder="Select member..." /></SelectTrigger>
                  <SelectContent>
                    {membersList?.map((m: any) => (
                      <SelectItem key={m._id} value={m._id}>{m.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input type="number" value={p2pAmount} onChange={(e) => setP2pAmount(e.target.value)} placeholder="0.00" className="pl-7 text-xl font-bold h-12" />
                </div>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={p2pMethod} onValueChange={setP2pMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trgpay">TRGpay (P2P)</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Member-to-member transfers via TRGpay / MyCashNow</p>
              </div>
              <div><Label>Note (optional)</Label><Input value={p2pNote} onChange={(e) => setP2pNote(e.target.value)} placeholder="e.g., Helping with groceries" /></div>
              <Button onClick={handleSendToMember} className="w-full h-12" disabled={!p2pRecipient || !p2pAmount || parseFloat(p2pAmount) <= 0}>
                <Send className="size-4 mr-2" /> Send ${p2pAmount || "0.00"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={giveOpen} onOpenChange={setGiveOpen}>
          <DialogTrigger asChild><Button size="lg"><Heart className="size-4 mr-2" />Give Now</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make a Gift</DialogTitle>
              <DialogDescription>Your generosity helps our church community thrive.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="pl-7 text-2xl font-bold h-14" />
                </div>
                <div className="flex gap-2 mt-2">
                  {quickAmounts.map((a) => (
                    <Button key={a} variant="outline" size="sm" className="flex-1" onClick={() => setAmount((a / 100).toString())}>
                      ${a / 100}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{givingTypes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{paymentMethods.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}</SelectContent>
                </Select>
                {method === "trgpay" && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CreditCard className="size-3" /> Powered by TRGpay -- secure payment processing
                  </p>
                )}
              </div>
              <div><Label>Note (optional)</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dedicate your gift..." /></div>
              <Button onClick={handleGive} className="w-full h-12 text-lg" disabled={!amount || parseFloat(amount) <= 0}>
                {method === "trgpay" ? "Give with TRGpay" : `Give $${amount || "0.00"}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {myStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-xl font-bold">{formatCurrency(myStats.monthTotal)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-green-100/80 to-green-50/80 dark:from-green-950/30 dark:to-green-950/10">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">This Year</p>
              <p className="text-xl font-bold">{formatCurrency(myStats.yearTotal)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-amber-100/80 to-amber-50/80 dark:from-amber-950/30 dark:to-amber-950/10">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Lifetime</p>
              <p className="text-xl font-bold">{formatCurrency(myStats.lifetime)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-blue-100/80 to-blue-50/80 dark:from-blue-950/30 dark:to-blue-950/10">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Gifts</p>
              <p className="text-xl font-bold">{myStats.totalGifts}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Church-level stats for admins */}
      {churchStats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="size-5" /> Church Giving Overview
            </CardTitle>
            <CardDescription>Admin view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-muted-foreground">This Month</p><p className="text-lg font-bold">{formatCurrency(churchStats.monthTotal)}</p></div>
              <div><p className="text-muted-foreground">This Year</p><p className="text-lg font-bold">{formatCurrency(churchStats.yearTotal)}</p></div>
              <div><p className="text-muted-foreground">Unique Givers</p><p className="text-lg font-bold">{churchStats.uniqueGivers}</p></div>
              <div><p className="text-muted-foreground">Transactions</p><p className="text-lg font-bold">{churchStats.totalTransactions}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="member2member">Member to Member</TabsTrigger>
          <TabsTrigger value="history">My History</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Campaigns</h2>
            {member && (member.role === "admin" || member.role === "pastor") && (
              <Dialog open={campOpen} onOpenChange={setCampOpen}>
                <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="size-4 mr-1" />New Campaign</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Campaign Name</Label><Input value={campTitle} onChange={(e) => setCampTitle(e.target.value)} placeholder="e.g., Building Fund" /></div>
                    <div><Label>Description</Label><Input value={campDesc} onChange={(e) => setCampDesc(e.target.value)} placeholder="Campaign purpose" /></div>
                    <div><Label>Goal Amount ($)</Label><Input type="number" value={campGoal} onChange={(e) => setCampGoal(e.target.value)} placeholder="10000" /></div>
                    <Button onClick={handleCreateCampaign} className="w-full" disabled={!campTitle.trim() || !campGoal}>Create Campaign</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {campaigns?.map((c: any) => (
            <Card key={c._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Target className="size-5 text-primary" />
                      <h3 className="font-semibold">{c.title}</h3>
                    </div>
                    {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(c.currentAmount)}</p>
                    <p className="text-xs text-muted-foreground">of {formatCurrency(c.goalAmount)}</p>
                  </div>
                </div>
                <Progress value={Math.min((c.currentAmount / c.goalAmount) * 100, 100)} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round((c.currentAmount / c.goalAmount) * 100)}% raised</p>
              </CardContent>
            </Card>
          ))}
          {campaigns?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No active campaigns.</p>
          )}
        </TabsContent>

        <TabsContent value="recurring" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recurring Giving</h3>
            <Button size="sm"><Plus className="size-4 mr-1" />Set Up Recurring</Button>
          </div>
          {[
            { type: "Tithe", amount: 150, freq: "Monthly", next: "Jun 15, 2026", method: "TRGpay", active: true },
            { type: "Offering", amount: 50, freq: "Weekly", next: "Jun 8, 2026", method: "Card", active: true },
            { type: "Missions", amount: 25, freq: "Monthly", next: "Jun 20, 2026", method: "Bank Transfer", active: true },
          ].map((s, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{s.type} - ${s.amount}/{s.freq.toLowerCase()}</p>
                    <p className="text-sm text-muted-foreground">Next: {s.next} via {s.method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Active" : "Paused"}</Badge>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="member2member" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Member-to-Member Transfers</h2>
            <Button variant="outline" size="sm" onClick={() => setP2pOpen(true)}>
              <Send className="size-4 mr-1" />Send Now
            </Button>
          </div>
          <Card className="border-dashed bg-muted/30">
            <CardContent className="p-4 text-center">
              <Send className="size-8 text-primary/60 mx-auto mb-2" />
              <p className="font-medium">Direct Member Support</p>
              <p className="text-sm text-muted-foreground mt-1">
                If a member is in need, you can send funds directly to them through TRGpay P2P. All transfers are recorded and tax-documented.
              </p>
            </CardContent>
          </Card>
          {p2pTransfers?.map((t: any) => (
            <Card key={t._id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {t.direction === "sent" ? (
                    <div className="size-8 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowUpRight className="size-4 text-red-600" />
                    </div>
                  ) : (
                    <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowDownLeft className="size-4 text-green-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {t.direction === "sent" ? "Sent to" : "Received from"} {t.otherPartyName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                  </div>
                </div>
                <p className={`font-bold ${t.direction === "sent" ? "text-red-600" : "text-green-600"}`}>
                  {t.direction === "sent" ? "-" : "+"}{formatCurrency(t.amount)}
                </p>
              </CardContent>
            </Card>
          ))}
          {(!p2pTransfers || p2pTransfers.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No member-to-member transfers yet.</p>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-2 mt-4">
          {myGiving?.map((g: any) => (
            <Card key={g._id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`text-[10px] border-0 ${typeColors[g.type] ?? ""}`}>
                    {givingTypes.find((t) => t.value === g.type)?.label ?? g.type}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{formatCurrency(g.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(g.date)} via {paymentMethods.find((m) => m.value === g.paymentMethod)?.label ?? g.paymentMethod}</p>
                  </div>
                </div>
                {g.note && <p className="text-xs text-muted-foreground italic max-w-[200px] truncate">{g.note}</p>}
              </CardContent>
            </Card>
          ))}
          {myGiving?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No giving history yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
