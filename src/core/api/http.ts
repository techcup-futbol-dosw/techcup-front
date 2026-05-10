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

async function request<T>(path: string, config: HttpRequestConfig = {}): Promise<T> {
    const { body, headers = {}, auth = true, ...rest } = config;

    const finalHeaders: Record<string, string> = {
        ...headers,
    };

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
