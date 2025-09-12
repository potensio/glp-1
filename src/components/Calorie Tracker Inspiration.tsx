"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, ChevronDown, ChevronRight } from "lucide-react"

interface FoodEntry {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Meal {
  entries: FoodEntry[]
}

interface Meals {
  [key: string]: Meal
}

export default function CalorieTrackerPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null)
  const [expandedMeals, setExpandedMeals] = useState<{ [key: string]: boolean }>({})
  const [meals, setMeals] = useState<Meals>({
    Breakfast: {
      entries: [
        { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 2 },
        { name: "Banana", calories: 90, protein: 1, carbs: 23, fat: 0.3 },
      ],
    },
    Lunch: {
      entries: [{ name: "Chicken Salad", calories: 650, protein: 40, carbs: 30, fat: 35 }],
    },
    Dinner: { entries: [] },
  })

  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  })

  const [isCalculating, setIsCalculating] = useState(false)

  const sum = (arr: FoodEntry[], key: keyof FoodEntry): number => {
    return arr.reduce((s, i) => s + (Number(i[key]) || 0), 0)
  }

  const computeTotals = () => {
    const allEntries = Object.values(meals).flatMap((m) => m.entries)
    const totalCalories = sum(allEntries, "calories")
    const totalProtein = sum(allEntries, "protein")
    const totalCarbs = sum(allEntries, "carbs")
    const totalFat = sum(allEntries, "fat")

    return { totalCalories, totalProtein, totalCarbs, totalFat }
  }

  const calculateNutrition = async (foodName: string) => {
    setIsCalculating(true)
    try {
      // Simulate AI calculation with realistic nutritional values
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock AI response based on common foods
      const mockNutrition = {
        apple: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
        banana: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
        chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        bread: { calories: 80, protein: 4, carbs: 14, fat: 1 },
        egg: { calories: 70, protein: 6, carbs: 0.6, fat: 5 },
      }

      const key = foodName.toLowerCase()
      const nutrition = mockNutrition[key as keyof typeof mockNutrition] || {
        calories: 100,
        protein: 3,
        carbs: 15,
        fat: 2,
      }

      setFormData((prev) => ({
        ...prev,
        calories: nutrition.calories.toString(),
        protein: nutrition.protein.toString(),
        carbs: nutrition.carbs.toString(),
        fat: nutrition.fat.toString(),
      }))
    } catch (error) {
      console.error("Error calculating nutrition:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setSelectedMeal(null)
  }

  const openFoodLog = (mealName: string) => {
    setSelectedMeal(mealName)
  }

  const backToMeals = () => {
    setSelectedMeal(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMeal || !formData.name.trim()) return

    const newEntry: FoodEntry = {
      name: formData.name.trim(),
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
    }

    setMeals((prev) => ({
      ...prev,
      [selectedMeal]: {
        entries: [...prev[selectedMeal].entries, newEntry],
      },
    }))

    setFormData({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFoodNameChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, name: value }))

    // Trigger AI calculation when user stops typing (debounced)
    if (value.trim().length > 2) {
      clearTimeout(window.foodNameTimeout)
      window.foodNameTimeout = setTimeout(() => {
        calculateNutrition(value.trim())
      }, 500)
    }
  }

  const toggleMealExpansion = (mealName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedMeals((prev) => ({
      ...prev,
      [mealName]: !prev[mealName],
    }))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const { totalCalories, totalProtein, totalCarbs, totalFat } = computeTotals()
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openModal}
        className="px-5 py-2.5 rounded-xl border border-gray-300 shadow-sm bg-white hover:bg-gray-100 font-medium"
      >
        Open Popup
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          onClick={closeModal}
        >
          <div
            className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-200 ease-out bg-white ${
              isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {!selectedMeal && (
              <div className="relative bg-gradient-to-b from-sky-400 to-sky-300 px-6 pt-6 pb-4 text-center">
                <button
                  onClick={closeModal}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/20 hover:bg-white/30 text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

                <p className="uppercase text-white/90 text-xs tracking-wide">Calories Tracker</p>

                <div className="mx-auto w-36 h-36 rounded-full border-8 border-white/30 flex items-center justify-center text-white font-semibold text-2xl mt-3">
                  {totalCalories}
                  <br />
                  <span className="text-sm font-normal">Calories</span>
                </div>

                {/* Macros totals */}
                <div className="mt-4 grid grid-cols-3 text-white text-xs gap-2">
                  <div className="text-center">
                    <p className="font-bold text-sm">{Math.round(totalProtein)}g</p>
                    <p className="opacity-80">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm">{Math.round(totalCarbs)}g</p>
                    <p className="opacity-80">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm">{Math.round(totalFat)}g</p>
                    <p className="opacity-80">Fat</p>
                  </div>
                </div>
              </div>
            )}

            {selectedMeal && (
              <div className="relative bg-white px-6 pt-4">
                <button
                  onClick={closeModal}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="bg-white px-6 py-4 space-y-4">
              <div className="flex items-center justify-center text-gray-500 text-sm">{currentDate}</div>

              {/* Meal List View */}
              {!selectedMeal && (
                <div className="space-y-4">
                  {Object.entries(meals).map(([name, meal]) => {
                    const count = meal.entries.length
                    const cal = sum(meal.entries, "calories")
                    const isExpanded = expandedMeals[name]

                    return (
                      <div key={name} className="border rounded-xl overflow-hidden hover:bg-gray-50 transition">
                        <div className="p-4 flex justify-between items-center">
                          <div onClick={() => openFoodLog(name)} className="cursor-pointer flex-1">
                            <div className="font-semibold">{name}</div>
                            <div className="text-sm text-gray-500">
                              {count > 0 ? `${count} food${count > 1 ? "s" : ""} logged` : "No food logged"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">{cal} cal</div>
                            {count > 0 && (
                              <button
                                onClick={(e) => toggleMealExpansion(name, e)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label={isExpanded ? "Collapse" : "Expand"}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && count > 0 && (
                          <div className="px-4 pb-4 space-y-2 border-t bg-gray-50/50">
                            <div className="text-xs text-gray-500 pt-3 pb-1">Food entries:</div>
                            {meal.entries.map((entry, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center py-2 px-3 bg-white rounded-lg text-sm"
                              >
                                <div className="truncate">{entry.name}</div>
                                <div className="font-medium text-gray-600">{entry.calories} cal</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Food Log View */}
              {selectedMeal && (
                <div>
                  <button onClick={backToMeals} className="text-sm text-blue-600 mb-3">
                    ← Back
                  </button>
                  <div className="text-lg font-semibold mb-4">Add food to {selectedMeal}</div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        value={formData.name}
                        onChange={(e) => handleFoodNameChange(e.target.value)}
                        required
                        className="w-full border rounded-lg px-3 py-3 text-lg font-medium"
                        placeholder="Enter food name (e.g., apple, chicken breast)"
                      />
                      {isCalculating && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 -mt-1">
                      Nutritional values will be calculated automatically. You can edit them below.
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={formData.calories}
                        onChange={(e) => handleInputChange("calories", e.target.value)}
                        required
                        inputMode="numeric"
                        pattern="\\d*"
                        className="border rounded-lg px-3 py-2"
                        placeholder="Calories (kcal)"
                      />
                      <input
                        value={formData.protein}
                        onChange={(e) => handleInputChange("protein", e.target.value)}
                        inputMode="decimal"
                        className="border rounded-lg px-3 py-2"
                        placeholder="Protein (g)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={formData.carbs}
                        onChange={(e) => handleInputChange("carbs", e.target.value)}
                        inputMode="decimal"
                        className="border rounded-lg px-3 py-2"
                        placeholder="Carbs (g)"
                      />
                      <input
                        value={formData.fat}
                        onChange={(e) => handleInputChange("fat", e.target.value)}
                        inputMode="decimal"
                        className="border rounded-lg px-3 py-2"
                        placeholder="Fat (g)"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
                      disabled={isCalculating}
                    >
                      {isCalculating ? "Calculating..." : "Add food"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

declare global {
  interface Window {
    foodNameTimeout: NodeJS.Timeout
  }
}
