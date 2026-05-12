import { env } from "@/core/config/env";
import { tokenStorage } from "@/core/auth/tokenStorage";

export class ApiError extends Error {
    status: number;
    payload?: unknown;

    constructor(message: string, status: number, payload?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
    }
}

type HttpRequestConfig = Omit<RequestInit, "body" | "headers"> & {
    body?: unknown;
    headers?: Record<string, string>;
    auth?: boolean;
};

// Una sola promesa de refresh compartida entre todas las requests concurrentes
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
            tokenStorage.clear();
            return false;
        }

        const data = await res.json() as { accessToken: string; refreshToken: string };
        tokenStorage.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        return true;
    } catch {
        tokenStorage.clear();
        return false;
    }
}

async function request<T>(path: string, config: HttpRequestConfig = {}, _isRetry = false): Promise<T> {
    const { body, headers = {}, auth = true, ...rest } = config;

    const finalHeaders: Record<string, string> = { ...headers };

    const isFormData = body instanceof FormData;

    if (!isFormData && body !== undefined) {
        finalHeaders["Content-Type"] = "application/json";
    }

    if (auth) {
        const accessToken = tokenStorage.getAccessToken();
        if (accessToken) {
            finalHeaders["Authorization"] = `Bearer ${accessToken}`;
        }
    }

    const response = await fetch(`${env.apiBaseUrl}${path}`, {
        ...rest,
        headers: finalHeaders,
        body: isFormData
            ? (body as FormData)
            : body !== undefined
                ? JSON.stringify(body)
                : undefined,
    });

    // Interceptor 401: intenta refrescar el token y reintenta la request una vez
    if (response.status === 401 && auth && !_isRetry) {
        if (!refreshPromise) {
            refreshPromise = attemptTokenRefresh().finally(() => { refreshPromise = null; });
        }

        const refreshed = await refreshPromise;

        if (refreshed) {
            return request<T>(path, config, true);
        }

        // Refresh falló → sesión expirada
        window.location.href = "/login";
        throw new ApiError("Sesión expirada", 401);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    let payload: unknown = undefined;

    if (isJson) {
        payload = await response.json();
    } else if (response.status !== 204) {
        payload = await response.text();
    }

    if (!response.ok) {
        const message =
            typeof payload === "object" &&
            payload !== null &&
            "message" in payload &&
            typeof (payload as { message?: unknown }).message === "string"
                ? (payload as { message: string }).message
                : `Error HTTP ${response.status}`;

        throw new ApiError(message, response.status, payload);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return payload as T;
}

export const http = {
    get<T>(path: string, config?: Omit<HttpRequestConfig, "body" | "method">) {
        return request<T>(path, { ...config, method: "GET" });
    },

    post<T>(path: string, body?: unknown, config?: Omit<HttpRequestConfig, "body" | "method">) {
        return request<T>(path, { ...config, method: "POST", body });
    },

    put<T>(path: string, body?: unknown, config?: Omit<HttpRequestConfig, "body" | "method">) {
        return request<T>(path, { ...config, method: "PUT", body });
    },

    patch<T>(path: string, body?: unknown, config?: Omit<HttpRequestConfig, "body" | "method">) {
        return request<T>(path, { ...config, method: "PATCH", body });
    },

    delete<T>(path: string, config?: Omit<HttpRequestConfig, "body" | "method">) {
        return request<T>(path, { ...config, method: "DELETE" });
    },
};
