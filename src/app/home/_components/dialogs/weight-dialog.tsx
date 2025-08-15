import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRef, useEffect } from "react";
import { Scale } from "lucide-react";
import { useCreateWeightEntry } from "@/hooks/use-weight";
import { toast } from "sonner";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { weightSchema, type WeightInput } from "@/lib/services/weight.service";

export function WeightDialogContent({
  defaultWeight = 165,
  min = 50,
  max = 1000,
  onSave,
  onClose,
}: {
  defaultWeight?: number;
  min?: number;
  max?: number;
  onSave?: (weight: number) => void;
  onClose?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: createWeight, isPending: isLoading } = useCreateWeightEntry();

  const form = useForm<WeightInput>({
    resolver: zodResolver(weightSchema),
    defaultValues: {
      weight: defaultWeight,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const currentWeight = watch("weight");

  const onSubmit: SubmitHandler<WeightInput> = (data) => {
    createWeight(data, {
      onSuccess: () => {
        toast.success(`Weight logged: ${data.weight} lbs`);
        onSave?.(data.weight);
        onClose?.();
      },
      onError: (error: Error) => {
        toast.error("Failed to log weight. Please try again.");
        console.error("Error saving weight:", error);
      },
    });
  };

  // Autofocus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Handle slider change
  const handleSliderChange = ([value]: number[]) => {
    setValue("weight", value, { shouldValidate: true, shouldDirty: true });
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = value === "" ? 0 : parseFloat(value);
      setValue("weight", numValue, { shouldValidate: true, shouldDirty: true });
    }
  };

  // Handle Enter key to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(onSubmit)();
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
        <DialogDescription>Track your weight progress</DialogDescription>
        <Slider
          min={min}
          max={max}
          value={[currentWeight]}
          onValueChange={handleSliderChange}
          className="mb-2 mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1 items-center">
            <input
              ref={inputRef}
              type="text"
              value={currentWeight || ""}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="h-12 w-20 bg-red-400 text-center bg-transparent outline-none border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-0 m-0 text-3xl font-bold appearance-none transition-colors"
              style={{ maxWidth: 80 }}
              aria-label="Weight in pounds"
              placeholder="0"
            />
            <span className="text-base font-medium text-gray-500 ml-1">
              lbs
            </span>
          </div>
          {errors.weight && (
            <p className="text-sm text-red-500 mt-1">{errors.weight.message}</p>
          )}
        </div>
      </div>

      <DialogFooter className="flex flex-col">
        <Button
          className="w-full"
          size={"lg"}
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
          type="button"
        >
          {isLoading ? "Saving..." : "Save Weight"}
        </Button>
      </DialogFooter>
    </>
  );
}
