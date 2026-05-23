import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Bell, Shield } from "lucide-react";
import { invitationService, type InvitationDto } from "@/modules/users/services/invitationService";
import { teamService } from "@/modules/teams/services/teamService";
import { useAuth } from "@/core/auth/AuthContext";
import { LogoutAction } from "@/core/components/LogoutAction";

type InvitationItem = InvitationDto & { teamName: string };

const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  success: "#17C964",
  default: "#6E6E73",
  textPrimary: "#1C1C1E",
  bg: "#F2F2F7",
};

export default function PendingInvitations() {
  const navigate = useNavigate();
  const { accountId } = useAuth();

  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [accepted, setAccepted] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;
    setIsLoading(true);
    setError(null);

    invitationService.getByUserId(accountId)
      .then(async (invs) => {
        const pending = invs.filter((inv) => inv.status === "PENDING");
        const items = await Promise.all(
          pending.map(async (inv) => {
            try {
              const team = await teamService.getTeam(inv.teamId);
              return { ...inv, teamName: team.name };
            } catch {
              return { ...inv, teamName: `Equipo ${inv.teamId}` };
            }
          })
        );
        setInvitations(items);
      })
      .catch(() => setError("No se pudieron cargar las invitaciones"))
      .finally(() => setIsLoading(false));
  }, [accountId]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAccept = async (id: number, teamName: string) => {
    setAccepted(id);
    try {
      await invitationService.accept(id);
      showFeedback(`¡Has aceptado la invitación de "${teamName}"!`);
    } catch {
      setAccepted(null);
      showFeedback("No se pudo aceptar la invitación. Intenta nuevamente.");
    }
  };

  const handleReject = async (id: number, teamName: string) => {
    if (accepted !== null) return;
    try {
      await invitationService.reject(id);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      showFeedback(`Has rechazado la invitación de "${teamName}"`);
    } catch {
      showFeedback("No se pudo rechazar la invitación. Intenta nuevamente.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-auto" style={{ backgroundColor: P.bg }}>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b px-6"
        style={{
          background: "rgba(242,242,247,0.88)",
          borderColor: "rgba(0,0,0,0.06)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              aria-label="Volver"
            >
              <ArrowLeft style={{ width: 16, height: 16, color: P.default }} />
            </button>
            <span style={{ fontWeight: 800, color: P.primary, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
              TECHCUP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${P.primary}12` }}>
              <Bell style={{ width: 14, height: 14, color: P.primary }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: P.primary }}>Invitaciones</span>
            </div>
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

      <div className="flex items-start justify-center px-6 lg:px-20 py-12 lg:py-20">
        <div className="w-full max-w-4xl">

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#e8e8ed] p-12 text-center">
              <p className="font-medium text-sm" style={{ color: P.default }}>Cargando invitaciones...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-[#e8e8ed] p-12 text-center">
              <p className="font-medium text-sm" style={{ color: P.primary }}>{error}</p>
            </div>
          ) : invitations.length > 0 ? (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                  <h1 className="font-extrabold text-4xl text-[#1c1c1e] tracking-tight leading-tight">
                    Invitaciones Pendientes
                  </h1>
                  <p className="font-medium text-base mt-3" style={{ color: P.default }}>
                    Tienes{" "}
                    <span aria-live="polite" aria-atomic="true">
                      {invitations.length} {invitations.length === 1 ? "invitación" : "invitaciones"} pendiente{invitations.length === 1 ? "" : "s"}
                    </span>
                  </p>
                </div>
                <div
                  className="rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl mt-4 lg:mt-0 text-white"
                  style={{ backgroundColor: P.primary }}
                  aria-label={`${invitations.length} invitaciones`}
                >
                  {invitations.length}
                </div>
              </div>

              <ul className="flex flex-col gap-4">
                {invitations.map((inv) => {
                  const isAccepted = accepted === inv.id;
                  const isBlocked = accepted !== null && accepted !== inv.id;
                  return (
                  <li key={inv.id}>
                    <article
                      className="bg-white border border-[#e8e8ed] rounded-2xl p-5 transition-all shadow-sm"
                      style={{ opacity: isBlocked ? 0.45 : 1 }}
                      aria-labelledby={`inv-title-${inv.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                          style={{ background: isAccepted ? `linear-gradient(135deg, ${P.success}, #0fa854)` : `linear-gradient(135deg, ${P.primary}, ${P.secondary})` }}
                        >
                          <Shield className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div>
                              <h3
                                id={`inv-title-${inv.id}`}
                                className="font-bold text-lg text-[#1c1c1e] leading-snug"
                              >
                                {inv.teamName}
                              </h3>
                              <p className="font-medium text-sm mt-1" style={{ color: P.default }}>
                                {isAccepted ? "Invitación aceptada — ya perteneces a este equipo" : "Te han invitado a unirte a este equipo"}
                              </p>
                            </div>
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                              style={isAccepted
                                ? { backgroundColor: `${P.success}18`, color: P.success }
                                : { backgroundColor: "#DBEAFE", color: "#1E40AF" }}
                            >
                              {isAccepted ? "✓ Aceptada" : "Equipo"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-3 mb-4 text-sm" style={{ color: "#8a8a8e" }}>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                              {new Date(
                                Array.isArray(inv.sentAt)
                                  ? (inv.sentAt as unknown as number[]).slice(0, 3).join("-")
                                  : inv.sentAt
                              ).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                          </div>

                          {!isAccepted && (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                type="button"
                                onClick={() => !isBlocked && handleAccept(inv.id, inv.teamName)}
                                disabled={isBlocked}
                                className="flex-1 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                                style={{ backgroundColor: isBlocked ? P.default : P.success, cursor: isBlocked ? "not-allowed" : "pointer" }}
                              >
                                ✓ Aceptar
                              </button>
                              <button
                                type="button"
                                onClick={() => !isBlocked && handleReject(inv.id, inv.teamName)}
                                disabled={isBlocked}
                                className="flex-1 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                                style={{ backgroundColor: isBlocked ? `${P.default}12` : `${P.primary}12`, color: isBlocked ? P.default : P.primary, cursor: isBlocked ? "not-allowed" : "pointer" }}
                              >
                                ✕ Rechazar
                              </button>
                            </div>
                          )}
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
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: P.bg }}>
                <Shield className="w-12 h-12" style={{ color: P.default }} />
              </div>
              <h2 className="font-bold text-2xl text-[#1c1c1e] mb-2">
                No tienes invitaciones pendientes
              </h2>
              <p className="font-medium text-sm" style={{ color: P.default }}>
                Todas tus invitaciones han sido gestionadas
              </p>
            </div>
          )}

          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-4 mt-8 flex gap-3">
            <div className="text-lg flex-shrink-0">💡</div>
            <p className="font-medium text-sm" style={{ color: P.default }}>
              Responde a las invitaciones lo antes posible para ayudar a los organizadores a planificar mejor los equipos y torneos.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div role="status" aria-live="polite" aria-atomic="true" className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50">
          <div className="bg-[#111827] text-white px-4 py-3 rounded-xl font-medium text-sm shadow-lg flex items-center gap-3 min-w-max">
            <span>{feedback}</span>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs underline opacity-80 hover:opacity-100 ml-2">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
