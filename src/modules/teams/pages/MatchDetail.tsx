/**
 * @file src\modules\teams\pages\MatchDetail.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router";
import { assignedMatches } from "../data/matchesData";
import {
  ArrowLeft,
  Flag,
  AlertTriangle,
  Square,
  Clock,
  MapPin,
  Plus,
  Minus,
  CheckCircle2,
  Play,
  StopCircle,
  ChevronRight,
  Coffee,
  Timer,
  User,
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

// ── Event types ───────────────────────────────────
type EventType = "gol" | "amarilla" | "roja" | "esquina" | "falta";

interface EventDef {
  type: EventType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const eventDefs: EventDef[] = [
  {
    type: "gol",
    label: "Gol",
    icon: <span style={{ fontSize: "1rem" }}>âš½</span>,
    color: P.success,
    bg: `rgba(23,201,100,0.12)`,
  },
  {
    type: "amarilla",
    label: "T. Amarilla",
    icon: <Square className="w-3.5 h-3.5 fill-current" style={{ color: "#F5A623" }} />,
    color: "#F5A623",
    bg: "rgba(245,166,35,0.12)",
  },
  {
    type: "roja",
    label: "T. Roja",
    icon: <Square className="w-3.5 h-3.5 fill-current" style={{ color: P.primary }} />,
    color: P.primary,
    bg: "rgba(184,28,28,0.10)",
  },
  {
    type: "esquina",
    label: "Tiro Esquina",
    icon: <Flag className="w-3.5 h-3.5" style={{ color: P.info }} />,
    color: P.info,
    bg: "rgba(0,102,254,0.10)",
  },
  {
    type: "falta",
    label: "Falta",
    icon: <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.secondary }} />,
    color: P.secondary,
    bg: "rgba(196,132,29,0.10)",
  },
];

type TeamKey = "a" | "b";
type MatchState = "no-iniciado" | "en-curso" | "finalizado";

interface EventLogItem {
  id: number;
  team: TeamKey;
  type: EventType;
  actor: string;
  minute: string;
}

type Counters = Record<EventType, number>;

const emptyCounters = (): Counters => ({
  gol: 0, amarilla: 0, roja: 0, esquina: 0, falta: 0,
});

const HALFTIME_DURATION = 15 * 60; // 15 min in seconds

// ── Halftime Modal ────────────────────────────────
function HalfTimeModal({
  seconds,
  onResume,
}: {
  seconds: number;
  onResume: () => void;
}) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = 1 - seconds / HALFTIME_DURATION;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * progress;
  const isOver = seconds === 0;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{
          background: "linear-gradient(160deg, #5C0000 0%, #8B0000 45%, #B81C1C 100%)",
        }}
      />

      {/* Dot pattern */}
      <div
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 gap-8"
      >
        {/* Badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}
        >
          <Coffee className="w-3.5 h-3.5 text-white opacity-70" />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>
            Medio Tiempo
          </span>
        </div>

        <div className="text-center">
          <h2 className="text-white mb-1" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Descanso en curso
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400, fontSize: "0.9rem" }}>
            El partido reanudará al finalizar el tiempo de descanso
          </p>
        </div>

        {/* Circular timer */}
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          {/* Background ring */}
          <svg className="absolute inset-0" width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="6"
            />
            <motion.circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={isOver ? "#F5A623" : "rgba(255,255,255,0.75)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - strokeDash}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s ease" }}
            />
          </svg>

          {/* Center text */}
          <div className="flex flex-col items-center justify-center z-10">
            {isOver ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-1"
              >
                <Timer className="w-8 h-8" style={{ color: "#F5A623" }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F5A623", letterSpacing: "0.06em" }}>
                  ¡Tiempo!
                </span>
              </motion.div>
            ) : (
              <>
                <motion.span
                  key={mins}
                  initial={{ opacity: 0.6, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ fontSize: "3rem", fontWeight: 800, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.04em" }}
                >
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </motion.span>
                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.12em", marginTop: 4 }}>
                  RESTANTE
                </span>
              </>
            )}
          </div>
        </div>

        {/* Reanudar button */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onResume}
          className="flex items-center gap-3 px-10 py-4 rounded-[16px] text-white"
          style={{
            background: isOver
              ? "linear-gradient(135deg, #C4841D, #F5A623)"
              : "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.22)",
            fontWeight: 700,
            fontSize: "0.95rem",
            boxShadow: isOver ? "0 8px 28px rgba(196,132,29,0.45)" : "none",
            backdropFilter: "blur(12px)",
          }}
        >
          <Play className="w-5 h-5 fill-white" />
          Reanudar Partido
        </motion.button>

        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
          También puedes reanudar antes de tiempo
        </p>
      </motion.div>
    </>
  );
}

