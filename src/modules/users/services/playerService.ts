import { http } from "@/core/api/http";

export type PlayerDto = {
    id: number;
    nombre: string;
    identificacion: string;
    edad: number;
    genero: "masculino" | "femenino" | "otro";
    posicion: string;
    semestre: string;
    dorsal: number;
    disponibilidad: boolean;
    email: string;
};

export type PlayerSearchFilters = {
    query?: string;
    posicion?: string;
    genero?: string;
    semestre?: string;
    edadMin?: number;
    edadMax?: number;
    soloDisponibles?: boolean;
    page?: number;
    size?: number;
};

function buildParams(filters: PlayerSearchFilters): string {
    const params = new URLSearchParams();
    if (filters.query?.trim())        params.set("query",          filters.query.trim());
    if (filters.posicion?.trim())     params.set("posicion",       filters.posicion.trim());
    if (filters.genero?.trim())       params.set("genero",         filters.genero.trim());
    if (filters.semestre?.trim())     params.set("semestre",       filters.semestre.trim());
    if (filters.edadMin != null)      params.set("edadMin",        String(filters.edadMin));
    if (filters.edadMax != null)      params.set("edadMax",        String(filters.edadMax));
    if (filters.soloDisponibles)      params.set("disponible",     "true");
    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 20));
    return params.toString();
}

export const playerService = {
    search(filters: PlayerSearchFilters = {}) {
        return http.get<PlayerDto[]>(`/players?${buildParams(filters)}`);
    },

    invite(playerId: number | string) {
        return http.post<void>(`/players/${playerId}/invite`);
    },
};
