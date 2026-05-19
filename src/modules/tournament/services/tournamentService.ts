import { http } from "@/core/api/http";
import { supabase } from "@/core/utils/supabase";

export type TournamentStatus =
    | "DRAFT"
    | "ACTIVE"
    | "IN_PROGRESS"
    | "FINISHED";

export type CourtDto = {
    id: number;
    name: string;
    description: string;
};

export type TournamentDto = {
    id: number;
    organizerId: number;

    name: string;

    startDate: string;
    endDate: string;
    endInscriptions: string;

    cost: number;
    rulesUrl: string;

    status: TournamentStatus;

    teams: number;

    fields: CourtDto[];
};

export type CreateTournamentRequest = {
    name: string;

    teams: number;

    startDate: string;

    endDate: string;

    registrationCloseDate: string;

    cost: number;

    courtIds: number[];

    regulationPdfUrl: string | null;
};

export type UploadPdfResponse = {
    url: string;
};

export type TournamentMatchDto = {
    id: number;
    date: string;
    time: string;
    court: string;
    teamA: string;
    teamB: string;
    scoreA?: number;
    scoreB?: number;
    scorers?: Array<{ player: string; team: string; minute: string }>;
    yellowCards?: Array<{ player: string; team: string; minute: string }>;
    redCards?: Array<{ player: string; team: string; minute: string }>;
    status: "pending" | "in-progress" | "completed";
};

export type UpdateTournamentRequest = Partial<CreateTournamentRequest>;

export type CreateMatchRequest = {
    date: string;
    time: string;
    courtId: number;
    teamAId: number;
    teamBId: number;
};

export type UpdateMatchRequest = Partial<TournamentMatchDto>;

export interface StandingDto {
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

}

export type TournamentDetailDto = TournamentDto & {
    teams: TournamentTeamDto[];
    matches: TournamentMatchDto[];
    standings: StandingDto[];
};


export type TournamentTeamDto = {
    id: number;
    name: string;
    players: number;
    status: "active" | "eliminated";
    eliminatedDate?: string;
};

// ── Service ──────────────────────────────────────────────────────────────

export const tournamentService = {
    getCourts() {
    return http.get<CourtDto[]>("/api/soccerfields");
    },

    getById(id: number) {
        return http.get<TournamentDto>(`/api/tournaments/${id}`);
    },

    getByOrganizer(organizerId: number) {
    return http.get<TournamentDto[]>(`/api/tournaments/organizer/${organizerId}`);
    },

    create(payload: CreateTournamentRequest) {

    return http.post<TournamentDto>("/api/tournaments", {

        name: payload.name,

        startDate: `${payload.startDate}T00:00:00`,

        endDate: `${payload.endDate}T00:00:00`,

        endInscriptions: `${payload.registrationCloseDate}T00:00:00`,

        cost: payload.cost,

        rulesUrl: payload.regulationPdfUrl,

        fieldIds: payload.courtIds,

        teams: payload.teams,
    });
    },

    activate(id: number) {
        return http.put<TournamentDto>(`/api/tournaments/${id}/activate`);
    },


    start(id: number) {
        return http.put<TournamentDto>(`/api/tournaments/${id}/start`);
    },

    finish(id: number) {
        return http.put<TournamentDto>(`/api/tournaments/${id}/finish`);
    },

    delete(id: number) {
        return http.delete<void>(`/api/tournaments/${id}`);
    },

    update(id: number, payload: CreateTournamentRequest) {
    return http.put<TournamentDto>(`/api/tournaments/${id}`, {
        name: payload.name,

        startDate: `${payload.startDate}T00:00:00`,

        endDate: `${payload.endDate}T00:00:00`,

        endInscriptions:
            `${payload.registrationCloseDate}T00:00:00`,

        cost: payload.cost,

        rulesUrl: payload.regulationPdfUrl,

        fieldIds: payload.courtIds,

        teams: payload.teams,
    });
    },

    async uploadRegulation(file: File): Promise<{ url: string }> {

        const fileExt = file.name.split(".").pop();

        const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

        const filePath = `regulations/${fileName}`;

        const { error } = await supabase.storage
        .from("tournament-rules")
        .upload(filePath, file, {
            upsert: false,
        });

        if (error) {
            throw new Error(error.message);
        }

        const { data } = supabase.storage
        .from("tournament-rules")
        .getPublicUrl(filePath);

        return {
        url: data.publicUrl,
        };
    },
    
    createMatch(tournamentId: number, payload: CreateMatchRequest) {
        return http.post<TournamentMatchDto>(`/tournaments/${tournamentId}/matches`, payload);
    },

    updateMatch(matchId: number, payload: UpdateMatchRequest) {
        return http.put<TournamentMatchDto>(`/matches/${matchId}`, payload);
    },
};