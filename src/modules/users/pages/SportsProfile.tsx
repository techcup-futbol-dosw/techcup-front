/**
 * @file src/modules/users/pages/SportsProfile.tsx
 * @description Perfil deportivo - Cognitive Complexity = 0 (solo calls)
 */
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useState, useEffect, useRef, SyntheticEvent } from "react";
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import logoTechcup from "@/assets/logo.png";
import { useAuth } from "@/core/auth/AuthContext";
import { sportProfileService } from "@/modules/users/services/sportProfileService";

interface SportsProfileData {
  posicion: string;
  dorsal: string;
  foto: string | null;
  disponible: boolean;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const POSICIONES = [
  { id: "GOALKEEPER", nombre: "Portero" },
  { id: "DEFENDER",   nombre: "Defensa" },
  { id: "MIDFIELDER", nombre: "Volante" },
  { id: "FORWARD",    nombre: "Delantero" },
];

const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  success: "#17C964",
  info: "#0066FE",
  default: "#6E6E73",
  textPrimary: "#1C1C1E",
  warning: "#FF9D00",
  bg: "#F2F2F7",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  fontSize: "0.92rem",
  fontWeight: 500,
  backgroundColor: P.bg,
  border: "1.5px solid transparent",
  borderRadius: "14px",
  outline: "none",
  padding: "0.75rem 1rem",
  color: "#1C1C1E",
  transition: "border-color 0.2s, background-color 0.2s",
};

// ═══════════════════════════════════════════════════════════
// PURE FUNCTIONS - Cognitive Complexity: 0
// ═══════════════════════════════════════════════════════════

function getDashboardPath(userContext: string): string {
  if (userContext === "organizer") {
    return "/dashboard-organizer";
  }
  if (userContext === "arbitro") {
    return "/dashboard-arbitro";
  }
  return "/dashboard-player";
}

function getBorderColor(hasError: boolean, isTouched: boolean): string {
  if (hasError) return P.primary;
  if (isTouched) return P.info;
  return `${P.default}30`;
}

function getBorderStyle(hasError: boolean, isTouched: boolean): string {
  const color = getBorderColor(hasError, isTouched);
  return `2px solid ${color}`;
}

function isValidDorsalLength(value: string): boolean {
  const n = Number.parseInt(value, 10);
  return !Number.isNaN(n) && n >= 0 && n <= 99;
}

function validateDorsal(value: string): ValidationResult {
  if (!value) {
    return { isValid: false, error: "Ingresa tu número de dorsal (00-99)" };
  }
  if (!isValidDorsalLength(value)) {
    return { isValid: false, error: "El dorsal debe estar entre 00-99" };
  }
  return { isValid: true };
}

function normalizeDorsal(value: string): string {
  if (!value) return "";
  if (value.length === 1) return value.padStart(2, "0");
  return value;
}

function isValidImageSize(fileSize: number): boolean {
  const MAX_SIZE = 5 * 1024 * 1024;
  return fileSize <= MAX_SIZE;
}

function isValidDorsalInput(value: string): boolean {
  return !value || /^\d+$/.test(value);
}

function isValidDorsalLength2Digits(value: string): boolean {
  return value.length <= 2;
}

function isValidClipboardText(text: string): boolean {
  return /^\d+$/.test(text) && text.length <= 2;
}

function getUserContext(): string {
  return sessionStorage.getItem("userContext") || "user";
}

function getFormValidationStatus(
  profileData: SportsProfileData,
  errors: Record<string, string>
): boolean {
  return !!(profileData.posicion && profileData.dorsal && !Object.keys(errors).length);
}

function getDorsalInputColor(hasError: boolean): string {
  return hasError ? P.primary : P.textPrimary;
}

function getDorsalInputAriaDescribedBy(hasError: boolean): string {
  return hasError ? "dorsal-error" : "dorsal-help";
}

