/**
 * @file src\core\components\MobileNav.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { useEffect } from "react";
import { LayoutDashboard, Swords, Trophy, User, FolderKanban, PlusCircle, CalendarDays } from "lucide-react";

const USER_ACCENT = "#86C2F5";
const ARBITRO_ACCENT = "#8137E9";
const ORGANIZER_ACCENT = "#17C964";

export function MobileNav() {
  const location = useLocation();

  // Detectar y guardar el contexto del usuario
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard-arbitro")) {
      sessionStorage.setItem("userContext", "arbitro");
    } else if (location.pathname.startsWith("/dashboard-organizer") || location.pathname.startsWith("/organizer/")) {
      sessionStorage.setItem("userContext", "organizer");
    } else if (location.pathname === "/dashboard") {
      sessionStorage.setItem("userContext", "user");
    }
  }, [location.pathname]);

  // Obtener el contexto guardado
  const savedContext = sessionStorage.getItem("userContext");
  const isArbitroContext = savedContext === "arbitro" || location.pathname.startsWith("/dashboard-arbitro");
  const isOrganizerContext = savedContext === "organizer" || location.pathname.startsWith("/dashboard-organizer") || location.pathname.startsWith("/organizer/");
  
  let dashboardPath = "/dashboard";
  if (isArbitroContext) dashboardPath = "/dashboard-arbitro";
  if (isOrganizerContext) dashboardPath = "/dashboard-organizer";

  const activeColor = isOrganizerContext
    ? ORGANIZER_ACCENT
    : isArbitroContext
    ? ARBITRO_ACCENT
    : USER_ACCENT;

  const activeShadow = isOrganizerContext
    ? "0 4px 16px rgba(23,201,100,0.25)"
    : isArbitroContext
    ? "0 4px 16px rgba(129,55,233,0.25)"
    : "0 4px 16px rgba(134,194,245,0.3)";

  // Diferentes items de navegación según el contexto
  const navItems = isOrganizerContext
    ? [
        { path: dashboardPath, icon: LayoutDashboard, label: "Inicio" },
        { path: "/organizer/tournaments", icon: FolderKanban, label: "Torneos" },
        { path: "/organizer/create-tournament", icon: PlusCircle, label: "Crear" },
        { path: "/profile", icon: User, label: "Perfil" },
      ]
    : isArbitroContext
    ? [
        { path: dashboardPath, icon: LayoutDashboard, label: "Inicio" },
        { path: "/schedule", icon: CalendarDays, label: "Calendario" },
        { path: "/scores", icon: Trophy, label: "Puntuación" },
        { path: "/profile", icon: User, label: "Perfil" },
      ]
    : [
        { path: dashboardPath, icon: LayoutDashboard, label: "Inicio" },
        { path: "/matches", icon: Swords, label: "Partidos" },
        { path: "/scores", icon: Trophy, label: "Puntuación" },
        { path: "/profile", icon: User, label: "Perfil" },
      ];

  // Hide bottom nav on pages that don't need it (landing, login, register)
  const hiddenPaths = ["/", "/login", "/register"];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-black/5 px-4 py-2"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === dashboardPath && location.pathname === dashboardPath);

          return (
            <Link key={item.path} to={item.path} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-1 py-1"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -3 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={`p-2.5 rounded-xl transition-colors duration-300`}
                  style={{
                    backgroundColor: isActive ? activeColor : "transparent",
                    boxShadow: isActive ? activeShadow : "none",
                  }}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isActive ? "text-white" : "text-[#ADB5BD]"
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-xs transition-colors duration-300`}
                  style={{
                    color: isActive ? activeColor : "#ADB5BD",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}


