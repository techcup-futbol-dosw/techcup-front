import { http } from "@/core/api/http";

export type TeamMemberDto = {
    id: number;
    name: string;
    email: string;
    role: "Capitán" | "Jugador";
    jerseyNumber: number;
};

export type TeamScheduleItemDto = {
    id: number;
    date: string;
    label: string;
    opponent: string;
    venue: string;
    hour: string;
};

export type TeamStatus = "pending-payment" | "in-review" | "active";
export type RoleInTeam = "capitan" | "jugador";

export type MyTeamDto = {
    id: number;
    name: string;
    roleInTeam: RoleInTeam;
    teamStatus: TeamStatus;
    joinedAt: string;
    members: TeamMemberDto[];
    schedule: TeamScheduleItemDto[];
    primaryColor?: string;
    secondaryColor?: string;
};

export type CreateTeamRequest = {
    name: string;
    captainDorsal: number;
    invitedEmails: string[];
};

export type InviteMemberRequest = {
    email: string;
    jerseyNumber: number;
};

export type UploadPaymentRequest = {
    file: File;
};

export const teamService = {
    getMyTeam() {
        return http.get<MyTeamDto>("/teams/my");
    },

    create(payload: CreateTeamRequest) {
        return http.post<MyTeamDto>("/teams", payload);
    },

    inviteMember(teamId: number, payload: InviteMemberRequest) {
        return http.post<void>(`/teams/${teamId}/members/invite`, payload);
    },

    uploadPaymentProof(teamId: number, file: File) {
        const body = new FormData();
        body.append("file", file);
        return http.post<void>(`/teams/${teamId}/payment`, body);
    },
};