function getButtonBackgroundColor(isFormValid: boolean, isSaving: boolean): string {
  return isFormValid && !isSaving ? P.primary : P.default;
}

function getButtonCursor(isFormValid: boolean, isSaving: boolean): string {
  return isFormValid && !isSaving ? "pointer" : "not-allowed";
}

function getButtonBoxShadow(isFormValid: boolean): string {
  return isFormValid ? `0 6px 24px ${P.primary}45` : "none";
}

function getButtonOpacity(isFormValid: boolean, isSaving: boolean): number {
  return isFormValid && !isSaving ? 1 : 0.6;
}

function getButtonHoverScale(isFormValid: boolean, isSaving: boolean): { scale: number } | Record<string, never> {
  return isFormValid && !isSaving ? { scale: 1.02 } : {};
}

function getButtonTapScale(isFormValid: boolean, isSaving: boolean): { scale: number } | Record<string, never> {
  return isFormValid && !isSaving ? { scale: 0.98 } : {};
}

function getToastBackgroundColor(feedbackType: "success" | "error"): string {
  return feedbackType === "success" ? P.success : P.primary;
}

function getToastBoxShadow(feedbackType: "success" | "error"): string {
  const color = feedbackType === "success" ? P.success : P.primary;
  return `0 12px 40px ${color}45`;
}

function getDisponibleButtonBackgroundColor(isDisponible: boolean, isSelected: boolean): string {
  if (isSelected) {
    return isDisponible ? P.success : P.primary;
  }
  return "white";
}

function getDisponibleButtonTextColor(isSelected: boolean): string {
  return isSelected ? "white" : P.textPrimary;
}

function getDisponibleButtonBorderColor(isDisponible: boolean, isSelected: boolean): string {
  if (isSelected) {
    return isDisponible ? P.success : P.primary;
  }
  return P.default;
}

function getDisponibleButtonStyle(isDisponible: boolean, isSelected: boolean): React.CSSProperties {
  const bgColor = getDisponibleButtonBackgroundColor(isDisponible, isSelected);
  const textColor = getDisponibleButtonTextColor(isSelected);
  const borderColor = getDisponibleButtonBorderColor(isDisponible, isSelected);

  return {
    flex: 1,
    padding: "14px 20px",
    borderRadius: 14,
    backgroundColor: bgColor,
    color: textColor,
    border: `1.5px solid ${borderColor}30`,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  };
}

// ═══════════════════════════════════════════════════════════
// BUSINESS LOGIC
// ═══════════════════════════════════════════════════════════

type SetProfileData = React.Dispatch<React.SetStateAction<SportsProfileData>>;
type SetErrors = React.Dispatch<React.SetStateAction<Record<string, string>>>;

function handleImageUploadLogic(
  file: File,
  errors: Record<string, string>,
  setErrors: SetErrors,
  setProfileData: SetProfileData,
  setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>,
  showFeedback: (message: string, type: "success" | "error") => void
): void {
  if (!isValidImageSize(file.size)) {
    setErrors({ ...errors, foto: "La imagen no debe superar 5MB" });
    showFeedback("La imagen no debe superar 5MB", "error");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setPreviewImage(reader.result as string);
    setProfileData((prev) => ({ ...prev, foto: reader.result as string }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.foto;
      return copy;
    });
    showFeedback("Foto cargada correctamente", "success");
  };
  reader.onerror = () => {
    showFeedback("Error al leer la imagen. Intenta nuevamente.", "error");
  };
  reader.readAsDataURL(file);
}

function handleDorsalBlurLogic(
  dorsal: string,
  setProfileData: SetProfileData,
  setErrors: SetErrors
): void {
  const normalized = normalizeDorsal(dorsal);
  const validation = validateDorsal(normalized);

  if (validation.isValid) {
    setProfileData((prev) => ({ ...prev, dorsal: normalized }));
    setErrors((prev) => ({ ...prev, dorsal: "" }));
  } else {
    setProfileData((prev) => ({ ...prev, dorsal: "" }));
    setErrors((prev) => ({ ...prev, dorsal: validation.error || "" }));
  }
}

