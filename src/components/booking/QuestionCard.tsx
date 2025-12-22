import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface QuestionCardProps {
  question: string;
  subtitle?: string;
  children: ReactNode;
}

export function QuestionCard({ question, subtitle, children }: QuestionCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 tracking-tight">
          {question}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
