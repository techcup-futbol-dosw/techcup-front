import { http } from "@/core/api/http";

// Matches UserResponse from the backend (/api/users/search)
export type PlayerDto = {
    id: number;
    fullName: string;
    email: string;
    identification: string;
    birthDate: string; // ISO date string, e.g. "2001-05-15"
    gender: "MALE" | "FEMALE" | "OTHER";
    semester: number;
    status: string;
    schoolRelation: string;
    academicProgram: string;
    // Sport profile fields — present only when the player has a sport profile
    position?: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD";
    dorsalNumber?: number;
    available?: boolean;
};

export type PlayerSearchFilters = {
    name?: string;
    identification?: string;
    position?: string;
    gender?: string;
    semester?: string;
    age?: number;
    available?: boolean;
};

function buildParams(filters: PlayerSearchFilters): string {
    const params = new URLSearchParams();
    if (filters.name?.trim())           params.set("name",           filters.name.trim());
    if (filters.identification?.trim()) params.set("identification", filters.identification.trim());
    if (filters.position?.trim())       params.set("position",       filters.position.trim());
    if (filters.gender?.trim())         params.set("gender",         filters.gender.trim());
    if (filters.semester?.trim())       params.set("semester",       filters.semester.trim());
    if (filters.age != null)            params.set("age",            String(filters.age));
    if (filters.available)              params.set("available",      "true");
    return params.toString();
}

export const playerService = {
    search(filters: PlayerSearchFilters = {}) {
        const qs = buildParams(filters);
        return http.get<PlayerDto[]>(`/api/users/search${qs ? `?${qs}` : ""}`);
    },

    invite(playerId: number, teamId: number) {
        return http.post<void>(`/api/invitations/user/${playerId}/team/${teamId}`);
    },
};