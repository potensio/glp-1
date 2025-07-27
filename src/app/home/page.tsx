"use client";

import { WelcomeHero } from "./_components/welcome-hero";
import { QuickActions } from "./_components/quick-actions";
import WeeklyCalendar from "@/components/weekly-calendar";
import { HealthDashboard } from "./_components/health-dashboard";
import { useAuth } from "@/contexts/auth-context";

export default function DashPage() {
  // Get the current user from our custom auth context
  const { user, profile } = useAuth();

  // Determine display name: prefer profile first name, fallback to user email, or default
  const displayName = profile?.firstName || user?.email || "User";

  return (
    <>
      <WelcomeHero userName={displayName} />
      {user && !profile && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>
            Profile information could not be loaded. Some features may be
            limited.
          </p>
        </div>
      )}
      <QuickActions />
      <HealthDashboard />
      <WeeklyCalendar headerButtonId="calendar-add-reminder-btn" />
      {/* <MedicationList /> */}
    </>
  );
}
