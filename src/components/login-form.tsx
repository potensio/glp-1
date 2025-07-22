"use client";

import { SignIn } from "@stackframe/stack";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <SignIn />
    </div>
  );
}
