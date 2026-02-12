import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChildProfile, Recipe, MealType, MEAL_LABELS, MealPlan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChefHat, Clock, Heart, CalendarPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function Recipes() {
  const [profile] = useLocalStorage<ChildProfile | null>('yumbuddy-profile', null);
  const [favorites, setFavorites] = useLocalStorage<Recipe[]>('yumbuddy-favorites', []);
  const [mealPlans, setMealPlans] = useLocalStorage<MealPlan[]>('yumbuddy-mealplans', []);

  const [mealType, setMealType] = useState<MealType>('lunch');
  const [maxTime, setMaxTime] = useState('30');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const generateRecipe = async () => {
    if (!profile) {
      toast.error('Сначала заполните профиль ребёнка');
      return;
    }

    setLoading(true);
    setRecipe(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            profile: {
              name: profile.name,
              age: profile.age,
              allergies: profile.allergies,
              dislikes: profile.dislikes,
            },
            mealType,
            maxCookingTime: parseInt(maxTime),
          }),
        }
      );

      if (response.status === 429) {
        toast.error('Слишком много запросов. Попробуйте через минуту.');
        return;
      }
      if (response.status === 402) {
        toast.error('Превышен лимит AI. Пополните баланс.');
        return;
      }
      if (!response.ok) throw new Error('AI error');

      const data = await response.json();
      setRecipe({ ...data, id: crypto.randomUUID(), mealType, createdAt: new Date().toISOString() });
    } catch {
      toast.error('Не удалось сгенерировать рецепт. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const saveToFavorites = () => {
    if (!recipe) return;
    if (favorites.some(f => f.name === recipe.name)) {
      toast('Рецепт уже в избранном');
      return;
    }
    setFavorites([recipe, ...favorites]);
    toast.success('Сохранено в избранное!');
  };

  const addToTodayPlan = () => {
    if (!recipe) return;
    setMealPlans(prev => {
      const existing = prev.find(p => p.date === today());
      if (existing) {
        return prev.map(p =>
          p.date === today()
            ? { ...p, meals: { ...p.meals, [recipe.mealType]: recipe } }
            : p
        );
      }
      return [...prev, { date: today(), meals: { [recipe.mealType]: recipe } as any }];
    });
    toast.success('Добавлено в план на сегодня!');
  };

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          Подбор рецептов
        </h1>
        <p className="text-sm text-muted-foreground mt-1">AI подберёт рецепт под вашего ребёнка</p>
      </motion.div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Приём пищи</Label>
            <Select value={mealType} onValueChange={v => setMealType(v as MealType)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEAL_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Максимум минут на готовку</Label>
            <Input
              type="number"
              value={maxTime}
              onChange={e => setMaxTime(e.target.value)}
              className="rounded-xl w-24"
              min={5}
              max={120}
            />
          </div>
          <Button
            onClick={generateRecipe}
            disabled={loading}
            className="w-full rounded-2xl h-12 text-base gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChefHat className="h-5 w-5" />}
            {loading ? 'Подбираю...' : 'Подобрать рецепт'}
          </Button>
        </CardContent>
      </Card>

      {/* Recipe result */}
      <AnimatePresence>
        {recipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-md bg-cream">
              <CardContent className="p-4 space-y-4">
                <h2 className="text-xl font-bold">{recipe.name}</h2>

                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{recipe.cookingTime} мин</span>
                  <span>{recipe.calories} ккал</span>
                  <span>Б: {recipe.protein}г</span>
                  <span>Ж: {recipe.fat}г</span>
                  <span>У: {recipe.carbs}г</span>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Ингредиенты:</h3>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Приготовление:</h3>
                  <ol className="space-y-2">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={saveToFavorites} className="flex-1 rounded-xl gap-2">
                    <Heart className="h-4 w-4" />
                    В избранное
                  </Button>
                  <Button onClick={addToTodayPlan} className="flex-1 rounded-xl gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    В план
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
