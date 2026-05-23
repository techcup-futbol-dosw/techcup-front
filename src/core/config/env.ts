const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const competitionsApiUrl = (import.meta.env.VITE_COMPETITIONS_API_URL ?? "").replace(/\/+$/, "");

if (!apiBaseUrl && import.meta.env.PROD) {
    throw new Error("Falta configurar VITE_API_URL para conectar con el backend.");
}

if (!apiBaseUrl && import.meta.env.DEV) {
    console.warn("[techcup] VITE_API_URL no está configurada.");
}

export const env = {
    apiBaseUrl,
    competitionsApiUrl,
};