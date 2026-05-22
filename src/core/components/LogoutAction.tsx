import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/core/auth/AuthContext";

interface LogoutActionProps {
  accentColor?: string;
  iconColor?: string;
  buttonAriaLabel?: string;
  title?: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
}

export function LogoutAction({
  accentColor = "#B81C1C",
  iconColor = "#6E6E73",
  buttonAriaLabel = "Cerrar sesión",
  title = "¿Cerrar sesión?",
  message = "Tu sesión se cerrará. Podrás volver a ingresar cuando quieras.",
  cancelLabel = "Cancelar",
  confirmLabel = "Cerrar sesión",
}: LogoutActionProps) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        type="button"
        aria-label={buttonAriaLabel}
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
        style={{ color: iconColor }}
      >
        <LogOut style={{ width: 17, height: 17 }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
            >
              <div className="bg-white rounded-[24px] p-8 max-w-sm w-full pointer-events-auto" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.16)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: `${accentColor}10` }}>
                  <LogOut className="w-7 h-7" style={{ color: accentColor }} />
                </div>
                <h2 className="text-xl text-black text-center mb-2" style={{ fontWeight: 700 }}>{title}</h2>
                <p className="text-sm text-center mb-8" style={{ color: "#6E6E73", fontWeight: 500 }}>{message}</p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-black/8 text-sm"
                    style={{ fontWeight: 600, color: "#6C757D" }}
                  >
                    {cancelLabel}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleConfirm}
                    className="flex-1 py-3 rounded-xl text-white text-sm"
                    style={{ backgroundColor: accentColor, fontWeight: 600 }}
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
