"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MedicalReminderDialog } from "@/app/home/_components/dialogs/medical-reminder-dialog";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Sample events data
const sampleEvents = {
  "2025-07-02": [
    { title: "Injection Reminder", time: "7:00 AM" },
    { title: "Weight Check-in", time: "8:00 AM" },
  ],
  "2025-07-05": [{ title: "Doctor Appointment", time: "3:00 PM" }],
  "2025-07-10": [{ title: "Blood Sugar Log", time: "9:00 AM" }],
  "2025-07-15": [
    { title: "Injection Reminder", time: "7:00 AM" },
    { title: "Food Log Review", time: "6:00 PM" },
  ],
  "2025-07-20": [{ title: "Progress Journal Entry", time: "8:00 PM" }],
  "2025-07-25": [
    { title: "Monthly Summary Export", time: "10:00 AM" },
    { title: "Doctor Follow-up", time: "2:00 PM" },
  ],
};

type WeeklyCalendarProps = {
  headerButtonId?: string;
};

export default function WeeklyCalendar({
  headerButtonId,
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Attach click handler to header button if id is provided
  useEffect(() => {
    if (!headerButtonId) return;
    const btn = document.getElementById(headerButtonId);
    if (!btn) return;
    const handler = () => setDialogOpen(true);
    btn.addEventListener("click", handler);
    return () => {
      btn.removeEventListener("click", handler);
    };
  }, [headerButtonId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: number) => {
    const today = new Date();
    return (
      today.getDate() === date &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (date: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === date &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const hasEvent = (date: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      date
    ).padStart(2, "0")}`;
    return sampleEvents[dateStr as keyof typeof sampleEvents];
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(new Date(year, month, date));
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const events = hasEvent(date);
      days.push(
        <button
          key={date}
          onClick={() => handleDateClick(date)}
          className={cn(
            "aspect-square w-full flex flex-col cursor-pointer items-center justify-start p-1 text-sm relative rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
            isSelected(date) &&
              !isToday(date) &&
              "bg-accent text-accent-foreground"
          )}
        >
          <span
            className={cn(
              "font-medium flex items-center justify-center w-7 h-7",
              isToday(date) ? "rounded-full bg-blue-600 text-white" : ""
            )}
          >
            {date}
          </span>
          {events && (
            <>
              {/* Desktop: Event pills */}
              <div className="w-full mt-1 space-y-0.5 hidden sm:block">
                {events.slice(0, 2).map((event, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded text-left truncate w-full",
                      isToday(date)
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    )}
                  >
                    {event.title}
                  </div>
                ))}
                {events.length > 2 && (
                  <div
                    className={cn(
                      "text-xs px-1",
                      isToday(date)
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    +{events.length - 2} more
                  </div>
                )}
              </div>
              {/* Mobile: Event dots */}
              <div className="flex flex-1 items-center justify-center gap-0.5 mt-1 sm:hidden">
                {events.slice(0, 3).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-block w-1.5 h-1.5 rounded-full",
                      isToday(date)
                        ? "bg-primary-foreground/80"
                        : "bg-blue-500 dark:bg-blue-300"
                    )}
                  />
                ))}
                {events.length > 3 && (
                  <span className="text-[10px] text-muted-foreground ml-0.5">
                    +{events.length - 3}
                  </span>
                )}
              </div>
            </>
          )}
        </button>
      );
    }

    return days;
  };

  const selectedDateEvents = selectedDate
    ? hasEvent(selectedDate.getDate())
    : null;

  return (
    <div className="w-full space-y-4">
      {/* MedicalReminderDialog for both header and sidebar button */}
      <MedicalReminderDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        trigger={null}
      />
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Calendar Grid */}
        <Card className="lg:col-span-4 gap-0">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">
                {MONTHS[month]} {year}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant={"outline"} className="cursor-pointer">
                Today
              </Button>
              {/* <Button className="gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Reminders</span>
              </Button> */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
          </CardContent>
        </Card>

        {/* Event Details Sidebar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold">
              {selectedDate
                ? `${
                    MONTHS[selectedDate.getMonth()]
                  } ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                : "Select a date"}
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateEvents ? (
              selectedDateEvents.map((event, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {event.time}
                  </div>
                </div>
              ))
            ) : selectedDate ? (
              <p className="text-sm text-muted-foreground">
                No events scheduled
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click on a date to view events
              </p>
            )}

            {selectedDate && (
              <Button
                variant="outline"
                className="w-full h-11 cursor-pointer"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
