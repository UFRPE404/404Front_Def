import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import LiveMatches from "@/components/LiveMatches";
import GamesCarousel from "@/components/GamesCarousel";
import SportsSidebar from "@/components/SportsSidebar";
import FeaturedMatches from "@/components/FeaturedMatches";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto pb-8">
        <HeroBanner />
        <LiveMatches />
        <GamesCarousel />
        <div className="flex flex-col lg:flex-row gap-6 px-4 mt-8">
          <SportsSidebar />
          <FeaturedMatches />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
