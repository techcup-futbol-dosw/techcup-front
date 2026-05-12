import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/core/auth/AuthContext";

export function RequireAuth() {
    const { isAuthenticated, isBootstrapping } = useAuth();

    if (isBootstrapping) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F2F2F7" }}>
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin"
                        style={{ borderColor: "#B81C1C", borderTopColor: "transparent" }}
                    />
                    <span style={{ fontSize: "0.82rem", color: "#6E6E73", fontWeight: 600 }}>Verificando sesión…</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
