"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LogOut } from "lucide-react";

interface WelcomeHeroProps {
  userName: string;
}

export const WelcomeHero = ({ userName }: WelcomeHeroProps) => {
  const { logout } = useAuth();

  // Get the time of day to display appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-background text-lg mb-6">
          &quot;Take care of your body. It&apos;s the only place you have to
          live.&quot; - Jim Rohn
        </p>
      </div>
    </div>
  );
};
