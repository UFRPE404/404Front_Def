import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import LiveMatches from "@/components/LiveMatches";
import GamesCarousel from "@/components/GamesCarousel";
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
        <GamesCarousel />
      </main>
      <Footer />
      <BetSlip />
    </div>
  );
};

export default Index;
