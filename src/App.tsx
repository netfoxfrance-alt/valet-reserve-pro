import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CenterBooking from "./pages/CenterBooking";
import Booking from "./pages/Booking";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardAvailability from "./pages/DashboardAvailability";
import DashboardPacks from "./pages/DashboardPacks";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardRequests from "./pages/DashboardRequests";
import DashboardStats from "./pages/DashboardStats";
import DashboardMyPage from "./pages/DashboardMyPage";

import CompleteSignup from "./pages/CompleteSignup";
import NotFound from "./pages/NotFound";
import AdminRequests from "./pages/AdminRequests";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-signup" element={<CompleteSignup />} />
            <Route path="/c/:slug" element={<CenterBooking />} />
            
            {/* All dashboard routes - Trial model (no restrictions) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/availability" element={
              <ProtectedRoute>
                <DashboardAvailability />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/packs" element={
              <ProtectedRoute>
                <DashboardPacks />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/stats" element={
              <ProtectedRoute>
                <DashboardStats />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/requests" element={
              <ProtectedRoute>
                <DashboardRequests />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <DashboardSettings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/my-page" element={
              <ProtectedRoute>
                <DashboardMyPage />
              </ProtectedRoute>
            } />
            
            {/* Admin page (password protected, not auth protected) */}
            <Route path="/admin/requests" element={<AdminRequests />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
