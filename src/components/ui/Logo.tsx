import { cn } from '@/lib/utils';
import { Droplets } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showText?: boolean;
  iconOnly?: boolean;
}

const sizeConfig = {
  sm: { icon: 'w-5 h-5', text: 'text-base', container: 'gap-1.5', padding: 'p-1' },
  md: { icon: 'w-6 h-6', text: 'text-lg', container: 'gap-2', padding: 'p-1.5' },
  lg: { icon: 'w-7 h-7', text: 'text-xl', container: 'gap-2', padding: 'p-2' },
  xl: { icon: 'w-10 h-10', text: 'text-3xl', container: 'gap-3', padding: 'p-2.5' },
};

export function Logo({ 
  className, 
  size = 'md', 
  variant = 'dark',
  showText = true,
  iconOnly = false,
}: LogoProps) {
  const config = sizeConfig[size];
  const isDark = variant === 'dark';

  // Icon only mode
  if (iconOnly || !showText) {
    return (
      <div 
        className={cn(
          'rounded-xl flex items-center justify-center',
          config.padding,
          isDark ? 'bg-primary' : 'bg-white/10',
          className
        )}
      >
        <Droplets 
          className={cn(
            config.icon,
            isDark ? 'text-white' : 'text-white'
          )} 
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', config.container, className)}>
      {/* Icon */}
      <div 
        className={cn(
          'rounded-xl flex items-center justify-center',
          config.padding,
          'bg-primary'
        )}
      >
        <Droplets className={cn(config.icon, 'text-white')} />
      </div>
      
      {/* Text */}
      <span 
        className={cn(
          'font-semibold tracking-tight',
          config.text,
          isDark ? 'text-foreground' : 'text-white'
        )}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif' }}
      >
        CleaningPage
      </span>
    </div>
  );
}
