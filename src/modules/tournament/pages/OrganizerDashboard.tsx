/**
 * @file src/modules/tournament/pages/OrganizerDashboard.tsx
 */
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import logoTechcup from "@/assets/logo.png";
import {
  User,
  Swords,
  Trophy,
  FolderKanban,
  LogOut,
  CreditCard,
  PlusCircle,
  ChevronRight,
  Users,
  CalendarDays,
  Clock,
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
  purple: "#8B5CF6",
  orange: "#F97316",
};

// ── Tipos ─────────────────────────────────────────
interface TorneoVigente {
  nombre: string;
  estado: "Borrador" | "Activo" | "En Progreso" | "Finalizado";
  fechaInicio: string;
  fechaCierreInscripciones: string;
  costo: number;
  equiposInscritos: number;
  partidosJugados: number;
  pagosEnRevision: number;
  partidosHoy: number;
}

// ── Nav buttons ───────────────────────────────────
const navButtons = [
  {
    label: "Crear Torneo",
    icon: PlusCircle,
    path: "/organizer/create-tournament",
    color: "#17C964",
    iconBg: "rgba(23,201,100,0.10)",
    iconGlow: "rgba(23,201,100,0.18)",
    description: "Configura y crea nuevos torneos",
  },
  {
    label: "Gestión de Torneos",
    icon: FolderKanban,
    path: "/organizer/tournaments",
    color: "#0066FE",
    iconBg: "rgba(0,102,254,0.10)",
    iconGlow: "rgba(0,102,254,0.18)",
    description: "Administra torneos, partidos y equipos",
  },
  {
    label: "Información de Pagos",
    icon: CreditCard,
    path: "/organizer/payment-report",
    color: "#8B5CF6",
    iconBg: "rgba(139,92,246,0.10)",
    iconGlow: "rgba(139,92,246,0.18)",
    description: "Reportes y estado de pagos de equipos",
  },
  {
    label: "Gestión de Árbitros",
    icon: Users,
    path: "/organizer/referees",
    color: "#B81C1C",
    iconBg: "rgba(184,28,28,0.10)",
    iconGlow: "rgba(184,28,28,0.18)",
    description: "Crea y gestiona árbitros del torneo",
  },
  {
    label: "Partidos de Hoy",
    icon: Swords,
    path: "/matches",
    color: "#C4841D",
    iconBg: "rgba(196,132,29,0.10)",
    iconGlow: "rgba(196,132,29,0.20)",
    description: "Supervisa partidos en curso del día",
  },
  {
    label: "Tabla de Posiciones",
    icon: Trophy,
    path: "/scores",
    color: "#F97316",
    iconBg: "rgba(249,115,22,0.10)",
    iconGlow: "rgba(249,115,22,0.18)",
    description: "Clasificación actualizada de equipos",
  },
];

// ── Estado tag ────────────────────────────────────
const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  Borrador:    { label: "Borrador",    color: "#6E6E73", bg: "rgba(110,110,115,0.10)" },
  Activo:      { label: "Activo",      color: "#0066FE", bg: "rgba(0,102,254,0.10)"   },
  "En Progreso":{ label: "En Progreso", color: "#17C964", bg: "rgba(23,201,100,0.10)" },
  Finalizado:  { label: "Finalizado",  color: "#C4841D", bg: "rgba(196,132,29,0.10)" },
};

