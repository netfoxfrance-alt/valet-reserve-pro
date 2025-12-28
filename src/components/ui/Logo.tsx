import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function Logo({ className, size = 'md', variant = 'dark' }: LogoProps) {
  const fillColor = variant === 'light' ? '#ffffff' : 'currentColor';
  
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes[size], className)}
    >
      {/* Modern minimal "C" with abstract shine/sparkle - Linktree/Calendly style */}
      <path
        d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14c2.5 0 4.85-.65 6.9-1.8"
        stroke={fillColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sparkle/shine dots representing cleaning */}
      <circle cx="26" cy="8" r="2.5" fill={fillColor} />
      <circle cx="22" cy="14" r="1.8" fill={fillColor} />
      <circle cx="27" cy="18" r="1.2" fill={fillColor} />
    </svg>
  );
}
