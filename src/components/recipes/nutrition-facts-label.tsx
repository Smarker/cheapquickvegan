/**
 * Nutrition Facts Label Component
 *
 * FDA-style nutrition label for displaying recipe nutrition information
 */

import { NutritionInfo } from '@/types/ingredient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NutritionFactsLabelProps {
  nutrition: NutritionInfo;
}

export function NutritionFactsLabel({ nutrition }: NutritionFactsLabelProps) {
  // Don't render if no nutrition data
  if (!nutrition.calories) {
    return null;
  }

  // Calculate daily value percentages (based on 2000 calorie diet)
  const getDailyValue = (nutrient: string, amount?: number): string | null => {
    if (!amount) return null;

    const dailyValues: Record<string, number> = {
      totalFat: 78, // 78g
      saturatedFat: 20, // 20g
      cholesterol: 300, // 300mg
      sodium: 2300, // 2300mg
      totalCarbohydrates: 275, // 275g
      dietaryFiber: 28, // 28g
      vitaminD: 20, // 20mcg
      calcium: 1300, // 1300mg
      iron: 18, // 18mg
      potassium: 4700, // 4700mg
    };

    const dv = dailyValues[nutrient];
    if (!dv) return null;

    const percentage = Math.round((amount / dv) * 100);
    return `${percentage}%`;
  };

  return (
    <Card className="w-full max-w-sm border-2 border-black">
      <CardHeader className="border-b-8 border-black pb-1 pt-3">
        <CardTitle className="text-2xl font-black">Nutrition Facts</CardTitle>
        {nutrition.servingsPerRecipe && (
          <div className="text-sm font-bold pt-1 border-t-4 border-black">
            {nutrition.servingsPerRecipe} servings per recipe
          </div>
        )}
        {nutrition.servingSize && (
          <div className="text-xs font-bold">
            <span className="font-bold">Serving size</span>{' '}
            <span className="font-normal">{nutrition.servingSize}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-2 font-mono">
        {/* Calories */}
        <div className="border-t-4 border-black py-1">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold">Amount per serving</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-black">Calories</span>
            <span className="text-3xl font-black">{nutrition.calories}</span>
          </div>
        </div>

        {/* Daily Value header */}
        <div className="border-t-4 border-black py-0.5">
          <div className="text-right text-xs font-bold">% Daily Value*</div>
        </div>

        {/* Total Fat */}
        {nutrition.totalFat !== undefined && (
          <div className="border-t border-black py-1 flex justify-between">
            <div>
              <span className="font-bold">Total Fat</span> {nutrition.totalFat}g
            </div>
            <div className="font-bold">{getDailyValue('totalFat', nutrition.totalFat)}</div>
          </div>
        )}

        {/* Saturated Fat */}
        {nutrition.saturatedFat !== undefined && (
          <div className="border-t border-gray-300 py-1 pl-4 flex justify-between text-sm">
            <div>Saturated Fat {nutrition.saturatedFat}g</div>
            <div className="font-bold">
              {getDailyValue('saturatedFat', nutrition.saturatedFat)}
            </div>
          </div>
        )}

        {/* Trans Fat */}
        {nutrition.transFat !== undefined && (
          <div className="border-t border-gray-300 py-1 pl-4 flex justify-between text-sm">
            <div>
              <span className="italic">Trans</span> Fat {nutrition.transFat}g
            </div>
          </div>
        )}

        {/* Cholesterol */}
        {nutrition.cholesterol !== undefined && (
          <div className="border-t border-black py-1 flex justify-between">
            <div>
              <span className="font-bold">Cholesterol</span> {nutrition.cholesterol}mg
            </div>
            <div className="font-bold">{getDailyValue('cholesterol', nutrition.cholesterol)}</div>
          </div>
        )}

        {/* Sodium */}
        {nutrition.sodium !== undefined && (
          <div className="border-t border-black py-1 flex justify-between">
            <div>
              <span className="font-bold">Sodium</span> {nutrition.sodium}mg
            </div>
            <div className="font-bold">{getDailyValue('sodium', nutrition.sodium)}</div>
          </div>
        )}

        {/* Total Carbohydrates */}
        {nutrition.totalCarbohydrates !== undefined && (
          <div className="border-t border-black py-1 flex justify-between">
            <div>
              <span className="font-bold">Total Carbohydrate</span> {nutrition.totalCarbohydrates}g
            </div>
            <div className="font-bold">
              {getDailyValue('totalCarbohydrates', nutrition.totalCarbohydrates)}
            </div>
          </div>
        )}

        {/* Dietary Fiber */}
        {nutrition.dietaryFiber !== undefined && (
          <div className="border-t border-gray-300 py-1 pl-4 flex justify-between text-sm">
            <div>Dietary Fiber {nutrition.dietaryFiber}g</div>
            <div className="font-bold">{getDailyValue('dietaryFiber', nutrition.dietaryFiber)}</div>
          </div>
        )}

        {/* Total Sugars */}
        {nutrition.totalSugars !== undefined && (
          <div className="border-t border-gray-300 py-1 pl-4 flex justify-between text-sm">
            <div>Total Sugars {nutrition.totalSugars}g</div>
          </div>
        )}

        {/* Protein */}
        {nutrition.protein !== undefined && (
          <div className="border-t-4 border-black py-1 flex justify-between">
            <div>
              <span className="font-bold">Protein</span> {nutrition.protein}g
            </div>
          </div>
        )}

        {/* Vitamins and Minerals */}
        {(nutrition.vitaminD || nutrition.calcium || nutrition.iron || nutrition.potassium) && (
          <div className="border-t-8 border-black pt-2 pb-1 space-y-1">
            {nutrition.vitaminD !== undefined && (
              <div className="flex justify-between text-sm">
                <div>Vitamin D {nutrition.vitaminD}mcg</div>
                <div>{getDailyValue('vitaminD', nutrition.vitaminD)}</div>
              </div>
            )}
            {nutrition.calcium !== undefined && (
              <div className="flex justify-between text-sm">
                <div>Calcium {nutrition.calcium}mg</div>
                <div>{getDailyValue('calcium', nutrition.calcium)}</div>
              </div>
            )}
            {nutrition.iron !== undefined && (
              <div className="flex justify-between text-sm">
                <div>Iron {nutrition.iron}mg</div>
                <div>{getDailyValue('iron', nutrition.iron)}</div>
              </div>
            )}
            {nutrition.potassium !== undefined && (
              <div className="flex justify-between text-sm">
                <div>Potassium {nutrition.potassium}mg</div>
                <div>{getDailyValue('potassium', nutrition.potassium)}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t-4 border-black pt-2 text-xs text-gray-600">
          * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to
          a daily diet. 2,000 calories a day is used for general nutrition advice.
        </div>
      </CardContent>
    </Card>
  );
}
