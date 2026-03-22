import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, Zap, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowLeft } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMatchById, type MatchData } from "@/data/matches";

function generateAnalyticsData(match: MatchData) {
  // Seed-based pseudo-random using odds for deterministic data per match
  const seed = match.odds[0] * 100 + match.odds[1] * 10 + match.odds[2];
  const r = (offset: number) => Math.round(((seed * (offset + 1) * 17) % 40) + 50);

  const performanceData = [
    { month: "Jan", acertos: r(1), erros: 100 - r(1) },
    { month: "Fev", acertos: r(2), erros: 100 - r(2) },
    { month: "Mar", acertos: r(3), erros: 100 - r(3) },
    { month: "Abr", acertos: r(4), erros: 100 - r(4) },
    { month: "Mai", acertos: r(5), erros: 100 - r(5) },
    { month: "Jun", acertos: r(6), erros: 100 - r(6) },
  ];

  const baseOddA = match.odds[0];
  const baseOddB = match.odds[2];
  const oddsMovement = [
    { hora: "10h", [match.teamA]: +(baseOddA + 0.10).toFixed(2), [match.teamB]: +(baseOddB - 0.05).toFixed(2) },
    { hora: "12h", [match.teamA]: +(baseOddA + 0.07).toFixed(2), [match.teamB]: +(baseOddB).toFixed(2) },
    { hora: "14h", [match.teamA]: +(baseOddA + 0.03).toFixed(2), [match.teamB]: +(baseOddB + 0.07).toFixed(2) },
    { hora: "16h", [match.teamA]: +(baseOddA + 0.05).toFixed(2), [match.teamB]: +(baseOddB + 0.03).toFixed(2) },
    { hora: "18h", [match.teamA]: +(baseOddA).toFixed(2), [match.teamB]: +(baseOddB + 0.10).toFixed(2) },
    { hora: "20h", [match.teamA]: +(baseOddA - 0.03).toFixed(2), [match.teamB]: +(baseOddB + 0.15).toFixed(2) },
  ];

  const radarData = [
    { stat: "Posse", [match.teamA]: r(10), [match.teamB]: r(11) },
    { stat: "Finalizações", [match.teamA]: r(12), [match.teamB]: r(13) },
    { stat: "Passes", [match.teamA]: r(14), [match.teamB]: r(15) },
    { stat: "Defesa", [match.teamA]: r(16), [match.teamB]: r(17) },
    { stat: "Contra-ataques", [match.teamA]: r(18), [match.teamB]: r(19) },
    { stat: "Bolas paradas", [match.teamA]: r(20), [match.teamB]: r(21) },
  ];

  const scores = ["2 x 1", "0 x 0", "1 x 3", "2 x 2", "3 x 0"];
  const winners = ["home", "draw", "away", "draw", "home"] as const;
  const h2hResults = [
    { date: "12/03/2025", home: match.teamA, away: match.teamB, score: scores[0], winner: winners[0] },
    { date: "28/11/2024", home: match.teamB, away: match.teamA, score: scores[1], winner: winners[1] },
    { date: "05/08/2024", home: match.teamA, away: match.teamB, score: scores[2], winner: winners[2] },
    { date: "14/04/2024", home: match.teamB, away: match.teamA, score: scores[3], winner: winners[3] },
    { date: "20/01/2024", home: match.teamA, away: match.teamB, score: scores[4], winner: winners[4] },
  ];

  const opponents = ["Santos", "Botafogo", "Vasco", "São Paulo", "Cruzeiro"];
  const results = ["V", "V", "E", "D", "V"];
  const formScores = ["2-0", "3-1", "1-1", "0-2", "1-0"];
  const formData = opponents.map((opp, i) => ({
    match: `vs ${opp}`,
    result: results[i],
    score: formScores[i],
  }));

  const pieData = [
    { name: "Vitórias Casa", value: 45 },
    { name: "Vitórias Fora", value: 28 },
    { name: "Empates", value: 27 },
  ];

  // Stats derived from odds
  const winProb = Math.round((1 / Math.min(...match.odds)) * 100);
  const avgOdd = +(match.odds.reduce((a, b) => a + b, 0) / 3).toFixed(2);

  return { performanceData, oddsMovement, radarData, h2hResults, formData, pieData, winProb, avgOdd };
}

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
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"geral" | "h2h" | "odds">("geral");

  const match = matchId ? getMatchById(decodeURIComponent(matchId)) : undefined;

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Partida não encontrada</h1>
          <p className="text-muted-foreground">A partida que você procura não existe ou foi removida.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { performanceData, oddsMovement, radarData, h2hResults, formData, pieData, winProb, avgOdd } = generateAnalyticsData(match);

  // Determine predicted winner
  const minOdd = Math.min(...match.odds);
  const favIndex = match.odds.indexOf(minOdd);
  const favLabel = favIndex === 0 ? match.teamA : favIndex === 2 ? match.teamB : "Empate";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Back + Match Header */}
        <RevealSection>
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-primary">{match.league}</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground" style={{ lineHeight: 1.1 }}>
                  {match.teamA} <span className="text-muted-foreground font-normal">vs</span> {match.teamB}
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {match.live && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      AO VIVO
                    </span>
                  )}
                  <span>{match.time}</span>
                  {match.scoreA !== undefined && (
                    <span className="text-foreground font-bold">{match.scoreA} x {match.scoreB}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Casa</p>
                  <p className="text-lg font-bold text-foreground">{match.odds[0]}</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Empate</p>
                  <p className="text-lg font-bold text-foreground">{match.odds[1]}</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fora</p>
                  <p className="text-lg font-bold text-foreground">{match.odds[2]}</p>
                </div>
              </div>
            </div>
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
              <StatCard label="Favorito" value={favLabel} change={`${winProb}% prob.`} positive icon={Target} delay={0} />
              <StatCard label="Odd Média" value={avgOdd.toString()} change={match.league} positive icon={Activity} delay={70} />
              <StatCard label="Confrontos" value="5" change="Últimos 2 anos" positive icon={BarChart3} delay={140} />
              <StatCard label="Tendência" value={winProb > 40 ? "Alta" : "Estável"} change={`+${winProb - 30}%`} positive icon={TrendingUp} delay={210} />
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
                  <h2 className="text-base font-semibold text-foreground">Últimas Partidas — {match.teamA}</h2>
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
                  <h2 className="text-base font-semibold text-foreground">Comparativo — {match.teamA} vs {match.teamB}</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(222, 40%, 22%)" />
                        <PolarAngleAxis dataKey="stat" tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 11 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} />
                        <Radar name={match.teamA} dataKey={match.teamA} stroke="hsl(0, 72%, 55%)" fill="hsl(0, 72%, 55%)" fillOpacity={0.15} strokeWidth={2} />
                        <Radar name={match.teamB} dataKey={match.teamB} stroke="hsl(148, 78%, 56%)" fill="hsl(148, 78%, 56%)" fillOpacity={0.15} strokeWidth={2} />
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
                      <p className="text-xs text-muted-foreground">Vitórias {match.teamA}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold text-foreground">2</p>
                      <p className="text-xs text-muted-foreground">Empates</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold text-foreground">1</p>
                      <p className="text-xs text-muted-foreground">Vitórias {match.teamB}</p>
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
                    <h2 className="text-base font-semibold text-foreground">Variação de Odds — {match.teamA} vs {match.teamB}</h2>
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
                        <Area type="monotone" dataKey={match.teamA} name={match.teamA} stroke="hsl(0, 72%, 55%)" fill="url(#redGrad)" strokeWidth={2.5} />
                        <Area type="monotone" dataKey={match.teamB} name={match.teamB} stroke="hsl(148, 78%, 56%)" fill="url(#greenGrad2)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={100}>
                <div className="space-y-4">
                  <div className="match-card space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Melhores Odds — {match.teamA}</h3>
                    {[
                      { casa: "Casa A", odd: match.odds[0].toFixed(2), trend: "up" },
                      { casa: "Casa B", odd: (match.odds[0] - 0.03).toFixed(2), trend: "down" },
                      { casa: "Casa C", odd: (match.odds[0] - 0.05).toFixed(2), trend: "up" },
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
                    <h3 className="text-sm font-semibold text-foreground">Melhores Odds — {match.teamB}</h3>
                    {[
                      { casa: "Casa A", odd: match.odds[2].toFixed(2), trend: "up" },
                      { casa: "Casa B", odd: (match.odds[2] - 0.05).toFixed(2), trend: "up" },
                      { casa: "Casa C", odd: (match.odds[2] - 0.12).toFixed(2), trend: "down" },
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
                    A odd de {match.teamA} apresenta variação nas últimas horas, indicando movimentação do mercado. {match.teamB} apresenta valorização, sugerindo atenção na análise antes de apostar.
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
