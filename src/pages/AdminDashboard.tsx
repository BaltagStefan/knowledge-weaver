import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Brain, Sliders, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const stats = [
    { label: t('admin.stats.promptVersion'), value: 'v3', icon: FileText },
    { label: t('admin.stats.docsReady'), value: '12', icon: CheckCircle, color: 'text-success' },
    { label: t('admin.stats.docsIndexing'), value: '2', icon: Clock, color: 'text-warning' },
    { label: t('admin.stats.memoryEntries'), value: '45', icon: Brain },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('admin.dashboard')}</h1>
      </header>
      
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Warning banner */}
          <div className="admin-warning mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">{t('admin.warning.title')}</h3>
                <p className="text-sm opacity-90">{t('admin.warning.promptInjection')}</p>
              </div>
            </div>
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
