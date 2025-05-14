
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create a new query client
const queryClient = new QueryClient();

// Determine if we're in preview mode (no basename needed) or production (with basename)
// Also handle GitHub Pages environment
const getBaseName = () => {
  const hostname = window.location.hostname;
  
  // Handle GitHub Pages (github.io domain)
  if (hostname.includes('github.io')) {
    return '/race-time-multiplier';
  }
  
  // Handle Lovable preview environment
  if (hostname.includes('preview--')) {
    return '/';
  }
  
  // Default to production path
  return '/race-time-multiplier';
};

const baseName = getBaseName();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={baseName}>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Redirect any broken links back to home */}
          <Route path="/race-time-multiplier/*" element={<Navigate to="/" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
