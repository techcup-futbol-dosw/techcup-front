/**
 * @file src/modules/tournament/pages/PaymentReport.tsx
 */
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Users,
  X,
  Image as ImageIcon,
  Eye,
  Ban,
} from "lucide-react";
import { readUICache, writeUICache } from "@/core/utils/uiCache";

const P = {
  primary:     "#B81C1C",
  secondary:   "#C4841D",
  success:     "#17C964",
  info:        "#0066FE",
  default:     "#6E6E73",
  textPrimary: "#1C1C1E",
  bg:          "#F2F2F7",
  purple:      "#8B5CF6",
  orange:      "#F97316",
  warning:     "#F5A524",
};

// ── Tipos ─────────────────────────────────────────
type InscripcionEstado = "En Revisión" | "Aprobado" | "Rechazado" | "Cancelado";

interface TeamInscripcion {
  id: number;
  equipo: string;
  capitan: string;
  monto: number;
  estado: InscripcionEstado;
  fecha: string;
  comprobanteUrl: string | null;
  comprobanteTipo: "imagen" | "pdf" | null;
}

// ── Config de estados ─────────────────────────────
const estadoConfig: Record<InscripcionEstado, {
  bg: string; text: string; border: string;
  icon: React.ReactNode; label: string;
}> = {
  "En Revisión": {
    bg: `${P.warning}15`, text: P.warning, border: `${P.warning}30`,
    icon: <Clock style={{ width: 13, height: 13 }} />, label: "En Revisión",
  },
  Aprobado: {
    bg: `${P.success}15`, text: P.success, border: `${P.success}30`,
    icon: <CheckCircle2 style={{ width: 13, height: 13 }} />, label: "Aprobado",
  },
  Rechazado: {
    bg: `${P.primary}15`, text: P.primary, border: `${P.primary}30`,
    icon: <XCircle style={{ width: 13, height: 13 }} />, label: "Rechazado",
  },
  Cancelado: {
    bg: "rgba(110,110,115,0.12)", text: P.default, border: "rgba(110,110,115,0.28)",
    icon: <Ban style={{ width: 13, height: 13 }} />, label: "Cancelado",
  },
};

