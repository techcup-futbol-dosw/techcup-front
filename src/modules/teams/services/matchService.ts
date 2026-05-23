import { http } from "@/core/api/http";

// ── Backend response shape (matches MatchResponseDTO) ──────────────────────

type BackendMatch = {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  refereeId: string | null;
  fieldId: string | null;
  scheduledAt: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
  phase: string;
  homeScore: number;
  awayScore: number;
};

const statusToFrontend: Record<string, MatchStatus> = {
  SCHEDULED: "pendiente",
  IN_PROGRESS: "en-curso",
  FINISHED: "finalizado",
  CANCELLED: "finalizado",
};

function mapBackendMatch(m: BackendMatch): AssignedMatchDto {
  const dt = new Date(m.scheduledAt);
  return {
    id: m.id,
    teamA: m.homeTeamId,
    teamB: m.awayTeamId,
    time: dt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    date: dt.toISOString().split("T")[0],
    location: m.fieldId ?? "Por confirmar",
    phase: m.phase ?? "",
    status: statusToFrontend[m.status] ?? "pendiente",
  };
}

// ── Public types ───────────────────────────────────────────────────────────

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

export type RegisterGoalRequest = {
  matchId: string;
  teamId: string;
  playerId: string;
  assistPlayerId?: string;
  isOwnGoal?: boolean;
  minute: number;
};

export type RegisterCardRequest = {
  matchId: string;
  teamId: string;
  playerId: string;
  cardType: "YELLOW" | "RED";
  minute: number;
};

// ── Service ────────────────────────────────────────────────────────────────

export const matchService = {
  // Returns all matches assigned to the given referee, mapped to AssignedMatchDto
  getByReferee(refereeId: string | number) {
    return http
      .get<BackendMatch[]>(`/api/matches/referee/${refereeId}`)
      .then((list) => list.map(mapBackendMatch));
  },

  // Fetches the referee's match list and finds the match by ID
  getById(refereeId: string | number, matchId: string) {
    return http
      .get<BackendMatch[]>(`/api/matches/referee/${refereeId}`)
      .then((list) => {
        const m = list.find((item) => item.id === matchId);
        if (!m) throw new Error("Partido no encontrado");
        const dt = new Date(m.scheduledAt);
        const detail: MatchDetailDto = {
          id: m.id,
          teamA: m.homeTeamId,
          teamB: m.awayTeamId,
          playersA: [],
          playersB: [],
          time: dt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          date: dt.toISOString().split("T")[0],
          location: m.fieldId ?? "Por confirmar",
          phase: m.phase ?? "",
          status: statusToFrontend[m.status] ?? "pendiente",
        };
        return detail;
      });
  },

  start(id: string) {
    return http.put<void>(`/api/matches/${id}/start`);
  },

  finish(id: string) {
    return http.put<void>(`/api/matches/${id}/finish`);
  },

  registerGoal(payload: RegisterGoalRequest) {
    return http.post<void>("/api/matches/goals", payload);
  },

  registerCard(payload: RegisterCardRequest) {
    return http.post<void>("/api/matches/cards", payload);
  },
};
