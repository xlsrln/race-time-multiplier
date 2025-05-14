
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
const isPreviewEnv = window.location.hostname.includes('preview--');
const baseName = isPreviewEnv ? '/' : '/race-time-multiplier';

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
