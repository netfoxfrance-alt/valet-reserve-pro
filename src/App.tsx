import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Eager-loaded (public-facing, first paint)
import Index from "./pages/Index";
import CenterBooking from "./pages/CenterBooking";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-loaded (dashboard + secondary pages — only loaded when needed)
const AcceptQuote = lazy(() => import("./pages/AcceptQuote"));
const DepositPayment = lazy(() => import("./pages/DepositPayment"));
const DepositSuccess = lazy(() => import("./pages/DepositSuccess"));
const DepositCancel = lazy(() => import("./pages/DepositCancel"));
const Booking = lazy(() => import("./pages/Booking"));
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardCalendar = lazy(() => import("./pages/DashboardCalendar"));
const DashboardAvailability = lazy(() => import("./pages/DashboardAvailability"));
const DashboardPacks = lazy(() => import("./pages/DashboardPacks"));
const DashboardCustomServices = lazy(() => import("./pages/DashboardCustomServices"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const DashboardRequests = lazy(() => import("./pages/DashboardRequests"));
const DashboardStats = lazy(() => import("./pages/DashboardStats"));
const DashboardMyPage = lazy(() => import("./pages/DashboardMyPage"));
const DashboardInvoices = lazy(() => import("./pages/DashboardInvoices"));
const DashboardClients = lazy(() => import("./pages/DashboardClients"));
const DashboardSupport = lazy(() => import("./pages/DashboardSupport"));
const DashboardFormules = lazy(() => import("./pages/DashboardFormules"));
const DashboardSales = lazy(() => import("./pages/DashboardSales"));
const CompleteSignup = lazy(() => import("./pages/CompleteSignup"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfSale = lazy(() => import("./pages/TermsOfSale"));
const LegalNotices = lazy(() => import("./pages/LegalNotices"));
const Presentation = lazy(() => import("./pages/Presentation"));
const SitemapRedirect = lazy(() => import("./pages/SitemapRedirect"));

import ProtectedRoute from "./components/ProtectedRoute";

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-64">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 2 minutes — no refetch on mount/focus within this window
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 10 minutes before garbage collection
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 2 times with exponential backoff
      retry: 2,
      // Don't refetch every time the window regains focus (reduces unnecessary calls)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/detailing" element={<Index />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/confidentialite" element={<PrivacyPolicy />} />
              <Route path="/cgu" element={<TermsOfSale />} />
              <Route path="/mentions-legales" element={<LegalNotices />} />
              <Route path="/presentation" element={<Presentation />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/complete-signup" element={<CompleteSignup />} />
              {/* All dashboard routes - Trial model (no restrictions) */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardHome />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/reservations" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/formules" element={
                <ProtectedRoute>
                  <DashboardFormules />
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
              <Route path="/dashboard/support" element={
                <ProtectedRoute>
                  <DashboardSupport />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/sales" element={
                <ProtectedRoute>
                  <DashboardSales />
                </ProtectedRoute>
              } />
              
              {/* Deposit payment pages */}
              <Route path="/deposit-payment" element={<DepositPayment />} />
              <Route path="/deposit-success" element={<DepositSuccess />} />
              <Route path="/deposit-cancel" element={<DepositCancel />} />
              <Route path="/accept-quote" element={<AcceptQuote />} />
              {/* Sitemap redirect (reliable fallback without Cloudflare Worker) */}
              <Route path="/sitemap.xml" element={<SitemapRedirect />} />

              {/* Public center page - must be last before catch-all to avoid conflicts */}
              <Route path="/:slug" element={<CenterBooking />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
