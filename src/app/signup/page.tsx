import { redirect } from "next/navigation";

export default function SignupPage() {
  // Redirect to Stack Auth sign-up page
  redirect("/handler/sign-up");
}
