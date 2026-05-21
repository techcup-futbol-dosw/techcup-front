import { writeUICache } from "@/core/utils/uiCache";
import { tokenStorage } from "@/core/auth/tokenStorage";

const BASE_URL = (import.meta.env.VITE_COMPETITIONS_API_URL ?? "").replace(/\/+$/, "");

const statusLabel: Record<string, string> = {
  SCHEDULED:   "Próximo",
  IN_PROGRESS: "En curso",
  FINISHED:    "Finalizado",
  CANCELLED:   "Cancelado",
};

const statusColor: Record<string, string> = {
  SCHEDULED:   "#0066FE",
  IN_PROGRESS: "#17C964",
  FINISHED:    "#6E6E73",
  CANCELLED:   "#B81C1C",
};

async function competitionsRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = tokenStorage.getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function loadMatchesIntoCache(tournamentId: string): Promise<void> {
  const data = await competitionsRequest<any[]>(`/api/matches/tournament/${tournamentId}`);

  const mapped = data.map((m) => ({
    id: m.id,
    team1: m.homeTeamId,
    team2: m.awayTeamId,
    time: new Date(m.scheduledAt).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    venue: m.fieldId ?? "Por confirmar",
    status:      statusLabel[m.status] ?? m.status,
    statusColor: statusColor[m.status] ?? "#6E6E73",
    score1: m.status !== "SCHEDULED" ? m.homeScore : null,
    score2: m.status !== "SCHEDULED" ? m.awayScore : null,
    stats: null,
  }));

  writeUICache("techcup.ui.matches", mapped);
}

export async function loadStandingsIntoCache(tournamentId: string): Promise<void> {
  const data = await competitionsRequest<any[]>(`/api/matches/standings/${tournamentId}`);

  const mapped = data.map((s: any, index: number) => ({
    pos: index + 1,
    team: s.teamId,
    pts: s.points,
    pg: s.matchesWon,
    pe: s.matchesDrawn,
    pp: s.matchesLost,
    gf: s.goalsFor,
    gc: s.goalsAgainst,
    trend: index === 0 ? "up" : index === data.length - 1 ? "down" : "neutral",
  }));

  writeUICache("techcup.ui.scores", mapped);
  writeUICache("techcup.ui.standings", data);
}