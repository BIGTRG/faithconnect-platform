import { useMutation, useQuery } from "convex/react";
import {
  Award,
  BadgeCheck,
  FileCheck,
  Share2,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const TYPE_META: Record<string, { label: string; emoji: string; gradient: string }> = {
  baptism: { label: "Baptism", emoji: "💧", gradient: "from-blue-500/10 to-cyan-500/10" },
  membership: { label: "Membership", emoji: "🏠", gradient: "from-indigo-500/10 to-purple-500/10" },
  bible_study: { label: "Bible Study", emoji: "📖", gradient: "from-amber-500/10 to-orange-500/10" },
  volunteer_milestone: { label: "Volunteer Milestone", emoji: "🤝", gradient: "from-green-500/10 to-emerald-500/10" },
  leadership: { label: "Leadership", emoji: "⭐", gradient: "from-yellow-500/10 to-amber-500/10" },
  missions: { label: "Missions", emoji: "🌍", gradient: "from-teal-500/10 to-cyan-500/10" },
  custom: { label: "Special", emoji: "🏅", gradient: "from-rose-500/10 to-pink-500/10" },
};

export function CertificatesPage() {
  const myCerts = useQuery(api.certificates.listMy);
  const allCerts = useQuery(api.certificates.listAll, {});
  const toggleShare = useMutation(api.certificates.toggleShare);

  async function handleToggleShare(id: string) {
    await toggleShare({ id: id as any });
    toast.success("Share status updated");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <FileCheck className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Digital Certificates</h1>
      </div>
      <p className="text-muted-foreground mb-6">Your faith milestones, officially recognized and shareable</p>

      <Tabs defaultValue="my" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="my">My Certificates</TabsTrigger>
          <TabsTrigger value="all">Church Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          {(!myCerts || myCerts.length === 0) ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Award className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Certificates are issued by your church for baptism, membership, Bible study completion,
                  volunteer milestones, and leadership training. Keep growing in your faith journey.
                </p>
                <div className="grid gap-3 sm:grid-cols-3 mt-8 max-w-lg mx-auto">
                  {["baptism", "membership", "bible_study"].map((type) => {
                    const meta = TYPE_META[type];
                    return (
                      <div key={type} className={`p-4 rounded-lg bg-gradient-to-br ${meta.gradient} text-center`}>
                        <span className="text-3xl">{meta.emoji}</span>
                        <p className="text-sm font-medium mt-2">{meta.label}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myCerts.map((cert) => {
                const meta = TYPE_META[cert.type] ?? TYPE_META.custom;
                return (
                  <Card key={cert._id} className="overflow-hidden">
                    <div className={`bg-gradient-to-br ${meta.gradient} p-6 text-center`}>
                      <span className="text-4xl">{meta.emoji}</span>
                      <h3 className="text-lg font-bold mt-3">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{meta.label}</p>
                    </div>
                    <CardContent className="py-4">
                      {cert.description && <p className="text-sm text-muted-foreground mb-2">{cert.description}</p>}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                        <span className="font-mono">{cert.certificateNumber}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggleShare(cert._id)}>
                          <Share2 className="size-3 mr-1" /> {cert.isShared ? "Unshare" : "Share"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {(!allCerts || allCerts.length === 0) ? (
            <Card>
              <CardContent className="py-16 text-center">
                <BadgeCheck className="size-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Church Certificates Issued Yet</h3>
                <p className="text-muted-foreground">Church administrators can issue certificates to members.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {allCerts.map((cert) => {
                const meta = TYPE_META[cert.type] ?? TYPE_META.custom;
                return (
                  <Card key={cert._id}>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{meta.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cert.title}</p>
                          <p className="text-xs text-muted-foreground">{meta.label} · {new Date(cert.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{cert.certificateNumber}</span>
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
