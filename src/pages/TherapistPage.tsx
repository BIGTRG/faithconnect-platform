import { useQuery } from "convex/react";
import {
  Brain,
  Calendar,
  Heart,
  Phone,
  Shield,
  Star,
  User,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";

const SPECIALTIES = [
  { value: "all", label: "All Specialties", icon: "🧠" },
  { value: "general", label: "General Counseling", icon: "💬" },
  { value: "marriage", label: "Marriage & Couples", icon: "💍" },
  { value: "grief", label: "Grief & Loss", icon: "🕊️" },
  { value: "addiction", label: "Addiction Recovery", icon: "🔗" },
  { value: "youth", label: "Youth & Teens", icon: "🎓" },
  { value: "trauma", label: "Trauma & PTSD", icon: "🛡️" },
  { value: "anxiety", label: "Anxiety & Panic", icon: "😰" },
  { value: "depression", label: "Depression", icon: "🌧️" },
  { value: "family", label: "Family Therapy", icon: "👨‍👩‍👧‍👦" },
];

const SAMPLE_THERAPISTS = [
  {
    name: "Dr. Sarah Mitchell",
    title: "Licensed Clinical Psychologist",
    specialty: "anxiety",
    bio: "20+ years helping individuals overcome anxiety through faith-integrated CBT therapy. Specializes in panic disorders and generalized anxiety.",
    credentials: ["Ph.D. Clinical Psychology", "Licensed LPC", "AACC Certified"],
    isFaithBased: true,
    sessionRate: 75,
    isFree: false,
    rating: 4.9,
    totalSessions: 342,
  },
  {
    name: "Rev. James Thompson",
    title: "Pastoral Counselor",
    specialty: "grief",
    bio: "Ordained minister and certified grief counselor. Walks alongside families through loss with compassion, scripture, and practical support.",
    credentials: ["M.Div.", "Certified Grief Counselor", "CPE Certified"],
    isFaithBased: true,
    sessionRate: 0,
    isFree: true,
    rating: 4.8,
    totalSessions: 218,
  },
  {
    name: "Dr. Maria Rodriguez",
    title: "Licensed Marriage & Family Therapist",
    specialty: "marriage",
    bio: "Helping couples strengthen their bond through Gottman Method and biblical principles. Premarital counseling also available.",
    credentials: ["Ph.D. MFT", "Gottman Level 3", "AAMFT Clinical Fellow"],
    isFaithBased: true,
    sessionRate: 95,
    isFree: false,
    rating: 4.9,
    totalSessions: 456,
  },
  {
    name: "Michael Davis, LCSW",
    title: "Licensed Clinical Social Worker",
    specialty: "addiction",
    bio: "Specializing in substance abuse recovery with a faith-based 12-step integration. Group and individual sessions available.",
    credentials: ["MSW", "LCSW", "CADC Certified"],
    isFaithBased: true,
    sessionRate: 60,
    isFree: false,
    rating: 4.7,
    totalSessions: 189,
  },
  {
    name: "Dr. Angela Foster",
    title: "Child & Adolescent Psychologist",
    specialty: "youth",
    bio: "Dedicated to supporting young people through life transitions, identity formation, and mental health challenges with a faith-centered approach.",
    credentials: ["Psy.D.", "Certified Child Psychologist", "Play Therapy Cert."],
    isFaithBased: true,
    sessionRate: 85,
    isFree: false,
    rating: 4.8,
    totalSessions: 267,
  },
  {
    name: "Dr. Robert Chen",
    title: "Trauma-Informed Therapist",
    specialty: "trauma",
    bio: "EMDR-trained therapist specializing in trauma recovery. Integrates somatic experiencing with faith-based healing practices.",
    credentials: ["Ph.D. Psychology", "EMDR Certified", "Somatic Experiencing"],
    isFaithBased: true,
    sessionRate: 110,
    isFree: false,
    rating: 4.9,
    totalSessions: 312,
  },
];

function TherapistCard({ therapist }: { therapist: typeof SAMPLE_THERAPISTS[0] }) {
  const spec = SPECIALTIES.find((s) => s.value === therapist.specialty);
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="size-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{therapist.name}</CardTitle>
            <CardDescription className="text-sm mt-0.5">
              {therapist.title}
            </CardDescription>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="secondary" className="text-xs">
                {spec?.icon} {spec?.label}
              </Badge>
              {therapist.isFaithBased && (
                <Badge variant="outline" className="text-xs">
                  <Heart className="size-3 mr-1" />
                  Faith-Based
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            {therapist.isFree ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <span className="text-lg font-bold">${therapist.sessionRate}<span className="text-xs text-muted-foreground">/session</span></span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{therapist.bio}</p>

        <div className="flex flex-wrap gap-1.5">
          {therapist.credentials.map((cred) => (
            <Badge key={cred} variant="outline" className="text-xs font-normal">
              <Shield className="size-3 mr-1" />
              {cred}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              {therapist.rating}
            </span>
            <span>{therapist.totalSessions} sessions</span>
          </div>

          <Dialog open={bookOpen} onOpenChange={setBookOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Calendar className="size-4 mr-1" />
                Book Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book a Session with {therapist.name}</DialogTitle>
                <DialogDescription>
                  Schedule a private one-on-one session. All conversations are confidential.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Session Type</Label>
                  <Select defaultValue="video">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="size-4" />
                          Video Call
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center gap-2">
                          <Phone className="size-4" />
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="in_person">
                        <div className="flex items-center gap-2">
                          <User className="size-4" />
                          In Person
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preferred Date & Time</Label>
                  <Input type="datetime-local" className="mt-1" />
                </div>
                <div>
                  <Label>What would you like to discuss? (optional)</Label>
                  <Textarea
                    className="mt-1"
                    placeholder="Share any context to help your therapist prepare..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Shield className="size-4 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Your session is completely confidential. Anonymous booking is available.
                  </p>
                </div>
                <Button className="w-full" onClick={() => setBookOpen(false)}>
                  Request Session {!therapist.isFree && `($${therapist.sessionRate})`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export function TherapistPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const member = useCurrentMember();

  const therapists = useQuery(
    api.therapy.listTherapists,
    member?.churchId
      ? { churchId: member.churchId, specialty: selectedSpecialty !== "all" ? selectedSpecialty : undefined }
      : "skip",
  );

  const displayTherapists = therapists && therapists.length > 0
    ? therapists
    : SAMPLE_THERAPISTS.filter(
        (t) => selectedSpecialty === "all" || t.specialty === selectedSpecialty,
      );

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Brain className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">One-on-One Therapy</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Confidential sessions with licensed, faith-based therapists
          </p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Safe and Confidential</p>
            <p className="text-xs text-muted-foreground">
              All sessions are private and protected. Book anonymously if you prefer. Our therapists integrate faith and clinical best practices.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {SPECIALTIES.map((spec) => (
          <Button
            key={spec.value}
            variant={selectedSpecialty === spec.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSpecialty(spec.value)}
          >
            <span className="mr-1">{spec.icon}</span>
            {spec.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {displayTherapists.length > 0 ? (
          displayTherapists.map((therapist, i) => (
            <TherapistCard key={i} therapist={therapist as any} />
          ))
        ) : (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center text-center">
              <Brain className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No Therapists Found</h3>
              <p className="text-muted-foreground mt-1">
                No therapists match this specialty yet. Check back soon or try another category.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-dashed">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <Phone className="size-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold">Crisis? Get Help Now</p>
              <p className="text-sm text-muted-foreground">
                If you are in immediate danger, call 911. For mental health crisis, call or text 988 (Suicide & Crisis Lifeline).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
