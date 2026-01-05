import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAppInit } from "@/hooks/useAppInit";
import { Loader2 } from "lucide-react";
import ChatPage from "./pages/ChatPage";
import ConversationsPage from "./pages/ConversationsPage";
import FilesPage from "./pages/FilesPage";
import WorkspaceModelsPage from "./pages/WorkspaceModelsPage";
import WorkspacePromptPage from "./pages/WorkspacePromptPage";
import WorkspaceRagPage from "./pages/WorkspaceRagPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminWorkspacesPage from "./pages/AdminWorkspacesPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMemoryPage from "./pages/AdminMemoryPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isInitialized } = useAppInit();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to default workspace */}
        <Route path="/" element={<Navigate to="/w/default/chat" replace />} />
        
        {/* Workspace-scoped routes */}
        <Route element={<MainLayout />}>
          {/* Chat - all roles */}
          <Route path="/w/:workspaceId/chat" element={<ChatPage />} />
          <Route path="/w/:workspaceId/conversations" element={<ConversationsPage />} />
          
          {/* Files - Admin + User+ */}
          <Route path="/w/:workspaceId/files" element={
            <ProtectedRoute requireUserPlus>
              <FilesPage />
            </ProtectedRoute>
          } />
          
          {/* Workspace Settings - Admin only */}
          <Route path="/w/:workspaceId/settings/models" element={
            <ProtectedRoute requireAdmin>
              <WorkspaceModelsPage />
            </ProtectedRoute>
          } />
          <Route path="/w/:workspaceId/settings/prompt" element={
            <ProtectedRoute requireAdmin>
              <WorkspacePromptPage />
            </ProtectedRoute>
          } />
          <Route path="/w/:workspaceId/settings/rag" element={
            <ProtectedRoute requireAdmin>
              <WorkspaceRagPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Global Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/workspaces" element={
            <ProtectedRoute requireAdmin>
              <AdminWorkspacesPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/memory" element={
            <ProtectedRoute requireAdmin>
              <AdminMemoryPage />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
