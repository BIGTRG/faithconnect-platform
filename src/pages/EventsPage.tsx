import { useQuery, useMutation } from "convex/react";
import {
  Calendar, Plus, MapPin, Users, Clock, Check, ClipboardCheck,
  UserCheck, AlertCircle, ChevronDown, ChevronUp, Ticket
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const typeLabels: Record<string, string> = {
  service: "Service", bible_study: "Bible Study", youth: "Youth", outreach: "Outreach",
  fellowship: "Fellowship", meeting: "Meeting", workshop: "Workshop", other: "Other",
};

const typeColors: Record<string, string> = {
  service: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  bible_study: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  youth: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  outreach: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  fellowship: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  meeting: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  workshop: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function RegistrationDialog({ event, onClose }: { event: any; onClose: () => void }) {
  const register = useMutation(api.eventRegistration.register);
  const [guestCount, setGuestCount] = useState(0);
  const [dietaryNeeds, setDietaryNeeds] = useState("");
  const [notes, setNotes] = useState("");

  const handleRegister = async () => {
    await register({
      eventId: event._id,
      guestCount: guestCount > 0 ? guestCount : undefined,
      dietaryNeeds: dietaryNeeds.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    toast.success("Registered successfully!");
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-3">
        <h4 className="font-semibold">{event.title}</h4>
        <p className="text-sm text-muted-foreground">{formatDateTime(event.startTime)}</p>
        {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}
      </div>
      <div>
        <Label>Additional Guests</Label>
        <Input
          type="number" min={0} max={10} value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground mt-1">How many guests are you bringing?</p>
      </div>
      <div>
        <Label>Dietary Needs</Label>
        <Input
          value={dietaryNeeds} onChange={(e) => setDietaryNeeds(e.target.value)}
          placeholder="e.g., Vegetarian, Gluten-free, Nut allergy"
        />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea
          value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or notes..."
          rows={2}
        />
      </div>
      {event.maxAttendees && (
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="size-4 text-amber-500" />
          <span>Limited to {event.maxAttendees} attendees. {event.attendeeCount} registered so far.</span>
        </div>
      )}
      <Button onClick={handleRegister} className="w-full">
        <Ticket className="size-4 mr-2" />Register Now
      </Button>
    </div>
  );
}

function AttendancePanel({ event }: { event: any }) {
  const report = useQuery(api.eventRegistration.getAttendanceReport, { eventId: event._id });
  const checkIn = useMutation(api.eventRegistration.checkIn);
  const [expanded, setExpanded] = useState(false);

  if (!report) return null;

  const handleCheckIn = async (memberId: any) => {
    await checkIn({ eventId: event._id, memberId });
    toast.success("Checked in!");
  };

  return (
    <div className="mt-3 border-t pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-full"
      >
        <ClipboardCheck className="size-4" />
        Attendance: {report.checkedIn}/{report.going} checked in
        {expanded ? <ChevronUp className="size-4 ml-auto" /> : <ChevronDown className="size-4 ml-auto" />}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {report.attendees
            .filter((a: any) => a.status === "going")
            .map((a: any) => (
              <div key={a._id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`size-2 rounded-full ${a.checkedIn ? "bg-green-500" : "bg-gray-300"}`} />
                  <span>{a.memberName}</span>
                  {a.memberRole && a.memberRole !== "member" && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{a.memberRole}</Badge>
                  )}
                </div>
                {a.checkedIn ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="size-3" />
                    {a.checkedInAt ? formatTime(a.checkedInAt) : "Checked in"}
                  </span>
                ) : (
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleCheckIn(a.memberId)}>
                    Check In
                  </Button>
                )}
              </div>
            ))}
          {report.attendees.filter((a: any) => a.status === "going").length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No RSVPs yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export function EventsPage() {
  const events = useQuery(api.events.list);
  const myRegistrations = useQuery(api.eventRegistration.getMyRegistrations);
  const createEvent = useMutation(api.events.create);
  const rsvp = useMutation(api.events.rsvp);
  const cancelReg = useMutation(api.eventRegistration.cancelRegistration);

  const [open, setOpen] = useState(false);
  const [regDialogEvent, setRegDialogEvent] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("service");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !startDate || !startTime) return;
    const start = new Date(`${startDate}T${startTime}`).getTime();
    const end = endTime ? new Date(`${startDate}T${endTime}`).getTime() : start + 3600000;
    await createEvent({
      title: title.trim(), description: description.trim() || undefined,
      startTime: start, endTime: end, location: location.trim() || undefined, type: type as any,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
    });
    toast.success("Event created!");
    setOpen(false);
    setTitle(""); setDescription(""); setLocation(""); setStartDate(""); setStartTime(""); setEndTime(""); setMaxAttendees("");
  };

  const handleRsvp = async (eventId: any, status: "going" | "maybe" | "not_going") => {
    await rsvp({ eventId, status });
    toast.success(status === "going" ? "You're going!" : status === "maybe" ? "Marked as maybe" : "RSVP updated");
  };

  const handleCancelReg = async (eventId: any) => {
    await cancelReg({ eventId });
    toast.success("Registration cancelled");
  };

  const myRegMap = new Map((myRegistrations ?? []).map((r: any) => [r.eventId, r]));

  const upcoming = events?.filter((e: any) => e.startTime > Date.now()) ?? [];
  const past = events?.filter((e: any) => e.startTime <= Date.now()) ?? [];
  const myUpcomingRegs = (myRegistrations ?? []).filter(
    (r: any) => r.event && r.event.startTime > Date.now() && r.status === "registered"
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="size-6" /> Events
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Church calendar, registration, and attendance</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Add Event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Event</DialogTitle><DialogDescription>Add a new event to the church calendar.</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div><Label>Event Name</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Sunday Service" /></div>
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(typeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event details..." /></div>
              <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Main Sanctuary" /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div><Label>Start</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
                <div><Label>End</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
              </div>
              <div>
                <Label>Max Attendees (optional)</Label>
                <Input type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} placeholder="Unlimited" />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!title.trim() || !startDate || !startTime}>Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="my-registrations">My Registrations ({myUpcomingRegs.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.map((e: any) => {
            const myReg = myRegMap.get(e._id);
            const isRegistered = myReg && myReg.status === "registered";
            const capacityPct = e.maxAttendees ? (e.attendeeCount / e.maxAttendees) * 100 : null;
            return (
              <Card key={e._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-xl p-3 min-w-[60px]">
                      <span className="text-xs font-medium text-primary uppercase">{new Date(e.startTime).toLocaleDateString("en-US", { month: "short" })}</span>
                      <span className="text-2xl font-bold text-primary">{new Date(e.startTime).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${typeColors[e.type] ?? ""}`}>{typeLabels[e.type] ?? e.type}</Badge>
                        {isRegistered && <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">Registered</Badge>}
                        {myReg?.status === "waitlisted" && <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 border-0">Waitlisted</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg">{e.title}</h3>
                      {e.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="size-3" />{formatTime(e.startTime)} - {formatTime(e.endTime)}</span>
                        {e.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{e.location}</span>}
                        <span className="flex items-center gap-1"><Users className="size-3" />{e.attendeeCount} going</span>
                      </div>
                      {capacityPct !== null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{e.attendeeCount}/{e.maxAttendees} spots filled</span>
                            <span>{Math.round(capacityPct)}%</span>
                          </div>
                          <Progress value={capacityPct} className="h-1.5" />
                        </div>
                      )}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Button size="sm" variant={e.myStatus === "going" ? "default" : "outline"} onClick={() => handleRsvp(e._id, "going")}>
                          {e.myStatus === "going" && <Check className="size-3 mr-1" />}Going
                        </Button>
                        <Button size="sm" variant={e.myStatus === "maybe" ? "default" : "outline"} onClick={() => handleRsvp(e._id, "maybe")}>Maybe</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleRsvp(e._id, "not_going")}>Can't Go</Button>
                        {!isRegistered ? (
                          <Button size="sm" variant="secondary" onClick={() => setRegDialogEvent(e)}>
                            <Ticket className="size-3 mr-1" />Register
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleCancelReg(e._id)}>Cancel Registration</Button>
                        )}
                      </div>
                      <AttendancePanel event={e} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {upcoming.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="size-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No upcoming events</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-registrations" className="space-y-3">
          {myUpcomingRegs.length > 0 ? (
            myUpcomingRegs.map((r: any) => (
              <Card key={r._id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-green-50 dark:bg-green-950 rounded-xl p-3 min-w-[60px]">
                      <UserCheck className="size-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{r.event.title}</h3>
                      <p className="text-sm text-muted-foreground">{formatDateTime(r.event.startTime)}</p>
                      {r.event.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="size-3" />{r.event.location}</p>}
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {r.status === "registered" ? "Confirmed" : r.status}
                        </Badge>
                        {r.guestCount && r.guestCount > 0 && (
                          <Badge variant="outline" className="text-[10px]">+{r.guestCount} guests</Badge>
                        )}
                        {r.dietaryNeeds && (
                          <Badge variant="outline" className="text-[10px]">{r.dietaryNeeds}</Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleCancelReg(r.eventId)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Ticket className="size-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No registrations yet. Register for upcoming events!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {past.map((e: any) => (
            <Card key={e._id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center bg-muted rounded-xl p-3 min-w-[60px]">
                    <span className="text-xs font-medium text-muted-foreground uppercase">{new Date(e.startTime).toLocaleDateString("en-US", { month: "short" })}</span>
                    <span className="text-2xl font-bold text-muted-foreground">{new Date(e.startTime).getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-[10px] px-1.5 py-0 border-0 ${typeColors[e.type] ?? ""}`}>{typeLabels[e.type] ?? e.type}</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Completed</Badge>
                    </div>
                    <h3 className="font-semibold">{e.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="size-3" />{formatDateTime(e.startTime)}</span>
                      <span className="flex items-center gap-1"><Users className="size-3" />{e.attendeeCount} attended</span>
                    </div>
                    <AttendancePanel event={e} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {past.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="size-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No past events</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Registration Dialog */}
      <Dialog open={!!regDialogEvent} onOpenChange={(o) => !o && setRegDialogEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for Event</DialogTitle>
            <DialogDescription>Sign up and let us know you're coming.</DialogDescription>
          </DialogHeader>
          {regDialogEvent && (
            <RegistrationDialog event={regDialogEvent} onClose={() => setRegDialogEvent(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
