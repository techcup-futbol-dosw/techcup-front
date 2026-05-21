/**
 * @file src/modules/tournament/pages/CreateTournament.tsx
 */
import { sanitizeFileName } from '@/core/utils/fileutils';
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { tournamentService, type CourtDto } from "../services/tournamentService";
import {
  ChevronLeft,
  Save,
  Users,
  Calendar,
  CalendarX,
  CalendarClock,
  Trophy,
  CheckCircle2,
  Info,
  FileText,
  UploadCloud,
  Loader,
  AlertCircle,
} from "lucide-react";

// ── Paleta de colores del proyecto ─────────────────────────────────────────
const P = {
  primary:     "#B81C1C",
  secondary:   "#C4841D",
  success:     "#17C964",
  info:        "#0066FE",
  default:     "#6E6E73",
  textPrimary: "#1C1C1E",
  bg:          "#F2F2F7",
  purple:      "#8B5CF6",
  orange:      "#F97316",
};

// ── Constantes de negocio ──────────────────────────────────────────────────
const MIN_TEAMS  = 2;
const PDF_BUCKET = "tournament-rules";

// ── Tipos ─────────────────────────────────────────────────────────────────
type Cancha = CourtDto;

interface FormData {
  nombreTorneo:             string;
  cantidadEquipos:          number;
  fechaInicio:              string;  
  fechaFin:                 string;  
  fechaCierreInscripciones: string; 
  costoPorEquipo:           number;
  canchasIds:               number[];
  reglamentoPdfUrl:         string | null;
}

/** Error tipado para validaciones de negocio de torneos */
class TournamentValidationError extends Error {
  field: string;
  constructor(message: string, field: string) {
    super(message);
    this.name  = "TournamentValidationError";
    this.field = field;
  }
}

