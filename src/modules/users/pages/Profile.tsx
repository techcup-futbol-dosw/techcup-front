import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { userService, type ActivityItemDto, type UpdateUsersProfileRequest } from "@/modules/users/services/userService";
import { sportProfileService, type SportProfileResponse } from "@/modules/users/services/sportProfileService";
import { RELATIONS, PROGRAMS } from "@/core/constants/academicData";
import {
  ArrowLeft,
  Edit2,
  Settings,
  KeyRound,
  LayoutGrid,
  Activity,
  User,
  X,
  Save,
} from "lucide-react";

const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  success: "#17C964",
  info: "#0066FE",
  default: "#6E6E73",
  textPrimary: "#1C1C1E",
  bg: "#F2F2F7",
};

type Tab = "overview" | "settings" | "activity";

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Portero",
  DEFENDER: "Defensa",
  MIDFIELDER: "Volante",
  FORWARD: "Delantero",
};



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

const ACTIVITY_COLOR: Record<string, string> = {
  tournament: P.success,
  security:   P.info,
  profile:    P.secondary,
  match:      P.primary,
  other:      P.default,
};

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 18 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
      >
        <div
          className="bg-white rounded-[24px] w-full max-w-md pointer-events-auto"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}

const getDashboardPath = (context: string): string => {
  if (context === "organizer") return "/dashboard-organizer";
  if (context === "arbitro") return "/dashboard-arbitro";
  return "/dashboard";
};

const getBadgeColor = (context: string): string => {
  if (context === "organizer") return P.success;
  if (context === "arbitro") return P.secondary;
  return P.primary;
};

const getBadgeLabel = (context: string): string => {
  if (context === "organizer") return "Organizador";
  if (context === "arbitro") return "Árbitro";
  return "Usuario";
};

type InfoDraft = {
  fullName: string;
  schoolRelation: string;
  academicProgram: string;
  semester: number | null;
};

