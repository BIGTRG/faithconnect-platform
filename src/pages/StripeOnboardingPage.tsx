import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  Loader2,
  PieChart,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STEPS = [
  { id: "business_info", label: "Church Info", icon: Building2 },
  { id: "bank_info", label: "Bank Account", icon: Banknote },
  { id: "revenue_sharing", label: "Revenue Sharing", icon: PieChart },
  { id: "review_submit", label: "Review & Submit", icon: Shield },
];

export function StripeOnboardingPage() {
  const member = useCurrentMember();
  const onboardingStatus = useQuery(
    api.stripeOnboarding.getOnboardingStatus,
    member?.churchId ? { churchId: member.churchId } : "skip",
  );
  const revenueProjections = useQuery(
    api.stripeOnboarding.getRevenueProjections,
    member?.churchId ? { churchId: member.churchId } : "skip",
  );
  const startOnboarding = useMutation(api.stripeOnboarding.startOnboarding);
  const updateBank = useMutation(api.stripeOnboarding.updateBankInfo);
  const configureRevenue = useMutation(api.stripeOnboarding.configureRevenueSharing);
  const submitForReview = useMutation(api.stripeOnboarding.submitForReview);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessType: "non_profit",
    contactEmail: "",
    contactPhone: "",
    bankName: "",
    bankLast4: "",
    bookPercent: 50,
    storePercent: 20,
    marketplacePercent: 20,
  });

  if (!member) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const status = onboardingStatus as any;
  const isActive = status?.status === "active";
  const completedSteps = status?.completedSteps ?? [];

  if (isActive) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="size-7 text-indigo-600" />
            Payment Processing
          </h1>
          <p className="text-muted-foreground mt-1">
            Powered by Stripe Connect with TRGPay overlay
          </p>
        </div>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                <BadgeCheck className="size-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Payments Active</h3>
                <p className="text-sm text-green-600">
                  Stripe Connect account verified and accepting payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Account ID</p>
              <p className="font-mono text-sm mt-1">{status.stripeAccountId ?? "acct_..."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Bank</p>
              <p className="font-semibold mt-1">
                {status.bankName ?? "Connected"} ****{status.bankLast4 ?? ""}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Payouts</p>
              <p className="font-semibold text-green-600 mt-1">Enabled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Processing Fee</p>
              <p className="font-semibold mt-1">2.9% + $0.30</p>
            </CardContent>
          </Card>
        </div>

        {revenueProjections && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Revenue Sharing Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RevenueCard
                title="Bookstore"
                data={revenueProjections.bookstore}
                color="indigo"
              />
              <RevenueCard
                title="Church Store & Services"
                data={revenueProjections.store}
                color="amber"
              />
              <RevenueCard
                title="Marketplace"
                data={revenueProjections.marketplace}
                color="emerald"
              />
            </div>
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Merchant Processing Fees</p>
                    <p className="text-sm text-muted-foreground">
                      {revenueProjections.merchantProcessing.note}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-400">$0</p>
                    <p className="text-xs text-muted-foreground">Church share</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  async function handleStep1() {
    if (!member?.churchId) return;
    setLoading(true);
    try {
      await startOnboarding({
        churchId: member.churchId,
        businessType: formData.businessType,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      });
      setCurrentStep(1);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleStep2() {
    if (!member?.churchId) return;
    setLoading(true);
    try {
      await updateBank({
        churchId: member.churchId,
        bankLast4: formData.bankLast4,
        bankName: formData.bankName,
      });
      setCurrentStep(2);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleStep3() {
    if (!member?.churchId) return;
    setLoading(true);
    try {
      await configureRevenue({
        churchId: member.churchId,
        revenueShareBookPercent: formData.bookPercent,
        revenueShareStorePercent: formData.storePercent,
        revenueShareMarketplacePercent: formData.marketplacePercent,
      });
      setCurrentStep(3);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!member?.churchId) return;
    setLoading(true);
    try {
      await submitForReview({ churchId: member.churchId });
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="size-7 text-indigo-600" />
          Stripe Connect Setup
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect your church to accept payments via TRGPay with Stripe
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = completedSteps.includes(step.id) || idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isDone
                    ? "bg-green-50 border-green-200 text-green-700"
                    : isCurrent
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "bg-muted/30 border-border text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4 text-green-600" />
                ) : (
                  <Icon className="size-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Church Information</CardTitle>
            <CardDescription>
              Basic details about your church for payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Type</Label>
              <Select
                value={formData.businessType}
                onValueChange={(v) => setFormData((p) => ({ ...p, businessType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non_profit">Non-Profit (501c3)</SelectItem>
                  <SelectItem value="religious_org">Religious Organization</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="finance@yourchurch.org"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, contactEmail: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, contactPhone: e.target.value }))
                  }
                />
              </div>
            </div>
            <Button
              onClick={handleStep1}
              disabled={loading || !formData.contactEmail}
              className="w-full mt-4"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="size-4 mr-2" />
              )}
              Continue to Bank Details
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Account</CardTitle>
            <CardDescription>
              Where your church will receive payouts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                placeholder="Chase Bank, Bank of America, etc."
                value={formData.bankName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, bankName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number (last 4 digits)</Label>
              <Input
                placeholder="1234"
                maxLength={4}
                value={formData.bankLast4}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    bankLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Full account details are securely handled by Stripe
              </p>
            </div>
            <Button
              onClick={handleStep2}
              disabled={loading || !formData.bankName || formData.bankLast4.length < 4}
              className="w-full mt-4"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="size-4 mr-2" />
              )}
              Continue to Revenue Sharing
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sharing Configuration</CardTitle>
            <CardDescription>
              Set how revenue is split between your church and the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-indigo-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Book Library</p>
                    <p className="text-xs text-muted-foreground">
                      Faith-based books auto-generated weekly
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-indigo-700">
                      {formData.bookPercent}%
                    </span>
                    <span className="text-xs text-muted-foreground">to church</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  value={formData.bookPercent}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, bookPercent: Number(e.target.value) }))
                  }
                  className="w-full accent-indigo-600"
                />
                <p className="text-xs text-muted-foreground">
                  Example: Book costs $5 to produce, sells for $15. Gross profit = $10. Church
                  earns ${((10 * formData.bookPercent) / 100).toFixed(2)} per book.
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Church Store & Services</p>
                    <p className="text-xs text-muted-foreground">
                      Merchandise, event tickets, paid services
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-700">
                      {formData.storePercent}%
                    </span>
                    <span className="text-xs text-muted-foreground">to church</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={formData.storePercent}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, storePercent: Number(e.target.value) }))
                  }
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="p-4 rounded-lg border bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketplace</p>
                    <p className="text-xs text-muted-foreground">
                      Expert Q&A, therapy, professional services
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-700">
                      {formData.marketplacePercent}%
                    </span>
                    <span className="text-xs text-muted-foreground">to church</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={formData.marketplacePercent}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, marketplacePercent: Number(e.target.value) }))
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="p-4 rounded-lg border bg-slate-50 space-y-1">
                <p className="font-medium">Merchant Processing Fees</p>
                <p className="text-sm text-muted-foreground">
                  Church receives $0 from processing fees. All payment processing fees (2.9% +
                  $0.30 per transaction) are retained by TRGPay/Stripe.
                </p>
              </div>
            </div>

            <Button onClick={handleStep3} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="size-4 mr-2" />
              )}
              Continue to Review
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>
              Confirm your settings before activating payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Organization
                </p>
                <p className="font-medium capitalize">
                  {formData.businessType.replace("_", " ")}
                </p>
              </div>
              <div className="p-4 rounded-lg border space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Contact
                </p>
                <p className="font-medium">{formData.contactEmail || "Not set"}</p>
              </div>
              <div className="p-4 rounded-lg border space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Bank Account
                </p>
                <p className="font-medium">
                  {formData.bankName} ****{formData.bankLast4}
                </p>
              </div>
              <div className="p-4 rounded-lg border space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Revenue Split
                </p>
                <p className="font-medium text-sm">
                  Books {formData.bookPercent}% | Store {formData.storePercent}% | Market{" "}
                  {formData.marketplacePercent}%
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm">
              <p className="font-medium text-amber-800">Before you submit:</p>
              <ul className="mt-1 text-amber-700 space-y-1 list-disc list-inside">
                <li>Stripe will verify your church's identity and bank details</li>
                <li>Payouts are deposited on a 2-day rolling basis</li>
                <li>Revenue sharing percentages can be adjusted later</li>
                <li>All tithes and offerings go directly to the church (no platform fee on donations)</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <BadgeCheck className="size-4 mr-2" />
              )}
              Activate Payment Processing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RevenueCard({
  title,
  data,
  color,
}: {
  title: string;
  data: { monthlyGross: number; costOfGoods: number; grossProfit: number; churchShare: number; platformShare: number; sharePercent: number };
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-200",
    amber: "bg-amber-50 border-amber-200",
    emerald: "bg-emerald-50 border-emerald-200",
  };
  const textClasses: Record<string, string> = {
    indigo: "text-indigo-700",
    amber: "text-amber-700",
    emerald: "text-emerald-700",
  };

  return (
    <Card className={colorClasses[color] ?? ""}>
      <CardContent className="pt-6 space-y-3">
        <p className="font-semibold">{title}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly Gross</span>
            <span>${data.monthlyGross.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost of Goods</span>
            <span>-${data.costOfGoods.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="text-muted-foreground">Gross Profit</span>
            <span className="font-medium">${data.grossProfit.toLocaleString()}</span>
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Church Earns ({data.sharePercent}%)</span>
            <span className={`text-lg font-bold ${textClasses[color] ?? ""}`}>
              <DollarSign className="size-4 inline" />
              {data.churchShare.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">per month</p>
        </div>
      </CardContent>
    </Card>
  );
}
