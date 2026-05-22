import { http } from "@/core/api/http";

export type PlayerDto = {
    id: number;
    fullName: string;
    email: string;
    identification: string | null;
    birthDate: string | null;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    schoolRelation: string | null;
    academicProgram: string | null;
    semester: number | null;
    status: string | null;
    profileCreatedAt: string | null;
    updatedAt: string | null;
    position: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD" | null;
    dorsalNumber: number | null;
    available: boolean | null;
};

export type PlayerSearchFilters = {
    name?: string;
    position?: string;
    gender?: string;
    semester?: number;
    age?: number;
    identification?: string;
    available?: boolean;
    status?: string;
};

function buildParams(filters: PlayerSearchFilters): string {
    const params = new URLSearchParams();
    if (filters.name?.trim())            params.set("name",           filters.name.trim());
    if (filters.position?.trim())        params.set("position",       filters.position.trim());
    if (filters.gender?.trim())          params.set("gender",         filters.gender.trim());
    if (filters.semester != null)        params.set("semester",       String(filters.semester));
    if (filters.age != null)             params.set("age",            String(filters.age));
    if (filters.identification?.trim())  params.set("identification", filters.identification.trim());
    if (filters.available != null)       params.set("available",      String(filters.available));
    if (filters.status?.trim())          params.set("status",         filters.status.trim());
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
