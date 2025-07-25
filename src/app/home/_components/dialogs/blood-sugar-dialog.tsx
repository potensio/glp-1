import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Droplets } from "lucide-react";
import { useBloodSugar } from "@/hooks/use-blood-sugar";
import { bloodSugarSchema } from "@/lib/services/blood-sugar.service";

const measurementTypes = [
  { label: "Fasting", value: "fasting" },
  { label: "Before Meal", value: "before_meal" },
  { label: "After Meal", value: "after_meal" },
  { label: "Bedtime", value: "bedtime" },
];

export function BloodSugarDialogContent({
  onSave,
  onClose,
}: {
  onSave?: (data: { level: number; type: string }) => void;
  onClose?: () => void;
}) {
  const [measurementType, setMeasurementType] = useState(measurementTypes[0].value);
  const [bloodSugar, setBloodSugar] = useState("");
  const [errors, setErrors] = useState<{ level?: string; measurementType?: string; general?: string }>({});
  const { createBloodSugarEntry, isLoading } = useBloodSugar();

  const handleSave = async () => {
    setErrors({});
    
    // Basic validation
    if (!measurementType || !bloodSugar) {
      setErrors({
        general: "Please fill in all fields.",
      });
      return;
    }

    const bloodSugarValue = parseFloat(bloodSugar);
    if (isNaN(bloodSugarValue)) {
      setErrors({
        level: "Please enter a valid number.",
      });
      return;
    }

    try {
      // Validate with schema
      const validatedData = bloodSugarSchema.parse({
        level: bloodSugarValue,
        measurementType: measurementType as any,
      });

      // Save to database
      await createBloodSugarEntry(validatedData);
      
      onSave?.({ level: bloodSugarValue, type: measurementType });
      onClose?.();
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((err: any) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({
          general: "Failed to save blood sugar entry. Please try again.",
        });
      }
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-red-100 p-3 rounded-full">
            <Droplets className="size-5 text-red-600" />
          </div>
          <DialogTitle className="text-lg font-semibold">Blood Sugar</DialogTitle>
        </div>
        <DialogDescription>
          Track your blood glucose levels throughout the day
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Measurement type selector */}
        <div className="flex flex-col gap-2">
          <label
            className="block text-sm font-medium text-secondary w-full"
            htmlFor="measurement-type-toggle"
          >
            When did you measure?
          </label>

          <div
            id="measurement-type-toggle"
            className="grid grid-cols-2 gap-2 w-full"
          >
            {measurementTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`px-4 py-2 rounded-lg border text-base font-semibold transition-colors flex items-center justify-center min-w-[90px] ${
                  measurementType === type.value
                    ? "bg-background border-primary ring ring-primary text-foreground"
                    : "bg-background border-border text-secondary hover:border-primary"
                }`}
                onClick={() => setMeasurementType(type.value)}
                title={type.label}
                aria-label={type.label}
                disabled={isLoading}
              >
                {type.label}
              </button>
            ))}
          </div>
          {errors.measurementType && (
            <p className="text-sm text-red-500 mt-1">{errors.measurementType}</p>
          )}
        </div>

        {/* Blood sugar input */}
        <div className="flex flex-col items-center gap-4">
          <label className="text-3xl font-bold flex items-baseline">
            <input
              id="blood-sugar-input"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              placeholder="120"
              value={bloodSugar}
              onChange={(e) => {
                if (/^\d*\.?\d*$/.test(e.target.value)) setBloodSugar(e.target.value);
              }}
              className={`h-12 w-24 text-center bg-transparent outline-none border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-0 m-0 text-3xl font-bold appearance-none transition-colors ${
                errors.level ? "border-red-500" : "border-border"
              }`}
              style={{ maxWidth: 120 }}
              aria-label="Blood sugar level in mg/dL"
              disabled={isLoading}
            />
            <span className="text-base font-medium text-gray-500 ml-1">mg/dL</span>
          </label>
          {errors.level && (
            <p className="text-sm text-red-500 mt-1">{errors.level}</p>
          )}
          
          {/* Reference ranges */}
          <div className="text-xs text-secondary text-center space-y-1">
            <div>Normal: 80-130 mg/dL (fasting)</div>
            <div>Normal: &lt;180 mg/dL (after meals)</div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex flex-col mt-2">
        {errors.general && (
          <p className="text-sm text-red-600 mb-4">{errors.general}</p>
        )}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={!bloodSugar || isLoading}
        >
          {isLoading ? "Logging..." : "Log Blood Sugar"}
        </Button>
      </DialogFooter>
    </>
  );
}