/**
 * @file src/modules/auth/pages/Register.tsx
 */
import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, User, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/core/auth/AuthContext.tsx";
import { authService, type RegisterAccountRequestDto } from "@/modules/auth/services/authService";
import { ApiError } from "@/core/api/http";
import logoTechcup from "@/assets/logo.png";

const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  bg: "#F2F2F7",
};


const RELATIONS = [
  { value: "ESTUDIANTE",     label: "Estudiante" },
  { value: "GRADUADO",       label: "Graduado" },
  { value: "PROFESOR",       label: "Profesor" },
  { value: "PERSONAL_ADMIN", label: "Personal administrativo" },
  { value: "FAMILIAR",       label: "Familiar" },
] as const;

type RelationValue = typeof RELATIONS[number]["value"];

const PROGRAMS = [
  { value: "SISTEMAS",                label: "Ingeniería de Sistemas" },
  { value: "INTELIGENCIA_ARTIFICIAL", label: "Ingeniería de Inteligencia Artificial" },
  { value: "CIBERSEGURIDAD",          label: "Ingeniería de Ciberseguridad" },
  { value: "ESTADISTICA",             label: "Ingeniería Estadística" },
  { value: "BIOTECNOLOGIA",           label: "Ingeniería en Biotecnología" },
  { value: "CIVIL",                   label: "Ingeniería Civil" },
  { value: "AMBIENTAL",               label: "Ingeniería Ambiental" },
  { value: "ELECTRICA",               label: "Ingeniería Eléctrica" },
  { value: "INDUSTRIAL",              label: "Ingeniería Industrial" },
  { value: "ELECTRONICA",             label: "Ingeniería Electrónica" },
  { value: "MECANICA",                label: "Ingeniería Mecánica" },
  { value: "BIOMEDICA",               label: "Ingeniería Biomédica" },
  { value: "ECONOMIA",                label: "Economía" },
  { value: "ADMINISTRACION_EMPRESAS", label: "Administración de Empresas" },
  { value: "MATEMATICAS",             label: "Matemáticas" },
] as const;

const GENDERS = [
  { value: "MALE",   label: "Masculino" },
  { value: "FEMALE", label: "Femenino" },
  { value: "OTHER",  label: "Otro" },
] as const;

const ID_TYPES = [
  { value: "CC",       label: "Cédula de ciudadanía" },
  { value: "TI",       label: "Tarjeta de identidad" },
  { value: "PASSPORT", label: "Pasaporte" },
] as const;

type FormData = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: string;
  relation: RelationValue | "";
  program: string;
  semester: string;
  identificationType: string;
  identification: string;
};

type FormErrors = Partial<Record<keyof FormData | "general", string>>;


const INSTITUTIONAL_REGEX = /\.edu(\.[a-z]{2})?$/i;
const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;

function isValidEmail(email: string, relation: RelationValue | ""): boolean {
  if (!email) return false;
  if (relation === "FAMILIAR") return GMAIL_REGEX.test(email);
  return INSTITUTIONAL_REGEX.test(email.toLowerCase().split("@")[1] ?? "");
}

const EMAIL_TYPOS: Record<string, string> = {
  "gmal.com":    "gmail.com",
  "gnail.com":   "gmail.com",
  "hotnail.com": "hotmail.com",
  "outlok.com":  "outlook.com",
  "yaho.com":    "yahoo.com",
};

function suggestEmail(value: string): string | null {
  const parts = value.toLowerCase().split("@");
  if (parts.length !== 2) return null;
  const fix = EMAIL_TYPOS[parts[1]];
  return fix ? `${parts[0]}@${fix}` : null;
}

function requiresSemester(relation: RelationValue | ""): boolean {
  return relation === "ESTUDIANTE";
}

function resolveRegisterError(error: unknown): FormErrors {
  if (error instanceof ApiError) {
    if (error.status === 409) return { email: "Este correo ya está registrado." };
    if (error.status === 400) return { general: "Datos inválidos. Revisa el formulario." };
    if (error.message)        return { general: error.message };
  }
  return { general: "No fue posible crear la cuenta. Inténtalo de nuevo." };
}


