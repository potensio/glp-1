import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { Scale } from "lucide-react";
import { useCreateWeightEntry } from "@/hooks/use-weight";
import { toast } from "sonner";

export function WeightDialogContent({
  lastWeight = 165,
  lastDelta = -2.5,
  min = 100,
  max = 500,
  onSave,
  onClose,
}: {
  lastWeight?: number;
  lastDelta?: number;
  min?: number;
  max?: number;
  onSave?: (weight: number) => void;
  onClose?: () => void;
}) {
  const [weight, setWeight] = useState(lastWeight);
  const [inputValue, setInputValue] = useState(String(lastWeight));
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: createWeight, isPending: isLoading } = useCreateWeightEntry();

  const saveWeight = (weightValue: number) => {
    createWeight({ weight: weightValue }, {
      onSuccess: () => {
        toast.success(`Weight logged: ${weightValue} lbs`);
        onSave?.(weightValue);
        onClose?.();
      },
      onError: (error: Error) => {
        toast.error('Failed to log weight. Please try again.');
        console.error('Error saving weight:', error);
       }
    });
  };

  // Keep input and slider in sync
  useEffect(() => {
    setInputValue(String(weight));
  }, [weight]);

  // Autofocus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow any string for typing
    if (/^\d*$/.test(val)) {
      setInputValue(val);
      // Only update slider if valid number
      if (val !== "" && !isNaN(Number(val))) {
        const num = Number(val);
        if (num >= min && num <= max) {
          setWeight(num);
        }
      }
    }
  };

  // On blur, clamp and sync
  const handleInputBlur = () => {
    let num = parseInt(inputValue, 10);
    if (isNaN(num)) num = lastWeight;
    num = Math.max(min, Math.min(max, num));
    setWeight(num);
    setInputValue(String(num));
  };

  // On Enter, save
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      let num = parseInt(inputValue, 10);
      if (isNaN(num)) num = lastWeight;
      num = Math.max(min, Math.min(max, num));
      setWeight(num);
      setInputValue(String(num));
      saveWeight(num);
    }
  };

  return (
    <>
      <DialogHeader>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 p-2 rounded-full">
            <Scale className="h-6 w-6 text-purple-600" />
          </div>
          <DialogTitle className="text-lg font-semibold">Weight</DialogTitle>
        </div>
        <DialogDescription>
          Track your weight progress
        </DialogDescription>
        <Slider
          min={min}
          max={max}
          value={[weight]}
          onValueChange={([val]: number[]) => setWeight(val)}
          className="mb-2 mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 mb-4">
        <label className="text-3xl font-bold flex items-baseline">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="h-12 w-20 text-center bg-transparent outline-none border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-0 m-0 text-3xl font-bold appearance-none transition-colors"
            style={{ maxWidth: 80 }}
            aria-label="Weight in pounds"
          />
          <span className="text-base font-medium text-gray-500 ml-1">lbs</span>
        </label>
        <span className="text-sm text-secondary mx-auto flex items-center gap-1">
          <span className="text-blue-600">↓</span> {Math.abs(lastDelta)} lbs
          from last entry
        </span>
      </div>

      <DialogFooter className="flex flex-col">
        <Button
          className="w-full"
          size={"lg"}
          disabled={isLoading}
          onClick={() => {
            let num = parseInt(inputValue, 10);
            if (isNaN(num)) num = lastWeight;
            num = Math.max(min, Math.min(max, num));
            setWeight(num);
            setInputValue(String(num));
            saveWeight(num);
          }}
        >
          {isLoading ? "Saving..." : "Save Weight"}
        </Button>
      </DialogFooter>
    </>
  );
}
