
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/login-form";
import AnalystDashboard from "./components/analyst-dashboard";
import CoordinatorDashboard from "./components/coordinator-dashboard";
import MembersManagement from "./components/admin/members-management";
import AuthComponent from "./components/AuthComponent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/analyst"
            element={
              <AuthComponent requiredRole="analyst">
                <AnalystDashboard />
              </AuthComponent>
            }
          />
          <Route
            path="/coordinator"
            element={
              <AuthComponent requiredRole="coordinator">
                <CoordinatorDashboard />
              </AuthComponent>
            }
          />
          <Route
            path="/admin/members"
            element={
              <AuthComponent requiredRole="admin">
                <MembersManagement />
              </AuthComponent>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