// ── Torneo Vigente Card ────────────────────────────
function TorneoVigenteCard({ torneo }: { torneo: TorneoVigente | null }) {
  if (!torneo) {
    return (
      <div
        className="rounded-[20px] p-6 mb-8 bg-white flex flex-col items-center justify-center py-10"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)" }}
      >
        <Trophy className="w-10 h-10 mb-3" style={{ color: P.default }} />
        <p className="text-sm font-semibold" style={{ color: P.default }}>
          No hay torneo activo actualmente.
        </p>
        <p className="text-xs mt-1" style={{ color: P.default }}>
          Crea un nuevo torneo para comenzar.
        </p>
      </div>
    );
  }

  const cfg = estadoConfig[torneo.estado] ?? estadoConfig["Borrador"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.5 }}
      className="rounded-[20px] p-6 mb-8 bg-white"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)" }}
    >
      <h3
        className="text-xs mb-4"
        style={{ fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: P.default }}
      >
        ⚽ Torneo Vigente
      </h3>

      {/* Nombre + estado */}
      <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
        <div>
          <p className="text-lg font-extrabold" style={{ color: P.textPrimary, letterSpacing: "-0.02em" }}>
            {torneo.nombre}
          </p>
          <p className="text-xs mt-0.5" style={{ color: P.default }}>
            Torneo semestral de fútbol · ECI
          </p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          ● {cfg.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { value: torneo.equiposInscritos, label: "Equipos inscritos",  color: P.textPrimary },
          { value: torneo.partidosJugados,  label: "Partidos jugados",   color: P.textPrimary },
          { value: torneo.pagosEnRevision,  label: "Pagos en revisión",  color: P.purple },
          { value: torneo.partidosHoy,      label: "Partidos hoy",       color: P.primary },
        ].map((s) => (
          <div key={s.label} className="rounded-[14px] p-3" style={{ backgroundColor: P.bg }}>
            <p className="text-2xl font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[0.68rem] font-semibold mt-0.5" style={{ color: P.default }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Fecha + costo */}
      <div
        className="flex flex-wrap gap-2 mt-4 pt-4"
        style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
      >
        {[
          { icon: CalendarDays, text: `Inicio: ${torneo.fechaInicio}` },
          { icon: Clock,        text: `Cierre inscr.: ${torneo.fechaCierreInscripciones}` },
          { icon: CreditCard,   text: `Costo: $${torneo.costo.toLocaleString("es-CO")} COP` },
        ].map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.04)", color: P.default }}
          >
            <Icon style={{ width: 11, height: 11 }} />
            {text}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ── OrganizerDashboard ────────────────────────────
export function OrganizerDashboard() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [torneoVigente, setTorneoVigente] = useState<TorneoVigente | null>(null);

  // TODO: reemplazar por llamada real al API
  useEffect(() => {
    // Simulación — conectar al endpoint GET /api/tournaments/active
    setTorneoVigente({
      nombre: "TECHCUP Fútbol 2026-I",
      estado: "En Progreso",
      fechaInicio: "15 Ene 2026",
      fechaCierreInscripciones: "10 Ene 2026",
      costo: 35000,
      equiposInscritos: 8,
      partidosJugados: 12,
      pagosEnRevision: 3,
      partidosHoy: 2,
    });
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

          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: `${P.success}12`, border: `1px solid ${P.success}30` }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: P.success }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: P.success, textTransform: "uppercase" }}>
              Organizador
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
              onClick={() => setShowLogout(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(184,28,28,0.07)]"
            >
              <LogOut style={{ width: 17, height: 17, color: P.default }} />
            </motion.button>
            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{ background: `${P.success}18`, border: `1.5px solid ${P.success}30` }}
              >
                <User style={{ width: 16, height: 16, color: P.success }} />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Logout Modal ── */}
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
              <div className="bg-white rounded-[24px] p-8 max-w-sm w-full pointer-events-auto"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                  style={{ backgroundColor: `${P.primary}10` }}>
                  <LogOut className="w-7 h-7" style={{ color: P.primary }} />
                </div>
                <h2 className="text-xl text-black text-center mb-2" style={{ fontWeight: 700 }}>
                  ¿Cerrar sesión?
                </h2>
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
            background: "linear-gradient(160deg, #0D5F2C 0%, #12A150 45%, #17C964 100%)",
            boxShadow: "0 8px 32px rgba(23,201,100,0.25)",
          }}
        >
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="absolute bottom-0 left-0 right-0 h-16"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(13,95,44,0.4))" }} />
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-[0.15]"
            style={{ background: "#17C964", transform: "translate(40%,-40%)" }} />
          <div className="relative z-10 px-8 pt-10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
              style={{ background: "rgba(23,201,100,0.25)", border: "1px solid rgba(23,201,100,0.5)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#5EFFA3" }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", color: "#5EFFA3", textTransform: "uppercase" }}>
                Panel del Organizador · TECHCUP 2026
              </span>
            </div>
            <h1 className="text-white mb-2"
              style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
              Gestión del Torneo
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400, fontSize: "0.92rem", lineHeight: 1.6, maxWidth: "42ch" }}>
              Organiza equipos, partidos, pagos y configuraciones del torneo TECHCUP.
            </p>
          </div>
        </motion.div>

        {/* ── Torneo Vigente ── */}
        <TorneoVigenteCard torneo={torneoVigente} />

        {/* ── Navigation cards ── */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18, duration: 0.5 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm" style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: P.default }}>
              Panel del Organizador
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {navButtons.map((btn, idx) => (
              <Link key={btn.path} to={btn.path}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 + idx * 0.06, duration: 0.45 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-white rounded-[20px] p-6 cursor-pointer"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 12px 32px ${btn.color}15, 0 0 0 1px ${btn.color}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)";
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: btn.iconGlow, transform: "translate(40%,-40%)" }} />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: btn.iconBg }}>
                      <btn.icon style={{ width: 22, height: 22, color: btn.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base" style={{ fontWeight: 700, color: P.textPrimary }}>{btn.label}</h3>
                        <ChevronRight
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                          style={{ width: 18, height: 18, color: btn.color, flexShrink: 0 }}
                        />
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: P.default, fontWeight: 500 }}>
                        {btn.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

      </main>
    </div>
  );
}