export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading]             = useState(false);
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [capsLockPass, setCapsLockPass]       = useState(false);
  const [capsLockConf, setCapsLockConf]       = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [errors, setErrors]                   = useState<FormErrors>({});

  const [form, setForm] = useState<FormData>({
    name: "", lastName: "", email: "", password: "", confirmPassword: "",
    birthDate: "", gender: "", relation: "", program: "",
    semester: "", identificationType: "", identification: "",
  });


  const resolveDashboardPath = (roles: string[] | undefined): string => {
    const normalizedRoles = (roles ?? []).map((role) => role.toUpperCase());
    if (normalizedRoles.includes("ADMIN"))     return "/dashboard-organizer";
    if (normalizedRoles.includes("ORGANIZER")) return "/dashboard-organizer";
    if (normalizedRoles.includes("REFEREE"))   return "/dashboard-arbitro";
    return "/dashboard";
  };


  function validate(): boolean {
    const e: FormErrors = {};

    if (!form.name.trim())
      e.name = "El nombre es obligatorio";
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(form.name.trim()))
      e.name = "Solo se permiten letras y espacios";

    if (!form.lastName.trim())
      e.lastName = "El apellido es obligatorio";
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(form.lastName.trim()))
      e.lastName = "Solo se permiten letras y espacios";

    if (!form.relation)
      e.relation = "Selecciona tu relación con la institución";

    if (!form.email.trim())
      e.email = "El correo es obligatorio";
    else if (!isValidEmail(form.email.trim(), form.relation)) {
      e.email = form.relation === "FAMILIAR"
        ? "Los familiares deben usar un correo Gmail"
        : "Usa un correo institucional (.edu)";
    }

    if (!form.password)
      e.password = "La contraseña es obligatoria";
    else if (form.password.length < 8)
      e.password = "Mínimo 8 caracteres";
    else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password))
      e.password = "Incluye mayúscula, minúscula y número";

    if (!form.confirmPassword)
      e.confirmPassword = "Confirma la contraseña";
    else if (form.confirmPassword !== form.password)
      e.confirmPassword = "Las contraseñas no coinciden";

    if (!form.birthDate)
      e.birthDate = "La fecha de nacimiento es obligatoria";

    if (!form.gender)
      e.gender = "Selecciona tu género";

    if (!form.program)
      e.program = "Selecciona tu programa";

    if (requiresSemester(form.relation)) {
      const sem = Number(form.semester);
      if (!form.semester)
        e.semester = "El semestre es obligatorio para estudiantes";
      else if (!Number.isInteger(sem) || sem < 1 || sem > 10)
        e.semester = "El semestre debe estar entre 1 y 10";
    }

    if (!form.identificationType)
      e.identificationType = "Selecciona el tipo de identificación";

    if (!form.identification.trim())
      e.identification = "El número de identificación es obligatorio";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);

    const payload: RegisterAccountRequestDto = {
      name:               form.name.trim(),
      lastName:           form.lastName.trim(),
      email:              form.email.trim(),
      password:           form.password,
      birthDate:          form.birthDate,
      gender:             form.gender,
      relation:           form.relation,
      program:            form.program,
      semester:           requiresSemester(form.relation) ? Number(form.semester) : 1,
      identificationType: form.identificationType,
      identification:     form.identification.trim(),
    };

    try {
      await authService.register(payload);
    } catch (error) {
      console.log("Error completo:", error);
      console.log("Es ApiError:", error instanceof ApiError);
      setErrors(resolveRegisterError(error));
      setIsLoading(false);
      return;
    }

    try {
      const session = await login(form.email.trim(), form.password);
      navigate(resolveDashboardPath(session.roles));
    } catch {
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors])
      setErrors((prev) => ({ ...prev, [name]: undefined }));

    if (errors.general)
      setErrors((prev) => ({ ...prev, general: undefined }));

    if (name === "email")
      setEmailSuggestion(value ? suggestEmail(value) : null);

    if (name === "relation" && value !== "ESTUDIANTE")
      setForm((prev) => ({ ...prev, relation: value as RelationValue, semester: "" }));
  };


  const inputBase: React.CSSProperties = {
    width: "100%", fontSize: "0.92rem", fontWeight: 500,
    backgroundColor: P.bg, border: "1.5px solid transparent",
    borderRadius: "14px", outline: "none",
    padding: "0.75rem 1rem 0.75rem 2.8rem",
    color: "#1C1C1E", transition: "border-color 0.2s",
  };

  const inputNoIcon: React.CSSProperties = { ...inputBase, padding: "0.75rem 1rem" };

  const selectStyle: React.CSSProperties = {
    width: "100%", fontSize: "0.9rem", fontWeight: 500,
    backgroundColor: P.bg, border: "1.5px solid transparent",
    borderRadius: "14px", outline: "none",
    padding: "0.75rem 2.5rem 0.75rem 1rem",
    color: "#1C1C1E", appearance: "none",
    transition: "border-color 0.2s",
  };

  const withError = (hasError: boolean): React.CSSProperties => ({
    borderColor:     hasError ? P.primary : "transparent",
    backgroundColor: hasError ? "rgba(184,28,28,0.04)" : P.bg,
  });

  const onFocus = (e: React.FocusEvent<HTMLElement>) =>
    ((e.target as HTMLElement & { style: CSSStyleDeclaration }).style.borderColor = P.secondary);
  const onBlur  = (e: React.FocusEvent<HTMLElement>) =>
    ((e.target as HTMLElement & { style: CSSStyleDeclaration }).style.borderColor = "transparent");

  const fieldErr = (name: keyof FormErrors) =>
    errors[name]
      ? <p className="mt-1" style={{ fontSize: "0.75rem", color: P.primary, fontWeight: 600 }}>{errors[name]}</p>
      : null;


  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Panel izquierdo — branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-1/2 relative overflow-hidden flex flex-col justify-center p-8 md:p-12 lg:p-16 min-h-[42vh] md:min-h-screen"
        style={{ background: "linear-gradient(160deg, #5C0000 0%, #8B0000 45%, #B81C1C 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(-50%,-50%)" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(50%,50%)" }} />
          <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(196,132,29,0.08)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2" style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
              <img src={logoTechcup} alt="TECHCUP" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white leading-none" style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>TECHCUP</p>
              <p className="text-white/50 mt-0.5" style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Torneo Universitario</p>
            </div>
          </div>

          <h2
            className="text-white mb-5"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em" }}
          >
            Únete a nuestra<br />comunidad y empieza<br />
            <span style={{ color: P.secondary }}>tu viaje.</span>
          </h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-10 h-0.5 rounded-full mb-6"
            style={{ backgroundColor: P.secondary, originX: 0 } as React.CSSProperties}
          />

          <p className="text-white/55" style={{ fontSize: "0.92rem", fontWeight: 500, lineHeight: 1.65 }}>
            Todos los usuarios se registran como jugadores. Los roles de capitán,
            organizador y árbitro son asignados posteriormente por el administrador.
          </p>
        </motion.div>
      </motion.div>

      {/* ── Panel derecho — formulario ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 md:p-12"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.03em" }}>
              Crear Cuenta
            </h2>
            <p className="mt-2 mb-6" style={{ fontSize: "0.9rem", color: "#6E6E73", fontWeight: 500 }}>
              Completa tus datos para registrarte como jugador
            </p>

            <Link
              to="/login"
              className="w-full flex items-center justify-center py-3 px-5 rounded-2xl mb-5 transition-all duration-200"
              style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1C1C1E", backgroundColor: P.bg, border: "1.5px solid rgba(0,0,0,0.07)" }}
            >
              Ya tengo cuenta — Iniciar sesión
            </Link>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white" style={{ fontSize: "0.78rem", color: "#8A8A8E", fontWeight: 500 }}>O regístrate con email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Error general */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-3"
                  style={{ backgroundColor: "rgba(184,28,28,0.08)", border: "1px solid rgba(184,28,28,0.18)" }}
                >
                  <p style={{ fontSize: "0.82rem", color: P.primary, fontWeight: 600 }}>{errors.general}</p>
                </motion.div>
              )}

              {/* ── Datos personales ── */}
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A8A8E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Datos personales
              </p>

              {/* Nombre y apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6E6E73" }} />
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Juan"
                      style={{ ...inputBase, ...withError(!!errors.name) }} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  {fieldErr("name")}
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Apellido</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6E6E73" }} />
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Pérez"
                      style={{ ...inputBase, ...withError(!!errors.lastName) }} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  {fieldErr("lastName")}
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Fecha de nacimiento</label>
                <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  style={{ ...inputNoIcon, ...withError(!!errors.birthDate) }} onFocus={onFocus} onBlur={onBlur} />
                {fieldErr("birthDate")}
              </div>

              {/* Género */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Género</label>
                <div className="relative">
                  <select name="gender" value={form.gender} onChange={handleChange}
                    style={{ ...selectStyle, ...withError(!!errors.gender) }} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Selecciona</option>
                    {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#6E6E73" }} />
                </div>
                {fieldErr("gender")}
              </div>

              {/* Tipo y número de identificación */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Tipo de ID</label>
                  <div className="relative">
                    <select name="identificationType" value={form.identificationType} onChange={handleChange}
                      style={{ ...selectStyle, ...withError(!!errors.identificationType) }} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Tipo</option>
                      {ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#6E6E73" }} />
                  </div>
                  {fieldErr("identificationType")}
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Número</label>
                  <input type="text" name="identification" value={form.identification} onChange={handleChange}
                    placeholder="1234567890"
                    style={{ ...inputNoIcon, ...withError(!!errors.identification) }} onFocus={onFocus} onBlur={onBlur} />
                  {fieldErr("identification")}
                </div>
              </div>

              {/* ── Información académica ── */}
              <p className="pt-2" style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A8A8E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Información académica
              </p>

              {/* Relación */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Relación con la institución</label>
                <div className="relative">
                  <select name="relation" value={form.relation} onChange={handleChange}
                    style={{ ...selectStyle, ...withError(!!errors.relation) }} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Selecciona</option>
                    {RELATIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#6E6E73" }} />
                </div>
                {fieldErr("relation")}
                {form.relation === "FAMILIAR" && (
                  <p className="mt-1" style={{ fontSize: "0.75rem", color: "#6E6E73", fontWeight: 500 }}>
                    Los familiares deben registrarse con un correo Gmail.
                  </p>
                )}
              </div>

              {/* Programa */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Programa académico</label>
                <div className="relative">
                  <select name="program" value={form.program} onChange={handleChange}
                    style={{ ...selectStyle, ...withError(!!errors.program) }} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Selecciona tu programa</option>
                    {PROGRAMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#6E6E73" }} />
                </div>
                {fieldErr("program")}
              </div>

              {/* Semestre — solo ESTUDIANTE */}
              {requiresSemester(form.relation) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Semestre actual</label>
                  <div className="relative">
                    <select name="semester" value={form.semester} onChange={handleChange}
                      style={{ ...selectStyle, ...withError(!!errors.semester) }} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Selecciona semestre</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#6E6E73" }} />
                  </div>
                  {fieldErr("semester")}
                </motion.div>
              )}

              {/* ── Datos de acceso ── */}
              <p className="pt-2" style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A8A8E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Datos de acceso
              </p>

              {/* Email */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6E6E73" }} />
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder={form.relation === "FAMILIAR" ? "tu@gmail.com" : "tu@escuelacolombia.edu.co"}
                    style={{ ...inputBase, ...withError(!!errors.email) }} onFocus={onFocus} onBlur={onBlur} />
                </div>
                {fieldErr("email")}
                {!errors.email && emailSuggestion && (
                  <p className="mt-1" style={{ fontSize: "0.75rem", color: "#0066FE", fontWeight: 600 }}>
                    ¿Quisiste decir{" "}
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, email: emailSuggestion }))} style={{ textDecoration: "underline" }}>
                      {emailSuggestion}
                    </button>?
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6E6E73" }} />
                  <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                    placeholder="••••••••"
                    onKeyUp={(e) => setCapsLockPass(e.getModifierState("CapsLock"))}
                    style={{ ...inputBase, paddingRight: "3rem", ...withError(!!errors.password) }} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6E6E73" }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {capsLockPass && <p className="mt-1" style={{ fontSize: "0.75rem", color: P.secondary, fontWeight: 600 }}>Bloq Mayús está activado</p>}
                {fieldErr("password")}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6E6E73" }}>Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6E6E73" }} />
                  <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    placeholder="••••••••"
                    onKeyUp={(e) => setCapsLockConf(e.getModifierState("CapsLock"))}
                    style={{ ...inputBase, paddingRight: "3rem", ...withError(!!errors.confirmPassword) }} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6E6E73" }}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {capsLockConf && <p className="mt-1" style={{ fontSize: "0.75rem", color: P.secondary, fontWeight: 600 }}>Bloq Mayús está activado</p>}
                {fieldErr("confirmPassword")}
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={isLoading}
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                className="w-full text-white flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: P.primary, fontWeight: 700, fontSize: "0.92rem", padding: "0.9rem 1.5rem", borderRadius: "14px", boxShadow: "0 6px 24px rgba(184,28,28,0.28)", opacity: isLoading ? 0.75 : 1 }}
              >
                {isLoading
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  : "Crear cuenta"}
              </motion.button>
            </form>

            {/* Nota de privacidad */}
            <div className="mt-5 flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: P.bg }}>
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: P.primary }} />
              <p style={{ fontSize: "0.78rem", color: "#6E6E73", fontWeight: 500, lineHeight: 1.55 }}>
                Al registrarte aceptas nuestros términos y condiciones. Tu información
                está protegida y nunca será compartida con terceros.
              </p>
            </div>

            <p className="mt-6 text-center">
              <Link to="/" style={{ fontSize: "0.82rem", color: "#8A8A8E", fontWeight: 500 }}>← Volver al inicio</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}