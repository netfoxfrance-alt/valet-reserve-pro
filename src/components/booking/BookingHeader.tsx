import { Logo } from '@/components/ui/Logo';

interface BookingHeaderProps {
  centerName?: string;
  welcomeMessage?: string | null;
}

export function BookingHeader({ centerName = "Centre", welcomeMessage }: BookingHeaderProps) {
  return (
    <header className="w-full py-6 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size="lg" />
          {centerName && (
            <span className="hidden sm:inline text-muted-foreground ml-2">• {centerName}</span>
          )}
        </div>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Une question ?
        </button>
      </div>
    </header>
  );
}
