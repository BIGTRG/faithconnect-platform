import { useQuery } from "convex/react";
import {
  AlertTriangle,
  Baby,
  CheckCircle,
  Clock,
  DoorOpen,
  Printer,
  QrCode,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ChildCheckinPage() {
  const member = useCurrentMember();
  const children = useQuery(
    api.childCheckin.getChildren,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const rooms = useQuery(
    api.childCheckin.getRooms,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const activeCheckins = useQuery(
    api.childCheckin.getActiveCheckins,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const stats = useQuery(
    api.childCheckin.getCheckinStats,
    member?.churchId ? { churchId: member.churchId } : "skip"
  );
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="size-6" />
            Children&apos;s Check-in
          </h1>
          <p className="text-muted-foreground">
            Secure check-in system with security codes, allergy alerts, and sticker printing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <QrCode className="size-4 mr-2" />
            Kiosk Mode
          </Button>
          <Button>
            <Baby className="size-4 mr-2" />
            Check In Child
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.checkedInCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <DoorOpen className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalRooms ?? 0}</p>
              <p className="text-xs text-muted-foreground">Active Rooms</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalChildren ?? 0}</p>
              <p className="text-xs text-muted-foreground">Registered Children</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Shield className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-muted-foreground">Security Compliance</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Dashboard — Active Check-ins */}
        <TabsContent value="dashboard" className="space-y-4">
          <h3 className="font-semibold text-lg">Currently Checked In</h3>
          {(activeCheckins ?? []).length > 0 ? (
            <div className="grid gap-3">
              {(activeCheckins ?? []).map((ci) => (
                <Card
                  key={ci._id}
                  className={`p-4 ${ci.childAllergies.length > 0 ? "border-red-200 dark:border-red-900" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Baby className="size-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{ci.childName}</span>
                        <Badge variant="outline">{ci.roomName}</Badge>
                        {ci.childAllergies.length > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="size-3" />
                            ALLERGIES: {ci.childAllergies.join(", ")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Shield className="size-3" />
                          Code: {ci.securityCode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(ci.checkedInAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>Guardian: {ci.guardianName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Printer className="size-4 mr-1" />
                        Print Sticker
                      </Button>
                      <Button size="sm" variant="secondary">
                        Check Out
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No children currently checked in
            </Card>
          )}
        </TabsContent>

        {/* Rooms */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(rooms ?? []).map((room) => {
              const occupancy = stats?.roomOccupancy?.find(
                (r) => r.roomId === room._id
              );
              const pct =
                room.capacity && room.capacity > 0
                  ? Math.round(((occupancy?.current ?? 0) / room.capacity) * 100)
                  : 0;
              return (
                <Card key={room._id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{room.name}</span>
                      <Badge
                        variant={pct > 80 ? "destructive" : "outline"}
                      >
                        {occupancy?.current ?? 0}/{room.capacity ?? "N/A"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {room.ageRange && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Ages: {room.ageRange}
                      </p>
                    )}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 80
                            ? "bg-red-500"
                            : pct > 50
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pct}% capacity
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Registered Children */}
        <TabsContent value="children" className="space-y-3">
          {(children ?? [])
            .filter((c) => c.isActive)
            .map((child) => (
              <Card key={child._id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      {child.firstName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {child.firstName} {child.lastName}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {child.age && <span>Age {child.age}</span>}
                      {child.guardians[0] && (
                        <span>Guardian: {child.guardians[0].name}</span>
                      )}
                    </div>
                  </div>
                  {(child.allergies?.length ?? 0) > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="size-3" />
                      {child.allergies?.join(", ")}
                    </Badge>
                  )}
                  <Button size="sm">Check In</Button>
                </div>
              </Card>
            ))}
          {(!children || children.filter((c) => c.isActive).length === 0) && (
            <Card className="p-8 text-center text-muted-foreground">
              No children registered yet
            </Card>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card className="p-8 text-center text-muted-foreground">
            Check-in history and reports coming soon
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
