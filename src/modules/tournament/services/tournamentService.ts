import { http } from "@/core/api/http";
import { sanitizeFileName } from "@/core/utils/fileutils";

// ── Backend raw types (lo que devuelve el microservicio) ───────────────────

type BackendInscription = {
    id: number;
    teamId: number;
    captainId: number;
    paymentUrl: string | null;
    date: string;
    status: string;          // "REVIEW" | "APPROVED" | "DECLINED" | "CANCELLED"
    tournamentId: number;
};

type BackendSoccerField = {
    id: number;
    name: string;
    description: string;
};

type BackendTournament = {
    id: number;
    organizerId: number;
    name: string;
    startDate: string;        // "YYYY-MM-DDTHH:mm:ss"
    endDate: string;
    endInscriptions: string;
    cost: number;
    rulesUrl: string | null;
    status: string;           // "DRAFT" | "ACTIVE" | "IN_PROGRESS" | "FINISHED"
    inscriptions: BackendInscription[];
    fields: BackendSoccerField[];
    teams: number;            // maxTeams
};

// ── Frontend public types ──────────────────────────────────────────────────

export type TournamentStatus = "draft" | "active" | "in_progress" | "finished";

export type CourtDto = {
    id: number;
    name: string;
    description: string;
};

export type TournamentDto = {
    id: number;
    organizerId: number;
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
    inscriptions: BackendInscription[];
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
    organizerId?: number;
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

// ── Helpers de mapeo ───────────────────────────────────────────────────────

function mapStatus(backendStatus: string): TournamentStatus {
    const map: Record<string, TournamentStatus> = {
        DRAFT: "draft",
        ACTIVE: "active",
        IN_PROGRESS: "in_progress",
        FINISHED: "finished",
    };
    return map[backendStatus] ?? "draft";
}

function toDateString(isoDateTime: string | null | undefined): string {
    if (!isoDateTime) return "";
    return isoDateTime.split("T")[0];
}

function toIsoDateTime(date: string): string {
    if (!date) return "";
    return date.includes("T") ? date : `${date}T00:00:00`;
}

function mapToFrontend(raw: BackendTournament): TournamentDto {
    const approvedTeams = (raw.inscriptions ?? []).filter(
        (i) => i.status === "APPROVED"
    ).length;
    return {
        id: raw.id,
        organizerId: raw.organizerId,
        name: raw.name,
        status: mapStatus(raw.status),
        startDate: toDateString(raw.startDate),
        endDate: toDateString(raw.endDate),
        registrationCloseDate: toDateString(raw.endInscriptions),
        maxTeams: raw.teams,
        costPerTeam: raw.cost,
        courts: (raw.fields ?? []).map((f) => ({
            id: f.id,
            name: f.name,
            description: f.description,
        })),
        regulationFileName: raw.rulesUrl ?? undefined,
        approvedTeams,
        totalRevenue: approvedTeams * raw.cost,
        inscriptions: raw.inscriptions ?? [],
    };
}

function buildCreatePayload(
    req: CreateTournamentRequest
): Record<string, unknown> {
    return {
        organizerId: req.organizerId ?? null,
        name: req.name,
        teams: req.maxTeams,
        startDate: toIsoDateTime(req.startDate),
        endDate: toIsoDateTime(req.endDate),
        endInscriptions: toIsoDateTime(req.registrationCloseDate),
        cost: req.costPerTeam,
        fieldIds: req.courtIds ?? [],
        rulesUrl: req.regulationPdfUrl ?? null,
    };
}

function buildUpdatePayload(
    req: UpdateTournamentRequest
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (req.name !== undefined) payload.name = req.name;
    if (req.maxTeams !== undefined) payload.teams = req.maxTeams;
    if (req.startDate !== undefined) payload.startDate = toIsoDateTime(req.startDate);
    if (req.endDate !== undefined) payload.endDate = toIsoDateTime(req.endDate);
    if (req.registrationCloseDate !== undefined)
        payload.endInscriptions = toIsoDateTime(req.registrationCloseDate);
    if (req.costPerTeam !== undefined) payload.cost = req.costPerTeam;
    if (req.courtIds !== undefined) payload.fieldIds = req.courtIds;
    if (req.regulationPdfUrl !== undefined) payload.rulesUrl = req.regulationPdfUrl;
    return payload;
}

interface UploadResponse {
    url: string;
    fileName: string;
}

// ── Service ────────────────────────────────────────────────────────────────

export const tournamentService = {
    list() {
        return http
            .get<BackendTournament[]>("/api/tournaments")
            .then((list) => list.map(mapToFrontend));
    },

    listByOrganizer(organizerId: number) {
        return http
            .get<BackendTournament[]>(`/api/tournaments/organizer/${organizerId}`)
            .then((list) => list.map(mapToFrontend));
    },

    getById(id: number) {
        return http
            .get<BackendTournament>(`/api/tournaments/${id}`)
            .then((raw): TournamentDetailDto => ({
                ...mapToFrontend(raw),
                teams: [],
                matches: [],
                standings: [],
            }));
    },

    create(payload: CreateTournamentRequest) {
        return http
            .post<BackendTournament>("/api/tournaments", buildCreatePayload(payload))
            .then(mapToFrontend);
    },

    update(id: number, payload: UpdateTournamentRequest) {
        return http
            .put<BackendTournament>(`/api/tournaments/${id}`, buildUpdatePayload(payload))
            .then(mapToFrontend);
    },

    delete(id: number) {
        return http.delete<void>(`/api/tournaments/${id}`);
    },

    activate(id: number) {
        return http
            .put<BackendTournament>(`/api/tournaments/${id}/activate`)
            .then(mapToFrontend);
    },

    start(id: number) {
        return http
            .put<BackendTournament>(`/api/tournaments/${id}/start`)
            .then(mapToFrontend);
    },

    finish(id: number) {
        return http
            .put<BackendTournament>(`/api/tournaments/${id}/finish`)
            .then(mapToFrontend);
    },

    getCourts() {
        return http.get<CourtDto[]>("/api/soccerfields");
    },

    getCourtsByTournament(tournamentId: number) {
        return http.get<CourtDto[]>(`/api/soccerfields/tournament/${tournamentId}`);
    },

    uploadRegulation: async (file: File): Promise<{ url: string; fileName: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await http.post<{ data: UploadResponse }>(
        "/api/tournaments/regulation/upload",
        formData,
        {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error subiendo PDF:", error?.response?.data || error);
        throw error;
    }
    },

    createMatch(tournamentId: number, payload: CreateMatchRequest) {
        return http.post<TournamentMatchDto>(`/api/matches`, {
            ...payload,
            tournamentId,
        });
    },

    updateMatch(matchId: number, payload: UpdateMatchRequest) {
        return http.put<TournamentMatchDto>(`/api/matches/${matchId}`, payload);
    },

    getApprovedTeams(tournamentId: number) {
        return http.get<number[]>(`/api/tournaments/${tournamentId}/approved-teams`);
    },

    getTournamentInscriptions(tournamentId: number) {
        return http.get<BackendInscription[]>(
            `/api/inscriptions/tournaments/${tournamentId}`
        );
    },

    approveInscription(inscriptionId: number) {
        return http.put<BackendInscription>(
            `/api/inscriptions/${inscriptionId}/approve`
        );
    },

    rejectInscription(inscriptionId: number) {
        return http.put<BackendInscription>(
            `/api/inscriptions/${inscriptionId}/reject`
        );
    },
};
