import { http } from "@/core/api/http";

// ── Types ──────────────────────────────────────────────────────────────────

export type MatchStatus = "pendiente" | "en-curso" | "finalizado";

export type AssignedMatchDto = {
    id: number;
    teamA: string;
    teamB: string;
    time: string;
    date: string;       // ISO date YYYY-MM-DD
    location: string;
    phase: string;
    status: MatchStatus;
};

export type MatchPlayerDto = {
    id: number;
    name: string;
};

export type MatchDetailDto = {
    id: number;
    teamA: string;
    teamB: string;
    playersA: MatchPlayerDto[];
    playersB: MatchPlayerDto[];
    time: string;
    date: string;
    location: string;
    phase: string;
    status: MatchStatus;
};

export type MatchEventType = "gol" | "amarilla" | "roja";

export type AddMatchEventRequest = {
    type: MatchEventType;
    team: "a" | "b";
    player: string;
    minute: number;
};

// ── Service ────────────────────────────────────────────────────────────────

export const matchService = {
    getAssigned() {
        return http.get<AssignedMatchDto[]>("/matches/referee/assigned");
    },

    getById(id: number) {
        return http.get<MatchDetailDto>(`/matches/${id}`);
    },

    start(id: number) {
        return http.patch<void>(`/matches/${id}/start`);
    },

    finish(id: number) {
        return http.patch<void>(`/matches/${id}/finish`);
    },

    addEvent(id: number, payload: AddMatchEventRequest) {
        return http.post<void>(`/matches/${id}/events`, payload);
    },
};
