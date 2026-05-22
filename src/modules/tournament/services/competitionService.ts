import { http } from "@/core/api/http";

// ── Types ───────────────────────────────────────────────────────────────

export type MatchStatus =
    | "PENDING"
    | "IN_PROGRESS"
    | "FINISHED";

export type MatchPhase =
    | "GROUP_STAGE"
    | "ROUND_OF_16"
    | "QUARTER_FINAL"
    | "SEMI_FINAL"
    | "FINAL";

export type MatchDto = {
    id: string;

    tournamentId: string;

    homeTeamId: string;
    awayTeamId: string;

    refereeId: string;

    fieldId: string;

    scheduledAt: string;

    status: MatchStatus;

    phase: MatchPhase;

    homeScore: number;
    awayScore: number;
    };

export type CreateMatchRequest = {
    tournamentId: string;

    homeTeamId: string;
    awayTeamId: string;

    refereeId: string;

    fieldId: string;

    scheduledAt: string;

    phase: MatchPhase;
    };

export type UpdateMatchRequest = {
    refereeId?: string;

    fieldId?: string;

    scheduledAt?: string;

    phase?: MatchPhase;
    };

export type MatchEventType =
    | "GOAL"
    | "YELLOW_CARD"
    | "RED_CARD";

export type MatchEventDto = {
    id: string;

    matchId: string;

    playerId: string;

    teamId: string;

    minute: number;

    type: MatchEventType;
    };

export type RegisterGoalRequest = {
    matchId: string;

    playerId: string;

    teamId: string;

    minute: number;
    };

export type RegisterCardRequest = {
    matchId: string;

    playerId: string;

    teamId: string;

    minute: number;

    type: "YELLOW_CARD" | "RED_CARD";
    };

export type StandingsDto = {
    id: string;

    tournamentId: string;

    teamId: string;

    matchesPlayed: number;

    matchesWon: number;

    matchesDrawn: number;

    matchesLost: number;

    goalsFor: number;

    goalsAgainst: number;

    goalDifference: number;

    points: number;
    };

export type LineupDto = {
    id: string;

    matchId: string;

    teamId: string;

    confirmed: boolean;

    players: string[];
    };

// ── Service ─────────────────────────────────────────────────────────────

export const competitionService = {
// ── Matches ─────────────────────────────────────────────────────────

    createMatch(payload: CreateMatchRequest) {
        return http.post<MatchDto>("/api/matches", payload);
    },

    updateMatch(id: string, payload: UpdateMatchRequest) {
        return http.put<MatchDto>(`/api/matches/${id}`, payload);
    },

    deleteMatch(id: string) {
        return http.delete<void>(`/api/matches/${id}`);
    },

    startMatch(id: string) {
        return http.put<MatchDto>(`/api/matches/${id}/start`);
    },

    finishMatch(id: string) {
        return http.put<MatchDto>(`/api/matches/${id}/finish`);
    },

    // ── Events ──────────────────────────────────────────────────────────

    registerGoal(payload: RegisterGoalRequest) {
        return http.post<MatchEventDto>(
        "/api/matches/goals",
        payload
        );
    },

    registerCard(payload: RegisterCardRequest) {
        return http.post<MatchEventDto>(
        "/api/matches/cards",
        payload
        );
    },

    getMatchEvents(matchId: string) {
        return http.get<MatchEventDto[]>(
        `/api/matches/${matchId}/events`
        );
    },

    // ── Standings ───────────────────────────────────────────────────────

    getStandings(tournamentId: string) {
        return http.get<StandingsDto[]>(
        `/api/matches/standings/${tournamentId}`
        );
    },

    // ── Lineups ─────────────────────────────────────────────────────────

    createLineup(payload: {
        matchId: string;
        teamId: string;
        players: string[];
    }) {
        return http.post<LineupDto>(
        "/api/lineups",
        payload
        );
    },

    updateLineup(
        lineupId: string,
        payload: {
        players: string[];
        }
    ) {
        return http.put<LineupDto>(
        `/api/lineups/${lineupId}`,
        payload
        );
    },

    confirmLineup(lineupId: string) {
        return http.put<LineupDto>(
        `/api/lineups/${lineupId}/confirm`
        );
    },

    getLineup(matchId: string, teamId: string) {
        return http.get<LineupDto>(
        `/api/lineups/match/${matchId}/team/${teamId}`
        );
    },
    };