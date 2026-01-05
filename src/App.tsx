import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ChatPage from "./pages/ChatPage";
import LibraryPage from "./pages/LibraryPage";
import ConversationsPage from "./pages/ConversationsPage";
import FilesPage from "./pages/FilesPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPromptPage from "./pages/AdminPromptPage";
import AdminRagPage from "./pages/AdminRagPage";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Legacy routes - redirect to workspace routes */}
          <Route path="/" element={<Navigate to="/w/default/chat" replace />} />
          
          {/* Workspace-scoped routes */}
          <Route element={<MainLayout />}>
            <Route path="/w/:workspaceId/chat" element={<ChatPage />} />
            <Route path="/w/:workspaceId/conversations" element={<ConversationsPage />} />
            <Route path="/w/:workspaceId/files" element={
              <ProtectedRoute requireUserPlus>
                <FilesPage />
              </ProtectedRoute>
            } />
            <Route path="/w/:workspaceId/settings/prompt" element={
              <ProtectedRoute requireAdmin>
                <AdminPromptPage />
              </ProtectedRoute>
            } />
            <Route path="/w/:workspaceId/settings/rag" element={
              <ProtectedRoute requireAdmin>
                <AdminRagPage />
              </ProtectedRoute>
            } />
            
            {/* Legacy routes */}
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/prompt" element={
              <ProtectedRoute requireAdmin>
                <AdminPromptPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/rag" element={
              <ProtectedRoute requireAdmin>
                <AdminRagPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/memory" element={
              <ProtectedRoute requireAdmin>
                <AdminMemoryPage />
              </ProtectedRoute>
            } />
          </Route>
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
