import { http } from "@/core/api/http";

export type InvitationDto = {
    id: number;
    playerId: number;
    teamId: number;
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
    sentAt: string;
    respondedAt: string | null;
};

export const invitationService = {
    getByUserId(userId: number) {
        return http.get<InvitationDto[]>(`/api/invitations/user/${userId}`);
    },

    accept(id: number) {
        return http.patch<InvitationDto>(`/api/invitations/${id}/accept`);
    },

    reject(id: number) {
        return http.patch<InvitationDto>(`/api/invitations/${id}/reject`);
    },
};
