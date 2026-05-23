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
    status: string;
    roles: string[];
    createdAt: string;
};

// Matches UserResponse from techchup-users service
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

// Matches UserProfileUpdateRequest from techchup-users service
export type UpdateUsersProfileRequest = {
    fullName: string;
    identification: string;
    birthDate: string;
    gender: string;
    schoolRelation: string;
    academicProgram: string;
    semester: number | null;
};


export type ActivityItemDto = {
    id: number;
    action: string;
    category: "tournament" | "security" | "profile" | "match" | "other";
    createdAt: string;
};

export const userService = {
    getMe(id: number) {
        return http.get<UserProfileDto>(`/accounts/${id}`);
    },

    getUsersProfile(id: number) {
        return http.get<UsersProfileDto>(`/api/users/${id}`);
    },

    updateUsersProfile(payload: UpdateUsersProfileRequest) {
        return http.put<UsersProfileDto>("/api/users/me", payload);
    },

    getActivity() {
        return http.get<ActivityItemDto[]>("/accounts/me/activity");
    },
};
