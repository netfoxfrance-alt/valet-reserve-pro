import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
};

export function Logo({ className, size = 'md', variant = 'dark' }: LogoProps) {
  const fillColor = variant === 'light' ? '#ffffff' : 'currentColor';
  
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes[size], className)}
    >
      {/* Minimalist droplet with shine - luxury cleaning aesthetic */}
      <path
        d="M32 4C32 4 12 28 12 42C12 53.046 20.954 62 32 62C43.046 62 52 53.046 52 42C52 28 32 4 32 4Z"
        fill={fillColor}
      />
      {/* Inner shine detail */}
      <path
        d="M26 36C26 36 22 42 22 46C22 51.523 26.477 56 32 56C37.523 56 42 51.523 42 46C42 42 38 36 38 36"
        stroke={variant === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)'}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Highlight dot */}
      <circle
        cx="24"
        cy="38"
        r="3"
        fill={variant === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.35)'}
      />
    </svg>
  );
}
