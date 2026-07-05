import { useQuery } from "convex/react";
import {
  BadgeCheck,
  Building2,
  Clock,
  Globe,
  Heart,
  MapPin,
  Phone,
  Plus,
  Search,
  Stethoscope,
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
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";

const SPECIALTIES = [
  { value: "all", label: "All", icon: "🏥" },
  { value: "primary_care", label: "Primary Care", icon: "🩺" },
  { value: "dentist", label: "Dentist", icon: "🦷" },
  { value: "pediatrics", label: "Pediatrics", icon: "👶" },
  { value: "obgyn", label: "OB/GYN", icon: "🤰" },
  { value: "cardiology", label: "Cardiology", icon: "❤️" },
  { value: "dermatology", label: "Dermatology", icon: "🧴" },
  { value: "orthopedics", label: "Orthopedics", icon: "🦴" },
  { value: "optometry", label: "Optometry", icon: "👁️" },
  { value: "psychiatry", label: "Psychiatry", icon: "🧠" },
  { value: "physical_therapy", label: "Physical Therapy", icon: "🏃" },
  { value: "chiropractic", label: "Chiropractic", icon: "🔄" },
  { value: "pharmacy", label: "Pharmacy", icon: "💊" },
  { value: "urgent_care", label: "Urgent Care", icon: "🚨" },
  { value: "telehealth", label: "Telehealth", icon: "📱" },
];

const SAMPLE_PROVIDERS = [
  {
    name: "Dr. David Patterson",
    practice: "Grace Family Medicine",
    specialty: "primary_care",
    address: "1234 Faith Avenue, Suite 200",
    phone: "(555) 234-5678",
    acceptsInsurance: true,
    isFaithAligned: true,
    isChurchMember: true,
    offersTelemedicine: true,
    isVerified: true,
    bio: "Board-certified family physician serving the community for 15 years. Integrates whole-person care with compassion.",
    hours: "Mon-Fri 8am-5pm, Sat 9am-12pm",
  },
  {
    name: "Dr. Lisa Chen",
    practice: "Bright Smile Dental",
    specialty: "dentist",
    address: "567 Community Blvd",
    phone: "(555) 345-6789",
    acceptsInsurance: true,
    isFaithAligned: true,
    isChurchMember: false,
    offersTelemedicine: false,
    isVerified: true,
    bio: "General and cosmetic dentistry. Special discount for church members. Family-friendly office.",
    hours: "Mon-Thu 9am-6pm, Fri 9am-3pm",
  },
  {
    name: "Dr. Marcus Williams",
    practice: "Kingdom Kids Pediatrics",
    specialty: "pediatrics",
    address: "890 Blessing Lane",
    phone: "(555) 456-7890",
    acceptsInsurance: true,
    isFaithAligned: true,
    isChurchMember: true,
    offersTelemedicine: true,
    isVerified: true,
    bio: "Pediatrician with a heart for children's whole health -- physical, emotional, and spiritual well-being.",
    hours: "Mon-Fri 8am-5pm",
  },
  {
    name: "Dr. Rachel Foster",
    practice: "Women's Wellness Center",
    specialty: "obgyn",
    address: "321 Covenant Drive, Suite 400",
    phone: "(555) 567-8901",
    acceptsInsurance: true,
    isFaithAligned: true,
    isChurchMember: false,
    offersTelemedicine: true,
    isVerified: true,
    bio: "Comprehensive women's health, prenatal care, and family planning from a faith-centered perspective.",
    hours: "Mon-Fri 8:30am-4:30pm",
  },
  {
    name: "Dr. James Taylor",
    practice: "Clear Vision Optometry",
    specialty: "optometry",
    address: "456 Grace Street",
    phone: "(555) 678-9012",
    acceptsInsurance: true,
    isFaithAligned: false,
    isChurchMember: true,
    offersTelemedicine: false,
    isVerified: true,
    bio: "Complete eye care including exams, glasses, and contacts. Church member discount available.",
    hours: "Tue-Sat 10am-6pm",
  },
  {
    name: "TeleDoc Faith Health",
    practice: "Virtual Care Platform",
    specialty: "telehealth",
    address: "Online Only",
    phone: "(555) 789-0123",
    acceptsInsurance: true,
    isFaithAligned: true,
    isChurchMember: false,
    offersTelemedicine: true,
    isVerified: true,
    bio: "24/7 telehealth visits with faith-aligned providers. See a doctor from home in under 15 minutes.",
    hours: "24/7",
  },
];

function ProviderCard({ provider }: { provider: typeof SAMPLE_PROVIDERS[0] }) {
  const spec = SPECIALTIES.find((s) => s.value === provider.specialty);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              {provider.isVerified && (
                <BadgeCheck className="size-5 text-blue-500 shrink-0" />
              )}
            </div>
            <CardDescription>{provider.practice}</CardDescription>
          </div>
          <Badge variant="secondary">
            {spec?.icon} {spec?.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{provider.bio}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{provider.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            <span>{provider.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span className="truncate">{provider.hours}</span>
          </div>
          {provider.offersTelemedicine && (
            <div className="flex items-center gap-2 text-green-600">
              <Video className="size-3.5 shrink-0" />
              <span>Telehealth Available</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {provider.acceptsInsurance && (
            <Badge variant="outline" className="text-xs">
              <BadgeCheck className="size-3 mr-1" /> Accepts Insurance
            </Badge>
          )}
          {provider.isFaithAligned && (
            <Badge variant="outline" className="text-xs">
              <Heart className="size-3 mr-1" /> Faith-Aligned
            </Badge>
          )}
          {provider.isChurchMember && (
            <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
              <Building2 className="size-3 mr-1" /> Church Member
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="size-3.5 mr-1" />
            Call
          </Button>
          {provider.offersTelemedicine && (
            <Button size="sm" className="flex-1">
              <Video className="size-3.5 mr-1" />
              Book Telehealth
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Globe className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MedicalDirectoryPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [search, setSearch] = useState("");
  const member = useCurrentMember();

  const providers = useQuery(
    api.medical.listProviders,
    member?.churchId
      ? { churchId: member.churchId, specialty: selectedSpecialty !== "all" ? selectedSpecialty : undefined }
      : "skip",
  );

  const allProviders = providers && providers.length > 0
    ? providers
    : SAMPLE_PROVIDERS.filter(
        (p) => selectedSpecialty === "all" || p.specialty === selectedSpecialty,
      );

  const displayProviders = search
    ? allProviders.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.practice && p.practice.toLowerCase().includes(search.toLowerCase())),
      )
    : allProviders;

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Stethoscope className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Medical Directory</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Find trusted, faith-aligned healthcare providers in your community
          </p>
        </div>
        <Button>
          <Plus className="size-4 mr-1" />
          Add Provider
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or practice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

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

      <div className="grid gap-4 md:grid-cols-2">
        {displayProviders.length > 0 ? (
          displayProviders.map((provider, i) => (
            <ProviderCard key={i} provider={provider as any} />
          ))
        ) : (
          <Card className="col-span-2 py-16">
            <CardContent className="flex flex-col items-center text-center">
              <Stethoscope className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No Providers Found</h3>
              <p className="text-muted-foreground mt-1">
                No healthcare providers match your search. Try a different specialty or add a new provider.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
