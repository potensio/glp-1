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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMedication } from "@/hooks/use-medication";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface EditingMedication {
  id: string;
  name: string;
  dosage: number;
  dosageUnit: string;
  description: string;
  startDate: string;
  repeatEvery: number;
  repeatUnit: string;
  status: string;
  prescribingDoctor?: string;
  enableReminders?: boolean;
}

export function MedicationCreationDialog({
  open,
  setOpen,
  trigger,
  editingMedication,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger?: React.ReactNode;
  editingMedication?: EditingMedication | null;
}) {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [dosageUnit, setDosageUnit] = useState("MG");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [repeatUnit, setRepeatUnit] = useState("Day(s)");
  const [prescribingDoctor, setPrescribingDoctor] = useState("");
  const [medicationStatus, setMedicationStatus] = useState("active");
  const [enableReminders, setEnableReminders] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createMedication, updateMedication, isCreating, isUpdating } =
    useMedication();
  
  const { isConnected: isGoogleConnected } = useGoogleAuth();
  const { createEvent, isCreatingEvent } = useGoogleCalendar({ enabled: isGoogleConnected });

  // Populate form when editing
  useEffect(() => {
    if (editingMedication && open) {
      setMedicationName(editingMedication.name);
      setDosage(editingMedication.dosage.toString());
      setDosageUnit(editingMedication.dosageUnit);
      setDescription(editingMedication.description || "");
      // Parse date from ISO string to "2024-01-15" format
      const dateObj = new Date(editingMedication.startDate);
      if (!isNaN(dateObj.getTime())) {
        setDate(dateObj.toISOString().split("T")[0]);
      }
      setRepeatEvery(editingMedication.repeatEvery);
      setRepeatUnit(editingMedication.repeatUnit);
      setMedicationStatus(editingMedication.status.toLowerCase());
      setPrescribingDoctor(editingMedication.prescribingDoctor || "");
      setEnableReminders(editingMedication.enableReminders || false);
    } else if (open && !editingMedication) {
      // Reset form for new medication
      setMedicationName("");
      setDosage("");
      setDosageUnit("MG");
      setDescription("");
      setDate("");
      setRepeatEvery(1);
      setRepeatUnit("Day(s)");
      setMedicationStatus("active");
      setPrescribingDoctor("");
      setEnableReminders(false);
    }
  }, [editingMedication, open]);

  const repeatUnits = ["Day(s)", "Week(s)"];
  const dosageUnits = [
    { value: "MG", label: "mg" },
    { value: "G", label: "g" },
    { value: "ML", label: "ml" },
    { value: "L", label: "l" },
    { value: "IU", label: "IU" },
    { value: "MCG", label: "mcg" },
    { value: "UNITS", label: "units" },
  ];
  const medicationStatuses = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "inactive", label: "Inactive" },
  ];

  const handleSave = () => {
    setErrors({});

    // Basic validation
    if (!medicationName || !dosage || !date) {
      setErrors({
        general:
          "Please fill in all required fields (name, dosage, and start date).",
      });
      return;
    }

    const medicationData = {
      name: medicationName,
      dosage: parseFloat(dosage),
      dosageUnit: dosageUnit as
        | "MG"
        | "G"
        | "ML"
        | "L"
        | "IU"
        | "MCG"
        | "UNITS",
      description,
      prescribingDoctor,
      status: medicationStatus as "active" | "paused" | "inactive",
      startDate: date,
      repeatEvery,
      repeatUnit: repeatUnit as "Day(s)" | "Week(s)",
      enableReminders,
    };

    const onSuccess = () => {
      const dosageUnitLabel =
        dosageUnits.find((unit) => unit.value === dosageUnit)?.label ||
        dosageUnit;
      const action = editingMedication ? "updated" : "added";
      
      // Create calendar event if reminders are enabled and Google Calendar is connected
      if (enableReminders && isGoogleConnected && !editingMedication) {
        const startDateTime = new Date(date);
        startDateTime.setHours(9, 0, 0, 0); // Default to 9 AM
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(9, 30, 0, 0); // 30 minutes duration
        
        createEvent({
          title: `Take ${medicationName}`,
          description: `Medication reminder: ${medicationName} (${dosage}${dosageUnitLabel})${description ? `\n\nNotes: ${description}` : ''}${prescribingDoctor ? `\nPrescribed by: ${prescribingDoctor}` : ''}`,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          isAllDay: false,
          recurrence: repeatUnit === "Day(s)" ? [`RRULE:FREQ=DAILY;INTERVAL=${repeatEvery}`] : [`RRULE:FREQ=WEEKLY;INTERVAL=${repeatEvery}`],
        });
      }
      
      toast.success(
        `Medication ${action}: ${medicationName} (${dosage}${dosageUnitLabel})`
      );
      setOpen(false);
    };

    const onError = () => {
      const action = editingMedication ? "update" : "add";
      toast.error(`Failed to ${action} medication. Please try again.`);
    };

    if (editingMedication) {
      // Update existing medication
      updateMedication(
        {
          id: editingMedication.id,
          data: medicationData,
        },
        {
          onSuccess,
          onError,
        }
      );
    } else {
      // Create new medication
      createMedication(medicationData, {
        onSuccess,
        onError,
      });
    }
  };

  return (
    <>
      {trigger && <span onClick={() => setOpen(true)}>{trigger}</span>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full rounded-2xl">
          <DialogHeader>
            <DialogTitle className="mb-2">
              {editingMedication ? "Edit Medication" : "Add Medication"}
            </DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4 mt-2">
            {/* Error display */}
            {errors.general && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
                {errors.general}
              </div>
            )}

            {/* Medication Name */}
            <div className="space-y-1">
              <label className="block text-xs text-gray-600">
                Medication name
              </label>
              <Input
                type="text"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                className="w-full h-11"
                placeholder="e.g. Aspirin"
              />
            </div>

            {/* Dosage Amount and Unit */}
            <div className="space-y-1">
              <label className="block text-xs text-gray-600">Dosage</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="flex-1 h-11"
                  placeholder="10"
                />
                <Select value={dosageUnit} onValueChange={setDosageUnit}>
                  <SelectTrigger className="min-h-11 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dosageUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-1">
              <label className="block text-xs text-gray-600">Description</label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-11"
                placeholder="e.g. Take Lisinopril 10mg, Dr. Smith Appointment"
              />
            </div>

            {/* Prescribing Doctor and Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs text-gray-600">
                  Prescribing Doctor
                </label>
                <Input
                  type="text"
                  value={prescribingDoctor}
                  onChange={(e) => setPrescribingDoctor(e.target.value)}
                  className="w-full h-11"
                  placeholder="e.g. Dr. Smith"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-gray-600">Status</label>
                <Select
                  value={medicationStatus}
                  onValueChange={setMedicationStatus}
                >
                  <SelectTrigger className="min-h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {medicationStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Start Date and Repeat Frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 w-full">
                <label className="block text-xs text-gray-600">
                  Start date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11"
                  placeholder=""
                />
              </div>
              <div className="space-y-1 w-full">
                <label className="block text-xs text-gray-600">
                  Repeat every
                </label>
                <div className="flex gap-2 items-center ">
                  <Input
                    type="number"
                    min={1}
                    value={repeatEvery}
                    onChange={(e) => setRepeatEvery(Number(e.target.value))}
                    className="text-center h-11 w-full"
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 h-8">
                <Checkbox
                  id="enable-reminders"
                  checked={enableReminders}
                  disabled={!isGoogleConnected}
                  onCheckedChange={(checked) =>
                    setEnableReminders(checked === true)
                  }
                />
                <label
                  htmlFor="enable-reminders"
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                    !isGoogleConnected ? 'opacity-50' : ''
                  }`}
                >
                  Set reminder notifications
                </label>
              </div>
              {!isGoogleConnected && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                  <p className="mb-1">Connect your Google Calendar to enable reminder notifications.</p>
                  <Link 
                    href="/home/account" 
                    className="text-primary hover:underline inline-flex items-center gap-1"
                    onClick={() => setOpen(false)}
                  >
                    Go to Account Settings
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </form>
          <DialogFooter className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 cursor-pointer"
              onClick={handleSave}
              disabled={
                !medicationName || !dosage || !date || isCreating || isUpdating || isCreatingEvent
              }
            >
              {isCreating || isUpdating || isCreatingEvent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreatingEvent ? "Creating reminder..." : editingMedication ? "Updating..." : "Saving..."}
                </>
              ) : editingMedication ? (
                "Update Medication"
              ) : (
                "Save Medication"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
