import { http } from "@/core/api/http";
import { supabase } from "@/core/utils/supabase";
import { sanitizeFileName } from "@/core/utils/fileutils";

// ── Types ──────────────────────────────────────────────────────────────────

export type TournamentStatus = "draft" | "active" | "in_progress" | "finished";

export type CourtDto = {
    id: number;
    name: string;
    description: string;
};

export type TournamentDto = {
    id: number;
    name: string;
    status: TournamentStatus;
    startDate: string;
    endDate: string;
    registrationCloseDate: string;
    maxTeams: number;
    costPerTeam: number;
    courts: CourtDto[];
    regulationFileName?: string;
    approvedTeams: number;
    totalRevenue: number;
};

export type TournamentTeamDto = {
    id: number;
    name: string;
    players: number;
    status: "active" | "eliminated";
    eliminatedDate?: string;
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

export type StandingDto = {
    team: string;
    pj: number;
    g: number;
    e: number;
    p: number;
    gf: number;
    gc: number;
    pts: number;
};

export type TournamentDetailDto = TournamentDto & {
    teams: TournamentTeamDto[];
    matches: TournamentMatchDto[];
    standings: StandingDto[];
};

export type CreateTournamentRequest = {
    name: string;
    maxTeams: number;
    startDate: string;
    endDate: string;
    registrationCloseDate: string;
    costPerTeam: number;
    courtIds: number[];
    regulationPdfUrl: string | null;
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

// ── Service ────────────────────────────────────────────────────────────────

export const tournamentService = {
    list() {
        return http.get<TournamentDto[]>("/tournaments");
    },

    getById(id: number) {
        return http.get<TournamentDetailDto>(`/tournaments/${id}`);
    },

    create(payload: CreateTournamentRequest) {
        return http.post<TournamentDto>("/tournaments", payload);
    },

    update(id: number, payload: UpdateTournamentRequest) {
        return http.put<TournamentDto>(`/tournaments/${id}`, payload);
    },

    delete(id: number) {
        return http.delete<void>(`/tournaments/${id}`);
    },

    activate(id: number) {
        return http.patch<TournamentDto>(`/tournaments/${id}/activate`);
    },

    start(id: number) {
        return http.patch<TournamentDto>(`/tournaments/${id}/start`);
    },

    finish(id: number) {
        return http.patch<TournamentDto>(`/tournaments/${id}/finish`);
    },

    getCourts() {
        return http.get<CourtDto[]>("/courts");
    },

    uploadRegulation(file: File) {
        const sanitizedName = sanitizeFileName(file.name);
        const renamedFile = new File([file], sanitizedName, { type: file.type });
        const body = new FormData();
        body.append("file", renamedFile);
        return http.post<{ url: string; fileName: string }>("/tournaments/regulation/upload", body);
    },

    async uploadRegulation(file: File): Promise<{ url: string }> {
        const sanitizedFileName = sanitizeFileName(file.name);
        const fileName = `${Date.now()}-${crypto.randomUUID()}-${sanitizedFileName}`;
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
