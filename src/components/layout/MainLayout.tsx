import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useUIStore, useChatStore, useConversationsStore, useProjectsStore } from '@/store/appStore';
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
  ChevronRight,
  Home,
} from 'lucide-react';

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t, language, toggleLanguage } = useTranslation();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const { clearChat, setCurrentConversation, clearUserData: clearChatData } = useChatStore();
  const { clearUserData: clearConversationsData } = useConversationsStore();
  const { clearUserData: clearProjectsData } = useProjectsStore();
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
    // Clear all user-specific data
    clearChatData();
    clearConversationsData();
    clearProjectsData();
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

function getBreadcrumbs(pathname: string, workspaceId: string, t: (key: string) => string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; path: string; icon?: React.ComponentType<{ className?: string }> }[] = [];

  // Home/Workspace
  breadcrumbs.push({ label: 'Workspace', path: `/w/${workspaceId}/chat`, icon: Home });

  if (segments.includes('settings')) {
    breadcrumbs.push({ label: 'Setări', path: `/w/${workspaceId}/settings/prompt`, icon: Settings });
    
    if (segments.includes('prompt')) {
      breadcrumbs.push({ label: t('nav.settingsPrompt'), path: `/w/${workspaceId}/settings/prompt` });
    } else if (segments.includes('models')) {
      breadcrumbs.push({ label: t('nav.settingsModels'), path: `/w/${workspaceId}/settings/models` });
    } else if (segments.includes('rag')) {
      breadcrumbs.push({ label: t('nav.settingsRag'), path: `/w/${workspaceId}/settings/rag` });
    }
  } else if (segments.includes('workspace-users')) {
    breadcrumbs.push({ label: 'Setări', path: `/w/${workspaceId}/settings/prompt`, icon: Settings });
    breadcrumbs.push({ label: 'Utilizatori', path: `/w/${workspaceId}/workspace-users` });
  } else if (segments.includes('admin')) {
    breadcrumbs.push({ label: 'Admin', path: '/admin/workspaces', icon: Shield });
    
    if (segments.includes('workspaces')) {
      breadcrumbs.push({ label: t('nav.adminWorkspaces'), path: '/admin/workspaces' });
    } else if (segments.includes('users')) {
      breadcrumbs.push({ label: t('nav.adminUsers'), path: '/admin/users' });
    } else if (segments.includes('memory')) {
      breadcrumbs.push({ label: 'Memorie', path: '/admin/memory' });
    }
  } else if (segments.includes('files')) {
    breadcrumbs.push({ label: t('nav.files'), path: `/w/${workspaceId}/files`, icon: FolderOpen });
  } else if (segments.includes('conversations')) {
    breadcrumbs.push({ label: t('nav.conversations'), path: `/w/${workspaceId}/conversations`, icon: History });
  } else if (segments.includes('chat')) {
    breadcrumbs.push({ label: t('nav.chat'), path: `/w/${workspaceId}/chat`, icon: MessageSquare });
  }

  return breadcrumbs;
}

function TopNavBar() {
  const { t } = useTranslation();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const location = useLocation();
  const { currentWorkspaceId } = useWorkspaceStore();
  const { isAdmin, isUserPlus } = useAuthStore();
  
  const effectiveWorkspaceId = workspaceId || currentWorkspaceId || 'default';
  const breadcrumbs = getBreadcrumbs(location.pathname, effectiveWorkspaceId, t);

  // Workspace settings items for User+ and Admin
  const workspaceSettingsItems = [
    { key: 'prompt', path: `/w/${effectiveWorkspaceId}/settings/prompt`, icon: FileText, label: t('nav.settingsPrompt') },
    { key: 'workspace-users', path: `/w/${effectiveWorkspaceId}/workspace-users`, icon: Users, label: 'Utilizatori' },
  ];

  // Admin-only workspace settings
  const adminWorkspaceSettings = [
    { key: 'models', path: `/w/${effectiveWorkspaceId}/settings/models`, icon: Cpu, label: t('nav.settingsModels') },
    { key: 'rag', path: `/w/${effectiveWorkspaceId}/settings/rag`, icon: Sliders, label: t('nav.settingsRag') },
  ];

  // Admin global items
  const adminNavItems = [
    { key: 'workspaces', path: '/admin/workspaces', icon: Building2, label: t('nav.adminWorkspaces') },
    { key: 'users', path: '/admin/users', icon: Users, label: t('nav.adminUsers') },
  ];

  // Don't render if user has no elevated permissions
  if (!isUserPlus && !isAdmin) return null;

  return (
    <header className="border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-card dark:to-card/80">
      {/* Breadcrumbs Row */}
      <div className="h-10 px-5 flex items-center border-b border-border/50">
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path + index}>
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 mx-1" />
              )}
              <NavLink
                to={crumb.path}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200",
                  index === breadcrumbs.length - 1
                    ? "text-foreground font-medium bg-white dark:bg-white/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                )}
              >
                {crumb.icon && <crumb.icon className="h-3.5 w-3.5" />}
                <span>{crumb.label}</span>
              </NavLink>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Navigation Tabs Row */}
      <div className="h-11 px-5 flex items-center gap-6">
        {/* Workspace Settings - User+ and Admin */}
        {(isUserPlus || isAdmin) && (
          <div className="flex items-center">
            <div className="flex items-center gap-0.5 bg-white dark:bg-white/5 rounded-lg p-1 shadow-sm border border-border/40">
              {workspaceSettingsItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              ))}
              {isAdmin && adminWorkspaceSettings.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Admin Panel - Admin only */}
        {isAdmin && (
          <>
            <div className="h-5 w-px bg-border/60" />
            <div className="flex items-center">
              <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-1 shadow-sm border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 hidden lg:inline">ADMIN</span>
                </div>
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-amber-500 text-white shadow-sm" 
                        : "text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export function MainLayout() {
  const { sidebarOpen, setSidebarOpen, sourcesPanelOpen, toggleSourcesPanel } = useUIStore();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { isUserPlus, isAdmin } = useAuthStore();
  const showSourcesPanel = location.pathname.includes('/chat') && sourcesPanelOpen && !isMobile;
  const showTopNav = (isUserPlus || isAdmin) && !isMobile;

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

        {/* Top Navigation Bar for Settings/Admin */}
        {showTopNav && <TopNavBar />}

        <div className="flex flex-1 min-h-0">
          <main className={cn("flex-1 min-w-0 flex flex-col bg-[#f7f7f8] dark:bg-background", showSourcesPanel && "lg:mr-80")}>
            <Outlet />
          </main>

          {/* Live Reasoning panel */}
          {showSourcesPanel && (
            <aside className={cn(
              "fixed right-0 bottom-0 w-80 border-l bg-white dark:bg-card hidden lg:block",
              showTopNav ? "top-[84px]" : "top-0"
            )}>
              <div className="flex items-center justify-between p-3 border-b">
                <h2 className="font-semibold text-sm">{t('reasoning.title')}</h2>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSourcesPanel}>
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
