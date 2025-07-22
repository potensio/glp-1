"use client";

import { SignUp } from "@stackframe/stack";
import { cn } from "@/lib/utils";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <SignUp />
    </div>
  );
}
