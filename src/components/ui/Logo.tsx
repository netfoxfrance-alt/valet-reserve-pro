import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showText?: boolean;
  iconOnly?: boolean;
}

const sizeConfig = {
  sm: { icon: 20, text: 'text-base', container: 'gap-1.5', box: 'w-7 h-7' },
  md: { icon: 24, text: 'text-lg', container: 'gap-2', box: 'w-9 h-9' },
  lg: { icon: 28, text: 'text-xl', container: 'gap-2.5', box: 'w-11 h-11' },
  xl: { icon: 40, text: 'text-3xl', container: 'gap-3', box: 'w-14 h-14' },
};

// Minimalist unicorn icon - simple, memorable, iconic
function UnicornIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      className={className}
    >
      {/* Unicorn head silhouette - minimalist style */}
      <path 
        d="M8 24C8 24 10 20 10 16C10 12 12 8 16 8C20 8 22 12 22 16C22 20 24 24 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Horn - the iconic part */}
      <path 
        d="M16 8L16 2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Sparkle on horn */}
      <circle 
        cx="16" 
        cy="2" 
        r="1.5" 
        fill="currentColor"
      />
      {/* Ear accent */}
      <path 
        d="M12 10L10 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Mane flow */}
      <path 
        d="M20 10C22 10 24 8 24 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
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
        <UnicornIcon size={config.icon * 0.7} className="text-white" />
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
        <UnicornIcon size={config.icon * 0.7} className="text-white" />
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