function validateFormLogic(
  profileData: SportsProfileData,
  setErrors: SetErrors
): boolean {
  const newErrors: Record<string, string> = {};

  if (!profileData.posicion) {
    newErrors.posicion = "Selecciona una posición para continuar";
  }

  const dorsalValidation = validateDorsal(profileData.dorsal);
  if (!dorsalValidation.isValid) {
    newErrors.dorsal = dorsalValidation.error || "";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT - Cognitive Complexity: ≤ 5 (solo method calls)
// ═══════════════════════════════════════════════════════════

export function SportsProfile() {
  const navigate = useNavigate();
  const { accountId } = useAuth();
  const userContext = getUserContext();
  const dashboardPath = getDashboardPath(userContext);

  const [profileData, setProfileData] = useState<SportsProfileData>({
    posicion: "",
    dorsal: "",
    foto: null,
    disponible: true,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingProfileId, setExistingProfileId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const toastRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accountId) return;
    sportProfileService.getByUserId(accountId).then((profile) => {
      if (!profile) return;
      setExistingProfileId(profile.id);
      setProfileData({
        posicion: profile.position,
        dorsal: profile.dorsalNumber != null ? String(profile.dorsalNumber).padStart(2, "0") : "",
        foto: null,
        disponible: profile.available,
      });
    });
  }, [accountId]);

  useEffect(() => {
    if (feedbackMessage && toastRef.current) {
      try {
        toastRef.current.focus();
      } catch {
        /* ignore */
      }
    }
  }, [feedbackMessage]);

  const handleBack = () => navigate(dashboardPath);

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    globalThis.setTimeout(() => setFeedbackMessage(null), 2800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    handleImageUploadLogic(file, errors, setErrors, setProfileData, setPreviewImage, showFeedback);
  };

  const handleDorsalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!isValidDorsalInput(v)) return;
    if (!isValidDorsalLength2Digits(v)) return;

    setProfileData((prev) => ({ ...prev, dorsal: v }));
    setTouched((prev) => ({ ...prev, dorsal: true }));
    if (errors.dorsal) setErrors((prev) => ({ ...prev, dorsal: "" }));
  };

  const handleDorsalPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!isValidClipboardText(text)) {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        dorsal: text.length > 2 ? "Máximo 2 dígitos (00-99)" : "Solo se permiten números",
      }));
    }
  };

  const handleDorsalBlur = () => {
    setTouched((prev) => ({ ...prev, dorsal: true }));
    handleDorsalBlurLogic(profileData.dorsal, setProfileData, setErrors);
  };

  const handleReset = () => {
    setProfileData({ posicion: "", dorsal: "", foto: null, disponible: true });
    setPreviewImage(null);
    setPhotoFile(null);
    setErrors({});
    setTouched({});
    showFeedback("Cambios descartados", "success");
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFormLogic(profileData, setErrors)) {
      showFeedback("Completa los datos requeridos antes de guardar", "error");
      return;
    }
    if (!accountId) {
      showFeedback("No se pudo identificar tu sesión. Vuelve a iniciar sesión.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        position:     profileData.posicion,
        dorsalNumber: Number.parseInt(profileData.dorsal, 10),
        available:    profileData.disponible,
      };

      if (existingProfileId) {
        await sportProfileService.update(existingProfileId, payload, photoFile ?? undefined);
      } else {
        const created = await sportProfileService.create(accountId, payload, photoFile ?? undefined);
        setExistingProfileId(created.id);
      }

      showFeedback("¡Perfil deportivo guardado exitosamente!", "success");
      globalThis.setTimeout(() => navigate(dashboardPath), 1600);
    } catch {
      showFeedback("No se pudo guardar el perfil. Intenta nuevamente.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── COMPUTED VALUES ───
  const isFormValid = getFormValidationStatus(profileData, errors);
  const dorsalBorderStyle = getBorderStyle(!!errors.dorsal, touched.dorsal || false);
  const posicionBorderStyle = getBorderStyle(!!errors.posicion, touched.posicion || false);
  const dorsalInputColor = getDorsalInputColor(!!errors.dorsal);
  const dorsalAriaDescribedBy = getDorsalInputAriaDescribedBy(!!errors.dorsal);
  const buttonBgColor = getButtonBackgroundColor(isFormValid, isSaving);
  const buttonCur = getButtonCursor(isFormValid, isSaving);
  const buttonBoxShadowVal = getButtonBoxShadow(isFormValid);
  const buttonOpacityVal = getButtonOpacity(isFormValid, isSaving);
  const buttonHoverScaleVal = getButtonHoverScale(isFormValid, isSaving);
  const buttonTapScaleVal = getButtonTapScale(isFormValid, isSaving);
  const toastBgColor = getToastBackgroundColor(feedbackType);
  const toastBoxShadowVal = getToastBoxShadow(feedbackType);
  const disponibleButtonStyle = getDisponibleButtonStyle(true, profileData.disponible);
  const noDisponibleButtonStyle = getDisponibleButtonStyle(false, !profileData.disponible);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: P.bg }}>
      {/* Left panel */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-center p-12 overflow-hidden"
        style={{
          width: "40%",
          minHeight: "100vh",
          background: "linear-gradient(160deg, #5C0000 0%, #8B0000 45%, #B81C1C 100%)",
          position: "sticky",
          top: 0,
        }}
        aria-hidden="false"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div style={{ position: "absolute", top: -96, left: -96, width: 288, height: 288, borderRadius: "9999px", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", right: -128, top: "45%", width: 384, height: 384, borderRadius: "9999px", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", bottom: -80, left: "33%", width: 256, height: 256, borderRadius: "9999px", background: "rgba(196,132,29,0.10)" }} />
        </div>

        <div style={{ zIndex: 10 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center p-2" style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
              <img src={logoTechcup} alt="Logo TECHCUP" className="w-full h-full object-contain" />
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: 0 }}>TECHCUP</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.62rem", fontWeight: 600, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.12em" }}>Torneo Universitario</p>
            </div>
          </div>

          <div className="mb-8" style={{ maxWidth: 420 }}>
            <h2 style={{ color: "white", fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.12, margin: 0 }}>
              Completa tu perfil<br />deportivo y <br />
              <span style={{ color: P.secondary }}>únete al juego.</span>
            </h2>
            <div style={{ height: 8 }} />
            <div style={{ backgroundColor: P.secondary, height: 4, width: 48, borderRadius: 8, marginTop: 18 }} />
            <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 18, fontSize: "0.95rem", lineHeight: 1.5 }}>
              Cuéntanos más sobre ti como jugador para personalizar tu experiencia en el torneo
            </p>
          </div>

          <p style={{ color: "rgba(255,255,255,0.35)", marginTop: 24, fontSize: "0.82rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 18 }}>
            Escuela Colombiana de Ingeniería
          </p>
        </div>
      </motion.aside>

      {/* Right panel (form) */}
      <main className="flex-1 flex flex-col" aria-labelledby="profile-title">
        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(242,242,247,0.85)" }} className="px-6 lg:px-10">
          <div className="h-16 flex items-center">
            <button
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-xl bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Volver al dashboard"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            >
              <ArrowLeft style={{ width: 16, height: 16, color: P.default }} />
            </button>
            <div style={{ marginLeft: 12, fontWeight: 800, color: P.primary }}>TECHCUP</div>
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#8A8A8A" }}>Edición de perfil</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ backgroundColor: P.bg }} className="flex-1 overflow-y-auto px-6 sm:px-10 py-10 pb-16">
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h1 id="profile-title" style={{ fontSize: "2.2rem", fontWeight: 800, color: P.textPrimary, margin: 0 }}>
              Mi Perfil Deportivo
            </h1>
            <p style={{ marginTop: 8, color: P.default, marginBottom: 24 }}>
              Configura tu información para que los organizadores te conozcan mejor
            </p>

            <form onSubmit={handleSubmit} className="space-y-8" aria-describedby="form-help" noValidate>
              <div id="form-help" style={{ fontSize: 12, color: "#8A8A8A", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={14} aria-hidden />
                Los campos marcados con * son obligatorios
              </div>

              {/* Foto de Perfil */}
              <div>
                <label htmlFor="foto-input" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: P.default, marginBottom: 12 }}>Subir foto</label>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 128, height: 128, borderRadius: 9999, overflow: "hidden", border: `4px solid ${P.primary}`, backgroundColor: P.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {previewImage ? (
                      <img src={previewImage} alt="Vista previa de la foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Upload style={{ width: 40, height: 40, color: P.default }} aria-hidden />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById("foto-input")?.click()}
                      style={{ display: "inline-block", padding: "12px 20px", borderRadius: 14, backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)", cursor: "pointer" }}
                      aria-label="Seleccionar archivo de imagen"
                    >
                      <strong style={{ color: P.textPrimary }}>Seleccionar foto</strong>
                    </button>
                    <input id="foto-input" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} aria-describedby="foto-help foto-error" />
                    <p id="foto-help" style={{ marginTop: 8, color: "#8A8A8E" }}>JPG, PNG o GIF. Máximo 5MB</p>
                    {errors.foto && (
                      <div id="foto-error" role="alert" style={{ color: P.primary, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <AlertCircle size={14} aria-hidden /> {errors.foto}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Número de Dorsal */}
              <motion.div layout>
                <label
                  htmlFor="dorsal"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: P.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  * Número de Dorsal
                </label>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 160, flexShrink: 0 }}>
                    <input
                      id="dorsal"
                      name="dorsal"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{2}"
                      value={profileData.dorsal}
                      onChange={handleDorsalChange}
                      onPaste={handleDorsalPaste}
                      onBlur={handleDorsalBlur}
                      aria-invalid={!!errors.dorsal}
                      aria-describedby={dorsalAriaDescribedBy}
                      placeholder="00"
                      maxLength={2}
                      style={{
                        ...inputBase,
                        height: 80,
                        textAlign: "center",
                        fontSize: "2.8rem",
                        fontWeight: 800,
                        backgroundColor: "white",
                        color: dorsalInputColor,
                        border: dorsalBorderStyle,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, paddingTop: 8 }}>
                    <p id="dorsal-help" style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#8A8A8E" }}>
                      Usa números 00-99
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: P.default }}>
                      📌 Si escribes un solo dígito, lo convertiremos automáticamente (5 → 05)
                    </p>
                  </div>
                </div>
                <AnimatePresence>
                  {errors.dorsal && (
                    <motion.div
                      id="dorsal-error"
                      role="alert"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 10,
                        padding: "10px 12px",
                        backgroundColor: `${P.primary}12`,
                        borderLeft: `3px solid ${P.primary}`,
                        borderRadius: 6,
                        color: P.primary,
                        fontSize: "0.85rem",
                      }}
                    >
                      <AlertCircle size={15} aria-hidden />
                      {errors.dorsal}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Posición */}
              <motion.div layout>
                <label
                  htmlFor="posicion"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: P.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  * Posición en el Campo
                </label>
                <select
                  id="posicion"
                  value={profileData.posicion}
                  onChange={(e) => {
                    setProfileData((prev) => ({ ...prev, posicion: e.target.value }));
                    setTouched((prev) => ({ ...prev, posicion: true }));
                    if (errors.posicion) setErrors((prev) => ({ ...prev, posicion: "" }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, posicion: true }))}
                  aria-invalid={!!errors.posicion}
                  aria-describedby={errors.posicion ? "posicion-error" : undefined}
                  style={{
                    ...inputBase,
                    height: 48,
                    paddingLeft: 16,
                    fontSize: "0.95rem",
                    backgroundColor: "white",
                    border: posicionBorderStyle,
                    cursor: "pointer",
                  }}
                >
                  <option value="">Selecciona tu posición</option>
                  {POSICIONES.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.nombre}
                    </option>
                  ))}
                </select>
                <AnimatePresence>
                  {errors.posicion && (
                    <motion.div
                      id="posicion-error"
                      role="alert"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 10,
                        padding: "10px 12px",
                        backgroundColor: `${P.primary}12`,
                        borderLeft: `3px solid ${P.primary}`,
                        borderRadius: 6,
                        color: P.primary,
                        fontSize: "0.85rem",
                      }}
                    >
                      <AlertCircle size={15} aria-hidden />
                      {errors.posicion}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Disponibilidad para Invitaciones */}
              <motion.div layout>
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: P.textPrimary,
                      marginBottom: 12,
                    }}
                  >
                    Disponibilidad para Invitaciones
                  </legend>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setProfileData((prev) => ({ ...prev, disponible: true }))}
                      style={disponibleButtonStyle}
                      aria-pressed={profileData.disponible}
                    >
                      ✓ Disponible
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData((prev) => ({ ...prev, disponible: false }))}
                      style={noDisponibleButtonStyle}
                      aria-pressed={!profileData.disponible}
                    >
                      ✕ No disponible
                    </button>
                  </div>
                </fieldset>
                <p style={{ marginTop: 8, color: "#8A8A8E", fontSize: "0.85rem" }}>
                  Indica si deseas recibir invitaciones a equipos y torneos
                </p>
              </motion.div>

              {/* Botones de acción */}
              <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                <motion.button
                  type="submit"
                  disabled={isSaving || !isFormValid}
                  whileHover={buttonHoverScaleVal}
                  whileTap={buttonTapScaleVal}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    borderRadius: 14,
                    backgroundColor: buttonBgColor,
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    border: "none",
                    cursor: buttonCur,
                    boxShadow: buttonBoxShadowVal,
                    opacity: buttonOpacityVal,
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }}
                        aria-hidden
                      />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} aria-hidden />
                      Guardar Perfil
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleReset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: "14px 20px",
                    borderRadius: 14,
                    backgroundColor: "white",
                    border: `1.5px solid ${P.default}30`,
                    fontWeight: 700,
                    color: P.textPrimary,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                  }}
                >
                  Restablecer
                </motion.button>
              </div>
            </form>

            {/* Info box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: 28,
                backgroundColor: `${P.info}08`,
                borderRadius: 12,
                padding: 14,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                border: `1px solid ${P.info}30`,
              }}
            >
              <div style={{ fontSize: 22, flexShrink: 0 }} aria-hidden>⚽</div>
              <div>
                <p style={{ margin: 0, color: P.default, fontSize: "0.9rem", lineHeight: 1.5 }}>
                  <strong style={{ color: P.textPrimary }}>¿Por qué es importante?</strong>{" "}
                  Esta información ayuda a los organizadores a formar equipos equilibrados basándose en posiciones, números de dorsal únicos y disponibilidad para invitaciones.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            ref={toastRef}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 32,
              backgroundColor: toastBgColor,
              color: "white",
              padding: "14px 20px",
              borderRadius: 16,
              fontWeight: 700,
              fontSize: "0.95rem",
              boxShadow: toastBoxShadowVal,
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {feedbackType === "success" ? (
              <CheckCircle2 size={18} aria-hidden />
            ) : (
              <AlertCircle size={18} aria-hidden />
            )}
            {feedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
