import React from "react";

export function Footer() {
  return (
    <footer className="relative z-10 w-full flex flex-col items-center justify-center gap-2 py-4 border-t text-sm text-muted-foreground backdrop-blur">
      <span className="mt-2">
        &copy; {new Date().getFullYear()} yourglp1journal.com. All rights
        reserved.
      </span>
    </footer>
  );
}
