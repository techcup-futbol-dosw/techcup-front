import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/modules/auth/services/authService";
import { tokenStorage } from "@/core/auth/tokenStorage";

type AuthSession = {
    isAuthenticated: boolean;
    accountId: number | null;
    roles: string[];
    permissions: string[];
    tokenType: string | null;
};

type AuthContextValue = AuthSession & {
    isBootstrapping: boolean;
    login: (email: string, password: string) => Promise<AuthSession>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<AuthSession>;
};

const defaultSession: AuthSession = {
    isAuthenticated: false,
    accountId: null,
    roles: [],
    permissions: [],
    tokenType: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapValidationToSession(validation: {
    valid: boolean;
    accountId: number | null;
    roles: string[];
    permissions: string[];
    tokenType: string | null;
}): AuthSession {
    if (!validation.valid) {
        return defaultSession;
    }

    return {
        isAuthenticated: true,
        accountId: validation.accountId,
        roles: validation.roles ?? [],
        permissions: validation.permissions ?? [],
        tokenType: validation.tokenType ?? null,
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<AuthSession>(defaultSession);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    const refreshSession = async (): Promise<AuthSession> => {
        try {
            const validation = await authService.validateCurrentToken();
            const nextSession = mapValidationToSession(validation);

            if (!validation.valid) {
                tokenStorage.clear();
            }

            setSession(nextSession);
            return nextSession;
        } catch {
            tokenStorage.clear();
            setSession(defaultSession);
            return defaultSession;
        }
    };

    const login = async (email: string, password: string): Promise<AuthSession> => {
        await authService.login({ email, password });
        return refreshSession();
    };

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } finally {
            tokenStorage.clear();
            setSession(defaultSession);
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            if (!tokenStorage.hasSession()) {
                setIsBootstrapping(false);
                return;
            }

            await refreshSession();
            setIsBootstrapping(false);
        };

        bootstrap();
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            ...session,
            isBootstrapping,
            login,
            logout,
            refreshSession,
        }),
        [session, isBootstrapping]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }

    return context;
}