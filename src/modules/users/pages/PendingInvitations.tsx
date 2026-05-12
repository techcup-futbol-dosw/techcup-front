// src/modules/users/pages/InvitacionesPendientes.tsx
import { useState } from "react";

interface Invitation {
  id: string;
  tipo: "equipo" | "torneo";
  titulo: string;
  descripcion: string;
  organizador: string;
  fecha: string;
  icono: string;
}

const INVITACIONES_MOCK: Invitation[] = [
  {
    id: "1",
    tipo: "equipo",
    titulo: "Los Tigres FC",
    descripcion: "Te invitan a unirte al equipo para el torneo TECHCUP 2026",
    organizador: "Carlos Martínez",
    fecha: "20 Abr 2026",
    icono: "👥",
  },
  {
    id: "2",
    tipo: "torneo",
    titulo: "TECHCUP 2026 - Categoría Universitaria",
    descripcion: "Invitación para participar en el torneo interuniversitario",
    organizador: "Comité Organizador",
    fecha: "19 Abr 2026",
    icono: "🏆",
  },
  {
    id: "3",
    tipo: "equipo",
    titulo: "Águilas del Norte",
    descripcion: "Necesitamos un medio centro para completar nuestra plantilla",
    organizador: "Ana García",
    fecha: "18 Abr 2026",
    icono: "👥",
  },
];

function getInvitationBadgeColor(
  tipo: "equipo" | "torneo",
): { bg: string; text: string } {
  if (tipo === "equipo") {
    return { bg: "#DBEAFE", text: "#1E40AF" };
  }
  return { bg: "#FEF3C7", text: "#B45309" };
}

function getInvitationLabel(tipo: "equipo" | "torneo"): string {
  return tipo === "equipo" ? "Equipo" : "Torneo";
}

export default function PendingInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>(INVITACIONES_MOCK);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAcceptInvitation = (id: string) => {
    const invitation = invitations.find((inv) => inv.id === id);
    if (invitation) {
      setFeedback(`¡Has aceptado la invitación de "${invitation.titulo}"!`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      const t = globalThis.setTimeout(() => setFeedback(null), 4000);
      return () => globalThis.clearTimeout(t);
    }
    return undefined;
  };

  const handleRejectInvitation = (id: string) => {
    const invitation = invitations.find((inv) => inv.id === id);
    if (invitation) {
      setFeedback(`Has rechazado la invitación de "${invitation.titulo}"`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      const t = globalThis.setTimeout(() => setFeedback(null), 4000);
      return () => globalThis.clearTimeout(t);
    }
    return undefined;
  };

  return (
    <div className="relative min-h-screen overflow-auto bg-[#f8f9fa]">
      <div className="flex items-start justify-center px-6 lg:px-20 py-12 lg:py-20">
        <div className="w-full max-w-4xl">
          {invitations.length > 0 ? (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                  <h1 className="font-extrabold text-4xl text-[#1c1c1e] tracking-tight leading-tight">
                    Invitaciones Pendientes
                  </h1>
                  <p className="font-medium text-base text-[#6e6e73] mt-3">
                    Tienes{" "}
                    <span aria-live="polite" aria-atomic="true">
                      {invitations.length}{" "}
                      {invitations.length === 1
                        ? "invitación"
                        : "invitaciones"}{" "}
                      pendiente
                      {invitations.length === 1 ? "" : "s"}
                    </span>
                  </p>
                </div>
                <div
                  className="bg-[#b81c1c] text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl mt-4 lg:mt-0"
                  aria-label={`${invitations.length} invitaciones`}
                >
                  {invitations.length}
                </div>
              </div>

              <ul className="flex flex-col gap-4">
                {invitations.map((invitation) => {
                  const badge = getInvitationBadgeColor(invitation.tipo);
                  const label = getInvitationLabel(invitation.tipo);

                  return (
                    <li key={invitation.id}>
                      <article
                        className="bg-white border border-[#e8e8ed] rounded-2xl p-5 hover:border-[#b81c1c]/20 transition-all shadow-sm hover:shadow-md"
                        aria-labelledby={`inv-title-${invitation.id}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#b81c1c] to-[#c4841d] rounded-xl flex items-center justify-center text-2xl">
                            {invitation.icono}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                              <div>
                                <h3
                                  id={`inv-title-${invitation.id}`}
                                  className="font-bold text-lg text-[#1c1c1e] leading-snug"
                                >
                                  {invitation.titulo}
                                </h3>
                                <p className="font-medium text-sm text-[#6e6e73] mt-1">
                                  {invitation.descripcion}
                                </p>
                              </div>
                              <span
                                className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                                style={{
                                  backgroundColor: badge.bg,
                                  color: badge.text,
                                }}
                              >
                                {label}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3 mb-4">
                              <div className="flex items-center gap-2 text-[#8a8a8e] text-sm">
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
                                <span>{invitation.organizador}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#8a8a8e] text-sm">
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
                                <span>{invitation.fecha}</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                type="button"
                                onClick={() => handleAcceptInvitation(invitation.id)}
                                className="flex-1 bg-[#b81c1c] hover:bg-[#9a1717] active:scale-95 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                              >
                                ✓ Aceptar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectInvitation(invitation.id)}
                                className="flex-1 bg-[#f2f2f7] hover:bg-[#e8e8ed] active:scale-95 text-[#1c1c1e] px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                              >
                                ✕ Rechazar
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-[#e8e8ed] p-12 text-center">
              <div className="w-24 h-24 bg-[#f2f2f7] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-[#8a8a8e]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>
              <h2 className="font-bold text-2xl text-[#1c1c1e] mb-2">
                No tienes invitaciones pendientes
              </h2>
              <p className="font-medium text-sm text-[#6e6e73]">
                Todas tus invitaciones han sido gestionadas
              </p>
            </div>
          )}

          {/* Info adicional */}
          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-4 mt-8 flex gap-3">
            <div className="text-lg flex-shrink-0">💡</div>
            <p className="font-medium text-sm text-[#6e6e73]">
              Responde a las invitaciones lo antes posible para ayudar a los organizadores a planificar mejor los equipos
              y torneos.
            </p>
          </div>
        </div>
      </div>

      {/* Toast feedback */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50"
        >
          <div className="bg-[#111827] text-white px-4 py-3 rounded-xl font-medium text-sm shadow-lg flex items-center gap-3 min-w-max">
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline opacity-80 hover:opacity-100 ml-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}