import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";

const DEMO_EMAIL = "demo@faithconnect.app";
const DEMO_PASSWORD = "FaithConnect2026!";

export function DemoEntryPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const navigate = useNavigate();
  const seedDemo = useMutation(api.seedDemo.seedDemoData);
  const seedBulk = useMutation(api.seedBulkMembers.seedBulkMembers);
  const seedChurches = useMutation(api.seedDemoChurches.seedDemoChurches);
  const seedV3 = useMutation(api.seedV3Features.seedV3);
  const seedPhase1 = useMutation(api.seedPhase1.seedPhase1Data);
  const seedPhase2 = useMutation(api.seedPhase2.seedPhase2);
  const seedPhase3 = useMutation(api.seedPhase3.seedPhase3);
  const seedMB1 = useMutation(api.seedMassive.seedMassiveBatch1);
  const seedMB2 = useMutation(api.seedMassive.seedMassiveBatch2);
  const seedMB3 = useMutation(api.seedMassive.seedMassiveBatch3);
  const seedFM = useMutation(api.seedMassiveData.seedFaithMatch);
  const seedPR = useMutation(api.seedMassiveData.seedMassivePrayers);
  const seedGV = useMutation(api.seedMassiveData.seedMassiveGiving);
  const seedSC = useMutation(api.seedMassiveData.seedMassiveSocial);
  const seedEV = useMutation(api.seedMassiveData.seedMassiveEvents);
  const seedGR = useMutation(api.seedMassiveData.seedMassiveGroups);
  const seedSU = useMutation(api.seedMassiveData.seedMassiveSupport);
  const seedCO = useMutation(api.seedMassiveData.seedMassiveCommerce);
  const [status, setStatus] = useState("Launching demo...");
  const done = useRef(false);

  async function seedAndGo() {
    if (done.current) return;
    done.current = true;
    try {
      setStatus("Loading demo content...");
      await seedDemo();
      setStatus("Loading members...");
      await seedBulk();
      setStatus("Loading platform data...");
      await seedChurches();
      setStatus("Loading v3 features...");
      await seedV3();
      setStatus("Loading Phase 1 data...");
      try { await seedPhase1(); } catch { /* ok */ }
      setStatus("Loading Phase 2 data...");
      try { await seedPhase2(); } catch { /* ok */ }
      setStatus("Loading Phase 3 data...");
      try { await seedPhase3(); } catch { /* ok */ }
      setStatus("Loading members (batch 1/3)...");
      try { await seedMB1(); } catch { /* ok */ }
      setStatus("Loading members (batch 2/3)...");
      try { await seedMB2(); } catch { /* ok */ }
      setStatus("Loading members (batch 3/3)...");
      try { await seedMB3(); } catch { /* ok */ }
      setStatus("Loading FaithMatch profiles...");
      try { await seedFM(); } catch { /* ok */ }
      setStatus("Loading prayer requests...");
      try { await seedPR(); } catch { /* ok */ }
      setStatus("Loading giving records...");
      try { await seedGV(); } catch { /* ok */ }
      setStatus("Loading social feed & testimonies...");
      try { await seedSC(); } catch { /* ok */ }
      setStatus("Loading events & registrations...");
      try { await seedEV(); } catch { /* ok */ }
      setStatus("Loading groups...");
      try { await seedGR(); } catch { /* ok */ }
      setStatus("Loading support services...");
      try { await seedSU(); } catch { /* ok */ }
      setStatus("Loading store & marketplace...");
      try { await seedCO(); } catch { /* ok */ }
      setStatus("Loading complete! Launching...");
    } catch {
      /* ok */
    }
    navigate("/dashboard", { replace: true });
  }

  useEffect(() => {
    if (authLoading) return;

    // Already authenticated — seed and go
    if (isAuthenticated) {
      seedAndGo();
      return;
    }

    // Sign in as demo user
    async function doSignIn() {
      setStatus("Signing in...");
      const formData = new FormData();
      formData.set("email", DEMO_EMAIL);
      formData.set("password", DEMO_PASSWORD);
      formData.set("flow", "signIn");
      try {
        await signIn("demo", formData);
      } catch {
        setStatus("Creating demo account...");
        const signUpData = new FormData();
        signUpData.set("email", DEMO_EMAIL);
        signUpData.set("password", DEMO_PASSWORD);
        signUpData.set("flow", "signUp");
        try {
          await signIn("demo", signUpData);
        } catch {
          setStatus("Error launching demo. Please refresh.");
        }
      }
    }

    doSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // After signIn completes, isAuthenticated flips to true
  useEffect(() => {
    if (isAuthenticated) seedAndGo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0C1222] via-[#1A2340] to-[#2D3A8C]">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Faith<span className="text-[#C8960E]">Connect</span>
          </h1>
          <p className="text-white/50 text-sm">The platform churches deserve</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="size-5 animate-spin text-[#C8960E]" />
          <span className="text-white/70 text-sm">{status}</span>
        </div>
      </div>
    </div>
  );
}
