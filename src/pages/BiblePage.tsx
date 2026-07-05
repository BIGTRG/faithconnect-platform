import { useQuery } from "convex/react";
import {
  BookOpen,
  Bookmark,
  Calendar,
  Circle,
  Quote,
  Sparkles,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BiblePage() {
  const member = useCurrentMember();
  const verse = useQuery(
    api.bible.getVerseOfDay,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const plans = useQuery(
    api.bible.getReadingPlans,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const [activeTab, setActiveTab] = useState("verse");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="size-6" />
            Bible Connect
          </h1>
          <p className="text-muted-foreground">King James Version — Read, Reflect, Grow</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="verse">
            <Sun className="size-4 mr-1" />
            Verse of the Day
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Calendar className="size-4 mr-1" />
            Reading Plans
          </TabsTrigger>
          <TabsTrigger value="read">
            <BookOpen className="size-4 mr-1" />
            Read Bible
          </TabsTrigger>
        </TabsList>

        {/* Verse of the Day */}
        <TabsContent value="verse" className="space-y-6">
          {verse ? (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-8">
                <div className="flex items-start gap-3 mb-4">
                  <Quote className="size-8 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <Badge className="bg-amber-600 mb-3">Verse of the Day</Badge>
                    <p className="text-xl leading-relaxed italic text-foreground">
                      &ldquo;{verse.text}&rdquo;
                    </p>
                    <p className="mt-4 font-semibold text-amber-700 dark:text-amber-400">
                      — {verse.reference} (KJV)
                    </p>
                  </div>
                </div>
                {verse.theme && (
                  <Badge variant="outline" className="mt-2">
                    Theme: {verse.theme}
                  </Badge>
                )}
              </div>
              {verse.reflection && (
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-primary" />
                    Today&apos;s Reflection
                  </h3>
                  <p className="text-muted-foreground">{verse.reflection}</p>
                </CardContent>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Loading verse of the day...
            </Card>
          )}

          {/* Quick KJV Passages */}
          <div>
            <h3 className="font-semibold mb-3">Popular KJV Passages</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { ref: "Psalm 23", title: "The Lord is My Shepherd" },
                { ref: "Romans 8:28-39", title: "Nothing Can Separate Us" },
                { ref: "1 Corinthians 13", title: "The Love Chapter" },
                { ref: "Philippians 4:4-13", title: "Rejoice in the Lord" },
                { ref: "Hebrews 11", title: "The Hall of Faith" },
                { ref: "Matthew 5-7", title: "Sermon on the Mount" },
              ].map((p) => (
                <Card
                  key={p.ref}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="size-5 text-primary" />
                    <div>
                      <p className="font-medium">{p.ref}</p>
                      <p className="text-sm text-muted-foreground">{p.title}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Reading Plans */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(plans ?? []).map((plan) => (
              <Card key={plan._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{plan.totalDays} Days</Badge>
                    <Button size="sm">Join Plan</Button>
                  </div>
                  {/* Preview first 5 readings */}
                  <div className="mt-4 space-y-2">
                    {plan.readings.slice(0, 5).map((r) => (
                      <div
                        key={r.day}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Circle className="size-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Day {r.day}: {r.reference}
                        </span>
                      </div>
                    ))}
                    {plan.readings.length > 5 && (
                      <p className="text-xs text-muted-foreground ml-5">
                        + {plan.readings.length - 5} more days
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!plans || plans.length === 0) && (
              <Card className="col-span-full p-8 text-center text-muted-foreground">
                No reading plans available yet
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Bible Reader */}
        <TabsContent value="read" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="size-5" />
              KJV Bible Reader
            </h3>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[
                "Genesis", "Exodus", "Psalms", "Proverbs",
                "Isaiah", "Matthew", "Mark", "Luke",
                "John", "Acts", "Romans", "1 Corinthians",
                "Galatians", "Ephesians", "Philippians", "Hebrews",
                "James", "1 Peter", "1 John", "Revelation",
              ].map((book) => (
                <Button
                  key={book}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                >
                  <BookOpen className="size-4 mr-2 text-primary" />
                  {book}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Full KJV Bible with 66 books. Select a book to start reading.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
