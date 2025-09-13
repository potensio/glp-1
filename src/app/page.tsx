"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChartLine, NotepadText, Syringe } from "lucide-react";
import { useAddToWaitlist } from "@/hooks/use-waitlist";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const addToWaitlistMutation = useAddToWaitlist();

  const isLoading = addToWaitlistMutation.isPending;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Add to waitlist using real API
    addToWaitlistMutation.mutate(
      {
        email: email.trim(),
        source: "landing-page",
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          setEmail("");
        },
        onError: (error) => {
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Waitlist Badge */}
        <div className="flex flex-col justify-center items-center h-fit md:justify-start pb-10">
          <Image src="/logo.png" alt="Logo" width={48} height={48} />
          <a href="#" className="flex items-center gap-2 text-sm font-medium">
            My Daily Health Journal
          </a>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Join Our
          <span className="text-blue-600"> Waitlist</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Be among the first to experience our health tracking platform designed
          for GLP‑1 users, diabetics, and anyone committed to better health.
        </p>

        {/* Waitlist Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-xl border ${
                  error ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={isLoading}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-left">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Joining...
                </>
              ) : (
                "Join Waitlist"
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>

        {/* Waitlist Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <NotepadText className="text-3xl mb-4 mx-auto text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Tracking
            </h3>
            <p className="text-gray-600">
              Monitor weight, blood pressure, blood sugar, and medications in
              one place
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <Syringe className="text-3xl mb-4 mx-auto text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              GLP-1 Focused
            </h3>
            <p className="text-gray-600">
              Specially designed for GLP-1 users with tailored insights and
              tracking
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <ChartLine className="text-3xl mb-4 mx-auto text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Progress Insights
            </h3>
            <p className="text-gray-600">
              Visualize your health journey with beautiful charts and trends
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-4 mt-6 text-gray-400">
          <Link
            href="/privacy"
            className="hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link
            href="/contact"
            className="hover:text-primary transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
