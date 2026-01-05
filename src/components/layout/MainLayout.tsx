import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ReasoningPanel } from './ReasoningPanel';
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
  PanelRightClose,
  X,
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

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t, language, toggleLanguage } = useTranslation();
  const { toggleTheme, isDark } = useTheme();

  return (
    <div className="flex flex-col h-full bg-[#1a1d21] text-gray-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <span className="font-semibold text-lg text-white">Kotaemon</span>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* New Chat */}
      <div className="px-3 pb-4">
        <Button 
          className="w-full justify-start gap-3 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
          asChild
        >
          <NavLink to="/">
            <Plus className="h-4 w-4" />
            {t('nav.newChat')}
          </NavLink>
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 custom-scrollbar">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="my-6 border-t border-white/10" />

        <p className="px-3 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</p>
        <nav className="space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-gray-400 hover:bg-white/10 hover:text-white"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleLanguage}
          className="px-3 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <span className="text-xs font-semibold">{language === 'ro' ? 'RO' : 'EN'}</span>
        </Button>
      </div>
    </div>
  );
}

export function MainLayout() {
  const { sidebarOpen, setSidebarOpen, sourcesPanelOpen, toggleSourcesPanel } = useUIStore();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const location = useLocation();
  const showSourcesPanel = location.pathname === '/' && sourcesPanelOpen && !isMobile;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 shrink-0">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 border-0 bg-[#1a1d21]">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background">
        {/* Mobile header */}
        {isMobile && (
          <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-background px-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold">Kotaemon</span>
          </header>
        )}

        <div className="flex flex-1 min-h-0">
          <main className={cn("flex-1 min-w-0 flex flex-col bg-[#f7f7f8] dark:bg-background", showSourcesPanel && "lg:mr-80")}>
            <Outlet />
          </main>

          {/* Live Reasoning panel */}
          {showSourcesPanel && (
            <aside className="fixed right-0 top-0 bottom-0 w-80 border-l bg-white dark:bg-card hidden lg:block">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">{t('reasoning.title')}</h2>
                <Button variant="ghost" size="icon" onClick={toggleSourcesPanel}>
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>
              <ReasoningPanel />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
