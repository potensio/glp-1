"use client";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const user = useUser();
  const router = useRouter();
  
  useEffect(() => {
    // If authenticated, redirect to home dashboard
    if (user) {
      router.push("/home");
    }
    // If not authenticated, redirect to sign-in
    else if (user === null) {
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
  
  // This should not be reached due to redirects, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Link 
        href="/home" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
