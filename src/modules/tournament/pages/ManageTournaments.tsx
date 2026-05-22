
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import logoTechcup from "@/assets/logo.png";
import { tournamentService, type TournamentDto } from "../services/tournamentService";
import { useAuth } from "@/core/auth/AuthContext";
import {
  User,
  LogOut,
  ChevronLeft,
  Trophy,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Calendar,
  Clock,
  Save,
  X,
  Play,
  Zap,
  Flag,
  FileText,
  MapPin,
  Plus,
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

// ── Types — se reusan los del servicio ────────────
type TournamentStatus = TournamentDto["status"];
type Court = TournamentDto["courts"][number];
type Tournament = TournamentDto;

// ── Helpers ───────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const canActivate = (t: Tournament) =>
  t.status === "draft" && t.startDate > today();

const canStart = (t: Tournament) =>
  t.status === "active" && t.startDate === today();

const canFinish = (t: Tournament) =>
  t.status === "in_progress" && t.endDate >= today();

const canDelete = (t: Tournament) => t.status === "draft";

const canEdit = (t: Tournament) => t.status === "draft";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ── Status config ─────────────────────────────────
const STATUS_CONFIG: Record<
  TournamentStatus,
  { label: string; color: string; bg: string }
> = {
  draft:       { label: "Borrador",    color: P.default,   bg: `${P.default}18` },
  active:      { label: "Activo",      color: P.info,      bg: `${P.info}18` },
  in_progress: { label: "En Progreso", color: P.success,   bg: `${P.success}18` },
  finished:    { label: "Finalizado",  color: P.primary,   bg: `${P.primary}18` },
};

const STATUS_ORDER: TournamentStatus[] = ["draft", "active", "in_progress", "finished"];

// ── Component ─────────────────────────────────────
export function ManageTournaments() {
  const navigate = useNavigate();
  const { accountId } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Tournament | null>(null);
  const [originalEditForm, setOriginalEditForm] = useState<Tournament | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [pendingRegFile, setPendingRegFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTournaments = () => {
    setLoading(true);
    const fetch = accountId
      ? tournamentService.listByOrganizer(accountId)
      : tournamentService.list();
    fetch
      .then(setTournaments)
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTournaments(); }, []);

  // ── Status transitions ──
  const handleActivate = async (id: number) => {
    const t = tournaments.find((x) => x.id === id);
    if (!t || !canActivate(t)) return;
    if (!window.confirm(`¿Activar el torneo "${t.name}"? La fecha de inicio debe ser posterior a hoy.`)) return;
    try {
      const updated = await tournamentService.activate(id);
      setTournaments((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch { window.alert("Error al activar el torneo."); }
  };

  const handleStart = async (id: number) => {
    const t = tournaments.find((x) => x.id === id);
    if (!t || !canStart(t)) return;
    if (!window.confirm(`¿Iniciar el torneo "${t.name}"? Esto lo cambiará a En Progreso.`)) return;
    try {
      const updated = await tournamentService.start(id);
      setTournaments((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch { window.alert("Error al iniciar el torneo."); }
  };

  const handleFinish = async (id: number) => {
    const t = tournaments.find((x) => x.id === id);
    if (!t || !canFinish(t)) return;
    if (!window.confirm(`¿Finalizar el torneo "${t.name}"?`)) return;
    try {
      const updated = await tournamentService.finish(id);
      setTournaments((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch { window.alert("Error al finalizar el torneo."); }
  };

  const handleDelete = async (id: number) => {
    const t = tournaments.find((x) => x.id === id);
    if (!t || !canDelete(t)) return;
    if (!window.confirm(`¿Eliminar el torneo "${t.name}"? Solo se pueden eliminar torneos en estado Borrador. Esta acción no se puede deshacer.`)) return;
    try {
      await tournamentService.delete(id);
      setTournaments((prev) => prev.filter((x) => x.id !== id));
    } catch { window.alert("Error al eliminar el torneo."); }
  };

  // ── Edit modal ──
  const handleOpenEdit = (tournament: Tournament) => {
    if (!canEdit(tournament)) return;
    setEditForm({ ...tournament, courts: tournament.courts.map((c) => ({ ...c })) });
    setOriginalEditForm({ ...tournament, courts: tournament.courts.map((c) => ({ ...c })) });
    setPendingRegFile(null);
    setEditErrors({});
    setShowEditModal(true);
  };

  const validateEdit = (): boolean => {
    if (!editForm) return false;
    const errs: Record<string, string> = {};
    if (!editForm.name.trim()) errs.name = "El nombre es obligatorio";
    if (!editForm.startDate) errs.startDate = "Fecha de inicio obligatoria";
    if (!editForm.endDate) errs.endDate = "Fecha de fin obligatoria";
    if (!editForm.registrationCloseDate)
      errs.registrationCloseDate = "Fecha de cierre de inscripciones obligatoria";
    if (editForm.startDate && editForm.endDate && editForm.endDate < editForm.startDate)
      errs.endDate = "La fecha de fin no puede ser anterior al inicio";
    if (
      editForm.registrationCloseDate &&
      editForm.startDate &&
      editForm.registrationCloseDate >= editForm.startDate
    )
      errs.registrationCloseDate =
        "El cierre de inscripciones debe ser anterior a la fecha de inicio";
    if ((editForm.maxTeams ?? 0) < 2) errs.maxTeams = "Mínimo 2 equipos";
    if ((editForm.costPerTeam ?? 0) < 0) errs.costPerTeam = "El costo no puede ser negativo";
    if ((editForm.courts ?? []).some((c) => !c.name.trim()))
      errs.courts = "Todas las canchas deben tener nombre";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!editForm || !validateEdit()) return;
    if (!window.confirm("¿Guardar los cambios del torneo?")) return;
    try {
      let regulationFileName = editForm.regulationFileName;
      if (pendingRegFile) {
        const { fileName } = await tournamentService.uploadRegulation(pendingRegFile);
        regulationFileName = fileName;
      }
      const updated = await tournamentService.update(editForm.id, {
        name: editForm.name,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        registrationCloseDate: editForm.registrationCloseDate,
        maxTeams: editForm.maxTeams,
        costPerTeam: editForm.costPerTeam,
        courtIds: editForm.courts.map((c) => c.id),
        regulationPdfUrl: regulationFileName ?? null,
      });
      setTournaments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setShowEditModal(false);
      setEditForm(null);
      setOriginalEditForm(null);
      setPendingRegFile(null);
      window.alert("Cambios guardados correctamente.");
    } catch { window.alert("Error al guardar los cambios."); }
  };

  const handleDiscard = () => {
    if (!editForm) { setShowEditModal(false); return; }
    const hasChanges =
      JSON.stringify(editForm) !== JSON.stringify(originalEditForm) ||
      pendingRegFile !== null;
    if (hasChanges && !window.confirm("¿Descartar los cambios del torneo?")) return;
    setShowEditModal(false);
    setEditForm(null);
    setOriginalEditForm(null);
    setPendingRegFile(null);
  };

  // ── Courts helpers ──
  const addCourt = () => {
    if (!editForm) return;
    const newId = Math.max(0, ...editForm.courts.map((c) => c.id)) + 1;
    setEditForm({
      ...editForm,
      courts: [...editForm.courts, { id: newId, name: "", description: "" }],
    });
  };

  const removeCourt = (courtId: number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      courts: editForm.courts.filter((c) => c.id !== courtId),
    });
  };

  const updateCourt = (
    courtId: number,
    field: keyof Omit<Court, "id">,
    value: string
  ) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      courts: editForm.courts.map((c) =>
        c.id === courtId ? { ...c, [field]: value } : c
      ),
    });
  };

  const handleLogout = () => {
    setShowLogout(false);
    sessionStorage.removeItem("userContext");
    navigate("/login");
  };

  // ── Status pipeline visual ──
  const StatusPipeline = ({ status }: { status: TournamentStatus }) => (
    <div
      className="flex items-center gap-1.5 mb-5 px-4 py-3 rounded-xl"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      {STATUS_ORDER.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        const isActive = s === status;
        const isPast = STATUS_ORDER.indexOf(status) > i;
        return (
          <div key={s} className="flex items-center gap-1.5 flex-1 min-w-0">
            <div
              className="flex items-center gap-1.5"
              style={{ opacity: isActive || isPast ? 1 : 0.35 }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              <span
                className="text-xs font-semibold whitespace-nowrap"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div
                className="flex-1 h-px mx-1"
                style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Render ──
  return (
    <div className="min-h-screen pb-28 lg:pb-0" style={{ backgroundColor: P.bg }}>
      {/* Header */}
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
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <img src={logoTechcup} alt="TECHCUP Logo" className="w-8 h-8 object-contain" />
              <div>
                <span
                  className="block leading-none"
                  style={{
                    fontWeight: 800,
                    color: P.primary,
                    fontSize: "1.05rem",
                    letterSpacing: "-0.03em",
                  }}
                >
                  TECHCUP
                </span>
                <span
                  className="block mt-0.5"
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.18em",
                    fontWeight: 600,
                    color: P.secondary,
                    textTransform: "uppercase",
                  }}
                >
                  Torneo 2026
                </span>
              </div>
            </motion.div>
          </Link>

          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${P.success}12`,
              border: `1px solid ${P.success}30`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: P.success }} />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: P.success,
                textTransform: "uppercase",
              }}
            >
              Organizador
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowLogout(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(184,28,28,0.07)]"
            >
              <LogOut style={{ width: 17, height: 17, color: P.default }} />
            </motion.button>
            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: `${P.success}18`,
                  border: `1.5px solid ${P.success}30`,
                }}
              >
                <User style={{ width: 16, height: 16, color: P.success }} />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-8 pb-16">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/dashboard-organizer")}
          className="flex items-center gap-2 mb-6 text-sm group"
          style={{ color: P.default, fontWeight: 600 }}
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver al Dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h1
            className="text-3xl mb-2"
            style={{ fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.02em" }}
          >
            Gestión de Torneos
          </h1>
          <p style={{ color: P.default, fontSize: "0.95rem", fontWeight: 500 }}>
            Administra, activa y gestiona todos los torneos creados
          </p>
        </motion.div>

        {/* Tournament list */}
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <p style={{ color: P.default, fontSize: "0.9rem", fontWeight: 500 }}>Cargando torneos...</p>
            </div>
          )}
          {!loading && tournaments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 rounded-2xl" style={{ backgroundColor: `${P.default}10` }}>
              <Trophy style={{ width: 32, height: 32, color: P.default, opacity: 0.5 }} />
              <p style={{ color: P.default, fontSize: "0.9rem", fontWeight: 500 }}>No hay torneos creados aún.</p>
            </div>
          )}
          {tournaments.map((tournament, idx) => {
            const statusCfg = STATUS_CONFIG[tournament.status];
            return (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
                className="bg-white rounded-2xl p-6 border"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-lg"
                        style={{ fontWeight: 700, color: P.textPrimary }}
                      >
                        {tournament.name}
                      </h3>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.color,
                          fontWeight: 700,
                        }}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <p
                        className="text-sm flex items-center gap-1"
                        style={{ color: P.default, fontWeight: 500 }}
                      >
                        <Calendar style={{ width: 13, height: 13 }} />
                        {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
                      </p>
                      <p
                        className="text-sm flex items-center gap-1"
                        style={{ color: P.default, fontWeight: 500 }}
                      >
                        <Clock style={{ width: 13, height: 13 }} />
                        Cierre insc.: {formatDate(tournament.registrationCloseDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status pipeline */}
                <StatusPipeline status={tournament.status} />

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4" style={{ color: P.info }} />
                      <span
                        className="text-xs"
                        style={{ color: P.default, fontWeight: 600 }}
                      >
                        Equipos aprobados
                      </span>
                    </div>
                    <p
                      className="text-xl"
                      style={{ fontWeight: 700, color: P.textPrimary }}
                    >
                      {tournament.approvedTeams}
                      <span
                        className="text-sm ml-1"
                        style={{ color: P.default, fontWeight: 500 }}
                      >
                        / {tournament.maxTeams}
                      </span>
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" style={{ color: P.success }} />
                      <span
                        className="text-xs"
                        style={{ color: P.default, fontWeight: 600 }}
                      >
                        Costo por equipo
                      </span>
                    </div>
                    <p className="text-sm" style={{ fontWeight: 700, color: P.textPrimary }}>
                      {formatCurrency(tournament.costPerTeam)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" style={{ color: P.secondary }} />
                      <span
                        className="text-xs"
                        style={{ color: P.default, fontWeight: 600 }}
                      >
                        Ingresos
                      </span>
                    </div>
                    <p className="text-sm" style={{ fontWeight: 700, color: P.textPrimary }}>
                      {formatCurrency(tournament.totalRevenue)}
                    </p>
                  </div>
                </div>

                {/* Courts + regulation */}
                <div className="flex flex-wrap gap-3 mb-5">
                  {tournament.courts.length > 0 && (
                    <div className="flex-1 min-w-[180px]">
                      <p
                        style={{
                          fontSize: "0.68rem",
                          color: P.default,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 6,
                        }}
                      >
                        Canchas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tournament.courts.map((c) => (
                          <span
                            key={c.id}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                            style={{
                              background: `${P.info}10`,
                              color: P.info,
                              fontWeight: 600,
                            }}
                            title={c.description}
                          >
                            <MapPin style={{ width: 11, height: 11 }} />
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tournament.regulationFileName && (
                    <div>
                      <p
                        style={{
                          fontSize: "0.68rem",
                          color: P.default,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 6,
                        }}
                      >
                        Reglamento
                      </p>
                      <button
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                        style={{
                          background: `${P.secondary}12`,
                          color: P.secondary,
                          fontWeight: 600,
                        }}
                      >
                        <FileText style={{ width: 13, height: 13 }} />
                        Ver PDF
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {/* Ver torneo — siempre disponible */}
                  <Link
                    to={`/organizer/tournaments/${tournament.id}`}
                    className="flex-1 min-w-[140px]"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
                      style={{ backgroundColor: P.success, fontWeight: 600 }}
                    >
                      <Eye className="w-4 h-4" />
                      Ver Torneo
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </Link>

                  {/* Activar: solo si draft y fechaInicio > hoy */}
                  {canActivate(tournament) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleActivate(tournament.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm"
                      style={{ backgroundColor: P.info, fontWeight: 600 }}
                      title="Activar torneo (fecha inicio debe ser posterior a hoy)"
                    >
                      <Play className="w-4 h-4" />
                      Activar
                    </motion.button>
                  )}

                  {/* Iniciar: solo si active y fechaInicio == hoy */}
                  {canStart(tournament) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStart(tournament.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm"
                      style={{ backgroundColor: P.secondary, fontWeight: 600 }}
                      title="Iniciar torneo (solo si hoy es la fecha de inicio)"
                    >
                      <Zap className="w-4 h-4" />
                      Iniciar
                    </motion.button>
                  )}

                  {/* Finalizar: solo si in_progress y fechaFin >= hoy */}
                  {canFinish(tournament) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFinish(tournament.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm"
                      style={{ backgroundColor: P.primary, fontWeight: 600 }}
                      title="Finalizar torneo"
                    >
                      <Flag className="w-4 h-4" />
                      Finalizar
                    </motion.button>
                  )}

                  {/* Editar: solo en draft */}
                  {canEdit(tournament) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOpenEdit(tournament)}
                      className="px-4 py-2.5 rounded-xl text-sm border"
                      style={{
                        borderColor: "rgba(0,0,0,0.08)",
                        color: P.default,
                        fontWeight: 600,
                      }}
                      title="Editar torneo (solo disponible en estado Borrador)"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                  )}

                  {/* Eliminar: solo en draft */}
                  {canDelete(tournament) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(tournament.id)}
                      className="px-4 py-2.5 rounded-xl text-sm border"
                      style={{
                        borderColor: "rgba(184,28,28,0.2)",
                        color: P.primary,
                        fontWeight: 600,
                      }}
                      title="Eliminar torneo (solo disponible en estado Borrador)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {tournaments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <Trophy
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: P.default, opacity: 0.3 }}
            />
            <p
              className="text-lg mb-2"
              style={{ fontWeight: 600, color: P.textPrimary }}
            >
              No hay torneos creados
            </p>
            <p className="text-sm" style={{ color: P.default }}>
              Crea tu primer torneo desde el dashboard
            </p>
          </motion.div>
        )}
      </main>

      {/* ── Edit Tournament Modal ── */}
      <AnimatePresence>
        {showEditModal && editForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDiscard}
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
                className="bg-white rounded-[24px] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-black" style={{ fontWeight: 700 }}>
                    Editar Torneo
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDiscard}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
                  >
                    <X className="w-5 h-5" style={{ color: P.default }} />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  {/* Nombre */}
                  <div>
                    <label
                      className="block text-sm mb-2"
                      style={{ fontWeight: 600, color: P.textPrimary }}
                    >
                      Nombre del Torneo
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Ej: TechCup 2026-1"
                      className="w-full px-4 py-3 rounded-xl border border-black/8 text-sm"
                      style={{ color: P.textPrimary, fontWeight: 500 }}
                    />
                    {editErrors.name && (
                      <p
                        className="mt-1 text-xs"
                        style={{ color: P.primary, fontWeight: 600 }}
                      >
                        {editErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ fontWeight: 600, color: P.textPrimary }}
                      >
                        Fecha Inicio
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: P.default }}
                        />
                        <input
                          type="date"
                          value={editForm.startDate}
                          onChange={(e) =>
                            setEditForm({ ...editForm, startDate: e.target.value })
                          }
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/8 text-sm"
                          style={{ color: P.textPrimary, fontWeight: 500 }}
                        />
                      </div>
                      {editErrors.startDate && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: P.primary, fontWeight: 600 }}
                        >
                          {editErrors.startDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ fontWeight: 600, color: P.textPrimary }}
                      >
                        Fecha Fin
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: P.default }}
                        />
                        <input
                          type="date"
                          value={editForm.endDate}
                          onChange={(e) =>
                            setEditForm({ ...editForm, endDate: e.target.value })
                          }
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/8 text-sm"
                          style={{ color: P.textPrimary, fontWeight: 500 }}
                        />
                      </div>
                      {editErrors.endDate && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: P.primary, fontWeight: 600 }}
                        >
                          {editErrors.endDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Fecha cierre de inscripciones */}
                  <div>
                    <label
                      className="block text-sm mb-2"
                      style={{ fontWeight: 600, color: P.textPrimary }}
                    >
                      Fecha Cierre de Inscripciones
                    </label>
                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                        style={{ color: P.default }}
                      />
                      <input
                        type="date"
                        value={editForm.registrationCloseDate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            registrationCloseDate: e.target.value,
                          })
                        }
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/8 text-sm"
                        style={{ color: P.textPrimary, fontWeight: 500 }}
                      />
                    </div>
                    {editErrors.registrationCloseDate && (
                      <p
                        className="mt-1 text-xs"
                        style={{ color: P.primary, fontWeight: 600 }}
                      >
                        {editErrors.registrationCloseDate}
                      </p>
                    )}
                  </div>

                  {/* Cantidad equipos + costo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ fontWeight: 600, color: P.textPrimary }}
                      >
                        Cantidad de Equipos
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="64"
                        value={editForm.maxTeams || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            maxTeams: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        placeholder="Ej: 16"
                        className="w-full px-4 py-3 rounded-xl border border-black/8 text-sm"
                        style={{ color: P.textPrimary, fontWeight: 500 }}
                      />
                      {editErrors.maxTeams && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: P.primary, fontWeight: 600 }}
                        >
                          {editErrors.maxTeams}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ fontWeight: 600, color: P.textPrimary }}
                      >
                        Costo por Equipo (COP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={editForm.costPerTeam || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            costPerTeam: Math.max(
                              0,
                              parseInt(e.target.value) || 0
                            ),
                          })
                        }
                        placeholder="Ej: 50000"
                        className="w-full px-4 py-3 rounded-xl border border-black/8 text-sm"
                        style={{ color: P.textPrimary, fontWeight: 500 }}
                      />
                      {editErrors.costPerTeam && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: P.primary, fontWeight: 600 }}
                        >
                          {editErrors.costPerTeam}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Canchas */}
                  <div>
                    <label
                      className="block text-sm mb-3"
                      style={{ fontWeight: 600, color: P.textPrimary }}
                    >
                      Canchas
                    </label>
                    <div className="space-y-2">
                      {editForm.courts.map((court) => (
                        <div key={court.id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={court.name}
                            onChange={(e) =>
                              updateCourt(court.id, "name", e.target.value)
                            }
                            placeholder="Nombre de la cancha"
                            className="flex-1 px-3 py-2.5 rounded-xl border border-black/8 text-sm"
                            style={{ color: P.textPrimary, fontWeight: 500 }}
                          />
                          <input
                            type="text"
                            value={court.description}
                            onChange={(e) =>
                              updateCourt(court.id, "description", e.target.value)
                            }
                            placeholder="Descripción (opcional)"
                            className="flex-[2] px-3 py-2.5 rounded-xl border border-black/8 text-sm"
                            style={{ color: P.textPrimary, fontWeight: 500 }}
                          />
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeCourt(court.id)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `${P.primary}10`,
                              color: P.primary,
                            }}
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                    {editErrors.courts && (
                      <p
                        className="mt-1 text-xs"
                        style={{ color: P.primary, fontWeight: 600 }}
                      >
                        {editErrors.courts}
                      </p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addCourt}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                      style={{
                        border: `1px dashed ${P.info}50`,
                        color: P.info,
                        fontWeight: 600,
                        background: "transparent",
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar cancha
                    </motion.button>
                  </div>

                  {/* Reglamento PDF */}
                  <div>
                    <label
                      className="block text-sm mb-2"
                      style={{ fontWeight: 600, color: P.textPrimary }}
                    >
                      Reglamento (PDF)
                    </label>
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer"
                      style={{
                        borderColor: "rgba(0,0,0,0.08)",
                        backgroundColor: "#FAFAFA",
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileText
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: P.secondary }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate"
                          style={{ fontWeight: 600, color: P.textPrimary }}
                        >
                          {pendingRegFile?.name ??
                            editForm.regulationFileName ??
                            "Sin reglamento cargado"}
                        </p>
                        <p className="text-xs" style={{ color: P.default }}>
                          {pendingRegFile
                            ? "Listo para guardar"
                            : "Haz clic para subir o reemplazar el PDF"}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0"
                        style={{
                          background: `${P.info}12`,
                          color: P.info,
                          fontWeight: 600,
                        }}
                      >
                        Cambiar
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setPendingRegFile(file);
                        if (file)
                          setEditForm({
                            ...editForm,
                            regulationFileName: file.name,
                          });
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDiscard}
                    className="flex-1 py-3 rounded-xl border border-black/8 text-sm"
                    style={{ fontWeight: 600, color: P.default }}
                  >
                    Descartar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="flex-1 py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: P.success, fontWeight: 600 }}
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Logout Modal ── */}
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
                <h2
                  className="text-xl text-black text-center mb-2"
                  style={{ fontWeight: 700 }}
                >
                  ¿Cerrar sesión?
                </h2>
                <p
                  className="text-sm text-center mb-8"
                  style={{ color: P.default, fontWeight: 500 }}
                >
                  Tu sesión en TECHCUP se cerrará. Podrás volver a ingresar
                  cuando quieras.
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
    </div>
  );
}
