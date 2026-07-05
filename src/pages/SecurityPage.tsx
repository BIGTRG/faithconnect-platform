import { useQuery, useMutation } from "convex/react";
import {
  Shield, User, Lock, Mail, Phone, Key, UserCog, CheckCircle, AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentMember } from "@/hooks/useCurrentMember";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  pastor: "Pastor",
  associate_pastor: "Associate Pastor",
  elder: "Elder",
  deacon: "Deacon",
  leader: "Leader",
  volunteer: "Volunteer",
  member: "Member",
  visitor: "Visitor",
};

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800",
  admin: "bg-purple-100 text-purple-800",
  pastor: "bg-indigo-100 text-indigo-800",
  associate_pastor: "bg-blue-100 text-blue-800",
  elder: "bg-cyan-100 text-cyan-800",
  deacon: "bg-teal-100 text-teal-800",
  leader: "bg-green-100 text-green-800",
  volunteer: "bg-amber-100 text-amber-800",
  member: "bg-gray-100 text-gray-800",
  visitor: "bg-gray-50 text-gray-600",
};

export function SecurityPage() {
  const member = useCurrentMember();
  const roleInfo = useQuery(api.authHardening.getMyRole);
  const securityLog = useQuery(api.authHardening.getSecurityLog) as any;
  const updateProfile = useMutation(api.authHardening.updateProfile);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [editMode, setEditMode] = useState(false);

  const startEdit = () => {
    if (member) {
      setName(member.displayName ?? "");
      setPhone(member.phone ?? "");
      setBio(member.bio ?? "");
      setEmail((member as any).email ?? "");
    }
    setEditMode(true);
  };

  const saveProfile = async () => {
    await updateProfile({
      name: name || undefined,
      phone: phone || undefined,
      bio: bio || undefined,
      email: email || undefined,
    });
    toast.success("Profile updated");
    setEditMode(false);
  };

  const permissions = roleInfo?.permissions;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="size-6" /> Account Security
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile, security, and permissions</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile"><User className="size-4 mr-1" />Profile</TabsTrigger>
          <TabsTrigger value="security"><Lock className="size-4 mr-1" />Security</TabsTrigger>
          <TabsTrigger value="permissions"><UserCog className="size-4 mr-1" />Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your profile details visible to church members</CardDescription>
                </div>
                {!editMode ? (
                  <Button variant="outline" size="sm" onClick={startEdit}>Edit Profile</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>Cancel</Button>
                    <Button size="sm" onClick={saveProfile}>Save</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
                    <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                  </div>
                  <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 border-b">
                    <User className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{member?.displayName ?? "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b">
                    <Mail className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{(member as any)?.email ?? "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b">
                    <Phone className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{member?.phone ?? "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <Key className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <Badge className={`${roleBadgeColors[member?.role ?? "member"] ?? ""} border-0`}>
                        {roleLabels[member?.role ?? "member"] ?? member?.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password & Authentication</CardTitle>
              <CardDescription>Manage your login credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <Lock className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">Last changed: Unknown</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <Shield className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-amber-600">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Verification</p>
                    <p className="text-xs text-muted-foreground">Verify your email address</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-0 flex items-center gap-1">
                  <CheckCircle className="size-3" />Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>Recent login information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <Badge className={`border-0 ${securityLog?.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {securityLog?.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Account Created</span>
                  <span className="text-sm">{securityLog?.joinedAt ? new Date(securityLog.joinedAt).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Last Active</span>
                  <span className="text-sm">{securityLog?.lastActiveAt ? new Date(securityLog.lastActiveAt).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="text-sm">{roleLabels[securityLog?.role ?? "member"] ?? securityLog?.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Permissions</CardTitle>
              <CardDescription>Based on your role: {roleLabels[roleInfo?.role ?? "member"] ?? roleInfo?.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {permissions && Object.entries(permissions).map(([key, value]) => {
                  if (key === "isSuperAdmin") return null;
                  const label = key.replace(/^can/, "").replace(/([A-Z])/g, " $1").trim();
                  return (
                    <div key={key} className="flex items-center gap-2 py-1.5">
                      {value ? (
                        <CheckCircle className="size-4 text-green-500" />
                      ) : (
                        <AlertCircle className="size-4 text-gray-300" />
                      )}
                      <span className={`text-sm ${value ? "" : "text-muted-foreground"}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
              {roleInfo?.isSuperAdmin && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                    <Shield className="size-4" />Platform Super Admin
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">Full access to all platform features and church management.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
