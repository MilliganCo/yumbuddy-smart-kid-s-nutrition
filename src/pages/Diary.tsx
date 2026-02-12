import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DayLog, MealEntry, MealType, MEAL_LABELS, Recipe, MealPlan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Droplets, Plus, UtensilsCrossed } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const today = () => format(new Date(), 'yyyy-MM-dd');

const PORTION_LABELS = { small: 'Мало', half: 'Половина', full: 'Полная' } as const;
const PORTION_MULTIPLIERS = { small: 0.3, half: 0.5, full: 1 } as const;

export default function Diary() {
  const [dayLogs, setDayLogs] = useLocalStorage<DayLog[]>('yumbuddy-daylogs', []);
  const [mealPlans] = useLocalStorage<MealPlan[]>('yumbuddy-mealplans', []);

  const todayDate = today();
  const todayLog = dayLogs.find(l => l.date === todayDate) || { date: todayDate, meals: [], waterGlasses: 0 };
  const todayPlan = mealPlans.find(p => p.date === todayDate);

  const [mealType, setMealType] = useState<MealType>('lunch');
  const [recipeName, setRecipeName] = useState('');
  const [portion, setPortion] = useState<'small' | 'half' | 'full'>('full');
  const [showAdd, setShowAdd] = useState(false);

  const updateLog = (updated: DayLog) => {
    setDayLogs(prev => {
      const exists = prev.find(l => l.date === todayDate);
      if (exists) return prev.map(l => l.date === todayDate ? updated : l);
      return [...prev, updated];
    });
  };

  const addMeal = () => {
    if (!recipeName.trim()) {
      toast.error('Введите название блюда');
      return;
    }
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      date: todayDate,
      mealType,
      recipeName: recipeName.trim(),
      portion,
    };
    updateLog({ ...todayLog, meals: [...todayLog.meals, entry] });
    setRecipeName('');
    setShowAdd(false);
    toast.success('Приём пищи записан!');
  };

  const addWater = () => {
    updateLog({ ...todayLog, waterGlasses: todayLog.waterGlasses + 1 });
    toast('💧 +1 стакан воды');
  };

  const removeWater = () => {
    if (todayLog.waterGlasses > 0) {
      updateLog({ ...todayLog, waterGlasses: todayLog.waterGlasses - 1 });
    }
  };

  // Group meals by type
  const grouped = todayLog.meals.reduce<Record<MealType, MealEntry[]>>((acc, m) => {
    if (!acc[m.mealType]) acc[m.mealType] = [];
    acc[m.mealType].push(m);
    return acc;
  }, {} as Record<MealType, MealEntry[]>);

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Дневник питания
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{format(new Date(), 'dd.MM.yyyy')}</p>
      </motion.div>

      {/* Meals list */}
      <div className="space-y-3">
        {(Object.entries(MEAL_LABELS) as [MealType, string][]).map(([type, label]) => (
          <Card key={type} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{label}</h3>
              {grouped[type]?.length ? (
                <div className="space-y-1">
                  {grouped[type].map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span>{m.recipeName}</span>
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {PORTION_LABELS[m.portion]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add meal form */}
      {showAdd ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <Label>Приём пищи</Label>
                <Select value={mealType} onValueChange={v => setMealType(v as MealType)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEAL_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick select from plan */}
              {todayPlan && Object.entries(todayPlan.meals)
                .filter(([_, r]) => r)
                .length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Из плана:</Label>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(todayPlan.meals).map(([_, r]) =>
                      r ? (
                        <Badge
                          key={r.id}
                          variant="outline"
                          className="cursor-pointer rounded-full"
                          onClick={() => setRecipeName(r.name)}
                        >
                          {r.name}
                        </Badge>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Название блюда</Label>
                <Input
                  value={recipeName}
                  onChange={e => setRecipeName(e.target.value)}
                  placeholder="Что съели?"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Порция</Label>
                <div className="flex gap-2">
                  {(Object.entries(PORTION_LABELS) as [string, string][]).map(([k, v]) => (
                    <Button
                      key={k}
                      variant={portion === k ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-xl flex-1"
                      onClick={() => setPortion(k as 'small' | 'half' | 'full')}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl">Отмена</Button>
                <Button onClick={addMeal} className="flex-1 rounded-xl">Записать</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Button
          onClick={() => setShowAdd(true)}
          variant="outline"
          className="w-full rounded-2xl h-12 border-dashed gap-2"
        >
          <Plus className="h-5 w-5" />
          Записать приём пищи
        </Button>
      )}

      {/* Water tracker */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-accent-foreground" />
            Вода
          </h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-full" onClick={removeWater}>−</Button>
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 w-5 rounded-md transition-colors ${
                    i < todayLog.waterGlasses ? 'bg-accent' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" className="rounded-full" onClick={addWater}>+</Button>
            <span className="text-sm font-semibold ml-auto">{todayLog.waterGlasses} / 8</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
