import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function GrowthTrackerPage() {
  const journey = useQuery(api.growth.getMyJourney);
  const leaderboard = useQuery(api.growth.getLeaderboard);
  const partner = useQuery(api.growth.getPartner);
  const addMilestone = useMutation(api.growth.addMilestone);

  const achievedTypes = new Set<string>(journey?.milestones.map((m) => m.type) ?? []);
  const progressPct = journey?.progress ?? 0;

  async function handleComplete(type: string, title: string, emoji: string) {
    await addMilestone({
      type: type as "salvation" | "baptism" | "first_group" | "first_volunteer" | "first_tithe" | "read_bible_30" | "prayer_warrior" | "mentorship" | "leader_training" | "missions_trip",
      title,
      badgeEmoji: emoji,
    });
    toast.success(`Milestone achieved: ${title}`);
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Spiritual Growth</h1>
      </div>
      <p className="text-muted-foreground mb-6">Track your faith journey, earn milestones, grow together</p>

      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center gap-6">
            <div className="size-20 rounded-full border-4 border-primary flex items-center justify-center">
              <span className="text-2xl font-bold">{progressPct}%</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Your Journey Progress</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {journey?.milestones.length ?? 0} of {journey?.allMilestones.length ?? 10} milestones completed
              </p>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            {partner && (
              <div className="text-center shrink-0 hidden sm:block">
                <Users className="size-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Accountability Partner</p>
                <p className="text-sm font-medium">{partner.partnerName}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="journey">My Journey</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="journey">
          <div className="space-y-3">
            {(journey?.allMilestones ?? []).map((ms) => {
              const isComplete = achievedTypes.has(ms.type);
              const achieved = journey?.milestones.find((m) => m.type === ms.type);
              return (
                <Card key={ms.type} className={isComplete ? "border-green-300/50 bg-green-50/50 dark:bg-green-950/10" : ""}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{ms.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isComplete ? "text-green-700 dark:text-green-400" : ""}`}>{ms.title}</h3>
                          {isComplete && <CheckCircle2 className="size-4 text-green-600" />}
                        </div>
                        {achieved ? (
                          <p className="text-xs text-muted-foreground">
                            Achieved {new Date(achieved.achievedAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Step {ms.order} on your journey</p>
                        )}
                      </div>
                      {!isComplete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(ms.type, ms.title, ms.emoji)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          {(!leaderboard || leaderboard.length === 0) ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Trophy className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Leaderboard Loading</h3>
                <p className="text-muted-foreground">Complete your first milestone to appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <Card key={entry.memberId} className={i < 3 ? "border-amber-300/50" : ""}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold w-8 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.count} milestones</p>
                      </div>
                      <div className="w-24">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${entry.progress}%` }} />
                        </div>
                        <p className="text-xs text-right text-muted-foreground mt-0.5">{entry.progress}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
