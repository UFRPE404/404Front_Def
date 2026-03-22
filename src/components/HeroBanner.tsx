import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Zap } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4" style={{ background: "linear-gradient(135deg, hsl(var(--hero-gradient-from)), hsl(var(--hero-gradient-to)))" }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="relative z-10 px-8 py-12 md:py-16 max-w-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Análise Esportiva</span>
          </div>
        </div>
        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          style={{ lineHeight: 1.1, textWrap: "balance" }}
        >
          Entenda o jogo antes dele acontecer
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md" style={{ textWrap: "pretty" }}>
          Insights inteligentes, probabilidades interpretadas e análises em tempo real. Seu assistente para decisões mais fundamentadas.
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
            <span className="text-xs text-muted-foreground">Chances de gol</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Previsão ao vivo</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
