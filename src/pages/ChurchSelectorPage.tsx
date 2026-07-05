import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Church, Plus, ArrowRight } from "lucide-react";

export function ChurchSelectorPage() {
  const navigate = useNavigate();
  const churches = useQuery(api.onboarding.getMyChurches);

  if (churches === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading your churches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="size-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Church className="size-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FaithConnect</h1>
          <p className="text-gray-500 mt-2">Select your church to continue</p>
        </div>

        <div className="space-y-4">
          {churches.map((church) => (
            <button
              key={church._id}
              onClick={() => navigate("/dashboard")}
              className="w-full bg-white rounded-2xl border p-6 text-left hover:shadow-lg hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="size-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                  style={{ backgroundColor: church.primaryColor || "#4338ca" }}
                >
                  {church.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{church.name}</h3>
                    {church.memberRole === "admin" && (
                      <span className="shrink-0 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                        Admin
                      </span>
                    )}
                    {church.memberRole === "pastor" && (
                      <span className="shrink-0 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        Pastor
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {church.denomination && <span>{church.denomination}</span>}
                    {church.city && church.state && (
                      <span>
                        {church.denomination ? " -- " : ""}
                        {church.city}, {church.state}
                      </span>
                    )}
                  </div>
                  {church.serviceSchedule && (
                    <div className="text-xs text-gray-400 mt-1">{church.serviceSchedule}</div>
                  )}
                </div>
                <ArrowRight className="size-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </button>
          ))}

          {/* Register new church */}
          <button
            onClick={() => navigate("/onboard")}
            className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
          >
            <div className="flex items-center justify-center gap-3 text-gray-500 group-hover:text-indigo-600">
              <Plus className="size-6" />
              <span className="font-medium text-lg">Register a New Church</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Set up your church on FaithConnect in minutes</p>
          </button>
        </div>

        {churches.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">
              You are not a member of any church yet. Register your church to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
