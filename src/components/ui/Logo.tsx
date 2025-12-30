import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

const sizeConfig = {
  sm: { text: 'text-base', drops: 3 },
  md: { text: 'text-lg', drops: 4 },
  lg: { text: 'text-xl', drops: 4 },
  xl: { text: 'text-3xl', drops: 5 },
};

// Subtle water drops decoration
function WaterDrops({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5 opacity-40", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full bg-current"
          style={{
            width: i === 1 ? 4 : 3,
            height: i === 1 ? 4 : 3,
            opacity: i === 1 ? 1 : 0.6,
          }}
        />
      ))}
    </div>
  );
}

export function Logo({ 
  className, 
  size = 'md', 
  variant = 'dark',
}: LogoProps) {
  const config = sizeConfig[size];
  const isDark = variant === 'dark';

  return (
    <div className={cn('flex items-center gap-2', className)}>
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
      
      {/* Subtle water drops */}
      <WaterDrops 
        count={config.drops} 
        className={isDark ? 'text-primary' : 'text-white/60'} 
      />
    </div>
  );
}
