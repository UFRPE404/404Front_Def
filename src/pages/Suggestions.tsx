import { Sparkles, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import SuggestedBets from "@/components/SuggestedBets";
import { Button } from "@/components/ui/button";

const Suggestions = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto pb-8">
        {/* Hero Header */}
        <div className="px-4 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Sugestões de Apostas</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Explore nossas picks mais interessantes do dia. Apostas curadas especialmente para você com análises detalhadas e odds competitivas.
          </p>
        </div>

        {/* Promotional Banner */}
        <div className="px-4 mb-12">
          <div
            className="rounded-2xl overflow-hidden relative h-48 md:h-56 group cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(to right, hsl(150, 70%, 38%) 0%, hsl(148, 78%, 52%) 100%)",
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path
                    fill="currentColor"
                    d="M100,20 Q150,50 150,100 Q150,150 100,180 Q50,150 50,100 Q50,50 100,20 Z"
                  />
                </svg>
              </div>
            </div>

            <div className="relative h-full flex flex-col items-start justify-center px-6 md:px-12">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-white/20 backdrop-blur-sm">
                  NOVIDADE
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 max-w-xl">
                Análises Profissionais
              </h2>
              <p className="text-white/90 text-sm md:text-base max-w-xl mb-6">
                Acesse nossos insights aprofundados e análises de especialistas em apostas desportivas.
              </p>
              <Button
                variant="secondary"
                className="group/btn"
              >
                Saiba Mais
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Suggested Bets Carousels */}
        <div className="px-0">
          <SuggestedBets />
        </div>
      </main>
      <Footer />
      <BetSlip />
    </div>
  );
};

export default Suggestions;
