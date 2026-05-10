const ACCESS_TOKEN_KEY = "techcup_access_token";
const REFRESH_TOKEN_KEY = "techcup_refresh_token";

export type StoredTokens = {
    accessToken: string;
    refreshToken: string;
};

export const tokenStorage = {
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setTokens(tokens: StoredTokens): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    },

    clear(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    hasSession(): boolean {
        return Boolean(this.getAccessToken());
    },
};