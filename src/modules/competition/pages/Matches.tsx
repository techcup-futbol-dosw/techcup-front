/**
 * @file src\modules\competition\pages\Matches.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { ArrowLeft, Clock, Swords, MapPin, ChevronDown } from "lucide-react";
import { readUICache } from "@/core/utils/uiCache";

const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  success: "#17C964",
  info: "#0066FE",
  default: "#6E6E73",
  textPrimary: "#1C1C1E",
  bg: "#F2F2F7",
};

interface MatchStats {
  yellowCards: [number, number];
  redCards: [number, number];
  corners: [number, number];
  fouls: [number, number];
}
interface Match {
  id: number;
  team1: string;
  team2: string;
  time: string;
  venue: string;
  status: string;
  statusColor: string;
  score1: number | null;
  score2: number | null;
  stats: MatchStats | null;
}

const matches = readUICache<Match[]>("techcup.ui.matches", []);

function StatRow({ label, val1, val2, statColor }: { label: string; val1: number; val2: number; statColor: string }) {
  const total = val1 + val2 || 1;
  const pct1 = Math.round((val1 / total) * 100);
  const pct2 = 100 - pct1;
  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-center text-xs" style={{ color: P.default, fontWeight: 600 }}>{label}</p>
      )}
      <div className="flex items-center gap-3">
        <span className="w-8 text-right tabular-nums text-sm" style={{ fontWeight: 700, color: P.primary }}>{val1}</span>
        <div className="flex-1 flex h-1.5 rounded-full overflow-hidden gap-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct1}%` }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="rounded-l-full"
            style={{ backgroundColor: P.primary }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct2}%` }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="rounded-r-full opacity-40"
            style={{ backgroundColor: statColor }}
          />
        </div>
        <span className="w-8 text-left tabular-nums text-sm" style={{ fontWeight: 700, color: P.info }}>{val2}</span>
      </div>
      <div className="flex justify-between px-11 text-[10px]" style={{ color: P.default }}>
        <span>{pct1}%</span><span>{pct2}%</span>
      </div>
    </div>
  );
}

const YellowCardIcon = () => <svg width="11" height="14" viewBox="0 0 12 16"><rect width="12" height="16" rx="2" fill={P.secondary} /></svg>;
const RedCardIcon = () => <svg width="11" height="14" viewBox="0 0 12 16"><rect width="12" height="16" rx="2" fill={P.primary} /></svg>;
const CornerIcon = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={P.success} strokeWidth="2" strokeLinecap="round"><path d="M2 2 L12 2 L12 12" /><path d="M2 2 Q12 2 12 12" strokeDasharray="2 2" /></svg>;
const FoulIcon = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={P.info} strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="3.5" r="2" /><path d="M3.5 13 C3.5 9.5 10.5 9.5 10.5 13" /><line x1="7" y1="5.5" x2="6" y2="9" /><line x1="6" y1="9" x2="8" y2="11" /></svg>;

function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", color, textTransform: "uppercase" }}>
        {text}
      </span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
    </div>
  );
}

function MatchCard({ match, index }: { match: Match; index: number }) {
  const [open, setOpen] = useState(false);
  const hasStats = match.stats !== null;
  const ac = match.statusColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-[20px] overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      {/* Status top stripe */}
      <div className="h-[3px] w-full" style={{ backgroundColor: ac }} />

      {/* Main row */}
      <div
        className={`px-5 py-5 sm:px-6 ${hasStats ? "cursor-pointer select-none" : ""}`}
        onClick={() => hasStats && setOpen((v) => !v)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Time + venue */}
          <div className="sm:w-28 flex-shrink-0">
            <p style={{ fontSize: "1.35rem", fontWeight: 800, color: P.primary, letterSpacing: "-0.02em" }}>
              {match.time}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin style={{ width: 11, height: 11, color: P.default }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 500, color: P.default }}>{match.venue}</span>
            </div>
          </div>

          {/* Teams + score */}
          <div className="flex-1 flex items-center justify-between gap-3">
            <span className="text-base flex-1 text-right" style={{ fontWeight: 700, color: P.textPrimary }}>
              {match.team1}
            </span>

            {match.score1 !== null ? (
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-2xl flex-shrink-0"
                style={{ backgroundColor: `${ac}10`, border: `1.5px solid ${ac}28` }}
              >
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: P.primary }}>{match.score1}</span>
                <span style={{ fontWeight: 500, color: P.default, fontSize: "0.9rem" }}>—</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: P.info }}>{match.score2}</span>
              </div>
            ) : (
              <div
                className="px-5 py-2 rounded-2xl flex-shrink-0"
                style={{ backgroundColor: P.bg }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: P.default }}>VS</span>
              </div>
            )}

            <span className="text-base flex-1" style={{ fontWeight: 700, color: P.textPrimary }}>
              {match.team2}
            </span>
          </div>

          {/* Status + chevron */}
          <div className="sm:w-32 flex-shrink-0 flex sm:justify-end items-center gap-2">
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{ fontWeight: 700, color: ac, backgroundColor: `${ac}14`, letterSpacing: "0.02em" }}
            >
              {match.status}
            </span>
            {hasStats && (
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: P.bg }}
              >
                <ChevronDown style={{ width: 15, height: 15, color: P.default }} />
              </motion.div>
            )}
          </div>
        </div>

        {hasStats && !open && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 text-center"
            style={{ fontSize: "0.75rem", color: P.default, fontWeight: 500 }}
          >
            Toca para ver estadísticas ↓
          </motion.p>
        )}
      </div>

      {/* Stats Panel */}
      <AnimatePresence initial={false}>
        {open && match.stats && (
          <motion.div
            key="stats"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
              {/* Panel header */}
              <div className="px-5 sm:px-6 py-4 flex items-center justify-between" style={{ backgroundColor: P.bg }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", color: P.default, textTransform: "uppercase" }}>
                  Estadísticas del Partido
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${P.primary}12`, color: P.primary, fontWeight: 700 }}>
                    {match.team1}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${P.info}12`, color: P.info, fontWeight: 700 }}>
                    {match.team2}
                  </span>
                </div>
              </div>

              {/* Stat grid */}
              <div className="px-5 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
                {[
                  { icon: <YellowCardIcon />, label: "Tarjetas Amarillas", color: P.secondary, vals: match.stats.yellowCards },
                  { icon: <RedCardIcon />, label: "Tarjetas Rojas", color: P.primary, vals: match.stats.redCards },
                  { icon: <CornerIcon />, label: "Tiros de Esquina", color: P.success, vals: match.stats.corners },
                  { icon: <FoulIcon />, label: "Faltas", color: P.info, vals: match.stats.fouls },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl p-4"
                    style={{ backgroundColor: `${s.color}08`, border: `1px solid ${s.color}20` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {s.icon}
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {s.label}
                      </span>
                    </div>
                    <StatRow label="" val1={s.vals[0]} val2={s.vals[1]} statColor={s.color} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Matches() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const sorted = [...matches].sort((a, b) => a.time.localeCompare(b.time));
  const live = matches.filter((m) => m.status === "En curso").length;
  const upcoming = matches.filter((m) => m.status === "Próximo").length;
  const finished = matches.filter((m) => m.status === "Finalizado").length;

  const pills = [
    { label: "En curso", count: live, color: P.success },
    { label: "Próximos", count: upcoming, color: P.info },
    { label: "Finalizados", count: finished, color: P.default },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-0" style={{ backgroundColor: P.bg }}>

      {/* ── Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b px-6"
        style={{
          background: "rgba(242,242,247,0.85)",
          borderColor: "rgba(0,0,0,0.06)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3 h-[60px]">
          <motion.div
            whileHover={{ scale: 1.05, x: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <ArrowLeft style={{ width: 16, height: 16, color: P.default }} />
          </motion.div>
          <span className="flex-1" style={{ fontWeight: 800, color: P.primary, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
            TECHCUP
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${P.primary}12` }}>
            <Swords style={{ width: 14, height: 14, color: P.primary }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: P.primary }}>Partidos</span>
          </div>
        </div>
      </motion.header>

      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-10 pb-16">

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.45, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.2rem)", fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.03em", lineHeight: 1.12 }}>
            Partidos para Hoy
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Clock style={{ width: 14, height: 14, color: P.default }} />
            <span className="capitalize" style={{ fontSize: "0.88rem", fontWeight: 500, color: P.default }}>{today}</span>
          </div>
        </motion.div>

        {/* ── Summary pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          className="flex flex-wrap gap-2.5 mb-8"
        >
          {pills.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: P.textPrimary }}>
                {s.count} {s.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── Section label ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <SectionLabel text="Todos los Partidos" color={P.primary} />
        </motion.div>

        {/* ── Match cards ── */}
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="bg-white rounded-[20px] p-8 text-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Swords className="w-10 h-10 mx-auto mb-3" style={{ color: P.default, opacity: 0.35 }} />
              <p style={{ fontWeight: 700, color: P.textPrimary }}>No hay partidos programados</p>
              <p className="mt-1" style={{ fontSize: "0.82rem", color: P.default, fontWeight: 500 }}>
                Cuando el backend entregue información, los partidos aparecerán aquí.
              </p>
            </div>
          ) : (
            sorted.map((match, index) => <MatchCard key={match.id} match={match} index={index} />)
          )}
        </div>

      </main>
    </div>
  );
}



