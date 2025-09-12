"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, Utensils, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEstimateNutrition, useGetUnitSuggestions } from "@/hooks/use-calorie-estimation";
import { useCreateFoodEntry, createFoodEntryFromEstimation, useFoodIntakeByDate } from "@/hooks/use-food-intake";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import type { CalorieEstimationResponse } from "@/lib/services/ai-calorie-estimation.service";

interface FoodEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  entries: FoodEntry[];
}

interface Meals {
  [key: string]: Meal;
}

interface BlankFoodDialogProps {
  onSave?: () => void;
  onClose?: () => void;
}

export function BlankFoodDialog({ onSave, onClose }: BlankFoodDialogProps) {
  const { profile } = useAuth();
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate] = useState<Date>(today);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'food-name' | 'quantity' | 'nutrition'>('food-name');
  const [expandedMeals, setExpandedMeals] = useState<{
    [key: string]: boolean;
  }>({});

  // Real data from hooks
  const { entries: foodEntries } = useFoodIntakeByDate(selectedDate);
  const createFoodEntry = useCreateFoodEntry();
  const estimateNutrition = useEstimateNutrition();
  const getUnitSuggestions = useGetUnitSuggestions();

  // Group entries by meal type
  const meals = useMemo(() => {
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    const groupedMeals: Meals = {};
    
    mealTypes.forEach(mealType => {
      const mealEntries = foodEntries.filter((entry: any) => 
        entry.mealType?.toLowerCase() === mealType.toLowerCase()
      ).map((entry: any) => ({
        name: entry.food || 'Unknown Food',
        calories: entry.calories || 0,
        protein: entry.protein || 0,
        carbs: entry.carbs || 0,
        fat: entry.fat || 0,
      }));
      
      groupedMeals[mealType] = { entries: mealEntries };
    });
    
    return groupedMeals;
  }, [foodEntries]);

  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const [quantityData, setQuantityData] = useState({
    amount: "",
    unit: "",
    availableUnits: [] as string[]
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [nutritionData, setNutritionData] = useState<CalorieEstimationResponse | null>(null);

  const sum = (arr: FoodEntry[], key: keyof FoodEntry): number => {
    return arr.reduce((s, i) => s + (Number(i[key]) || 0), 0);
  };

  const computeTotals = () => {
    const allEntries = Object.values(meals).flatMap((m) => m.entries);
    const totalCalories = sum(allEntries, "calories");
    const totalProtein = sum(allEntries, "protein");
    const totalCarbs = sum(allEntries, "carbs");
    const totalFat = sum(allEntries, "fat");

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  // Real nutrition calculation using AI service
  const calculateNutrition = async (foodName: string, quantity?: number, unit?: string) => {
    if (!foodName.trim()) return;
    
    setIsCalculating(true);
    
    try {
      const result = await estimateNutrition.mutateAsync({
        foodDescription: foodName,
        quantity: quantity || 1,
        unit: unit || 'serving'
      });
      
      setNutritionData(result);
      
      setFormData((prev) => ({
         ...prev,
         calories: (result.calories || 0).toString(),
         protein: (result.nutrition?.protein || 0).toString(),
         carbs: (result.nutrition?.carbs || 0).toString(),
         fat: (result.nutrition?.fat || 0).toString(),
       }));
    } catch (error) {
      console.error('Failed to estimate nutrition:', error);
      // Fallback to mock data on error
      const mockNutrition = {
        apple: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
        banana: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
        chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        bread: { calories: 80, protein: 4, carbs: 14, fat: 1 },
        egg: { calories: 70, protein: 6, carbs: 0.6, fat: 5 },
      };

      const key = foodName.toLowerCase();
      const nutrition = mockNutrition[key as keyof typeof mockNutrition] || {
        calories: 100,
        protein: 3,
        carbs: 15,
        fat: 2,
      };

      setFormData((prev) => ({
        ...prev,
        calories: (nutrition.calories || 0).toString(),
        protein: (nutrition.protein || 0).toString(),
        carbs: (nutrition.carbs || 0).toString(),
        fat: (nutrition.fat || 0).toString(),
      }));
    } finally {
      setIsCalculating(false);
    }
  };

  const openFoodLog = (mealName: string) => {
    setSelectedMeal(mealName);
  };

  const backToMeals = () => {
    setSelectedMeal(null);
    setCurrentStep('food-name');
    setFormData({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
    setQuantityData({
      amount: "",
      unit: "",
      availableUnits: []
    });
    setNutritionData(null);
  };

  const backToFoodName = () => {
    setCurrentStep('food-name');
    setQuantityData({
      amount: "",
      unit: "",
      availableUnits: []
    });
  };

  const backToQuantity = () => {
    setCurrentStep('quantity');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeal || !formData.name.trim() || !nutritionData) return;

    try {
      // Generate dateCode using client-side local timezone in DDMMYYYY format
      const localDate = new Date(selectedDate);
      const day = localDate.getDate().toString().padStart(2, "0");
      const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
      const year = localDate.getFullYear().toString();
      const dateCode = `${day}${month}${year}`;
      
      // Use the user's edited values from formData instead of original estimation
      const foodEntryData = {
        mealType: selectedMeal,
        food: formData.name,
        calories: parseFloat(formData.calories) || 0,
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fat: parseFloat(formData.fat) || 0,
        fiber: nutritionData.nutrition.fiber || 0, // Keep original fiber value
        quantity: nutritionData.estimatedPortion?.quantity || 1,
        unit: nutritionData.estimatedPortion?.unit || "serving",
        capturedDate: selectedDate.toISOString().split('T')[0],
        dateCode: dateCode // Add client-generated dateCode
      };

      await createFoodEntry.mutateAsync(foodEntryData);

      // Reset form
      setFormData({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
      });
      setNutritionData(null);
      setCurrentStep('food-name');
      setSelectedMeal(null);
      
      // Call onSave if provided
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save food entry:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFoodNameChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));

    // Trigger AI calculation when user stops typing (debounced)
    if (value.trim().length > 2) {
      clearTimeout((window as any).foodNameTimeout);
      (window as any).foodNameTimeout = setTimeout(() => {
        calculateNutrition(value.trim());
      }, 500);
    }
  };

  const handleFoodNameSubmit = async () => {
    if (formData.name.trim()) {
      try {
        // Get AI-powered unit suggestions
        const suggestedUnits = await getUnitSuggestions.mutateAsync(formData.name.trim());
        
        setQuantityData({
          amount: "",
          unit: suggestedUnits[0] || 'serving', // Use first suggested unit or fallback
          availableUnits: suggestedUnits
        });
        setCurrentStep('quantity');
      } catch (error) {
        console.error('Failed to get unit suggestions:', error);
        // Fallback to default units if AI fails
        const fallbackUnits = ['serving', 'cup', 'gram', 'ounce', 'piece'];
        setQuantityData({
          amount: "",
          unit: fallbackUnits[0],
          availableUnits: fallbackUnits
        });
        setCurrentStep('quantity');
      }
    }
  };

  const handleQuantitySubmit = () => {
    if (quantityData.amount.trim()) {
      calculateNutrition(formData.name, parseFloat(quantityData.amount), quantityData.unit);
      setCurrentStep('nutrition');
    }
  };

  const toggleMealExpansion = (mealName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMeals((prev) => ({
      ...prev,
      [mealName]: !prev[mealName],
    }));
  };

  const { totalCalories, totalProtein, totalCarbs, totalFat } = computeTotals();

  return (
    <div className="w-full max-w-md">
      {!selectedMeal && (
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
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Total Macros */}
          <div className="mt-6">
            <div className="bg-gradient-to-b from-green-500 to-green-400 rounded-2xl p-6 text-center text-white mb-6">
              <div className="mx-auto w-28 h-28 rounded-full border-8 border-white/30 flex flex-col items-center justify-center font-semibold text-2xl">
                <span>{totalCalories}</span>
                <span className="text-sm font-normal">Calories</span>
              </div>

              {/* Macros totals */}
              <div className="mt-4 grid grid-cols-3 text-xs gap-2">
                <div className="text-center">
                  <p className="font-bold text-lg">
                    {Math.round(totalProtein)}g
                  </p>
                  <p className="opacity-80">Protein</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{Math.round(totalCarbs)}g</p>
                  <p className="opacity-80">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{Math.round(totalFat)}g</p>
                  <p className="opacity-80">Fat</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedMeal && (
        <>
          <DialogHeader>
            <DialogTitle>Add food to {selectedMeal}</DialogTitle>
          </DialogHeader>
        </>
      )}

      {/* Body */}
      <div className="space-y-4">
        {/* Meal List View */}
        {!selectedMeal && (
          <div className="space-y-4">
            {Object.entries(meals).map(([name, meal]: [string, Meal]) => {
              const count = meal.entries.length;
              const cal = sum(meal.entries, "calories");
              const isExpanded = expandedMeals[name];

              return (
                <div
                  key={name}
                  className="border rounded-xl overflow-hidden transition-all cursor-pointer"
                  onClick={(e) => toggleMealExpansion(name, e)}
                >
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold">{name}</div>
                      <div className="text-sm text-gray-500">
                        {count > 0
                          ? `${count} food${count > 1 ? "s" : ""} logged`
                          : "No food logged"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">{cal} cal</div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openFoodLog(name);
                        }}
                        variant={"secondary"}
                        className="rounded-full size-10"
                        aria-label={`Add food to ${name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {count > 0 && (
                        <Button
                          onClick={(e) => toggleMealExpansion(name, e)}
                          variant={"ghost"}
                          className="rounded-full size-10"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {isExpanded && count > 0 && (
                    <div className="px-4 py-4 space-y-2 border-t">
                      {meal.entries.map((entry: FoodEntry, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 px-3 rounded-lg text-sm"
                        >
                          <div className="truncate">{entry.name}</div>
                          <div className="font-medium text-gray-600">
                            {entry.calories} cal
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Food Log View */}
        {selectedMeal && (
          <div className="mt-6">
            {/* Step 1: Food Name Entry */}
            {currentStep === 'food-name' && (
              <>
                <Button
                  onClick={backToMeals}
                  variant={"secondary"}
                  className="mb-3"
                >
                  ← Back to meals
                </Button>

                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">What did you eat?</h3>
                    <p className="text-sm text-gray-500">Enter the name of the food item</p>
                  </div>
                  
                  <div className="relative">
                    <input
                      value={formData.name}
                      onChange={(e) => handleFoodNameChange(e.target.value)}
                      className="w-full border rounded-lg px-4 py-4 text-lg font-medium text-center"
                      placeholder="e.g., apple, coffee, chicken breast"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFoodNameSubmit();
                        }
                      }}
                    />
                  </div>

                  <Button
                    onClick={handleFoodNameSubmit}
                    className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
                    disabled={!formData.name.trim() || getUnitSuggestions.isPending}
                  >
                    {getUnitSuggestions.isPending ? 'Getting suggestions...' : 'Continue'}
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Quantity Selection */}
            {currentStep === 'quantity' && (
              <>
                <Button
                  onClick={backToFoodName}
                  variant={"secondary"}
                  className="mb-3"
                >
                  ← Back
                </Button>

                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">How much {formData.name}?</h3>
                    <p className="text-sm text-gray-500">Select the quantity and unit</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        value={quantityData.amount}
                        onChange={(e) => setQuantityData(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full border rounded-lg px-4 py-4 text-lg font-medium text-center"
                        placeholder="Enter amount (e.g., 1, 2.5)"
                        inputMode="decimal"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuantitySubmit();
                          }
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {quantityData.availableUnits.map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setQuantityData(prev => ({ ...prev, unit }))}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            quantityData.unit === unit
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>

                    <div className="text-center text-sm text-gray-500">
                      Selected: {quantityData.amount} {quantityData.unit}
                    </div>
                  </div>

                  <Button
                    onClick={handleQuantitySubmit}
                    className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
                    disabled={!quantityData.amount.trim()}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Nutrition Details */}
            {currentStep === 'nutrition' && (
              <>
                <Button
                  onClick={backToQuantity}
                  variant={"secondary"}
                  className="mb-3"
                >
                  ← Back
                </Button>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      {quantityData.amount} {quantityData.unit} of {formData.name}
                    </h3>
                    <p className="text-sm text-gray-500">Review and adjust nutritional values</p>
                  </div>

                  {isCalculating && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Calculating nutrition...</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Calories</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.calories}
                        onChange={(e) => handleInputChange("calories", e.target.value)}
                        required
                        inputMode="numeric"
                        pattern="\\d*"
                        className="w-full border rounded-lg px-3 py-3 text-center font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Protein (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.protein}
                        onChange={(e) => handleInputChange("protein", e.target.value)}
                        inputMode="decimal"
                        className="w-full border rounded-lg px-3 py-3 text-center font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.carbs}
                        onChange={(e) => handleInputChange("carbs", e.target.value)}
                        inputMode="decimal"
                        className="w-full border rounded-lg px-3 py-3 text-center font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fat (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.fat}
                        onChange={(e) => handleInputChange("fat", e.target.value)}
                        inputMode="decimal"
                        className="w-full border rounded-lg px-3 py-3 text-center font-medium"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Nutritional values are estimated. You can adjust them as needed.
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
                    disabled={isCalculating}
                  >
                    {isCalculating ? "Calculating..." : "Add to " + selectedMeal}
                  </Button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
