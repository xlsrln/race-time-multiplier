
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create a new query client
const queryClient = new QueryClient();

// Improved base path detection that works across all environments
const getBaseName = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/';
  }
  
  // GitHub Pages (github.io domain)
  if (hostname.includes('github.io')) {
    return '/race-time-multiplier';
  }
  
  // Lovable preview environment
  if (hostname.includes('preview--') || hostname.includes('.lovable.app')) {
    // Check if we're already at the correct path
    if (pathname.startsWith('/race-time-multiplier')) {
      return '/race-time-multiplier';
    }
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
          {/* Catch any unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
