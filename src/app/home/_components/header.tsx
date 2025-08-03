"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const router = useRouter();

  const menuItems = useMemo(() => [
    { label: "Home", href: "/home" },
    { label: "Progress", href: "/home/progress" },
    { label: "Medication", href: "/home/medication" },
    { label: "Journal", href: "/home/journal" },
    { label: "Tips & Tricks", href: "/home/tips" },
  ], []);

  // Prefetch all navigation pages for instant transitions
  useEffect(() => {
    console.log("Prefetching navigation pages...");
    menuItems.forEach((item) => {
      console.log("Prefetching:", item.href);
      router.prefetch(item.href);
    });
  }, [router, menuItems]);

  // Aggressive prefetching with invisible Link components
  const PrefetchLinks = () => (
    <div style={{ display: "none" }}>
      {menuItems.map((item) => (
        <Link key={`prefetch-${item.href}`} href={item.href} prefetch={true}>
          {item.label}
        </Link>
      ))}
    </div>
  );

  // Optimistic navigation for instant SPA feel
  const handleNavigation = (href: string) => {
    router.push(href);
    setMenuOpen(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // Always force light mode
  // useEffect(() => {
  //   document.documentElement.classList.remove("dark");
  //   localStorage.setItem("theme", "light");
  // }, []);

  return (
    <header className="relative z-20 w-full backdrop-blur">
      <PrefetchLinks />
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-lg sm:text-xl text-background whitespace-nowrap">
            Logo
          </span>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center gap-8 xl:gap-12 text-background font-medium">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                prefetch={true}
                onClick={() => setMenuOpen(false)}
                className="hover:underline transition-all duration-200 cursor-pointer bg-transparent border-none text-background font-medium py-2 px-1"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop User Menu */}
        <div className="hidden lg:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="flex items-center gap-2 cursor-pointer">
                <Avatar className="size-10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span className="font-medium text-background">
                  {profile?.firstName || user?.email || "User"}
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2">
              <DropdownMenuItem
                className="flex h-10 items-center hover:bg-muted px-4 rounded cursor-pointer"
                onSelect={() => handleNavigation("/home/billing")}
              >
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex h-10 items-center hover:bg-muted px-4 rounded cursor-pointer"
                onSelect={() => handleNavigation("/home/account")}
              >
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="w-full px-4 justify-start font-normal hover:bg-red-50 cursor-pointer"
                onSelect={() => {
                  logout();
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <button
            aria-label="Toggle dark mode"
            onClick={() => setIsDark((v) => !v)}
            className="ml-2 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition"
          >
            {isDark ? (
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                />
              </svg>
            )}
          </button> */}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors touch-manipulation"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-background transition-transform duration-200"
              style={{
                transform: menuOpen ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />

            {/* Menu Panel */}
            <div className="relative bg-white h-screen w-full animate-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="px-4 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {profile?.firstName?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {profile?.firstName || "User"}
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-6">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center w-full px-6 py-3 text-left font-medium hover:bg-gray-100/80 transition-colors touch-manipulation active:bg-gray-200/80"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <span className="text-base">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Account Actions */}
              <div className="border-t border-gray-200/50 py-6">
                <button
                  onClick={() => handleNavigation("/home/billing")}
                  className="flex items-center w-full px-6 py-3 text-left text-secondary hover:bg-gray-100/80 transition-colors touch-manipulation active:bg-gray-200/80"
                >
                  <span className="text-sm">Billing</span>
                </button>
                <button
                  onClick={() => handleNavigation("/home/account")}
                  className="flex items-center w-full px-6 py-3 text-left text-secondary hover:bg-gray-100/80 transition-colors touch-manipulation active:bg-gray-200/80"
                >
                  <span className="text-sm">Account Settings</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-6 py-3 text-left text-red-600 hover:bg-red-50/80 transition-colors touch-manipulation active:bg-red-100/80"
                >
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
