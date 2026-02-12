import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChildProfile, COMMON_ALLERGENS, MealType, MEAL_LABELS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ALL_MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function Profile() {
  const [profile, setProfile] = useLocalStorage<ChildProfile | null>('yumbuddy-profile', null);

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [allergies, setAllergies] = useState<string[]>(profile?.allergies || []);
  const [dislikes, setDislikes] = useState<string[]>(profile?.dislikes || []);
  const [mealSchedule, setMealSchedule] = useState<MealType[]>(profile?.mealSchedule || ALL_MEALS);
  const [customAllergen, setCustomAllergen] = useState('');
  const [customDislike, setCustomDislike] = useState('');

  const toggleAllergen = (a: string) =>
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const toggleMeal = (m: MealType) =>
    setMealSchedule(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const addCustomAllergen = () => {
    if (customAllergen.trim() && !allergies.includes(customAllergen.trim())) {
      setAllergies([...allergies, customAllergen.trim()]);
      setCustomAllergen('');
    }
  };

  const addCustomDislike = () => {
    if (customDislike.trim() && !dislikes.includes(customDislike.trim())) {
      setDislikes([...dislikes, customDislike.trim()]);
      setCustomDislike('');
    }
  };

  const save = () => {
    if (!name.trim()) {
      toast.error('Укажите имя ребёнка');
      return;
    }
    setProfile({
      id: profile?.id || crypto.randomUUID(),
      name: name.trim(),
      age: parseInt(age) || 0,
      allergies,
      dislikes,
      mealSchedule,
    });
    toast.success('Профиль сохранён!');
  };

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Профиль ребёнка
        </h1>
      </motion.div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Имя</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Как зовут ребёнка?" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Возраст (лет)</Label>
            <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="0" className="rounded-xl w-24" min={0} max={18} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Label>Аллергии и непереносимости</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGENS.map(a => (
              <Badge
                key={a}
                variant={allergies.includes(a) ? 'default' : 'outline'}
                className="cursor-pointer rounded-full transition-colors"
                onClick={() => toggleAllergen(a)}
              >
                {a}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={customAllergen}
              onChange={e => setCustomAllergen(e.target.value)}
              placeholder="Другое..."
              className="rounded-xl"
              onKeyDown={e => e.key === 'Enter' && addCustomAllergen()}
            />
            <Button size="sm" variant="outline" onClick={addCustomAllergen} className="rounded-xl">+</Button>
          </div>
          {allergies.filter(a => !COMMON_ALLERGENS.includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allergies.filter(a => !COMMON_ALLERGENS.includes(a)).map(a => (
                <Badge key={a} className="rounded-full gap-1">
                  {a}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleAllergen(a)} />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Label>«Не любит» — что ребёнок отказывается есть</Label>
          <div className="flex gap-2">
            <Input
              value={customDislike}
              onChange={e => setCustomDislike(e.target.value)}
              placeholder="Например: брокколи, рыба..."
              className="rounded-xl"
              onKeyDown={e => e.key === 'Enter' && addCustomDislike()}
            />
            <Button size="sm" variant="outline" onClick={addCustomDislike} className="rounded-xl">+</Button>
          </div>
          {dislikes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dislikes.map(d => (
                <Badge key={d} variant="secondary" className="rounded-full gap-1">
                  {d}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setDislikes(prev => prev.filter(x => x !== d))} />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Label>Режим питания</Label>
          <div className="space-y-2">
            {ALL_MEALS.map(m => (
              <div key={m} className="flex items-center gap-3">
                <Checkbox
                  checked={mealSchedule.includes(m)}
                  onCheckedChange={() => toggleMeal(m)}
                />
                <span className="text-sm">{MEAL_LABELS[m]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} className="w-full rounded-2xl h-12 text-base gap-2">
        <Save className="h-4 w-4" />
        Сохранить профиль
      </Button>
    </div>
  );
}
