"use client";

import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { HealthCharts } from "@/components/dashboard/health-charts";
import WeeklyCalendar from "@/components/dashboard/weekly-calendar";
import PlanCard from "@/components/billing/plan-card";
import { DateFilterProvider } from "@/contexts/date-filter-context";

import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { deduplicatedToast } from "@/lib/utils";

export default function DashPage() {
  // Get the current user from our custom auth context
  const { user, profile, hasPremiumSubscription } = useAuth();
  const searchParams = useSearchParams();

  // Check if we're coming from a successful subscription activation
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      // Show success toast and remove the query parameter
      deduplicatedToast(toast.success, "Subscription activated!", {
        description: "Your premium subscription is now active.",
      });

      // Remove the success parameter from URL without triggering a navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

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

      {profile && (
        <DateFilterProvider>
          <HealthCharts />
        </DateFilterProvider>
      )}

      {/* Show plan card for free users, calendar for premium users */}
      {!hasPremiumSubscription ? (
        <PlanCard />
      ) : (
        <WeeklyCalendar headerButtonId="calendar-add-reminder-btn" />
      )}
    </>
  );
}
