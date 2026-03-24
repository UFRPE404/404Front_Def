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
        <div id="inicio" className="flex flex-col lg:flex-row gap-6 px-4 mt-6">
          <SportsSidebar activeSport={activeSport} onSportChange={setActiveSport} />
          <FeaturedMatches sport={activeSport} />
        </div>

        {/* Banner separator - Live matches */}
        <div id="banner-ao-vivo" className="px-4 mt-10 mb-8" style={{ scrollMarginTop: "67px" }}>
          <div className="overflow-hidden rounded-xl shadow-xl h-44">
            <img src="/1.png" alt="Jogos ao Vivo" className="w-full h-full object-cover" />
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
        <div id="sugestoes" className="px-4 mt-10 mb-8">
          <div className="overflow-hidden rounded-xl shadow-xl h-44">
            <img src="/2.png" alt="Sugestões de Apostas" className="w-full h-full object-cover" />
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