// ── Confirm modal ─────────────────────────────────
function ConfirmModal({
  title,
  body,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
      >
        <div
          className="bg-white rounded-[24px] p-8 max-w-sm w-full pointer-events-auto"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
        >
          <h2 className="text-xl text-center mb-2" style={{ fontWeight: 800, color: P.textPrimary }}>
            {title}
          </h2>
          <p className="text-sm text-center mb-7" style={{ color: P.default, fontWeight: 500 }}>
            {body}
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-xl border border-black/8 text-sm"
              style={{ fontWeight: 600, color: "#6C757D" }}
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              className="flex-1 py-3.5 rounded-xl text-white text-sm"
              style={{ backgroundColor: confirmColor, fontWeight: 700, boxShadow: `0 8px 24px ${confirmColor}40` }}
            >
              {confirmLabel}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Toast ─────────────────────────────────────────
function Toast({ msg, color }: { msg: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-white"
      style={{ backgroundColor: color, boxShadow: `0 12px 40px ${color}50`, whiteSpace: "nowrap" }}
    >
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm" style={{ fontWeight: 700 }}>{msg}</span>
    </motion.div>
  );
}

function ActorPickerModal({
  title,
  players,
  onPick,
  onClose,
}: {
  title: string;
  players: string[];
  onPick: (player: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
      >
        <div
          className="bg-white rounded-[20px] p-6 max-w-sm w-full pointer-events-auto"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
        >
          <h3 className="text-base mb-1" style={{ fontWeight: 800, color: P.textPrimary }}>
            Seleccionar jugador
          </h3>
          <p className="text-xs mb-4" style={{ color: P.default, fontWeight: 500 }}>{title}</p>

          <div className="space-y-2 mb-4">
            {players.map((player) => (
              <button
                key={player}
                onClick={() => onPick(player)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${P.info}14` }}>
                  <User className="w-4 h-4" style={{ color: P.info }} />
                </div>
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: P.textPrimary }}>{player}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl"
            style={{ backgroundColor: "rgba(0,0,0,0.06)", color: P.default, fontWeight: 700, fontSize: "0.82rem" }}
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ── MatchDetail ───────────────────────────────────
export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const match = assignedMatches.find((m) => m.id === Number(id));

  const [matchState, setMatchState] = useState<MatchState>(
    match?.status === "en-curso" ? "en-curso" : "no-iniciado"
  );

  // Timer
  const [timerRunning, setTimerRunning] = useState(match?.status === "en-curso");
  const [minute, setMinute] = useState(match?.status === "en-curso" ? 12 : 0);
  const [seconds, setSeconds] = useState(0); // real-time seconds within the minute
  const matchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Halftime
  const [halfTimeOpen, setHalfTimeOpen] = useState(false);
  const [halfTimeSeconds, setHalfTimeSeconds] = useState(HALFTIME_DURATION);
  const halfTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Score & events
  const [score, setScore] = useState({ a: 0, b: 0 });
  const [counters, setCounters] = useState<{ a: Counters; b: Counters }>({
    a: emptyCounters(),
    b: emptyCounters(),
  });

  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<null | "finalizar">(null);
  const [eventLog, setEventLog] = useState<EventLogItem[]>([]);
  const [actorPicker, setActorPicker] = useState<null | { team: TeamKey; type: EventType }>(null);
  const [recentActionsOpen, setRecentActionsOpen] = useState(false);

  const teamActors: Record<TeamKey, string[]> = {
    a: ["Luis Torres", "Andrés Gil", "Mateo Díaz", "Juan Ríos"],
    b: ["Daniel Mora", "Carlos Ruiz", "Jhon Pérez", "Sergio León"],
  };

  // Pre-load if already en-curso
  useEffect(() => {
    if (match?.status === "en-curso") {
      setScore({ a: 1, b: 0 });
      setCounters({
        a: { gol: 1, amarilla: 0, roja: 0, esquina: 0, falta: 0 },
        b: { gol: 0, amarilla: 1, roja: 0, esquina: 0, falta: 2 },
      });
    }
  }, []);

  // Match timer (real seconds -> converts to minutes)
  useEffect(() => {
    if (timerRunning) {
      matchTimerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 59) {
            setMinute((m) => m + 1);
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    }
    return () => { if (matchTimerRef.current) clearInterval(matchTimerRef.current); };
  }, [timerRunning]);

  // Halftime countdown
  useEffect(() => {
    if (halfTimeOpen) {
      halfTimerRef.current = setInterval(() => {
        setHalfTimeSeconds((s) => {
          if (s <= 0) {
            clearInterval(halfTimerRef.current!);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (halfTimerRef.current) clearInterval(halfTimerRef.current);
    }
    return () => { if (halfTimerRef.current) clearInterval(halfTimerRef.current); };
  }, [halfTimeOpen]);

  const showToast = (msg: string, color: string) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2200);
  };

  const handleEmpezar = () => {
    if (matchState === "no-iniciado") {
      setMatchState("en-curso");
    }
    setTimerRunning(true);
    showToast("¡Cronómetro iniciado!", P.success);
  };

  const handleHalfTime = () => {
    setTimerRunning(false);
    setHalfTimeSeconds(HALFTIME_DURATION);
    setHalfTimeOpen(true);
    showToast("Medio tiempo — cronómetro pausado", P.secondary);
  };

  const handleResume = () => {
    setHalfTimeOpen(false);
    setTimerRunning(true);
    showToast("¡Reanudado! Segunda parte", P.success);
  };

  const handleFinalize = () => {
    setTimerRunning(false);
    setMatchState("finalizado");
    setConfirmModal(null);
    showToast("Partido finalizado correctamente", P.primary);
  };

  const registerEvent = (team: TeamKey, type: EventType, actor: string) => {
    if (matchState !== "en-curso") return;
    const teamName = team === "a" ? (match?.teamA ?? "Equipo A") : (match?.teamB ?? "Equipo B");
    setCounters((prev) => ({
      ...prev,
      [team]: { ...prev[team], [type]: prev[team][type] + 1 },
    }));
    if (type === "gol") {
      setScore((prev) => ({ ...prev, [team]: prev[team] + 1 }));
    }
    setEventLog((prev) => [
      {
        id: Date.now(),
        team,
        type,
        actor,
        minute: `${minute}:${String(seconds).padStart(2, "0")}`,
      },
      ...prev,
    ]);
    const def = eventDefs.find((d) => d.type === type)!;
    showToast(`${def.label} registrado — ${teamName} (${actor})`, def.color);
  };

  const removeEvent = (team: TeamKey, type: EventType) => {
    if (matchState !== "en-curso") return;
    if (type !== "gol") return;
    setCounters((prev) => ({
      ...prev,
      [team]: { ...prev[team], [type]: Math.max(0, prev[team][type] - 1) },
    }));
    if (type === "gol") {
      setScore((prev) => ({ ...prev, [team]: Math.max(0, prev[team] - 1) }));
    }
    setEventLog((prev) => {
      const removeIndex = prev.findIndex((e) => e.team === team && e.type === type);
      if (removeIndex === -1) return prev;
      return prev.filter((_, idx) => idx !== removeIndex);
    });
  };

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: P.bg }}>
        <div className="text-center">
          <p style={{ color: P.default, fontWeight: 600 }}>Partido no encontrado</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm" style={{ color: P.primary, fontWeight: 700 }}>
            ← Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const stateColor = matchState === "en-curso" ? (timerRunning ? P.success : P.secondary) : matchState === "finalizado" ? P.default : P.secondary;
  const stateLabel = matchState === "en-curso" ? (timerRunning ? "En Curso" : "Pausado") : matchState === "finalizado" ? "Finalizado" : "No iniciado";

  // Format the live time display
  const liveTime = matchState === "no-iniciado"
    ? match.time
    : `${minute}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen pb-28 lg:pb-8" style={{ backgroundColor: P.bg }}>

      {/* ── Halftime overlay ── */}
      <AnimatePresence>
        {halfTimeOpen && (
          <HalfTimeModal seconds={halfTimeSeconds} onResume={handleResume} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actorPicker && (
          <ActorPickerModal
            title={`${eventDefs.find((d) => d.type === actorPicker.type)?.label} · ${actorPicker.team === "a" ? match.teamA : match.teamB}`}
            players={teamActors[actorPicker.team]}
            onPick={(actor) => {
              registerEvent(actorPicker.team, actorPicker.type, actor);
              setActorPicker(null);
            }}
            onClose={() => setActorPicker(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-40"
        style={{ background: "linear-gradient(160deg, #5C0000 0%, #8B0000 50%, #B81C1C 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4">
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>

            <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              {match.phase}
            </p>

            {/* Status pill */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${stateColor}30`, border: `1px solid ${stateColor}60` }}
            >
              {matchState === "en-curso" && timerRunning && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: stateColor }}
                />
              )}
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: stateColor, letterSpacing: "0.08em" }}>
                {stateLabel}
              </span>
            </div>
          </div>

          {/* Score board */}
          <div className="flex items-center justify-between gap-4 pb-6 pt-1">
            <div className="flex-1 text-right">
              <p className="text-white leading-tight" style={{ fontWeight: 800, fontSize: "clamp(0.85rem, 2.5vw, 1.05rem)", letterSpacing: "-0.01em" }}>
                {match.teamA}
              </p>
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>Local</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.span
                key={score.a}
                initial={{ scale: 1.4, color: "#5EFFA3" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                transition={{ duration: 0.4 }}
                style={{ fontSize: "clamp(2.2rem, 7vw, 3rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}
              >
                {score.a}
              </motion.span>
              <span style={{ fontSize: "1.4rem", fontWeight: 300, color: "rgba(255,255,255,0.25)" }}>:</span>
              <motion.span
                key={score.b + 100}
                initial={{ scale: 1.4, color: "#5EFFA3" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                transition={{ duration: 0.4 }}
                style={{ fontSize: "clamp(2.2rem, 7vw, 3rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}
              >
                {score.b}
              </motion.span>
            </div>

            <div className="flex-1">
              <p className="text-white leading-tight" style={{ fontWeight: 800, fontSize: "clamp(0.85rem, 2.5vw, 1.05rem)", letterSpacing: "-0.01em" }}>
                {match.teamB}
              </p>
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>Visitante</p>
            </div>
          </div>

          {/* Meta row — live timer */}
          <div className="flex items-center justify-center gap-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" style={{ color: "rgba(255,255,255,0.45)" }} />
              <motion.span
                key={liveTime}
                initial={{ opacity: 0.5, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: "0.72rem", color: timerRunning ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
              >
                {liveTime}
              </motion.span>
            </div>
            <div className="w-px h-3" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" style={{ color: "rgba(255,255,255,0.45)" }} />
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
                {match.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-6">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="w-1 h-4 rounded-full" style={{ backgroundColor: P.primary }} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: P.primary, textTransform: "uppercase" }}>
            Registrar Eventos
          </span>
          {matchState !== "en-curso" && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${P.default}18`, color: P.default, fontWeight: 600 }}
            >
              {matchState === "no-iniciado" ? "Inicia el partido para registrar" : "Partido finalizado"}
            </span>
          )}
        </motion.div>

        {/* Event panels */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {(["a", "b"] as TeamKey[]).map((team) => (
            <div
              key={team}
              className="bg-white rounded-[20px] overflow-hidden"
              style={{
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                opacity: matchState !== "en-curso" ? 0.6 : 1,
                transition: "opacity 0.3s",
              }}
            >
              {/* Team header */}
              <div
                className="px-4 py-3"
                style={{
                  background: team === "a"
                    ? "linear-gradient(90deg, rgba(184,28,28,0.08), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(0,102,254,0.08))",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <p
                  className="leading-tight text-center"
                  style={{ fontWeight: 800, fontSize: "0.78rem", color: team === "a" ? P.primary : P.info, letterSpacing: "-0.01em" }}
                >
                  {team === "a" ? match.teamA : match.teamB}
                </p>
              </div>

              {/* Event rows */}
              <div className="divide-y divide-black/[0.04]">
                {eventDefs.map((def) => {
                  const count = counters[team][def.type];
                  return (
                    <div key={def.type} className="flex items-center gap-2 px-3 py-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: def.bg }}
                      >
                        {def.icon}
                      </div>

                      <span className="flex-1 min-w-0 truncate" style={{ fontSize: "0.72rem", fontWeight: 600, color: P.textPrimary }}>
                        {def.label}
                      </span>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {def.type === "gol" && (
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => removeEvent(team, def.type)}
                            disabled={matchState !== "en-curso" || count === 0}
                            className="w-5 h-5 rounded-md flex items-center justify-center"
                            style={{
                              backgroundColor: count > 0 && matchState === "en-curso" ? "rgba(0,0,0,0.06)" : "transparent",
                              opacity: count === 0 || matchState !== "en-curso" ? 0.3 : 1,
                            }}
                          >
                            <Minus className="w-3 h-3" style={{ color: P.default }} />
                          </motion.button>
                        )}

                        <span
                          className="w-5 text-center"
                          style={{ fontSize: "0.78rem", fontWeight: 800, color: count > 0 ? def.color : P.default }}
                        >
                          {count}
                        </span>

                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => setActorPicker({ team, type: def.type })}
                          disabled={matchState !== "en-curso"}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{
                            backgroundColor: matchState === "en-curso" ? def.color : P.default,
                            opacity: matchState !== "en-curso" ? 0.4 : 1,
                            boxShadow: matchState === "en-curso" ? `0 2px 8px ${def.color}40` : "none",
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
          className="bg-white rounded-[20px] p-4 mb-6"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          <button
            onClick={() => setRecentActionsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between"
          >
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: P.default, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Acciones recientes con actor
            </p>
            <motion.div
              animate={{ rotate: recentActionsOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: P.default }} />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {recentActionsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {eventLog.length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: P.default, fontWeight: 500 }}>
                    Aún no hay acciones registradas.
                  </p>
                ) : (
                  eventLog.slice(0, 6).map((entry) => {
                    const def = eventDefs.find((d) => d.type === entry.type)!;
                    const teamLabel = entry.team === "a" ? match.teamA : match.teamB;
                    return (
                      <div key={entry.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: "#F8F8FA" }}>
                        <p style={{ fontSize: "0.78rem", color: P.textPrimary, fontWeight: 600 }}>
                          {def.label} · {entry.actor} · {teamLabel}
                        </p>
                        <span style={{ fontSize: "0.72rem", color: P.default, fontWeight: 600 }}>{entry.minute}</span>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Spacer for mobile to ensure scroll space */}
        <div className="h-8" />

        {/* ── Bottom Actions ── */}
        <div className="pb-28 lg:pb-8">
          <div className="flex flex-col gap-2.5">

          {/* ── No iniciado ── */}
          {matchState === "no-iniciado" && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEmpezar}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-[16px] text-white"
              style={{
                background: `linear-gradient(135deg, ${P.success}, #12A854)`,
                boxShadow: `0 8px 28px rgba(23,201,100,0.38)`,
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              <Play className="w-5 h-5 fill-white" />
              Iniciar Partido
            </motion.button>
          )}

          {/* ── En curso ── */}
          {matchState === "en-curso" && (
            <>
              {/* Finalizar */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfirmModal("finalizar")}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-[16px] text-white"
                style={{
                  background: `linear-gradient(135deg, #8B0000, ${P.primary})`,
                  boxShadow: `0 8px 28px rgba(184,28,28,0.38)`,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                <StopCircle className="w-5 h-5" />
                Finalizar Partido
              </motion.button>

              {/* Empezar + Medio Tiempo */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Empezar */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleEmpezar}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-[14px] text-white"
                  style={{
                    background: timerRunning
                      ? "rgba(23,201,100,0.15)"
                      : `linear-gradient(135deg, ${P.success}, #12A854)`,
                    border: timerRunning ? `1.5px solid ${P.success}50` : "none",
                    boxShadow: timerRunning ? "none" : `0 6px 20px rgba(23,201,100,0.30)`,
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: timerRunning ? P.success : "#fff",
                  }}
                >
                  <Play
                    className="w-4 h-4"
                    style={{ fill: timerRunning ? P.success : "#fff" }}
                  />
                  {timerRunning ? "Corriendo" : "Empezar"}
                </motion.button>

                {/* Medio Tiempo */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleHalfTime}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-[14px]"
                  style={{
                    background: `linear-gradient(135deg, #8B5A00, ${P.secondary})`,
                    boxShadow: `0 6px 20px rgba(196,132,29,0.32)`,
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: "#fff",
                  }}
                >
                  <Coffee className="w-4 h-4" />
                  Medio Tiempo
                </motion.button>
              </div>
            </>
          )}

          {/* ── Finalizado ── */}
          {matchState === "finalizado" && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-[16px]"
              style={{ backgroundColor: "rgba(0,0,0,0.06)", fontWeight: 700, fontSize: "0.95rem", color: P.default }}
            >
              <ChevronRight className="w-5 h-5" />
              Volver al Dashboard
            </motion.button>
          )}

          </div>
        </div>

      </div>

      {/* ── Confirm finalizar ── */}
      <AnimatePresence>
        {confirmModal === "finalizar" && (
          <ConfirmModal
            title="¿Finalizar el partido?"
            body={`Marcador final: ${score.a} – ${score.b}. Esta acción no se puede deshacer.`}
            confirmLabel="Finalizar"
            confirmColor={P.primary}
            onConfirm={handleFinalize}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} color={toast.color} />}
      </AnimatePresence>
    </div>
  );
}




