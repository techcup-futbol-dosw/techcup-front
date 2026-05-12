/**
 * @file src\modules\competition\pages\Schedule.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, CalendarDays, MapPin, Clock } from "lucide-react";
import { readUICache } from "@/core/utils/uiCache";

const P = {
  primary: "#B81C1C",
  secondary: "#C4841D",
  success: "#17C964",
  info: "#0066FE",
  default: "#6E6E73",
  textPrimary: "#1C1C1E",
  bg: "#F2F2F7",
};

const upcomingDates = readUICache<Array<{
  date: string;
  weekday: string;
  events: Array<{ time: string; name: string; venue: string; teams: string }>;
}>>("techcup.ui.schedule", []);

function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", color, textTransform: "uppercase" }}>
        {text}
      </span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
    </div>
  );
}

export function Schedule() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-24 lg:pb-0" style={{ backgroundColor: P.bg }}>

      {/* ── Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b px-6"
        style={{
          background: "rgba(242,242,247,0.85)",
          borderColor: "rgba(0,0,0,0.06)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3 h-[60px]">
          <motion.div
            whileHover={{ scale: 1.05, x: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <ArrowLeft style={{ width: 16, height: 16, color: P.default }} />
          </motion.div>
          <span className="flex-1" style={{ fontWeight: 800, color: P.primary, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
            TECHCUP
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${P.secondary}12` }}>
            <CalendarDays style={{ width: 14, height: 14, color: P.secondary }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: P.secondary }}>Calendario</span>
          </div>
        </div>
      </motion.header>

      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-10 pb-16">

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.45, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.2rem)", fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.03em", lineHeight: 1.12 }}>
            Calendario de Fechas
          </h1>
          <p className="mt-2" style={{ fontSize: "0.88rem", fontWeight: 500, color: P.default }}>
            Próximos eventos y competencias del torneo
          </p>
        </motion.div>

        {/* ── Section label ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
        >
          <SectionLabel text="Próximas Fechas" color={P.secondary} />
        </motion.div>

        {/* ── Timeline ── */}
        <div className="space-y-6">
          {upcomingDates.length === 0 ? (
            <div className="bg-white rounded-[20px] p-8 text-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <CalendarDays className="w-10 h-10 mx-auto mb-3" style={{ color: P.default, opacity: 0.35 }} />
              <p style={{ fontWeight: 700, color: P.textPrimary }}>No hay partidos programados</p>
              <p className="mt-1" style={{ fontSize: "0.82rem", color: P.default, fontWeight: 500 }}>
                Cuando el backend entregue fechas, el calendario aparecerá aquí.
              </p>
            </div>
          ) : (
            upcomingDates.map((day, dayIndex) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + dayIndex * 0.09, duration: 0.4, ease: "easeOut" }}
                className="flex gap-3 sm:gap-5"
              >
                {/* Date column */}
                <div className="flex-shrink-0 w-14 sm:w-16 pt-1">
                  <div
                    className="flex flex-col items-center justify-center rounded-2xl py-2 sm:py-2.5 px-1"
                    style={{ backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                  >
                    <p style={{ fontSize: "1.2rem", fontWeight: 800, color: P.secondary, lineHeight: 1, letterSpacing: "-0.02em" }} className="sm:text-[1.4rem]">
                      {day.date.split(" ")[0]}
                    </p>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, color: P.secondary, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }} className="sm:text-[0.65rem]">
                      {day.date.split(" ")[1]}
                    </p>
                    <p style={{ fontSize: "0.58rem", color: P.default, fontWeight: 500, marginTop: 1 }} className="sm:text-[0.62rem] hidden sm:block">
                      {day.weekday}
                    </p>
                  </div>
                </div>

                {/* Timeline connector */}
                <div className="flex flex-col items-center pt-4">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: P.secondary }} />
                  {dayIndex < upcomingDates.length - 1 && (
                    <div className="w-px flex-1 mt-2" style={{ background: `linear-gradient(to bottom, ${P.secondary}30, transparent)` }} />
                  )}
                </div>

                {/* Events */}
                <div className="flex-1 pb-4 space-y-3 min-w-0">
                  {day.events.map((event, eventIndex) => (
                    <motion.div
                      key={eventIndex}
                      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.09)" }}
                      className="flex items-center bg-white rounded-[20px] px-3 sm:px-5 py-3 sm:py-4 transition-all duration-300"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    >
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 pr-2">
                        {/* Time badge */}
                        <div
                          className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl"
                          style={{ backgroundColor: `${P.secondary}10` }}
                        >
                          <Clock style={{ width: 10, height: 10, color: P.secondary }} className="sm:w-[11px] sm:h-[11px]" />
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: P.secondary }} className="sm:text-[0.78rem]">{event.time}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: P.textPrimary }} className="truncate sm:text-[0.88rem]">
                            {event.name}
                          </p>
                          <p style={{ fontSize: "0.7rem", color: P.info, fontWeight: 600 }} className="truncate sm:text-[0.75rem]">
                            {event.teams}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin style={{ width: 9, height: 9, color: P.default }} className="sm:w-[10px] sm:h-[10px] flex-shrink-0" />
                            <p style={{ fontSize: "0.7rem", color: P.default, fontWeight: 500 }} className="truncate sm:text-[0.75rem]">{event.venue}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}



