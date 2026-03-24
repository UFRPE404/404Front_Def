import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, BarChart3, Zap, LineChart, Tv2, Ticket, BookOpen, Trophy, Target } from "lucide-react";

const HeroBanner = () => {
  const [open, setOpen] = useState(false);

  const scrollToSugestoes = () => {
    const el = document.getElementById("banner-ao-vivo");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
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
          <Button variant="hero" size="lg" onClick={scrollToSugestoes}>
            Começar análise
          </Button>
          <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              O que é o FutData?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground -mt-1">
            Sua plataforma completa de análise esportiva integrada à Esportes da Sorte.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-1">
            {/* Coluna esquerda */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-2 mb-2">
                  <LineChart className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Análise de Partidas</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Estatísticas, escalações, confrontos diretos (H2H), movimentação de odds e probabilidades para cada desfecho — tudo antes do apito inicial.</p>
              </div>

              <div className="p-3 rounded-xl border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Tv2 className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Acompanhamento ao Vivo</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Placares em tempo real, período do jogo e previsões dinâmicas que se atualizam conforme o jogo evolui.</p>
              </div>

              <div className="p-3 rounded-xl border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Sugestões de Apostas</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Picks diários selecionados por algoritmos — desde apostas de alto valor até as mais seguras, com justificativas claras para cada escolha.</p>
              </div>
            </div>

            {/* Coluna direita */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Múltiplos Esportes</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Futebol, Basquete, Tênis e Vôlei com estatísticas adaptadas, cronogramas semanais e partidas em destaque por modalidade.</p>
              </div>

              <div className="p-3 rounded-xl border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Bilhete de Apostas</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Adicione seleções ao seu bilhete, acompanhe as odds combinadas e gerencie suas apostas sem sair da plataforma.</p>
              </div>

              <div className="p-3 rounded-xl border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Interpretação Inteligente</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Probabilidades e métricas traduzidas em linguagem clara para que você tome decisões fundamentadas — tudo baseado em dados reais, não em palpites.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/60 pt-3 border-t border-border">
            Esta plataforma é um serviço de informação e análise esportiva. Aposte com responsabilidade.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroBanner;