"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  Sparkles,
  Loader2,
  Plus,
  X,
  Check,
} from "lucide-react";
import { useFoodIntakeByDate, useCreateMultipleFoodIntakeEntries } from "@/hooks/use-food-intake";
import { useEstimateCalories } from "@/hooks/use-calorie-estimation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const mealTypes = [
  { label: "Breakfast", icon: "🌅" },
  { label: "Lunch", icon: "☀️" },
  { label: "Dinner", icon: "🌙" },
  { label: "Snack", icon: "🍎" },
];

interface MealEntry {
  id: string;
  mealType: string;
  food: string;
  calories: string;
  isEstimating?: boolean;
}

export function MultiMealIntakeDialogContent({
  onSave,
  onClose,
}: {
  todayCalories?: number;
  onSave?: () => void;
  onClose?: () => void;
}) {
  // Always use today's date in user's timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate] = useState<Date>(today); // Date is fixed to today, no picker needed

  // Creation functionality with clear-before-submit strategy
  const estimateCaloriesMutation = useEstimateCalories();
  const createMultipleFoodIntakesMutation = useCreateMultipleFoodIntakeEntries();

  // Fetch existing food intake data for today
  const {
    entries: existingEntries,
    isLoading: isLoadingEntries,
    error: loadingError,
  } = useFoodIntakeByDate(selectedDate);

  // Memoize entries length to prevent unnecessary re-renders
  const entriesLength = useMemo(
    () => existingEntries?.length || 0,
    [existingEntries]
  );

  // Pre-load existing data for today when component mounts
  useEffect(() => {
    if (!isLoadingEntries && !loadingError) {
      if (existingEntries && existingEntries.length > 0) {
        const preloadedMeals: MealEntry[] = existingEntries.map(
          (entry: any) => ({
            id: entry.id,
            mealType: entry.mealType,
            food: entry.food,
            calories: entry.calories.toString(),
          })
        );
        setMeals(preloadedMeals);
      } else {
        // Clear meals if no existing data for today
        setMeals([]);
      }
    }
  }, [entriesLength, isLoadingEntries, loadingError, existingEntries]);

  const addMeal = (mealType: string) => {
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      mealType,
      food: "",
      calories: "",
    };
    setMeals([...meals, newMeal]);
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  const updateMeal = (id: string, field: keyof MealEntry, value: string) => {
    setMeals(
      meals.map((meal) => (meal.id === id ? { ...meal, [field]: value } : meal))
    );
  };

  const handleEstimateCalories = async (
    mealId: string,
    foodDescription: string
  ) => {
    if (!foodDescription.trim()) {
      toast.error("Please enter a food description first");
      return;
    }

    // Set estimating state for this specific meal
    setMeals(
      meals.map((meal) =>
        meal.id === mealId ? { ...meal, isEstimating: true } : meal
      )
    );

    estimateCaloriesMutation.mutate(
      { foodDescription },
      {
        onSuccess: (data) => {
          setMeals(
            meals.map((meal) =>
              meal.id === mealId 
                ? { ...meal, calories: data.estimatedCalories.toString(), isEstimating: false } 
                : meal
            )
          );
          toast.success("Calories estimated successfully!");
        },
        onError: (error) => {
          setMeals(
            meals.map((meal) =>
              meal.id === mealId ? { ...meal, isEstimating: false } : meal
            )
          );
          toast.error(error.message || "Failed to estimate calories");
        },
      }
    );
  };

  const handleLogAllMeals = async () => {
    // Validate all meals
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    meals.forEach((meal) => {
      // Validate food description
      if (!meal.food.trim()) {
        newErrors[`food-${meal.id}`] = "Food description is required.";
        hasErrors = true;
      } else if (meal.food.trim().length < 3) {
        newErrors[`food-${meal.id}`] = "Food description must be at least 3 characters.";
        hasErrors = true;
      }

      // Validate calories
      const calories = parseInt(meal.calories);
      if (!meal.calories || isNaN(calories)) {
        newErrors[`calories-${meal.id}`] = "Calories are required.";
        hasErrors = true;
      } else if (calories <= 0) {
        newErrors[`calories-${meal.id}`] = "Calories must be greater than 0.";
        hasErrors = true;
      } else if (calories > 5000) {
        newErrors[`calories-${meal.id}`] = "Calories cannot exceed 5000 per meal.";
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    if (meals.length === 0) {
      toast.error("Please add at least one meal before logging.");
      return;
    }

    // Clear any previous errors
    setErrors({});

    // Prepare entries for submission
    const entries = meals.map((meal) => ({
      mealType: meal.mealType,
      food: meal.food.trim(),
      calories: parseInt(meal.calories),
      capturedDate: selectedDate.toISOString(),
    }));

    // Submit using the clear-before-submit strategy
    createMultipleFoodIntakesMutation.mutate(entries, {
      onSuccess: () => {
        // Reset form and close dialog
        setMeals([]);
        setErrors({});
        toast.success("Food intake entries logged successfully!");
        onSave?.();
        onClose?.();
      },
      onError: (error) => {
        // Error is already handled by the mutation hook with toast
        console.error("Failed to log meals:", error);
      },
    });
  };

  const getTotalCalories = () => {
    return meals.reduce((total, meal) => {
      const calories = parseInt(meal.calories) || 0;
      return total + calories;
    }, 0);
  };

  const getAvailableMealTypes = () => {
    const usedTypes = meals.map((meal) => meal.mealType);
    return mealTypes.filter((type) => !usedTypes.includes(type.label));
  };

  return (
    <>
      <DialogHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-3 rounded-full">
              <Utensils className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Daily Food Intake
              </DialogTitle>
              <div className="text-sm font-normal text-muted-foreground">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              {isLoadingEntries && (
                <span className="text-sm font-normal text-muted-foreground">
                  Loading existing data...
                </span>
              )}
              {loadingError && (
                <span className="text-sm font-normal text-red-500">
                  Failed to load existing data
                </span>
              )}
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-3 max-h-[65vh] overflow-y-auto">
        {/* Add meal buttons */}
        {getAvailableMealTypes().length > 0 && (
          <div className="space-y-2">
            <DialogDescription>Log multiple meals for today</DialogDescription>
            <div className="grid grid-cols-4 gap-1">
              {getAvailableMealTypes().map((type) => (
                <Button
                  key={type.label}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center gap-0.5 hover:bg-primary/5 hover:border-primary"
                  onClick={() => addMeal(type.label)}
                >
                  <span className="text-sm">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Meal entries */}
        {meals.map((meal, index) => (
          <Card key={meal.id} className="p-3 gap-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">
                  {mealTypes.find((t) => t.label === meal.mealType)?.icon}
                </span>
                <h4 className="font-medium text-sm">{meal.mealType}</h4>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEstimateCalories(meal.id, meal.food)}
                disabled={!meal.food.trim() || meal.isEstimating}
                className="text-primary font-medium hover:text-primary/80 h-auto p-1.5"
              >
                {meal.isEstimating ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Estimating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3 text-orange-400" />
                    AI Estimate
                  </>
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              {/* Food input */}
              <div className="space-y-1 w-full">
                <label className="text-xs font-medium text-muted-foreground">
                  What did you eat?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grilled chicken salad"
                  value={meal.food}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 200) {
                      updateMeal(meal.id, "food", value);
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value && value.length < 3) {
                      setErrors((prev) => ({
                        ...prev,
                        [`food-${meal.id}`]:
                          "Food description must be at least 3 characters.",
                      }));
                    }
                  }}
                  className={`w-full h-10 text-foreground bg-transparent outline-none border rounded-md focus:ring-1 focus:ring-primary focus:border-primary p-2 text-sm transition-colors ${
                    errors[`food-${meal.id}`]
                      ? "border-red-500"
                      : "border-border"
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors[`food-${meal.id}`] ? (
                    <span className="text-xs text-red-500">
                      {errors[`food-${meal.id}`]}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {meal.food.length < 3 && meal.food.length > 0
                        ? `Need ${3 - meal.food.length} more characters`
                        : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Calories input */}
              <div className="space-y-1 w-fit">
                <label className="text-xs font-medium text-muted-foreground">
                  Calories
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="350"
                      value={meal.calories}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits and limit to reasonable length
                        if (/^\d*$/.test(value) && value.length <= 4) {
                          updateMeal(meal.id, "calories", value);
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value && parseInt(value) > 5000) {
                          setErrors((prev) => ({
                            ...prev,
                            [`calories-${meal.id}`]:
                              "Calories cannot exceed 5000 per meal.",
                          }));
                        }
                      }}
                      className={`w-16 h-10 text-foreground text-center bg-transparent outline-none border rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-sm font-semibold transition-colors ${
                        errors[`calories-${meal.id}`]
                          ? "border-red-500"
                          : "border-border"
                      }`}
                    />
                    <span className="text-xs font-medium text-muted-foreground ml-1">
                      cal
                    </span>
                  </div>
                </div>

                {errors[`calories-${meal.id}`] && (
                  <span className="text-xs text-red-500">
                    {errors[`calories-${meal.id}`]}
                  </span>
                )}
              </div>
              <div className="flex items-end gap-2 mb-1">
                <Button variant={"outline"} onClick={() => removeMeal(meal.id)}>
                  <X />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty state */}
        {meals.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Utensils className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No meals added yet</p>
            <p className="text-xs opacity-75">
              Start by adding your first meal above
            </p>
          </div>
        )}

        {errors.general && (
          <div className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-md">
            {errors.general}
          </div>
        )}
      </div>

      <DialogFooter className="flex flex-row gap-3 mt-4">
        <Button
          variant="outline"
          className="flex-1 h-11 text-md"
          onClick={onClose}
          disabled={false}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 h-11 text-md"
          onClick={handleLogAllMeals}
          disabled={createMultipleFoodIntakesMutation.isPending || meals.length === 0}
        >
          {createMultipleFoodIntakesMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            <>
              Log All Meals
              {meals.length > 0 && ` (${getTotalCalories()} cal)`}
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
