// src/modules/users/pages/PlayerSearch.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import logoTechcup from "@/assets/logo.png";
import { playerService, type PlayerDto } from "@/modules/users/services/playerService";
import { LogoutAction } from "@/core/components/LogoutAction";
import {
  ArrowLeft,
  Search,
  X,
  SlidersHorizontal,
  Check,
  UserCheck,
  UserX,
  Loader2,
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

const positionMeta: Record<string, { label: string; bg: string; color: string }> = {
  GOALKEEPER: { label: "Portero",   bg: "rgba(0,102,254,0.10)",  color: "#0066FE" },
  DEFENDER:   { label: "Defensa",   bg: "rgba(23,201,100,0.10)", color: "#17C964" },
  MIDFIELDER: { label: "Volante",   bg: "rgba(196,132,29,0.12)", color: "#C4841D" },
  FORWARD:    { label: "Delantero", bg: "rgba(184,28,28,0.10)",  color: "#B81C1C" },
};

const JUGADORES_MOCK: PlayerDto[] = [
  { id: 1, fullName: "Carlos Martínez", identification: "1234567890", birthDate: "2004-05-10", gender: "MALE",   semester: 5, status: "ACTIVE", schoolRelation: "STUDENT", academicProgram: "Ingeniería de Sistemas", position: "FORWARD",    dorsalNumber: 10, available: true,  email: "carlos.martinez@universidad.edu" },
  { id: 2, fullName: "Ana García",       identification: "0987654321", birthDate: "2005-03-22", gender: "FEMALE", semester: 6, status: "ACTIVE", schoolRelation: "STUDENT", academicProgram: "Ingeniería Civil",       position: "MIDFIELDER", dorsalNumber: 8,  available: false, email: "ana.garcia@universidad.edu" },
  { id: 3, fullName: "Juan Pérez",       identification: "1122334455", birthDate: "2003-11-15", gender: "MALE",   semester: 7, status: "ACTIVE", schoolRelation: "STUDENT", academicProgram: "Ingeniería Eléctrica",   position: "DEFENDER",   dorsalNumber: 4,  available: true,  email: "juan.perez@universidad.edu" },
  { id: 4, fullName: "María López",      identification: "5544332211", birthDate: "2006-01-08", gender: "FEMALE", semester: 4, status: "ACTIVE", schoolRelation: "STUDENT", academicProgram: "Ingeniería Biomédica",   position: "GOALKEEPER", dorsalNumber: 1,  available: true,  email: "maria.lopez@universidad.edu" },
  { id: 5, fullName: "Diego Ramírez",    identification: "9988776655", birthDate: "2002-07-30", gender: "MALE",   semester: 8, status: "ACTIVE", schoolRelation: "EMPLOYEE", academicProgram: "Ingeniería Industrial",  position: "MIDFIELDER", dorsalNumber: 6,  available: false, email: "diego.ramirez@empresa.com" },
];

function calcAge(birthDate: string): number {
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function availabilityBorderColor(available: boolean | undefined): string {
  return available ? "#17C964" : "#B81C1C";
}

function validateAgeInput(ageStr: string): string | null {
  const trimmed = ageStr.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return "La edad debe ser un número entero.";
  const n = Number.parseInt(trimmed, 10);
  if (Number.isNaN(n)) return "Edad inválida.";
  if (n < 16) return "La edad mínima permitida es 16.";
  if (n > 99) return "La edad máxima permitida es 99.";
  return null;
}

function validateIdInput(idStr: string): string | null {
  const trimmed = idStr.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return "La identificación debe contener solo dígitos.";
  return null;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const escaped = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "i");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark key={i} style={{ background: "#FDE68A", color: "#111", padding: "0 2px", borderRadius: 3 }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── PlayerCard ────────────────────────────────────
function PlayerCard({
  player,
  query,
  onInvite,
  invited,
  canInvite,
}: {
  player: PlayerDto;
  query: string;
  onInvite?: (id: number) => void;
  invited?: boolean;
  canInvite?: boolean;
}) {
  const pos = player.position
    ? (positionMeta[player.position] ?? { label: player.position, bg: `${P.default}14`, color: P.default })
    : null;
  const avail = player.available ?? false;
  const borderColor = availabilityBorderColor(player.available);
  const age = player.birthDate ? calcAge(player.birthDate) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-[20px] p-5 flex flex-col gap-4"
      style={{ border: `2px solid ${borderColor}`, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl"
          style={{ background: `linear-gradient(135deg, ${P.primary}, ${P.secondary})`, fontWeight: 800 }}
        >
          {player.dorsalNumber ?? "?"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base leading-snug" style={{ fontWeight: 700, color: P.textPrimary }}>
              {highlight(player.fullName, query)}
            </h3>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
              style={{
                backgroundColor: avail ? `${P.success}15` : `${P.primary}12`,
                color: avail ? P.success : P.primary,
              }}
            >
              {avail ? <UserCheck style={{ width: 11, height: 11 }} /> : <UserX style={{ width: 11, height: 11 }} />}
              {avail ? "Disponible" : "No disponible"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {pos && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: pos.bg, color: pos.color }}>
                {pos.label}
              </span>
            )}
            {age !== null && <span className="text-xs" style={{ color: P.default }}>{age} años</span>}
            {player.semester > 0 && (
              <>
                <span className="text-xs" style={{ color: P.default }}>·</span>
                <span className="text-xs" style={{ color: P.default }}>{player.semester}°</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl px-3 py-2.5 space-y-0.5" style={{ backgroundColor: P.bg }}>
        <p className="text-xs" style={{ color: P.default, fontWeight: 600 }}>
          ID: <span style={{ color: P.textPrimary }}>{player.identification}</span>
        </p>
        <p className="text-xs truncate" style={{ color: P.default, fontWeight: 600 }}>
          <span style={{ color: P.textPrimary }}>{player.email}</span>
        </p>
      </div>

      {onInvite && (
        <motion.button
          whileHover={!invited && canInvite ? { scale: 1.02 } : {}}
          whileTap={!invited && canInvite ? { scale: 0.98 } : {}}
          type="button"
          onClick={() => canInvite && !invited && onInvite(player.id)}
          className="w-full py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2"
          style={{
            backgroundColor: invited ? P.success : canInvite ? P.primary : P.default,
            fontWeight: 700,
            opacity: !canInvite && !invited ? 0.6 : 1,
            cursor: invited || !canInvite ? "default" : "pointer",
          }}
          title={!canInvite ? "Navega desde tu equipo para invitar jugadores" : undefined}
        >
          {invited ? (
            <><Check style={{ width: 15, height: 15 }} /> Invitación enviada</>
          ) : canInvite ? (
            "Invitar al Equipo"
          ) : (
            "Sin equipo activo"
          )}
        </motion.button>
      )}
    </motion.article>
  );
}

// ── PlayerSearch ──────────────────────────────────
export default function PlayerSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const teamContext = (location.state as { teamId?: number; teamName?: string } | null) ?? null;

  const [filters, setFilters] = useState({
    nombre: "", identificacion: "", posicion: "", edad: "", genero: "", semestre: "", onlyAvailable: false,
  });
  const [ageError, setAgeError] = useState<string | null>(null);
  const [idError, setIdError]   = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [players, setPlayers]   = useState<PlayerDto[]>([]);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast]       = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const [invited, setInvited]   = useState<Set<number>>(new Set());

  const [debouncedName, setDebouncedName] = useState(filters.nombre);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(filters.nombre), 350);
    return () => clearTimeout(t);
  }, [filters.nombre]);

  useEffect(() => {
    const isEditable = (el: Element | null) => {
      if (!el) return false;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true;
      if ((el as HTMLElement).getAttribute?.("contenteditable") === "true") return true;
      return false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "/" && !isEditable(document.activeElement)) {
        e.preventDefault();
        nameInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { setAgeError(validateAgeInput(filters.edad)); }, [filters.edad]);
  useEffect(() => { setIdError(validateIdInput(filters.identificacion)); }, [filters.identificacion]);

  const fetchPlayers = useCallback(async () => {
    if (validateAgeInput(filters.edad) || validateIdInput(filters.identificacion)) return;

    setLoading(true);
    setApiError(null);
    setUsingMock(false);
    try {
      const data = await playerService.search({
        name:           debouncedName || undefined,
        identification: filters.identificacion || undefined,
        position:       filters.posicion || undefined,
        gender:         filters.genero || undefined,
        semester:       filters.semestre || undefined,
        age:            filters.edad ? Number.parseInt(filters.edad, 10) : undefined,
        available:      filters.onlyAvailable || undefined,
      });
      const arr = Array.isArray(data) ? data : ((data as unknown as { content?: PlayerDto[] })?.content ?? []);
      setPlayers(arr);
    } catch {
      setPlayers(JUGADORES_MOCK);
      setUsingMock(true);
      setToast("No se pudo conectar al servidor — usando datos locales (mock)");
    } finally {
      setLoading(false);
    }
  }, [debouncedName, filters.posicion, filters.genero, filters.semestre, filters.onlyAvailable]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const update = (field: keyof typeof filters, value: string | boolean) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const results = useMemo(() => {
    const qName = debouncedName.trim().toLowerCase();
    let r = Array.isArray(players) ? players.slice() : [];
    if (qName)                           r = r.filter((p) => p.fullName.toLowerCase().includes(qName));
    if (filters.identificacion.trim())   r = r.filter((p) => p.identification.includes(filters.identificacion.trim()));
    if (filters.posicion)                r = r.filter((p) => p.position === filters.posicion);
    if (filters.edad) {
      const n = Number.parseInt(filters.edad, 10);
      if (!Number.isNaN(n))              r = r.filter((p) => p.birthDate && calcAge(p.birthDate) === n);
    }
    if (filters.genero)                  r = r.filter((p) => p.gender === filters.genero);
    if (filters.semestre)                r = r.filter((p) => String(p.semester) === filters.semestre);
    if (filters.onlyAvailable)           r = r.filter((p) => p.available);
    r.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return r;
  }, [players, debouncedName, filters]);

  const clearFilters = () => {
    setFilters({ nombre: "", identificacion: "", posicion: "", edad: "", genero: "", semestre: "", onlyAvailable: false });
    setShowAdvanced(false);
    setAgeError(null);
    setIdError(null);
    setApiError(null);
    setToast("Filtros limpiados");
  };

  const handleInvite = async (id: number) => {
    const teamId = teamContext?.teamId;
    if (!teamId) return;
    const p = players.find((x) => x.id === id);
    try {
      await playerService.invite(id, teamId);
      setInvited((prev) => new Set([...prev, id]));
      if (p) setToast(`Invitación enviada a ${p.fullName}`);
    } catch {
      setToast("No se pudo enviar la invitación.");
    }
  };

  const hasActiveFilters = Boolean(
    filters.nombre || filters.identificacion || filters.posicion || filters.edad || filters.genero || filters.semestre || filters.onlyAvailable
  );

  const inputStyle = {
    borderColor: "rgba(0,0,0,0.12)",
    color: P.textPrimary,
    fontWeight: 500,
    fontSize: "0.88rem",
  };

  return (
    <div className="min-h-screen pb-28 lg:pb-0" style={{ backgroundColor: P.bg }}>

      {/* ── Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b px-6"
        style={{ background: "rgba(242,242,247,0.88)", borderColor: "rgba(0,0,0,0.06)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between h-[60px]">
          <motion.button
            whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm"
            style={{ color: P.default, fontWeight: 700 }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Volver
          </motion.button>

          <div className="flex items-center gap-2.5">
            <img src={logoTechcup} alt="TECHCUP" className="w-7 h-7 object-contain" />
            <span style={{ fontWeight: 800, color: P.primary, fontSize: "1rem", letterSpacing: "-0.03em" }}>TECHCUP</span>
          </div>

          <div className="flex items-center justify-end" style={{ width: 70 }}>
            <LogoutAction
              accentColor={P.primary}
              iconColor={P.default}
              buttonAriaLabel="Cerrar sesión"
              title="¿Cerrar sesión?"
              message="Tu sesión en TECHCUP se cerrará. Podrás volver a ingresar cuando quieras."
              cancelLabel="Cancelar"
              confirmLabel="Cerrar sesión"
            />
          </div>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 sm:px-10 pt-8 pb-16">

        {/* ── Title ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.45 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Search style={{ width: 20, height: 20, color: P.primary }} />
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.02em" }}>
              Buscar Jugadores
            </h1>
          </div>
          <p style={{ fontSize: "0.85rem", color: P.default, fontWeight: 500 }}>
            Filtra por nombre y posición. Presiona{" "}
            <kbd className="px-1.5 py-0.5 rounded-md text-xs font-mono" style={{ backgroundColor: "rgba(0,0,0,0.08)", color: P.textPrimary }}>/</kbd>{" "}
            para enfocar la búsqueda.
          </p>
          {usingMock && (
            <p className="mt-1 text-xs" style={{ color: P.secondary, fontWeight: 700 }}>
              ⚠ Mostrando datos de ejemplo — sin conexión al servidor.
            </p>
          )}
          {apiError && (
            <p className="mt-1 text-sm" style={{ color: P.primary, fontWeight: 700 }}>{apiError}</p>
          )}
        </motion.div>

        {/* ── Filters ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.45 }}
          className="bg-white rounded-[20px] p-5 mb-6"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Name */}
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Nombre</label>
              <div className="relative">
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: P.default }} />
                <input
                  ref={nameInputRef}
                  value={filters.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                  placeholder="Ej: Juan"
                  className="w-full border rounded-xl pl-8 pr-3 py-2.5 outline-none transition-all duration-200"
                  style={{ ...inputStyle, borderColor: filters.nombre ? P.primary : "rgba(0,0,0,0.12)", boxShadow: filters.nombre ? `0 0 0 3px ${P.primary}12` : "none" }}
                />
              </div>
            </div>

            {/* Position */}
            <div className="w-full sm:w-44">
              <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Posición</label>
              <select value={filters.posicion} onChange={(e) => update("posicion", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 outline-none" style={inputStyle}>
                <option value="">Todas</option>
                <option value="GOALKEEPER">Portero</option>
                <option value="DEFENDER">Defensa</option>
                <option value="MIDFIELDER">Volante</option>
                <option value="FORWARD">Delantero</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="flex items-end gap-2 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer h-[42px]">
                <div
                  onClick={() => update("onlyAvailable", !filters.onlyAvailable)}
                  className="w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer"
                  style={{ backgroundColor: filters.onlyAvailable ? P.success : "rgba(0,0,0,0.15)" }}
                >
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200" style={{ left: filters.onlyAvailable ? "calc(100% - 18px)" : "2px" }} />
                </div>
                <span className="text-xs whitespace-nowrap" style={{ fontWeight: 600, color: P.default }}>Solo disponibles</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAdvanced((s) => !s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs h-[42px]"
                style={{ borderColor: showAdvanced ? `${P.info}40` : "rgba(0,0,0,0.12)", color: showAdvanced ? P.info : P.default, fontWeight: 700, backgroundColor: showAdvanced ? `${P.info}08` : "white" }}
              >
                <SlidersHorizontal style={{ width: 13, height: 13 }} />
                {showAdvanced ? "Ocultar" : "Más filtros"}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs h-[42px] text-white"
                  style={{ backgroundColor: P.primary, fontWeight: 700 }}
                >
                  <X style={{ width: 13, height: 13 }} />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Advanced */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div>
                    <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Identificación</label>
                    <input
                      value={filters.identificacion}
                      onChange={(e) => update("identificacion", e.target.value)}
                      placeholder="Ej: 1234567890"
                      className="w-full border rounded-xl px-3 py-2 outline-none"
                      style={inputStyle}
                    />
                    {idError && <p className="text-xs mt-1" style={{ color: P.primary, fontWeight: 700 }}>{idError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Género</label>
                    <select value={filters.genero} onChange={(e) => update("genero", e.target.value)} className="w-full border rounded-xl px-3 py-2 outline-none" style={inputStyle}>
                      <option value="">Todos</option>
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Femenino</option>
                      <option value="OTHER">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Semestre</label>
                    <select value={filters.semestre} onChange={(e) => update("semestre", e.target.value)} className="w-full border rounded-xl px-3 py-2 outline-none" style={inputStyle}>
                      <option value="">Todos</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>Semestre {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Edad</label>
                    <input
                      type="number"
                      min={16}
                      max={99}
                      value={filters.edad}
                      onChange={(e) => update("edad", e.target.value)}
                      placeholder="Ej: 20"
                      className="w-full border rounded-xl px-3 py-2 outline-none"
                      style={inputStyle}
                    />
                    {ageError && <p className="text-xs mt-1" style={{ color: P.primary, fontWeight: 700 }}>{ageError}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Results header ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: P.default, fontWeight: 600 }}>
            {loading ? (
              <span>Buscando…</span>
            ) : (
              <><span style={{ color: P.textPrimary, fontWeight: 800 }}>{results.length}</span>{" "}
              {results.length === 1 ? "jugador encontrado" : "jugadores encontrados"}</>
            )}
          </p>
          {loading && <Loader2 style={{ width: 16, height: 16, color: P.secondary, animation: "spin 1s linear infinite" }} />}
        </motion.div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 style={{ width: 32, height: 32, color: P.primary, animation: "spin 1s linear infinite" }} />
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((player, idx) => (
              <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06, duration: 0.35 }}>
                <PlayerCard
                  player={player}
                  query={debouncedName}
                  onInvite={handleInvite}
                  invited={invited.has(player.id)}
                  canInvite={!!teamContext?.teamId}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[20px] p-10 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <Search style={{ width: 36, height: 36, color: P.default, margin: "0 auto 12px" }} />
            <p className="text-sm" style={{ color: P.textPrimary, fontWeight: 700 }}>Sin resultados</p>
            <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 500 }}>Ajusta los filtros para ampliar la búsqueda.</p>
          </motion.div>
        )}
      </main>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white"
            style={{ backgroundColor: P.success, boxShadow: `0 12px 40px ${P.success}50` }}
          >
            <Check style={{ width: 18, height: 18 }} />
            <span className="text-sm whitespace-nowrap" style={{ fontWeight: 700 }}>{toast}</span>
            <button onClick={() => setToast(null)} className="ml-3 text-xs underline">Cerrar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
