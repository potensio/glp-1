interface CalorieEstimationRequest {
  foodDescription: string;
  quantity?: number;
  unit?: string;
}

interface NutritionBreakdown {
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  fiber: number;    // grams
}

interface PortionSuggestion {
  quantity: number;
  unit: string;
  description: string;
}

interface CalorieEstimationResponse {
  calories: number;
  confidence: number;
  nutrition: NutritionBreakdown;
  portionSuggestions: PortionSuggestion[];
  estimatedPortion?: {
    quantity: number;
    unit: string;
  };
}

type AIProvider = 'openai' | 'openrouter';

class AICalorieEstimationService {
  private provider: AIProvider;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || 'openrouter';
    this.apiKey = process.env.AI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('AI_API_KEY environment variable is required');
    }

    // Configure based on provider
    if (this.provider === 'openai') {
      this.baseUrl = 'https://api.openai.com/v1';
      this.model = 'gpt-4o-mini';
    } else {
      this.baseUrl = 'https://openrouter.ai/api/v1';
      this.model = 'anthropic/claude-3.5-haiku';
    }
  }

  async estimateCalories(request: CalorieEstimationRequest): Promise<CalorieEstimationResponse> {
    const quantityInfo = request.quantity && request.unit ? ` (${request.quantity} ${request.unit})` : '';
    
    const prompt = `Analyze the following food description and provide comprehensive nutritional information:

"${request.foodDescription}${quantityInfo}"

Please respond with a JSON object containing:
- calories: estimated total calories (number)
- confidence: confidence level from 0-1 (number)
- nutrition: object with protein, carbs, fat, fiber in grams (required)
- portionSuggestions: array of 3-5 common portion options with quantity, unit, and description
- estimatedPortion: best guess at the actual portion described (optional)

Example response:
{
  "calories": 350,
  "confidence": 0.8,
  "nutrition": {
    "protein": 25,
    "carbs": 30,
    "fat": 15,
    "fiber": 5
  },
  "portionSuggestions": [
    { "quantity": 1, "unit": "cup", "description": "Standard cup serving" },
    { "quantity": 0.5, "unit": "cup", "description": "Half cup" },
    { "quantity": 100, "unit": "grams", "description": "100g portion" }
  ],
  "estimatedPortion": {
    "quantity": 1,
    "unit": "cup"
  }
}

Only respond with valid JSON, no additional text.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.provider === 'openrouter' && {
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'GLP-1 Health Tracker'
          })
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from AI API');
      }

      // Parse the JSON response
      const result = JSON.parse(content.trim());
      
      // Validate the response structure
      if (typeof result.calories !== 'number' || typeof result.confidence !== 'number') {
        throw new Error('Invalid response format from AI API');
      }

      return {
        calories: Math.round(result.calories),
        confidence: Math.max(0, Math.min(1, result.confidence)),
        nutrition: result.nutrition || {
          protein: result.breakdown?.protein || 0,
          carbs: result.breakdown?.carbs || 0,
          fat: result.breakdown?.fat || 0,
          fiber: result.breakdown?.fiber || 0
        },
        portionSuggestions: result.portionSuggestions || [],
        estimatedPortion: result.estimatedPortion
      };

    } catch (error) {
      console.error('AI calorie estimation error:', error);
      
      // Fallback estimation based on food description length and common keywords
      const fallbackCalories = this.getFallbackEstimation(request.foodDescription);
      
      return {
        calories: fallbackCalories,
        confidence: 0.3, // Low confidence for fallback
        nutrition: {
          protein: Math.round(fallbackCalories * 0.15 / 4), // ~15% protein
          carbs: Math.round(fallbackCalories * 0.50 / 4),   // ~50% carbs
          fat: Math.round(fallbackCalories * 0.35 / 9),     // ~35% fat
          fiber: Math.round(fallbackCalories * 0.02)        // ~2% fiber
        },
        portionSuggestions: [
          { quantity: 1, unit: "serving", description: "Standard serving" },
          { quantity: 0.5, unit: "serving", description: "Half serving" },
          { quantity: 1.5, unit: "serving", description: "Large serving" }
        ]
      };
    }
  }

  private getFallbackEstimation(foodDescription: string): number {
    const description = foodDescription.toLowerCase();
    let baseCalories = 200; // Default base

    // High-calorie keywords
    const highCalorieKeywords = ['pizza', 'burger', 'fries', 'cake', 'ice cream', 'chocolate', 'fried'];
    const mediumCalorieKeywords = ['chicken', 'beef', 'pasta', 'rice', 'bread', 'cheese'];
    const lowCalorieKeywords = ['salad', 'vegetables', 'fruit', 'soup', 'yogurt'];

    if (highCalorieKeywords.some(keyword => description.includes(keyword))) {
      baseCalories = 500;
    } else if (mediumCalorieKeywords.some(keyword => description.includes(keyword))) {
      baseCalories = 300;
    } else if (lowCalorieKeywords.some(keyword => description.includes(keyword))) {
      baseCalories = 150;
    }

    // Adjust based on portion indicators
    if (description.includes('large') || description.includes('big')) {
      baseCalories *= 1.5;
    } else if (description.includes('small') || description.includes('mini')) {
      baseCalories *= 0.7;
    }

    return Math.round(baseCalories);
  }

  getProviderInfo() {
    return {
      provider: this.provider,
      model: this.model,
      baseUrl: this.baseUrl
    };
  }
}

// Export singleton instance
export const aiCalorieEstimationService = new AICalorieEstimationService();

// Export types
export type { 
  CalorieEstimationRequest, 
  CalorieEstimationResponse, 
  NutritionBreakdown,
  PortionSuggestion,
  AIProvider 
};