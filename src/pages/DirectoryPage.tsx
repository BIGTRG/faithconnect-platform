import { useQuery } from "convex/react";
import { Search, Users, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  pastor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  leader: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  member: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  visitor: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function DirectoryPage() {
  const members = useQuery(api.members.listMembers, {});
  const [search, setSearch] = useState("");

  const filtered = members?.filter(
    (m: any) =>
      m.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      (m.skills ?? []).some((s: string) => s.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="size-6" />
            Member Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {members?.length ?? 0} active members
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search members, roles, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered?.map((m: any) => (
          <Card key={m._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {m.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{m.displayName}</h3>
                    <Badge
                      className={`text-[10px] px-1.5 py-0 border-0 capitalize ${roleColors[m.role] ?? ""}`}
                    >
                      {m.role}
                    </Badge>
                  </div>
                  {m.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {m.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {m.phone && (
                      <a
                        href={`tel:${m.phone}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                        title={`Call ${m.displayName}`}
                      >
                        <Phone className="size-3" /> {m.phone}
                      </a>
                    )}
                    {m.address && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3" /> {m.address}
                      </span>
                    )}
                  </div>
                  {m.skills && m.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.skills.slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                      {m.skills.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{m.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered?.length === 0 && (
        <div className="text-center py-12">
          <Users className="size-12 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground mt-2">
            {search ? "No members match your search." : "No members yet."}
          </p>
        </div>
      )}
    </div>
  );
}
