// src/modules/users/pages/PlayerSearch.tsx
import { useEffect, useMemo, useRef, useState } from "react";

interface Player {
  id: string;
  nombre: string;
  identificacion: string;
  edad: number;
  genero: "masculino" | "femenino" | "otro";
  posicion: string;
  semestre: string;
  foto: string | null;
  dorsal: string;
  disponibilidad: boolean;
  email: string;
}

const JUGADORES_MOCK: Player[] = [
  { id: "1", nombre: "Carlos Martínez", identificacion: "1234567890", edad: 21, genero: "masculino", posicion: "delantero", semestre: "5", foto: null, dorsal: "10", disponibilidad: true, email: "carlos.martinez@universidad.edu" },
  { id: "2", nombre: "Ana García", identificacion: "0987654321", edad: 20, genero: "femenino", posicion: "volante", semestre: "6", foto: null, dorsal: "8", disponibilidad: false, email: "ana.garcia@universidad.edu" },
  { id: "3", nombre: "Juan Pérez", identificacion: "1122334455", edad: 22, genero: "masculino", posicion: "defensa", semestre: "7", foto: null, dorsal: "4", disponibilidad: true, email: "juan.perez@universidad.edu" },
  { id: "4", nombre: "María López", identificacion: "5544332211", edad: 19, genero: "femenino", posicion: "portero", semestre: "4", foto: null, dorsal: "1", disponibilidad: true, email: "maria.lopez@universidad.edu" },
  { id: "5", nombre: "Diego Ramírez", identificacion: "9988776655", edad: 23, genero: "masculino", posicion: "volante", semestre: "8", foto: null, dorsal: "6", disponibilidad: false, email: "diego.ramirez@universidad.edu" },
];

function availabilityBorderColor(available: boolean): string {
  return available ? "#17C964" : "#B81C1C";
}

function positionBadgeColors(pos: string): { bg: string; text: string } {
  switch (pos.toLowerCase()) {
    case "portero":
      return { bg: "#e6f0ff", text: "#0B61FF" };
    case "defensa":
      return { bg: "#e8f7ec", text: "#0FA24A" };
    case "volante":
      return { bg: "#fff7e6", text: "#C4841D" };
    case "delantero":
      return { bg: "#ffe6e6", text: "#B81C1C" };
    default:
      return { bg: "#f2f2f7", text: "#6E6E73" };
  }
}

function renderHighlighted(text: string, query: string) {
  if (!query) return text;
  const q = query.replace(String.raw`[-/\\^$*+?.()|[\]{}]`, "\\$&");
  const re = new RegExp(`(${q})`, "ig");
  const parts = text.split(re);

  return parts.map((part, idx) =>
    re.test(part) ? (
      <mark
        key={`${text}-mark-${idx}-${part}`}
        style={{ background: "#FDE68A", color: "#111827", padding: "0 2px", borderRadius: 3 }}
      >
        {part}
      </mark>
    ) : (
      <span key={`${text}-span-${idx}-${part}`}>{part}</span>
    ),
  );
}

