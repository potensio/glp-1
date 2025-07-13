import { HealthTrends } from "./_components/health-trends";
import { WelcomeHero } from "./_components/welcome-hero";
import { QuickActions } from "./_components/quick-actions";
import { MedicalReminders } from "./_components/medical-reminders";

export default function DashPage() {
  return (
    <>
      <WelcomeHero />
      <QuickActions />
      <HealthTrends />
      <MedicalReminders />
    </>
  );
}
