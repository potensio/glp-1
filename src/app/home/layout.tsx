"use client";
import React, { useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import Header from "@/app/home/_components/header";
import { Footer } from "@/components/ui/footer";


export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're certain the user is not authenticated
    if (user === null) {
      router.push("/handler/sign-in");
    }
  }, [user, router]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render content if user is not authenticated
  if (user === null) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background font-sans min-w-[375px]">
      {/* Higher Downward Curved Gradient Background */}
      <div
        className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none"
        style={{ height: "540px", zIndex: 0 }}
      >
        <svg
          viewBox="0 0 1440 540"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L0,460 Q720,540 1440,460 L1440,0 Z"
            fill="url(#blue-gradient)"
          />
          <defs>
            <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0065ff" />
              <stop offset="100%" stopColor="#003cbf" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="relative z-10 flex flex-col w-full max-w-6xl mx-auto justify-start gap-10 px-4 py-10 md:py-20">
        {children}
      </div>
      <Footer />
    </div>
  );
}
