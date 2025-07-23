"use client";

import { useRouter } from "next/navigation";
import { ReactNode, MouseEvent } from "react";

interface InstantLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

// Optimized Link component for instant SPA navigation
export function InstantLink({ href, children, className, onClick }: InstantLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Execute any custom onClick handler
    if (onClick) {
      onClick();
    }
    
    // Instant navigation using router.push
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-transparent border-none cursor-pointer ${className || ''}`}
      style={{ all: 'unset', cursor: 'pointer' }}
    >
      {children}
    </button>
  );
}