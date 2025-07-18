"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddEntryButton({
  className = "",
  ...props
}: { className?: string } & React.ComponentProps<typeof Button>) {
  return (
    <Button asChild className={className} {...props}>
      <Link href="/home/journal/create">Add Journal</Link>
    </Button>
  );
}
