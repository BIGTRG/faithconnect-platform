import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  DashboardPage,
  LandingPage,
  LoginPage,
  SettingsPage,
  SignupPage,
  DirectoryPage,
  GroupsPage,
  PrayersPage,
  AnnouncementsPage,
  EventsPage,
  SermonsPage,
  GivingPage,
  TestimoniesPage,
  AiConciergePage,
  MarketplacePage,
  FaithMatchPage,
  SocialFeedPage,
  MeetPastorPage,
  ChurchNewsPage,
  AwardsPage,
  WorshipRadioPage,
  GrowthTrackerPage,
  SupportPage,
  CertificatesPage,
  ExpertQAPage,
  HelpCenterPage,
  CrisisTeamPage,
  LifeEventsPage,
  TherapistPage,
  MentalHealthPage,
  MedicalDirectoryPage,
  ChurchStorePage,
  BookLibraryPage,
  DemoEntryPage,
  MobileMorePage,
  OnboardingPage,
  SuperAdminPage,
  ChurchSelectorPage,
  WelcomePage,
  BiblePage,
  TeenMinistryPage,
  ChildCheckinPage,
  JobBoardPage,
  NotificationsPage,
  SecurityPage,
  GivingStatementPage,
  AuditLogPage,
} from "./pages";
import { StripeOnboardingPage } from "./pages/StripeOnboardingPage";
import { AnalyticsDashboardPage } from "./pages/AnalyticsDashboardPage";
import { PlatformHealthPage } from "./pages/PlatformHealthPage";
import { ComplianceCenterPage } from "./pages/ComplianceCenterPage";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" switchable>
        <Toaster />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
          </Route>

          <Route path="/demo" element={<DemoEntryPage />} />
          <Route path="/onboard" element={<OnboardingPage />} />
          <Route path="/churches" element={<ChurchSelectorPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/directory" element={<DirectoryPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/prayers" element={<PrayersPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/sermons" element={<SermonsPage />} />
              <Route path="/giving" element={<GivingPage />} />
              <Route path="/testimonies" element={<TestimoniesPage />} />
              <Route path="/ai-concierge" element={<AiConciergePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/faithmatch" element={<FaithMatchPage />} />
              <Route path="/feed" element={<SocialFeedPage />} />
              <Route path="/meet-pastor" element={<MeetPastorPage />} />
              <Route path="/church-news" element={<ChurchNewsPage />} />
              <Route path="/awards" element={<AwardsPage />} />
              <Route path="/worship-radio" element={<WorshipRadioPage />} />
              <Route path="/growth" element={<GrowthTrackerPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/expert-qa" element={<ExpertQAPage />} />
              <Route path="/help-center" element={<HelpCenterPage />} />
              <Route path="/crisis-team" element={<CrisisTeamPage />} />
              <Route path="/life-events" element={<LifeEventsPage />} />
              <Route path="/therapist" element={<TherapistPage />} />
              <Route path="/mental-health" element={<MentalHealthPage />} />
              <Route path="/medical" element={<MedicalDirectoryPage />} />
              <Route path="/church-store" element={<ChurchStorePage />} />
              <Route path="/book-library" element={<BookLibraryPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/bible" element={<BiblePage />} />
              <Route path="/teen-ministry" element={<TeenMinistryPage />} />
              <Route path="/child-checkin" element={<ChildCheckinPage />} />
              <Route path="/job-board" element={<JobBoardPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/giving-statement" element={<GivingStatementPage />} />
              <Route path="/more" element={<MobileMorePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/audit-log" element={<AuditLogPage />} />
              <Route path="/stripe-setup" element={<StripeOnboardingPage />} />
              <Route path="/analytics" element={<AnalyticsDashboardPage />} />
              <Route path="/platform-health" element={<PlatformHealthPage />} />
              <Route path="/compliance" element={<ComplianceCenterPage />} />
              <Route path="/admin" element={<SuperAdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
