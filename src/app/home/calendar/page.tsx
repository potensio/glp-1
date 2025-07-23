import WeeklyCalendar from "@/components/weekly-calendar";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  return (
    <>
      {" "}
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
            Calendar
          </h1>
          <p className="text-background text-lg mb-6">
            Track your health journey and see how far you&apos;ve come
          </p>
        </div>{" "}
        <Button
          id="calendar-add-reminder-btn"
          size={"lg"}
          variant={"outline"}
          className="md:w-36 bg-transparent text-background hover:bg-background/10 hover:text-background cursor-pointer"
        >
          Add reminder
        </Button>
      </div>
      <WeeklyCalendar headerButtonId="calendar-add-reminder-btn" />
      <div className="p-8">
        <p>Calendar component coming soon...</p>
      </div>
    </>
  );
}
