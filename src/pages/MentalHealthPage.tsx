import { useQuery } from "convex/react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Brain,
  ClipboardCheck,
  ExternalLink,
  HeartPulse,
  Leaf,
  Phone,
  Smile,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Progress } from "@/components/ui/progress";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";

const CATEGORIES = [
  { value: "all", label: "All", icon: "🧠" },
  { value: "anxiety", label: "Anxiety", icon: "😰" },
  { value: "depression", label: "Depression", icon: "🌧️" },
  { value: "grief", label: "Grief", icon: "🕊️" },
  { value: "addiction", label: "Addiction", icon: "🔗" },
  { value: "ptsd", label: "PTSD", icon: "🛡️" },
  { value: "eating_disorder", label: "Eating Disorders", icon: "🍽️" },
  { value: "adhd", label: "ADHD", icon: "⚡" },
  { value: "anger", label: "Anger", icon: "🔥" },
  { value: "self_harm", label: "Self-Harm", icon: "💔" },
  { value: "general", label: "General Wellness", icon: "🌿" },
];

const ASSESSMENTS = [
  {
    type: "anxiety",
    title: "Anxiety Self-Check",
    description: "Based on the GAD-7 scale. Takes about 2 minutes.",
    icon: "😰",
    questions: 7,
  },
  {
    type: "depression",
    title: "Depression Screening",
    description: "Based on the PHQ-9 scale. Quick and confidential.",
    icon: "🌧️",
    questions: 9,
  },
  {
    type: "stress",
    title: "Stress Level Check",
    description: "Perceived Stress Scale adapted for faith communities.",
    icon: "⚡",
    questions: 10,
  },
  {
    type: "burnout",
    title: "Burnout Assessment",
    description: "Ministry and life burnout screening tool.",
    icon: "🔥",
    questions: 8,
  },
  {
    type: "grief",
    title: "Grief Processing",
    description: "Understanding where you are in your grief journey.",
    icon: "🕊️",
    questions: 6,
  },
  {
    type: "relationship",
    title: "Relationship Health",
    description: "Evaluate the health of your key relationships.",
    icon: "💑",
    questions: 8,
  },
];

const HOTLINES = [
  { name: "988 Suicide & Crisis Lifeline", phone: "988", desc: "Call or text 24/7" },
  { name: "Crisis Text Line", phone: "Text HOME to 741741", desc: "Free 24/7 text support" },
  { name: "SAMHSA Helpline", phone: "1-800-662-4357", desc: "Substance abuse & mental health" },
  { name: "National Domestic Violence", phone: "1-800-799-7233", desc: "Safety planning & support" },
  { name: "Trevor Project (LGBTQ+ Youth)", phone: "1-866-488-7386", desc: "Crisis intervention" },
];

const SAMPLE_RESOURCES = [
  {
    title: "Managing Anxiety with Faith",
    description: "A comprehensive guide blending CBT techniques with biblical principles for anxiety relief.",
    category: "anxiety",
    type: "article",
    isFree: true,
    isFaithBased: true,
  },
  {
    title: "Grief Share Support Group",
    description: "Weekly video-based grief recovery support group with faith-centered curriculum.",
    category: "grief",
    type: "support_group",
    isFree: true,
    isFaithBased: true,
  },
  {
    title: "Breaking Free: Addiction Recovery",
    description: "12-step faith-integrated recovery program with daily devotionals and accountability tools.",
    category: "addiction",
    type: "workbook",
    isFree: false,
    isFaithBased: true,
  },
  {
    title: "Calm & Centered App",
    description: "Guided meditations, breathing exercises, and scripture-based mindfulness practices.",
    category: "anxiety",
    type: "app",
    isFree: false,
    isFaithBased: true,
  },
  {
    title: "Understanding Depression",
    description: "Video series from licensed Christian counselors explaining depression and treatment options.",
    category: "depression",
    type: "video",
    isFree: true,
    isFaithBased: true,
  },
  {
    title: "Anger Management Workshop",
    description: "Self-paced online course for healthy anger expression and conflict resolution.",
    category: "anger",
    type: "workbook",
    isFree: false,
    isFaithBased: true,
  },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <BookOpen className="size-4" />,
  video: <Activity className="size-4" />,
  hotline: <Phone className="size-4" />,
  app: <Sparkles className="size-4" />,
  workbook: <ClipboardCheck className="size-4" />,
  support_group: <Smile className="size-4" />,
};

