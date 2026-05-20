import { http } from "@/core/api/http";

export type TeamMemberDto = {
    // Backend fields (align with TeamMemberDTO.java)
    id: number;
    teamId?: number;
    memberRole?: "capitan" | "jugador" | string; // canonical role value for backend
    playerId?: number;
    dorsal?: number;
    active?: boolean;

    // UI convenience fields (optional)
    name?: string;
    email?: string;
    role?: "Capitán" | "Jugador"; // display label
    jerseyNumber?: number; // display alias for dorsal
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
    logoUrl?: string | null;
    captainId?: number;
};

export type CreateTeamRequest = {
    name: string;
    captainDorsal?: number;
    captainId?: number;
};

export type AddMemberRequest = {
    teamId: number;
    memberRole: string;
    playerId: number;
    dorsal: number;
    active: boolean;
};

export type UploadPaymentRequest = {
    file: File;
};

export const teamService = {
    getMyTeam() {
        return http.get<MyTeamDto>("/teams/my");
    },

    getTeam(teamId: number) {
        return http.get<MyTeamDto>(`/teams/${teamId}`);
    },

    getTeamMembers(teamId: number) {
        return http.get<TeamMemberDto[]>(`/teams/${teamId}/members`);
    },

    create(payload: CreateTeamRequest) {
        return http.post<MyTeamDto>("/teams", payload);
    },

    addMember(teamId: number, payload: AddMemberRequest) {
        return http.post<TeamMemberDto>(`/teams/${teamId}/members`, payload);
    },

    uploadPaymentProof(teamId: number, file: File) {
        const body = new FormData();
        body.append("file", file);
        return http.post<void>(`/teams/${teamId}/payment`, body);
    },
};
