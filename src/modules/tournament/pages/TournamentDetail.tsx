/**
 * @file src/modules/tournament/pages/TournamentDetail.tsx
 * @description Detalle del torneo: partidos, equipos, tabla de posiciones,
 *              goleadores y llave eliminatoria.
 */
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import logoTechcup from "@/assets/logo.png";
import { tournamentService, type TournamentTeamDto, type TournamentMatchDto, type StandingDto } from "../services/tournamentService";
import {
  User,
  LogOut,
  ChevronLeft,
  Trophy,
  Users,
  Calendar,
  Edit,
  Eye,
  AlertCircle,
  Clock,
  MapPin,
  Plus,
  X,
  CheckCircle,
  Save,
  BarChart2,
  GitBranch,
} from "lucide-react";
import { statisticsService } from "../services/statisticsService";

// ── Palette ───────────────────────────────────────
const P = {
  primary:     "#B81C1C",
  secondary:   "#C4841D",
  success:     "#17C964",
  info:        "#0066FE",
  default:     "#6E6E73",
  textPrimary: "#1C1C1E",
  bg:          "#F2F2F7",
};

// ── Tipos — reutilizados del servicio ─────────────
type Team    = TournamentTeamDto;
type Match   = TournamentMatchDto;
type Standing = StandingDto;

interface BracketTeam {
  name: string;
  score?: number;
  winner?: boolean;
}

interface BracketMatch {
  a: BracketTeam;
  b: BracketTeam;
  done: boolean;
}

interface BracketRound {
  label: string;
  matches: BracketMatch[];
}


const mockBracket: BracketRound[] = [
  {
    label: "Cuartos de Final",
    matches: [
      { a: { name: "Los Tigres FC",   score: 3, winner: true },  b: { name: "Relámpagos",      score: 2 }, done: true  },
      { a: { name: "Dragones Rojos",  score: 1 },                b: { name: "Águilas Doradas", score: 1 }, done: false },
      { a: { name: "TBD" },                                      b: { name: "TBD" },                        done: false },
      { a: { name: "TBD" },                                      b: { name: "TBD" },                        done: false },
    ],
  },
  {
    label: "Semifinales",
    matches: [
      { a: { name: "Los Tigres FC" }, b: { name: "TBD" }, done: false },
      { a: { name: "TBD" },           b: { name: "TBD" }, done: false },
    ],
  },
  {
    label: "Final",
    matches: [
      { a: { name: "TBD" }, b: { name: "TBD" }, done: false },
    ],
  },
];

// ── Status helpers ────────────────────────────────
const matchStatusColor = (s: Match["status"]) =>
  s === "completed" ? P.success : s === "in-progress" ? P.secondary : P.info;

const matchStatusLabel = (s: Match["status"]) =>
  s === "completed" ? "Finalizado" : s === "in-progress" ? "En Curso" : "Pendiente";


// TournamentDetail

