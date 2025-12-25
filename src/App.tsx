import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Packages from "./pages/Packages";
import Coverage from "./pages/Coverage";
import FtpLiveTv from "./pages/FtpLiveTv";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ConnectionRequests from "./pages/admin/ConnectionRequests";
import ContactMessages from "./pages/admin/ContactMessages";
import ProblemReports from "./pages/admin/ProblemReports";
import AdminSettings from "./pages/admin/Settings";
import ActivityLogs from "./pages/admin/ActivityLogs";
import NotFound from "./pages/NotFound";

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
            <Route path="/packages" element={<Packages />} />
            <Route path="/coverage" element={<Coverage />} />
            <Route path="/ftp-live-tv" element={<FtpLiveTv />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/connection-requests"
              element={
                <ProtectedRoute requireAdmin>
                  <ConnectionRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contact-messages"
              element={
                <ProtectedRoute requireAdmin>
                  <ContactMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/problem-reports"
              element={
                <ProtectedRoute requireAdmin>
                  <ProblemReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activity-logs"
              element={
                <ProtectedRoute requireAdmin>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
