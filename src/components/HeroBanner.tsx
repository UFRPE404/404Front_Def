import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Zap } from "lucide-react";

const HeroBanner = () => {
  return (
    <section
      className="relative overflow-hidden rounded-2xl mx-4 mt-4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/mainBanner.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Padrão de pontos no fundo */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Logos na Extrema Direita (Topo e Bottom) */}
      <img 
        src="/FutDataLogo.svg" 
        alt="Logo FutData" 
        className="absolute top-6 right-6 md:top-8 md:right-8 h-8 md:h-10 w-auto z-10 opacity-90 hover:opacity-100 transition-opacity" 
      />
      <img 
        src="/EsportesDaSorteLogo.svg" 
        alt="Logo Esportes da Sorte" 
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 h-8 md:h-10 w-auto z-10 opacity-90 hover:opacity-100 transition-opacity" 
      />

      {/* Conteúdo Principal */}
      <div className="relative z-10 px-8 py-12 md:py-16 max-w-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Análise Esportiva</span>
          </div>
        </div>
        <h1
          className="text-3xl md:text-4xl font-extrabold text-white mb-4"
          style={{ lineHeight: 1.1, textWrap: "balance" }}
        >
          Entenda o jogo antes dele acontecer
        </h1>
        <p
          className="text-white/80 text-sm md:text-base mb-6 max-w-md"
          style={{ textWrap: "pretty" }}
        >
          Insights inteligentes, probabilidades interpretadas e análises em tempo
          real. Seu assistente para decisões mais fundamentadas.
        </p>
        <div className="flex items-center gap-3 mb-8">
          <Button variant="hero" size="lg">
            Começar análise
          </Button>
          <Button variant="outline" size="lg">
            Como funciona
          </Button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs text-white/70">Chances de gol</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs text-white/70">Previsão ao vivo</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;