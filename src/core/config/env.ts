const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

if (!apiBaseUrl) {
    throw new Error("Falta configurar VITE_API_URL para conectar con el backend.");
}

export const env = {
    apiBaseUrl,
};
