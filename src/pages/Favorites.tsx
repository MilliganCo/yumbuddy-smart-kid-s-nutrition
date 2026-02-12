import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Recipe, MealType, MEAL_LABELS, MealPlan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, Trash2, CalendarPlus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function Favorites() {
  const [favorites, setFavorites] = useLocalStorage<Recipe[]>('yumbuddy-favorites', []);
  const [mealPlans, setMealPlans] = useLocalStorage<MealPlan[]>('yumbuddy-mealplans', []);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<MealType | 'all'>('all');

  const filtered = favorites.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || r.mealType === filterType;
    return matchSearch && matchType;
  });

  const remove = (id: string) => {
    setFavorites(prev => prev.filter(r => r.id !== id));
    toast('Рецепт удалён из избранного');
  };

  const addToTodayPlan = (recipe: Recipe) => {
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
          <Heart className="h-6 w-6 text-primary" />
          Избранные рецепты
        </h1>
      </motion.div>

      {/* Search & filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск рецептов..."
            className="rounded-xl pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Badge
            variant={filterType === 'all' ? 'default' : 'outline'}
            className="cursor-pointer rounded-full whitespace-nowrap"
            onClick={() => setFilterType('all')}
          >
            Все
          </Badge>
          {(Object.entries(MEAL_LABELS) as [MealType, string][]).map(([k, v]) => (
            <Badge
              key={k}
              variant={filterType === k ? 'default' : 'outline'}
              className="cursor-pointer rounded-full whitespace-nowrap"
              onClick={() => setFilterType(k)}
            >
              {v}
            </Badge>
          ))}
        </div>
      </div>

      {/* Recipes list */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Пока нет избранных рецептов</p>
            <p className="text-xs mt-1">Подберите рецепт с помощью AI и сохраните его</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map(recipe => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base">{recipe.name}</h3>
                      <Badge variant="secondary" className="rounded-full text-xs shrink-0 ml-2">
                        {MEAL_LABELS[recipe.mealType]}
                      </Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{recipe.cookingTime} мин</span>
                      <span>{recipe.calories} ккал</span>
                      <span>Б: {recipe.protein}г</span>
                      <span>Ж: {recipe.fat}г</span>
                      <span>У: {recipe.carbs}г</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-1 flex-1"
                        onClick={() => addToTodayPlan(recipe)}
                      >
                        <CalendarPlus className="h-3 w-3" />
                        В план
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-destructive hover:text-destructive"
                        onClick={() => remove(recipe.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
