import { useQuery, useMutation } from "convex/react";
import { Heart, Sparkles, UserPlus, MessageCircle } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function FaithMatchPage() {
  const myProfile = useQuery(api.dating.getMyProfile);
  const profiles = useQuery(api.dating.browseProfiles);
  const matches = useQuery(api.dating.getMatches);
  const createOrUpdateProfile = useMutation(api.dating.createOrUpdateProfile);
  const likeProfile = useMutation(api.dating.likeProfile);

  const [open, setOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [favoriteVerse, setFavoriteVerse] = useState("");
  const [hobbiesText, setHobbiesText] = useState("");
  const [churchInvolvement, setChurchInvolvement] = useState("");

  const hasProfile = myProfile && !myProfile.noProfile;

  const handleCreateProfile = async () => {
    await createOrUpdateProfile({
      headline,
      aboutMe,
      lookingFor,
      favoriteVerse,
      hobbies: hobbiesText ? hobbiesText.split(",").map((h) => h.trim()) : undefined,
      churchInvolvement,
      isVisible: true,
    });
    setOpen(false);
    toast.success("Profile saved");
  };

  const handleLike = async (profileId: any) => {
    const result = await likeProfile({ profileId });
    if (result.isMatch) {
      toast.success("It's a match! You can now connect.");
    } else {
      toast.success("Interest sent");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="size-6 text-pink-500" />
            FaithMatch
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Meet fellow believers in your church community
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="size-4 mr-2" />
              {hasProfile ? "Edit Profile" : "Create Profile"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{hasProfile ? "Edit" : "Create"} Your Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Headline</Label>
                <Input
                  placeholder="e.g. Faith-driven and family-oriented"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
              <div>
                <Label>About Me</Label>
                <Textarea
                  placeholder="Share a bit about yourself..."
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>What I'm Looking For</Label>
                <Textarea
                  placeholder="What qualities matter to you?"
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label>Favorite Bible Verse</Label>
                <Input
                  placeholder="e.g. Proverbs 31:10"
                  value={favoriteVerse}
                  onChange={(e) => setFavoriteVerse(e.target.value)}
                />
              </div>
              <div>
                <Label>Hobbies (comma-separated)</Label>
                <Input
                  placeholder="e.g. Hiking, Cooking, Worship music"
                  value={hobbiesText}
                  onChange={(e) => setHobbiesText(e.target.value)}
                />
              </div>
              <div>
                <Label>Church Involvement</Label>
                <Input
                  placeholder="e.g. Worship team, Youth leader"
                  value={churchInvolvement}
                  onChange={(e) => setChurchInvolvement(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateProfile} className="w-full">
                Save Profile
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!hasProfile && (
        <Card className="border-dashed border-pink-300 bg-pink-50/50 dark:bg-pink-950/20">
          <CardContent className="p-6 text-center">
            <Heart className="size-12 text-pink-400 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">Welcome to FaithMatch</h3>
            <p className="text-muted-foreground mt-1">
              Create your profile to start connecting with other singles in the church community.
            </p>
            <Button onClick={() => setOpen(true)} className="mt-4" variant="outline">
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">
            <Sparkles className="size-4 mr-1" /> Browse
          </TabsTrigger>
          <TabsTrigger value="matches">
            <Heart className="size-4 mr-1" /> Matches ({matches?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {profiles?.map((p: any) => (
              <Card key={p._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-14">
                      <AvatarFallback className="bg-pink-100 text-pink-600 font-semibold text-xl">
                        {p.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{p.displayName}</h3>
                      {p.headline && (
                        <p className="text-sm text-muted-foreground italic">"{p.headline}"</p>
                      )}
                      {p.aboutMe && (
                        <p className="text-sm mt-1 line-clamp-2">{p.aboutMe}</p>
                      )}
                      {p.favoriteVerse && (
                        <p className="text-xs text-primary mt-1">{p.favoriteVerse}</p>
                      )}
                      {p.hobbies && p.hobbies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.hobbies.slice(0, 4).map((h: string) => (
                            <Badge key={h} variant="secondary" className="text-[10px]">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-3">
                        {p.isMatch ? (
                          <Badge className="bg-pink-500 text-white">Matched</Badge>
                        ) : p.hasLiked ? (
                          <Badge variant="outline" className="text-pink-500 border-pink-300">
                            Interest Sent
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-pink-600 border-pink-300 hover:bg-pink-50"
                            onClick={() => handleLike(p._id)}
                            disabled={!hasProfile}
                          >
                            <Heart className="size-3 mr-1" /> Interested
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {profiles?.length === 0 && (
            <div className="text-center py-12">
              <Heart className="size-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No profiles to browse yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          <div className="space-y-3">
            {matches?.map((m: any) => (
              <Card key={m._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-pink-100 text-pink-600 font-semibold text-lg">
                        {m.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{m.displayName}</CardTitle>
                      {m.headline && (
                        <p className="text-sm text-muted-foreground">{m.headline}</p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto">
                      <MessageCircle className="size-4 mr-1" /> Message
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {m.aboutMe && <p className="text-sm">{m.aboutMe}</p>}
                  {m.churchInvolvement && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Involved in: {m.churchInvolvement}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {matches?.length === 0 && (
            <div className="text-center py-12">
              <Heart className="size-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground mt-2">No matches yet. Keep browsing!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
