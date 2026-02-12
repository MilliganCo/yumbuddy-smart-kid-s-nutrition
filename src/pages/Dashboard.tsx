import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChildProfile, DayLog, MealEntry, Recipe, MealPlan, MEAL_LABELS } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Droplets, UtensilsCrossed, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const today = () => format(new Date(), 'yyyy-MM-dd');

export default function Dashboard() {
  const [profile] = useLocalStorage<ChildProfile | null>('yumbuddy-profile', null);
  const [dayLogs] = useLocalStorage<DayLog[]>('yumbuddy-daylogs', []);
  const [mealPlans] = useLocalStorage<MealPlan[]>('yumbuddy-mealplans', []);
  const navigate = useNavigate();

  const todayLog = dayLogs.find(l => l.date === today()) || { date: today(), meals: [], waterGlasses: 0 };
  const todayPlan = mealPlans.find(p => p.date === today());

  const childName = profile?.name || 'малыш';

  return (
    <div className="space-y-5 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Привет, {childName}! 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Что вкусного сегодня?</p>
      </motion.div>

      {/* Today's plan card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 bg-cream shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              Сегодняшний день
            </h2>
            {todayPlan ? (
              <div className="space-y-2">
                {(Object.entries(todayPlan.meals) as [string, Recipe | null][]).map(([type, recipe]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{MEAL_LABELS[type as keyof typeof MEAL_LABELS]}</span>
                    <span className="font-medium truncate ml-2 max-w-[180px]">{recipe?.name || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                План на сегодня пока пуст. Подберите рецепты!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 gap-2 rounded-2xl border-border bg-card hover:bg-muted"
          onClick={() => navigate('/recipes')}
        >
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="text-xs">Подобрать рецепт</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 gap-2 rounded-2xl border-border bg-card hover:bg-muted"
          onClick={() => navigate('/diary')}
        >
          <Plus className="h-6 w-6 text-secondary" />
          <span className="text-xs">Записать приём</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 gap-2 rounded-2xl border-border bg-card hover:bg-muted"
          onClick={() => navigate('/diary')}
        >
          <Droplets className="h-6 w-6 text-accent" />
          <span className="text-xs">Добавить воду</span>
        </Button>
      </motion.div>

      {/* Day summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-3">Сводка дня</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{todayLog.meals.length}</p>
                  <p className="text-xs text-muted-foreground">приёмов пищи</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold">{todayLog.waterGlasses}</p>
                  <p className="text-xs text-muted-foreground">стаканов воды</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {!profile && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="border-primary/30 border-dashed bg-primary/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Заполните профиль ребёнка, чтобы подбирать рецепты
              </p>
              <Button size="sm" onClick={() => navigate('/profile')}>
                Заполнить профиль
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
