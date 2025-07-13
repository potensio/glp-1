import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Utensils, Sparkles } from "lucide-react";

const mealTypes = [
  { label: "Breakfast" },
  { label: "Lunch" },
  { label: "Dinner" },
  { label: "Snack" },
];

export function FoodIntakeDialogContent({
  onSave,
}: {
  todayCalories?: number;
  onSave?: (data: { mealType: string; food: string; calories: string }) => void;
}) {
  const [mealType, setMealType] = useState(mealTypes[0].label);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");

  const handleLog = () => {
    onSave?.({ mealType, food, calories });
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
          {/* Meal type label */}
          <label
            className="block text-sm font-medium mb-2 text-secondary w-full"
            htmlFor="meal-type-toggle"
          >
            Select your meal type
          </label>
          {/* Meal time toggle group as 2x2 grid, full width */}
          <div
            id="meal-type-toggle"
            className="grid grid-cols-2 gap-2 mb-6 w-full"
          >
            {mealTypes.map((type) => (
              <button
                key={type.label}
                type="button"
                className={`px-4 py-2 rounded-lg border text-base font-semibold transition-colors flex items-center justify-center min-w-[90px] ${
                  mealType === type.label
                    ? "bg-background border-primary text-foreground"
                    : "bg-background border-border text-gray-700 hover:border-primary"
                }`}
                onClick={() => setMealType(type.label)}
                title={type.label}
                aria-label={type.label}
              >
                {type.label}
              </button>
            ))}
          </div>
          {/* Food input */}
          <div className="flex flex-col mb-3 gap-2">
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
              className="w-full text-foreground text-center bg-transparent outline-none border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-2 text-lg font-medium appearance-none transition-colors"
            />
          </div>
          {/* Calories input like weight dialog */}
          <div className="flex flex-col items-center gap-4 mb-4">
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
                className="w-full h-12 text-foreground text-center bg-transparent outline-none border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-0 m-0 text-3xl font-semibold appearance-none transition-colors"
                style={{ maxWidth: 120 }}
                aria-label="Calories"
              />
              <span className="text-base font-medium text-secondary ml-1">
                cal
              </span>
            </label>
            <span className="text-sm text-primary font-semibold mx-auto flex items-center gap-1">
              Estimate calories with AI{" "}
              <span>
                <Sparkles className="size-4 text-orange-400" />
              </span>
            </span>
          </div>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-col mt-2">
        <Button
          className="w-full"
          size={"lg"}
          onClick={handleLog}
          disabled={!food}
        >
          Log Food
        </Button>
      </DialogFooter>
    </>
  );
}
