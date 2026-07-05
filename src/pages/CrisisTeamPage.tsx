import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Church,
  Clock,
  Home,
  MapPin,
  Phone,
  Plus,
  Shield,
  Siren,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const SEVERITY_COLORS = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
} as const;

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  reported: { icon: <Clock className="size-4" />, label: "Reported", color: "text-amber-500" },
  assigned: { icon: <Users className="size-4" />, label: "Assigned", color: "text-blue-500" },
  dispatched: { icon: <Siren className="size-4" />, label: "Dispatched", color: "text-purple-600" },
  in_progress: { icon: <AlertTriangle className="size-4" />, label: "In Progress", color: "text-orange-500" },
  resolved: { icon: <CheckCircle2 className="size-4" />, label: "Resolved", color: "text-green-500" },
  closed: { icon: <CheckCircle2 className="size-4" />, label: "Closed", color: "text-muted-foreground" },
};

const DISPATCH_ICONS: Record<string, React.ReactNode> = {
  hospital: <Building2 className="size-4 text-red-500" />,
  church: <Church className="size-4 text-indigo-500" />,
  home: <Home className="size-4 text-green-600" />,
  other: <MapPin className="size-4 text-gray-500" />,
};

const ROLE_LABELS: Record<string, string> = {
  leader: "Team Lead",
  coordinator: "Crisis Coordinator",
  volunteer: "Volunteer",
  counselor: "Counselor",
};

const ROLE_COLORS: Record<string, string> = {
  leader: "bg-indigo-100 text-indigo-700",
  coordinator: "bg-amber-100 text-amber-700",
  volunteer: "bg-green-100 text-green-700",
  counselor: "bg-purple-100 text-purple-700",
};

