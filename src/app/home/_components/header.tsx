"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Always force light mode
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  const menuItems = [
    { label: "Home", href: "/home" },
    { label: "Progress", href: "/home/progress" },
    { label: "Calendar", href: "/home/calendar" },
    { label: "Journal", href: "/home/journal" },
  ];

  return (
    <header className="relative z-20 w-full backdrop-blur">
      <nav className="flex items-center justify-center px-6 py-6 max-w-6xl mx-auto">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="font-semibold text-lg text-background whitespace-nowrap">
            Logo
          </span>
        </div>
        <ul className="hidden md:flex flex-1 justify-center gap-12 text-background font-medium">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="hover:underline transition">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex flex-1 justify-end items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="flex items-center gap-2 cursor-pointer">
                <Avatar className="size-10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span className="font-medium text-background">John</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2">
              <DropdownMenuItem asChild>
                <Link
                  href="/home/billing"
                  className="flex h-10 items-center hover:bg-muted px-4 rounded cursor-pointer"
                >
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/home/account"
                  className="flex h-10 items-center hover:bg-muted px-4 rounded cursor-pointer"
                >
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="w-full px-4 justify-start font-normal hover:bg-red-50 cursor-pointer"
                onSelect={() => {
                  /* TODO: Add logout logic */
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
        <button
          className="md:hidden flex items-center justify-center p-2 rounded hover:bg-blue-50"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
        >
          <svg
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="text-blue-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {menuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="absolute top-0 right-0 w-3/4 max-w-xs h-full bg-white dark:bg-black shadow-lg p-6 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="self-end mb-4"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-200 font-medium text-lg hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Login
                </button>
                {/* <button
                  aria-label="Toggle dark mode"
                  onClick={() => setIsDark((v) => !v)}
                  className="p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition"
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
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
