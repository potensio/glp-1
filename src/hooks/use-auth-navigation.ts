"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useCallback } from "react";

/**
 * Custom hook for handling authentication-based navigation
 * Routes users to appropriate pages based on their authentication status
 */
export function useAuthNavigation() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  /**
   * Navigate to register or home based on authentication status
   * @param fallbackPath - Optional fallback path for authenticated users (defaults to /home)
   */
  const navigateBasedOnAuth = useCallback(
    (fallbackPath: string = "/home") => {
      // Don't navigate while auth is loading
      if (isLoading) return;

      if (user) {
        // User is authenticated, go to home or specified fallback
        router.push(fallbackPath);
      } else {
        // User is not authenticated, go to register
        router.push("/register");
      }
    },
    [user, isLoading, router]
  );

  /**
   * Navigate to register page (for premium buttons that should always go to register)
   */
  const navigateToRegister = useCallback(() => {
    router.push("/register");
  }, [router]);

  /**
   * Navigate to login page
   */
  const navigateToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  /**
   * Smooth scroll to a section on the page
   * @param sectionId - The ID of the section to scroll to
   */
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return {
    navigateBasedOnAuth,
    navigateToRegister,
    navigateToLogin,
    scrollToSection,
    isAuthenticated: !!user,
    isLoading,
  };
}