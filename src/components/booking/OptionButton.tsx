import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OptionButtonProps {
  selected?: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  description?: string;
}

export function OptionButton({ selected, onClick, icon, label, description }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-2xl text-left transition-all duration-300 ease-out",
        "border-2 hover:scale-[1.01] active:scale-[0.99]",
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/30 hover:bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className={cn(
            "font-medium text-lg",
            selected ? "text-foreground" : "text-foreground"
          )}>
            {label}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          selected 
            ? "border-primary bg-primary" 
            : "border-border"
        )}>
          {selected && (
            <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
