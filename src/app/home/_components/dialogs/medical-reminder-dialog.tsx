"use client";
import { useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MedicalReminderDialog({
  open,
  setOpen,
  trigger,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger?: React.ReactNode;
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

  const reminderTypes = [
    "Medication",
    "Medical Checkup",
    "Doctor Appointment",
    "Custom",
  ];
  const repeatUnits = ["Day(s)", "Week(s)", "Month(s)"];

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
              onClick={() => setOpen(false)}
            >
              Save Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
