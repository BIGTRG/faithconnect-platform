import { useQuery } from "convex/react";
import {
  CheckCircle,
  Church,
  Circle,
  PlayCircle,
  Users,
  Calendar,
  Heart,
  Gift,
  UserCircle,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function WelcomePage() {
  const member = useCurrentMember();
  const videos = useQuery(
    api.welcome.getWelcomeVideos,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const leaders = useQuery(
    api.welcome.getKeyLeaders,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );

  const onboardingSteps = [
    { key: "welcome_video", label: "Watch Welcome Video", icon: PlayCircle, done: true },
    { key: "met_leaders", label: "Meet Key Leaders", icon: Users, done: true },
    { key: "calendar_review", label: "Review Church Calendar", icon: Calendar, done: false },
    { key: "join_group", label: "Join a Group", icon: Church, done: false },
    { key: "first_gift", label: "Make Your First Gift", icon: Gift, done: false },
    { key: "profile", label: "Complete Your Profile", icon: UserCircle, done: false },
  ];

  const completedCount = onboardingSteps.filter((s) => s.done).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {member?.displayName ?? "Friend"}!
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            We are so glad you are here. Let us help you get connected and feel at home.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 flex-1 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-foreground/80 rounded-full transition-all"
                style={{ width: `${(completedCount / onboardingSteps.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {completedCount}/{onboardingSteps.length} complete
            </span>
          </div>
        </div>
        <Heart className="absolute right-8 top-8 size-24 text-primary-foreground/10" />
      </div>

      {/* Welcome Videos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Welcome Videos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(videos ?? []).map((video) => (
            <Card key={video._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                <PlayCircle className="size-16 text-white/80" />
                <Badge className="absolute top-3 left-3 bg-primary/90">
                  {video.type === "welcome"
                    ? "Welcome"
                    : video.type === "pastor_greeting"
                      ? "Pastor"
                      : video.type === "campus_tour"
                        ? "Tour"
                        : "Ministry"}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{video.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {video.description}
                </p>
              </CardContent>
            </Card>
          ))}
          {(!videos || videos.length === 0) && (
            <Card className="col-span-full p-8 text-center text-muted-foreground">
              Welcome videos coming soon
            </Card>
          )}
        </div>
      </div>

      {/* Meet Key Leaders */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Meet Our Leaders</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(leaders ?? []).map((leader) => (
            <Card key={leader._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">
                      {leader.displayName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{leader.displayName}</h3>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {leader.role}
                    </Badge>
                    {leader.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {leader.bio}
                      </p>
                    )}
                    {leader.phone && (
                      <a
                        href={`tel:${leader.phone}`}
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        {leader.phone}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Onboarding Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Church className="size-5" />
            Your Getting Started Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onboardingSteps.map((step) => (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  step.done
                    ? "bg-green-50 dark:bg-green-950/20"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {step.done ? (
                  <CheckCircle className="size-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="size-5 text-muted-foreground flex-shrink-0" />
                )}
                <step.icon className="size-4 text-muted-foreground" />
                <span
                  className={
                    step.done ? "line-through text-muted-foreground" : "font-medium"
                  }
                >
                  {step.label}
                </span>
                {!step.done && (
                  <Button size="sm" variant="outline" className="ml-auto">
                    Start
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
