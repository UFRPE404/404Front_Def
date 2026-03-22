import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, Zap, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect, useRef } from "react";

const performanceData = [
  { month: "Jan", acertos: 67, erros: 33 },
  { month: "Fev", acertos: 72, erros: 28 },
  { month: "Mar", acertos: 58, erros: 42 },
  { month: "Abr", acertos: 81, erros: 19 },
  { month: "Mai", acertos: 74, erros: 26 },
  { month: "Jun", acertos: 69, erros: 31 },
];

const oddsMovement = [
  { hora: "10h", flamengo: 1.85, palmeiras: 2.10 },
  { hora: "12h", flamengo: 1.82, palmeiras: 2.15 },
  { hora: "14h", flamengo: 1.78, palmeiras: 2.22 },
  { hora: "16h", flamengo: 1.80, palmeiras: 2.18 },
  { hora: "18h", flamengo: 1.75, palmeiras: 2.25 },
  { hora: "20h", flamengo: 1.72, palmeiras: 2.30 },
];

const radarData = [
  { stat: "Posse", flamengo: 58, palmeiras: 52 },
  { stat: "Finalizações", flamengo: 75, palmeiras: 68 },
  { stat: "Passes", flamengo: 82, palmeiras: 78 },
  { stat: "Defesa", flamengo: 70, palmeiras: 85 },
  { stat: "Contra-ataques", flamengo: 65, palmeiras: 72 },
  { stat: "Bolas paradas", flamengo: 60, palmeiras: 55 },
];

const h2hResults = [
  { date: "12/03/2025", home: "Flamengo", away: "Palmeiras", score: "2 x 1", winner: "home" },
  { date: "28/11/2024", home: "Palmeiras", away: "Flamengo", score: "0 x 0", winner: "draw" },
  { date: "05/08/2024", home: "Flamengo", away: "Palmeiras", score: "1 x 3", winner: "away" },
  { date: "14/04/2024", home: "Palmeiras", away: "Flamengo", score: "2 x 2", winner: "draw" },
  { date: "20/01/2024", home: "Flamengo", away: "Palmeiras", score: "3 x 0", winner: "home" },
];

const formData = [
  { match: "vs Santos", result: "V", score: "2-0" },
  { match: "vs Botafogo", result: "V", score: "3-1" },
  { match: "vs Vasco", result: "E", score: "1-1" },
  { match: "vs São Paulo", result: "D", score: "0-2" },
  { match: "vs Corinthians", result: "V", score: "1-0" },
];

const pieData = [
  { name: "Vitórias Casa", value: 45 },
  { name: "Vitórias Fora", value: 28 },
  { name: "Empates", value: 27 },
];

