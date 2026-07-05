import { useQuery } from "convex/react";
import {
  Briefcase,
  Calendar,
  Clock,
  HandHelping,
  MapPin,
  Users,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const typeLabels: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  intern: "Intern",
};

const urgencyColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function JobBoardPage() {
  const member = useCurrentMember();
  const jobs = useQuery(
    api.jobBoard.getJobs,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const volunteerNeeds = useQuery(
    api.jobBoard.getVolunteerNeeds,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const [activeTab, setActiveTab] = useState("jobs");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="size-6" />
            Jobs & Volunteering
          </h1>
          <p className="text-muted-foreground">
            Church hiring and volunteer opportunities
          </p>
        </div>
        <Button>
          <Briefcase className="size-4 mr-2" />
          Post Opening
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs">
            <Briefcase className="size-4 mr-1" />
            Jobs ({jobs?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="volunteer">
            <HandHelping className="size-4 mr-1" />
            Volunteer ({volunteerNeeds?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Job Postings */}
        <TabsContent value="jobs" className="space-y-4">
          {(jobs ?? []).map((job) => (
            <Card key={job._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <Badge variant="outline">
                        {typeLabels[job.type] ?? job.type}
                      </Badge>
                    </div>
                    {job.department && (
                      <p className="text-sm text-primary font-medium mb-2">
                        {job.department}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-3">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {job.location}
                        </span>
                      )}
                      {job.salaryRange && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-3" />
                          {job.salaryRange}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Posted {new Date(job.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.requirements.map((req) => (
                          <Badge key={req} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button className="ml-4 flex-shrink-0">Apply</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!jobs || jobs.length === 0) && (
            <Card className="p-8 text-center text-muted-foreground">
              No job openings at this time
            </Card>
          )}
        </TabsContent>

        {/* Volunteer Needs */}
        <TabsContent value="volunteer" className="space-y-4">
          {(volunteerNeeds ?? []).map((need) => (
            <Card key={need._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{need.title}</h3>
                      <Badge
                        className={urgencyColors[need.urgency] ?? ""}
                        variant="secondary"
                      >
                        {need.urgency} priority
                      </Badge>
                    </div>
                    {need.ministry && (
                      <p className="text-sm text-primary font-medium mb-2">
                        {need.ministry}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-3">
                      {need.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {need.spotsFilled}/{need.spotsAvailable} spots filled
                      </span>
                      {need.schedule && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {need.schedule}
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(need.spotsFilled / need.spotsAvailable) * 100}%`,
                        }}
                      />
                    </div>
                    {need.skills && need.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {need.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button className="ml-4 flex-shrink-0">
                    <HandHelping className="size-4 mr-1" />
                    Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!volunteerNeeds || volunteerNeeds.length === 0) && (
            <Card className="p-8 text-center text-muted-foreground">
              No volunteer opportunities at this time
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
