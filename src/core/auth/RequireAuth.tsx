import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/core/auth/AuthContext";

export function RequireAuth() {
    const { isBootstrapping, isAuthenticated } = useAuth();

    if (isBootstrapping) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