export function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── UI state ──
  const [showLogout,      setShowLogout]      = useState(false);
  const [activeTab,       setActiveTab]       = useState<"matches" | "teams" | "eliminated">("matches");
  const [loadingData,     setLoadingData]     = useState(true);

  // ── Data state ──
  const [teams,     setTeams]     = useState<Team[]>([]);
  const [matches,   setMatches]   = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);

  useEffect(() => {
      if (!id) return;
      const tournamentId = Number(id);

      Promise.all([
          tournamentService.getById(tournamentId),
          statisticsService.getRankedStandings(tournamentId).catch(() => []),
      ])
      .then(([detail, standings]) => {
          setTeams(detail.teams ?? []);
          setMatches(detail.matches ?? []);
          setStandings(standings);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [id]);

  // ── Match detail modal ──
  const [selectedMatch,   setSelectedMatch]   = useState<Match | null>(null);
  const [showMatchDetail, setShowMatchDetail] = useState(false);

  // ── Edit match modal ──
  const [showEditMatch,  setShowEditMatch]  = useState(false);
  const [editForm,       setEditForm]       = useState<Match | null>(null);

  // ── Create match modal ──
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [createForm,      setCreateForm]      = useState<Partial<Match>>({
    date: "", time: "", court: "", teamA: "", teamB: "", status: "pending",
  });

  // ── Derived ──
  const activeTeams    = teams.filter((t) => t.status === "active");
  const eliminatedTeams = teams.filter((t) => t.status === "eliminated");

  const scorersMap = matches.reduce<Record<string, number>>((acc, m) => {
    m.scorers?.forEach((g) => { acc[g.player] = (acc[g.player] ?? 0) + 1; });
    return acc;
  }, {});
  const topScorers = Object.entries(scorersMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const sortedStandings = [...standings].sort(
    (a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc)
  );

  // ── Handlers ──
  const handleLogout = () => {
    setShowLogout(false);
    sessionStorage.removeItem("userContext");
    navigate("/login");
  };

  const handleViewMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowMatchDetail(true);
  };

  const handleEditMatch = (match: Match) => {
    setEditForm({ ...match });
    setShowEditMatch(true);
  };

  const handleSaveMatch = async () => {
    if (!editForm) return;
    try {
      const updated = await tournamentService.updateMatch(editForm.id, editForm);
      setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch { alert("Error al guardar el partido."); }
    setShowEditMatch(false);
    setEditForm(null);
  };

  const handleCreateMatch = () => {
    setCreateForm({ date: "", time: "", court: "", teamA: "", teamB: "", status: "pending" });
    setShowCreateMatch(true);
  };

  const handleSaveNewMatch = async () => {
    if (!createForm.date || !createForm.time || !createForm.court || !createForm.teamA || !createForm.teamB) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (createForm.teamA === createForm.teamB) {
      alert("Los equipos deben ser diferentes");
      return;
    }
    try {
      const created = await tournamentService.createMatch(Number(id), {
        date:    createForm.date!,
        time:    createForm.time!,
        courtId: 0,
        teamAId: 0,
        teamBId: 0,
      });
      setMatches((prev) => [...prev, created]);
    } catch { alert("Error al crear el partido."); }
    setShowCreateMatch(false);
  };

  // ── Shared input style ──
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.1)",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    color: P.textPrimary,
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: P.default,
    marginBottom: "6px",
  };

  
  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: P.bg }}>
        <p style={{ color: P.default, fontSize: "0.9rem", fontWeight: 500 }}>Cargando torneo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 lg:pb-0" style={{ backgroundColor: P.bg }}>

      {/* ── Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b px-6"
        style={{
          background: "rgba(242,242,247,0.85)",
          borderColor: "rgba(0,0,0,0.06)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between h-[60px]">
          <Link to="/">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2.5 cursor-pointer select-none">
              <img src={logoTechcup} alt="TECHCUP Logo" className="w-8 h-8 object-contain" />
              <div>
                <span className="block leading-none" style={{ fontWeight: 800, color: P.primary, fontSize: "1.05rem", letterSpacing: "-0.03em" }}>
                  TECHCUP
                </span>
                <span className="block mt-0.5" style={{ fontSize: "0.62rem", letterSpacing: "0.18em", fontWeight: 600, color: P.secondary, textTransform: "uppercase" }}>
                  Torneo 2026
                </span>
              </div>
            </motion.div>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: `${P.success}12`, border: `1px solid ${P.success}30` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: P.success }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: P.success, textTransform: "uppercase" }}>
              Organizador
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
              onClick={() => setShowLogout(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(184,28,28,0.07)]">
              <LogOut style={{ width: 17, height: 17, color: P.default }} />
            </motion.button>
            <Link to="/profile">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `${P.success}18`, border: `1.5px solid ${P.success}30` }}>
                <User style={{ width: 16, height: 16, color: P.success }} />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Main ── */}
      <main className="max-w-4xl mx-auto px-6 sm:px-10 pt-8 pb-16">

        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          onClick={() => navigate("/organizer/tournaments")}
          className="flex items-center gap-2 mb-6 text-sm group"
          style={{ color: P.default, fontWeight: 600 }}>
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver a Gestión de Torneos
        </motion.button>

        {/* ── Tournament header card ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 mb-6 border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="text-2xl mb-1" style={{ fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.02em" }}>
                TECHCUP 2026 – Fútbol
              </h1>
              <p className="text-sm" style={{ color: P.default, fontWeight: 500 }}>
                1 de marzo – 30 de marzo, 2026
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${P.success}18`, color: P.success, fontWeight: 700 }}>
              En Progreso
            </span>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Users className="w-5 h-5 mx-auto mb-1" style={{ color: P.info }} />,    value: activeTeams.length,  label: "Equipos Activos" },
              { icon: <Trophy className="w-5 h-5 mx-auto mb-1" style={{ color: P.success }} />, value: matches.length,      label: "Partidos" },
              { icon: <AlertCircle className="w-5 h-5 mx-auto mb-1" style={{ color: P.default }} />, value: eliminatedTeams.length, label: "Eliminados" },
              { icon: <Users className="w-5 h-5 mx-auto mb-1" style={{ color: P.secondary }} />, value: "7/12", label: "Jugadores/Equipo" },
            ].map((kpi, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                {kpi.icon}
                <p className="text-xl mb-0.5" style={{ fontWeight: 700, color: P.textPrimary }}>{kpi.value}</p>
                <p className="text-xs" style={{ color: P.default, fontWeight: 600 }}>{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Info pills */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { label: "Cupo máximo",          value: "16 equipos" },
              { label: "Costo inscripción",     value: "$35,000 COP" },
              { label: "Cierre inscripciones",  value: "10 Ene 2026" },
            ].map((pill) => (
              <div key={pill.label} className="rounded-xl px-3 py-2" style={{ backgroundColor: "#F8FAFC" }}>
                <p style={{ fontSize: "0.68rem", color: P.default, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {pill.label}
                </p>
                <p style={{ fontSize: "0.88rem", color: P.textPrimary, fontWeight: 700 }}>{pill.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tabla de posiciones ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
          className="bg-white rounded-2xl p-5 mb-6 border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4" style={{ color: P.info }} />
            <h2 className="text-sm" style={{ color: P.default, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Tabla de Posiciones
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Equipo", "PJ", "G", "E", "P", "GF", "GC", "DG", "Pts"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "6px 8px",
                      fontSize: "0.68rem", fontWeight: 700, color: P.default,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      borderBottom: "1px solid rgba(0,0,0,0.07)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedStandings.map((s, i) => {
                  const isTop  = i < 2;
                  const isElim = i >= sortedStandings.length - 1;
                  const dg     = s.gf - s.gc;
                  return (
                    <tr key={s.team} style={{ background: i === 0 ? "rgba(196,132,29,0.05)" : "transparent" }}>
                      <td style={{
                        padding: "8px", borderBottom: "1px solid rgba(0,0,0,0.04)",
                        borderLeft: `3px solid ${isTop ? P.success : isElim ? P.primary : "transparent"}`,
                      }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 22, height: 22, borderRadius: 6, fontSize: "0.78rem", fontWeight: 800,
                          background: isTop ? `${P.success}18` : "rgba(0,0,0,0.05)",
                          color: isTop ? P.success : P.default,
                        }}>{i + 1}</span>
                      </td>
                      <td style={{ padding: "8px", fontWeight: i === 0 ? 800 : 600, color: P.textPrimary, fontSize: "0.84rem", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>{s.team}</td>
                      {[s.pj, s.g, s.e, s.p, s.gf, s.gc].map((v, ci) => (
                        <td key={ci} style={{ padding: "8px", fontSize: "0.84rem", color: P.default, borderBottom: "1px solid rgba(0,0,0,0.04)" }}>{v}</td>
                      ))}
                      <td style={{ padding: "8px", fontSize: "0.84rem", fontWeight: 700, borderBottom: "1px solid rgba(0,0,0,0.04)", color: dg > 0 ? P.success : dg < 0 ? P.primary : P.default }}>
                        {dg > 0 ? `+${dg}` : dg}
                      </td>
                      <td style={{ padding: "8px", fontSize: "0.84rem", fontWeight: 800, color: P.textPrimary, borderBottom: "1px solid rgba(0,0,0,0.04)" }}>{s.pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-5 mt-3 flex-wrap">
            {[{ color: P.success, label: "Avanza a siguiente fase" }, { color: P.primary, label: "Eliminado" }].map((leg) => (
              <div key={leg.label} className="flex items-center gap-1.5">
                <div style={{ width: 3, height: 14, background: leg.color, borderRadius: 3 }} />
                <span style={{ fontSize: "0.7rem", color: P.default, fontWeight: 500 }}>{leg.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tabla de goleadores ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}
          className="bg-white rounded-2xl p-5 mb-6 border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <h2 className="text-sm mb-3" style={{ color: P.default, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ⚽ Tabla de Goleadores
          </h2>
          {topScorers.length === 0 ? (
            <p style={{ fontSize: "0.84rem", color: P.default }}>Aún no hay goleadores registrados.</p>
          ) : (
            <div className="space-y-2">
              {topScorers.map(([player, goals], idx) => (
                <div key={player} className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{
                    backgroundColor: idx === 0 ? `${P.secondary}14` : "#F7F7F8",
                    border: idx === 0 ? `1px solid ${P.secondary}35` : "1px solid transparent",
                  }}>
                  <p style={{ fontSize: "0.84rem", color: P.textPrimary, fontWeight: idx === 0 ? 800 : 600 }}>
                    {idx + 1}. {player}
                  </p>
                  <span className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: idx === 0 ? `${P.secondary}20` : `${P.info}16`,
                      color: idx === 0 ? P.secondary : P.info,
                      fontWeight: 700,
                    }}>
                    {goals} gol{goals > 1 ? "es" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Llave eliminatoria ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}
          className="bg-white rounded-2xl p-5 mb-6 border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4" style={{ color: P.secondary }} />
            <h2 className="text-sm" style={{ color: P.default, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Llave Eliminatoria
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {mockBracket.map((round) => (
              <div key={round.label} style={{ minWidth: 160 }}>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: P.default, marginBottom: "0.5rem", textAlign: "center" }}>
                  {round.label}
                </p>
                <div className="flex flex-col gap-3">
                  {round.matches.map((match, mi) => (
                    <div key={mi} className="border rounded-xl overflow-hidden" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                      {[match.a, match.b].map((side, si) => (
                        <div key={si}
                          className="flex items-center justify-between px-2.5 py-1.5"
                          style={{
                            borderBottom: si === 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                            background: side.winner ? `${P.success}09` : "transparent",
                          }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: side.winner ? 700 : 600, color: side.winner ? P.success : P.textPrimary }}>
                            {side.name}
                          </span>
                          {match.done && (
                            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: P.primary, marginLeft: 8 }}>
                              {side.score}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.23 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "matches",   label: "Partidos",          Icon: Trophy       },
            { id: "teams",     label: "Equipos Activos",   Icon: Users        },
            { id: "eliminated",label: "Equipos Eliminados",Icon: AlertCircle  },
          ].map(({ id, label, Icon }) => (
            <motion.button key={id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap"
              style={{
                backgroundColor: activeTab === id ? P.success : "white",
                color:           activeTab === id ? "white"   : P.default,
                fontWeight: 600,
                border: `1px solid ${activeTab === id ? P.success : "rgba(0,0,0,0.06)"}`,
              }}>
              <Icon className="w-4 h-4" />
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Tab content ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>

          {/* ── Matches ── */}
          {activeTab === "matches" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg" style={{ fontWeight: 700, color: P.textPrimary }}>Todos los partidos</h2>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleCreateMatch}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm"
                  style={{ backgroundColor: P.success, fontWeight: 600 }}>
                  <Plus className="w-4 h-4" />
                  Crear Partido
                </motion.button>
              </div>

              {matches.map((match) => (
                <div key={match.id} className="bg-white rounded-2xl p-5 border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5" style={{ color: P.info }} />
                      <div>
                        <p className="text-sm" style={{ fontWeight: 600, color: P.textPrimary }}>
                          {new Date(match.date + "T12:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs flex items-center gap-1" style={{ color: P.default, fontWeight: 500 }}>
                            <Clock className="w-3.5 h-3.5" />{match.time}
                          </span>
                          <span className="text-xs flex items-center gap-1" style={{ color: P.default, fontWeight: 500 }}>
                            <MapPin className="w-3.5 h-3.5" />{match.court}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${matchStatusColor(match.status)}18`, color: matchStatusColor(match.status), fontWeight: 700 }}>
                      {matchStatusLabel(match.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-right">
                      <p className="text-base mb-1" style={{ fontWeight: 700, color: P.textPrimary }}>{match.teamA}</p>
                      {match.scoreA !== undefined && (
                        <p className="text-2xl" style={{ fontWeight: 800, color: P.primary }}>{match.scoreA}</p>
                      )}
                    </div>
                    <div className="px-4 py-2 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.04)" }}>
                      <p className="text-xs" style={{ color: P.default, fontWeight: 700 }}>VS</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-base mb-1" style={{ fontWeight: 700, color: P.textPrimary }}>{match.teamB}</p>
                      {match.scoreB !== undefined && (
                        <p className="text-2xl" style={{ fontWeight: 800, color: P.primary }}>{match.scoreB}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleEditMatch(match)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm border"
                      style={{ borderColor: "rgba(0,0,0,0.08)", color: P.default, fontWeight: 600 }}>
                      <Edit className="w-4 h-4" /> Editar
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewMatch(match)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white text-sm"
                      style={{ backgroundColor: P.info, fontWeight: 600 }}>
                      <Eye className="w-4 h-4" /> Ver Detalle
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Teams ── */}
          {activeTab === "teams" && (
            <div className="space-y-3">
              <h2 className="text-lg mb-4" style={{ fontWeight: 700, color: P.textPrimary }}>
                Equipos participantes ({activeTeams.length})
              </h2>
              {activeTeams.map((team) => (
                <div key={team.id} className="bg-white rounded-xl p-4 border flex items-center justify-between"
                  style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${P.success}18` }}>
                      <Users className="w-5 h-5" style={{ color: P.success }} />
                    </div>
                    <div>
                      <p className="text-sm mb-0.5" style={{ fontWeight: 700, color: P.textPrimary }}>{team.name}</p>
                      <p className="text-xs" style={{ color: P.default, fontWeight: 500 }}>{team.players} jugadores</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                      <Eye className="w-4 h-4" style={{ color: P.default }} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                      <Edit className="w-4 h-4" style={{ color: P.default }} />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Eliminated ── */}
          {activeTab === "eliminated" && (
            <div className="space-y-3">
              <h2 className="text-lg mb-4" style={{ fontWeight: 700, color: P.textPrimary }}>
                Equipos eliminados ({eliminatedTeams.length})
              </h2>
              {eliminatedTeams.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border text-center" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: P.success, opacity: 0.5 }} />
                  <p className="text-base mb-1" style={{ fontWeight: 600, color: P.textPrimary }}>No hay equipos eliminados</p>
                  <p className="text-sm" style={{ color: P.default }}>Todos los equipos siguen en competencia</p>
                </div>
              ) : (
                eliminatedTeams.map((team) => (
                  <div key={team.id} className="bg-white rounded-xl p-4 border flex items-center justify-between opacity-60"
                    style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${P.default}18` }}>
                        <X className="w-5 h-5" style={{ color: P.default }} />
                      </div>
                      <div>
                        <p className="text-sm mb-0.5" style={{ fontWeight: 700, color: P.textPrimary }}>{team.name}</p>
                        <p className="text-xs" style={{ color: P.default, fontWeight: 500 }}>
                          Eliminado el {team.eliminatedDate && new Date(team.eliminatedDate + "T12:00").toLocaleDateString("es-CO")}
                        </p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-lg text-xs border"
                      style={{ borderColor: "rgba(0,0,0,0.08)", color: P.default, fontWeight: 600 }}>
                      Ver Historial
                    </motion.button>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* 
          MODAL – Match Detail
      */}
      <AnimatePresence>
        {showMatchDetail && selectedMatch && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMatchDetail(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="fixed z-50 inset-0 flex items-center justify-center px-6 pointer-events-none">
              <div className="bg-white rounded-[24px] p-6 max-w-lg w-full pointer-events-auto max-h-[90vh] overflow-y-auto"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl" style={{ fontWeight: 700, color: P.textPrimary }}>Detalle del Partido</h2>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMatchDetail(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
                    <X className="w-5 h-5" style={{ color: P.default }} />
                  </motion.button>
                </div>

                <span className="text-xs px-3 py-1.5 rounded-full inline-block mb-4"
                  style={{ backgroundColor: `${matchStatusColor(selectedMatch.status)}18`, color: matchStatusColor(selectedMatch.status), fontWeight: 700 }}>
                  {matchStatusLabel(selectedMatch.status)}
                </span>

                <div className="space-y-3 mb-5">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" style={{ color: P.info }} />
                      <span className="text-xs" style={{ color: P.default, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fecha y Hora</span>
                    </div>
                    <p className="text-base" style={{ fontWeight: 600, color: P.textPrimary }}>
                      {new Date(selectedMatch.date + "T12:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-sm mt-1" style={{ color: P.default, fontWeight: 500 }}>
                      {selectedMatch.time} · {selectedMatch.court}
                    </p>
                  </div>
                </div>

                {/* Score panel */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 mb-5 border"
                  style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center justify-between gap-6">
                    {[
                      { team: selectedMatch.teamA, score: selectedMatch.scoreA },
                      { team: selectedMatch.teamB, score: selectedMatch.scoreB },
                    ].map((side, i) => (
                      <div key={i} className={`flex-1 ${i === 0 ? "text-right" : "text-left"}`}>
                        <p className="text-sm mb-2" style={{ color: P.default, fontWeight: 600 }}>Equipo {i === 0 ? "A" : "B"}</p>
                        <p className="text-lg mb-3" style={{ fontWeight: 700, color: P.textPrimary }}>{side.team}</p>
                        {side.score !== undefined && (
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${i === 0 ? "ml-auto" : ""}`}
                            style={{ backgroundColor: `${P.primary}18`, color: P.primary }}>
                            <span className="text-3xl" style={{ fontWeight: 800 }}>{side.score}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="px-4 py-2 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
                      <p className="text-sm" style={{ color: P.default, fontWeight: 700 }}>VS</p>
                    </div>
                  </div>
                </div>

                {/* Events */}
                {[
                  { label: "⚽ Goles",             bg: "#F7FAF8", color: P.success,    items: selectedMatch.scorers     },
                  { label: "🟨 Tarjetas Amarillas", bg: "#FFF9EE", color: P.secondary,  items: selectedMatch.yellowCards },
                  { label: "🟥 Tarjetas Rojas",     bg: "#FFF3F3", color: P.primary,    items: selectedMatch.redCards    },
                ].map(({ label, bg, color, items }) => (
                  <div key={label} className="rounded-xl p-4 mb-2" style={{ backgroundColor: bg }}>
                    <p style={{ fontSize: "0.72rem", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                    {items && items.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {items.map((ev, idx) => (
                          <p key={idx} style={{ fontSize: "0.82rem", color: P.textPrimary, fontWeight: 600 }}>
                            {ev.minute} · {ev.player} <span style={{ color: P.default, fontWeight: 500 }}>({ev.team})</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2" style={{ fontSize: "0.8rem", color: P.default }}>Sin registros.</p>
                    )}
                  </div>
                ))}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMatchDetail(false)}
                  className="w-full py-3 rounded-xl text-sm mt-3"
                  style={{ backgroundColor: P.info, color: "white", fontWeight: 600 }}>
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═
          MODAL – Edit Match
      */}
      <AnimatePresence>
        {showEditMatch && editForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditMatch(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="fixed z-50 inset-0 flex items-center justify-center px-6 pointer-events-none">
              <div className="bg-white rounded-[24px] p-6 max-w-xl w-full pointer-events-auto max-h-[90vh] overflow-y-auto"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl" style={{ fontWeight: 700, color: P.textPrimary }}>Editar Partido</h2>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEditMatch(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
                    <X className="w-5 h-5" style={{ color: P.default }} />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {/* Date / Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Fecha</label>
                      <input type="date" style={inputStyle} value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Hora</label>
                      <input type="time" style={inputStyle} value={editForm.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
                    </div>
                  </div>
                  {/* Court */}
                  <div>
                    <label style={labelStyle}>Cancha</label>
                    <select style={inputStyle} value={editForm.court}
                      onChange={(e) => setEditForm({ ...editForm, court: e.target.value })}>
                      <option>Cancha Principal</option>
                      <option>Cancha Secundaria</option>
                    </select>
                  </div>
                  {/* Status */}
                  <div>
                    <label style={labelStyle}>Estado</label>
                    <select style={inputStyle} value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Match["status"] })}>
                      <option value="pending">Pendiente</option>
                      <option value="in-progress">En Curso</option>
                      <option value="completed">Finalizado</option>
                    </select>
                  </div>
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Goles – {editForm.teamA}</label>
                      <input type="number" min={0} style={inputStyle}
                        value={editForm.scoreA ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, scoreA: e.target.value !== "" ? Number(e.target.value) : undefined })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Goles – {editForm.teamB}</label>
                      <input type="number" min={0} style={inputStyle}
                        value={editForm.scoreB ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, scoreB: e.target.value !== "" ? Number(e.target.value) : undefined })} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowEditMatch(false)}
                    className="flex-1 py-3 rounded-xl text-sm border"
                    style={{ borderColor: "rgba(0,0,0,0.1)", color: P.default, fontWeight: 600 }}>
                    Cancelar
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSaveMatch}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm"
                    style={{ backgroundColor: P.success, fontWeight: 600 }}>
                    <Save className="w-4 h-4" /> Guardar cambios
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═
          MODAL – Create Match
      */}
      <AnimatePresence>
        {showCreateMatch && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateMatch(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="fixed z-50 inset-0 flex items-center justify-center px-6 pointer-events-none">
              <div className="bg-white rounded-[24px] p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl" style={{ fontWeight: 700, color: P.textPrimary }}>Crear Nuevo Partido</h2>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateMatch(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
                    <X className="w-5 h-5" style={{ color: P.default }} />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {/* Team A */}
                  <div>
                    <label style={labelStyle}>Equipo A</label>
                    <select style={inputStyle} value={createForm.teamA || ""}
                      onChange={(e) => setCreateForm({ ...createForm, teamA: e.target.value })}>
                      <option value="">Seleccionar equipo…</option>
                      {activeTeams.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  {/* Team B */}
                  <div>
                    <label style={labelStyle}>Equipo B</label>
                    <select style={inputStyle} value={createForm.teamB || ""}
                      onChange={(e) => setCreateForm({ ...createForm, teamB: e.target.value })}>
                      <option value="">Seleccionar equipo…</option>
                      {activeTeams.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  {/* Date / Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Fecha</label>
                      <input type="date" style={inputStyle} value={createForm.date || ""}
                        onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Hora</label>
                      <input type="time" style={inputStyle} value={createForm.time || ""}
                        onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })} />
                    </div>
                  </div>
                  {/* Court */}
                  <div>
                    <label style={labelStyle}>Cancha</label>
                    <select style={inputStyle} value={createForm.court || ""}
                      onChange={(e) => setCreateForm({ ...createForm, court: e.target.value })}>
                      <option value="">Seleccionar cancha…</option>
                      <option>Cancha Principal</option>
                      <option>Cancha Secundaria</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateMatch(false)}
                    className="flex-1 py-3 rounded-xl text-sm border"
                    style={{ borderColor: "rgba(0,0,0,0.1)", color: P.default, fontWeight: 600 }}>
                    Cancelar
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSaveNewMatch}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm"
                    style={{ backgroundColor: P.success, fontWeight: 600 }}>
                    <Plus className="w-4 h-4" /> Crear Partido
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═
          MODAL – Logout confirm
      */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogout(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="fixed z-50 inset-0 flex items-center justify-center px-6 pointer-events-none">
              <div className="bg-white rounded-[24px] p-8 max-w-sm w-full pointer-events-auto text-center"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${P.primary}10` }}>
                  <LogOut style={{ width: 26, height: 26, color: P.primary }} />
                </div>
                <h2 className="text-xl mb-2" style={{ fontWeight: 700, color: P.textPrimary }}>¿Cerrar sesión?</h2>
                <p className="text-sm mb-6" style={{ color: P.default }}>
                  Tu sesión en TECHCUP se cerrará. Podrás volver a ingresar cuando quieras.
                </p>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogout(false)}
                    className="flex-1 py-3 rounded-xl text-sm border"
                    style={{ borderColor: "rgba(0,0,0,0.1)", color: P.default, fontWeight: 600 }}>
                    Cancelar
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl text-white text-sm"
                    style={{ backgroundColor: P.primary, fontWeight: 600 }}>
                    Cerrar sesión
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
