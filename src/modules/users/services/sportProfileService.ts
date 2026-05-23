import { http } from "@/core/api/http";
import { tokenStorage } from "@/core/auth/tokenStorage";
import { env } from "@/core/config/env";

export type SportProfileResponse = {
    id: number;
    userId: number;
    position: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD" | null;
    dorsalNumber: number | null;
    photoId: string | null;
    available: boolean;
    createdAt: string;
    updatedAt: string;
};

export type SportProfileRequest = {
    position: string;
    dorsalNumber: number;
    available: boolean;
};

export const sportProfileService = {
    getByUserId(userId: number) {
        return http.get<SportProfileResponse>(`/api/sport-profiles/user/${userId}`);
    },

    create(userId: number, data: SportProfileRequest, photo?: File | null) {
        const form = new FormData();
        form.append("profile", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (photo) form.append("photo", photo);
        return http.post<SportProfileResponse>(`/api/sport-profiles/user/${userId}`, form);
    },

    update(profileId: number, data: SportProfileRequest, photo?: File | null) {
        const form = new FormData();
        form.append("profile", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (photo) form.append("photo", photo);
        return http.put<SportProfileResponse>(`/api/sport-profiles/${profileId}`, form);
    },

    updateAvailability(profileId: number, available: boolean) {
        return http.patch<void>(`/api/sport-profiles/${profileId}/availability?available=${available}`);
    },

    async getPhotoUrl(photoId: string): Promise<string | null> {
        const token = tokenStorage.getAccessToken();
        const res = await fetch(`${env.apiBaseUrl}/api/sport-profiles/photos/${photoId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return null;
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    },
};
