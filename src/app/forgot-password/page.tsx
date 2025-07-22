import { redirect } from "next/navigation";

export default function ForgotPasswordPage() {
  // Redirect to Stack Auth forgot password page
  redirect("/handler/forgot-password");
}
