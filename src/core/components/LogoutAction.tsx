import type { CSSProperties } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { LogOut } from "lucide-react";
import { removeUICache } from "@/core/utils/uiCache";

const TEAM_CONTEXT_STORAGE_KEY = "techcup.teamContext";
const TEAM_NOTIFS_STORAGE_KEY = "techcup.teamNotifications";

type LogoutActionProps = {
  accentColor?: string;
  iconColor?: string;
  buttonClassName?: string;
  buttonStyle?: CSSProperties;
  buttonAriaLabel?: string;
  title?: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
};

export function LogoutAction({
  accentColor = "#B81C1C",
  iconColor = "#6E6E73",
  buttonClassName = "w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(184,28,28,0.07)]",
  buttonStyle,
  buttonAriaLabel = "Cerrar sesion",
  title = "Cerrar sesion?",
  message = "Tu sesion en TECHCUP se cerrara. Podras volver a ingresar cuando quieras.",
  cancelLabel = "Cancelar",
  confirmLabel = "Cerrar sesion",
}: LogoutActionProps) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    setShowLogout(false);
    sessionStorage.removeItem("userContext");
    removeUICache(TEAM_CONTEXT_STORAGE_KEY);
    removeUICache(TEAM_NOTIFS_STORAGE_KEY);
    navigate("/login");
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setShowLogout(true)}
        className={buttonClassName}
        style={buttonStyle}
        aria-label={buttonAriaLabel}
        type="button"
      >
        <LogOut style={{ width: 17, height: 17, color: iconColor }} />
      </motion.button>

      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogout(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="fixed z-50 inset-0 flex items-center justify-center px-6 pointer-events-none"
            >
              <div
                className="bg-white rounded-[24px] p-8 max-w-sm w-full pointer-events-auto"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <LogOut className="w-7 h-7" style={{ color: accentColor }} />
                </div>
                <h2 className="text-xl text-black text-center mb-2" style={{ fontWeight: 700 }}>
                  {title}
                </h2>
                <p className="text-sm text-center mb-8" style={{ color: "#6E6E73", fontWeight: 500 }}>
                  {message}
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowLogout(false)}
                    className="flex-1 py-3 rounded-xl border border-black/8 text-sm"
                    style={{ fontWeight: 600, color: "#6C757D" }}
                    type="button"
                  >
                    {cancelLabel}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl text-white text-sm"
                    style={{ backgroundColor: accentColor, fontWeight: 600 }}
                    type="button"
                  >
                    {confirmLabel}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
