/**
 * @file src\core\components\Sidebar.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  User,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Calendar, label: "Eventos", path: "/events" },
    { icon: User, label: "Perfil", path: "/profile" },
    { icon: TrendingUp, label: "Estadísticas", path: "/dashboard" },
  ];

  const bottomItems = [
    { icon: Settings, label: "Configuración", path: "/dashboard" },
    { icon: LogOut, label: "Salir", path: "/" },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-black/5 fixed left-0 top-0"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-black/5">
        <Link to="/">
          <span className="text-2xl tracking-tight" style={{ fontWeight: 700, color: '#B81C1C' }}>
            TECHCUP
          </span>
        </Link>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={`menu-${index}`} to={item.path}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-[#B81C1C] text-white shadow-lg shadow-[#B81C1C]/20"
                    : "text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-black"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span style={{ fontWeight: isActive ? 600 : 500 }}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="px-4 py-6 border-t border-black/5 space-y-2">
        {bottomItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link key={`bottom-${index}`} to={item.path}>
              <motion.div
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#ADB5BD] hover:bg-[#F8F9FA] hover:text-black transition-all duration-300"
              >
                <Icon className="w-5 h-5" />
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}


