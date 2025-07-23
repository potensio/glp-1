"use client";

import { WelcomeHero } from "./welcome-hero";
import { QuickActions } from "./quick-actions";
import { MedicationList } from "./medical-list";
import { HealthDashboard } from "./health-dashboard";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";





export function AuthenticatedDashboard() {
  // Get the current user from our custom auth context
  const { user, profile, isLoading } = useAuth();
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Profile is already loaded from auth context
  useEffect(() => {
    if (user && !profile) {
      setProfileError('Profile not found');
    } else {
      setProfileError(null);
    }
  }, [user, profile]);
  
  if (isLoading || !user) {
    // Show loading state while auth is being checked
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Determine display name: prefer profile first name, fallback to user email
  const displayName = profile 
    ? profile.firstName 
    : (user.email || 'User');
  
  return (
    <>
      <WelcomeHero userName={displayName} />
      {profileError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Profile information could not be loaded. Some features may be limited.</p>
        </div>
      )}
      <QuickActions />
      <HealthDashboard />
      <MedicationList />
    </>
  );
}