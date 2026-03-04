import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ToolPage from "./pages/ToolPage";
import NonPdfToolPage from "./pages/NonPdfToolPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import BatchPage from "./pages/BatchPage";
import PipelinePage from "./pages/PipelinePage";
import CommandPalette from "./components/CommandPalette";
import { DynamicHead } from "./components/DynamicHead";
import { OnboardingTour } from "./components/OnboardingTour";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DynamicHead />
        <CommandPalette />
        <OnboardingTour />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<LandingPage />} />
          <Route path="/tool/:slug" element={<ToolPage />} />
          <Route path="/tools/:slug" element={<NonPdfToolPage />} />
          <Route path="/batch" element={<BatchPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
