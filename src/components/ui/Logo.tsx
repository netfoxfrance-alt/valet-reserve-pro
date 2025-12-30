import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showText?: boolean;
  iconOnly?: boolean;
}

const sizeConfig = {
  sm: { icon: 18, text: 'text-base', container: 'gap-1.5', box: 'w-7 h-7' },
  md: { icon: 22, text: 'text-lg', container: 'gap-2', box: 'w-9 h-9' },
  lg: { icon: 26, text: 'text-xl', container: 'gap-2.5', box: 'w-11 h-11' },
  xl: { icon: 36, text: 'text-3xl', container: 'gap-3', box: 'w-14 h-14' },
};

// Minimalist iconic logo - Abstract "C" with sparkle/shine effect
// Inspired by Linktree, Notion, Linear - simple, geometric, memorable
function CleanIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      {/* Abstract C shape with shine - represents "Clean" */}
      <path 
        d="M17 7C15.5 5.5 13.5 4.5 11 4.5C6.5 4.5 3 8 3 12.5C3 17 6.5 20.5 11 20.5C13.5 20.5 15.5 19.5 17 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Sparkle/shine accent - the memorable part */}
      <circle 
        cx="19" 
        cy="5" 
        r="2"
        fill="currentColor"
      />
    </svg>
  );
}

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
          'rounded-xl flex items-center justify-center bg-primary',
          config.box,
          className
        )}
      >
        <CleanIcon size={config.icon} className="text-white" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', config.container, className)}>
      {/* Icon */}
      <div 
        className={cn(
          'rounded-xl flex items-center justify-center bg-primary',
          config.box
        )}
      >
        <CleanIcon size={config.icon} className="text-white" />
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
