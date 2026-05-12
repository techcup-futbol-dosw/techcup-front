// src/modules/users/pages/Audit.tsx
import { useState } from "react";

interface AuditLog {
  id: string;
  accion: "actualizacion" | "inactivacion" | "gestion_perfil";
  usuario: string;
  detalles: string;
  fecha: string;
  hora: string;
  realizadoPor: string;
}

const AUDIT_LOGS_MOCK: AuditLog[] = [
  {
    id: "1",
    accion: "actualizacion",
    usuario: "Carlos Martínez",
    detalles: "Se actualizó el rol de Jugador a Capitán",
    fecha: "12 May 2026",
    hora: "10:30 AM",
    realizadoPor: "Admin Sistema",
  },
  {
    id: "2",
    accion: "inactivacion",
    usuario: "Ana García",
    detalles: "Usuario marcado como inactivo por solicitud del mismo",
    fecha: "12 May 2026",
    hora: "09:15 AM",
    realizadoPor: "Admin Sistema",
  },
  {
    id: "3",
    accion: "gestion_perfil",
    usuario: "Juan Pérez",
    detalles: "Actualización de foto de perfil y número de dorsal",
    fecha: "11 May 2026",
    hora: "04:45 PM",
    realizadoPor: "Juan Pérez",
  },
  {
    id: "4",
    accion: "actualizacion",
    usuario: "María López",
    detalles: "Se actualizó el programa de Ingeniería Civil a Ingeniería de Sistemas",
    fecha: "11 May 2026",
    hora: "02:20 PM",
    realizadoPor: "Admin Sistema",
  },
  {
    id: "5",
    accion: "gestion_perfil",
    usuario: "Diego Ramírez",
    detalles: "Cambio de posición de Delantero a Volante",
    fecha: "10 May 2026",
    hora: "11:00 AM",
    realizadoPor: "Diego Ramírez",
  },
  {
    id: "6",
    accion: "inactivacion",
    usuario: "Pedro Sánchez",
    detalles: "Usuario suspendido por infracción a las reglas del torneo",
    fecha: "10 May 2026",
    hora: "08:30 AM",
    realizadoPor: "Admin Sistema",
  },
  {
    id: "7",
    accion: "actualizacion",
    usuario: "Laura Jiménez",
    detalles: "Se actualizó el estado de Inactivo a Activo",
    fecha: "09 May 2026",
    hora: "03:15 PM",
    realizadoPor: "Admin Sistema",
  },
  {
    id: "8",
    accion: "gestion_perfil",
    usuario: "Carlos Martínez",
    detalles: "Actualización de disponibilidad para recibir invitaciones",
    fecha: "09 May 2026",
    hora: "01:45 PM",
    realizadoPor: "Carlos Martínez",
  },
];

function getAccionBadge(accion: string): {
  text: string;
  bg: string;
  text_color: string;
  icon: string;
} {
  switch (accion) {
    case "actualizacion":
      return {
        text: "Actualización",
        bg: "#DBEAFE",
        text_color: "#1E40AF",
        icon: "🔄",
      };
    case "inactivacion":
      return {
        text: "Inactivación",
        bg: "#FEE2E2",
        text_color: "#991B1B",
        icon: "🚫",
      };
    case "gestion_perfil":
      return {
        text: "Gestión Perfil",
        bg: "#DCFCE7",
        text_color: "#166534",
        icon: "👤",
      };
    default:
      return {
        text: accion,
        bg: "#F3F4F6",
        text_color: "#374151",
        icon: "📝",
      };
  }
}

export default function Auditoria() {
  const [logs] = useState<AuditLog[]>(AUDIT_LOGS_MOCK);
  const [filterAccion, setFilterAccion] = useState<string>("");

  const filteredLogs = filterAccion ? logs.filter((log) => log.accion === filterAccion) : logs;

  const filterOptions: Array<{ value: string; label: string }> = [
    { value: "", label: "Todas" },
    { value: "actualizacion", label: "🔄 Actualización" },
    { value: "inactivacion", label: "🚫 Inactivación" },
    { value: "gestion_perfil", label: "👤 Gestión Perfil" },
  ];

  return (
    <div className="relative min-h-screen overflow-auto bg-[#f8f9fa]">
      <div className="flex items-start justify-center px-6 lg:px-20 py-12 lg:py-20">
        <div className="w-full max-w-6xl">
          <header className="mb-8">
            <h1 className="font-extrabold text-4xl text-[#1c1c1e] tracking-tight leading-tight">
              Auditoría
            </h1>
            <p className="font-medium text-base text-[#6e6e73] mt-3">
              Registra las acciones de actualización e inactivación de usuarios, y gestión del perfil.
            </p>
          </header>

          {/* Filtros */}
          <section
            className="bg-white border border-[#e8e8ed] rounded-2xl p-6 mb-6"
            aria-labelledby="filter-section-title"
          >
            <h2 id="filter-section-title" className="font-bold text-base text-[#1c1c1e] mb-4">
              Filtrar por acción:
            </h2>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilterAccion(option.value)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterAccion === option.value
                      ? "bg-[#b81c1c] text-white"
                      : "bg-[#f2f2f7] text-[#1c1c1e] hover:bg-[#e8e8ed]"
                  }`}
                  aria-pressed={filterAccion === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* Contador de registros */}
          <div className="mb-4">
            <p
              className="font-semibold text-sm text-[#6e6e73]"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {filteredLogs.length} {filteredLogs.length === 1 ? "registro encontrado" : "registros encontrados"}
            </p>
          </div>

          {/* Timeline de Auditoría */}
          <article className="bg-white border border-[#e8e8ed] rounded-2xl p-8">
            {filteredLogs.length > 0 ? (
              <ul className="space-y-6">
                {filteredLogs.map((log, index) => {
                  const badge = getAccionBadge(log.accion);
                  const isLast = index === filteredLogs.length - 1;

                  return (
                    <li key={log.id} className="relative">
                      {/* Línea de conexión */}
                      {!isLast && (
                        <div
                          className="absolute left-5 top-10 w-0.5 h-[calc(100%+32px)] bg-[#e8e8ed]"
                          aria-hidden="true"
                        />
                      )}

                      <div className="flex gap-4">
                        {/* Icono circular */}
                        <div
                          className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#b81c1c] to-[#c4841d] rounded-full flex items-center justify-center text-lg shadow-md relative z-10"
                          aria-hidden="true"
                        >
                          {badge.icon}
                        </div>

                        {/* Contenido del log */}
                        <div className="flex-1 bg-[#f8f9fa] rounded-xl p-5 hover:bg-[#f2f2f7] transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                                <h3 className="font-bold text-base text-[#1c1c1e]">{log.usuario}</h3>
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                                  style={{
                                    backgroundColor: badge.bg,
                                    color: badge.text_color,
                                  }}
                                >
                                  {badge.text}
                                </span>
                              </div>
                              <p className="font-medium text-sm text-[#6e6e73]">{log.detalles}</p>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-[#8a8a8e]">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="font-medium">{log.fecha}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="font-medium">{log.hora}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span className="font-medium">Por: {log.realizadoPor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-[#f2f2f7] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-[#8a8a8e]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-[#1c1c1e] mb-2">
                  No hay registros de auditoría
                </h3>
                <p className="font-medium text-sm text-[#6e6e73]">
                  No se encontraron registros con los filtros seleccionados
                </p>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}