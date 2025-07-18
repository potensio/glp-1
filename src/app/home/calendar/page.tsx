import WeeklyCalendar from "@/components/weekly-calendar";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  return (
    <>
      {" "}
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
            Medication Reminders
          </h1>
          <p className="text-background text-lg mb-6">
            Track your health journey and see how far you’ve come
          </p>
        </div>{" "}
        <Button
          size={"lg"}
          variant={"outline"}
          className="md:w-36 bg-transparent text-background hover:bg-background/10 hover:text-background"
        >
          Print
        </Button>
      </div>
      <WeeklyCalendar />
    </>
  );
}
