/**
 * @file src\modules\competition\pages\Dashboard.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import logoTechcup from "@/assets/logo.png";
import { readUICache, writeUICache, removeUICache } from "@/core/utils/uiCache";
import {
  User,
  Swords,
  CalendarDays,
  Trophy,
  Info,
  LogOut,
  Bell,
  Users,
  Check,
  X,
  ChevronRight,
  ClipboardList,
  Shield,
  UserPlus,
  Trash2,
  Send,
  AlertCircle,
  CreditCard,
  Upload,
  FileText,
  ImageIcon,
  Paperclip,
} from "lucide-react";

// ── Palette — Apple-style ─────────────────────────
const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  success: "#17C964",
  info: "#0066FE",
  default: "#6E6E73",
  textPrimary: "#1C1C1E",
  bg: "#F2F2F7",
};

const USER_ACCENT = "#86C2F5";

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

// ── Notification types ────────────────────────────
type NotifStatus = "pending" | "uploaded";

interface Notification {
  id: number;
  type: "payment";
  team: string;
  captain: string;
  time: string;
  status: NotifStatus;
  read: boolean;
}

const initialNotifs: Notification[] = [];
const TEAM_NOTIFS_STORAGE_KEY = "techcup.teamNotifications";

type RoleType = "jugador" | "capitan";
type TeamStatus = "draft" | "pending-payment" | "in-review" | "active";

interface TeamScheduleItem {
  id: number;
  date: string;
  label: string;
  opponent: string;
  venue: string;
  hour: string;
}

interface TeamMemberStats {
  id: number;
  name: string;
  role: "Capitán" | "Jugador";
  goals: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  fouls: number;
}

interface TeamPerformance {
  members: TeamMemberStats[];
  totalPoints: number;
}

interface TeamRosterMember {
  id: number;
  name: string;
  email: string;
  role: "Capitán" | "Jugador";
  jerseyNumber: number;
}

interface InvitedMemberDraft {
  email: string;
  role: "Jugador";
  jerseyNumber: number;
}

const TEAM_CONTEXT_STORAGE_KEY = "techcup.teamContext";

interface StoredTeamContext {
  roleInTeam?: RoleType;
  teamStatus?: TeamStatus;
  teamName?: string;
  teamMembers?: TeamRosterMember[];
  joinedAt?: string | null;
  teamSchedule?: TeamScheduleItem[];
}

const createTeamSchedule = (_teamName: string): TeamScheduleItem[] => [];

const createTeamPerformance = (roster: TeamRosterMember[]): TeamPerformance => {
  const members: TeamMemberStats[] = roster.map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    goals: 0,
    yellowCards: 0,
    redCards: 0,
    corners: 0,
    fouls: 0,
  }));

  return {
    members,
    totalPoints: 0,
  };
};

// ── Notification Panel ────────────────────────────
function NotifPanel({
  notifs,
  onClose,
  onSelectNotif,
  onMarkRead,
}: {
  notifs: Notification[];
  onClose: () => void;
  onSelectNotif: (n: Notification) => void;
  onMarkRead: (id: number) => void;
}) {
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto top-16 sm:top-12 w-auto sm:w-[380px] bg-white rounded-[20px] overflow-hidden z-50 max-h-[calc(100vh-5rem)] sm:max-h-none"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.14)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: P.primary }} />
          <span className="text-sm" style={{ fontWeight: 700 }}>
            Notificaciones
          </span>
          {unread > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: P.primary, fontWeight: 700 }}
            >
              {unread}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F8F9FA] transition-colors duration-200"
        >
          <X className="w-4 h-4" style={{ color: P.default }} />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-black/4 max-h-[360px] overflow-y-auto">
        {notifs.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: P.default }} />
            <p className="text-sm" style={{ color: P.default, fontWeight: 500 }}>
              Sin notificaciones
            </p>
          </div>
        ) : (
          notifs.map((n) => (
            <motion.button
              key={n.id}
              whileHover={{ backgroundColor: "#F8F9FA" }}
              onClick={() => {
                onMarkRead(n.id);
                if (n.status === "pending") onSelectNotif(n);
              }}
              className="w-full text-left px-5 py-4 flex items-start gap-3 transition-colors duration-150 relative"
            >
              {/* Unread dot */}
              {!n.read && (
                <div
                  className="absolute top-4 right-4 w-2 h-2 rounded-full"
                  style={{ backgroundColor: P.primary }}
                />
              )}

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: n.status === "uploaded" ? `${P.success}18` : `${P.info}18`,
                }}
              >
                <CreditCard
                  className="w-5 h-5"
                  style={{ color: n.status === "uploaded" ? P.success : P.info }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm leading-snug" style={{ fontWeight: 600 }}>
                  {n.status === "uploaded"
                    ? "Comprobante enviado correctamente"
                    : "Bienvenido al torneo · Comprobante de pago"}
                </p>
                <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 500 }}>
                  {`${n.team} · ${n.captain}`}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px]" style={{ color: P.default, fontWeight: 500 }}>
                    {n.time}
                  </span>
                  {n.status === "pending" && (
                    <span
                      className="text-[11px] flex items-center gap-0.5"
                      style={{ color: P.info, fontWeight: 700 }}
                    >
                      Subir comprobante
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                  {n.status === "uploaded" && (
                    <span
                      className="text-[11px] flex items-center gap-1"
                      style={{ color: P.success, fontWeight: 700 }}
                    >
                      <Check className="w-3 h-3" /> Enviado
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-black/5 bg-[#FAFAFA] text-center">
        <span className="text-xs" style={{ color: P.default, fontWeight: 500 }}>
          El comprobante de pago se habilita cuando el usuario ya está inscrito en un equipo
        </span>
      </div>
    </motion.div>
  );
}

// ── Payment Modal ─────────────────────────────────
function PaymentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [fileError, setFileError] = useState("");
  const acceptedFormats = ["image/png", "image/jpeg", "application/pdf"];

  const getIcon = () => {
    if (!file) return null;
    if (file.type.startsWith("image/")) return <ImageIcon className="w-5 h-5" style={{ color: P.info }} />;
    return <FileText className="w-5 h-5" style={{ color: P.info }} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelected = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!acceptedFormats.includes(selectedFile.type)) {
      setFileError("Solo se permiten archivos PNG, JPG o PDF");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError("El archivo debe pesar máximo 10 MB");
      return;
    }

    setFile(selectedFile);
    setFileError("");
  };

  const handleSend = () => {
    if (!file) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onClose();
      onSuccess();
    }, 1800);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm"
      />

      {/* Drawer bottom -> centered desktop */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[81] sm:inset-0 sm:flex sm:items-center sm:justify-center sm:px-6 pointer-events-none"
      >
        <div
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden pointer-events-auto flex flex-col"
          style={{ boxShadow: "0 -8px 60px rgba(0,0,0,0.18)", maxHeight: "92vh" }}
        >
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-black/10" />
          </div>

          {/* Color band */}
          <div className="h-1.5 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${P.info}, #0044CC)` }} />

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            <div className="px-6 pt-6 pb-4">

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${P.info}15` }}
                  >
                    <CreditCard className="w-5 h-5" style={{ color: P.info }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest" style={{ fontWeight: 700, color: P.info }}>
                      Comprobante de Pago
                    </p>
                    <h2 className="text-lg text-black" style={{ fontWeight: 700 }}>
                      Bienvenido al torneo
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#F8F9FA] transition-colors duration-200 flex-shrink-0"
                >
                  <X className="w-4 h-4" style={{ color: P.default }} />
                </button>
              </div>

              {/* Welcome message */}
              <div
                className="p-4 rounded-2xl mb-5 border"
                style={{ backgroundColor: `${P.info}08`, borderColor: `${P.info}22` }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "#1A1A2E", fontWeight: 500 }}>
                  👋 ¡Bienvenido al torneo! Acá puedes subir tu{" "}
                  <span style={{ fontWeight: 700 }}>comprobante de pago</span> para confirmar tu participación en TECHCUP 2026.
                </p>
              </div>

              {/* Accepted formats */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["PNG", "JPG", "PDF"].map((ext) => (
                  <span
                    key={ext}
                    className="text-xs px-2.5 py-1 rounded-full border"
                    style={{ borderColor: `${P.info}30`, color: P.info, fontWeight: 600, backgroundColor: `${P.info}08` }}
                  >
                    {ext}
                  </span>
                ))}
                <span
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{ borderColor: "#E9ECEF", color: P.default, fontWeight: 500 }}
                >
                  Máx. 10 MB
                </span>
              </div>

              {/* Inline receipt selection */}
              <div
                className="rounded-2xl border p-4 mb-4"
                style={{
                  borderColor: file ? `${P.success}30` : "#E9ECEF",
                  backgroundColor: file ? `${P.success}08` : "#FAFAFA",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: file ? `${P.success}18` : "#F0F0F0" }}
                  >
                    {file ? (
                      <Check className="w-6 h-6" style={{ color: P.success }} />
                    ) : (
                      <Upload className="w-6 h-6" style={{ color: P.default }} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 700, color: "#333" }}>
                      {file ? "Comprobante listo para enviar" : "Adjunta tu comprobante"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 500 }}>
                      {file
                        ? "Si quieres reemplazarlo, vuelve a adjuntarlo antes de enviarlo"
                        : "Selecciona un archivo desde tu dispositivo para cargarlo en la plataforma"}
                    </p>
                  </div>
                </div>

                <label
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-colors cursor-pointer"
                  style={{
                    backgroundColor: file ? `${P.success}12` : `${P.info}12`,
                    color: file ? P.success : P.info,
                    fontWeight: 700,
                  }}
                >
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      handleFileSelected(e.target.files?.[0] ?? null);
                      e.currentTarget.value = "";
                    }}
                  />
                  {file ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {file ? "Cambiar comprobante" : "Adjuntar comprobante"}
                </label>
                {fileError && (
                  <p className="text-xs mt-2" style={{ color: P.primary, fontWeight: 600 }}>
                    {fileError}
                  </p>
                )}
              </div>

              {/* File preview pill */}
              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border mb-4"
                    style={{ borderColor: `${P.success}30`, backgroundColor: `${P.success}08` }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${P.info}18` }}
                    >
                      {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ fontWeight: 600 }}>{file.name}</p>
                      <p className="text-xs" style={{ color: P.default, fontWeight: 500 }}>{formatSize(file.size)}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: P.default }} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint */}
              <div
                className="flex items-start gap-2 px-4 py-3 rounded-xl"
                style={{ backgroundColor: `${P.secondary}0D` }}
              >
                <Paperclip className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: P.secondary }} />
                <p className="text-xs" style={{ color: "#7A5C10", fontWeight: 500 }}>
                  Asegúrate de que el comprobante sea legible y muestre el monto, fecha y número de transacción.
                </p>
              </div>
            </div>
          </div>

          {/* ── Sticky footer with Send button ── */}
          <div
            className="flex-shrink-0 px-6 py-5 border-t border-black/5 bg-white"
            style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
          >
            <motion.button
              whileHover={file && !sending ? { scale: 1.02, y: -1 } : {}}
              whileTap={file && !sending ? { scale: 0.98 } : {}}
              onClick={handleSend}
              disabled={!file || sending}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white text-sm transition-all duration-300"
              style={{
                backgroundColor: file ? P.info : "#E9ECEF",
                fontWeight: 700,
                color: file ? "white" : P.default,
                boxShadow: file ? `0 8px 28px ${P.info}40` : "none",
                cursor: file ? "pointer" : "not-allowed",
              }}
            >
              {sending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                  />
                  Enviando comprobante...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {file ? "Enviar comprobante" : "Selecciona un archivo primero"}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Inscription Modal ─────────────────────────────
function InscriptionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (payload: { teamName: string; members: TeamRosterMember[] }) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [teamName, setTeamName] = useState("");
  const [teamNameError, setTeamNameError] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [captainNumber, setCaptainNumber] = useState<number>(10);
  const [jerseyInput, setJerseyInput] = useState(11);
  const [invited, setInvited] = useState<InvitedMemberDraft[]>([]);
  const [emailError, setEmailError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isInstitutionalEmail = (e: string) => /@[^\s@]*\.edu(\.[a-z]{2})?$/i.test(e);
  const validTeamName = /^[A-Za-zÀ-ÿ0-9]+(?:[\s-][A-Za-zÀ-ÿ0-9]+)*$/;

  const suggestEmail = (value: string) => {
    const typoMap: Record<string, string> = {
      "gmal.com": "gmail.com",
      "gnail.com": "gmail.com",
      "hotnail.com": "hotmail.com",
      "outlok.com": "outlook.com",
      "yaho.com": "yahoo.com",
      "escuelaing.edu.coo": "escuelaing.edu.co",
    };
    const parts = value.toLowerCase().split("@");
    if (parts.length !== 2) return null;
    const replacement = typoMap[parts[1]];
    if (!replacement) return null;
    return `${parts[0]}@${replacement}`;
  };

  const getNextJersey = () => {
    const used = new Set<number>([captainNumber, ...invited.map((m) => m.jerseyNumber)]);
    for (let i = 0; i <= 99; i += 1) {
      if (!used.has(i)) return i;
    }
    return 0;
  };

  const validateStepOne = () => {
    const normalized = teamName.trim();
    if (normalized.length < 3) {
      setTeamNameError("El nombre del equipo debe tener al menos 3 caracteres");
      return false;
    }
    if (normalized.length > 30) {
      setTeamNameError("El nombre del equipo no puede superar 30 caracteres");
      return false;
    }
    if (!validTeamName.test(normalized)) {
      setTeamNameError("Usa solo letras, números, espacios o guiones");
      return false;
    }
    setTeamNameError("");
    return true;
  };

  const handleAddInvite = () => {
    const val = emailInput.trim().toLowerCase();
    const jersey = Number(jerseyInput);

    setMemberError("");
    if (!val) return;
    if (invited.length >= 11) {
      setMemberError("Máximo 12 personas por equipo (1 capitán + 11 jugadores)");
      return;
    }
    if (!isValidEmail(val)) {
      setEmailError("Ingresa un correo válido");
      setEmailSuggestion(suggestEmail(val));
      return;
    }
    if (!isInstitutionalEmail(val)) {
      setEmailError("Debe ser correo institucional (.edu)");
      return;
    }
    if (invited.some((m) => m.email === val)) {
      setEmailError("Este correo ya fue añadido");
      return;
    }
    if (!Number.isInteger(jersey) || jersey < 0 || jersey > 99) {
      setMemberError("El dorsal debe estar entre 0 y 99");
      return;
    }
    if (jersey === captainNumber || invited.some((m) => m.jerseyNumber === jersey)) {
      setMemberError("Ese dorsal ya está asignado en el equipo");
      return;
    }

    setInvited((prev) => [...prev, { email: val, role: "Jugador", jerseyNumber: jersey }]);
    setEmailInput("");
    setJerseyInput(getNextJersey());
    setEmailError("");
    setEmailSuggestion(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddInvite(); }
  };

  const handleSubmit = () => {
    const totalMembers = 1 + invited.length;
    if (totalMembers < 7) {
      setMemberError("El equipo debe tener mínimo 7 personas (incluyendo capitán)");
      return;
    }
    if (totalMembers > 12) {
      setMemberError("El equipo no puede superar 12 personas");
      return;
    }
    if (!Number.isInteger(captainNumber) || captainNumber < 0 || captainNumber > 99) {
      setMemberError("El dorsal del capitán debe estar entre 0 y 99");
      return;
    }

    const members: TeamRosterMember[] = [
      {
        id: 1,
        name: "Tú",
        email: "capitan@techcup.local",
        role: "Capitán",
        jerseyNumber: captainNumber,
      },
      ...invited.map((member, index) => ({
        id: index + 2,
        name: member.email.split("@")[0],
        email: member.email,
        role: member.role,
        jerseyNumber: member.jerseyNumber,
      })),
    ];

    onClose();
    onSuccess({ teamName: teamName.trim(), members });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      />

      {/* Drawer — slides from bottom on mobile, centered on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[71] sm:inset-0 sm:flex sm:items-center sm:justify-center sm:px-6 pointer-events-none"
      >
        <div
          className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden pointer-events-auto"
          style={{ boxShadow: "0 -8px 60px rgba(0,0,0,0.18)", maxHeight: "calc(100dvh - 8px)" }}
        >
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-black/10" />
          </div>

          {/* Colored band */}
          <div className="h-1.5 w-full mx-0" style={{ background: `linear-gradient(90deg, ${P.primary}, ${P.secondary})` }} />

          {/* Scrollable body */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100dvh - 4.5rem)" }}>
            <div className="px-6 pt-6" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}>

              {/* ── Captain notice ── */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3 p-4 rounded-2xl mb-6 border"
                style={{
                  backgroundColor: `${P.secondary}0D`,
                  borderColor: `${P.secondary}35`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${P.secondary}20` }}
                >
                  <Shield className="w-4 h-4" style={{ color: P.secondary }} />
                </div>
                <div>
                  <p className="text-sm" style={{ fontWeight: 700, color: P.secondary }}>
                    Rol de Capitán
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#7A5C10", fontWeight: 500 }}>
                    La persona que crea la invitación y el grupo se le asigna el rol de
                    <span style={{ fontWeight: 700 }}> Capitán </span>
                    automáticamente, sin poder hacer el cambio durante el torneo.
                  </p>
                </div>
              </motion.div>

              {/* ── Header ── */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ fontWeight: 700, color: P.primary }}>
                    Inscripción al Torneo
                  </p>
                  <h2 className="text-xl text-black" style={{ fontWeight: 700 }}>
                    {step === 1 ? "Crea tu equipo" : "Invita a tus compañeros"}
                  </h2>
                  <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 500 }}>
                    Paso {step} de 2
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#F8F9FA] transition-colors duration-200"
                >
                  <X className="w-4 h-4" style={{ color: P.default }} />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-2 mb-7">
                {[1, 2].map((s) => (
                  <motion.div
                    key={s}
                    animate={{ width: step === s ? 32 : 8 }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: step >= s ? P.primary : "#E9ECEF" }}
                  />
                ))}
              </div>

              {/* ── STEP 1: Team name ── */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-5"
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-2">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${P.primary}10` }}
                      >
                        <ClipboardList className="w-8 h-8" style={{ color: P.primary }} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "#6C757D" }}>
                        Nombre del equipo *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Equipo Alpha"
                        value={teamName}
                        onChange={(e) => {
                          setTeamName(e.target.value);
                          if (teamNameError) setTeamNameError("");
                        }}
                        maxLength={30}
                        className="w-full px-4 py-3.5 rounded-xl border text-sm bg-white outline-none transition-all duration-200"
                        style={{
                          borderColor: teamName ? P.primary : "#E9ECEF",
                          fontWeight: 500,
                          boxShadow: teamName ? `0 0 0 3px ${P.primary}15` : "none",
                        }}
                      />
                      <div className="flex justify-between mt-1">
                        <p className="text-xs" style={{ color: P.default, fontWeight: 500 }}>
                          Máximo 30 caracteres
                        </p>
                        <p className="text-xs" style={{ color: teamName.length > 25 ? P.primary : P.default, fontWeight: 500 }}>
                          {teamName.length}/30
                        </p>
                      </div>
                      {teamNameError && (
                        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: P.primary, fontWeight: 600 }}>
                          <AlertCircle className="w-3 h-3" />
                          {teamNameError}
                        </p>
                      )}
                    </div>

                    {/* Info note */}
                    <div
                      className="flex items-start gap-2 p-3 rounded-xl"
                      style={{ backgroundColor: `${P.info}0D` }}
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: P.info }} />
                      <p className="text-xs" style={{ color: P.info, fontWeight: 500 }}>
                        El nombre del equipo es definitivo y no podrá modificarse una vez confirmada la inscripción.
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (validateStepOne()) setStep(2);
                      }}
                      disabled={!teamName.trim()}
                      className="w-full py-4 rounded-2xl text-white text-sm transition-all duration-200"
                      style={{
                        backgroundColor: teamName.trim() ? P.primary : "#E9ECEF",
                        fontWeight: 700,
                        color: teamName.trim() ? "white" : P.default,
                        boxShadow: teamName.trim() ? `0 8px 24px ${P.primary}35` : "none",
                        cursor: teamName.trim() ? "pointer" : "not-allowed",
                      }}
                    >
                      Continuar →
                    </motion.button>
                  </motion.div>
                )}

                {/* ── STEP 2: Invite people ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-5"
                  >
                    {/* Team badge */}
                    <div
                      className="flex items-center gap-3 p-4 rounded-2xl border"
                      style={{ borderColor: `${P.primary}25`, backgroundColor: `${P.primary}07` }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${P.primary}18` }}
                      >
                        <span className="text-base" style={{ fontWeight: 800, color: P.primary }}>
                          {teamName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm" style={{ fontWeight: 700 }}>{teamName}</p>
                        <p className="text-xs" style={{ color: P.default, fontWeight: 500 }}>
                          Tú · <span style={{ color: P.secondary, fontWeight: 700 }}>Capitán</span> · #{captainNumber}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${P.success}18`, color: P.success, fontWeight: 700 }}
                        >
                          {1 + invited.length} miembro{invited.length !== 0 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "#6C757D" }}>
                          Dorsal del capitán (0 a 99)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={captainNumber}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setCaptainNumber(Number.isNaN(value) ? 0 : value);
                          }}
                          className="w-full px-4 py-3 rounded-xl border text-sm bg-white outline-none"
                          style={{ borderColor: "#E9ECEF", fontWeight: 600 }}
                        />
                      </div>
                    </div>

                    {/* Invite input */}
                    <div>
                      <label className="block text-xs mb-1.5" style={{ fontWeight: 700, color: "#6C757D" }}>
                        Invitar por correo institucional
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2">
                        <input
                          type="email"
                          placeholder="correo@universidad.edu"
                          value={emailInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEmailInput(value);
                            setEmailError("");
                            setEmailSuggestion(value ? suggestEmail(value) : null);
                          }}
                          onKeyDown={handleKeyDown}
                          className="flex-1 px-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all duration-200"
                          style={{
                            borderColor: emailError ? P.primary : emailInput ? P.info : "#E9ECEF",
                            fontWeight: 500,
                            boxShadow: emailInput && !emailError ? `0 0 0 3px ${P.info}15` : emailError ? `0 0 0 3px ${P.primary}15` : "none",
                          }}
                        />
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={jerseyInput}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setJerseyInput(Number.isNaN(value) ? 0 : value);
                            if (memberError) setMemberError("");
                          }}
                          className="px-3 py-3 rounded-xl border text-sm bg-white outline-none"
                          style={{ borderColor: "#E9ECEF", fontWeight: 600 }}
                          aria-label="Dorsal"
                        />
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={handleAddInvite}
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: P.info }}
                        >
                          <UserPlus className="w-5 h-5" />
                        </motion.button>
                      </div>
                      {emailError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs mt-1.5 flex items-center gap-1"
                          style={{ color: P.primary, fontWeight: 500 }}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {emailError}
                        </motion.p>
                      )}
                      {!emailError && emailSuggestion && (
                        <p className="text-xs mt-1.5" style={{ color: P.info, fontWeight: 600 }}>
                          ¿Quisiste decir <button type="button" onClick={() => setEmailInput(emailSuggestion)} style={{ textDecoration: "underline" }}>{emailSuggestion}</button>?
                        </p>
                      )}
                      {memberError && (
                        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: P.primary, fontWeight: 600 }}>
                          <AlertCircle className="w-3 h-3" />
                          {memberError}
                        </p>
                      )}
                      <p className="text-xs mt-1.5" style={{ color: P.default, fontWeight: 500 }}>
                        Presiona Enter o + para añadir. Regla del torneo: entre 7 y 12 personas por equipo.
                      </p>
                    </div>

                    {/* Invited list */}
                    {invited.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs" style={{ fontWeight: 700, color: "#6C757D" }}>
                          Invitados ({invited.length})
                        </p>
                        <AnimatePresence>
                          {invited.map((member) => (
                            <motion.div
                              key={`${member.email}-${member.jerseyNumber}`}
                              initial={{ opacity: 0, height: 0, y: -8 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -8 }}
                              transition={{ duration: 0.22 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-black/6 bg-white"
                            >
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs"
                                style={{ backgroundColor: P.info, fontWeight: 700 }}
                              >
                                {member.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate" style={{ fontWeight: 600 }}>{member.email}</p>
                                <p className="text-xs" style={{ color: P.default, fontWeight: 600 }}>
                                  Jugador · #{member.jerseyNumber}
                                </p>
                              </div>
                              <button
                                onClick={() => setInvited((prev) => prev.filter((e) => e.email !== member.email))}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors duration-150 flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" style={{ color: P.default }} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {invited.length === 0 && (
                      <div
                        className="flex flex-col items-center py-6 rounded-2xl border-2 border-dashed"
                        style={{ borderColor: "#E9ECEF" }}
                      >
                        <Users className="w-8 h-8 mb-2" style={{ color: P.default }} />
                          <p className="text-sm" style={{ color: P.default, fontWeight: 500 }}>
                          Aún no has invitado a nadie
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#CED4DA", fontWeight: 500 }}>
                            Necesitas mínimo 7 integrantes incluyendo al capitán
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setStep(1)}
                        className="flex-none px-5 py-3.5 rounded-2xl border border-black/8 text-sm"
                        style={{ fontWeight: 600, color: "#6C757D" }}
                      >
                        ← Atrás
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm"
                        style={{
                          backgroundColor: P.primary,
                          fontWeight: 700,
                          boxShadow: `0 8px 24px ${P.primary}35`,
                        }}
                      >
                        <Send className="w-4 h-4" />
                        Confirmar inscripción
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Feedback toast ────────────────────────────────
function Toast({ msg, color }: { msg: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 48, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl"
      style={{ backgroundColor: color, boxShadow: `0 12px 40px ${color}50` }}
    >
      {color === P.success ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
      <span className="text-sm whitespace-nowrap" style={{ fontWeight: 700 }}>
        {msg}
      </span>
    </motion.div>
  );
}

function TeamScoreModal({
  teamName,
  performance,
  onClose,
}: {
  teamName: string;
  performance: TeamPerformance;
  onClose: () => void;
}) {
  const totalGoals = performance.members.reduce((sum, member) => sum + member.goals, 0);
  const totalYellow = performance.members.reduce((sum, member) => sum + member.yellowCards, 0);
  const totalRed = performance.members.reduce((sum, member) => sum + member.redCards, 0);
  const totalCorners = performance.members.reduce((sum, member) => sum + member.corners, 0);
  const totalFouls = performance.members.reduce((sum, member) => sum + member.fouls, 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[82] bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed inset-0 z-[83] flex items-center justify-center px-4 sm:px-6 pointer-events-none"
      >
        <div
          className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden pointer-events-auto"
          style={{ boxShadow: "0 28px 80px rgba(0,0,0,0.18)", maxHeight: "88vh" }}
        >
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${P.primary}, ${P.info})` }} />
          <div className="p-5 sm:p-6 border-b border-black/8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: P.info, fontWeight: 700 }}>
                Estadísticas del equipo
              </p>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: P.textPrimary }}>{teamName}</h3>
              <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 600 }}>
                Total de puntos del equipo: {performance.totalPoints}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#F8F9FA]"
            >
              <X className="w-4 h-4" style={{ color: P.default }} />
            </button>
          </div>

          <div className="px-5 sm:px-6 py-4 overflow-auto" style={{ maxHeight: "58vh" }}>
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-black/8">
                  <th className="text-left py-2 text-xs" style={{ color: P.default, fontWeight: 700 }}>Integrante</th>
                  <th className="text-center py-2 text-xs" style={{ color: P.default, fontWeight: 700 }}>Goles</th>
                  <th className="text-center py-2 text-xs" style={{ color: P.default, fontWeight: 700 }}>Amarillas</th>
                  <th className="text-center py-2 text-xs" style={{ color: P.default, fontWeight: 700 }}>Rojas</th>
                  <th className="text-center py-2 text-xs" style={{ color: P.default, fontWeight: 700 }}>Tiros de esquina</th>
                  <th className="text-center py-2 text-xs" style={{ color: P.default, fontWeight: 700 }}>Faltas</th>
                </tr>
              </thead>
              <tbody>
                {performance.members.map((member) => (
                  <tr key={member.id} className="border-b border-black/6">
                    <td className="py-3">
                      <p style={{ fontWeight: 700, color: P.textPrimary, fontSize: "0.9rem" }}>{member.name}</p>
                      <p style={{ fontWeight: 600, color: P.default, fontSize: "0.72rem" }}>{member.role}</p>
                    </td>
                    <td className="text-center py-3" style={{ fontWeight: 700 }}>{member.goals}</td>
                    <td className="text-center py-3" style={{ fontWeight: 700 }}>{member.yellowCards}</td>
                    <td className="text-center py-3" style={{ fontWeight: 700 }}>{member.redCards}</td>
                    <td className="text-center py-3" style={{ fontWeight: 700 }}>{member.corners}</td>
                    <td className="text-center py-3" style={{ fontWeight: 700 }}>{member.fouls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-black/8 bg-[#FAFAFA] grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="rounded-xl px-3 py-2" style={{ backgroundColor: `${P.info}10` }}>
              <p className="text-[11px]" style={{ color: P.default, fontWeight: 700 }}>Goles</p>
              <p style={{ fontWeight: 800, color: P.info }}>{totalGoals}</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ backgroundColor: `${P.secondary}10` }}>
              <p className="text-[11px]" style={{ color: P.default, fontWeight: 700 }}>Amarillas</p>
              <p style={{ fontWeight: 800, color: P.secondary }}>{totalYellow}</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ backgroundColor: `${P.primary}10` }}>
              <p className="text-[11px]" style={{ color: P.default, fontWeight: 700 }}>Rojas</p>
              <p style={{ fontWeight: 800, color: P.primary }}>{totalRed}</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
              <p className="text-[11px]" style={{ color: P.default, fontWeight: 700 }}>Esquinas</p>
              <p style={{ fontWeight: 800, color: P.textPrimary }}>{totalCorners}</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
              <p className="text-[11px]" style={{ color: P.default, fontWeight: 700 }}>Faltas</p>
              <p style={{ fontWeight: 800, color: P.textPrimary }}>{totalFouls}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Dashboard ─────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();

  const loadStoredTeamContext = () => {
    return readUICache<StoredTeamContext | null>(TEAM_CONTEXT_STORAGE_KEY, null);
  };

  const storedTeamContext = loadStoredTeamContext();

  // Logout
  const [showLogout, setShowLogout] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<Notification[]>(() => readUICache<Notification[]>(TEAM_NOTIFS_STORAGE_KEY, initialNotifs));
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Inscription
  const [showInscription, setShowInscription] = useState(false);
  const [roleInTeam, setRoleInTeam] = useState<RoleType | null>(storedTeamContext?.roleInTeam ?? null);
  const [teamStatus, setTeamStatus] = useState<TeamStatus>(storedTeamContext?.teamStatus ?? "draft");
  const [teamName, setTeamName] = useState(storedTeamContext?.teamName ?? "");
  const [joinedAt, setJoinedAt] = useState<string | null>(storedTeamContext?.joinedAt ?? null);
  const [teamSchedule, setTeamSchedule] = useState<TeamScheduleItem[]>(storedTeamContext?.teamSchedule ?? []);
  const [teamMembers, setTeamMembers] = useState<TeamRosterMember[]>(storedTeamContext?.teamMembers ?? []);
  const [showTeamScore, setShowTeamScore] = useState(false);

  const isRegistered = Boolean(roleInTeam && teamName);
  const hasUploadedPayment = notifs.some((n) => n.type === "payment" && n.status === "uploaded");
  const teamPerformance = roleInTeam && teamMembers.length > 0 ? createTeamPerformance(teamMembers) : null;

  const persistTeamContext = (nextContext: StoredTeamContext) => {
    writeUICache(TEAM_CONTEXT_STORAGE_KEY, nextContext);
  };

  useEffect(() => {
    persistTeamContext({
      roleInTeam: roleInTeam ?? undefined,
      teamStatus,
      teamName,
      teamMembers,
      joinedAt,
      teamSchedule,
    });
  }, [roleInTeam, teamStatus, teamName, teamMembers, joinedAt, teamSchedule]);

  const ensurePaymentNotification = () => {
    setNotifs((prev) => {
      const hasPayment = prev.some((n) => n.type === "payment");
      if (hasPayment) return prev;
      return [
        {
          id: Date.now(),
          type: "payment",
          team: "TECHCUP 2026",
          captain: "Organización",
          time: "Hace un momento",
          status: "pending",
          read: false,
        },
        ...prev,
      ];
    });
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    writeUICache(TEAM_NOTIFS_STORAGE_KEY, notifs);
  }, [notifs]);

  useEffect(() => {
    if (!isRegistered) return;
    if (teamStatus !== "pending-payment") return;

    const hasPaymentNotif = notifs.some((n) => n.type === "payment");
    if (!hasPaymentNotif) {
      ensurePaymentNotification();
    }
  }, [isRegistered, teamStatus, notifs]);

  // Close panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const showToast = (msg: string, color: string) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2800);
  };

  const handleMarkRead = (id: number) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    setShowLogout(false);
    sessionStorage.removeItem("userContext");
    removeUICache(TEAM_CONTEXT_STORAGE_KEY);
    removeUICache(TEAM_NOTIFS_STORAGE_KEY);
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
          {/* Logo */}
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
            style={{ backgroundColor: "rgba(134,194,245,0.14)", border: "1px solid rgba(134,194,245,0.48)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: USER_ACCENT }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: USER_ACCENT, textTransform: "uppercase" }}>
              Usuario
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{ background: notifOpen ? "rgba(184,28,28,0.08)" : "transparent" }}
              >
                <Bell style={{ width: 19, height: 19, color: notifOpen ? P.primary : P.default }} />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border-2"
                    style={{ backgroundColor: P.primary, fontSize: 9, fontWeight: 800, borderColor: P.bg }}
                  >
                    {unreadCount}
                  </motion.div>
                )}
              </motion.button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    {/* Backdrop móvil */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setNotifOpen(false)}
                      className="sm:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />
                    <NotifPanel
                      notifs={notifs}
                      onClose={() => setNotifOpen(false)}
                      onSelectNotif={(n) => {
                        if (!isRegistered) {
                          setNotifOpen(false);
                          showToast("Debes estar inscrito en el torneo para subir comprobante", P.secondary);
                          return;
                        }
                        setSelectedNotif(n);
                        setNotifOpen(false);
                      }}
                      onMarkRead={handleMarkRead}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowLogout(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(184,28,28,0.07)]"
            >
              <LogOut style={{ width: 17, height: 17, color: P.default }} />
            </motion.button>

            {/* Profile */}
            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{ background: "rgba(134,194,245,0.16)", border: "1.5px solid rgba(134,194,245,0.45)" }}
              >
                <User style={{ width: 16, height: 16, color: USER_ACCENT }} />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Payment modal ── */}
      <AnimatePresence>
        {selectedNotif && (
          <PaymentModal
            onClose={() => setSelectedNotif(null)}
            onSuccess={() => {
              setNotifs((prev) =>
                prev.map((n) =>
                  n.id === selectedNotif!.id ? { ...n, status: "uploaded", read: true } : n
                )
              );
              setTeamStatus("in-review");
              setSelectedNotif(null);
              showToast("¡Comprobante enviado correctamente!", P.success);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Inscription modal ── */}
      <AnimatePresence>
        {showInscription && (
          <InscriptionModal
            onClose={() => setShowInscription(false)}
            onSuccess={({ teamName: createdTeamName, members }) => {
              setRoleInTeam("capitan");
              setTeamStatus("pending-payment");
              setTeamName(createdTeamName);
              setTeamMembers(members);
              setJoinedAt("2026-03-15");
              setTeamSchedule(createTeamSchedule(createdTeamName));
              ensurePaymentNotification();
              showToast("¡Equipo inscrito exitosamente en TECHCUP!", P.success);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTeamScore && isRegistered && teamPerformance && (
          <TeamScoreModal
            teamName={teamName}
            performance={teamPerformance}
            onClose={() => setShowTeamScore(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Logout modal ── */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              <div
                className="bg-white rounded-[24px] p-8 max-w-sm w-full pointer-events-auto"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                  style={{ backgroundColor: `${P.primary}10` }}
                >
                  <LogOut className="w-7 h-7" style={{ color: P.primary }} />
                </div>
                <h2 className="text-xl text-black text-center mb-2" style={{ fontWeight: 700 }}>
                  ¿Cerrar sesión?
                </h2>
                <p className="text-sm text-center mb-8" style={{ color: P.default, fontWeight: 500 }}>
                  Tu sesión en TECHCUP se cerrará. Podrás volver a ingresar cuando quieras.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowLogout(false)}
                    className="flex-1 py-3 rounded-xl border border-black/8 text-sm"
                    style={{ fontWeight: 600, color: "#6C757D" }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
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

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} color={toast.color} />}
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
            background: "linear-gradient(160deg, #2F7EC3 0%, #5DA9E9 45%, #86C2F5 100%)",
            boxShadow: "0 8px 32px rgba(134,194,245,0.34)",
          }}
        >
          {/* Dot-grid texture */}
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          {/* Fade bottom edge to bg */}
          <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: "linear-gradient(to bottom, transparent, rgba(47,126,195,0.35))" }} />
          {/* Red shimmer */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-[0.18]" style={{ background: USER_ACCENT, transform: "translate(40%,-40%)" }} />

          <div className="relative z-10 px-8 py-9 sm:py-11">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
              style={{ background: "rgba(134,194,245,0.26)", border: "1px solid rgba(134,194,245,0.65)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: USER_ACCENT }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", color: USER_ACCENT, textTransform: "uppercase" }}>
                Panel Principal · TECHCUP 2026
              </span>
            </div>
            <h1
              className="text-white mb-2.5"
              style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.3rem)", fontWeight: 800, lineHeight: 1.13, letterSpacing: "-0.03em" }}
            >
              ¡Bienvenido al torneo! 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400, fontSize: "0.92rem", lineHeight: 1.7, maxWidth: "32ch" }}>
              Explora partidos, posiciones y toda la información del torneo desde aquí.
            </p>
          </div>
        </motion.div>

        {/* ── Section label: Explora ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: P.secondary }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", color: P.secondary, textTransform: "uppercase" }}>
            Explora el Torneo
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(196,132,29,0.25), transparent)" }} />
        </motion.div>

        {/* ── 4 Nav Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {navButtons.map((btn, index) => {
            const Icon = btn.icon;
            return (
              <Link key={btn.path} to={btn.path} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + index * 0.07, duration: 0.45, ease: "easeOut" }}
                  whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
                  whileTap={{ scale: 0.985 }}
                  className="group relative flex items-center gap-4 px-5 py-5 rounded-[20px] cursor-pointer bg-white overflow-hidden transition-all duration-300 h-full"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  {/* Color wash on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: btn.hoverAccent }}
                  />
                  {/* Left accent bar on hover */}
                  <div
                    className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ backgroundColor: btn.color }}
                  />

                  {/* Icon */}
                  <div
                    className="relative z-10 flex items-center justify-center flex-shrink-0 rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: btn.iconBg,
                      width: "3.25rem",
                      height: "3.25rem",
                      boxShadow: `0 4px 14px ${btn.iconGlow}`,
                    }}
                  >
                    <Icon style={{ width: 22, height: 22, color: btn.color }} />
                  </div>

                  {/* Text */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <p className="leading-snug" style={{ fontWeight: 700, color: P.textPrimary, fontSize: "0.9rem" }}>
                      {btn.label}
                    </p>
                    <p className="mt-1" style={{ fontSize: "0.79rem", color: P.default, fontWeight: 400, lineHeight: 1.45 }}>
                      {btn.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div
                    className="relative z-10 flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: btn.iconBg }}
                  >
                    <ChevronRight
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                      style={{ width: 15, height: 15, color: btn.color }}
                    />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* ── Section label: Mi equipo ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.50, duration: 0.4 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: P.primary }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", color: P.primary, textTransform: "uppercase" }}>
            Mi Equipo
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(184,28,28,0.2), transparent)" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.4 }}
          className="bg-white rounded-[20px] p-5 mb-6"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {!isRegistered ? (
            <p style={{ fontSize: "0.84rem", color: P.default, fontWeight: 500 }}>
              Aún no perteneces a un equipo. Inscribe tu equipo para ver información del grupo y fechas de juego.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p style={{ fontSize: "0.92rem", fontWeight: 700, color: P.textPrimary }}>{teamName}</p>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: P.default }}>
                    Rol: {roleInTeam === "capitan" ? "Capitán" : "Jugador"} · Inscrito: {joinedAt}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: "transparent",
                      color: hasUploadedPayment ? P.success : P.secondary,
                      fontWeight: 700,
                    }}
                  >
                    {hasUploadedPayment ? "Pago enviado" : "Pago pendiente"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/dashboard/team-setup", {
                      state: {
                        teamName,
                        teamMembers,
                        teamSchedule,
                        roleInTeam,
                        teamStatus: teamStatus === "draft" ? "pending-payment" : teamStatus,
                      },
                    })
                  }
                  className="text-sm px-6 py-3 rounded-2xl border transition-all duration-200"
                  style={{
                    backgroundColor: "white",
                    borderColor: `${P.secondary}45`,
                    color: P.secondary,
                    fontWeight: 800,
                    minWidth: "190px",
                    boxShadow: `0 8px 22px ${P.secondary}26`,
                  }}
                >
                  {teamStatus === "pending-payment" ? "Configurar equipo" : "Ver configuración"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowTeamScore(true)}
                  className="text-sm px-6 py-3 rounded-2xl border transition-all duration-200"
                  style={{
                    backgroundColor: "white",
                    borderColor: `${P.info}45`,
                    color: P.info,
                    fontWeight: 800,
                    minWidth: "170px",
                    boxShadow: `0 8px 22px ${P.info}26`,
                  }}
                >
                  Puntuación
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* ── Section label: Únete ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.53, duration: 0.4 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: P.primary }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", color: P.primary, textTransform: "uppercase" }}>
            Únete al Torneo
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(184,28,28,0.2), transparent)" }} />
        </motion.div>

        {/* ── CTA ── */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54, duration: 0.45 }}
          whileHover={{ y: -4, boxShadow: "0 16px 44px rgba(196,132,29,0.30)" }}
          whileTap={{ scale: 0.990 }}
          onClick={() => !isRegistered && setShowInscription(true)}
          className="w-full flex items-center gap-4 bg-white rounded-[20px] px-5 py-5 cursor-pointer text-left relative overflow-hidden transition-all duration-300"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", opacity: isRegistered ? 0.7 : 1 }}
        >
          {/* Left gold stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[20px]" style={{ background: "linear-gradient(to bottom, #C4841D, #A86A14)" }} />

          {/* Icon */}
          <div
            className="relative z-10 flex items-center justify-center flex-shrink-0 rounded-2xl"
            style={{
              backgroundColor: "rgba(196,132,29,0.10)",
              width: "3.25rem",
              height: "3.25rem",
              boxShadow: "0 4px 14px rgba(196,132,29,0.18)",
            }}
          >
            <ClipboardList style={{ width: 22, height: 22, color: P.secondary }} />
          </div>

          {/* Text */}
          <div className="relative z-10 flex-1 min-w-0">
            <p className="leading-snug" style={{ fontWeight: 700, color: P.textPrimary, fontSize: "0.9rem" }}>
              Inscripción al Torneo
            </p>
            <p className="mt-1" style={{ fontSize: "0.79rem", color: P.default, fontWeight: 400, lineHeight: 1.45 }}>
              {isRegistered
                ? "Ya estás inscrito en un equipo para este torneo"
                : "Crea tu equipo e invita a tus compañeros"}
            </p>
          </div>

          {/* Badge */}
          <div
            className="relative z-10 flex-shrink-0 px-3.5 py-1.5 rounded-full hidden sm:flex items-center"
            style={{ background: "rgba(196,132,29,0.10)", border: "1px solid rgba(196,132,29,0.28)" }}
          >
            <span style={{ fontSize: "0.73rem", fontWeight: 700, color: P.secondary }}>
              {isRegistered ? "Inscrito" : "Inscribirme"}
            </span>
          </div>

          {/* Arrow */}
          <div
            className="relative z-10 flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(196,132,29,0.10)" }}
          >
            <ChevronRight style={{ width: 15, height: 15, color: P.secondary }} />
          </div>
        </motion.button>

      </main>
    </div>
  );
}


