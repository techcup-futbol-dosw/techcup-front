/**
 * @file src\modules\teams\data\matchesData.ts
 * @description Main source file for the DemoFront application architecture.
 */
export type MatchStatus = "pendiente" | "en-curso" | "finalizado";

export interface AssignedMatch {
  id: number;
  teamA: string;
  teamB: string;
  time: string;
  date: string;
  location: string;
  phase: string;
  status: MatchStatus;
}

export const assignedMatches: AssignedMatch[] = [
  {
    id: 1,
    teamA: "Los Compiladores",
    teamB: "Bug Hunters",
    time: "10:00 AM",
    date: "Hoy",
    location: "Cancha Central",
    phase: "Fase de Grupos · Grupo A",
    status: "en-curso",
  },
  {
    id: 2,
    teamA: "Stack Overflow FC",
    teamB: "Null Pointers",
    time: "02:00 PM",
    date: "Hoy",
    location: "Cancha 2",
    phase: "Fase de Grupos · Grupo B",
    status: "pendiente",
  },
  {
    id: 3,
    teamA: "Git Push United",
    teamB: "Los Debuggers",
    time: "04:30 PM",
    date: "Hoy",
    location: "Cancha Central",
    phase: "Cuartos de Final",
    status: "pendiente",
  },
  {
    id: 4,
    teamA: "Kernel Panic",
    teamB: "404 Defenders",
    time: "11:30 AM",
    date: "Mañana",
    location: "Cancha 3",
    phase: "Fase de Grupos · Grupo C",
    status: "pendiente",
  },
];



