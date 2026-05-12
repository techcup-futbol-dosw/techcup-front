/**
 * @file src\modules\auth\pages\LandingPage.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { motion } from "motion/react";
import { Link } from "react-router";
import { Header } from "@/core/components/Header";
import {
  ArrowRight,
  Trophy,
  Calendar,
  BarChart2,
  Users,
  Heart,
  Smile,
  Handshake,
  Star,
} from "lucide-react";

import campusImg from "@/assets/campus.jpg";

const reasons = [
  {
    icon: Users,
    title: "Fortalecer la comunidad",
    desc: "Un espacio para que los estudiantes del área de Sistemas se conozcan más allá de las aulas.",
  },
  {
    icon: Heart,
    title: "Vivir el deporte",
    desc: "El fútbol como excusa perfecta para desconectarse del estrés académico y disfrutar.",
  },
  {
    icon: Smile,
    title: "Momentos diferentes",
    desc: "Compartir experiencias que van más allá de proyectos y exámenes.",
  },
  {
    icon: Handshake,
    title: "Competencia sana",
    desc: "Rivalidad dentro del campo, amistad fuera de él. Así es TECHCUP.",
  },
];

const features = [
  {
    icon: Trophy,
    title: "Partidos en vivo",
    desc: "Consulta los resultados del día en tiempo real.",
  },
  {
    icon: Calendar,
    title: "Calendario completo",
    desc: "Todos los encuentros, fechas y horarios en un solo lugar.",
  },
  {
    icon: BarChart2,
    title: "Tabla de posiciones",
    desc: "Clasificación actualizada automáticamente tras cada partido.",
  },
];

const testimonials = [
  {
    name: "Camila Torres",
    career: "Ing. de Sistemas — 5.° semestre",
    quote:
      "TECHCUP cambió cómo me relaciono con mis compañeros. Ahora nos vemos diferente dentro del salón.",
    initial: "C",
    color: "#990000",
  },
  {
    name: "Sebastián Mora",
    career: "Ing. de Sistemas — 7.° semestre",
    quote:
      "Jugar en la universidad nunca había sido tan emocionante. La plataforma lo hace todo más fácil y organizado.",
    initial: "S",
    color: "#C4841D",
  },
  {
    name: "Laura Peña",
    career: "Ing. de Sistemas — 3.° semestre",
    quote:
      "Me sorprendió que desde primer año ya me sentí parte de algo. TECHCUP une a toda la carrera.",
    initial: "L",
    color: "#0066FE",
  },
];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background campus photo */}
        <div className="absolute inset-0 z-0">
          <img
            src={campusImg}
            alt="Campus universitario"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay para legibilidad */}
          <div className="absolute inset-0 bg-black/55" />
          {/* Gradiente inferior para transición suave */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Soft background blobs — ahora sobre la imagen */}
        <motion.div
          animate={{ y: [0, -24, 0], rotate: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute top-24 right-12 w-72 h-72 rounded-full blur-3xl opacity-20 z-10"
          style={{ background: "radial-gradient(circle, #990000 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ y: [0, 24, 0], rotate: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute bottom-24 left-12 w-80 h-80 rounded-full blur-3xl opacity-10 z-10"
          style={{ background: "radial-gradient(circle, #C4841D 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-24 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border"
            style={{
              borderColor: "rgba(255,255,255,0.25)",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="text-xs uppercase tracking-widest"
              style={{ fontWeight: 700, color: "rgba(255,255,255,0.9)" }}
            >
              Torneo Interno de Fútbol · Área de Tecnología
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="text-[clamp(72px,15vw,160px)] tracking-tighter leading-none mb-6"
            style={{ fontWeight: 700, color: "#ffffff" }}
          >
            TECHCUP
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-lg md:text-xl mb-10 max-w-xl mx-auto"
            style={{ fontWeight: 500, color: "rgba(255,255,255,0.8)" }}
          >
            Donde la pasión por el fútbol y el espíritu de Sistemas se encuentran en una sola cancha.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white shadow-xl shadow-[#990000]/40 transition-all duration-300"
                style={{ backgroundColor: "#990000", fontWeight: 600, fontSize: "1.05rem" }}
              >
                Comenzar Ahora
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </Link>

            <button
              onClick={() => scrollTo("#que-es")}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300 text-sm"
              style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              Conocer más ↓
            </button>
          </motion.div>
        </div>

        {/* Hero image strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden pointer-events-none"
        >
          <div
            className="w-full h-full bg-cover bg-center opacity-10"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1764438300230-f1eb26b918cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
        </motion.div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          QUÉ ES TECHCUP
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="que-es" className="py-28 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ fontWeight: 700, color: "#C4841D" }}
              >
                ¿Qué es TECHCUP?
              </p>
              <h2
                className="text-4xl md:text-5xl text-black mb-6 leading-tight"
                style={{ fontWeight: 700 }}
              >
                Más que una app.{" "}
                <span style={{ color: "#990000" }}>Una comunidad.</span>
              </h2>
              <div className="space-y-4 text-[#6C757D]" style={{ fontWeight: 500 }}>
                <p>
                  TECHCUP nace como una forma de combinar aquello que nos gusta —la
                  competencia, el deporte, el juego, la emoción— con nuestra formación
                  en el área de Sistemas, creando algo que nos identifique como
                  comunidad.
                </p>
                <p>
                  Es un espacio creado para reunir en un solo lugar una pasión que
                  muchos estudiantes comparten, y convertirla en una experiencia que
                  también conecte con su carrera.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="p-4 rounded-2xl border border-black/6 bg-[#F8F9FA] flex flex-col gap-2"
                    >
                      <Icon className="w-5 h-5" style={{ color: "#990000" }} />
                      <p className="text-sm" style={{ fontWeight: 700 }}>
                        {f.title}
                      </p>
                      <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
                        {f.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-black/10">
                <img
                  src="https://images.unsplash.com/photo-1573639615462-3a16eabd9390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                  alt="Estudiantes jugando fútbol"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {/* Floating badge */}
                <div
                  className="absolute bottom-5 left-5 px-4 py-2 rounded-xl text-white text-xs backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(153,0,0,0.85)", fontWeight: 700 }}
                >
                  🏆 Torneo Universitario de Fútbol
                </div>
              </div>
              {/* Decorative dot */}
              <div
                className="absolute -top-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-40"
                style={{ backgroundColor: "#C4841D" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          EL TORNEO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="el-torneo" className="py-28 bg-[#F8F9FA] scroll-mt-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ fontWeight: 700, color: "#990000" }}
            >
              El Torneo
            </p>
            <h2
              className="text-4xl md:text-5xl text-black mb-5"
              style={{ fontWeight: 700 }}
            >
              Fútbol que une a{" "}
              <span style={{ color: "#990000" }}>Sistemas</span>
            </h2>
            <p
              className="text-[#6C757D] max-w-2xl mx-auto text-lg"
              style={{ fontWeight: 500 }}
            >
              No se trata únicamente de competir, sino de compartir, disfrutar y
              crear vínculos fuera del entorno académico tradicional. TECHCUP
              centraliza toda la información: partidos, calendario, puntuaciones y
              detalles importantes.
            </p>
          </motion.div>

          {/* Why it matters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {reasons.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.55 }}
                  whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.09)" }}
                  className="bg-white rounded-2xl p-6 border border-black/5 flex flex-col gap-4 transition-all duration-300"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#99000010" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#990000" }} />
                  </div>
                  <div>
                    <h3 className="text-sm mb-1.5" style={{ fontWeight: 700 }}>
                      {r.title}
                    </h3>
                    <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
                      {r.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Image banner */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.65 }}
            className="mt-12 relative rounded-3xl overflow-hidden h-56 md:h-72 shadow-xl shadow-black/8"
          >
            <img
              src="https://images.unsplash.com/photo-1764438300230-f1eb26b918cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
              alt="Partido de fútbol"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#990000]/80 via-[#990000]/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <p
                className="text-white text-xs uppercase tracking-widest mb-2"
                style={{ fontWeight: 700 }}
              >
                TECHCUP 2026
              </p>
              <h3
                className="text-white text-3xl md:text-4xl"
                style={{ fontWeight: 700 }}
              >
                La cancha es nuestra.
              </h3>
              <p className="text-white/70 text-sm mt-2" style={{ fontWeight: 500 }}>
                Torneo Interno de Fútbol · Área de Tecnología
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          EXPERIENCIA
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="experiencia" className="py-28 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ fontWeight: 700, color: "#C4841D" }}
            >
              La Experiencia TECHCUP
            </p>
            <h2
              className="text-4xl md:text-5xl text-black mb-5"
              style={{ fontWeight: 700 }}
            >
              Pasión y profesión{" "}
              <span style={{ color: "#C4841D" }}>en equilibrio</span>
            </h2>
            <p
              className="text-[#6C757D] max-w-2xl mx-auto text-lg"
              style={{ fontWeight: 500 }}
            >
              TECHCUP es el punto de encuentro donde los estudiantes pueden competir,
              divertirse y sentirse parte de algo más grande que una clase o un
              semestre. Es comunidad, es emoción y es una forma de hacer que nuestra
              carrera también se viva fuera del aula.
            </p>
          </motion.div>

          {/* Quote highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl p-10 md:p-14 mb-12 overflow-hidden text-center"
            style={{ backgroundColor: "#990000" }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: "#C4841D", transform: "translate(30%, -30%)" }}
            />
            <Star className="w-8 h-8 text-white/30 mx-auto mb-5" />
            <p
              className="text-white text-2xl md:text-3xl max-w-2xl mx-auto"
              style={{ fontWeight: 700 }}
            >
              "No todo es estudio y proyectos. TECHCUP genera un espacio de ocio,
              diversión y desconexión dentro del mismo entorno universitario."
            </p>
            <p
              className="text-white/50 text-sm mt-6"
              style={{ fontWeight: 600 }}
            >
              — Filosofía TECHCUP
            </p>
          </motion.div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.09)" }}
                className="bg-white rounded-2xl p-6 border border-black/5 flex flex-col gap-4 transition-all duration-300"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              >
                {/* Quote */}
                <p className="text-sm text-[#6C757D] flex-1" style={{ fontWeight: 500 }}>
                  "{t.quote}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: t.color, fontWeight: 700 }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 700 }}>
                      {t.name}
                    </p>
                    <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
                      {t.career}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Community image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.65 }}
            className="mt-12 relative rounded-3xl overflow-hidden h-56 md:h-72 shadow-xl shadow-black/8"
          >
            <img
              src="https://images.unsplash.com/photo-1763890763377-abd05301034d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
              alt="Comunidad universitaria"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-white text-xl md:text-2xl" style={{ fontWeight: 700 }}>
                Somos más que código. Somos equipo.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA FINAL
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-4xl md:text-5xl text-black mb-5"
              style={{ fontWeight: 700 }}
            >
              ¿Listo para jugar?
            </h2>
            <p
              className="text-[#6C757D] text-lg mb-10"
              style={{ fontWeight: 500 }}
            >
              Únete a la experiencia TECHCUP y sé parte de la historia de Sistemas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white shadow-xl shadow-[#990000]/25 transition-all duration-300"
                  style={{ backgroundColor: "#990000", fontWeight: 600, fontSize: "1.05rem" }}
                >
                  Ingresar al Torneo
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FOOTER
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="py-8 border-t border-black/5 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xl tracking-tight" style={{ fontWeight: 700, color: "#990000" }}>
            TECHCUP
          </span>
          <p className="text-xs text-[#ADB5BD] text-center" style={{ fontWeight: 500 }}>
            Torneo Interno de Fútbol · Área de Tecnología
          </p>
          <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
            Hecho con â¤ï¸ por estudiantes de Sistemas
          </p>
        </div>
      </footer>
    </div>
  );
}


