import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useUIStore, useChatStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ReasoningPanel } from './ReasoningPanel';
import { ProjectList } from '@/components/projects';
import { WorkspaceSwitcher } from '@/components/workspace';
import { PermissionGate } from '@/components/auth';
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
  FolderKanban,
  Users,
  Building2,
  Cpu,
  LogOut,
  Shield,
} from 'lucide-react';

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t, language, toggleLanguage } = useTranslation();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const { clearChat, setCurrentConversation } = useChatStore();
  const { user, isAuthenticated, logout, isAdmin, isUserPlus } = useAuthStore();
  const { currentWorkspaceId } = useWorkspaceStore();

  const effectiveWorkspaceId = workspaceId || currentWorkspaceId || 'default';

  const handleNewChat = () => {
    clearChat();
    setCurrentConversation(null);
    navigate(`/w/${effectiveWorkspaceId}/chat`);
    onClose?.();
  };

  const handleConversationClick = (conversationId: string) => {
    setCurrentConversation(conversationId);
    navigate(`/w/${effectiveWorkspaceId}/chat`);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  // Main navigation items - workspace scoped
  const mainNavItems = [
    { key: 'chat', path: `/w/${effectiveWorkspaceId}/chat`, icon: MessageSquare, labelKey: 'nav.chat' },
    { key: 'conversations', path: `/w/${effectiveWorkspaceId}/conversations`, icon: History, labelKey: 'nav.conversations' },
  ];

  // Files - only for Admin and User+
  const filesNavItem = { 
    key: 'files', 
    path: `/w/${effectiveWorkspaceId}/files`, 
    icon: FolderOpen, 
    labelKey: 'nav.files' 
  };

  // Workspace settings - Admin only (except prompt which is also for User+)
  const workspaceSettingsItemsAdmin = [
    { key: 'models', path: `/w/${effectiveWorkspaceId}/settings/models`, icon: Cpu, labelKey: 'nav.settingsModels' },
    { key: 'rag', path: `/w/${effectiveWorkspaceId}/settings/rag`, icon: Sliders, labelKey: 'nav.settingsRag' },
  ];

  // Prompt setting - Admin + User+
  const promptSettingItem = { 
    key: 'prompt', 
    path: `/w/${effectiveWorkspaceId}/settings/prompt`, 
    icon: FileText, 
    labelKey: 'nav.settingsPrompt' 
  };

  // Workspace users - Admin + User+ (User+ can only add regular users)
  const workspaceUsersItem = { 
    key: 'workspace-users', 
    path: `/w/${effectiveWorkspaceId}/workspace-users`, 
    icon: Users, 
    labelKey: 'nav.workspaceUsers' 
  };

  // Admin global items
  const adminNavItems = [
    { key: 'workspaces', path: '/admin/workspaces', icon: Building2, labelKey: 'nav.adminWorkspaces' },
    { key: 'users', path: '/admin/users', icon: Users, labelKey: 'nav.adminUsers' },
  ];

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

      {/* Workspace Switcher */}
      <div className="px-3 pb-3">
        <WorkspaceSwitcher />
      </div>

      {/* New Chat */}
      <div className="px-3 pb-4">
        <Button 
          className="w-full justify-start gap-3 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          {t('nav.newChat')}
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
              onClick={onClose}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </NavLink>
          ))}

          {/* Files - Admin + User+ only */}
          <PermissionGate requireUserPlus>
            <NavLink
              to={filesNavItem.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
              onClick={onClose}
            >
              <filesNavItem.icon className="h-4 w-4" />
              {t(filesNavItem.labelKey)}
            </NavLink>
          </PermissionGate>
        </nav>

        {/* Projects Section */}
        <div className="my-6 border-t border-white/10" />
        <div className="flex items-center gap-2 px-3 mb-2">
          <FolderKanban className="h-4 w-4 text-gray-500" />
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('nav.projects')}
          </p>
        </div>
        <ProjectList onConversationClick={handleConversationClick} />

        {/* Workspace Settings Section - User+ and Admin */}
        <PermissionGate requireUserPlus>
          <div className="my-6 border-t border-white/10" />
          <div className="flex items-center gap-2 px-3 mb-2">
            <Settings className="h-4 w-4 text-gray-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Setări Workspace
            </p>
          </div>
          <nav className="space-y-1">
            {/* Prompt - User+ and Admin */}
            <NavLink
              to={promptSettingItem.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
              onClick={onClose}
            >
              <promptSettingItem.icon className="h-4 w-4" />
              {t(promptSettingItem.labelKey)}
            </NavLink>

            {/* Workspace Users - User+ and Admin */}
            <NavLink
              to={workspaceUsersItem.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
              onClick={onClose}
            >
              <workspaceUsersItem.icon className="h-4 w-4" />
              Utilizatori
            </NavLink>

            {/* Models and RAG - Admin only */}
            <PermissionGate requireAdmin>
              {workspaceSettingsItemsAdmin.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  )}
                  onClick={onClose}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </PermissionGate>
          </nav>
        </PermissionGate>

        {/* Admin Panel - Admin only */}
        <PermissionGate requireAdmin>
          <div className="my-6 border-t border-white/10" />
          <div className="flex items-center gap-2 px-3 mb-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Admin
            </p>
          </div>
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
                onClick={onClose}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </PermissionGate>
      </ScrollArea>

      {/* Footer - User info & controls */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {isAuthenticated && user && (
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <Badge variant="secondary" className="text-[10px] h-4">
                {user.role === 'admin' ? 'Admin' : user.role === 'user_plus' ? 'User+' : 'User'}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
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
          
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="ml-auto text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MainLayout() {
  const { sidebarOpen, setSidebarOpen, sourcesPanelOpen, toggleSourcesPanel } = useUIStore();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const location = useLocation();
  const showSourcesPanel = location.pathname.includes('/chat') && sourcesPanelOpen && !isMobile;

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
