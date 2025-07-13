import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Footprints } from "lucide-react";

const activityTypes = ["🚶🏻 Walking", "🏃🏻 Running", "🚴 Cycling", "🏊🏻 Swimming"];

export function ActivityDialogContent({
  onSave,
}: {
  stepsToday?: number;
  minutesActive?: number;
  goalSteps?: number;
  onSave?: (data: { type: string; duration: string }) => void;
}) {
  const [type, setType] = useState(activityTypes[0]);
  const [duration, setDuration] = useState("");

  const handleSave = () => {
    onSave?.({ type, duration });
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
        </div>
      </DialogHeader>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-600">
          Activity Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {activityTypes.map((t) => (
            <button
              key={t}
              type="button"
              className={`px-4 py-3 rounded-lg border text-base font-semibold transition-colors flex items-center justify-center min-w-[90px] ${
                type === t
                  ? "bg-background border-primary ring ring-primary text-foreground"
                  : "bg-background border-border text-secondary hover:border-primary"
              }`}
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
          <span className="text-base font-medium text-gray-500 ml-1">
            minutes
          </span>
        </label>
      </div>
      <DialogFooter className="flex flex-col mt-2">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={!duration || !type}
        >
          Log Activity
        </Button>
      </DialogFooter>
    </>
  );
}
