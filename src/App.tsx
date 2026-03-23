import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import Index from "./pages/Index.tsx";
import Analytics from "./pages/Analytics.tsx";
import Live from "./pages/Live.tsx";
import Suggestions from "./pages/Suggestions.tsx";
import Sports from "./pages/Sports.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BetSlipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sugestoes" element={<Suggestions />} />
            <Route path="/esportes" element={<Sports />} />
            <Route path="/ao-vivo" element={<Live />} />
            <Route path="/analises/:matchId" element={<Analytics />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BetSlipProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
