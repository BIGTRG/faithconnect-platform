import { useQuery } from "convex/react";
import {
  BookOpen,
  Mail,
  Phone,
  Play,
  Video,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MeetPastorPage() {
  const profile = useQuery(api.pastor.getProfile);

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Meet the Pastor</h1>
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="size-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Pastor Profile Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The pastor profile is being set up. Check back soon to learn about your
              pastor's journey, watch their intro video, and book a personal meeting.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">What You Will Find Here</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Play className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Video Introduction</p>
                  <p className="text-sm text-muted-foreground">Watch the pastor share their calling and vision</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <BookOpen className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Their Journey</p>
                  <p className="text-sm text-muted-foreground">Read about their path to ministry and life story</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Video className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Book a Video Call</p>
                  <p className="text-sm text-muted-foreground">Schedule a personal one-on-one with the pastor</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Phone className="size-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Direct Contact</p>
                  <p className="text-sm text-muted-foreground">Call or email the pastor directly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Meet the Pastor</h1>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="size-32 rounded-xl bg-primary/20 flex items-center justify-center text-5xl font-bold text-primary shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-1">{profile.title ?? "Senior Pastor"}</p>
              <h2 className="text-3xl font-bold mb-3">{profile.name}</h2>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              {profile.favoriteVerse && (
                <p className="mt-4 italic text-muted-foreground border-l-2 border-primary/30 pl-4">
                  "{profile.favoriteVerse}"
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {profile.journey && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>My Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.journey}</p>
          </CardContent>
        </Card>
      )}

      {profile.videoUrl && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Watch My Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <a href={profile.videoUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg">
                  <Play className="size-5 mr-2" /> Watch Video
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 mt-6">
        {(profile.phone || profile.email) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-primary hover:underline">
                  <Phone className="size-4" /> {profile.phone}
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-primary hover:underline">
                  <Mail className="size-4" /> {profile.email}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {profile.bookingEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Book a Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule a personal video call or in-person meeting with the pastor.
              </p>
              <a href={profile.bookingUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                <Button className="w-full">
                  <Video className="size-4 mr-2" /> Schedule Video Call
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
