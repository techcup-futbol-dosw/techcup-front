// src/modules/users/pages/PlayerSearch.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import logoTechcup from "@/assets/logo.png";
import { playerService, type PlayerDto } from "@/modules/users/services/playerService";
import { ApiError } from "@/core/api/http";
import {
  ArrowLeft,
  Search,
  X,
  SlidersHorizontal,
  UserCheck,
  UserX,
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
  GOALKEEPER: { label: "Portero",   bg: "rgba(0,102,254,0.10)",   color: "#0066FE" },
  DEFENDER:   { label: "Defensa",   bg: "rgba(23,201,100,0.10)",  color: "#17C964" },
  MIDFIELDER: { label: "Volante",   bg: "rgba(196,132,29,0.12)",  color: "#C4841D" },
  FORWARD:    { label: "Delantero", bg: "rgba(184,28,28,0.10)",   color: "#B81C1C" },
};

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const re = new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "ig");
  return (
    <>
      {text.split(re).map((part, i) =>
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
function PlayerCard({ player, query }: { player: PlayerDto; query: string }) {
  const pos = player.position
    ? (positionMeta[player.position] ?? { label: player.position, bg: `${P.default}14`, color: P.default })
    : { label: "Sin posición", bg: `${P.default}14`, color: P.default };

  const avail = player.available ?? false;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-[20px] p-5 flex flex-col gap-4"
      style={{
        boxShadow: avail
          ? `0 0 0 1.5px ${P.success}40, 0 4px 16px rgba(0,0,0,0.05)`
          : `0 0 0 1.5px ${P.primary}30, 0 4px 16px rgba(0,0,0,0.05)`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-2xl"
          style={{ background: `linear-gradient(135deg, ${P.primary}, ${P.secondary})`, fontWeight: 800 }}
        >
          {(player.fullName ?? "?")[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base leading-snug" style={{ fontWeight: 700, color: P.textPrimary }}>
              {highlight(player.fullName ?? "", query)}
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
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: pos.bg, color: pos.color }}>
              {pos.label}
            </span>
            {player.academicProgram && (
              <span className="text-xs" style={{ color: P.default }}>{player.academicProgram.replace(/_/g, " ")}</span>
            )}
            {player.semester != null && (
              <>
                <span className="text-xs" style={{ color: P.default }}>·</span>
                <span className="text-xs" style={{ color: P.default }}>Sem. {player.semester}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl px-3 py-2.5 space-y-0.5" style={{ backgroundColor: P.bg }}>
        {player.identification && (
          <p className="text-xs" style={{ color: P.default, fontWeight: 600 }}>
            ID: <span style={{ color: P.textPrimary }}>{player.identification}</span>
          </p>
        )}
        <p className="text-xs truncate" style={{ color: P.default, fontWeight: 600 }}>
          <span style={{ color: P.textPrimary }}>{player.email}</span>
        </p>
      </div>
    </motion.article>
  );
}

// ── PlayerSearch ──────────────────────────────────
export default function PlayerSearch() {
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [filters, setFilters] = useState({
    name: "", identification: "", position: "", age: "", gender: "", semester: "", onlyAvailable: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [players, setPlayers] = useState<PlayerDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [debouncedName, setDebouncedName] = useState(filters.name);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(filters.name), 400);
    return () => clearTimeout(t);
  }, [filters.name]);

  const fetchPlayers = useCallback(() => {
    setIsLoading(true);
    setFetchError(null);

    const searchFilters: Parameters<typeof playerService.search>[0] = {};
    if (debouncedName.trim()) searchFilters.name = debouncedName.trim();
    if (filters.position) searchFilters.position = filters.position;
    if (filters.gender) searchFilters.gender = filters.gender;
    if (filters.semester) searchFilters.semester = Number.parseInt(filters.semester, 10);
    if (filters.identification.trim()) searchFilters.identification = filters.identification.trim();
    if (filters.onlyAvailable) searchFilters.available = true;

    playerService.search(searchFilters).then((data) => {
      setPlayers(data);
    }).catch((err) => {
      if (err instanceof ApiError && err.status === 403) {
        setFetchError("No tienes permiso para buscar jugadores. Solo capitanes y administradores pueden usar esta función.");
      } else {
        setFetchError("Error al cargar los jugadores. Intenta de nuevo.");
      }
      setPlayers([]);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [debouncedName, filters.position, filters.gender, filters.semester, filters.age, filters.identification, filters.onlyAvailable]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement as HTMLElement)?.tagName !== "INPUT") {
        e.preventDefault();
        nameInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const update = (field: keyof typeof filters, value: string | boolean) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const results = [...players].sort((a, b) =>
    (a.fullName ?? "").localeCompare(b.fullName ?? "")
  );

  const clearFilters = () => {
    setFilters({ name: "", identification: "", position: "", age: "", gender: "", semester: "", onlyAvailable: false });
    setShowAdvanced(false);
  };

  const hasActiveFilters = filters.name || filters.identification || filters.position || filters.age || filters.gender || filters.semester || filters.onlyAvailable;

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

          <div style={{ width: 70 }} />
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
            Filtra por nombre, identificación, semestre o disponibilidad. Presiona{" "}
            <kbd className="px-1.5 py-0.5 rounded-md text-xs font-mono" style={{ backgroundColor: "rgba(0,0,0,0.08)", color: P.textPrimary }}>/</kbd>{" "}
            para enfocar la búsqueda.
          </p>
        </motion.div>

        {/* ── Filters ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.45 }}
          className="bg-white rounded-[20px] p-5 mb-6"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Nombre</label>
              <div className="relative">
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: P.default }} />
                <input
                  ref={nameInputRef}
                  value={filters.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ej: Juan"
                  className="w-full border rounded-xl pl-8 pr-3 py-2.5 outline-none transition-all duration-200"
                  style={{ ...inputStyle, borderColor: filters.name ? P.primary : "rgba(0,0,0,0.12)", boxShadow: filters.name ? `0 0 0 3px ${P.primary}12` : "none" }}
                />
              </div>
            </div>

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

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div>
                    <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Identificación</label>
                    <input value={filters.identification} onChange={(e) => update("identification", e.target.value)} placeholder="Ej: 1234567890" className="w-full border rounded-xl px-3 py-2 outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Semestre</label>
                    <select value={filters.semester} onChange={(e) => update("semester", e.target.value)} className="w-full border rounded-xl px-3 py-2 outline-none" style={inputStyle}>
                      <option value="">Todos</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>Semestre {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ fontWeight: 700, color: P.default }}>Género</label>
                    <select value={filters.gender} onChange={(e) => update("gender", e.target.value)} className="w-full border rounded-xl px-3 py-2 outline-none" style={inputStyle}>
                      <option value="">Todos</option>
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Femenino</option>
                      <option value="OTHER">Otro</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Results header ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-4">
          <p className="text-sm" style={{ color: P.default, fontWeight: 600 }}>
            <span style={{ color: P.textPrimary, fontWeight: 800 }}>{results.length}</span>{" "}
            {results.length === 1 ? "jugador encontrado" : "jugadores encontrados"}
          </p>
        </motion.div>

        {/* ── Grid ── */}
        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[20px] p-10 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p className="text-sm" style={{ color: P.default, fontWeight: 600 }}>Buscando jugadores...</p>
          </motion.div>
        ) : fetchError ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[20px] p-10 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p className="text-sm" style={{ color: P.primary, fontWeight: 700 }}>Sin acceso</p>
            <p className="text-xs mt-1" style={{ color: P.default, fontWeight: 500 }}>{fetchError}</p>
          </motion.div>
        ) : results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((player, idx) => (
              <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.35 }}>
                <PlayerCard player={player} query={debouncedName} />
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
    </div>
  );
}
