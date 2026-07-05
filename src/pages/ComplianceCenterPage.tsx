import { useQuery } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
  Shield,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "HIPAA Compliance": ShieldCheck,
  "Data Privacy": Lock,
  "Data Privacy (CCPA/GDPR)": Lock,
  "Payment Security": FileText,
  "Payment Security (PCI DSS)": FileText,
  "Application Security": Shield,
  "Infrastructure Security": Shield,
};

const CATEGORY_COLORS: Record<string, string> = {
  "HIPAA Compliance": "indigo",
  "Data Privacy": "emerald",
  "Data Privacy (CCPA/GDPR)": "emerald",
  "Payment Security": "amber",
  "Payment Security (PCI DSS)": "amber",
  "Application Security": "rose",
  "Infrastructure Security": "blue",
};

export function ComplianceCenterPage() {
  const member = useCurrentMember();
  const compliance = useQuery(
    api.complianceCenter.getComplianceStatus,
    member?.churchId ? { churchId: member.churchId } : "skip",
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (!member) return null;
  if (member.role !== "admin" && member.role !== "pastor") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Shield className="size-12 mx-auto text-muted-foreground/30" />
          <h2 className="text-lg font-semibold">Access Restricted</h2>
          <p className="text-sm text-muted-foreground">
            Compliance center is only accessible to administrators and pastors.
          </p>
        </div>
      </div>
    );
  }

  if (!compliance)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin size-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );

  const scoreColor =
    compliance.overallScore >= 90
      ? "text-emerald-600"
      : compliance.overallScore >= 70
        ? "text-amber-600"
        : "text-red-600";
  const scoreBg =
    compliance.overallScore >= 90
      ? "bg-emerald-50 border-emerald-200"
      : compliance.overallScore >= 70
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="size-7 text-indigo-600" />
          Compliance Center
        </h1>
        <p className="text-muted-foreground mt-1">
          HIPAA, privacy, payment security, and application compliance status
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`border ${scoreBg}`}>
          <CardContent className="pt-6 text-center">
            <p className={`text-4xl font-bold ${scoreColor}`}>
              {compliance.overallScore}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Compliance Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="size-5 text-emerald-500" />
              <p className="text-3xl font-bold text-emerald-600">{compliance.passed}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-1">
              <AlertTriangle className="size-5 text-amber-500" />
              <p className="text-3xl font-bold text-amber-600">{compliance.warnings}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="size-5 text-red-500" />
              <p className="text-3xl font-bold text-red-600">{compliance.failed}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Ring Visual */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative size-32 shrink-0">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${compliance.overallScore * 2.51} 251`}
                  strokeLinecap="round"
                  className={scoreColor}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${scoreColor}`}>
                  {compliance.overallScore}%
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">Compliance Assessment Summary</h3>
              <p className="text-sm text-muted-foreground">
                {compliance.overallScore >= 90
                  ? "Your platform meets or exceeds compliance standards across all major categories. Continue monitoring for changes in regulatory requirements."
                  : compliance.overallScore >= 70
                    ? "Most compliance requirements are met. Address the warnings and failed checks before onboarding enterprise churches."
                    : "Significant compliance gaps detected. Address critical and failed items immediately before processing any health or payment data."}
              </p>
              <p className="text-xs text-muted-foreground">
                Last assessed:{" "}
                {new Date(compliance.lastAssessment).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="space-y-4">
        {Object.entries(
          compliance.categories as Record<
            string,
            Array<{
              name: string;
              status: string;
              description: string;
              recommendation?: string;
            }>
          >,
        ).map(([category, checks]) => {
          const Icon = CATEGORY_ICONS[category] ?? Shield;
          const color = CATEGORY_COLORS[category] ?? "slate";
          const passed = checks.filter((c) => c.status === "passed").length;
          const isExpanded = expandedCategory === category;
          const catPct = Math.round((passed / checks.length) * 100);

          const bgMap: Record<string, string> = {
            indigo: "bg-indigo-50",
            emerald: "bg-emerald-50",
            amber: "bg-amber-50",
            rose: "bg-rose-50",
            blue: "bg-blue-50",
          };
          const textMap: Record<string, string> = {
            indigo: "text-indigo-600",
            emerald: "text-emerald-600",
            amber: "text-amber-600",
            rose: "text-rose-600",
            blue: "text-blue-600",
          };

          return (
            <Card key={category}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg"
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-lg ${bgMap[color] ?? "bg-slate-50"} flex items-center justify-center`}
                    >
                      <Icon className={`size-5 ${textMap[color] ?? ""}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category}</CardTitle>
                      <CardDescription>
                        {passed}/{checks.length} checks passed
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          catPct === 100
                            ? "bg-emerald-500"
                            : catPct >= 80
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">
                      {catPct}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent>
                  <div className="space-y-3">
                    {checks.map((check) => (
                      <div
                        key={check.name}
                        className={`p-3 rounded-lg border ${
                          check.status === "passed"
                            ? "bg-emerald-50/50 border-emerald-100"
                            : check.status === "warning"
                              ? "bg-amber-50/50 border-amber-100"
                              : check.status === "failed"
                                ? "bg-red-50/50 border-red-100"
                                : "bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {check.status === "passed" ? (
                            <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                          ) : check.status === "warning" ? (
                            <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                          ) : check.status === "failed" ? (
                            <XCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
                          ) : (
                            <Shield className="size-4 text-slate-400 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{check.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {check.description}
                            </p>
                            {check.recommendation && (
                              <div className="mt-2 p-2 rounded bg-white/80 border text-xs">
                                <span className="font-medium">Recommendation: </span>
                                {check.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* HIPAA Notice */}
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="size-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium">HIPAA Compliance Notice</p>
              <p className="text-muted-foreground">
                FaithConnect processes protected health information (PHI) through the
                Therapist, Mental Health, and Medical Directory features. The platform
                implements administrative, physical, and technical safeguards as required by
                the HIPAA Security Rule. All PHI is encrypted at rest and in transit, access
                is role-restricted, and all access events are logged in the audit trail.
              </p>
              <p className="text-muted-foreground">
                Churches using health-related features should ensure they have executed a
                Business Associate Agreement (BAA) with FaithConnect and any third-party
                service providers. The platform does not share PHI with any party except as
                directed by the church administrator.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                <FileText className="size-3 mr-1" />
                Download HIPAA Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComplianceCenterPage;
