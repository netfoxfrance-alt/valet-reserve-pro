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
import DashboardCalendar from "./pages/DashboardCalendar";
import DashboardAvailability from "./pages/DashboardAvailability";
import DashboardPacks from "./pages/DashboardPacks";
import DashboardCustomServices from "./pages/DashboardCustomServices";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardRequests from "./pages/DashboardRequests";
import DashboardStats from "./pages/DashboardStats";
import DashboardMyPage from "./pages/DashboardMyPage";
import DashboardInvoices from "./pages/DashboardInvoices";
import DashboardClients from "./pages/DashboardClients";

import CompleteSignup from "./pages/CompleteSignup";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfSale from "./pages/TermsOfSale";
import LegalNotices from "./pages/LegalNotices";
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
            <Route path="/confidentialite" element={<PrivacyPolicy />} />
            <Route path="/cgv" element={<TermsOfSale />} />
            <Route path="/mentions-legales" element={<LegalNotices />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-signup" element={<CompleteSignup />} />
            {/* All dashboard routes - Trial model (no restrictions) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/calendar" element={
              <ProtectedRoute>
                <DashboardCalendar />
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
            <Route path="/dashboard/custom-services" element={
              <ProtectedRoute>
                <DashboardCustomServices />
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
            <Route path="/dashboard/invoices" element={
              <ProtectedRoute>
                <DashboardInvoices />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/clients" element={
              <ProtectedRoute>
                <DashboardClients />
              </ProtectedRoute>
            } />
            
            {/* Public center page - must be last before catch-all to avoid conflicts */}
            <Route path="/:slug" element={<CenterBooking />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
