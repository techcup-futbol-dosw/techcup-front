/**
 * @file src/modules/tournament/pages/Tournament.tsx
 */
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Info, Trophy, Users, Calendar,
  MapPin, FileText, ChevronDown, Download, Eye,
  DollarSign, CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";

const P = {
  primary:     "#B81C1C",
  secondary:   "#C4841D",
  success:     "#17C964",
  info:        "#0066FE",
  default:     "#6E6E73",
  textPrimary: "#1C1C1E",
  bg:          "#F2F2F7",
};

// ── Tipos ─────────────────────────────────────────
type TorneoEstado = "Borrador" | "Activo" | "En Progreso" | "Finalizado";

interface Cancha {
  id: number;
  nombre: string;
  descripcion: string;
}

interface TorneoInfo {
  nombre: string;
  estado: TorneoEstado;
  fechaInicio: string;
  fechaFin: string;
  fechaCierreInscripciones: string;
  cantidadEquipos: number;
  costo: number;
  reglamentoUrl: string | null;
  canchas: Cancha[];
}

// ── Estado color map ──────────────────────────────
const estadoStyle: Record<TorneoEstado, { bg: string; border: string; text: string; iconColor: string }> = {
  Borrador:      { bg: "rgba(110,110,115,0.08)", border: "rgba(110,110,115,0.22)", text: P.default,    iconColor: P.default  },
  Activo:        { bg: "rgba(0,102,254,0.08)",   border: "rgba(0,102,254,0.22)",   text: P.info,       iconColor: P.info     },
  "En Progreso": { bg: "rgba(23,201,100,0.08)",  border: "rgba(23,201,100,0.22)",  text: P.success,    iconColor: P.success  },
  Finalizado:    { bg: "rgba(196,132,29,0.08)",  border: "rgba(196,132,29,0.22)",  text: P.secondary,  iconColor: P.secondary},
};

// ── SectionLabel ──────────────────────────────────
function SectionLabel({ text, color, icon }: { text: string; color: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", color, textTransform: "uppercase" }}>
        {text}
      </span>
      {icon && <span className="flex items-center" style={{ color }}>{icon}</span>}
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
    </div>
  );
}

// ── FAQ data ──────────────────────────────────────
const faqs = [
  {
    q: "¿Cuál es el formato del torneo?",
    a: "El torneo inicia con una fase de grupos seguida de eliminación directa (cuartos de final, semifinal y final). Los partidos iniciales se generan aleatoriamente.",
  },
  {
    q: "¿Cuántos jugadores por equipo?",
    a: "Mínimo 7 jugadores y máximo 12. Durante cada partido participan 7 por equipo. Más de la mitad deben pertenecer a los programas de Ing. de Sistemas, IA, Ciberseguridad o Estadística.",
  },
  {
    q: "¿Cómo se puntúa cada partido?",
    a: "Victoria: 3 puntos. Empate: 1 punto. Derrota: 0 puntos. El sistema calcula automáticamente los goles a favor/contra, diferencia de gol y puntos totales.",
  },
  {
    q: "¿Cómo inscribe mi equipo el capitán?",
    a: "El capitán realiza la inscripción cargando el comprobante de pago. La inscripción queda En Revisión hasta que el organizador la apruebe. Solo los equipos aprobados participan.",
  },
  {
    q: "¿Cuáles son los requisitos para inscribirse?",
    a: "El equipo debe tener entre 7 y 12 jugadores, con más de la mitad de los programas de la ECI. Se debe pagar el costo de inscripción y cargar el comprobante antes del cierre.",
  },
];

