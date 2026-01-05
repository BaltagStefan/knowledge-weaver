import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  MessageSquare,
  FolderOpen,
  History,
  Settings,
  FileText,
  Brain,
  Sliders,
  Plus,
  Sun,
  Moon,
  Menu,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';

const mainNavItems = [
  { key: 'chat', path: '/', icon: MessageSquare, labelKey: 'nav.chat' },
  { key: 'library', path: '/library', icon: FolderOpen, labelKey: 'nav.library' },
  { key: 'conversations', path: '/conversations', icon: History, labelKey: 'nav.conversations' },
];

const adminNavItems = [
  { key: 'admin', path: '/admin', icon: Settings, labelKey: 'nav.admin' },
  { key: 'adminPrompt', path: '/admin/prompt', icon: FileText, labelKey: 'nav.adminPrompt' },
  { key: 'adminRag', path: '/admin/rag', icon: Sliders, labelKey: 'nav.adminRag' },
  { key: 'adminMemory', path: '/admin/memory', icon: Brain, labelKey: 'nav.adminMemory' },
];

function SidebarContent() {
  const { t, language, toggleLanguage } = useTranslation();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold">{t('app.name')}</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-xs text-muted-foreground">{t('app.online')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <Button variant="outline" className="w-full justify-start gap-2" asChild>
          <NavLink to="/">
            <Plus className="h-4 w-4" />
            {t('nav.newChat')}
          </NavLink>
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="my-4 border-t" />

        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground">Admin</p>
        <nav className="space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t flex gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleLanguage}>
          <span className="text-xs font-semibold uppercase">{language}</span>
        </Button>
      </div>
    </div>
  );
}

export function MainLayout() {
  const { sidebarOpen, setSidebarOpen, sourcesPanelOpen, toggleSourcesPanel } = useUIStore();
  const isMobile = useIsMobile();
  const location = useLocation();
  const showSourcesPanel = location.pathname === '/' && sourcesPanelOpen && !isMobile;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r bg-sidebar shrink-0">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        {isMobile && (
          <header className="flex h-14 items-center gap-4 border-b px-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </header>
        )}

        <div className="flex flex-1 min-h-0">
          <main className={cn("flex-1 min-w-0 flex flex-col", showSourcesPanel && "md:mr-80")}>
            <Outlet />
          </main>

          {showSourcesPanel && (
            <aside className="fixed right-0 top-0 bottom-0 w-80 border-l bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Surse</h2>
                <Button variant="ghost" size="icon" onClick={toggleSourcesPanel}>
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Nu există surse pentru această conversație.</p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
