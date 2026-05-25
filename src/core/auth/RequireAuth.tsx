import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/core/auth/AuthContext";

export function RequireAuth() {
    const { isAuthenticated, isBootstrapping } = useAuth();

    if (isBootstrapping) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Cargando sesión...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