// ── Badge ─────────────────────────────────────────
function EstadoBadge({ estado }: { estado: InscripcionEstado }) {
  const cfg = estadoConfig[estado];
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span style={{ color: cfg.text }}>{cfg.icon}</span>
      <span style={{ fontSize: "0.74rem", fontWeight: 700, color: cfg.text }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ── PaymentReport ─────────────────────────────────
export function PaymentReport() {
  const navigate = useNavigate();

  const [inscripciones, setInscripciones] = useState<TeamInscripcion[]>(() =>
    readUICache<TeamInscripcion[]>("techcup.ui.paymentReport.inscripciones", [])
  );
  const [selectedTeam, setSelectedTeam] = useState<TeamInscripcion | null>(null);
  const [searchTerm, setSearchTerm] = useState(() =>
    readUICache<string>("techcup.ui.paymentReport.search", "")
  );
  const [filterStatus, setFilterStatus] = useState<"all" | InscripcionEstado>(() =>
    readUICache<"all" | InscripcionEstado>("techcup.ui.paymentReport.filterStatus", "all")
  );

  useEffect(() => { writeUICache("techcup.ui.paymentReport.inscripciones", inscripciones); }, [inscripciones]);
  useEffect(() => { writeUICache("techcup.ui.paymentReport.search", searchTerm); }, [searchTerm]);
  useEffect(() => { writeUICache("techcup.ui.paymentReport.filterStatus", filterStatus); }, [filterStatus]);


  const filtered = inscripciones.filter((i) => {
    const matchQ  = i.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    i.capitan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFs = filterStatus === "all" || i.estado === filterStatus;
    return matchQ && matchFs;
  });

  // Stats
  const totalInscripciones = inscripciones.length;
  const aprobados          = inscripciones.filter(i => i.estado === "Aprobado").length;
  const enRevision         = inscripciones.filter(i => i.estado === "En Revisión").length;
  const totalRecaudado     = inscripciones
    .filter(i => i.estado === "Aprobado")
    .reduce((s, i) => s + i.monto, 0);

  // Aprobar / Rechazar inscripción
  const handleReview = (id: number, decision: "Aprobado" | "Rechazado") => {
    setInscripciones(prev => prev.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        estado: decision,
        fecha: decision === "Aprobado" ? new Date().toISOString().split("T")[0] : i.fecha,
      };
    }));
    // Actualiza modal si está abierto para el mismo equipo
    setSelectedTeam(prev =>
      prev?.id === id ? { ...prev, estado: decision } : prev
    );
  };

  // CSV download
  const handleDownload = () => {
    const headers = ["Equipo", "Capitán", "Monto", "Estado Inscripción", "Fecha"];
    const rows = filtered.map(i => [
      i.equipo, i.capitan,
      `$${i.monto.toLocaleString("es-CO")}`,
      i.estado, i.fecha,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `reporte-pagos-techcup-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen pb-28 lg:pb-8" style={{ backgroundColor: P.bg }}>

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-40 border-b px-6"
        style={{
          background: "rgba(242,242,247,0.85)",
          borderColor: "rgba(0,0,0,0.06)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center h-[60px]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-black/5">
              <ChevronLeft style={{ width: 20, height: 20, color: P.default }} />
            </div>
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: P.default }}>Volver</span>
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-6 sm:px-10 pt-8 pb-16">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: `${P.purple}15`, border: `1px solid ${P.purple}30` }}
          >
            <CreditCard style={{ width: 14, height: 14, color: P.purple }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: P.purple, textTransform: "uppercase" }}>
              Gestión de pagos
            </span>
          </div>
          <h1 className="text-3xl mb-2" style={{ fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.02em" }}>
            Información de Pagos
          </h1>
          <p style={{ color: P.default, fontWeight: 500, fontSize: "0.95rem" }}>
            Revisa y gestiona los comprobantes de inscripción de equipos al torneo
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { icon: Users,        color: P.info,    value: totalInscripciones,                       label: "Total Inscripciones" },
            { icon: CheckCircle2, color: P.success, value: aprobados,                                label: "Aprobados" },
            { icon: Clock,        color: P.warning, value: enRevision,                               label: "En Revisión" },
            { icon: CreditCard,   color: P.purple,  value: `$${(totalRecaudado/1000).toFixed(0)}K`, label: "Total Recaudado" },
          ].map(({ icon: Icon, color, value, label }) => (
            <div key={label} className="bg-white rounded-[20px] p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${color}15` }}>
                <Icon style={{ width: 20, height: 20, color }} />
              </div>
              <p className="text-2xl mb-1" style={{ fontWeight: 800, color: P.textPrimary }}>{value}</p>
              <p className="text-xs" style={{ color: P.default, fontWeight: 600 }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-[20px] p-5 mb-6"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ width: 18, height: 18, color: P.default }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar equipo o capitán..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-purple-500 transition-colors"
                style={{ fontSize: "0.9rem", fontWeight: 500 }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter style={{ width: 18, height: 18, color: P.default }} />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as "all" | InscripcionEstado)}
                className="px-4 py-3 rounded-xl border border-black/10 focus:outline-none transition-colors"
                style={{ fontSize: "0.9rem", fontWeight: 600 }}
              >
                <option value="all">Todos</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Aprobado">Aprobados</option>
                <option value="Rechazado">Rechazados</option>
                <option value="Cancelado">Cancelados</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="px-5 py-3 rounded-xl text-white flex items-center gap-2"
              style={{ backgroundColor: P.success, fontWeight: 700, fontSize: "0.9rem" }}
            >
              <Download style={{ width: 18, height: 18 }} />
              <span className="hidden sm:inline">Descargar CSV</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tabla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-[20px] overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  {["Equipo", "Capitán", "Monto", "Estado Inscripción", "Fecha", "Comprobante", "Acciones"].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs"
                      style={{ fontWeight: 700, color: P.default, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((i, idx) => (
                  <motion.tr
                    key={i.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.02 }}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: P.textPrimary }}>{i.equipo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ fontWeight: 500, fontSize: "0.85rem", color: P.default }}>{i.capitan}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: P.textPrimary }}>
                        ${i.monto.toLocaleString("es-CO")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <EstadoBadge estado={i.estado} />
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ fontWeight: 500, fontSize: "0.85rem", color: P.default }}>{i.fecha}</p>
                    </td>
                    <td className="px-6 py-4">
                      {i.comprobanteUrl ? (
                        <button
                          onClick={() => setSelectedTeam(i)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors"
                          style={{ backgroundColor: `${P.info}12`, color: P.info, fontWeight: 700 }}
                        >
                          <Eye style={{ width: 14, height: 14 }} />
                          Ver comprobante
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: P.default, fontWeight: 600 }}>Sin archivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {i.estado === "En Revisión" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReview(i.id, "Aprobado")}
                            className="px-2.5 py-1 rounded-lg text-xs"
                            style={{ backgroundColor: `${P.success}18`, color: P.success, fontWeight: 700 }}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReview(i.id, "Rechazado")}
                            className="px-2.5 py-1 rounded-lg text-xs"
                            style={{ backgroundColor: `${P.primary}18`, color: P.primary, fontWeight: 700 }}
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: P.default, fontWeight: 600 }}>—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <CreditCard className="w-10 h-10 mx-auto mb-3" style={{ color: P.default, opacity: 0.35 }} />
              <p style={{ color: P.textPrimary, fontWeight: 700 }}>Sin inscripciones registradas</p>
              <p className="mt-1" style={{ color: P.default, fontWeight: 500, fontSize: "0.82rem" }}>
                Los comprobantes aparecerán aquí cuando los capitanes realicen la inscripción.
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* ── Modal comprobante ── */}
      {selectedTeam && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm"
            onClick={() => setSelectedTeam(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden pointer-events-auto"
              style={{ boxShadow: "0 24px 72px rgba(0,0,0,0.24)" }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: P.textPrimary }}>
                    Comprobante de {selectedTeam.equipo}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p style={{ fontSize: "0.76rem", fontWeight: 500, color: P.default }}>
                      Capitán: {selectedTeam.capitan}
                    </p>
                    <EstadoBadge estado={selectedTeam.estado} />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#F3F4F6" }}
                >
                  <X style={{ width: 18, height: 18, color: P.default }} />
                </button>
              </div>

              {/* Modal preview */}
              <div className="p-4 sm:p-5">
                {!selectedTeam.comprobanteUrl ? (
                  <div className="h-[280px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2"
                    style={{ borderColor: "rgba(0,0,0,0.14)", background: "#F9FAFB" }}>
                    <ImageIcon style={{ width: 26, height: 26, color: P.default }} />
                    <p style={{ fontSize: "0.9rem", color: P.textPrimary, fontWeight: 600 }}>Sin comprobante subido</p>
                    <p style={{ fontSize: "0.78rem", color: P.default, fontWeight: 500 }}>
                      El capitán aún no ha cargado el archivo.
                    </p>
                  </div>
                ) : selectedTeam.comprobanteTipo === "pdf" ? (
                  <iframe
                    title={`Comprobante ${selectedTeam.equipo}`}
                    src={selectedTeam.comprobanteUrl}
                    className="w-full h-[60vh] rounded-xl border"
                    style={{ borderColor: "rgba(0,0,0,0.1)" }}
                  />
                ) : (
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
                    <img
                      src={selectedTeam.comprobanteUrl}
                      alt={`Comprobante de ${selectedTeam.equipo}`}
                      className="w-full max-h-[60vh] object-contain"
                      style={{ background: "#F9FAFB" }}
                    />
                  </div>
                )}
              </div>

              {/* Acciones dentro del modal — solo si "En Revisión" */}
              {selectedTeam.estado === "En Revisión" && (
                <div className="flex gap-3 px-5 pb-5">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleReview(selectedTeam.id, "Rechazado")}
                    className="flex-1 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: `${P.primary}10`, color: P.primary, fontWeight: 700, border: "none" }}
                  >
                    ✕ Rechazar inscripción
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleReview(selectedTeam.id, "Aprobado")}
                    className="flex-1 py-3 rounded-xl text-white text-sm"
                    style={{ backgroundColor: P.success, fontWeight: 700, border: "none" }}
                  >
                    ✓ Aprobar inscripción
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}