export default function PlayerSearch() {
  const [filters, setFilters] = useState({
    nombre: "",
    identificacion: "",
    posicion: "",
    edad: "",
    genero: "",
    semestre: "",
    onlyAvailable: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [debouncedName, setDebouncedName] = useState(filters.nombre);
  useEffect(() => {
    const t = globalThis.setTimeout(() => setDebouncedName(filters.nombre), 300);
    return () => globalThis.clearTimeout(t);
  }, [filters.nombre]);

  useEffect(() => {
    setLoading(true);
    const t = globalThis.setTimeout(() => setLoading(false), 160);
    return () => globalThis.clearTimeout(t);
  }, [
    debouncedName,
    filters.posicion,
    filters.onlyAvailable,
    filters.semestre,
    filters.genero,
    filters.edad,
    filters.identificacion,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement as HTMLElement)?.tagName !== "INPUT") {
        e.preventDefault();
        nameInputRef.current?.focus();
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (feedback && toastRef.current) {
      try {
        toastRef.current.focus();
      } catch {
        // no-op
      }
      const t = globalThis.setTimeout(() => setFeedback(null), 3000);
      return () => globalThis.clearTimeout(t);
    }
    return undefined;
  }, [feedback]);

  const updateFilter = (field: keyof typeof filters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [field]: value } as typeof filters));
  };

  const results = useMemo(() => {
    let r = JUGADORES_MOCK.slice();
    const qName = debouncedName.trim().toLowerCase();
    const qId = filters.identificacion.trim();

    if (qName) r = r.filter((p) => p.nombre.toLowerCase().includes(qName));
    if (qId) r = r.filter((p) => p.identificacion.includes(qId));
    if (filters.posicion) r = r.filter((p) => p.posicion === filters.posicion);
    if (filters.edad) {
      const n = Number.parseInt(filters.edad, 10);
      if (!Number.isNaN(n)) r = r.filter((p) => p.edad === n);
    }
    if (filters.genero) r = r.filter((p) => p.genero === filters.genero);
    if (filters.semestre) r = r.filter((p) => p.semestre === filters.semestre);
    if (filters.onlyAvailable) r = r.filter((p) => p.disponibilidad);

    r.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return r;
  }, [debouncedName, filters]);

  const clearFilters = () => {
    setFilters({
      nombre: "",
      identificacion: "",
      posicion: "",
      edad: "",
      genero: "",
      semestre: "",
      onlyAvailable: false,
    });
    setShowAdvanced(false);
    setFeedback("Filtros limpiados");
  };

  const invite = (id: string) => {
    const p = JUGADORES_MOCK.find((x) => x.id === id);
    if (p) setFeedback(`Invitación enviada a ${p.nombre}`);
  };

  return (
    <main className="min-h-screen p-6 lg:p-10 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold leading-tight text-[#0f172a]">Buscar Jugadores</h1>
          <p className="mt-2 text-base leading-relaxed text-[#374151]">
            Filtra por posición, edad, género, nombre, identificación o semestre (1-8). Presiona{" "}
            <kbd className="px-2 py-1 bg-gray-100 rounded">/</kbd> para ir a la búsqueda.
          </p>
        </header>

        <section className="bg-white rounded-lg border p-4 mb-6" aria-labelledby="filter-heading">
          <h2 id="filter-heading" className="sr-only">
            Filtros de búsqueda
          </h2>

          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4 gap-3">
            <div className="flex-1">
              <label htmlFor="nombre" className="block text-sm font-medium text-[#374151]">
                Nombre
              </label>
              <input
                id="nombre"
                ref={nameInputRef}
                value={filters.nombre}
                onChange={(e) => updateFilter("nombre", e.target.value)}
                placeholder="Ej: Juan"
                className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#b81c1c] focus:outline-none text-base leading-relaxed text-[#111827]"
                aria-describedby="nombre-help"
                autoComplete="off"
              />
              <small id="nombre-help" className="text-xs text-[#6b7280]">
                Busca por nombre o parte del nombre. (Debounce 300ms)
              </small>
            </div>

            <div className="w-48">
              <label htmlFor="posicion" className="block text-sm font-medium text-[#374151]">
                Posición
              </label>
              <select
                id="posicion"
                value={filters.posicion}
                onChange={(e) => updateFilter("posicion", e.target.value)}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                <option value="portero">Portero</option>
                <option value="defensa">Defensa</option>
                <option value="volante">Volante</option>
                <option value="delantero">Delantero</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="onlyAvailableQuick"
                type="checkbox"
                checked={filters.onlyAvailable}
                onChange={(e) => updateFilter("onlyAvailable", e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="onlyAvailableQuick" className="text-sm text-[#374151]">
                Solo disponibles
              </label>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdvanced((s) => !s)}
                className="px-3 py-2 rounded-md border bg-white text-sm hover:bg-[#f7f7f8]"
              >
                {showAdvanced ? "Ocultar filtros" : "Más filtros"}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 rounded-md bg-[#b81c1c] text-white text-sm font-semibold hover:bg-[#9a1717]"
              >
                Limpiar
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="identificacion" className="block text-sm font-medium text-[#374151]">
                  Identificación
                </label>
                <input
                  id="identificacion"
                  value={filters.identificacion}
                  onChange={(e) => updateFilter("identificacion", e.target.value)}
                  placeholder="Ej: 1234567890"
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="genero" className="block text-sm font-medium text-[#374151]">
                  Género
                </label>
                <select
                  id="genero"
                  value={filters.genero}
                  onChange={(e) => updateFilter("genero", e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="semestre" className="block text-sm font-medium text-[#374151]">
                  Semestre
                </label>
                <select
                  id="semestre"
                  value={filters.semestre}
                  onChange={(e) => updateFilter("semestre", e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={`sem-${i + 1}`} value={String(i + 1)}>
                      Semestre {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edad-filter" className="block text-sm font-medium text-[#374151]">
                  Edad
                </label>
                <input
                  id="edad-filter"
                  type="number"
                  min="16"
                  max="99"
                  value={filters.edad}
                  onChange={(e) => updateFilter("edad", e.target.value)}
                  placeholder="Ej: 20"
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </section>

        <div className="mb-4 flex items-center justify-between">
          <div id="results-count" className="text-sm text-[#4b5563]" aria-live="polite">
            {results.length} {results.length === 1 ? "jugador encontrado" : "jugadores encontrados"}
          </div>
          <div className="text-sm text-[#6b7280]">{loading ? "Buscando..." : "Resultados actualizados"}</div>
        </div>

        {results.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-labelledby="results-count">
            {results.map((player) => {
              const border = availabilityBorderColor(player.disponibilidad);
              const badge = positionBadgeColors(player.posicion);

              return (
                <li key={player.id}>
                  <article
                    aria-labelledby={`pl-${player.id}`}
                    style={{ border: `2px solid ${border}`, background: "white" }}
                    className="rounded-md p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#b81c1c] to-[#c4841d] text-white font-bold text-lg">
                        {player.dorsal}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 id={`pl-${player.id}`} className="font-semibold text-base leading-snug text-[#0f172a]">
                              {renderHighlighted(player.nombre, debouncedName)}
                            </h3>

                            <div className="flex gap-2 items-center mt-2">
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: badge.bg, color: badge.text }}
                              >
                                {player.posicion.charAt(0).toUpperCase() + player.posicion.slice(1)}
                              </span>
                              <span className="text-xs text-[#6b7280]">{player.edad} años</span>
                              <span className="text-xs text-[#6b7280]">{player.semestre}°</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold" style={{ color: border }}>
                              {player.disponibilidad ? "Disponible" : "No disponible"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-[#374151] leading-relaxed">
                          <div title={player.identificacion}>ID: {player.identificacion}</div>
                          <div title={player.email} className="truncate">
                            {player.email}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => invite(player.id)}
                          className="w-full mt-3 bg-[#b81c1c] hover:bg-[#9a1717] text-white py-2 rounded-md font-semibold"
                        >
                          Invitar al Equipo
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="bg-white border rounded-md p-6 text-center">
            <p className="text-sm text-[#6b7280]">No se encontraron jugadores. Ajusta los filtros para ampliar la búsqueda.</p>
          </div>
        )}

        {feedback && (
          <div
            ref={toastRef}
            role="status"
            aria-live="polite"
            className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50"
          >
            <div
              style={{ background: "#111827", color: "white", padding: "10px 14px", borderRadius: 12 }}
              className="flex items-center gap-3 min-w-[220px]"
            >
              <span className="font-semibold text-sm">{feedback}</span>
              <button type="button" onClick={() => setFeedback(null)} className="ml-auto text-xs underline">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}