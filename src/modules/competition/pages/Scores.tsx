/**
 * @file src\modules\competition\pages\Scores.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

const rankings = readUICache<Array<{ pos: number; team: string; pts: number; pg: number; pe: number; pp: number; gf: number; gc: number; trend: string }>>(
  "techcup.ui.scores",
  []
);

const posConfig: Record<number, { bg: string; text: string; label: string; border: string }> = {
  1: { bg: "#C4841D10", text: "#C4841D", label: "Oro", border: "#C4841D28" },
  2: { bg: "#8A8A8E10", text: "#8A8A8E", label: "Plata", border: "#8A8A8E28" },
  3: { bg: "#CD7F3210", text: "#CD7F32", label: "Bronce", border: "#CD7F3228" },
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp style={{ width: 14, height: 14, color: P.success }} />;
  if (trend === "down") return <TrendingDown style={{ width: 14, height: 14, color: P.primary }} />;
  return <Minus style={{ width: 14, height: 14, color: P.default }} />;
}

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

export function Scores() {
  const navigate = useNavigate();
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${P.success}12` }}>
            <Trophy style={{ width: 14, height: 14, color: P.success }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: P.success }}>Posiciones</span>
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
            Tabla de Posiciones
          </h1>
          <p className="mt-2" style={{ fontSize: "0.88rem", fontWeight: 500, color: P.default }}>
            Clasificación actualizada al 5 de marzo de 2026
          </p>
        </motion.div>

        {/* ── Podio Top 3 ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
        >
          <SectionLabel text="Podio" color={P.secondary} />
        </motion.div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {rankings.length === 0 ? (
            <div className="col-span-3 bg-white rounded-[20px] p-8 text-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: P.default, opacity: 0.35 }} />
              <p style={{ fontWeight: 700, color: P.textPrimary }}>Sin posiciones registradas</p>
              <p className="mt-1" style={{ fontSize: "0.82rem", color: P.default, fontWeight: 500 }}>
                Cuando el backend publique la tabla, aparecerá aquí.
              </p>
            </div>
          ) : (
            rankings.slice(0, 3).map((team) => {
              const cfg = posConfig[team.pos];
              return (
                <motion.div
                  key={team.pos}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + team.pos * 0.07, duration: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
                  className="flex flex-col items-center text-center p-4 sm:p-5 rounded-[20px] bg-white transition-all duration-300"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1.5px solid ${cfg.border}` }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Trophy style={{ width: 20, height: 20, color: cfg.text }} />
                  </div>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, color: cfg.text, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    {cfg.label}
                  </p>
                  <p className="mt-1" style={{ fontSize: "0.82rem", fontWeight: 700, color: P.textPrimary }}>{team.team}</p>
                  <p className="mt-1.5" style={{ fontSize: "1.5rem", fontWeight: 800, color: cfg.text, letterSpacing: "-0.02em" }}>
                    {team.pts}
                    <span style={{ fontSize: "0.72rem", fontWeight: 500, color: P.default, marginLeft: 3 }}>pts</span>
                  </p>
                </motion.div>
              );
            })
          )}
        </div>

        {/* ── Full table ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.4 }}
        >
          <SectionLabel text="Clasificación General" color={P.primary} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.40, duration: 0.4 }}
          className="bg-white rounded-[20px] overflow-hidden"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {/* Table header */}
          <div
            className="grid items-center px-5 sm:px-6 py-3"
            style={{
              gridTemplateColumns: "36px 1fr 52px 44px 44px 44px 44px 44px 36px",
              backgroundColor: P.bg,
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {["#", "Equipo", "PTS", "PG", "PE", "PP", "GF", "GC", ""].map((h) => (
              <span key={h} className="text-center" style={{ fontSize: "0.68rem", fontWeight: 700, color: P.default, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {rankings.length === 0 ? (
            <div className="py-12 text-center">
              <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: P.default, opacity: 0.35 }} />
              <p style={{ color: P.textPrimary, fontWeight: 700 }}>No hay posiciones publicadas</p>
              <p className="mt-1" style={{ color: P.default, fontWeight: 500, fontSize: "0.82rem" }}>
                Los datos de clasificación se mostrarán cuando el backend esté conectado.
              </p>
            </div>
          ) : rankings.map((row, index) => {
            const cfg = posConfig[row.pos];
            return (
              <motion.div
                key={row.pos}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.44 + index * 0.05, duration: 0.35 }}
                whileHover={{ backgroundColor: P.bg }}
                className="grid items-center px-5 sm:px-6 py-4 transition-colors duration-200 cursor-pointer"
                style={{
                  gridTemplateColumns: "36px 1fr 52px 44px 44px 44px 44px 44px 36px",
                  borderBottom: index < rankings.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                }}
              >
                <div className="flex justify-center">
                  {cfg ? (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: cfg.text }}>{row.pos}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: P.default, textAlign: "center" }}>{row.pos}</span>
                  )}
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: P.textPrimary }}>{row.team}</span>
                <span className="text-center" style={{ fontSize: "0.88rem", fontWeight: 800, color: P.primary }}>{row.pts}</span>
                <span className="text-center" style={{ fontSize: "0.82rem", fontWeight: 500, color: P.default }}>{row.pg}</span>
                <span className="text-center" style={{ fontSize: "0.82rem", fontWeight: 500, color: P.default }}>{row.pe}</span>
                <span className="text-center" style={{ fontSize: "0.82rem", fontWeight: 500, color: P.default }}>{row.pp}</span>
                <span className="text-center" style={{ fontSize: "0.82rem", fontWeight: 500, color: P.default }}>{row.gf}</span>
                <span className="text-center" style={{ fontSize: "0.82rem", fontWeight: 500, color: P.default }}>{row.gc}</span>
                <div className="flex justify-center">
                  <TrendIcon trend={row.trend} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="text-center mt-4" style={{ fontSize: "0.72rem", color: P.default, fontWeight: 500 }}>
          PTS: Puntos · PG: Ganados · PE: Empatados · PP: Perdidos · GF: Goles a favor · GC: Goles en contra
        </p>

      </main>
    </div>
  );
}



