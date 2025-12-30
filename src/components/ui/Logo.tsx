import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

const sizeConfig = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-3xl',
};

export function Logo({ 
  className, 
  size = 'md', 
  variant = 'dark',
}: LogoProps) {
  const textSize = sizeConfig[size];
  const isDark = variant === 'dark';

  return (
    <span 
      className={cn(
        'font-semibold tracking-tight',
        textSize,
        isDark ? 'text-foreground' : 'text-white',
        className
      )}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif' }}
    >
      CleaningPage
    </span>
  );
}