const PIE_COLORS = [
  "hsl(148, 78%, 56%)",
  "hsl(40, 90%, 55%)",
  "hsl(220, 20%, 65%)",
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) blur(0)" : "translateY(18px)",
        filter: visible ? "blur(0)" : "blur(4px)",
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const StatCard = ({ label, value, change, positive, icon: Icon, delay = 0 }: { label: string; value: string; change: string; positive: boolean; icon: any; delay?: number }) => (
  <RevealSection delay={delay}>
    <div className="match-card flex flex-col gap-3 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.12)" }}>
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <div className="flex items-center gap-1.5">
        {positive ? <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "hsl(var(--insight-positive))" }} /> : <ArrowDownRight className="w-3.5 h-3.5" style={{ color: "hsl(var(--insight-danger))" }} />}
        <span className="text-xs font-medium" style={{ color: positive ? "hsl(var(--insight-positive))" : "hsl(var(--insight-danger))" }}>{change}</span>
        <span className="text-xs text-muted-foreground">vs mês anterior</span>
      </div>
    </div>
  </RevealSection>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="match-card !p-3 text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [activeTab, setActiveTab] = useState<"geral" | "h2h" | "odds">("geral");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <RevealSection>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground" style={{ lineHeight: 1.1 }}>Central de Análises</h1>
            <p className="text-muted-foreground text-sm max-w-lg">Estatísticas detalhadas, variação de odds e confrontos diretos para te ajudar nas suas apostas.</p>
          </div>
        </RevealSection>

        {/* Tabs */}
        <RevealSection delay={80}>
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "hsl(var(--secondary))" }}>
            {([["geral", "Dashboard"], ["h2h", "Confrontos"], ["odds", "Odds"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                style={{ transform: activeTab === key ? "scale(1)" : undefined }}
              >
                {label}
              </button>
            ))}
          </div>
        </RevealSection>

        {activeTab === "geral" && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Taxa de Acerto" value="72.4%" change="+4.2%" positive icon={Target} delay={0} />
              <StatCard label="Jogos Analisados" value="1,847" change="+12.3%" positive icon={BarChart3} delay={70} />
              <StatCard label="Odds Média" value="1.94" change="-0.08" positive={false} icon={Activity} delay={140} />
              <StatCard label="Tendência" value="Alta" change="+8.1%" positive icon={TrendingUp} delay={210} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RevealSection className="lg:col-span-2" delay={100}>
                <div className="match-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">Desempenho Mensal</h2>
                    <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(148, 78%, 56%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(148, 78%, 56%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 22%)" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="acertos" name="Acertos %" stroke="hsl(148, 78%, 56%)" fill="url(#greenGrad)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={180}>
                <div className="match-card space-y-4 h-full">
                  <h2 className="text-base font-semibold text-foreground">Distribuição de Resultados</h2>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                        <span className="font-semibold text-foreground">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>
            </div>

            {/* Form */}
            <RevealSection delay={100}>
              <div className="match-card space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Últimas Partidas — Flamengo</h2>
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-2">
                  {formData.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors duration-200 hover:bg-secondary/60">
                      <span className="text-sm text-foreground">{m.match}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{m.score}</span>
                        <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${m.result === "V" ? "bg-primary/15 text-primary" : m.result === "E" ? "text-yellow-400" : "text-destructive"}`}
                          style={{ background: m.result === "E" ? "hsl(40 90% 55% / 0.15)" : m.result === "D" ? "hsl(0 84% 60% / 0.15)" : undefined }}>
                          {m.result}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </>
        )}

        {activeTab === "h2h" && (
          <>
            {/* Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevealSection>
                <div className="match-card space-y-4">
                  <h2 className="text-base font-semibold text-foreground">Comparativo — Flamengo vs Palmeiras</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(222, 40%, 22%)" />
                        <PolarAngleAxis dataKey="stat" tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 11 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} />
                        <Radar name="Flamengo" dataKey="flamengo" stroke="hsl(0, 72%, 55%)" fill="hsl(0, 72%, 55%)" fillOpacity={0.15} strokeWidth={2} />
                        <Radar name="Palmeiras" dataKey="palmeiras" stroke="hsl(148, 78%, 56%)" fill="hsl(148, 78%, 56%)" fillOpacity={0.15} strokeWidth={2} />
                        <Legend wrapperStyle={{ fontSize: 12, color: "hsl(220, 20%, 65%)" }} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={100}>
                <div className="match-card space-y-4 h-full">
                  <h2 className="text-base font-semibold text-foreground">Histórico de Confrontos</h2>
                  <div className="space-y-2">
                    {h2hResults.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-3 px-3 rounded-lg transition-colors duration-200 hover:bg-secondary/60">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-20">{m.date}</span>
                          <span className={`text-sm font-medium ${m.winner === "home" ? "text-primary" : "text-foreground"}`}>{m.home}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground px-3">{m.score}</span>
                        <span className={`text-sm font-medium ${m.winner === "away" ? "text-primary" : "text-foreground"}`}>{m.away}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-2 border-t border-border">
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold text-foreground">2</p>
                      <p className="text-xs text-muted-foreground">Vitórias Flamengo</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold text-foreground">2</p>
                      <p className="text-xs text-muted-foreground">Empates</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold text-foreground">1</p>
                      <p className="text-xs text-muted-foreground">Vitórias Palmeiras</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            </div>
          </>
        )}

        {activeTab === "odds" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RevealSection className="lg:col-span-2">
                <div className="match-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">Variação de Odds — Flamengo vs Palmeiras</h2>
                    <span className="text-xs text-muted-foreground">Hoje</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={oddsMovement}>
                        <defs>
                          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="greenGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(148, 78%, 56%)" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="hsl(148, 78%, 56%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 22%)" />
                        <XAxis dataKey="hora" tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[1.5, 2.5]} tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="flamengo" name="Flamengo" stroke="hsl(0, 72%, 55%)" fill="url(#redGrad)" strokeWidth={2.5} />
                        <Area type="monotone" dataKey="palmeiras" name="Palmeiras" stroke="hsl(148, 78%, 56%)" fill="url(#greenGrad2)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={100}>
                <div className="space-y-4">
                  <div className="match-card space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Melhores Odds — Flamengo</h3>
                    {[
                      { casa: "Casa A", odd: "1.85", trend: "up" },
                      { casa: "Casa B", odd: "1.82", trend: "down" },
                      { casa: "Casa C", odd: "1.80", trend: "up" },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">{c.casa}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{c.odd}</span>
                          {c.trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="match-card space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Melhores Odds — Palmeiras</h3>
                    {[
                      { casa: "Casa A", odd: "2.30", trend: "up" },
                      { casa: "Casa B", odd: "2.25", trend: "up" },
                      { casa: "Casa C", odd: "2.18", trend: "down" },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">{c.casa}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{c.odd}</span>
                          {c.trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>
            </div>

            {/* Insight card */}
            <RevealSection delay={80}>
              <div className="match-card flex items-start gap-4" style={{ borderColor: "hsl(var(--primary) / 0.3)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.12)" }}>
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Insight de Odds</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A odd do Flamengo caiu 7% nas últimas 10 horas, indicando forte movimentação a favor do time mandante. Palmeiras apresenta valorização de 9.5%, sugerindo menor confiança do mercado.
                  </p>
                </div>
              </div>
            </RevealSection>
          </>
        )}
      </main>
      <Footer />
      <BetSlip />
    </div>
  );
};

export default Analytics;
