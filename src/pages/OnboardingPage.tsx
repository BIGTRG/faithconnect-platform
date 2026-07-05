import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Church,
  User,
  Palette,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Clock,
} from "lucide-react";

const STEPS = [
  { label: "Church Info", icon: Church },
  { label: "Admin Setup", icon: User },
  { label: "Customize", icon: Palette },
  { label: "Launch", icon: CheckCircle },
];

const DENOMINATIONS = [
  "Non-Denominational",
  "Baptist",
  "Methodist",
  "Pentecostal",
  "Catholic",
  "Lutheran",
  "Presbyterian",
  "Episcopal",
  "Church of God in Christ (COGIC)",
  "AME",
  "Assemblies of God",
  "Church of Christ",
  "Seventh-day Adventist",
  "Other",
];

const COLORS = [
  { name: "Indigo", primary: "#4338ca", accent: "#d97706" },
  { name: "Slate Blue", primary: "#475569", accent: "#f59e0b" },
  { name: "Royal Purple", primary: "#7c3aed", accent: "#f97316" },
  { name: "Crimson", primary: "#dc2626", accent: "#1d4ed8" },
  { name: "Forest", primary: "#16a34a", accent: "#9333ea" },
  { name: "Navy", primary: "#1e3a5f", accent: "#eab308" },
  { name: "Burgundy", primary: "#881337", accent: "#d4a373" },
  { name: "Teal", primary: "#0d9488", accent: "#e11d48" },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const createChurch = useMutation(api.onboarding.createChurch);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    denomination: "",
    city: "",
    state: "",
    address: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    pastorName: "",
    serviceSchedule: "",
    description: "",
    memberCount: "",
    primaryColor: "#4338ca",
    accentColor: "#d97706",
    adminDisplayName: "",
    adminPhone: "",
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const canNext =
    step === 0
      ? form.name.trim().length > 0
      : step === 1
        ? form.adminDisplayName.trim().length > 0
        : true;

  async function handleCreate() {
    setLoading(true);
    try {
      await createChurch({
        name: form.name,
        denomination: form.denomination || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        address: form.address || undefined,
        zipCode: form.zipCode || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        pastorName: form.pastorName || undefined,
        serviceSchedule: form.serviceSchedule || undefined,
        description: form.description || undefined,
        memberCount: form.memberCount ? parseInt(form.memberCount) : undefined,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        adminDisplayName: form.adminDisplayName,
        adminPhone: form.adminPhone || undefined,
      });
      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Church className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FaithConnect</h1>
            <p className="text-xs text-gray-500">Church Onboarding</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto w-full px-6 pt-8">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={`size-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i <= step
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? (
                  <CheckCircle className="size-5" />
                ) : (
                  <s.icon className="size-5" />
                )}
              </div>
              <span
                className={`text-sm hidden sm:block ${i <= step ? "font-medium text-gray-900" : "text-gray-400"}`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 ${i < step ? "bg-indigo-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto w-full px-6 pb-12 flex-1">
        <div className="bg-white rounded-2xl shadow-xl border p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tell us about your church</h2>
                <p className="text-gray-500 mt-1">
                  This information will be visible to your members on the platform.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Building2 className="size-4 inline mr-1.5" />
                    Church Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Grace Community Church"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Denomination</label>
                    <select
                      value={form.denomination}
                      onChange={(e) => set("denomination", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                    >
                      <option value="">Select denomination</option>
                      {DENOMINATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Users className="size-4 inline mr-1.5" />
                      Approximate Members
                    </label>
                    <input
                      type="number"
                      value={form.memberCount}
                      onChange={(e) => set("memberCount", e.target.value)}
                      placeholder="150"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="size-4 inline mr-1.5" />
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Atlanta"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      placeholder="Georgia"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="1234 Faith Avenue"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Clock className="size-4 inline mr-1.5" />
                      Service Schedule
                    </label>
                    <input
                      type="text"
                      value={form.serviceSchedule}
                      onChange={(e) => set("serviceSchedule", e.target.value)}
                      placeholder="Sundays at 10:00 AM & 6:00 PM"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pastor Name
                    </label>
                    <input
                      type="text"
                      value={form.pastorName}
                      onChange={(e) => set("pastorName", e.target.value)}
                      placeholder="Pastor James Johnson"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Tell us about your church community..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Set up your admin account</h2>
                <p className="text-gray-500 mt-1">
                  You will be the primary administrator for this church on FaithConnect.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <User className="size-4 inline mr-1.5" />
                    Your Display Name *
                  </label>
                  <input
                    type="text"
                    value={form.adminDisplayName}
                    onChange={(e) => set("adminDisplayName", e.target.value)}
                    placeholder="Pastor James Johnson"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Phone className="size-4 inline mr-1.5" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.adminPhone}
                      onChange={(e) => set("adminPhone", e.target.value)}
                      placeholder="(404) 555-0100"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Mail className="size-4 inline mr-1.5" />
                      Church Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="info@gracecommunity.org"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Globe className="size-4 inline mr-1.5" />
                    Church Website
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://www.gracecommunity.org"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <h4 className="font-medium text-indigo-900 mb-1">Admin Permissions</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>-- Full access to all church features and settings</li>
                    <li>-- Manage members, roles, and permissions</li>
                    <li>-- View giving reports and financial data</li>
                    <li>-- Configure integrations (TRGPay, Stripe)</li>
                    <li>-- Invite and onboard new members</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Customize your platform</h2>
                <p className="text-gray-500 mt-1">
                  Choose colors that match your church brand. You can change these anytime.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        set("primaryColor", c.primary);
                        set("accentColor", c.accent);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        form.primaryColor === c.primary
                          ? "border-indigo-600 shadow-lg scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex gap-1.5 mb-2">
                        <div
                          className="h-6 flex-1 rounded-md"
                          style={{ backgroundColor: c.primary }}
                        />
                        <div
                          className="h-6 w-6 rounded-md"
                          style={{ backgroundColor: c.accent }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 p-6" style={{ borderColor: form.primaryColor }}>
                <h4 className="font-semibold mb-3 text-gray-900">Preview</h4>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="size-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    <Church className="size-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">{form.name || "Your Church"}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: form.accentColor }}
                  >
                    Accent Button
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <h4 className="font-medium text-amber-900 mb-1">What happens next</h4>
                <p className="text-sm text-amber-700">
                  Your church platform will be created instantly with all 27+ features enabled.
                  You can invite members, customize settings, and start managing your church right away.
                  Every feature is included free -- giving, events, groups, crisis support, AI concierge,
                  and more.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 space-y-6">
              <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="size-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your church is live!</h2>
                <p className="text-gray-500 mt-2">
                  {form.name} is now on FaithConnect. All 27+ features are active and ready for your members.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3">
                <h4 className="font-semibold text-gray-900">Quick Start Checklist</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="size-4 text-green-500 shrink-0" />
                    Church profile created
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="size-4 text-green-500 shrink-0" />
                    Admin account set up
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="size-4 rounded-full border-2 border-gray-300 shrink-0" />
                    Invite your first members
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="size-4 rounded-full border-2 border-gray-300 shrink-0" />
                    Create your first event
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="size-4 rounded-full border-2 border-gray-300 shrink-0" />
                    Set up giving with TRGPay
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition inline-flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition font-medium"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 2 ? (
                <button
                  onClick={() => canNext && setStep(step + 1)}
                  disabled={!canNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Launch Your Church"}
                  <CheckCircle className="size-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
