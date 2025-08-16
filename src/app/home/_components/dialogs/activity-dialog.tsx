import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Footprints } from "lucide-react";
import { useCreateActivity } from "@/hooks/use-activity";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";

const activityTypes = ["🚶🏻 Walking", "🏃🏻 Running", "🚴 Cycling", "🏊🏻 Swimming"];

export function ActivityDialogContent({
  onSave,
  onClose,
  initialDate,
}: {
  stepsToday?: number;
  minutesActive?: number;
  goalSteps?: number;
  onSave?: (data: { type: string; duration: string }) => void;
  onClose?: () => void;
  initialDate?: Date;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || new Date()
  );
  const [type, setType] = useState(activityTypes[0]);
  const [duration, setDuration] = useState("");
  
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();

  const handleSave = () => {
    if (!type || !duration) return;

    const durationMinutes = parseInt(duration);
    if (isNaN(durationMinutes)) return;

    createActivity(
      {
        type,
        duration: durationMinutes,
        capturedDate: selectedDate.toISOString(),
      },
      {
        onSuccess: () => {
          toast.success(`${type} logged: ${durationMinutes} minutes`);
          onSave?.({ type, duration });
          onClose?.();
        },
        onError: () => {
          toast.error('Failed to log activity. Please try again.');
        }
      }
    );
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2 justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Footprints className="size-5 text-orange-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Activity
            </DialogTitle>
          </div>
          
          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium mb-1 text-gray-600">
          Activity Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {activityTypes.map((t) => (
            <button
              key={t}
              type="button"
              className={`px-4 py-3 rounded-lg border text-base font-semibold transition-colors flex items-center justify-center min-w-[90px] cursor-pointer ${
                type === t
                  ? "bg-primary/10 border-primary ring ring-primary text-foreground"
                  : "bg-background border-border text-secondary hover:border-primary"
              } cursor-pointer`}
              onClick={() => setType(t)}
              title={t}
              aria-label={t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 mb-4">
        <label className="text-3xl font-bold flex items-baseline">
          <input
            id="activity-duration"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="30"
            value={duration}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) setDuration(e.target.value);
            }}
            className="h-12 w-24 text-center bg-transparent outline-none border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-0 m-0 text-3xl font-bold appearance-none transition-colors"
            style={{ maxWidth: 120 }}
            aria-label="Duration in minutes"
          />
          <span className="text-base font-medium text-secondary ml-1">
            mins
          </span>
        </label>
      </div>
      

      <DialogFooter className="flex flex-col mt-2">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={!duration || !type || isCreating}
        >
          {isCreating ? "Logging..." : "Log Activity"}
        </Button>
      </DialogFooter>
    </>
  );
}