function AssessmentCard({ assessment }: { assessment: typeof ASSESSMENTS[0] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleAnswer = (val: number) => {
    const newScore = score + val;
    setScore(newScore);
    if (step + 1 >= assessment.questions) {
      setDone(true);
    } else {
      setStep(step + 1);
    }
  };

  const getSeverity = () => {
    const maxScore = assessment.questions * 3;
    const pct = score / maxScore;
    if (pct < 0.25) return { label: "Low", color: "text-green-600", bg: "bg-green-500" };
    if (pct < 0.5) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-500" };
    if (pct < 0.75) return { label: "High", color: "text-orange-600", bg: "bg-orange-500" };
    return { label: "Severe", color: "text-red-600", bg: "bg-red-500" };
  };

  const resetAssessment = () => {
    setStep(0);
    setScore(0);
    setDone(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetAssessment(); }}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center gap-4 py-5">
            <span className="text-3xl">{assessment.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{assessment.title}</p>
              <p className="text-xs text-muted-foreground">{assessment.description}</p>
            </div>
            <Badge variant="outline">{assessment.questions} questions</Badge>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{assessment.icon} {assessment.title}</DialogTitle>
          <DialogDescription>
            This is a screening tool, not a diagnosis. Please consult a professional.
          </DialogDescription>
        </DialogHeader>
        {!done ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {step + 1} of {assessment.questions}</span>
              <span>{Math.round(((step) / assessment.questions) * 100)}%</span>
            </div>
            <Progress value={(step / assessment.questions) * 100} />
            <p className="font-medium py-4">
              Over the past 2 weeks, how often have you been bothered by feelings related to {assessment.type}?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["Not at all", "Several days", "More than half", "Nearly every day"].map((label, i) => (
                <Button
                  key={label}
                  variant="outline"
                  className="h-auto py-3"
                  onClick={() => handleAnswer(i)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2 text-center">
            <div className={`text-4xl font-bold ${getSeverity().color}`}>
              {getSeverity().label}
            </div>
            <p className="text-sm text-muted-foreground">
              Your score: {score} / {assessment.questions * 3}
            </p>
            <Progress value={(score / (assessment.questions * 3)) * 100} className={getSeverity().bg} />
            <Card className="bg-muted/50 text-left">
              <CardContent className="py-4 space-y-2">
                <p className="text-sm font-medium">Recommendations:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Talk with a trusted pastor or counselor</li>
                  <li>- Consider booking a therapy session</li>
                  <li>- Explore our mental health resources</li>
                  {getSeverity().label === "Severe" && (
                    <li className="text-red-600 font-medium">- Please reach out to a crisis hotline immediately</li>
                  )}
                </ul>
              </CardContent>
            </Card>
            <Button className="w-full" onClick={() => setOpen(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MentalHealthPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"resources" | "assessments" | "hotlines">("resources");
  const member = useCurrentMember();

  const resources = useQuery(
    api.mentalHealth.listResources,
    member?.churchId
      ? { churchId: member.churchId, category: selectedCategory !== "all" ? selectedCategory : undefined }
      : "skip",
  );

  const displayResources = resources && resources.length > 0
    ? resources
    : SAMPLE_RESOURCES.filter(
        (r) => selectedCategory === "all" || r.category === selectedCategory,
      );

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <HeartPulse className="size-8 text-primary" />
          <h1 className="text-3xl font-bold">Mental & Behavioral Health</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Resources, self-assessments, and support for your mental wellness journey
        </p>
      </div>

      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="size-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
            <Leaf className="size-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-sm">You Are Not Alone</p>
            <p className="text-xs text-muted-foreground">
              Mental health is part of whole-person wellness. Your church family is here to walk with you. Every resource here is curated with compassion and confidentiality.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 border-b">
        {(["resources", "assessments", "hotlines"] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab === "resources" && <BookOpen className="size-4 mr-1" />}
            {tab === "assessments" && <ClipboardCheck className="size-4 mr-1" />}
            {tab === "hotlines" && <Phone className="size-4 mr-1" />}
            {tab}
          </Button>
        ))}
      </div>

      {activeTab === "resources" && (
        <>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {displayResources.map((resource, i) => {
              const cat = CATEGORIES.find((c) => c.value === resource.category);
              return (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {TYPE_ICONS[resource.type] || <BookOpen className="size-4" />}
                        <Badge variant="secondary" className="text-xs capitalize">
                          {resource.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex gap-1.5">
                        {resource.isFree && <Badge className="bg-green-600 text-xs">Free</Badge>}
                        {resource.isFaithBased && (
                          <Badge variant="outline" className="text-xs">Faith-Based</Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-base mt-2">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {cat?.icon} {cat?.label}
                      </Badge>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <ExternalLink className="size-3.5 mr-1" />
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "assessments" && (
        <div className="space-y-4">
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-4 flex items-center gap-3">
              <Brain className="size-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                These screening tools help you understand how you are feeling. They are not a diagnosis. Results are private and never shared.
              </p>
            </CardContent>
          </Card>
          <div className="grid gap-3">
            {ASSESSMENTS.map((assessment) => (
              <AssessmentCard key={assessment.type} assessment={assessment} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "hotlines" && (
        <div className="space-y-3">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="size-5 text-red-600 shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">If you are in immediate danger, call 911.</span>{" "}
                The following hotlines are free, confidential, and available 24/7.
              </p>
            </CardContent>
          </Card>
          {HOTLINES.map((hotline) => (
            <Card key={hotline.name} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <Phone className="size-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{hotline.name}</p>
                  <p className="text-xs text-muted-foreground">{hotline.desc}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Phone className="size-3.5 mr-1" />
                  {hotline.phone}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
