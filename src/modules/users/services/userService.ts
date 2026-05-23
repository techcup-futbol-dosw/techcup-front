import { http } from "@/core/api/http";

export type UserProfileDto = {
    id: number;
    name: string;
    lastName: string;
    email: string;
    birthDate: string;
    relation: string;
    semester: number;
    program: string;
    gender: string;
    identificationType: string;
    identification: string;
    bio?: string;
    status: string;
    roles: string[];
};

/** Respuesta real del users microservice (GET /api/users/{id}) */
export type UserResponseDto = {
    id: number;
    fullName: string;
    email: string;
    identification?: string;
    birthDate?: string;
    gender?: string;
    schoolRelation?: string;
    academicProgram?: string;
    semester?: number;
    status?: string;
    profileCreatedAt?: string;
    updatedAt?: string;
};

export type UpdateProfileRequest = {
    name?: string;
    lastName?: string;
    bio?: string;
};

export type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string;
};

export type ActivityItemDto = {
    id: number;
    action: string;
    category: "tournament" | "security" | "profile" | "match" | "other";
    createdAt: string;
};

export const userService = {
    getMe() {
        return http.get<UserProfileDto>("/accounts/me");
    },

    /** Obtiene el perfil de un usuario del microservicio de users */
    getUserById(id: number) {
        return http.get<UserResponseDto>(`/api/users/${id}`);
    },

    updateMe(payload: UpdateProfileRequest) {
        return http.patch<UserProfileDto>("/accounts/me", payload);
    },

    changePassword(payload: ChangePasswordRequest) {
        return http.patch<void>("/accounts/me/password", payload);
    },

    getActivity() {
        return http.get<ActivityItemDto[]>("/accounts/me/activity");
    },
};
