import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import { useCreateBloodPressureEntry } from "@/hooks/use-blood-pressure";
import { getSystolicStatus, getDiastolicStatus } from "@/lib/services/blood-pressure.service";
import { toast } from "sonner";

export function BloodPressureDialogContent({
  lastSystolic = 120,
  lastDiastolic = 80,
  minSystolic = 70,
  maxSystolic = 200,
  minDiastolic = 40,
  maxDiastolic = 120,
  onClose,
}: {
  lastSystolic?: number;
  lastDiastolic?: number;
  minSystolic?: number;
  maxSystolic?: number;
  minDiastolic?: number;
  maxDiastolic?: number;
  onClose?: () => void;
}) {
  const [systolic, setSystolic] = useState(lastSystolic);
  const [diastolic, setDiastolic] = useState(lastDiastolic);
  const [systolicInput, setSystolicInput] = useState(String(lastSystolic));
  const [diastolicInput, setDiastolicInput] = useState(String(lastDiastolic));
  const systolicRef = useRef<HTMLInputElement>(null);
  const diastolicRef = useRef<HTMLInputElement>(null);

  const { mutate: createBloodPressure, isPending: isCreating } = useCreateBloodPressureEntry();

  const getStatusColor = (status: "low" | "normal" | "high") => {
    switch (status) {
      case "low":
        return "text-blue-600";
      case "normal":
        return "text-green-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getBarColor = (status: "low" | "normal" | "high") => {
    switch (status) {
      case "low":
        return "bg-blue-500";
      case "normal":
        return "bg-green-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    setSystolicInput(String(systolic));
  }, [systolic]);
  useEffect(() => {
    setDiastolicInput(String(diastolic));
  }, [diastolic]);

  // Autofocus systolic on mount
  useEffect(() => {
    systolicRef.current?.focus();
    systolicRef.current?.select();
  }, []);

  // Input handlers
  const handleSystolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setSystolicInput(val);
      if (val !== "" && !isNaN(Number(val))) {
        const num = Number(val);
        if (num >= minSystolic && num <= maxSystolic) {
          setSystolic(num);
        }
      }
    }
  };
  const handleDiastolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setDiastolicInput(val);
      if (val !== "" && !isNaN(Number(val))) {
        const num = Number(val);
        if (num >= minDiastolic && num <= maxDiastolic) {
          setDiastolic(num);
        }
      }
    }
  };

  // Blur handlers
  const handleSystolicBlur = () => {
    let num = parseInt(systolicInput, 10);
    if (isNaN(num)) num = lastSystolic;
    num = Math.max(minSystolic, Math.min(maxSystolic, num));
    setSystolic(num);
    setSystolicInput(String(num));
  };
  const handleDiastolicBlur = () => {
    let num = parseInt(diastolicInput, 10);
    if (isNaN(num)) num = lastDiastolic;
    num = Math.max(minDiastolic, Math.min(maxDiastolic, num));
    setDiastolic(num);
    setDiastolicInput(String(num));
  };

  // Save handler
  const handleSave = () => {
    let sys = parseInt(systolicInput, 10);
    let dia = parseInt(diastolicInput, 10);
    if (isNaN(sys)) sys = lastSystolic;
    if (isNaN(dia)) dia = lastDiastolic;
    sys = Math.max(minSystolic, Math.min(maxSystolic, sys));
    dia = Math.max(minDiastolic, Math.min(maxDiastolic, dia));
    setSystolic(sys);
    setDiastolic(dia);
    setSystolicInput(String(sys));
    setDiastolicInput(String(dia));

    createBloodPressure({ systolic: sys, diastolic: dia }, {
      onSuccess: () => {
        toast.success(`Blood pressure logged: ${sys}/${dia} mmHg`);
        onClose?.();
      },
      onError: (error: Error) => {
        console.error('Error saving blood pressure:', error);
        toast.error('Failed to log blood pressure. Please try again.');
      }
    });
  };

  // Enter key handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  // Bar meter logic
  const systolicPercent =
    ((systolic - minSystolic) / (maxSystolic - minSystolic)) * 100;
  const diastolicPercent =
    ((diastolic - minDiastolic) / (maxDiastolic - minDiastolic)) * 100;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2 justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Blood Pressure
            </DialogTitle>
          </div>
        </div>
        <DialogDescription className="text-muted-foreground text-sm mb-2">
          Enter your blood pressure readings below.
        </DialogDescription>
        <div className="flex gap-8 mb-2">
          <div className="flex-1 flex-col">
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Systolic
            </label>
            <input
              ref={systolicRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={systolicInput}
              onChange={handleSystolicChange}
              onBlur={handleSystolicBlur}
              onKeyDown={handleKeyDown}
              className="w-full text-foreground text-center bg-transparent outline-none border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-2 text-2xl font-bold appearance-none transition-colors"
              aria-label="Systolic"
            />
            <div className="mt-4">
              <div className="w-full h-2 rounded-full bg-gray-200 relative">
                <div
                  className={`h-full rounded-full absolute top-0 left-0 transition-all duration-300 ${getBarColor(
                    getSystolicStatus(systolic)
                  )}`}
                  style={{ width: `${systolicPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low (&lt;100)</span>
                <span>Normal</span>
                <span>High (&gt;140)</span>
              </div>
              <div
                className={`text-center text-sm font-medium mt-2 ${getStatusColor(
                  getSystolicStatus(systolic)
                )}`}
              >
                {getSystolicStatus(systolic)}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Diastolic
            </label>
            <input
              ref={diastolicRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={diastolicInput}
              onChange={handleDiastolicChange}
              onBlur={handleDiastolicBlur}
              onKeyDown={handleKeyDown}
              className="text-foreground w-full text-center bg-transparent outline-none border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-2 text-2xl font-bold appearance-none transition-colors"
              aria-label="Diastolic"
            />
            <div className="mt-4">
              <div className="w-full h-2 rounded-full bg-gray-200 relative">
                <div
                  className={`h-2 rounded-full absolute top-0 left-0 transition-all duration-300 ${getBarColor(
                    getDiastolicStatus(diastolic)
                  )}`}
                  style={{ width: `${diastolicPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low (&lt;60)</span>
                <span>Normal</span>
                <span>High (&gt;90)</span>
              </div>
              <div
                className={`text-center text-sm font-medium mt-2 ${getStatusColor(
                  getDiastolicStatus(diastolic)
                )}`}
              >
                {getDiastolicStatus(diastolic)}
              </div>
            </div>
          </div>
        </div>
      </DialogHeader>
      <DialogFooter className="flex flex-col mt-2">
        <Button
          className="w-full"
          size={"lg"}
          onClick={handleSave}
          disabled={isCreating}
        >
          {isCreating ? "Saving..." : "Save Reading"}
        </Button>
      </DialogFooter>
    </>
  );
}
