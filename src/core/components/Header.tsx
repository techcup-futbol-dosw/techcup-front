/**
 * @file src\core\components\Header.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import logoTechcup from "@/assets/logo.png";

const anchorLinks = [
  { href: "#que-es", label: "¿Qué es TECHCUP?" },
  { href: "#el-torneo", label: "El Torneo" },
  { href: "#experiencia", label: "Experiencia" },
];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const handleAnchor = (href: string) => {
    setActive(href);
    setMobileOpen(false);
    scrollTo(href);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: "rgba(242,242,247,0.85)",
        borderColor: "rgba(0,0,0,0.06)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link to="/" onClick={() => { setActive(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <img src={logoTechcup} alt="TECHCUP Logo" className="w-8 h-8 object-contain" />
              <div>
                <span
                  className="block leading-none"
                  style={{ fontWeight: 800, color: "#B81C1C", fontSize: "1.05rem", letterSpacing: "-0.03em" }}
                >
                  TECHCUP
                </span>
                <span
                  className="block mt-0.5"
                  style={{ fontSize: "0.62rem", letterSpacing: "0.18em", fontWeight: 600, color: "#C4841D", textTransform: "uppercase" }}
                >
                  Torneo 2026
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop nav — only on landing */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-0.5">
              {anchorLinks.map((link) => {
                const isActive = active === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => handleAnchor(link.href)}
                    className="relative px-4 py-2 rounded-xl text-sm transition-colors duration-200"
                    style={{
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#B81C1C" : "#6E6E73",
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="header-underline"
                        className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full"
                        style={{ backgroundColor: "#B81C1C" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}

              {/* CTA button */}
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="ml-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm transition-all duration-200"
                  style={{ backgroundColor: "#B81C1C", fontWeight: 600, boxShadow: "0 2px 12px rgba(184,28,28,0.25)" }}
                >
                  Ingresar
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </Link>
            </nav>
          )}

          {/* Non-landing: simple back link */}
          {!isLanding && (
            <Link to="/">
              <span className="text-sm transition-colors duration-200" style={{ fontWeight: 400, color: "#6E6E73" }}>
                ← Inicio
              </span>
            </Link>
          )}

          {/* Mobile hamburger — only on landing */}
          {isLanding && (
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl transition-colors duration-200"
              style={{ color: "#1C1C1E" }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isLanding && mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden border-t overflow-hidden"
            style={{ background: "rgba(242,242,247,0.97)", borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className="flex flex-col px-5 py-5 gap-1">
              {anchorLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleAnchor(link.href)}
                  className="text-left px-4 py-3 rounded-[14px] text-sm transition-colors duration-200 hover:bg-white"
                  style={{ fontWeight: 400, color: "#1C1C1E" }}
                >
                  {link.label}
                </button>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <button
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] text-white text-sm"
                  style={{ backgroundColor: "#B81C1C", fontWeight: 600, boxShadow: "0 2px 12px rgba(184,28,28,0.25)" }}
                >
                  Ingresar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}