export function Profile() {
  const navigate = useNavigate();
  const { accountId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("settings");

  // Identity service data
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<string>("");

  // techchup-users data
  const [fullName, setFullName] = useState("");
  const [identification, setIdentification] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [schoolRelation, setSchoolRelation] = useState("");
  const [academicProgram, setAcademicProgram] = useState("");
  const [semester, setSemester] = useState<number | null>(null);

  // Sport profile data
  const [sportProfile, setSportProfile] = useState<SportProfileResponse | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");

  const [activityLog, setActivityLog] = useState<ActivityItemDto[]>([]);

  useEffect(() => {
    if (!accountId) return;

    userService.getUsersProfile(accountId).then((profile) => {
      setEmail(profile.email);
      setFullName(profile.fullName);
      setIdentification(profile.identification ?? "");
      setBirthDate(profile.birthDate ?? "");
      setGender(profile.gender ?? "");
      setSchoolRelation(profile.schoolRelation ?? "");
      setAcademicProgram(profile.academicProgram ?? "");
      setSemester(profile.semester);
      setCreatedAt(profile.profileCreatedAt ?? "");
    }).catch(() => {});

    sportProfileService.getByUserId(accountId).then(async (profile) => {
      setSportProfile(profile);
      if (profile?.photoId) {
        const url = await sportProfileService.getPhotoUrl(profile.photoId);
        if (url) setProfilePhotoUrl(url);
      }
    }).catch(() => {});

    userService.getActivity().then(setActivityLog).catch(() => {});
  }, [accountId]);


  // Info editor state
  const [infoDraft, setInfoDraft] = useState<InfoDraft>({ fullName: "", schoolRelation: "", academicProgram: "", semester: null });
  const [showInfoEditor, setShowInfoEditor] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const activityRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const savedContext = sessionStorage.getItem("userContext");
  const [userContext, setUserContext] = useState<string>(savedContext || "user");

  useEffect(() => {
    const context = sessionStorage.getItem("userContext");
    if (context) setUserContext(context);
  }, []);

  const dashboardPath = getDashboardPath(userContext);
  const badgeColor = getBadgeColor(userContext);
  const badgeLabel = getBadgeLabel(userContext);

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 2400);
  };

  const openInfoEditor = () => {
    setInfoDraft({ fullName, schoolRelation, academicProgram, semester });
    setShowInfoEditor(true);
  };

  const handleSaveInfo = async () => {
    if (!accountId) return;
    const payload: UpdateUsersProfileRequest = {
      fullName: infoDraft.fullName,
      identification,
      birthDate,
      gender,
      schoolRelation: infoDraft.schoolRelation,
      academicProgram: infoDraft.academicProgram,
      semester: infoDraft.schoolRelation === "STUDENT" ? infoDraft.semester : null,
    };
    try {
      await userService.updateUsersProfile(payload);
      setFullName(infoDraft.fullName);
      setSchoolRelation(infoDraft.schoolRelation);
      setAcademicProgram(infoDraft.academicProgram);
      setSemester(infoDraft.schoolRelation === "STUDENT" ? infoDraft.semester : null);
      setShowInfoEditor(false);
      showFeedback("Información actualizada correctamente.");
    } catch {
      showFeedback("No se pudo guardar la información. Intenta nuevamente.");
    }
  };

  const handleActivityMouseEnter = (id: string) => {
    const el = activityRefs.current[id];
    if (el) el.style.backgroundColor = P.bg;
  };
  const handleActivityMouseLeave = (id: string) => {
    const el = activityRefs.current[id];
    if (el) el.style.backgroundColor = "transparent";
  };
  const handleActivityKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveActivityId(activeActivityId === id ? null : id);
    }
  };
  const handleActivityTouchStart = (id: string) => handleActivityMouseEnter(id);
  const handleActivityTouchEnd   = (id: string) => setTimeout(() => handleActivityMouseLeave(id), 200);

  const relationLabel = RELATIONS.find((r) => r.value === schoolRelation)?.label ?? schoolRelation;
  const programLabel  = PROGRAMS.find((p) => p.value === academicProgram)?.label ?? academicProgram;

  const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
    { id: "overview", label: "Resumen",   icon: LayoutGrid },
    { id: "settings", label: "Ajustes",   icon: Settings },
    { id: "activity", label: "Actividad", icon: Activity },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-0" style={{ backgroundColor: P.bg }}>
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
          <button
            type="button"
            onClick={() => navigate(dashboardPath)}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            aria-label="Volver al dashboard"
          >
            <ArrowLeft style={{ width: 16, height: 16, color: P.default }} />
          </button>
          <span className="flex-1" style={{ fontWeight: 800, color: P.primary, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
            TECHCUP
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${badgeColor}12` }}>
            <User style={{ width: 14, height: 14, color: badgeColor }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: badgeColor }}>{badgeLabel}</span>
          </div>
        </div>
      </motion.header>

      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-10 pb-16 space-y-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.45, ease: "easeOut" }}
          className="bg-white rounded-[20px] p-6"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={fullName}
                  className="w-16 h-16 rounded-2xl object-cover"
                  style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${P.primary}14`, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
                >
                  {fullName ? (
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: P.primary }}>
                      {fullName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User style={{ width: 28, height: 28, color: P.primary }} />
                  )}
                </div>
              )}
              {sportProfile?.available && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                  style={{ backgroundColor: P.success }}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.02em" }}>
                {fullName || "Cargando..."}
              </h2>
              <p className="mt-0.5" style={{ fontSize: "0.82rem", color: P.default, fontWeight: 500 }}>
                {email}
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {sportProfile?.position && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${P.secondary}14`, color: P.secondary, fontWeight: 700, letterSpacing: "0.05em" }}>
                    {POSITION_LABELS[sportProfile.position]}
                  </span>
                )}
                {sportProfile?.dorsalNumber != null && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${P.primary}12`, color: P.primary, fontWeight: 700, letterSpacing: "0.05em" }}>
                    #{String(sportProfile.dorsalNumber).padStart(2, "0")}
                  </span>
                )}
                {!sportProfile && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${P.default}14`, color: P.default, fontWeight: 600, letterSpacing: "0.05em" }}>
                    Sin perfil deportivo
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          className="bg-white rounded-[20px] overflow-hidden"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div className="flex" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 relative transition-all duration-200"
                  style={{ fontWeight: isActive ? 700 : 500, color: isActive ? P.textPrimary : P.default, fontSize: "0.82rem" }}
                >
                  <Icon style={{ width: 15, height: 15 }} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="tab-bar"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: P.secondary }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Overview ── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="p-6"
              >
                <SectionLabel text="Perfil Deportivo" color={P.primary} />
                {sportProfile ? (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: P.bg }}>
                      <p style={{ fontSize: "1.1rem", fontWeight: 800, color: P.secondary, letterSpacing: "-0.02em" }}>
                        {sportProfile.position ? POSITION_LABELS[sportProfile.position] : "—"}
                      </p>
                      <p className="mt-0.5" style={{ fontSize: "0.75rem", color: P.default, fontWeight: 500 }}>Posición</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: P.bg }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: 800, color: P.primary, letterSpacing: "-0.02em" }}>
                        {sportProfile.dorsalNumber != null ? String(sportProfile.dorsalNumber).padStart(2, "0") : "—"}
                      </p>
                      <p className="mt-0.5" style={{ fontSize: "0.75rem", color: P.default, fontWeight: 500 }}>Dorsal</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: P.bg }}>
                      <div>
                        <p style={{ fontSize: "0.88rem", fontWeight: 700, color: sportProfile.available ? P.success : P.default }}>
                          {sportProfile.available ? "Disponible para jugar" : "No disponible"}
                        </p>
                        <p className="mt-0.5" style={{ fontSize: "0.75rem", color: P.default, fontWeight: 500 }}>Estado de disponibilidad</p>
                      </div>
                      <Link
                        to="/sport-profile"
                        className="px-3 py-1.5 rounded-xl text-xs"
                        style={{ backgroundColor: `${P.primary}12`, color: P.primary, fontWeight: 700 }}
                      >
                        Editar
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: P.bg }}>
                    <p style={{ fontSize: "0.85rem", color: P.default, fontWeight: 500 }}>Sin perfil deportivo configurado.</p>
                    <Link
                      to="/sport-profile"
                      className="px-3 py-1.5 rounded-xl text-xs"
                      style={{ backgroundColor: `${P.primary}12`, color: P.primary, fontWeight: 700 }}
                    >
                      Completar
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Settings ── */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="divide-y"
                style={{ "--tw-divide-opacity": 1, borderColor: "rgba(0,0,0,0.05)" } as React.CSSProperties}
              >
                {/* Información Personal */}
                <div className="p-6" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <div className="flex items-start justify-between mb-5">
                    <SectionLabel text="Información Personal" color={P.secondary} />
                    <button
                      type="button"
                      onClick={openInfoEditor}
                      className="flex items-center gap-1 flex-shrink-0 -mt-1 transition-colors hover:opacity-80"
                      style={{ fontSize: "0.78rem", fontWeight: 600, color: P.secondary }}
                    >
                      <Edit2 style={{ width: 12, height: 12 }} />
                      Editar
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 600, color: P.default }}>Nombre completo</p>
                      <div className="w-full px-3.5 py-2.5 rounded-xl" style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.textPrimary }}>
                        {fullName || "—"}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 600, color: P.default }}>Correo electrónico</p>
                      <div className="w-full px-3.5 py-2.5 rounded-xl" style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.default }}>
                        {email || "—"}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 600, color: P.default }}>Relación con la Escuela</p>
                      <div className="w-full px-3.5 py-2.5 rounded-xl" style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.textPrimary }}>
                        {relationLabel || "—"}
                      </div>
                    </div>
                    {schoolRelation === "STUDENT" && (
                      <>
                        <div>
                          <p className="mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 600, color: P.default }}>Programa académico</p>
                          <div className="w-full px-3.5 py-2.5 rounded-xl" style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.textPrimary }}>
                            {programLabel || "—"}
                          </div>
                        </div>
                        <div>
                          <p className="mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 600, color: P.default }}>Semestre</p>
                          <div className="w-full px-3.5 py-2.5 rounded-xl" style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.textPrimary }}>
                            {semester ?? "—"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Seguridad */}
                <div className="p-6" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <div className="mb-5">
                    <SectionLabel text="Seguridad y Acceso" color={P.info} />
                  </div>
                  <div
                    className="flex items-center gap-3 p-3.5 rounded-2xl"
                    style={{ backgroundColor: P.bg }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${P.info}12` }}>
                      <KeyRound style={{ width: 16, height: 16, color: P.info }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: "0.88rem", fontWeight: 600, color: P.textPrimary }}>Contraseña</p>
                      {createdAt && (
                        <p style={{ fontSize: "0.75rem", color: P.default, fontWeight: 500 }}>
                          Cuenta desde {new Date(createdAt).toLocaleDateString("es-CO", { year: "numeric", month: "long" })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Activity ── */}
            {activeTab === "activity" && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="p-6"
              >
                <SectionLabel text="Actividad Reciente" color={P.primary} />
                <div className="space-y-2">
                  {activityLog.length === 0 && (
                    <p style={{ fontSize: "0.85rem", color: P.default, fontWeight: 500 }}>Sin actividad reciente.</p>
                  )}
                  {activityLog.map((item, idx) => {
                    const key = String(item.id);
                    const dotColor = ACTIVITY_COLOR[item.category] ?? P.default;
                    return (
                      <motion.div
                        key={key}
                        ref={(el) => { if (el) activityRefs.current[key] = el; }}
                        role="button"
                        tabIndex={0}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        className="flex items-start gap-3 p-3.5 rounded-2xl transition-colors duration-200 cursor-pointer"
                        style={{ backgroundColor: "transparent" }}
                        onMouseEnter={() => handleActivityMouseEnter(key)}
                        onMouseLeave={() => handleActivityMouseLeave(key)}
                        onKeyDown={(e) => handleActivityKeyDown(e, key)}
                        onTouchStart={() => handleActivityTouchStart(key)}
                        onTouchEnd={() => handleActivityTouchEnd(key)}
                        aria-label={`Actividad: ${item.action}, ${item.createdAt}`}
                        aria-pressed={activeActivityId === key}
                      >
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: dotColor }} />
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: "0.88rem", fontWeight: 600, color: P.textPrimary }}>{item.action}</p>
                          <p className="mt-0.5" style={{ fontSize: "0.75rem", color: P.default, fontWeight: 500 }}>{item.createdAt}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Modal: editar información personal */}
        <AnimatePresence>
          {showInfoEditor && (
            <ModalShell onClose={() => setShowInfoEditor(false)}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: P.textPrimary }}>Editar información</h3>
                    <p style={{ fontSize: "0.78rem", color: P.default, fontWeight: 500 }}>El correo no se puede modificar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInfoEditor(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: P.bg }}
                    aria-label="Cerrar editor"
                  >
                    <X style={{ width: 16, height: 16, color: P.default }} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="edit-fullname" className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: P.default }}>
                      Nombre completo
                    </label>
                    <input
                      id="edit-fullname"
                      type="text"
                      value={infoDraft.fullName}
                      onChange={(e) => setInfoDraft((d) => ({ ...d, fullName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.textPrimary, border: `1.5px solid ${P.secondary}30` }}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-relation" className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: P.default }}>
                      Relación con la Escuela
                    </label>
                    <select
                      id="edit-relation"
                      value={infoDraft.schoolRelation}
                      onChange={(e) => setInfoDraft((d) => ({
                        ...d,
                        schoolRelation: e.target.value,
                        semester: e.target.value !== "STUDENT" ? null : d.semester,
                      }))}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.textPrimary, border: `1.5px solid ${P.secondary}30` }}
                    >
                      <option value="">Selecciona...</option>
                      {RELATIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  {infoDraft.schoolRelation === "STUDENT" && (
                    <>
                      <div>
                        <label htmlFor="edit-program" className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: P.default }}>
                          Programa académico
                        </label>
                        <select
                          id="edit-program"
                          value={infoDraft.academicProgram}
                          onChange={(e) => setInfoDraft((d) => ({ ...d, academicProgram: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl outline-none"
                          style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.textPrimary, border: `1.5px solid ${P.secondary}30` }}
                        >
                          <option value="">Selecciona...</option>
                          {PROGRAMS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="edit-semester" className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: P.default }}>
                          Semestre
                        </label>
                        <input
                          id="edit-semester"
                          type="number"
                          min={1}
                          max={10}
                          value={infoDraft.semester ?? ""}
                          onChange={(e) => {
                            const v = parseInt(e.target.value);
                            setInfoDraft((d) => ({ ...d, semester: isNaN(v) ? null : Math.min(10, Math.max(1, v)) }));
                          }}
                          className="w-full px-4 py-3 rounded-xl outline-none"
                          style={{ fontSize: "0.88rem", fontWeight: 500, backgroundColor: P.bg, color: P.textPrimary, border: `1.5px solid ${P.secondary}30` }}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setShowInfoEditor(false)}
                    className="px-4 py-2.5 rounded-xl transition-opacity hover:opacity-80"
                    style={{ backgroundColor: P.bg, color: P.default, fontWeight: 700, fontSize: "0.82rem" }}
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveInfo}
                    className="px-4 py-2.5 rounded-xl text-white flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: P.secondary, fontWeight: 700, fontSize: "0.82rem" }}
                  >
                    <Save style={{ width: 14, height: 14 }} />
                    Guardar
                  </button>
                </div>
              </div>
            </ModalShell>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-2xl text-white"
              style={{ backgroundColor: P.success, boxShadow: `0 12px 40px ${P.success}45`, fontSize: "0.84rem", fontWeight: 700 }}
              role="status"
              aria-live="polite"
            >
              {feedbackMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
