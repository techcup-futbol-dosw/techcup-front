import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Palette, Shield, Users, Shirt, Upload } from "lucide-react";
import { readUICache, writeUICache } from "@/core/utils/uiCache";

const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  success: "#17C964",
  info: "#0066FE",
  default: "#6E6E73",
  textPrimary: "#1C1C1E",
  bg: "#F2F2F7",
};

type TeamStatus = "pending-payment" | "in-review" | "active";
type RoleType = "capitan" | "jugador";

interface TeamRosterMember {
  id: number;
  name: string;
  email: string;
  role: "Capitán" | "Jugador";
  jerseyNumber: number;
}

interface TeamScheduleItem {
  id: number;
  date: string;
  label: string;
  opponent: string;
  venue: string;
  hour: string;
}

interface TeamSetupState {
  teamName?: string;
  teamMembers?: TeamRosterMember[];
  teamSchedule?: TeamScheduleItem[];
  roleInTeam?: RoleType;
  teamStatus?: TeamStatus;
}

const TEAM_CONTEXT_STORAGE_KEY = "techcup.teamContext";

interface StoredTeamContext {
  roleInTeam?: RoleType;
  teamStatus?: TeamStatus;
  teamName?: string;
  teamMembers?: TeamRosterMember[];
  teamSchedule?: TeamScheduleItem[];
  primaryColor?: string;
  secondaryColor?: string;
  logoFileName?: string | null;
  confirmedLineups?: Record<number, string>;
}

const formationOptions = ["4-3-3", "1-4-4-2", "1-4-2-3-1", "1-5-3-2", "1-3-5-2"];

const defaultMembers: TeamRosterMember[] = [
  { id: 1, name: "Tú", email: "capitan@techcup.local", role: "Capitán", jerseyNumber: 10 },
  { id: 2, name: "mateo", email: "mateo@mail.edu", role: "Jugador", jerseyNumber: 11 },
  { id: 3, name: "isabela", email: "isabela@mail.edu", role: "Jugador", jerseyNumber: 7 },
  { id: 4, name: "santiago", email: "santiago@mail.edu", role: "Jugador", jerseyNumber: 3 },
  { id: 5, name: "camila", email: "camila@mail.edu", role: "Jugador", jerseyNumber: 1 },
  { id: 6, name: "nicolas", email: "nicolas@mail.edu", role: "Jugador", jerseyNumber: 5 },
  { id: 7, name: "paula", email: "paula@mail.edu", role: "Jugador", jerseyNumber: 16 },
  { id: 8, name: "juan", email: "juan@mail.edu", role: "Jugador", jerseyNumber: 20 },
];

const defaultSchedule: TeamScheduleItem[] = [];

const getLineupSignature = (lineup: { formation: string; starters: number[] }) => {
  const starters = [...lineup.starters].sort((a, b) => a - b);
  return `${lineup.formation}|${starters.join(",")}`;
};

