import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { http } from "@/core/api/http";
import {
    ArrowLeft,
    Bell,
    Check,
    X,
    Users,
    Loader2,
    AlertCircle,
} from "lucide-react";

const P = {
    primary: "#B81C1C",
    secondary: "#C4841D",
    success: "#17C964",
    info: "#0066FE",
    default: "#6E6E73",
    textPrimary: "#1C1C1E",
    bg: "#F2F2F7",
};

type InvitationDto = {
    id: number;
    teamId: number;
    teamName: string;
    captainName?: string;
    sentAt: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
};

const invitationService = {
    getPending() {
        return http.get<InvitationDto[]>("/api/invitations/pending");
    },
    accept(invitationId: number) {
        return http.post<void>(`/api/invitations/${invitationId}/accept`);
    },
    reject(invitationId: number) {
        return http.post<void>(`/api/invitations/${invitationId}/reject`);
    },
};

export default function PendingInvitations() {
    const navigate = useNavigate();
    const { accountId } = useAuth();

    const [invitations, setInvitations] = useState<InvitationDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);

    const showToast = (msg: string, color: string) => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 2800);
    };

    useEffect(() => {
        if (!accountId) return;
        setLoading(true);
        invitationService
            .getPending()
            .then((data) => setInvitations(data))
            .catch(() => setError("No se pudieron cargar las invitaciones. Intenta de nuevo."))
            .finally(() => setLoading(false));
    }, [accountId]);

    const handleAccept = async (inv: InvitationDto) => {
        setProcessing(inv.id);
        try {
            await invitationService.accept(inv.id);
            setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
            showToast(`Te uniste al equipo ${inv.teamName}`, P.success);
        } catch {
            showToast("No se pudo aceptar la invitación. Intenta de nuevo.", P.primary);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (inv: InvitationDto) => {
        setProcessing(inv.id);
        try {
            await invitationService.reject(inv.id);
            setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
            showToast("Invitación rechazada.", P.default);
        } catch {
            showToast("No se pudo rechazar la invitación. Intenta de nuevo.", P.primary);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="min-h-screen pb-16" style={{ backgroundColor: P.bg }}>
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="sticky top-0 z-40 border-b px-6"
                style={{
                    background: "rgba(242,242,247,0.85)",
                    borderColor: "rgba(0,0,0,0.06)",
                    backdropFilter: "saturate(180%) blur(20px)",
                    WebkitBackdropFilter: "saturate(180%) blur(20px)",
                }}
            >
                <div className="max-w-2xl mx-auto flex items-center gap-3 h-[60px]">
                    <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.06)] transition-colors"
                    >
                        <ArrowLeft style={{ width: 18, height: 18, color: P.default }} />
                    </motion.button>
                    <div className="flex items-center gap-2">
                        <Bell style={{ width: 18, height: 18, color: P.primary }} />
                        <span style={{ fontWeight: 700, fontSize: "1rem", color: P.textPrimary }}>
                            Invitaciones pendientes
                        </span>
                        {invitations.length > 0 && (
                            <span
                                className="text-xs px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: P.primary, fontWeight: 700 }}
                            >
                                {invitations.length}
                            </span>
                        )}
                    </div>
                </div>
            </motion.header>

            <main className="max-w-2xl mx-auto px-6 pt-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: P.primary }} />
                        <p className="text-sm" style={{ color: P.default, fontWeight: 500 }}>
                            Cargando invitaciones...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div
                        className="flex items-start gap-3 p-4 rounded-2xl border"
                        style={{ backgroundColor: `${P.primary}08`, borderColor: `${P.primary}25` }}
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: P.primary }} />
                        <p className="text-sm" style={{ color: P.primary, fontWeight: 500 }}>
                            {error}
                        </p>
                    </div>
                )}

                {!loading && !error && invitations.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                            style={{ backgroundColor: `${P.primary}10`, border: `1.5px solid ${P.primary}20` }}
                        >
                            <Users style={{ width: 28, height: 28, color: P.primary, opacity: 0.7 }} />
                        </div>
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: P.textPrimary, marginBottom: "0.35rem" }}>
                            Sin invitaciones pendientes
                        </p>
                        <p style={{ fontSize: "0.82rem", color: P.default, fontWeight: 500, maxWidth: 280, textAlign: "center", lineHeight: 1.55 }}>
                            Cuando un capitán te invite a su equipo, la invitación aparecerá aquí.
                        </p>
                    </motion.div>
                )}

                {!loading && !error && invitations.length > 0 && (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {invitations.map((inv) => (
                                <motion.div
                                    key={inv.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-white rounded-2xl p-5 flex items-center gap-4"
                                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${P.secondary}15` }}
                                    >
                                        <Users style={{ color: P.secondary, width: 22, height: 22 }} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: P.textPrimary }}>
                                            {inv.teamName}
                                        </p>
                                        {inv.captainName && (
                                            <p style={{ fontSize: "0.75rem", color: P.default, fontWeight: 500 }}>
                                                Capitán: {inv.captainName}
                                            </p>
                                        )}
                                        <p style={{ fontSize: "0.72rem", color: P.default, fontWeight: 500, marginTop: 2 }}>
                                            {inv.sentAt}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={processing === inv.id}
                                            onClick={() => handleReject(inv)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors"
                                            style={{
                                                borderColor: `${P.primary}30`,
                                                backgroundColor: `${P.primary}06`,
                                                opacity: processing === inv.id ? 0.5 : 1,
                                            }}
                                        >
                                            <X style={{ width: 16, height: 16, color: P.primary }} />
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={processing === inv.id}
                                            onClick={() => handleAccept(inv)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                                            style={{
                                                backgroundColor: processing === inv.id ? "#E9ECEF" : P.success,
                                                opacity: processing === inv.id ? 0.5 : 1,
                                            }}
                                        >
                                            {processing === inv.id ? (
                                                <Loader2 style={{ width: 15, height: 15, color: P.default }} className="animate-spin" />
                                            ) : (
                                                <Check style={{ width: 16, height: 16, color: "white" }} />
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 48, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 48, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 340, damping: 26 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl"
                        style={{ backgroundColor: toast.color, boxShadow: `0 12px 40px ${toast.color}50` }}
                    >
                        {toast.color === P.success ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <X className="w-5 h-5" />
                        )}
                        <span className="text-sm whitespace-nowrap" style={{ fontWeight: 700 }}>
                            {toast.msg}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
