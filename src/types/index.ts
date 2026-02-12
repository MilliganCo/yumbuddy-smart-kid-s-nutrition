export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  allergies: string[];
  dislikes: string[];
  mealSchedule: MealType[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export const COMMON_ALLERGENS = [
  'Молоко', 'Яйца', 'Глютен', 'Орехи', 'Арахис',
  'Соя', 'Рыба', 'Морепродукты', 'Мёд', 'Цитрусовые',
];

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  steps: string[];
  cookingTime: number;
  mealType: MealType;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  createdAt: string;
}

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  recipeName: string;
  portion: 'small' | 'half' | 'full';
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  waterGlasses: number;
}

export interface MealPlan {
  date: string; // YYYY-MM-DD
  meals: Record<MealType, Recipe | null>;
}
