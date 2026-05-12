import { http } from "@/core/api/http";

export type NotificationDto = {
    id: number;
    type: "payment" | "match" | "team" | "info";
    title: string;
    body: string;
    team?: string;
    captain?: string;
    time: string;
    status?: string;
    read: boolean;
};

export const notificationService = {
    getAll() {
        return http.get<NotificationDto[]>("/notifications");
    },

    markRead(id: number) {
        return http.patch<void>(`/notifications/${id}/read`);
    },
};
