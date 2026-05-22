import { http } from "@/core/api/http";

// Respuesta del servicio de identidad (/accounts/me)
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

// Respuesta de techchup-users (/api/users/{id})
export type UsersProfileDto = {
    id: number;
    fullName: string;
    email: string;
    identification: string;
    birthDate: string;
    gender: string;
    schoolRelation: string;
    academicProgram: string;
    semester: number | null;
    status: string;
    profileCreatedAt: string;
    updatedAt: string;
};

// Payload para PUT /api/users/me (techchup-users)
export type UpdateUsersProfileRequest = {
    fullName: string;
    identification: string;
    birthDate: string;
    gender: string;
    schoolRelation: string;
    academicProgram: string;
    semester: number | null;
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
    // Servicio de identidad — email, nombre básico, roles
    getMe() {
        return http.get<UserProfileDto>("/accounts/me");
    },

    // techchup-users — perfil extendido (relación, programa, semestre)
    getUsersProfile(id: number) {
        return http.get<UsersProfileDto>(`/api/users/${id}`);
    },

    updateUsersProfile(payload: UpdateUsersProfileRequest) {
        return http.put<UsersProfileDto>("/api/users/me", payload);
    },

    changePassword(payload: ChangePasswordRequest) {
        return http.patch<void>("/accounts/me/password", payload);
    },

    getActivity() {
        return http.get<ActivityItemDto[]>("/accounts/me/activity");
    },
};
