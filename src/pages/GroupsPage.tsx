import { useQuery, useMutation } from "convex/react";
import { Church, Plus, Users, MapPin, Clock, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryLabels: Record<string, string> = {
  ministry: "Ministry",
  bible_study: "Bible Study",
  small_group: "Small Group",
  youth: "Youth",
  outreach: "Outreach",
  worship: "Worship",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  ministry: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  bible_study: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  small_group: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  youth: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  outreach: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  worship: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function GroupsPage() {
  const groups = useQuery(api.groups.list);
  const joinGroup = useMutation(api.groups.join);
  const leaveGroup = useMutation(api.groups.leave);
  const createGroup = useMutation(api.groups.create);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("small_group");
  const [schedule, setSchedule] = useState("");
  const [location, setLocation] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createGroup({
      name: name.trim(),
      description: description.trim() || undefined,
      category: category as any,
      meetingSchedule: schedule.trim() || undefined,
      meetingLocation: location.trim() || undefined,
    });
    toast.success("Group created!");
    setOpen(false);
    setName("");
    setDescription("");
    setSchedule("");
    setLocation("");
  };

  const handleJoin = async (groupId: any) => {
    await joinGroup({ groupId });
    toast.success("Joined group!");
  };

  const handleLeave = async (groupId: any) => {
    await leaveGroup({ groupId });
    toast.success("Left group");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Church className="size-6" />
            Community Groups
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect, grow, and serve together
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Group</DialogTitle>
              <DialogDescription>
                Start a ministry, Bible study, or small group for your church community.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Young Adults Bible Study" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this group about?" />
              </div>
              <div>
                <Label>Meeting Schedule</Label>
                <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="e.g., Wednesdays at 7 PM" />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Fellowship Hall" />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!name.trim()}>
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups?.map((g: any) => (
          <Card key={g._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <Badge className={`text-xs border-0 ${categoryColors[g.category] ?? ""}`}>
                  {categoryLabels[g.category] ?? g.category}
                </Badge>
                {g.isPrivate && (
                  <Badge variant="secondary" className="text-[10px]">Private</Badge>
                )}
              </div>
              <CardTitle className="text-lg mt-2">{g.name}</CardTitle>
              {g.description && (
                <CardDescription className="line-clamp-2">{g.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Users className="size-4" />
                  {g.memberCount} member{g.memberCount !== 1 ? "s" : ""} -- Led by {g.leaderName}
                </span>
                {g.meetingSchedule && (
                  <span className="flex items-center gap-2">
                    <Clock className="size-4" />
                    {g.meetingSchedule}
                  </span>
                )}
                {g.meetingLocation && (
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {g.meetingLocation}
                  </span>
                )}
              </div>

              {g.isMember ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleLeave(g._id)}
                >
                  <LogOut className="size-4 mr-2" />
                  Leave Group
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleJoin(g._id)}
                >
                  <LogIn className="size-4 mr-2" />
                  Join Group
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {groups?.length === 0 && (
        <div className="text-center py-12">
          <Church className="size-12 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground mt-2">No groups yet. Create the first one!</p>
        </div>
      )}
    </div>
  );
}