// ── Componente principal ──────────────────────────────────────────────────
export function CreateTournament() {
  const navigate = useNavigate();

  // ── Form state ──
  const [formData, setFormData] = useState<FormData>({
    nombreTorneo:             "",
    cantidadEquipos:          16,
    fechaInicio:              "",
    fechaFin:                 "",
    fechaCierreInscripciones: "",
    costoPorEquipo:           50000,
    canchasIds:               [],
    reglamentoPdfUrl:         null,
  });

  // ── UI state ──
  const [errors,         setErrors]         = useState<Record<string, string>>({});
  const [inlineErrors,   setInlineErrors]   = useState<{ cantidadEquipos?: string; costoPorEquipo?: string }>({});
  const [saved,          setSaved]          = useState(false);
  const [uploadingPdf,   setUploadingPdf]   = useState(false);
  const [pdfFileName,    setPdfFileName]    = useState<string | null>(null);
  const [canchas,        setCanchas]        = useState<Cancha[]>([]);
  const [loadingCanchas, setLoadingCanchas] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Cargar canchas desde el API Gateway ───────────────────────────────
  useEffect(() => {
    tournamentService.getCourts()
      .then(setCanchas)
      .catch(() => setCanchas([]))
      .finally(() => setLoadingCanchas(false));
  }, []);

  // ── Handlers genéricos ────────────────────────────────────────────────
  const handleInputChange = (field: keyof FormData, value: unknown) => {
    const numericFields = new Set<keyof FormData>(["cantidadEquipos", "costoPorEquipo"]);
    const normalized = numericFields.has(field)
      ? (Number.isNaN(Number(value)) ? 0 : Number(value))
      : value;
    setFormData((prev) => ({ ...prev, [field]: normalized }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Validaciones inline al escribir ──────────────────────────────────
  const handleCantidadEquiposChange = (raw: string) => {
    const val = parseInt(raw, 10);
    handleInputChange("cantidadEquipos", val);
    setInlineErrors((p) => ({
      ...p,
      cantidadEquipos: (!isNaN(val) && val < MIN_TEAMS)
        ? "La cantidad mínima de equipos es 2"
        : undefined,
    }));
  };

  const handleCostoChange = (raw: string) => {
    const val = parseFloat(raw);
    handleInputChange("costoPorEquipo", val);
    setInlineErrors((p) => ({
      ...p,
      costoPorEquipo: (!isNaN(val) && val < 0)
        ? "El costo no puede ser menor a $0"
        : undefined,
    }));
  };

  // ── Toggle cancha ────────────────────────────────────────────────────
  const toggleCancha = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      canchasIds: prev.canchasIds.includes(id)
        ? prev.canchasIds.filter((c) => c !== id)
        : [...prev.canchasIds, id],
    }));
    if (errors.canchasIds) setErrors((p) => ({ ...p, canchasIds: "" }));
  };

  // ── Subida de PDF al API Gateway ──────────────────────────────────────
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    setPdfFileName(file.name);
    if (errors.reglamentoPdfUrl) setErrors((p) => ({ ...p, reglamentoPdfUrl: "" }));
    try {
      const { url } = await tournamentService.uploadRegulation(file);
      setFormData((prev) => ({ ...prev, reglamentoPdfUrl: url }));
    } catch {
      setErrors((p) => ({ ...p, reglamentoPdfUrl: "Error al subir el PDF. Intenta de nuevo." }));
      setPdfFileName(null);
    } finally {
      setUploadingPdf(false);
    }
  };

  // ── Validación final ─────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    try {
      if (!formData.nombreTorneo.trim())
        throw new TournamentValidationError("El nombre del torneo es obligatorio", "nombreTorneo");
    } catch (e) { if (e instanceof TournamentValidationError) nextErrors[e.field] = e.message; }

    try {
      if (!formData.fechaInicio)
        throw new TournamentValidationError("Selecciona la fecha de inicio", "fechaInicio");
    } catch (e) { if (e instanceof TournamentValidationError) nextErrors[e.field] = e.message; }

    try {
      if (!formData.fechaFin)
        throw new TournamentValidationError("Selecciona la fecha de fin del torneo", "fechaFin");
      if (formData.fechaFin < formData.fechaInicio)
        throw new TournamentValidationError("La fecha de fin no puede ser anterior al inicio", "fechaFin");
    } catch (e) { if (e instanceof TournamentValidationError) nextErrors[e.field] = e.message; }

    try {
      if (!formData.fechaCierreInscripciones)
        throw new TournamentValidationError("Selecciona la fecha de cierre de inscripciones", "fechaCierreInscripciones");
      if (formData.fechaCierreInscripciones > formData.fechaInicio)
        throw new TournamentValidationError("El cierre de inscripciones debe ser antes del inicio del torneo", "fechaCierreInscripciones");
    } catch (e) { if (e instanceof TournamentValidationError) nextErrors[e.field] = e.message; }

    try {
      if (formData.cantidadEquipos < MIN_TEAMS)
        throw new TournamentValidationError("La cantidad mínima de equipos es 2", "cantidadEquipos");
    } catch (e) { if (e instanceof TournamentValidationError) nextErrors[e.field] = e.message; }

    try {
      if (formData.costoPorEquipo < 0)
        throw new TournamentValidationError("El costo no puede ser menor a $0", "costoPorEquipo");
    } catch (e) { if (e instanceof TournamentValidationError) nextErrors[e.field] = e.message; }

    try {
      if (formData.canchasIds.length === 0)
        throw new TournamentValidationError("Selecciona al menos una cancha", "canchasIds");
    } catch (e) { if (e instanceof TournamentValidationError) nextErrors[e.field] = e.message; }

    try {
      if (!formData.reglamentoPdfUrl)
        throw new TournamentValidationError("Sube el reglamento del torneo en PDF", "reglamentoPdfUrl");
    } catch (e) { if (e instanceof TournamentValidationError) nextErrors[e.field] = e.message; }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ── Guardar torneo ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await tournamentService.create({
        name:                  formData.nombreTorneo.trim(),
        maxTeams:              formData.cantidadEquipos,
        startDate:             formData.fechaInicio,
        endDate:               formData.fechaFin,
        registrationCloseDate: formData.fechaCierreInscripciones,
        costPerTeam:           formData.costoPorEquipo,
        courtIds:              formData.canchasIds,
        regulationPdfUrl:      formData.reglamentoPdfUrl,
      });
      setSaved(true);
      setTimeout(() => navigate("/organizer/tournaments"), 2000);
    } catch {
      setErrors((p) => ({ ...p, general: "Error al crear el torneo. Intenta de nuevo." }));
    }
  };

  // ── Estilos compartidos ───────────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem",
    borderRadius: "0.75rem", fontSize: "0.95rem", fontWeight: 500,
    border: "1px solid rgba(0,0,0,0.1)",
    outline: "none", transition: "border-color 0.18s",
    background: "#fff",
  };
  const inputStyle = (field: string): React.CSSProperties => ({
    ...inputBase,
    borderColor: errors[field] ? P.primary : "rgba(0,0,0,0.1)",
  });

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28 lg:pb-8" style={{ backgroundColor: P.bg }}>

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-40 border-b px-6"
        style={{
          background:     "rgba(242,242,247,0.85)",
          borderColor:    "rgba(0,0,0,0.06)",
          backdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center h-[60px]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-black/5">
              <ChevronLeft style={{ width: 20, height: 20, color: P.default }} />
            </div>
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: P.default }}>Volver</span>
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="max-w-4xl mx-auto px-6 sm:px-10 pt-8 pb-16">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: `${P.orange}15`, border: `1px solid ${P.orange}30` }}
          >
            <Trophy style={{ width: 14, height: 14, color: P.orange }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: P.orange, textTransform: "uppercase" }}>
              Configuración de torneo
            </span>
          </div>
          <h1 className="text-3xl mb-2" style={{ fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.02em" }}>
            Crear Nuevo Torneo
          </h1>
          <p style={{ color: P.default, fontWeight: 500, fontSize: "0.95rem" }}>
            Configura los parámetros para el nuevo torneo TECHCUP
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[24px] p-6 sm:p-8"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="space-y-6">

            {/* ── Información General ── */}
            <SectionLabel label="Información General" />

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 600, color: P.textPrimary }}>
                Nombre del Torneo
              </label>
              <input
                type="text"
                value={formData.nombreTorneo}
                onChange={(e) => handleInputChange("nombreTorneo", e.target.value)}
                placeholder="Ej: TECHCUP 2026"
                style={inputStyle("nombreTorneo")}
              />
              <InlineError msg={errors.nombreTorneo} />
            </div>

            {/* 3 fechas en grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm mb-2" style={{ fontWeight: 600, color: P.textPrimary }}>
                  <Calendar style={{ width: 16, height: 16, color: P.info }} />
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                  style={inputStyle("fechaInicio")}
                />
                <InlineError msg={errors.fechaInicio} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm mb-2" style={{ fontWeight: 600, color: P.textPrimary }}>
                  <CalendarX style={{ width: 16, height: 16, color: P.primary }} />
                  Fecha de Fin del Torneo
                </label>
                <input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => handleInputChange("fechaFin", e.target.value)}
                  style={inputStyle("fechaFin")}
                />
                <InlineError msg={errors.fechaFin} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm mb-2" style={{ fontWeight: 600, color: P.textPrimary }}>
                  <CalendarClock style={{ width: 16, height: 16, color: P.orange }} />
                  Cierre de Inscripciones
                </label>
                <input
                  type="date"
                  value={formData.fechaCierreInscripciones}
                  onChange={(e) => handleInputChange("fechaCierreInscripciones", e.target.value)}
                  style={inputStyle("fechaCierreInscripciones")}
                />
                <InlineError msg={errors.fechaCierreInscripciones} />
              </div>
            </div>

            <Divider />

            {/* ── Parámetros del Torneo ── */}
            <SectionLabel label="Parámetros del Torneo" />

            <div>
              <label className="flex items-center gap-2 text-sm mb-2" style={{ fontWeight: 600, color: P.textPrimary }}>
                <Users style={{ width: 16, height: 16, color: P.primary }} />
                Cantidad de Equipos
              </label>
              <input
                type="number"
                value={formData.cantidadEquipos}
                onChange={(e) => handleCantidadEquiposChange(e.target.value)}
                min={2} max={64}
                style={{ ...inputStyle("cantidadEquipos"), fontWeight: 600 }}
              />
              {inlineErrors.cantidadEquipos && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1 mt-1"
                  style={{ fontSize: "0.72rem", fontWeight: 700, color: P.primary,
                    background: `${P.primary}12`, borderRadius: 6, padding: "0.18rem 0.45rem" }}
                >
                  <AlertCircle style={{ width: 11, height: 11 }} />
                  {inlineErrors.cantidadEquipos}
                </motion.span>
              )}
              <InlineError msg={errors.cantidadEquipos} />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 600, color: P.textPrimary }}>
                Costo por Equipo (COP)
              </label>
              <input
                type="number"
                value={formData.costoPorEquipo}
                onChange={(e) => handleCostoChange(e.target.value)}
                min={0} step={1000}
                style={{ ...inputStyle("costoPorEquipo"), fontWeight: 600 }}
              />
              {inlineErrors.costoPorEquipo && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1 mt-1"
                  style={{ fontSize: "0.72rem", fontWeight: 700, color: P.primary,
                    background: `${P.primary}12`, borderRadius: 6, padding: "0.18rem 0.45rem" }}
                >
                  <AlertCircle style={{ width: 11, height: 11 }} />
                  {inlineErrors.costoPorEquipo}
                </motion.span>
              )}
              <InlineError msg={errors.costoPorEquipo} />
            </div>

            <Divider />

            {/* ── Canchas ── */}
            <SectionLabel label="Canchas Disponibles" />

            <div
              className="flex items-start gap-2 rounded-xl px-3 py-2"
              style={{ background: `${P.info}0D`, border: `1px solid ${P.info}25`,
                fontSize: "0.78rem", fontWeight: 500, color: "#0055cc" }}
            >
              <Info style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2, color: P.info }} />
              <span>Selecciona las canchas habilitadas para este torneo.</span>
            </div>

            {loadingCanchas ? (
              <div className="flex items-center justify-center gap-2 py-6"
                style={{ color: P.default, fontSize: "0.875rem", fontStyle: "italic" }}>
                <Loader style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                Cargando canchas...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {canchas.map((cancha) => {
                  const sel = formData.canchasIds.includes(cancha.id);
                  return (
                    <motion.button
                      key={cancha.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => toggleCancha(cancha.id)}
                      className="px-4 py-3 rounded-xl text-left flex items-center justify-between"
                      style={{
                        backgroundColor: sel ? `${P.info}12` : "transparent",
                        border:          sel ? `2px solid ${P.info}` : "2px solid rgba(0,0,0,0.08)",
                        transition:      "all 0.18s",
                      }}
                    >
                      <span>
                        <span className="block" style={{ fontWeight: 600, fontSize: "0.85rem", color: sel ? P.info : P.default }}>
                          {cancha.name}
                        </span>
                        <span className="block" style={{ fontWeight: 500, fontSize: "0.72rem", color: "#aaa", marginTop: 2 }}>
                          {cancha.description}
                        </span>
                      </span>
                      {sel && <CheckCircle2 style={{ width: 16, height: 16, color: P.info, flexShrink: 0 }} />}
                    </motion.button>
                  );
                })}
              </div>
            )}
            <InlineError msg={errors.canchasIds} />

            <Divider />

            {/* ── Reglamento PDF ── */}
            <SectionLabel label="Reglamento del Torneo" />

            <div>
              <label className="flex items-center gap-2 text-sm mb-2" style={{ fontWeight: 600, color: P.textPrimary }}>
                <FileText style={{ width: 16, height: 16, color: P.orange }} />
                Subir Reglamento (PDF)
              </label>

              <motion.div
                whileHover={{ borderColor: P.purple }}
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-1 rounded-xl cursor-pointer transition-all"
                style={{
                  border:     `2px dashed ${pdfFileName ? P.success : "rgba(0,0,0,0.12)"}`,
                  background: pdfFileName ? `${P.success}08` : "#fafafa",
                  padding:    "1.25rem 1rem",
                  minHeight:  "90px",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file" accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                {uploadingPdf ? (
                  <div className="flex items-center gap-2" style={{ color: P.default, fontSize: "0.875rem" }}>
                    <Loader style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                    Subiendo PDF…
                  </div>
                ) : pdfFileName ? (
                  <div className="flex items-center gap-2" style={{ color: P.success, fontWeight: 600, fontSize: "0.875rem" }}>
                    <CheckCircle2 style={{ width: 18, height: 18 }} />
                    {pdfFileName}
                  </div>
                ) : (
                  <>
                    <UploadCloud style={{ width: 28, height: 28, color: P.default }} />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: P.default }}>Haz clic o arrastra el PDF aquí</span>
                    <span style={{ fontSize: "0.75rem", color: "#aaa" }}>Solo archivos .pdf · Máx. 10 MB</span>
                  </>
                )}
              </motion.div>

              <div
                className="flex items-start gap-2 rounded-xl px-3 py-2 mt-2"
                style={{ background: `${P.info}0D`, border: `1px solid ${P.info}25`,
                  fontSize: "0.78rem", fontWeight: 500, color: "#0055cc" }}
              >
                <Info style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2, color: P.info }} />
                <span>
                  El PDF se almacenará en la base de datos <strong>{PDF_BUCKET}</strong>.
                  La URL pública quedará vinculada al torneo para que los participantes puedan descargarlo.
                </span>
              </div>

              <InlineError msg={errors.reglamentoPdfUrl} />
            </div>

          </div>

          {/* ── Botón guardar ── */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saved || uploadingPdf}
            className="w-full mt-8 py-4 rounded-xl text-white flex items-center justify-center gap-2"
            style={{
              backgroundColor: saved ? P.success : P.purple,
              fontWeight: 700, fontSize: "1rem",
              opacity: saved || uploadingPdf ? 0.85 : 1,
              cursor:  saved || uploadingPdf ? "not-allowed" : "pointer",
            }}
          >
            {saved ? (
              <><CheckCircle2 style={{ width: 20, height: 20 }} /> Torneo Guardado</>
            ) : (
              <><Save style={{ width: 20, height: 20 }} /> Guardar Torneo</>
            )}
          </motion.button>

        </motion.div>
      </main>
    </div>
  );
}

// ── Sub-componentes de utilidad ─────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "#6E6E73", marginBottom: "0.25rem" }}>
      {label}
    </p>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.06)", margin: "0.25rem 0" }} />;
}

function InlineError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="mt-1 text-xs"
      style={{ color: "#B81C1C", fontWeight: 600 }}
    >
      {msg}
    </motion.p>
  );
}
