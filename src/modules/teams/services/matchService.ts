import { http } from "@/core/api/http";
import { tokenStorage } from "@/core/auth/tokenStorage";

// ── JWT decode helper ──────────────────────────────────────────────────────

function decodeJwtPayload(token: string): Record<string, unknown> {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
}

// ── Types ──────────────────────────────────────────────────────────────────

export type MatchStatus = "pendiente" | "en-curso" | "finalizado";

export type AssignedMatchDto = {
    id: string;
    teamA: string;
    teamB: string;
    time: string;
    date: string;       // YYYY-MM-DD
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
    homeScore: number;
    awayScore: number;
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
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    refereeId: string;
    fieldId: string;
    scheduledAt: string;
    status: string;
    phase: string;
    homeScore: number;
    awayScore: number;
};

// ── Adapters ───────────────────────────────────────────────────────────────

function toMatchStatus(s: string): MatchStatus {
    if (s === "IN_PROGRESS") return "en-curso";
    if (s === "FINISHED")    return "finalizado";
    return "pendiente";
}

function parseScheduledAt(scheduledAt: string) {
    const dt = new Date(scheduledAt);
    const localDate = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString().split("T")[0];
    const time = dt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    return { date: localDate, time };
}

function adaptToAssigned(m: BackendMatch): AssignedMatchDto {
    const { date, time } = parseScheduledAt(m.scheduledAt);
    return {
        id: m.id,
        teamA: m.homeTeamId,
        teamB: m.awayTeamId,
        time,
        date,
        location: m.fieldId ?? "Por definir",
        phase: m.phase,
        status: toMatchStatus(m.status),
    };
}

function adaptToDetail(m: BackendMatch): MatchDetailDto {
    const { date, time } = parseScheduledAt(m.scheduledAt);
    return {
        id: m.id,
        teamA: m.homeTeamId,
        teamB: m.awayTeamId,
        playersA: [],
        playersB: [],
        time,
        date,
        location: m.fieldId ?? "Por definir",
        phase: m.phase,
        status: toMatchStatus(m.status),
        homeScore: m.homeScore,
        awayScore: m.awayScore,
    };
}

// ── Service ────────────────────────────────────────────────────────────────

export const matchService = {
    async getAssigned(): Promise<AssignedMatchDto[]> {
        const token = tokenStorage.getAccessToken();
        if (!token) return [];
        const decoded = decodeJwtPayload(token);
        const refereeId = decoded.sub as string;
        const raw = await http.get<BackendMatch[]>(`/api/matches/referee/${refereeId}`);
        return raw.map(adaptToAssigned);
    },

    async getById(id: string): Promise<MatchDetailDto> {
        const raw = await http.get<BackendMatch>(`/api/matches/${id}`);
        return adaptToDetail(raw);
    },

    start(id: string) {
        return http.put<void>(`/api/matches/${id}/start`);
    },

    finish(id: string) {
        return http.put<void>(`/api/matches/${id}/finish`);
    },

    registerGoal(matchId: string, teamId: string, playerId: string, minute: number) {
        return http.post<void>("/api/matches/goals", {
            matchId,
            teamId,
            playerId,
            assistPlayerId: null,
            isOwnGoal: false,
            minute,
        });
    },

    registerCard(matchId: string, teamId: string, playerId: string, cardType: "YELLOW_CARD" | "RED_CARD", minute: number) {
        return http.post<void>("/api/matches/cards", {
            matchId,
            teamId,
            playerId,
            cardType,
            minute,
        });
    },
};
