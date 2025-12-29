import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showText?: boolean;
}

const sizes = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-20',
};

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  if (!showText) {
    // Icon only - return just the sparkles part as a small icon
    return (
      <img
        src={logoImage}
        alt="CleaningPage"
        className={cn(sizes[size], 'w-auto object-contain', className)}
      />
    );
  }

  return (
    <img
      src={logoImage}
      alt="CleaningPage"
      className={cn(sizes[size], 'w-auto object-contain', className)}
    />
  );
}
