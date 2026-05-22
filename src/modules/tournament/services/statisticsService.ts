import { http } from "@/core/api/http";

// ── Tipos del backend ──────────────────────────────────────────────────────

type BackendStanding = {
    id: number;
    tournamentId: number;
    teamId: number;
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
};

// ── Tipos del frontend ─────────────────────────────────────────────────────

export type StandingDto = {
    id: number;
    tournamentId: number;
    teamId: number;
    team: string;
    pj: number;
    g: number;
    e: number;
    p: number;
    gf: number;
    gc: number;
    dg: number;
    pts: number;
};

export type UpdateMatchResultRequest = {
    homeTeamId: number;
    homeScore: number;
    awayTeamId: number;
    awayScore: number;
};

// ── Mapeo ──────────────────────────────────────────────────────────────────

function mapStanding(raw: BackendStanding): StandingDto {
    return {
        id: raw.id,
        tournamentId: raw.tournamentId,
        teamId: raw.teamId,
        team: `Equipo ${raw.teamId}`,
        pj: raw.matchesPlayed,
        g: raw.matchesWon,
        e: raw.matchesDrawn,
        p: raw.matchesLost,
        gf: raw.goalsFor,
        gc: raw.goalsAgainst,
        dg: raw.goalDifference,
        pts: raw.points,
    };
}

// ── Service ────────────────────────────────────────────────────────────────

export const statisticsService = {

    getRankedStandings(tournamentId: number) {
        return http
            .get<BackendStanding[]>(`/api/statistics/${tournamentId}/ranked`)
            .then((list) => list.map(mapStanding));
    },

    getStandingsByTournament(tournamentId: number) {
        return http
            .get<BackendStanding[]>(`/api/statistics/${tournamentId}`)
            .then((list) => list.map(mapStanding));
    },

    getStandingsByTeam(tournamentId: number, teamId: number) {
        return http
            .get<BackendStanding>(`/api/statistics/${tournamentId}/${teamId}`)
            .then(mapStanding);
    },

    initializeStandings(tournamentId: number, teamId: number) {
        return http
            .post<BackendStanding>(`/api/statistics/${tournamentId}/${teamId}`)
            .then(mapStanding);
    },

    updateAfterMatch(tournamentId: number, payload: UpdateMatchResultRequest) {
        return http
            .put<void>(`/api/statistics/${tournamentId}/match`, payload);
    },
};