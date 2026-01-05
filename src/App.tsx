import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import ChatPage from "./pages/ChatPage";
import LibraryPage from "./pages/LibraryPage";
import ConversationsPage from "./pages/ConversationsPage";
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
          <Route element={<MainLayout />}>
            <Route path="/" element={<ChatPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/prompt" element={<AdminPromptPage />} />
            <Route path="/admin/rag" element={<AdminRagPage />} />
            <Route path="/admin/memory" element={<AdminMemoryPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