// ── Tournament ────────────────────────────────────
export function Tournament() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showReglamento, setShowReglamento] = useState(false);
  const [torneo, setTorneo] = useState<TorneoInfo | null>(null);

  // TODO: reemplazar con GET /api/tournaments/active
  useEffect(() => {
    setTorneo({
      nombre: "TECHCUP Fútbol 2026-I",
      estado: "En Progreso",
      fechaInicio: "15 Ene 2026",
      fechaFin: "30 Mar 2026",
      fechaCierreInscripciones: "10 Ene 2026",
      cantidadEquipos: 8,
      costo: 35000,
      reglamentoUrl: null, // URL real del PDF cuando esté disponible
      canchas: [
        { id: 1, nombre: "Cancha Principal",   descripcion: "Campo de césped sintético — capacidad 200 espectadores" },
        { id: 2, nombre: "Cancha Secundaria",  descripcion: "Campo de grama natural — partidos de fase de grupos" },
      ],
    });
  }, []);

  const estadoCfg = torneo ? estadoStyle[torneo.estado] : null;

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
            whileHover={{ scale: 1.05, x: -1 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <ArrowLeft style={{ width: 16, height: 16, color: P.default }} />
          </motion.div>
          <span className="flex-1" style={{ fontWeight: 800, color: P.primary, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
            TECHCUP
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${P.info}12` }}>
            <Info style={{ width: 14, height: 14, color: P.info }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: P.info }}>Torneo</span>
          </div>
        </div>
      </motion.header>

      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-10 pb-16 space-y-10">

        {/* ── Título ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.45, ease: "easeOut" }}>
          <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.2rem)", fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.03em", lineHeight: 1.12 }}>
            Información del Torneo
          </h1>
          <p className="mt-2" style={{ fontSize: "0.88rem", fontWeight: 500, color: P.default }}>
            Todo lo que necesitas saber sobre TECHCUP 2026
          </p>
        </motion.div>

        {/* ── Estado del Torneo ── */}
        {torneo && estadoCfg && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
            <SectionLabel text="Estado del Torneo" color={P.primary} />
            <div
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{ background: estadoCfg.bg, border: `1.5px solid ${estadoCfg.border}` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${estadoCfg.iconColor}15` }}>
                <CheckCircle2 style={{ width: 20, height: 20, color: estadoCfg.iconColor }} />
              </div>
              <div>
                <p style={{ fontSize: "0.92rem", fontWeight: 700, color: P.textPrimary }}>{torneo.estado}</p>
                <p style={{ fontSize: "0.78rem", color: P.default, fontWeight: 500 }}>
                  Inicio: {torneo.fechaInicio} &nbsp;·&nbsp; Fin: {torneo.fechaFin}
                  &nbsp;·&nbsp; Cierre inscripciones: {torneo.fechaCierreInscripciones}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Resumen ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <SectionLabel text="Resumen" color={P.primary} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Users,      label: "Equipos",           value: `${torneo?.cantidadEquipos ?? "—"} equipos`, color: P.primary,    bg: "rgba(184,28,28,0.08)"  },
              { icon: Calendar,   label: "Duración",          value: `${torneo?.fechaInicio ?? "—"}`,              color: P.secondary,  bg: "rgba(196,132,29,0.08)" },
              { icon: MapPin,     label: "Canchas",           value: `${torneo?.canchas.length ?? "—"} canchas`,  color: P.info,       bg: "rgba(0,102,254,0.08)"  },
              { icon: DollarSign, label: "Costo Inscripción", value: torneo ? `$${torneo.costo.toLocaleString("es-CO")} COP` : "—", color: P.success, bg: "rgba(23,201,100,0.08)" },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.07, duration: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.10)" }}
                  className="flex flex-col items-center text-center p-5 rounded-[20px] bg-white transition-all duration-300"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: card.bg }}>
                    <Icon style={{ width: 20, height: 20, color: card.color }} />
                  </div>
                  <p style={{ fontSize: "0.68rem", fontWeight: 600, color: P.default, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {card.label}
                  </p>
                  <p className="mt-1" style={{ fontSize: "0.82rem", fontWeight: 700, color: P.textPrimary }}>
                    {card.value}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Reglamento ── (§7.4 requerimiento) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <SectionLabel text="Reglamento" color={P.primary}
            icon={<FileText style={{ width: 13, height: 13 }} />} />
          <div
            className="rounded-[20px] p-6 bg-white"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1.5px solid ${P.primary}18` }}
          >
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(184,28,28,0.08)" }}>
                <FileText style={{ width: 22, height: 22, color: P.primary }} />
              </div>
              <div className="flex-1 min-w-[180px]">
                <p style={{ fontSize: "0.95rem", fontWeight: 700, color: P.textPrimary, marginBottom: "4px" }}>
                  Reglamento Oficial TECHCUP 2026
                </p>
                <p style={{ fontSize: "0.82rem", color: P.default, fontWeight: 500, lineHeight: 1.5 }}>
                  Consulta las normas, reglas de juego, sanciones y condiciones de participación del torneo.
                </p>
                <div className="flex gap-3 mt-4 flex-wrap">
                  {torneo?.reglamentoUrl ? (
                    <a
                      href={torneo.reglamentoUrl}
                      download
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm"
                      style={{ backgroundColor: P.primary, fontWeight: 700 }}
                    >
                      <Download style={{ width: 16, height: 16 }} />
                      Descargar PDF
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm opacity-50 cursor-not-allowed"
                      style={{ backgroundColor: "rgba(184,28,28,0.12)", color: P.primary, fontWeight: 700 }}
                    >
                      <Download style={{ width: 16, height: 16 }} />
                      PDF no disponible aún
                    </button>
                  )}
                  {torneo?.reglamentoUrl && (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setShowReglamento(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
                      style={{ backgroundColor: "rgba(184,28,28,0.08)", color: P.primary, fontWeight: 700, border: "none" }}
                    >
                      <Eye style={{ width: 16, height: 16 }} />
                      Ver en línea
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Canchas ── */}
        {torneo && torneo.canchas.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
            <SectionLabel text="Canchas" color={P.info}
              icon={<MapPin style={{ width: 13, height: 13 }} />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {torneo.canchas.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 + i * 0.06 }}
                  whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
                  className="flex items-start gap-3 bg-white rounded-[16px] p-4 transition-all duration-300"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(0,102,254,0.09)" }}>
                    <MapPin style={{ width: 18, height: 18, color: P.info }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: P.textPrimary, marginBottom: "2px" }}>
                      {c.nombre}
                    </p>
                    <p style={{ fontSize: "0.78rem", fontWeight: 500, color: P.default, lineHeight: 1.5 }}>
                      {c.descripcion}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Premios ── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
          <SectionLabel text="Premios" color={P.secondary} icon={<Trophy style={{ width: 13, height: 13 }} />} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { place: "1°", label: "Campeón",      prize: "Trofeo + Reconocimiento", icon: "🥇", color: "#C4841D", border: "rgba(196,132,29,0.22)" },
              { place: "2°", label: "Subcampeón",   prize: "Medalla + Reconocimiento",       icon: "🥈", color: "#8A8A8E", border: "rgba(138,138,142,0.22)" },
              { place: "3°", label: "Tercer Lugar", prize: "Nadita",       icon: "🥉", color: "#CD7F32", border: "rgba(205,127,50,0.22)"  },
            ].map((prize, i) => (
              <motion.div
                key={prize.place}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.48 + i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4, boxShadow: "0 16px 36px rgba(0,0,0,0.10)" }}
                className="flex flex-col items-center text-center p-7 rounded-[20px] bg-white transition-all duration-300"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1.5px solid ${prize.border}` }}
              >
                <span style={{ fontSize: "2.5rem" }}>{prize.icon}</span>
                <p className="mt-3" style={{ fontSize: "0.65rem", fontWeight: 700, color: prize.color, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  {prize.place} {prize.label}
                </p>
                <p className="mt-1.5" style={{ fontSize: "1.1rem", fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.02em" }}>
                  {prize.prize}
                </p>
              </motion.div>
            ))}
          </div>
          <p className="mt-3 text-center" style={{ fontSize: "0.72rem", fontWeight: 500, color: P.default }}>
            * Los premios son reconocimientos simbólicos del torneo universitario TECHCUP.
          </p>
        </motion.section>

        {/* ── FAQ ── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}>
          <SectionLabel text="Preguntas Frecuentes" color={P.info}
            icon={<FileText style={{ width: 13, height: 13 }} />} />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.60 + i * 0.07, duration: 0.35 }}
                className="bg-white rounded-[20px] overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 text-left transition-colors duration-200"
                  style={{ paddingTop: "1.1rem", paddingBottom: "1.1rem" }}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: P.textPrimary, paddingRight: "1rem" }}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: openFaq === i ? `${P.info}12` : P.bg }}
                  >
                    <ChevronDown style={{ width: 15, height: 15, color: openFaq === i ? P.info : P.default }} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5"
                        style={{ fontSize: "0.875rem", color: P.default, fontWeight: 500, lineHeight: 1.65, borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "0.9rem" }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </main>

      {/* ── Modal Reglamento ── */}
      <AnimatePresence>
        {showReglamento && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReglamento(false)}
              className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            >
              <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden pointer-events-auto"
                style={{ boxShadow: "0 24px 72px rgba(0,0,0,0.22)" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: P.textPrimary }}>
                    Reglamento TECHCUP 2026
                  </p>
                  <button onClick={() => setShowReglamento(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#F3F4F6", border: "none", cursor: "pointer" }}>
                    ✕
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  {torneo?.reglamentoUrl && (
                    <iframe
                      src={torneo.reglamentoUrl}
                      title="Reglamento TECHCUP"
                      className="w-full rounded-xl border"
                      style={{ height: "65vh", borderColor: "rgba(0,0,0,0.1)" }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}