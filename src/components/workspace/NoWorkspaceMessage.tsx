import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function NoWorkspaceMessage() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-8">
      <Card className="max-w-md w-full border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Încă nu ați fost atribuit unui workspace
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Contactați un administrator pentru a fi adăugat la un workspace. 
            După atribuire, veți putea accesa chat-ul și celelalte funcționalități.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