export function CrisisTeamPage() {
  const team = useQuery(api.crisisTeam.getTeam);
  const incidents = useQuery(api.crisisTeam.listIncidents);
  const stats = useQuery(api.crisisTeam.getIncidentStats);
  const createTeam = useMutation(api.crisisTeam.createTeam);
  const reportIncident = useMutation(api.crisisTeam.reportIncident);

  const [teamOpen, setTeamOpen] = useState(false);
  const [incOpen, setIncOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    managementPartner: "One Care Crisis Network",
    partnerPhone: "",
    partnerEmail: "",
  });
  const [incForm, setIncForm] = useState({
    title: "",
    description: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
  });

  async function handleCreateTeam() {
    if (!teamForm.name) return;
    await createTeam({
      name: teamForm.name,
      description: teamForm.description || undefined,
      managementPartner: teamForm.managementPartner || undefined,
      partnerPhone: teamForm.partnerPhone || undefined,
      partnerEmail: teamForm.partnerEmail || undefined,
    });
    setTeamForm({ name: "", description: "", managementPartner: "One Care Crisis Network", partnerPhone: "", partnerEmail: "" });
    setTeamOpen(false);
    toast.success("Crisis team created");
  }

  async function handleReport() {
    if (!incForm.title || !incForm.description) return;
    await reportIncident(incForm);
    setIncForm({ title: "", description: "", severity: "medium" });
    setIncOpen(false);
    toast.success("Incident reported — team will be alerted");
  }

  // Group volunteers into pairs
  const pairs: { pair: typeof team extends { members: (infer T)[] } ? T[] : never[] }[] = [];
  const pairedIds = new Set<string>();
  if (team?.members) {
    for (const m of team.members) {
      if (pairedIds.has(m._id)) continue;
      if (m.pairedWith) {
        const partner = team.members.find((p: any) => p._id === m.pairedWith);
        if (partner) {
          pairs.push({ pair: [m, partner] as any });
          pairedIds.add(m._id);
          pairedIds.add(partner._id);
        }
      }
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-red-600 flex items-center justify-center">
            <Shield className="size-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{team?.name ?? "Crisis Team"}</h1>
            <p className="text-muted-foreground">
              {team?.managementPartner
                ? `Supported by ${team.managementPartner}`
                : "Rapid response coordination for your church community"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!team && (
            <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="size-4 mr-2" /> Create Team</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Crisis Team</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Team Name</Label><Input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="e.g. Grace Community Crisis Team" /></div>
                  <div><Label>Description</Label><Textarea value={teamForm.description} onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })} rows={2} /></div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2"><Building2 className="size-4" /> Management Partner</h4>
                    <div><Label>Partner Name</Label><Input value={teamForm.managementPartner} onChange={(e) => setTeamForm({ ...teamForm, managementPartner: e.target.value })} placeholder="One Care Crisis Network" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Phone</Label><Input value={teamForm.partnerPhone} onChange={(e) => setTeamForm({ ...teamForm, partnerPhone: e.target.value })} placeholder="(800) 555-0199" /></div>
                      <div><Label>Email</Label><Input value={teamForm.partnerEmail} onChange={(e) => setTeamForm({ ...teamForm, partnerEmail: e.target.value })} placeholder="dispatch@onecare.network" /></div>
                    </div>
                  </div>
                  <Button onClick={handleCreateTeam} className="w-full">Create Team</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {team && (
            <Dialog open={incOpen} onOpenChange={setIncOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive"><Siren className="size-4 mr-2" /> Report Crisis</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Report a Crisis</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Title</Label><Input value={incForm.title} onChange={(e) => setIncForm({ ...incForm, title: e.target.value })} placeholder="Brief summary of the crisis" /></div>
                  <div><Label>Description</Label><Textarea value={incForm.description} onChange={(e) => setIncForm({ ...incForm, description: e.target.value })} placeholder="What happened? Who needs help? Where?" rows={3} /></div>
                  <div><Label>Severity</Label>
                    <Select value={incForm.severity} onValueChange={(v) => setIncForm({ ...incForm, severity: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low — non-urgent</SelectItem>
                        <SelectItem value="medium">Medium — needs attention</SelectItem>
                        <SelectItem value="high">High — urgent response needed</SelectItem>
                        <SelectItem value="critical">Critical — emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleReport} className="w-full" variant="destructive">Submit Crisis Report</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Incidents</p></CardContent></Card>
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-orange-500">{stats.active}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-purple-600">{stats.dispatched}</p><p className="text-xs text-muted-foreground">Dispatched</p></CardContent></Card>
          <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-green-500">{stats.resolved}</p><p className="text-xs text-muted-foreground">Resolved</p></CardContent></Card>
        </div>
      )}

      {/* One Care Network Banner */}
      {team?.managementPartner && (
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Building2 className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{team.managementPartner}</h3>
                  <p className="text-sm text-blue-700">Management partner providing professional crisis support</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {team.partnerPhone && (
                  <a href={`tel:${team.partnerPhone}`} className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900">
                    <Phone className="size-4" /> {team.partnerPhone}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="team">Team Roster</TabsTrigger>
          <TabsTrigger value="pairs">Volunteer Pairs</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          {team ? (
            <div className="space-y-4">
              {/* On-Call Now */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Phone className="size-5 text-green-600" /> On Call Now</CardTitle></CardHeader>
                <CardContent>
                  {team.members.filter((m: any) => m.isOnCall).length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {team.members.filter((m: any) => m.isOnCall).map((m: any) => (
                        <div key={m._id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="size-10 rounded-full bg-green-600 flex items-center justify-center">
                            <Shield className="size-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{m.memberName}</p>
                            <p className="text-sm text-muted-foreground">{ROLE_LABELS[m.role]}</p>
                          </div>
                          {m.phone && (
                            <a href={`tel:${m.phone}`} className="ml-auto flex items-center gap-1 text-sm text-green-700 hover:underline">
                              <Phone className="size-3" /> Call
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No team members are currently on call.</p>
                  )}
                </CardContent>
              </Card>

              {/* Active Incidents Quick View */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Siren className="size-5 text-red-500" /> Active Incidents</CardTitle></CardHeader>
                <CardContent>
                  {incidents && incidents.filter((i: any) => !["resolved", "closed"].includes(i.status)).length > 0 ? (
                    <div className="space-y-3">
                      {incidents.filter((i: any) => !["resolved", "closed"].includes(i.status)).map((inc: any) => {
                        const sc = STATUS_CONFIG[inc.status] ?? STATUS_CONFIG.reported;
                        return (
                          <div key={inc._id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className={sc.color}>{sc.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-sm">{inc.title}</h4>
                                <Badge variant="secondary" className={SEVERITY_COLORS[inc.severity as keyof typeof SEVERITY_COLORS]}>{inc.severity}</Badge>
                                <Badge variant="outline">{sc.label}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{inc.description}</p>
                              {inc.dispatchLocation && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-700">
                                  {DISPATCH_ICONS[inc.dispatchLocation]}
                                  <span>Dispatched to {inc.dispatchLocation}{inc.dispatchAddress ? ` — ${inc.dispatchAddress}` : ""}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="size-10 mx-auto mb-2 text-green-500" />
                      <p className="font-medium">All Clear</p>
                      <p className="text-sm text-muted-foreground">No active incidents</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card className="bg-muted/30">
                <CardHeader><CardTitle className="text-lg">How Crisis Response Works</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="size-10 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center"><Phone className="size-5 text-red-600" /></div>
                      <h4 className="font-semibold text-sm">1. Call Comes In</h4>
                      <p className="text-xs text-muted-foreground mt-1">Church member reports a crisis through the dashboard</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="size-10 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center"><Shield className="size-5 text-amber-600" /></div>
                      <h4 className="font-semibold text-sm">2. Coordinator Alerts</h4>
                      <p className="text-xs text-muted-foreground mt-1">Crisis Coordinator assesses severity and alerts volunteer pairs</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="size-10 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center"><Users className="size-5 text-purple-600" /></div>
                      <h4 className="font-semibold text-sm">3. Pair Dispatched</h4>
                      <p className="text-xs text-muted-foreground mt-1">Volunteer pairs go to hospital, church, or home — always in pairs</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="size-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center"><Building2 className="size-5 text-blue-600" /></div>
                      <h4 className="font-semibold text-sm">4. Network Support</h4>
                      <p className="text-xs text-muted-foreground mt-1">{team.managementPartner ?? "One Care Crisis Network"} provides professional backup</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Shield className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Crisis Team Configured</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create a crisis response team to coordinate rapid support for church members in need.
                  Supported by One Care Crisis Network as your professional management partner.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Team Roster Tab */}
        <TabsContent value="team">
          {team?.members && team.members.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {team.members.map((tm: any) => (
                <Card key={tm._id}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-full flex items-center justify-center ${tm.role === "coordinator" ? "bg-amber-100" : tm.role === "leader" ? "bg-indigo-100" : tm.role === "counselor" ? "bg-purple-100" : "bg-green-100"}`}>
                        <Shield className={`size-6 ${tm.role === "coordinator" ? "text-amber-700" : tm.role === "leader" ? "text-indigo-700" : tm.role === "counselor" ? "text-purple-700" : "text-green-700"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{tm.memberName}</h3>
                          {tm.isOnCall && <Badge className="bg-green-100 text-green-700 text-xs">On Call</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className={ROLE_COLORS[tm.role]}>{ROLE_LABELS[tm.role]}</Badge>
                          {tm.specialization && <span className="text-xs text-muted-foreground">{tm.specialization}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          {tm.phone && (
                            <a href={`tel:${tm.phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                              <Phone className="size-3" /> {tm.phone}
                            </a>
                          )}
                          {tm.pairedName && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="size-3" /> Paired with {tm.pairedName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{team ? "No Team Members Yet" : "No Crisis Team"}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {team
                    ? "Add a Crisis Coordinator, volunteers (in pairs), and counselors to your response team."
                    : "Create a crisis team to coordinate rapid response for your church community."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Volunteer Pairs Tab */}
        <TabsContent value="pairs">
          {pairs.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">Volunteers are dispatched in pairs for safety and accountability. Each pair responds together to hospitals, churches, or homes.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {pairs.map((p, i) => (
                  <Card key={i} className="border-2 border-dashed border-primary/20">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">Pair {i + 1}</Badge>
                        <Users className="size-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        {(p.pair as any[]).map((m: any) => (
                          <div key={m._id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                            <Shield className="size-4 text-primary" />
                            <span className="font-medium text-sm">{m.memberName}</span>
                            <Badge variant="secondary" className={`text-xs ${ROLE_COLORS[m.role]}`}>{ROLE_LABELS[m.role]}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Pairs Configured</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Volunteers work in pairs for safety. Pairs are dispatched to hospitals, churches, and homes to support members in crisis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents">
          {incidents && incidents.length > 0 ? (
            <div className="space-y-3">
              {incidents.map((inc: any) => {
                const sc = STATUS_CONFIG[inc.status] ?? STATUS_CONFIG.reported;
                return (
                  <Card key={inc._id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className={sc.color}>{sc.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{inc.title}</h3>
                            <Badge variant="secondary" className={SEVERITY_COLORS[inc.severity as keyof typeof SEVERITY_COLORS]}>{inc.severity}</Badge>
                            <Badge variant="outline">{sc.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{inc.description}</p>
                          {inc.dispatchLocation && (
                            <div className="flex items-center gap-1.5 mt-2 text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded w-fit">
                              {DISPATCH_ICONS[inc.dispatchLocation]}
                              <span>Dispatched to {inc.dispatchLocation}{inc.dispatchAddress ? ` — ${inc.dispatchAddress}` : ""}</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Reported by {inc.reporterName} · {new Date(inc.reportedAt).toLocaleDateString()}
                            {inc.assigneeName && ` · Assigned to ${inc.assigneeName}`}
                          </p>
                          {inc.notes && <p className="text-xs bg-muted/50 p-2 rounded mt-2">{inc.notes}</p>}
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
                <CheckCircle2 className="size-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">No Incidents</h3>
                <p className="text-muted-foreground">All clear. No active or recent incidents reported.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
