import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CommandPalette from "./components/CommandPalette";
import { DynamicHead } from "./components/DynamicHead";
// import { OnboardingTour } from "./components/OnboardingTour";
import { MobileNav } from "./components/MobileNav";
import { BackendStatusBanner } from "./components/BackendStatusBanner";

const Index = lazy(() => import("./pages/Index"));
const ToolPage = lazy(() => import("./pages/ToolPage"));
const NonPdfToolPage = lazy(() => import("./pages/NonPdfToolPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BatchPage = lazy(() => import("./pages/BatchPage"));
const PipelinePage = lazy(() => import("./pages/PipelinePage"));

const queryClient = new QueryClient();

const RouteLoader = () => (
  <div className="min-h-[40vh] animate-pulse px-4 py-10 sm:px-6">
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="h-6 w-52 rounded-md bg-secondary/70" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card/70" />
        ))}
      </div>
    </div>
  </div>
);

const withRouteFallback = (element: JSX.Element) => (
  <Suspense fallback={<RouteLoader />}>{element}</Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BackendStatusBanner />
        <DynamicHead />
        <CommandPalette />
        {/* OnboardingTour removed */}
        <Routes>
          <Route path="/" element={withRouteFallback(<Index />)} />
          <Route path="/about" element={withRouteFallback(<AboutPage />)} />
          <Route path="/compare" element={withRouteFallback(<ComparePage />)} />
          <Route path="/compare/:competitor" element={withRouteFallback(<ComparePage />)} />
          <Route path="/tool/:slug" element={withRouteFallback(<ToolPage />)} />
          <Route path="/tools/:slug" element={withRouteFallback(<NonPdfToolPage />)} />
          <Route path="/batch" element={withRouteFallback(<BatchPage />)} />
          <Route path="/pipeline" element={withRouteFallback(<PipelinePage />)} />
          <Route path="*" element={withRouteFallback(<NotFound />)} />
        </Routes>
        <MobileNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
