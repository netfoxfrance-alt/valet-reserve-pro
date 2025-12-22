import { Menu, Bell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-lg font-semibold text-foreground hidden lg:block">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
          AC
        </div>
      </div>
    </header>
  );
}
