import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Utensils, Sparkles, Loader2 } from "lucide-react";
import { useFoodIntake } from "@/hooks/use-food-intake";

const mealTypes = [
  { label: "Breakfast" },
  { label: "Lunch" },
  { label: "Dinner" },
  { label: "Snack" },
];

export function FoodIntakeDialogContent({
  onSave,
  onClose,
}: {
  todayCalories?: number;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const [mealType, setMealType] = useState(mealTypes[0].label);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createFoodIntake, isCreating } = useFoodIntake();

  const handleLog = () => {
    setErrors({});

    // Basic validation
    if (!mealType || !food || !calories) {
      setErrors({
        general: "Please fill in all fields.",
      });
      return;
    }

    const caloriesValue = parseInt(calories);
    if (isNaN(caloriesValue)) {
      setErrors({
        calories: "Please enter a valid number.",
      });
      return;
    }

    createFoodIntake({
      mealType,
      food,
      calories: caloriesValue,
    });

    // Reset and close
    setFood("");
    setCalories("");
    setMealType(mealTypes[0].label);
    onSave?.();
    onClose?.();
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2 justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Utensils className="size-5 text-green-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Food Intake
            </DialogTitle>
          </div>
        </div>
        <DialogDescription>
          Log your food intake and track calories for better health monitoring.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Meal type label */}
        <div>
          <label
            className="block text-sm font-medium mb-2 text-secondary w-full"
            htmlFor="meal-type-toggle"
          >
            Select your meal type
          </label>
          {/* Meal time toggle group as 2x2 grid, full width */}
          <div id="meal-type-toggle" className="grid grid-cols-2 gap-2 w-full">
            {mealTypes.map((type) => (
              <button
                key={type.label}
                type="button"
                className={`px-4 py-2 rounded-lg border text-base font-semibold transition-colors flex items-center justify-center min-w-[90px] ${
                  mealType === type.label
                    ? "bg-primary/10 border-primary ring ring-primary text-foreground"
                    : "bg-background border-border text-secondary hover:border-primary"
                } cursor-pointer`}
                onClick={() => setMealType(type.label)}
                title={type.label}
                aria-label={type.label}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food input */}
        <div className="flex flex-col gap-2">
          <label
            className="block text-sm font-medium text-gray-600"
            htmlFor="food-input"
          >
            What did you eat?
          </label>
          <input
            id="food-input"
            type="text"
            placeholder="e.g. Grilled chicken salad, oatmeal, etc."
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className={`w-full text-foreground text-center bg-transparent outline-none border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-2 text-lg font-medium appearance-none transition-colors ${
              errors.food ? "border-red-500" : "border-border"
            }`}
          />
          {errors.food && (
            <span className="text-sm text-red-500">{errors.food}</span>
          )}
        </div>

        {/* Calories input like weight dialog */}
        <div className="flex flex-col items-center gap-4">
          <label className="text-3xl font-bold flex items-baseline">
            <input
              id="calories-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="350"
              value={calories}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setCalories(e.target.value);
              }}
              className={`w-full h-12 text-foreground text-center bg-transparent outline-none border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-0 m-0 text-3xl font-semibold appearance-none transition-colors ${
                errors.calories ? "border-red-500" : "border-border"
              }`}
              style={{ maxWidth: 120 }}
              aria-label="Calories"
            />
            <span className="text-base font-medium text-secondary ml-1">
              cal
            </span>
          </label>
          {errors.calories && (
            <span className="text-sm text-red-500 text-center">
              {errors.calories}
            </span>
          )}
          <span className="text-sm text-primary font-semibold mx-auto flex items-center gap-1">
            Estimate calories with AI{" "}
            <span>
              <Sparkles className="size-4 text-orange-400" />
            </span>
          </span>
        </div>
      </div>

      <DialogFooter className="flex flex-col mt-6">
        <Button
          className="w-full"
          size={"lg"}
          onClick={handleLog}
          disabled={!food || !calories || isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            "Log Food"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
