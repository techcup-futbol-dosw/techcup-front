// src/modules/users/pages/Dashboard.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";

type Screen = "invitaciones" | "perfil" | "buscar" | "admin" | "crear-equipo";

interface HomeProps {
  onNavigate?: (screen: Screen) => void; // ahora opcional
}

const getFeedbackMessage = (screen: Screen): string => {
  if (screen === "buscar") return "Buscando jugadores...";
  if (screen === "perfil") return "Abriendo tu perfil...";
  if (screen === "invitaciones") return "Cargando invitaciones...";
  return "Cargando...";
};

export default function Dashboard({ onNavigate }: Readonly<HomeProps>) {
  const navigate = useNavigate();

  // Estado minimo para feedback / visibilidad del sistema (Nielsen)
  const [feedback, setFeedback] = useState<string | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);

  const handleNavigate = (screen: Screen) => {
  // Permitir control externo (control y libertad)
  if (onNavigate) {
    onNavigate(screen);
    setFeedback(null);
    return;
  }

  const map: Record<Screen, string> = {
    invitaciones: "/invitaciones",
    perfil: "/profile",
    buscar: "/player-search", // <- cambio aquí
    admin: "/dashboard-player",
    "crear-equipo": "/dashboard/team-setup",
  };

  const path = map[screen] ?? "/";

  // Visibilidad del estado: feedback breve antes de navegar (mejora UX reading)
  setFeedback(getFeedbackMessage(screen));

  // Delay muy corto para que el usuario perciba el mensaje (Doherty)
  globalThis.setTimeout(() => navigate(path), 140);
};

  // Atajo "/" para navegacion rapida a Buscar (convencion y mejora de eficiencia)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement as HTMLElement)?.tagName !== "INPUT") {
        e.preventDefault();
        handleNavigate("buscar");
      }
    };

    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss y foco del toast para accesibilidad / lectura rapida
  useEffect(() => {
    if (!feedback || !toastRef.current) return;
    try {
      toastRef.current.focus();
    } catch {
      /* ignore */
    }
    const t = globalThis.setTimeout(() => setFeedback(null), 2500);
    return () => globalThis.clearTimeout(t);
  }, [feedback]);

  return (
    <div className="relative size-full overflow-auto bg-[#f8f9fa]">
      <div className="min-h-screen px-[80px] py-[60px]">
        {/* Banner de Bienvenida */}
        <div className="bg-gradient-to-r from-[#4a9eff] to-[#6eb5ff] rounded-[20px] p-[40px] mb-[40px] relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <div className="text-[120px]">👋</div>
          </div>
          <div className="relative z-10">
            <h1
              className="font-['DM_Sans:ExtraBold',sans-serif] font-extrabold text-white text-[36px] mb-3 m-0"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              ¡Bienvenido al torneo! 👋
            </h1>
            <p
              className="font-['DM_Sans:Medium',sans-serif] font-medium text-white/90 text-[16px] max-w-[600px] m-0"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Mantente al tanto de los partidos, tablas de posiciones y toda la informacion del torneo desde aqui
            </p>
            <button
              type="button"
              onClick={() => handleNavigate("buscar")}
              className="mt-6 bg-white hover:bg-gray-100 text-[#4a9eff] px-6 py-3 rounded-[12px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[15px] transition-all flex items-center gap-2 shadow-lg"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              <Search style={{ width: 18, height: 18 }} />
              Buscar Jugadores
            </button>
          </div>
        </div>

        {/* PROXIMA AL TORNEO */}
        <div className="mb-[40px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-[16px] bg-[#b81c1c] rounded-full" />
            <h2
              className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1c1c1e] text-[13px] uppercase tracking-[1.2px] m-0"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Proxima al Torneo
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Partidos para Hoy */}
            <button
              type="button"
              onClick={() => handleNavigate("buscar")}
              className="bg-white rounded-[16px] p-5 border border-[#e8e8ed] hover:border-[#b81c1c]/30 transition-all cursor-pointer hover:shadow-md text-left w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[48px] h-[48px] bg-[#ffe5e5] rounded-[12px] flex items-center justify-center text-[24px]">
                  ⚽
                </div>
                <div className="flex-1">
                  <h3
                    className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1c1c1e] text-[16px] m-0"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Partidos para Hoy
                  </h3>
                </div>
              </div>
              <p
                className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#6e6e73] text-[13px] m-0"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Consulta todos los partidos del dia
              </p>
            </button>

            {/* Calendario */}
            <button
              type="button"
              onClick={() => handleNavigate("buscar")}
              className="bg-white rounded-[16px] p-5 border border-[#e8e8ed] hover:border-[#c4841d]/30 transition-all cursor-pointer hover:shadow-md text-left w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[48px] h-[48px] bg-[#fff4e5] rounded-[12px] flex items-center justify-center text-[24px]">
                  📅
                </div>
                <div className="flex-1">
                  <h3
                    className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1c1c1e] text-[16px] m-0"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Calendario
                  </h3>
                </div>
              </div>
              <p
                className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#6e6e73] text-[13px] m-0"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Explora el calendario y calendario del torneo
              </p>
            </button>

            {/* Tabla de Posiciones */}
            <button
              type="button"
              onClick={() => handleNavigate("perfil")}
              className="bg-white rounded-[16px] p-5 border border-[#e8e8ed] hover:border-[#34c759]/30 transition-all cursor-pointer hover:shadow-md text-left w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[48px] h-[48px] bg-[#e5f8ea] rounded-[12px] flex items-center justify-center text-[24px]">
                  📊
                </div>
                <div className="flex-1">
                  <h3
                    className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1c1c1e] text-[16px] m-0"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Tabla de Posiciones
                  </h3>
                </div>
              </div>
              <p
                className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#6e6e73] text-[13px] m-0"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Ve el ranking y estadisticas del torneo
              </p>
            </button>

            {/* Info del Torneo */}
            <button
              type="button"
              onClick={() => handleNavigate("perfil")}
              className="bg-white rounded-[16px] p-5 border border-[#e8e8ed] hover:border-[#4a9eff]/30 transition-all cursor-pointer hover:shadow-md text-left w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[48px] h-[48px] bg-[#e5f2ff] rounded-[12px] flex items-center justify-center text-[24px]">
                  ℹ️
                </div>
                <div className="flex-1">
                  <h3
                    className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1c1c1e] text-[16px] m-0"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Info del Torneo
                  </h3>
                </div>
              </div>
              <p
                className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#6e6e73] text-[13px] m-0"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Detalles, reglas e informacion general
              </p>
            </button>
          </div>
        </div>

        {/* MI EQUIPO */}
        <div className="mb-[40px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-[16px] bg-[#b81c1c] rounded-full" />
            <h2
              className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1c1c1e] text-[13px] uppercase tracking-[1.2px] m-0"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Mi Equipo
            </h2>
          </div>

          <div className="bg-white rounded-[16px] p-[32px] border border-[#e8e8ed]">
            <div className="text-center max-w-[600px] mx-auto">
              <div className="w-[80px] h-[80px] bg-[#f2f2f7] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#8a8a8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3
                className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1c1c1e] text-[20px] mb-3 m-0"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Aun no perteneces a un equipo
              </h3>
              <p
                className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#6e6e73] text-[14px] mb-6 m-0"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                Inscribe tu equipo para informacion del rol jugador y fechas de juego.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => handleNavigate("invitaciones")}
                  className="bg-[#b81c1c] hover:bg-[#9a1717] text-white px-8 py-4 rounded-[14px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[15px] transition-colors shadow-md"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  📬 Ver Invitaciones
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate("crear-equipo")}
                  className="bg-[#f2f2f7] hover:bg-[#e8e8ed] text-[#1c1c1e] px-8 py-4 rounded-[14px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[15px] transition-colors border border-[#e8e8ed]"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  ➕ Crear Equipo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* UNETE AL TORNEO */}
        <div className="mb-[40px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-[16px] bg-[#b81c1c] rounded-full" />
            <h2
              className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1c1c1e] text-[13px] uppercase tracking-[1.2px] m-0"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              Unete al Torneo
            </h2>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate("crear-equipo")}
            className="bg-gradient-to-r from-[#b81c1c] to-[#c4841d] rounded-[16px] p-[32px] cursor-pointer hover:shadow-lg transition-all w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] bg-white/20 rounded-[14px] flex items-center justify-center text-[28px]">
                  🏆
                </div>
                <div>
                  <h3
                    className="font-['DM_Sans:Bold',sans-serif] font-bold text-white text-[20px] mb-1 m-0"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Inscripcion al Torneo
                  </h3>
                  <p
                    className="font-['DM_Sans:Medium',sans-serif] font-medium text-white/80 text-[14px] m-0"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    ¿Listo tu equipo? o unete a la convocatoria
                  </p>
                </div>
              </div>
              <div className="text-white text-[24px]">→</div>
            </div>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          ref={toastRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 bg-[#1c1c1e] text-white px-4 py-2 rounded-[10px] shadow-lg text-sm"
        >
          {feedback}
        </div>
      )}
    </div>
  );
}