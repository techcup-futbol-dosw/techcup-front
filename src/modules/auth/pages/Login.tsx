/**
 * @file src\modules\auth\pages\Login.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import logoTechcup from "@/assets/logo.png";

const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  bg: "#F2F2F7",
};

type View = "login" | "forgot" | "forgot-sent";

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockPassword, setCapsLockPassword] = useState(false);
  const [view, setView] = useState<View>("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  const personalDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com"];

  const suggestEmail = (value: string) => {
    const typoMap: Record<string, string> = {
      "gmal.com": "gmail.com",
      "gnail.com": "gmail.com",
      "hotnail.com": "hotmail.com",
      "outlok.com": "outlook.com",
      "yaho.com": "yahoo.com",
    };
    const parts = value.toLowerCase().split("@");
    if (parts.length !== 2) return null;
    const replacement = typoMap[parts[1]];
    if (!replacement) return null;
    return `${parts[0]}@${replacement}`;
  };

  const isValidEmailType = (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    const domain = email.toLowerCase().split("@")[1] ?? "";
    const isInstitutional = /\.edu(\.[a-z]{2})?$/i.test(domain);
    const isPersonal = personalDomains.includes(domain);
    return isInstitutional || isPersonal;
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) newErrors.email = "El correo es requerido";
    else if (!isValidEmailType(formData.email)) newErrors.email = "Usa un correo institucional (.edu) o personal válido";
    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); navigate("/dashboard"); }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === "email") {
      setEmailSuggestion(value ? suggestEmail(value) : null);
    }
  };

  const handleRecoverySend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setView("forgot-sent"); }, 1500);
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    fontSize: "0.92rem",
    fontWeight: 500,
    backgroundColor: P.bg,
    border: "1.5px solid transparent",
    borderRadius: "14px",
    outline: "none",
    padding: "0.75rem 1rem 0.75rem 2.8rem",
    color: "#1C1C1E",
    transition: "border-color 0.2s",
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Panel Izquierdo ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-1/2 relative overflow-hidden flex flex-col p-8 md:p-12 lg:p-14 min-h-[50vh] md:min-h-screen"
        style={{ background: "linear-gradient(160deg, #5C0000 0%, #8B0000 45%, #B81C1C 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full" style={{ background: "rgba(196,132,29,0.10)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 flex flex-col h-full"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center p-2" style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
              <img src={logoTechcup} alt="TECHCUP Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white leading-none" style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>TECHCUP</p>
              <p className="text-white/50 mt-0.5" style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Torneo Universitario</p>
            </div>
          </div>

          {/* Headline */}
          <div className="my-auto py-10">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-white mb-7"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.03em" }}
            >
              Donde la pasión<br />
              por competir se une<br />
              con la tecnología<br />
              <span style={{ color: P.secondary }}>para crear algo</span><br />
              <span style={{ color: P.secondary }}>más grande.</span>
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="w-10 h-0.5 rounded-full"
              style={{ backgroundColor: P.secondary, originX: 0 } as React.CSSProperties}
            />
          </div>

          {/* Footer */}
          <p className="text-white/35 pt-5" style={{ fontSize: "0.78rem", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            Escuela Colombiana de Ingeniería
          </p>
        </motion.div>
      </motion.div>

      {/* ── Panel Derecho ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 md:p-12 lg:p-16"
      >
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">

            {/* ── Login ── */}
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.03em" }}>
                  Iniciar Sesión
                </h2>
                <p className="mt-2 mb-8" style={{ fontSize: "0.9rem", color: "#6E6E73", fontWeight: 500 }}>
                  Ingresa tus credenciales para acceder
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6E6E73" }} />
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="tu@email.com"
                        style={{
                          ...inputBase,
                          borderColor: errors.email ? "#B81C1C" : "transparent",
                          backgroundColor: errors.email ? "rgba(184,28,28,0.04)" : P.bg,
                        }}
                        onFocus={(e) => { if (!errors.email) e.target.style.borderColor = P.secondary; }}
                        onBlur={(e) => { if (!errors.email) e.target.style.borderColor = "transparent"; }}
                      />
                    </div>
                    {errors.email && <p className="mt-1" style={{ fontSize: "0.75rem", color: P.primary }}>{errors.email}</p>}
                    {!errors.email && emailSuggestion && (
                      <p className="mt-1" style={{ fontSize: "0.75rem", color: "#0066FE", fontWeight: 600 }}>
                        ¿Quisiste decir <button type="button" onClick={() => setFormData((prev) => ({ ...prev, email: emailSuggestion }))} style={{ textDecoration: "underline" }}>{emailSuggestion}</button>?
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Contraseña</label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        style={{ fontSize: "0.78rem", fontWeight: 600, color: P.primary }}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6E6E73" }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password" value={formData.password} onChange={handleChange}
                        placeholder="••••••••"
                        onKeyUp={(e) => setCapsLockPassword(e.getModifierState("CapsLock"))}
                        style={{
                          ...inputBase,
                          paddingRight: "3rem",
                          borderColor: errors.password ? P.primary : "transparent",
                          backgroundColor: errors.password ? "rgba(184,28,28,0.04)" : P.bg,
                        }}
                        onFocus={(e) => { if (!errors.password) e.target.style.borderColor = P.secondary; }}
                        onBlur={(e) => { if (!errors.password) e.target.style.borderColor = "transparent"; }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "#6E6E73" }}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {capsLockPassword && <p className="mt-1" style={{ fontSize: "0.75rem", color: P.secondary, fontWeight: 600 }}>Bloq Mayús está activado</p>}
                    {errors.password && <p className="mt-1" style={{ fontSize: "0.75rem", color: P.primary }}>{errors.password}</p>}
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-white flex items-center justify-center gap-2 mt-2"
                    style={{
                      backgroundColor: P.primary,
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      padding: "0.9rem 1.5rem",
                      borderRadius: "14px",
                      boxShadow: "0 6px 24px rgba(184,28,28,0.28)",
                      opacity: isLoading ? 0.75 : 1,
                    }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : "Ingresar"}
                  </motion.button>
                </form>

                {/* Security note */}
                <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: P.bg }}>
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: P.primary }} />
                  <div>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1C1C1E" }}>Inicio de sesión seguro</p>
                    <p className="mt-0.5" style={{ fontSize: "0.78rem", color: "#6E6E73", fontWeight: 500 }}>
                      Tu información está protegida y cifrada de extremo a extremo.
                    </p>
                  </div>
                </div>

                <p className="mt-7 text-center" style={{ fontSize: "0.88rem", color: "#6E6E73" }}>
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" style={{ color: P.primary, fontWeight: 700 }}>Regístrate aquí</Link>
                </p>
                <p className="mt-4 text-center">
                  <Link to="/" style={{ fontSize: "0.82rem", color: "#8A8A8E", fontWeight: 500 }}>← Volver al inicio</Link>
                </p>

                {/* Quick access buttons */}
                <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <p className="text-center mb-3" style={{ fontSize: "0.72rem", fontWeight: 600, color: "#8A8A8E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Acceso rápido (demo)
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: "Usuario", path: "/dashboard", color: "#6E6E73" },
                      { label: "Árbitro", path: "/dashboard-arbitro", color: P.secondary },
                      { label: "Organizador", path: "/dashboard-organizer", color: P.primary },
                    ].map(({ label, path, color }) => (
                      <motion.button
                        key={label}
                        type="button"
                        onClick={() => navigate(path)}
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex-1 text-white"
                        style={{
                          backgroundColor: color,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          padding: "0.45rem 0.5rem",
                          borderRadius: "10px",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Forgot ── */}
            {view === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-2 mb-8 transition-colors duration-200"
                  style={{ color: "#6E6E73", fontSize: "0.88rem", fontWeight: 500 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al login
                </button>

                <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.03em" }}>
                  Recuperar contraseña
                </h2>
                <p className="mt-2 mb-8" style={{ fontSize: "0.9rem", color: "#6E6E73", fontWeight: 500 }}>
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <form onSubmit={handleRecoverySend} className="space-y-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6E6E73" }} />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        required
                        placeholder="tu@email.com"
                        style={inputBase}
                        onFocus={(e) => (e.target.style.borderColor = P.secondary)}
                        onBlur={(e) => (e.target.style.borderColor = "transparent")}
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-white flex items-center justify-center"
                    style={{
                      backgroundColor: P.primary,
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      padding: "0.9rem 1.5rem",
                      borderRadius: "14px",
                      boxShadow: "0 6px 24px rgba(184,28,28,0.28)",
                      opacity: isLoading ? 0.75 : 1,
                    }}
                  >
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : "Enviar enlace de recuperación"}
                  </motion.button>
                </form>

                <div className="mt-5 p-4 rounded-2xl" style={{ backgroundColor: "rgba(0,102,254,0.06)", border: "1px solid rgba(0,102,254,0.15)" }}>
                  <p style={{ fontSize: "0.82rem", color: "#0066FE", fontWeight: 500 }}>
                    Si el correo está registrado, recibirás un mensaje en los próximos minutos. Revisa también tu carpeta de spam.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Sent ── */}
            {view === "forgot-sent" && (
              <motion.div
                key="forgot-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: "rgba(23,201,100,0.12)" }}
                >
                  <CheckCircle className="w-10 h-10" style={{ color: "#17C964" }} />
                </motion.div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.02em" }}>¡Correo enviado!</h2>
                <p className="mt-2" style={{ fontSize: "0.9rem", color: "#6E6E73", fontWeight: 500 }}>Hemos enviado un enlace de recuperación a:</p>
                <p className="mt-1 mb-8" style={{ fontWeight: 700, color: "#1C1C1E" }}>{recoveryEmail}</p>
                <p className="mb-8" style={{ fontSize: "0.82rem", color: "#8A8A8E", fontWeight: 500 }}>
                  El enlace expira en 30 minutos. Si no lo ves, revisa tu carpeta de spam.
                </p>
                <motion.button
                  onClick={() => setView("login")}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-white"
                  style={{ backgroundColor: P.primary, fontWeight: 700, fontSize: "0.92rem", padding: "0.9rem 1.5rem", borderRadius: "14px", boxShadow: "0 6px 24px rgba(184,28,28,0.28)" }}
                >
                  Volver al inicio de sesión
                </motion.button>
                <button
                  onClick={() => { setView("forgot"); setRecoveryEmail(""); }}
                  className="mt-4 block w-full text-center"
                  style={{ fontSize: "0.82rem", color: "#8A8A8E", fontWeight: 500 }}
                >
                  Usar otro correo
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}