export function TeamPrePaymentSetup() {
  const location = useLocation();
  const state = (location.state as TeamSetupState | undefined) ?? {};

  const loadStoredTeamContext = () => {
    return readUICache<StoredTeamContext | null>(TEAM_CONTEXT_STORAGE_KEY, null);
  };

  const storedTeamContext = loadStoredTeamContext();

  const roleInTeam = state.roleInTeam ?? storedTeamContext?.roleInTeam ?? "capitan";
  const teamStatus = state.teamStatus ?? storedTeamContext?.teamStatus ?? "pending-payment";
  const isLockedByPayment = teamStatus === "in-review" || teamStatus === "active";
  const canEdit = roleInTeam === "capitan" && !isLockedByPayment;

  const [teamName] = useState(state.teamName ?? storedTeamContext?.teamName ?? "alfa");
  const [members, setMembers] = useState<TeamRosterMember[]>(state.teamMembers?.length ? state.teamMembers : storedTeamContext?.teamMembers?.length ? storedTeamContext.teamMembers : defaultMembers);
  const [savedPrimaryColor, setSavedPrimaryColor] = useState(storedTeamContext?.primaryColor ?? "#B81C1C");
  const [savedSecondaryColor, setSavedSecondaryColor] = useState(storedTeamContext?.secondaryColor ?? "#C4841D");
  const [draftPrimaryColor, setDraftPrimaryColor] = useState(storedTeamContext?.primaryColor ?? "#B81C1C");
  const [draftSecondaryColor, setDraftSecondaryColor] = useState(storedTeamContext?.secondaryColor ?? "#C4841D");
  const [savedLogoLabel, setSavedLogoLabel] = useState<string | null>(storedTeamContext?.logoFileName ?? null);
  const [draftLogoLabel, setDraftLogoLabel] = useState<string | null>(storedTeamContext?.logoFileName ?? null);
  const [isEditingLogo, setIsEditingLogo] = useState(canEdit);
  const [isEditingColors, setIsEditingColors] = useState(canEdit);
  const [designNotice, setDesignNotice] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [lineupNotice, setLineupNotice] = useState<string | null>(null);
  const [memberNotice, setMemberNotice] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberJersey, setNewMemberJersey] = useState("");
  const [jerseyDrafts, setJerseyDrafts] = useState<Record<number, number>>(() =>
    (state.teamMembers?.length ? state.teamMembers : defaultMembers).reduce<Record<number, number>>((acc, member) => {
      acc[member.id] = member.jerseyNumber;
      return acc;
    }, {})
  );

  const schedule = state.teamSchedule?.length ? state.teamSchedule : defaultSchedule;

  const [lineups, setLineups] = useState<Record<number, { formation: string; starters: number[] }>>(() => {
    return schedule.reduce<Record<number, { formation: string; starters: number[] }>>((acc, match, index) => {
      acc[match.id] = {
        formation: formationOptions[index % formationOptions.length],
        starters: (state.teamMembers?.length ? state.teamMembers : defaultMembers).slice(0, 7).map((m) => m.id),
      };
      return acc;
    }, {});
  });

  const [confirmedLineups, setConfirmedLineups] = useState<Record<number, string>>(storedTeamContext?.confirmedLineups ?? {});

  const persistTeamContext = (nextContext: StoredTeamContext) => {
    writeUICache(TEAM_CONTEXT_STORAGE_KEY, nextContext);
  };

  useEffect(() => {
    persistTeamContext({
      roleInTeam,
      teamStatus,
      teamName,
      teamMembers: members,
      teamSchedule: schedule,
      primaryColor: savedPrimaryColor,
      secondaryColor: savedSecondaryColor,
      logoFileName: savedLogoLabel ?? draftLogoLabel ?? storedTeamContext?.logoFileName ?? null,
      confirmedLineups,
    });
  }, [roleInTeam, teamStatus, teamName, members, schedule, savedPrimaryColor, savedSecondaryColor, savedLogoLabel, draftLogoLabel, confirmedLineups]);

  const membersValidation = useMemo(() => {
    const count = members.length;
    return {
      count,
      hasMin: count >= 7,
      hasMax: count <= 12,
      isValid: count >= 7 && count <= 12,
    };
  }, [members]);

  const updateJersey = (memberId: number, value: number) => {
    if (!canEdit) return;
    if (!Number.isInteger(value) || value < 0 || value > 99) return;

    const isTaken = members.some((member) => member.id !== memberId && member.jerseyNumber === value);
    if (isTaken) return;

    setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, jerseyNumber: value } : member)));
    setJerseyDrafts((prev) => ({ ...prev, [memberId]: value }));
  };

  const canSaveJersey = (memberId: number) => {
    const member = members.find((item) => item.id === memberId);
    if (!member) return false;
    const draft = jerseyDrafts[memberId];
    if (!Number.isInteger(draft) || draft < 0 || draft > 99) return false;
    if (draft === member.jerseyNumber) return false;
    const repeated = members.some((item) => item.id !== memberId && item.jerseyNumber === draft);
    return !repeated;
  };

  const saveJersey = (memberId: number) => {
    if (!canEdit) return;
    if (!canSaveJersey(memberId)) return;
    const draft = jerseyDrafts[memberId];
    updateJersey(memberId, draft);
    setMemberError(null);
    setMemberNotice("Dorsal guardado correctamente.");
  };

  const removeMember = (memberId: number) => {
    if (!canEdit) return;
    setMembers((prev) => {
      const target = prev.find((member) => member.id === memberId);
      if (!target || target.role === "Capitán") return prev;
      if (prev.length <= 7) return prev;
      return prev.filter((member) => member.id !== memberId);
    });

    setJerseyDrafts((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });

    setLineups((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((matchId) => {
        next[Number(matchId)] = {
          ...next[Number(matchId)],
          starters: next[Number(matchId)].starters.filter((id) => id !== memberId),
        };
      });
      return next;
    });

    setMemberError(null);
    setMemberNotice("Jugador eliminado de la plantilla.");
  };

  const addMember = () => {
    if (!canEdit) return;

    const email = newMemberEmail.trim().toLowerCase();
    const jersey = Number(newMemberJersey);

    if (members.length >= 12) {
      setMemberError("No puedes superar 12 integrantes en la plantilla.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMemberError("Ingresa un correo válido.");
      return;
    }
    if (!/\.edu(\.[a-z]{2})?$/i.test(email)) {
      setMemberError("El correo del jugador debe ser institucional (.edu).");
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === email)) {
      setMemberError("Ese correo ya está registrado en la plantilla.");
      return;
    }
    if (!Number.isInteger(jersey) || jersey < 0 || jersey > 99) {
      setMemberError("El dorsal debe estar entre 0 y 99.");
      return;
    }
    if (members.some((member) => member.jerseyNumber === jersey)) {
      setMemberError("Ese dorsal ya está asignado.");
      return;
    }

    const nextId = members.reduce((max, member) => Math.max(max, member.id), 0) + 1;
    const generatedName = email.split("@")[0] || `jugador-${nextId}`;
    const newMember: TeamRosterMember = {
      id: nextId,
      name: generatedName,
      email,
      role: "Jugador",
      jerseyNumber: jersey,
    };

    setMembers((prev) => [...prev, newMember]);
    setJerseyDrafts((prev) => ({ ...prev, [nextId]: jersey }));
    setNewMemberEmail("");
    setNewMemberJersey("");
    setMemberError(null);
    setMemberNotice("Jugador agregado correctamente.");
  };

  const handleLogoUpload = (file: File | null) => {
    if (!canEdit || !isEditingLogo) return;
    if (!file) return;
    if (file.type !== "image/png") {
      setLogoError("El escudo debe estar en formato PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("El archivo PNG no puede superar 5 MB.");
      return;
    }
    setLogoError(null);
    setDraftLogoLabel(file.name);
    setDesignNotice(null);
  };

  const isLogoDirty = draftLogoLabel !== savedLogoLabel;
  const isColorsDirty = draftPrimaryColor !== savedPrimaryColor || draftSecondaryColor !== savedSecondaryColor;

  const saveLogoChanges = () => {
    if (!canEdit || !isEditingLogo || !isLogoDirty) return;
    setSavedLogoLabel(draftLogoLabel);
    setIsEditingLogo(false);
    setLogoError(null);
    setDesignNotice("Escudo guardado correctamente.");
  };

  const enableLogoChanges = () => {
    if (!canEdit) return;
    setIsEditingLogo(true);
    setDesignNotice(null);
  };

  const saveColorChanges = () => {
    if (!canEdit || !isEditingColors || !isColorsDirty) return;
    setSavedPrimaryColor(draftPrimaryColor);
    setSavedSecondaryColor(draftSecondaryColor);
    setIsEditingColors(false);
    setDesignNotice("Colores guardados correctamente.");
  };

  const enableColorChanges = () => {
    if (!canEdit) return;
    setIsEditingColors(true);
    setDesignNotice(null);
  };

  const toggleStarter = (matchId: number, memberId: number) => {
    if (!canEdit) return;
    setLineups((prev) => {
      const current = prev[matchId];
      if (!current) return prev;

      const exists = current.starters.includes(memberId);
      const nextStarters = exists
        ? current.starters.filter((id) => id !== memberId)
        : [...current.starters, memberId];

      if (nextStarters.length > 7) return prev;

      return {
        ...prev,
        [matchId]: {
          ...current,
          starters: nextStarters,
        },
      };
    });
  };

  const confirmLineup = (matchId: number) => {
    if (!canEdit) return;
    const current = lineups[matchId];
    if (!current || current.starters.length !== 7) return;

    setConfirmedLineups((prev) => ({
      ...prev,
      [matchId]: getLineupSignature(current),
    }));
    setLineupNotice(`Alineación confirmada para ${schedule.find((m) => m.id === matchId)?.opponent ?? "el partido"}.`);
  };

  const statusLabel =
    teamStatus === "pending-payment"
      ? "Pendiente de pago"
      : teamStatus === "in-review"
        ? "En revisión"
        : "Activo";

  const statusColor =
    teamStatus === "pending-payment"
      ? P.secondary
      : teamStatus === "in-review"
        ? P.info
        : P.success;

  return (
    <div className="min-h-screen" style={{ backgroundColor: P.bg }}>
      <header
        className="sticky top-0 z-30 border-b px-4 sm:px-6"
        style={{
          background: "rgba(242,242,247,0.88)",
          borderColor: "rgba(0,0,0,0.06)",
          backdropFilter: "saturate(180%) blur(14px)",
          WebkitBackdropFilter: "saturate(180%) blur(14px)",
        }}
      >
        <div className="max-w-5xl mx-auto h-14 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm" style={{ color: P.default, fontWeight: 700 }}>
            <ArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </Link>
          <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${statusColor}20`, color: statusColor, fontWeight: 800 }}>
            {statusLabel}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-10 space-y-5" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom, 0px))" }}>
        <section className="rounded-3xl p-5 sm:p-6 border bg-white" style={{ borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 8px 28px rgba(0,0,0,0.05)" }}>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: P.primary, fontWeight: 800 }}>Configuración previa al pago</p>
          <h1 className="mt-2 text-2xl" style={{ color: P.textPrimary, fontWeight: 800 }}>{teamName}</h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: P.default, fontWeight: 500 }}>
            Aquí puedes configurar escudo PNG, colores del equipo, dorsales y plantilla antes de subir el pago.
            Cuando la inscripción cambie a <span style={{ fontWeight: 800 }}>En revisión</span> o <span style={{ fontWeight: 800 }}>Activo</span>, estas opciones quedan bloqueadas.
          </p>

          {isLockedByPayment && (
            <div className="mt-3 rounded-xl px-3 py-2" style={{ backgroundColor: `${P.secondary}14`, color: P.secondary, fontWeight: 700, fontSize: "0.78rem" }}>
              Edición bloqueada: el pago ya fue enviado y el equipo está en proceso o activo.
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-2xl p-3" style={{ backgroundColor: `${membersValidation.hasMin ? P.success : P.primary}10`, color: membersValidation.hasMin ? P.success : P.primary, fontWeight: 700 }}>
              Mínimo 7 jugadores: {membersValidation.count}/7
            </div>
            <div className="rounded-2xl p-3" style={{ backgroundColor: `${membersValidation.hasMax ? P.success : P.primary}10`, color: membersValidation.hasMax ? P.success : P.primary, fontWeight: 700 }}>
              Máximo 12 jugadores: {membersValidation.count}/12
            </div>
            <div className="rounded-2xl p-3" style={{ backgroundColor: `${canEdit ? P.info : P.default}14`, color: canEdit ? P.info : P.default, fontWeight: 700 }}>
              Edición: {canEdit ? "Habilitada" : "Bloqueada"}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <article className="rounded-3xl p-5 sm:p-6 border bg-white" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4" style={{ color: P.primary }} />
              <h2 className="text-base" style={{ color: P.textPrimary, fontWeight: 800 }}>Escudo del Equipo (PNG)</h2>
            </div>

            <label
              className="w-full rounded-2xl border border-dashed p-4 flex items-center justify-between"
              style={{ borderColor: canEdit && isEditingLogo ? `${P.primary}55` : "rgba(0,0,0,0.12)", backgroundColor: canEdit && isEditingLogo ? `${P.primary}06` : "#FAFAFA", cursor: canEdit && isEditingLogo ? "pointer" : "not-allowed" }}
            >
              <div>
                <p className="text-sm" style={{ color: P.textPrimary, fontWeight: 700 }}>
                  {draftLogoLabel ?? savedLogoLabel ?? "Subir logo en PNG"}
                </p>
                <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 500 }}>Máximo 5 MB. Se recomienda fondo transparente.</p>
              </div>
              <Upload className="w-4 h-4" style={{ color: canEdit && isEditingLogo ? P.primary : P.default }} />
              <input
                disabled={!canEdit || !isEditingLogo}
                type="file"
                accept="image/png"
                className="hidden"
                onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)}
              />
            </label>
            {logoError && <p className="text-xs mt-2" style={{ color: P.primary, fontWeight: 700 }}>{logoError}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!canEdit || !isEditingLogo || !isLogoDirty}
                onClick={saveLogoChanges}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{
                  borderColor: `${P.success}45`,
                  color: P.success,
                  fontWeight: 800,
                  opacity: !canEdit || !isEditingLogo || !isLogoDirty ? 0.45 : 1,
                }}
              >
                Guardar cambios
              </button>
              <button
                type="button"
                disabled={!canEdit}
                onClick={enableLogoChanges}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{
                  borderColor: `${P.info}45`,
                  color: P.info,
                  fontWeight: 800,
                  opacity: !canEdit ? 0.45 : 1,
                }}
              >
                Cambiar
              </button>
            </div>
          </article>

          <article className="rounded-3xl p-5 sm:p-6 border bg-white" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4" style={{ color: P.secondary }} />
              <h2 className="text-base" style={{ color: P.textPrimary, fontWeight: 800 }}>Colores del Equipo</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="rounded-2xl border p-3" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <p className="text-xs mb-2" style={{ color: P.default, fontWeight: 700 }}>Color principal</p>
                <input disabled={!canEdit || !isEditingColors} type="color" value={draftPrimaryColor} onChange={(event) => setDraftPrimaryColor(event.target.value)} className="w-full h-10 rounded cursor-pointer" />
              </label>
              <label className="rounded-2xl border p-3" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <p className="text-xs mb-2" style={{ color: P.default, fontWeight: 700 }}>Color secundario</p>
                <input disabled={!canEdit || !isEditingColors} type="color" value={draftSecondaryColor} onChange={(event) => setDraftSecondaryColor(event.target.value)} className="w-full h-10 rounded cursor-pointer" />
              </label>
            </div>

            <div className="mt-4 rounded-2xl p-3" style={{ background: `linear-gradient(135deg, ${draftPrimaryColor} 0%, ${draftSecondaryColor} 100%)` }}>
              <p className="text-xs text-white/90" style={{ fontWeight: 700 }}>Vista previa de identidad del equipo</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!canEdit || !isEditingColors || !isColorsDirty}
                onClick={saveColorChanges}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{
                  borderColor: `${P.success}45`,
                  color: P.success,
                  fontWeight: 800,
                  opacity: !canEdit || !isEditingColors || !isColorsDirty ? 0.45 : 1,
                }}
              >
                Guardar cambios
              </button>
              <button
                type="button"
                disabled={!canEdit}
                onClick={enableColorChanges}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{
                  borderColor: `${P.info}45`,
                  color: P.info,
                  fontWeight: 800,
                  opacity: !canEdit ? 0.45 : 1,
                }}
              >
                Cambiar
              </button>
            </div>
          </article>
        </section>

        {designNotice && (
          <section className="rounded-2xl px-4 py-3 border bg-white" style={{ borderColor: `${P.success}30`, color: P.success }}>
            <p className="text-xs" style={{ fontWeight: 700 }}>{designNotice}</p>
          </section>
        )}

        <section className="rounded-3xl p-5 sm:p-6 border bg-white" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4" style={{ color: P.info }} />
            <h2 className="text-base" style={{ color: P.textPrimary, fontWeight: 800 }}>Plantilla, Dorsales y Elegibilidad</h2>
          </div>

          <p className="text-xs mb-4" style={{ color: P.default, fontWeight: 500 }}>
            Puedes modificar dorsales y eliminar jugadores antes del pago. Si el equipo está en revisión o activo, estas acciones se deshabilitan.
          </p>

          <div className="rounded-2xl border p-3 mb-4" style={{ borderColor: "rgba(0,0,0,0.08)", backgroundColor: "#FAFAFA" }}>
            <p className="text-xs mb-2" style={{ color: P.textPrimary, fontWeight: 700 }}>Agregar jugador</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                disabled={!canEdit}
                value={newMemberEmail}
                onChange={(event) => setNewMemberEmail(event.target.value)}
                placeholder="correo@mail.edu"
                className="rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "rgba(0,0,0,0.15)", color: P.textPrimary, fontWeight: 600 }}
              />
              <input
                disabled={!canEdit}
                type="number"
                min={0}
                max={99}
                value={newMemberJersey}
                onChange={(event) => setNewMemberJersey(event.target.value)}
                placeholder="Dorsal"
                className="rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "rgba(0,0,0,0.15)", color: P.textPrimary, fontWeight: 600 }}
              />
              <button
                type="button"
                disabled={!canEdit || members.length >= 12}
                onClick={addMember}
                className="rounded-lg border px-3 py-1.5 text-xs"
                style={{
                  borderColor: `${P.info}45`,
                  color: P.info,
                  fontWeight: 800,
                  backgroundColor: "white",
                  opacity: !canEdit || members.length >= 12 ? 0.45 : 1,
                }}
              >
                Agregar
              </button>
            </div>
            {memberError && <p className="text-xs mt-2" style={{ color: P.primary, fontWeight: 700 }}>{memberError}</p>}
            {memberNotice && <p className="text-xs mt-2" style={{ color: P.success, fontWeight: 700 }}>{memberNotice}</p>}
          </div>

          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="rounded-2xl border px-3 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: P.textPrimary, fontWeight: 700 }}>{member.name}</p>
                  <p className="text-xs" style={{ color: P.default, fontWeight: 500 }}>{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4" style={{ color: P.default }} />
                  <input
                    disabled={!canEdit}
                    type="number"
                    min={0}
                    max={99}
                    value={jerseyDrafts[member.id] ?? member.jerseyNumber}
                    onChange={(event) => {
                      const parsed = Number(event.target.value);
                      if (!Number.isNaN(parsed)) {
                        setJerseyDrafts((prev) => ({ ...prev, [member.id]: parsed }));
                      }
                    }}
                    className="w-20 rounded-lg border px-2 py-1 text-sm"
                    style={{ borderColor: "rgba(0,0,0,0.15)", color: P.textPrimary, fontWeight: 700 }}
                  />
                </div>
                <button
                  type="button"
                  disabled={!canEdit || !canSaveJersey(member.id)}
                  onClick={() => saveJersey(member.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border"
                  style={{
                    borderColor: `${P.info}40`,
                    color: P.info,
                    fontWeight: 700,
                    opacity: !canEdit || !canSaveJersey(member.id) ? 0.45 : 1,
                  }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  disabled={!canEdit || member.role === "Capitán" || members.length <= 7}
                  onClick={() => removeMember(member.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border"
                  style={{
                    borderColor: `${P.primary}35`,
                    color: P.primary,
                    fontWeight: 700,
                    opacity: !canEdit || member.role === "Capitán" || members.length <= 7 ? 0.45 : 1,
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl p-5 sm:p-6 border bg-white" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <h2 className="text-base mb-1" style={{ color: P.textPrimary, fontWeight: 800 }}>Alineación por Partido</h2>
          <p className="text-xs mb-4" style={{ color: P.default, fontWeight: 500 }}>
            Antes de cada partido el capitán puede escoger formación, titulares y reservas. Debes seleccionar máximo 7 titulares por partido.
          </p>

          {lineupNotice && (
            <div className="mb-4 rounded-xl px-3 py-2" style={{ backgroundColor: `${P.success}14`, color: P.success, fontWeight: 700, fontSize: "0.75rem" }}>
              {lineupNotice}
            </div>
          )}

          <div className="space-y-4">
            {schedule.length === 0 ? (
              <div className="rounded-2xl border px-4 py-6 text-center" style={{ borderColor: "rgba(0,0,0,0.08)", backgroundColor: "#FAFAFA" }}>
                <p className="text-sm" style={{ color: P.textPrimary, fontWeight: 700 }}>No hay partidos asignados todavía</p>
                <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 500 }}>
                  Cuando el backend publique el calendario de tu equipo, podrás confirmar alineaciones aquí.
                </p>
              </div>
            ) : schedule.map((match) => {
              const lineup = lineups[match.id];
              const starters = lineup?.starters ?? [];
              const lineupSignature = lineup ? getLineupSignature(lineup) : "";
              const isConfirmed = confirmedLineups[match.id] === lineupSignature;
              const canConfirm = canEdit && starters.length === 7 && !isConfirmed;
              return (
                <article key={match.id} className="rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm" style={{ color: P.textPrimary, fontWeight: 700 }}>{match.opponent}</p>
                      <p className="text-xs" style={{ color: P.default, fontWeight: 500 }}>{match.label} · {match.date} · {match.hour} · {match.venue}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        disabled={!canEdit}
                        value={lineup?.formation ?? formationOptions[0]}
                        onChange={(event) => {
                          if (!canEdit) return;
                          setLineups((prev) => ({
                            ...prev,
                            [match.id]: {
                              ...prev[match.id],
                              formation: event.target.value,
                            },
                          }));
                        }}
                        className="rounded-lg border px-2 py-1 text-xs"
                        style={{ borderColor: "rgba(0,0,0,0.15)", color: P.textPrimary, fontWeight: 700 }}
                      >
                        {formationOptions.map((formation) => (
                          <option key={formation} value={formation}>{formation}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!canConfirm}
                        onClick={() => confirmLineup(match.id)}
                        className="rounded-lg border px-3 py-1 text-xs"
                        style={{
                          borderColor: isConfirmed ? `${P.success}55` : `${P.secondary}45`,
                          color: isConfirmed ? P.success : P.secondary,
                          backgroundColor: "white",
                          fontWeight: 800,
                          opacity: canConfirm || isConfirmed ? 1 : 0.45,
                        }}
                      >
                        {isConfirmed ? "Alineación confirmada" : "Confirmar alineación"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {members.map((member) => {
                      const checked = starters.includes(member.id);
                      return (
                        <label key={`${match.id}-${member.id}`} className="rounded-xl border px-2.5 py-2 flex items-center justify-between" style={{ borderColor: checked ? `${P.info}50` : "rgba(0,0,0,0.08)", backgroundColor: checked ? `${P.info}10` : "white" }}>
                          <span className="text-xs" style={{ color: P.textPrimary, fontWeight: 600 }}>
                            {member.name} · #{member.jerseyNumber}
                          </span>
                          <input
                            disabled={!canEdit}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStarter(match.id, member.id)}
                          />
                        </label>
                      );
                    })}
                  </div>

                  <p className="text-xs mt-3" style={{ color: starters.length === 7 ? P.success : P.secondary, fontWeight: 700 }}>
                    Titulares: {starters.length}/7 · Reservas: {Math.max(0, members.length - starters.length)}
                  </p>
                  {isConfirmed && (
                    <p className="text-xs mt-1" style={{ color: P.success, fontWeight: 700 }}>
                      Esta alineación está confirmada para este partido.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl p-4 border bg-white" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-start gap-2.5">
            {canEdit ? <CheckCircle2 className="w-4 h-4 mt-0.5" style={{ color: P.success }} /> : <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: P.secondary }} />}
            <div>
              <p className="text-sm" style={{ color: P.textPrimary, fontWeight: 800 }}>
                {canEdit ? "Puedes ajustar tu equipo antes de pagar" : "Cambios bloqueados por estado de inscripción"}
              </p>
              <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 500 }}>
                Cuando finalices esta configuración, vuelve al dashboard y sube el comprobante de pago para continuar el proceso.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
