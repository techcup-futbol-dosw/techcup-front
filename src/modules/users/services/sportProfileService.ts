import { http } from "@/core/api/http";

// Matches SportProfileResponse from the backend
export type SportProfileDto = {
    id: number;
    userId: number;
    position: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD";
    dorsalNumber: number | null;
    photoId: string | null;
    available: boolean;
    createdAt: string;
    updatedAt: string;
};

export type SportProfilePayload = {
    position: string;
    dorsalNumber: number;
    available: boolean;
};

// Maps Spanish form values → backend enum values
export const POSITION_MAP: Record<string, string> = {
    portero:   "GOALKEEPER",
    defensa:   "DEFENDER",
    volante:   "MIDFIELDER",
    delantero: "FORWARD",
};

// Maps backend enum values → Spanish form values
export const POSITION_MAP_REVERSE: Record<string, string> = {
    GOALKEEPER: "portero",
    DEFENDER:   "defensa",
    MIDFIELDER: "volante",
    FORWARD:    "delantero",
};

export const sportProfileService = {
    /** Load the sport profile for a given user. Returns null if not found. */
    getByUserId(userId: number): Promise<SportProfileDto | null> {
        return http.get<SportProfileDto>(`/api/sport-profiles/user/${userId}`).catch(() => null);
    },

    /** Create a new sport profile. Photo is optional. */
    create(userId: number, payload: SportProfilePayload, photo?: File): Promise<SportProfileDto> {
        const form = new FormData();
        form.append("profile", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        if (photo) form.append("photo", photo);
        return http.post<SportProfileDto>(`/api/sport-profiles/user/${userId}`, form);
    },

    /** Update an existing sport profile. Photo is optional. */
    update(profileId: number, payload: SportProfilePayload, photo?: File): Promise<SportProfileDto> {
        const form = new FormData();
        form.append("profile", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        if (photo) form.append("photo", photo);
        return http.put<SportProfileDto>(`/api/sport-profiles/${profileId}`, form);
    },
};
