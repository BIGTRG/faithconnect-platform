import { useMutation, useQuery } from "convex/react";
import {
  Disc3,
  ListMusic,
  Music,
  Music2,
  Plus,
  Radio,
  Send,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function WorshipRadioPage() {
  const tracks = useQuery(api.worshipRadio.listTracks);
  const requests = useQuery(api.worshipRadio.listRequests);
  const requestSong = useMutation(api.worshipRadio.requestSong);
  const addTrack = useMutation(api.worshipRadio.addTrack);

  const [reqOpen, setReqOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ trackTitle: "", artistName: "", message: "" });
  const [addForm, setAddForm] = useState({ title: "", artist: "", album: "", genre: "" });

  async function handleRequest() {
    if (!reqForm.trackTitle || !reqForm.artistName) return;
    await requestSong({
      trackTitle: reqForm.trackTitle,
      artistName: reqForm.artistName,
      message: reqForm.message || undefined,
    });
    setReqForm({ trackTitle: "", artistName: "", message: "" });
    setReqOpen(false);
    toast.success("Song requested");
  }

  async function handleAdd() {
    if (!addForm.title || !addForm.artist) return;
    await addTrack({
      title: addForm.title,
      artist: addForm.artist,
      album: addForm.album || undefined,
      genre: addForm.genre || undefined,
    });
    setAddForm({ title: "", artist: "", album: "", genre: "" });
    setAddOpen(false);
    toast.success("Track added to playlist");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Radio className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Worship Radio</h1>
      </div>
      <p className="text-muted-foreground mb-6">24/7 worship music curated by your church</p>

      <Card className="mb-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardContent className="py-8">
          <div className="flex items-center gap-6">
            <div className="size-24 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
              <Disc3 className="size-12 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Now Playing</p>
              <h3 className="text-2xl font-bold">
                {tracks && tracks.length > 0 ? tracks[0].title : "Worship Station Starting..."}
              </h3>
              <p className="text-muted-foreground">
                {tracks && tracks.length > 0 ? tracks[0].artist : "Preparing your worship experience"}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="playlist" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="playlist">Playlist</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="playlist">
          <div className="flex justify-end mb-4 gap-2">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="size-4 mr-2" /> Add Track</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add to Playlist</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Song Title</Label><Input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} /></div>
                  <div><Label>Artist</Label><Input value={addForm.artist} onChange={(e) => setAddForm({ ...addForm, artist: e.target.value })} /></div>
                  <div><Label>Album (optional)</Label><Input value={addForm.album} onChange={(e) => setAddForm({ ...addForm, album: e.target.value })} /></div>
                  <div><Label>Genre (optional)</Label><Input value={addForm.genre} onChange={(e) => setAddForm({ ...addForm, genre: e.target.value })} /></div>
                  <Button onClick={handleAdd} className="w-full">Add Track</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={reqOpen} onOpenChange={setReqOpen}>
              <DialogTrigger asChild>
                <Button><Send className="size-4 mr-2" /> Request Song</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request a Song</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div><Label>Song Title</Label><Input value={reqForm.trackTitle} onChange={(e) => setReqForm({ ...reqForm, trackTitle: e.target.value })} /></div>
                  <div><Label>Artist</Label><Input value={reqForm.artistName} onChange={(e) => setReqForm({ ...reqForm, artistName: e.target.value })} /></div>
                  <div><Label>Message (optional)</Label><Textarea value={reqForm.message} onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })} placeholder="Why this song is special to you..." rows={2} /></div>
                  <Button onClick={handleRequest} className="w-full">Submit Request</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(!tracks || tracks.length === 0) ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Music className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Playlist is Empty</h3>
                <p className="text-muted-foreground">Add worship songs to build your church's radio station.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, i) => (
                <Card key={track._id}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-muted-foreground w-6 text-right">{i + 1}</span>
                      <Music2 className="size-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}{track.album ? ` — ${track.album}` : ""}</p>
                      </div>
                      {track.genre && <span className="text-xs bg-muted px-2 py-1 rounded">{track.genre}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {(!requests || requests.length === 0) ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ListMusic className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Requests Yet</h3>
                <p className="text-muted-foreground">Be the first to request a worship song.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req._id}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                      <Music className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{req.trackTitle} <span className="text-muted-foreground font-normal">by {req.artistName}</span></p>
                        {req.message && <p className="text-sm text-muted-foreground italic mt-0.5">"{req.message}"</p>}
                        <p className="text-xs text-muted-foreground mt-1">Requested by {req.memberName}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${req.status === "played" ? "bg-green-100 text-green-700" : req.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-muted"}`}>
                        {req.status}
                      </span>
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
