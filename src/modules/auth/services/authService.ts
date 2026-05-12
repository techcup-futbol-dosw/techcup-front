import { http } from "@/core/api/http";
import { tokenStorage } from "@/core/auth/tokenStorage";

export type AuthRequestDto = {
    email: string;
    password: string;
};

export type AuthResponseDto = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
};

export type RefreshTokenRequestDto = {
    refreshToken: string;
};

export type LogoutRequestDto = {
    refreshToken: string;
};

export type TokenValidationRequestDto = {
    token: string;
};

export type TokenValidationResponseDto = {
    valid: boolean;
    accountId: number | null;
    roles: string[];
    permissions: string[];
    tokenType: string | null;
};

export type RegisterAccountRequestDto = {
    name: string;
    lastName: string;
    birthDate: string;
    relation: string;
    semester: number | null;
    program: string;
    email: string;
    password: string;
    gender: string;
    identificationType: string;
    identification: string;
};

export type AccountResponseDto = {
    id: number;
    email: string;
    status: string;
    createdAt: string;
    roles: string[];
    name: string;
    lastName: string;
    birthDate: string;
    relation: string;
    semester: number;
    program: string;
    gender: string;
    identificationType: string;
    identification: string;
};

export const authService = {
    async login(payload: AuthRequestDto): Promise<AuthResponseDto> {
        const response = await http.post<AuthResponseDto>("/auth/login", payload, { auth: false });
        tokenStorage.setTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });
        return response;
    },

    async register(payload: RegisterAccountRequestDto): Promise<AccountResponseDto> {
        return http.post<AccountResponseDto>("/accounts/register", payload, { auth: false });
    },

    async refreshToken(): Promise<AuthResponseDto> {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
            throw new Error("No hay refresh token disponible");
        }

        const response = await http.post<AuthResponseDto>(
            "/auth/refresh",
            { refreshToken },
            { auth: false }
        );

        tokenStorage.setTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });

        return response;
    },

    async logout(): Promise<void> {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
            tokenStorage.clear();
            return;
        }

        await http.post<void>("/auth/logout", { refreshToken }, { auth: false });
        tokenStorage.clear();
    },

    async validateCurrentToken(): Promise<TokenValidationResponseDto> {
        const accessToken = tokenStorage.getAccessToken();

        if (!accessToken) {
            return {
                valid: false,
                accountId: null,
                roles: [],
                permissions: [],
                tokenType: null,
            };
        }

        return http.post<TokenValidationResponseDto>(
            "/auth/validate",
            { token: accessToken },
            { auth: false }
        );
    },
};
