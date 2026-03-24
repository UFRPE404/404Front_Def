import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import LiveMatches from "@/components/LiveMatches";
import GamesCarousel from "@/components/GamesCarousel";
import SuggestionsCarousel from "@/components/SuggestionsCarousel";
import SportsSidebar from "@/components/SportsSidebar";
import FeaturedMatches from "@/components/FeaturedMatches";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";

const Index = () => {
  const [activeSport, setActiveSport] = useState("Futebol");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto pb-8">
        <HeroBanner />
        <div className="flex flex-col lg:flex-row gap-6 px-4 mt-6">
          <SportsSidebar activeSport={activeSport} onSportChange={setActiveSport} />
          <FeaturedMatches sport={activeSport} />
        </div>

        {/* Banner separator with neon effect */}
        <div className="px-4 mt-10 mb-8">
          <div className="relative overflow-hidden rounded-xl border border-primary/40 p-8 shadow-xl transition-all duration-500 hover:border-primary/60"
            style={{
              background: "linear-gradient(135deg, hsl(var(--hero-gradient-from))/15, hsl(var(--hero-gradient-to))/15)",
              boxShadow: "0 0 20px hsl(var(--primary) / 0.2), 0 0 40px hsl(var(--primary) / 0.1), inset 0 0 15px hsl(var(--primary) / 0.08)"
            }}>
            <div className="relative z-10 flex flex-col items-center justify-center text-center gap-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Acompanhe os Jogos ao Vivo
              </h3>
              <p className="text-sm text-muted-foreground">Partidas em tempo real com análises instantâneas</p>
            </div>
          </div>
        </div>

        <LiveMatches />
        <div className="px-4 mt-3 flex justify-end">
          <Link
            to="/ao-vivo?sport=Todos"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Ver todos ao vivo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <GamesCarousel />
        <div className="px-4 mt-3 flex justify-end">
          <Link
            to="/esportes?sport=Todos"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Ver todos os esportes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Suggestions banner */}
        <div className="px-4 mt-10 mb-8">
          <div className="relative overflow-hidden rounded-xl border border-primary/40 p-8 shadow-xl transition-all duration-500 hover:border-primary/60"
            style={{
              background: "linear-gradient(135deg, hsl(var(--hero-gradient-from))/15, hsl(var(--hero-gradient-to))/15)",
              boxShadow: "0 0 20px hsl(var(--primary) / 0.2), 0 0 40px hsl(var(--primary) / 0.1), inset 0 0 15px hsl(var(--primary) / 0.08)"
            }}>
            <div className="relative z-10 flex flex-col items-center justify-center text-center gap-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Sugestões de Apostas do Dia
              </h3>
              <p className="text-sm text-muted-foreground">As melhores oportunidades selecionadas para você</p>
            </div>
          </div>
        </div>

        <SuggestionsCarousel />
      </main>
      <Footer />
      <BetSlip />
    </div>
  );
};

export default Index;
