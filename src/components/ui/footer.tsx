import Image from "next/image";
import { Button } from "./button";
import { useAuth } from "@/contexts/auth-context";

export function Footer() {
  const { logout } = useAuth();
  return (
    <footer className="relative flex z-10 w-full border-t backdrop-blur justify-center ">
      <div className="flex flex-col md:flex-row justify-center md:justify-between gap-4 md:gap-2 px-4 sm:px-6 pt-8 pb-10 w-full max-w-6xl">
        <div className="flex flex-col md:max-w-sm items-center md:items-start">
          <div className="flex items-center gap-2 w-fit">
            <Image
              src="/logo.png"
              alt="My Daily Health Journal"
              width={36}
              height={36}
              className="ml-[-8px]"
            />
            <p className=" font-medium text-sm ml-[-4px]">
              My Daily Health Journal
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Track weight, blood pressure, blood sugar, medications, and more —
            designed for GLP‑1 users, diabetics, and anyone committed to better
            health.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end w-full md:w-fit">
          {" "}
          <span className="text-xs text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} My Daily Health Journal. All
            rights reserved.
          </span>
          <Button
            variant="link"
            className="text-xs text-muted-foreground w-fit"
            onClick={() => logout()}
          >
            Log out
          </Button>
        </div>
      </div>
    </footer>
  );
}
