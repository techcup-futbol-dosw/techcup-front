import { http } from "@/core/api/http";
import { jwtDecode } from "jwt-decode";
import { tokenStorage } from "@/core/auth/tokenStorage";
import { env } from "@/core/config/env";

// ── Types ──────────────────────────────────────────────────────────────────

export type MatchStatus = "pendiente" | "en-curso" | "finalizado";

export type AssignedMatchDto = {
    id: string;
    teamA: string;
    teamB: string;
    time: string;
    date: string;
    location: string;
    phase: string;
    status: MatchStatus;
};

export type MatchPlayerDto = {
    id: number;
    name: string;
};

export type MatchDetailDto = {
    id: string;
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

// ── Backend raw type ───────────────────────────────────────────────────────

type BackendMatch = {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    fieldId: string;
    scheduledAt: string;
    status: string;
    phase: string;
};

// ── Adapter ────────────────────────────────────────────────────────────────

function toMatchStatus(backendStatus: string): MatchStatus {
    if (backendStatus === "IN_PROGRESS") return "en-curso";
    if (backendStatus === "FINISHED") return "finalizado";
    return "pendiente";
}

function adaptMatch(m: BackendMatch): AssignedMatchDto {
    const dt = new Date(m.scheduledAt);
    const localDate = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString().split("T")[0];
    return {
        id: m.id,
        teamA: m.homeTeamId,
        teamB: m.awayTeamId,
        time: dt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        date: localDate,
        location: m.fieldId ?? "Por definir",
        phase: m.phase,
        status: toMatchStatus(m.status),
    };
}

// ── Service ────────────────────────────────────────────────────────────────

export const matchService = {
    async getAssigned(): Promise<AssignedMatchDto[]> {
        const token = tokenStorage.getAccessToken();
        const decoded: any = jwtDecode(token!);
        const refereeId = decoded.sub;

        const response = await fetch(`${env.competitionsApiUrl}/api/matches/referee/${refereeId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const raw: BackendMatch[] = await response.json();
        return raw.map(adaptMatch);
    },

    getById(id: string) {
        return http.get<MatchDetailDto>(`/api/matches/${id}`);
    },

    start(id: string) {
        return http.patch<void>(`/api/matches/${id}/start`);
    },

    finish(id: string) {
        return http.patch<void>(`/api/matches/${id}/finish`);
    },

    addEvent(id: string, payload: AddMatchEventRequest) {
        return http.post<void>(`/api/matches/${id}/events`, payload);
    },
};