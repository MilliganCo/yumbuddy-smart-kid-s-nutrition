import { NavLink, useLocation } from 'react-router-dom';
import { Home, ChefHat, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/recipes', icon: ChefHat, label: 'Рецепты' },
  { to: '/diary', icon: BookOpen, label: 'Дневник' },
  { to: '/profile', icon: User, label: 'Профиль' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs transition-colors',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
