/**
 * @file src\modules\teams\pages\ArbitroDashboard.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import logoTechcup from "@/assets/logo.png";
import { assignedMatches } from "../data/matchesData";
import {
  User,
  Swords,
  CalendarDays,
  Trophy,
  Info,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";

// ── Palette ───────────────────────────────────────
const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  success: "#17C964",
  info: "#0066FE",
  default: "#6E6E73",
  textPrimary: "#1C1C1E",
  bg: "#F2F2F7",
};

const ARBITRO_ACCENT = "#8137E9";

// ── Nav buttons ───────────────────────────────────
const navButtons = [
  {
    label: "Partidos para Hoy",
    icon: Swords,
    path: "/matches",
    color: "#B81C1C",
    iconBg: "rgba(184,28,28,0.10)",
    iconGlow: "rgba(184,28,28,0.18)",
    hoverAccent: "rgba(184,28,28,0.05)",
    description: "Consulta todos los partidos del día",
  },
  {
    label: "Calendario",
    icon: CalendarDays,
    path: "/schedule",
    color: "#C4841D",
    iconBg: "rgba(196,132,29,0.10)",
    iconGlow: "rgba(196,132,29,0.20)",
    hoverAccent: "rgba(196,132,29,0.05)",
    description: "Fechas próximas y calendario del torneo",
  },
  {
    label: "Tabla de Posiciones",
    icon: Trophy,
    path: "/scores",
    color: "#17C964",
    iconBg: "rgba(23,201,100,0.10)",
    iconGlow: "rgba(23,201,100,0.20)",
    hoverAccent: "rgba(23,201,100,0.05)",
    description: "Puntuación actualizada en tiempo real",
  },
  {
    label: "Info del Torneo",
    icon: Info,
    path: "/tournament",
    color: "#0066FE",
    iconBg: "rgba(0,102,254,0.10)",
    iconGlow: "rgba(0,102,254,0.18)",
    hoverAccent: "rgba(0,102,254,0.05)",
    description: "Reglas, premios y datos del torneo",
  },
];

// ── Status config ─────────────────────────────────
type MatchStatus = "pendiente" | "en-curso" | "finalizado";

const statusConfig: Record<MatchStatus, { label: string; color: string; glassColor: string; icon: React.ReactNode }> = {
  "en-curso": {
    label: "En Curso",
    color: P.success,
    glassColor: "rgba(23,201,100,0.28)",
    icon: <Circle className="w-2.5 h-2.5 fill-current" />,
  },
  pendiente: {
    label: "Pendiente",
    color: "#FFD27A",
    glassColor: "rgba(196,132,29,0.28)",
    icon: <Clock className="w-2.5 h-2.5" />,
  },
  finalizado: {
    label: "Finalizado",
    color: "rgba(255,255,255,0.5)",
    glassColor: "rgba(255,255,255,0.12)",
    icon: <CheckCircle2 className="w-2.5 h-2.5" />,
  },
};

// ── ArbitroDashboard ──────────────────────────────
export function ArbitroDashboard() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const todayMatches = assignedMatches.filter((m) => m.date === "Hoy");

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener("scroll", updateScroll);
    return () => el.removeEventListener("scroll", updateScroll);
  }, []);

  const handleLogout = () => {
    setShowLogout(false);
    sessionStorage.removeItem("userContext");
    navigate("/login");
  };

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

          {/* Role badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(129,55,233,0.14)", border: "1px solid rgba(129,55,233,0.45)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ARBITRO_ACCENT }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: ARBITRO_ACCENT, textTransform: "uppercase" }}>
              Árbitro
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowLogout(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(184,28,28,0.07)]"
            >
              <LogOut style={{ width: 17, height: 17, color: P.default }} />
            </motion.button>

            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{ background: "rgba(129,55,233,0.16)", border: "1.5px solid rgba(129,55,233,0.45)" }}
              >
                <User style={{ width: 16, height: 16, color: ARBITRO_ACCENT }} />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Logout modal ── */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogout(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="fixed z-50 inset-0 flex items-center justify-center px-6 pointer-events-none"
            >
              <div className="bg-white rounded-[24px] p-8 max-w-sm w-full pointer-events-auto" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: `${P.primary}10` }}>
                  <LogOut className="w-7 h-7" style={{ color: P.primary }} />
                </div>
                <h2 className="text-xl text-black text-center mb-2" style={{ fontWeight: 700 }}>¿Cerrar sesión?</h2>
                <p className="text-sm text-center mb-8" style={{ color: P.default, fontWeight: 500 }}>
                  Tu sesión en TECHCUP se cerrará. Podrás volver a ingresar cuando quieras.
                </p>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowLogout(false)}
                    className="flex-1 py-3 rounded-xl border border-black/8 text-sm"
                    style={{ fontWeight: 600, color: "#6C757D" }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl text-white text-sm"
                    style={{ backgroundColor: P.primary, fontWeight: 600 }}
                  >
                    Cerrar sesión
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-10 pb-16">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.55, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] mb-8"
          style={{
            background: "linear-gradient(160deg, #4A158F 0%, #6424B8 45%, #8137E9 100%)",
            boxShadow: "0 8px 32px rgba(129,55,233,0.30)",
          }}
        >
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: "linear-gradient(to bottom, transparent, rgba(74,21,143,0.35))" }} />
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-[0.18]" style={{ background: ARBITRO_ACCENT, transform: "translate(40%,-40%)" }} />

          <div className="relative z-10 px-8 pt-8 sm:pt-10 pb-6">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5" style={{ background: "rgba(129,55,233,0.25)", border: "1px solid rgba(129,55,233,0.55)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A6FF" }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", color: "#C9A6FF", textTransform: "uppercase" }}>
                Panel de Árbitro · TECHCUP 2026
              </span>
            </div>

            <h1 className="text-white mb-1" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.03em" }}>
              Mis partidos asignados
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400, fontSize: "0.88rem", lineHeight: 1.6, maxWidth: "36ch", marginBottom: "1.25rem" }}>
              Toca un partido para gestionarlo en tiempo real.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              {[
                { label: "Asignados", value: assignedMatches.length, color: "rgba(255,255,255,0.12)" },
                { label: "Hoy", value: todayMatches.length, color: `${P.success}30`, textColor: "#5EFFA3" },
                { label: "Pendientes", value: assignedMatches.filter((m) => m.status === "pendiente").length, color: `${P.secondary}30`, textColor: "#FFD27A" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: stat.color }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: (stat as any).textColor ?? "rgba(255,255,255,0.9)" }}>
                    {stat.value}
                  </span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: (stat as any).textColor ? (stat as any).textColor + "AA" : "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="mb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }} />

            {/* Carousel header */}
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                Partidos de hoy · toca para gestionar
              </span>
              {todayMatches.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    onClick={() => scrollBy("left")}
                    disabled={!canScrollLeft}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ backgroundColor: canScrollLeft ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)", opacity: canScrollLeft ? 1 : 0.4 }}
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    onClick={() => scrollBy("right")}
                    disabled={!canScrollRight}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ backgroundColor: canScrollRight ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)", opacity: canScrollRight ? 1 : 0.4 }}
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              )}
            </div>

            {/* Carousel */}
            {todayMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 rounded-2xl gap-2" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <AlertCircle className="w-6 h-6" style={{ color: "rgba(255,255,255,0.4)" }} />
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  No tienes partidos asignados para hoy
                </p>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {todayMatches.map((match, i) => {
                  const cfg = statusConfig[match.status as MatchStatus];
                  return (
                    <motion.button
                      key={match.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                      whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.16)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/dashboard-arbitro/partido/${match.id}`)}
                      className="flex-shrink-0 rounded-[16px] p-4 flex flex-col gap-3 text-left cursor-pointer transition-colors duration-200"
                      style={{
                        width: 230,
                        backgroundColor: "rgba(255,255,255,0.10)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      {/* Status + time */}
                      <div className="flex items-center justify-between">
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                          style={{ backgroundColor: cfg.glassColor, color: cfg.color, fontWeight: 700 }}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                          {match.time}
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="flex flex-col gap-1.5">
                        <p className="text-white text-sm leading-snug" style={{ fontWeight: 700 }}>{match.teamA}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
                          <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>VS</span>
                          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
                        </div>
                        <p className="text-white text-sm leading-snug" style={{ fontWeight: 700 }}>{match.teamB}</p>
                      </div>

                      {/* Meta + arrow */}
                      <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
                          <span style={{ fontSize: "0.71rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{match.location}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.35)" }} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Section label: Explora ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: P.secondary }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", color: P.secondary, textTransform: "uppercase" }}>
            Explora el Torneo
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(196,132,29,0.25), transparent)" }} />
        </motion.div>

        {/* ── 4 Nav Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {navButtons.map((btn, index) => {
            const Icon = btn.icon;
            return (
              <Link key={btn.path} to={btn.path} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42 + index * 0.07, duration: 0.45, ease: "easeOut" }}
                  whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
                  whileTap={{ scale: 0.985 }}
                  className="group relative flex items-center gap-4 px-5 py-5 rounded-[20px] cursor-pointer bg-white overflow-hidden transition-all duration-300 h-full"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: btn.hoverAccent }} />
                  <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ backgroundColor: btn.color }} />
                  <div
                    className="relative z-10 flex items-center justify-center flex-shrink-0 rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: btn.iconBg, width: "3.25rem", height: "3.25rem", boxShadow: `0 4px 14px ${btn.iconGlow}` }}
                  >
                    <Icon style={{ width: 22, height: 22, color: btn.color }} />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <p className="leading-snug" style={{ fontWeight: 700, color: P.textPrimary, fontSize: "0.9rem" }}>{btn.label}</p>
                    <p className="mt-1" style={{ fontSize: "0.79rem", color: P.default, fontWeight: 400, lineHeight: 1.45 }}>{btn.description}</p>
                  </div>
                  <div className="relative z-10 flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: btn.iconBg }}>
                    <ChevronRight className="transition-transform duration-300 group-hover:translate-x-0.5" style={{ width: 15, height: 15, color: btn.color }} />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

      </main>
    </div>
  );
}



