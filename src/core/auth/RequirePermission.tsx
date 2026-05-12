import { Navigate } from "react-router";
import { useAuth } from "@/core/auth/AuthContext";

type RequirePermissionProps = {
    permission: string;
    children: React.ReactNode;
};

export function RequirePermission({ permission, children }: RequirePermissionProps) {
    const { isAuthenticated, isBootstrapping, permissions } = useAuth();

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

    if (!permissions.includes(permission)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}