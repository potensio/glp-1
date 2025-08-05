"use client";

import { useEffect, useState } from "react";
import { getRandomQuote, CONFIG } from "@/config/quote";

interface WelcomeHeroProps {
  userName: string;
}

export const WelcomeHero = ({ userName }: WelcomeHeroProps) => {
  const [quote, setQuote] = useState<{ quote: string; author: string }>({
    quote: "",
    author: "",
  });

  useEffect(() => {
    const quote = getRandomQuote();
    setQuote(quote);
  }, []);

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
          &quot;{quote.quote}&quot;{" "}
          {quote.author !== "" ? `-${quote.author}` : ""}
        </p>
      </div>
    </div>
  );
};
