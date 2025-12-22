import { Sparkles } from 'lucide-react';

interface BookingHeaderProps {
  centerName?: string;
  welcomeMessage?: string | null;
}

export function BookingHeader({ centerName = "Auto Clean Center", welcomeMessage }: BookingHeaderProps) {
  return (
    <header className="w-full py-6 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-semibold text-foreground tracking-tight">AUTOCARE</span>
            {centerName && (
              <span className="hidden sm:inline text-muted-foreground ml-2">• {centerName}</span>
            )}
          </div>
        </div>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Une question ?
        </button>
      </div>
    </header>
  );
}
