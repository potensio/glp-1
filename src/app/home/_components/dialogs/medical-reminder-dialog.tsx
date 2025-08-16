"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { formatDateWithOrdinal } from "@/lib/utils";

export function MedicalReminderDialog({
  open,
  setOpen,
  trigger,
  selectedDate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger?: React.ReactNode;
  selectedDate?: Date;
}) {
  // Remove local open state
  const [reminderType, setReminderType] = useState("Medication");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("repeat");
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [repeatUnit, setRepeatUnit] = useState("Day(s)");
  const [ends, setEnds] = useState("never");
  const [endDate, setEndDate] = useState("");
  const [endOccurrences, setEndOccurrences] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Prefill start date when dialog opens with selected date
  useEffect(() => {
    if (open && selectedDate) {
      setStartDate(selectedDate);
    }
  }, [open, selectedDate]);

  const { createEvent, isCreatingEvent } = useGoogleCalendar();

  const reminderTypes = [
    "Medical Checkup",
    "Doctor Appointment",
    "Custom",
  ];
  const repeatUnits = ["Day(s)", "Week(s)", "Month(s)"];

  // Helper function to map repeat units to RFC 5545 frequency values
  const getFrequencyValue = (unit: string) => {
    switch (unit) {
      case "Day(s)":
        return "DAILY";
      case "Week(s)":
        return "WEEKLY";
      case "Month(s)":
        return "MONTHLY";
      default:
        return "DAILY";
    }
  };

  // Helper function to format UNTIL date properly for RFC 5545
  const formatUntilDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Convert YYYY-MM-DD to YYYYMMDDTHHMMSSZ format
    // Use end of day in UTC for proper UNTIL formatting
    const date = new Date(dateStr + "T23:59:59.999Z");
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const handleSaveReminder = async () => {
    // Validation
    if (!description.trim()) {
      toast.error("Please enter a description for the reminder");
      return;
    }
    if (!time) {
      toast.error("Please select a time for the reminder");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date for the reminder");
      return;
    }

    try {
       // Create start and end datetime strings with proper ISO formatting
       const startDateString = startDate!.toISOString().split('T')[0];
       const startDateTime = new Date(`${startDateString}T${time}:00`).toISOString();
       const endDateTime = new Date(new Date(`${startDateString}T${time}:00`).getTime() + 60 * 60 * 1000).toISOString();
       
       // Prepare recurrence rules if repeating
       const recurrenceRules = frequency === "repeat" ? [
         `RRULE:FREQ=${getFrequencyValue(repeatUnit)};INTERVAL=${repeatEvery}${
           ends === "date" ? `;UNTIL=${formatUntilDate(endDate)}` :
           ends === "occurrences" ? `;COUNT=${endOccurrences}` : ""
         }`
       ] : undefined;
       
       // Prepare event data
       const eventData = {
         title: `${reminderType}: ${description}`,
         description: `Medical reminder: ${description}`,
         startTime: startDateTime,
         endTime: endDateTime,
         isAllDay: false,
         recurrence: recurrenceRules
       };

      await createEvent(eventData);
      
      // Reset form
      setDescription("");
      setTime("");
      setStartDate(undefined);
      setFrequency("repeat");
      setRepeatEvery(1);
      setRepeatUnit("Day(s)");
      setEnds("never");
      setEndDate("");
      setEndOccurrences("");
      
      // Close dialog
      setOpen(false);
      
      toast.success("Reminder created successfully!");
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast.error("Failed to create reminder. Please try again.");
    }
  };

  return (
    <>
      {trigger && <span onClick={() => setOpen(true)}>{trigger}</span>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full rounded-2xl">
          <DialogHeader>
            <DialogTitle className="mb-2">Add Medical Reminder</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-3 mt-2">
            {/* Reminder Type Dropdown */}
            <div className="space-y-1">
              <label className="block text-sm text-gray-600">Type</label>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger className="w-full min-h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Description Input */}
            <div className="space-y-1">
              <label className="block text-sm text-gray-600">Description</label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-11"
                placeholder="e.g. Take Lisinopril 10mg, Dr. Smith Appointment"
              />
            </div>
            {/* Start Date Input */}
            <div className="space-y-1">
              <Label className="text-sm text-gray-600">Start Date</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-between font-normal"
                  >
                    {startDate ? formatDateWithOrdinal(startDate) : "Select date"}
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    captionLayout="dropdown"
                    onSelect={(selectedDate) => {
                      setStartDate(selectedDate);
                      setDatePickerOpen(false);
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Time and Frequency Row */}
            <div className="flex flex-row gap-3 items-end">
              <div className="space-y-1">
                <label className="block text-sm text-gray-600">Time</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-fit h-11"
                  placeholder="--.--"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-sm text-gray-600">Frequency</label>
                <Tabs
                  value={frequency}
                  onValueChange={setFrequency}
                  className="w-full"
                >
                  <TabsList className="h-11 w-full">
                    <TabsTrigger value="once" className="flex-1">
                      Just once
                    </TabsTrigger>
                    <TabsTrigger value="repeat" className="flex-1">
                      Repeat
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            {/* Repeat and Ends fields only if Repeat is selected */}
            {frequency === "repeat" && (
              <>
                <div className="mt-1">
                  <label className="mb-1 block text-sm text-gray-600">
                    Repeat every
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min={1}
                      value={repeatEvery}
                      onChange={(e) => setRepeatEvery(Number(e.target.value))}
                      className="text-center h-11 max-w-20 w-fit"
                    />
                    <Select value={repeatUnit} onValueChange={setRepeatUnit}>
                      <SelectTrigger className="min-h-11 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {repeatUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-1">
                  <label className="mb-1 block text-sm text-gray-600">
                    Ends
                  </label>
                  <RadioGroup
                    value={ends}
                    onValueChange={setEnds}
                    className="flex flex-col gap-2 mt-1"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="never"
                        id="ends-never"
                        className="accent-blue-600 w-4 h-4"
                      />
                      <Label
                        htmlFor="ends-never"
                        className="text-gray-700 text-base font-normal cursor-pointer"
                      >
                        Never
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="date"
                        id="ends-date"
                        className="accent-blue-600 w-4 h-4"
                      />
                      <Label
                        htmlFor="ends-date"
                        className="text-gray-700 text-base font-normal cursor-pointer"
                      >
                        On specific date
                      </Label>
                      {ends === "date" && (
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-11 w-fit"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="occurrences"
                        id="ends-occurrences"
                        className="accent-blue-600 w-4 h-4"
                      />
                      <Label
                        htmlFor="ends-occurrences"
                        className="text-gray-700 text-base font-normal cursor-pointer"
                      >
                        After number of occurrences
                      </Label>
                      {ends === "occurrences" && (
                        <Input
                          type="number"
                          min={1}
                          value={endOccurrences}
                          onChange={(e) => setEndOccurrences(e.target.value)}
                          className="w-fit max-w-16"
                        />
                      )}
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
          </form>
          <DialogFooter className="flex flex-row gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-12"
              onClick={handleSaveReminder}
              disabled={isCreatingEvent}
            >
              {isCreatingEvent ? "Creating..." : "Save Reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
