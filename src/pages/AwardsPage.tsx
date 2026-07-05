import { useQuery } from "convex/react";
import { Medal, Trophy } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  top_giver: { label: "Top Giver", emoji: "💰", color: "text-amber-600" },
  top_volunteer: { label: "Top Volunteer", emoji: "🤝", color: "text-emerald-600" },
  top_attendance: { label: "Top Attendance", emoji: "📍", color: "text-blue-600" },
  most_prayers: { label: "Most Prayers", emoji: "🙏", color: "text-purple-600" },
  community_hero: { label: "Community Hero", emoji: "🦸", color: "text-rose-600" },
  newcomer_welcome: { label: "Newcomer Welcome", emoji: "👋", color: "text-teal-600" },
  ministry_mvp: { label: "Ministry MVP", emoji: "⭐", color: "text-orange-600" },
  custom: { label: "Special Award", emoji: "🏅", color: "text-indigo-600" },
};

export function AwardsPage() {
  const currentYear = new Date().getFullYear();
  const awards = useQuery(api.awards.list, { year: currentYear });
  const myAwards = useQuery(api.awards.getMyAwards);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="size-8 text-amber-500" />
        <div>
          <h1 className="text-3xl font-bold">Awards &amp; Recognition</h1>
          <p className="text-muted-foreground">Celebrating our church family's dedication</p>
        </div>
      </div>

      <Tabs defaultValue="hall" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="hall">Hall of Fame</TabsTrigger>
          <TabsTrigger value="my">My Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="hall">
          {(!awards || awards.length === 0) ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Trophy className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Awards Ceremony Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Annual awards will be presented here recognizing the members who gave the most,
                  volunteered the most hours, attended the most services, and served the community.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                  {Object.entries(CATEGORY_META).slice(0, 4).map(([key, meta]) => (
                    <div key={key} className="p-4 bg-muted/50 rounded-lg text-center">
                      <span className="text-3xl">{meta.emoji}</span>
                      <p className="text-sm font-medium mt-2">{meta.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">{currentYear} Award Recipients</h2>
                <p className="text-muted-foreground">{awards.length} awards presented</p>
              </div>
              {awards.map((award, i) => {
                const meta = CATEGORY_META[award.category] ?? CATEGORY_META.custom;
                return (
                  <Card key={award._id} className={i < 3 ? "border-amber-300/50" : ""}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="size-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : meta.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg truncate">{award.memberName}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-muted ${meta.color}`}>
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium mt-0.5">{award.title}</p>
                          {award.description && <p className="text-sm text-muted-foreground mt-1">{award.description}</p>}
                        </div>
                        {award.metric != null && (
                          <div className="text-right shrink-0">
                            <p className="text-2xl font-bold">{award.metric}</p>
                            <p className="text-xs text-muted-foreground">{award.metricLabel}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my">
          {(!myAwards || myAwards.length === 0) ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Medal className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Awards Yet</h3>
                <p className="text-muted-foreground">Keep serving the community. Your recognition is coming.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myAwards.map((award) => {
                const meta = CATEGORY_META[award.category] ?? CATEGORY_META.custom;
                return (
                  <Card key={award._id}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{meta.emoji}</span>
                        <div>
                          <h3 className="font-bold">{award.title}</h3>
                          <p className="text-sm text-muted-foreground">{award.period} {award.year}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
