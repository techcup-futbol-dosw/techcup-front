import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "@/modules/auth/pages/LandingPage";
import Dashboard from "@/modules/competition/pages/Dashboard.tsx";
import { ArbitroDashboard } from "@/modules/teams/pages/ArbitroDashboard";
import { OrganizerDashboard } from "@/modules/tournament/pages/OrganizerDashboard";
import { CreateTournament } from "@/modules/tournament/pages/CreateTournament";
import { PaymentReport } from "@/modules/tournament/pages/PaymentReport";
import { ManageTournaments } from "@/modules/tournament/pages/ManageTournaments";
import { TournamentDetail } from "@/modules/tournament/pages/TournamentDetail";
import { MatchDetail } from "@/modules/teams/pages/MatchDetail";
import { TeamPrePaymentSetup } from "@/modules/teams/pages/TeamPrePaymentSetup";
import { Events } from "@/modules/competition/pages/Events";
import { Profile } from "@/modules/users/pages/Profile";
import { UserManagement } from "@/modules/admin/pages/UserManagement";
import { SportsProfile } from "@/modules/users/pages/SportsProfile";
import PlayerSearch from "@/modules/users/pages/PlayerSearch";
import { Login } from "@/modules/auth/pages/Login";
import { Register } from "@/modules/auth/pages/Register";
import PendingInvitations from "@/modules/users/pages/PendingInvitations";
import { Matches } from "@/modules/competition/pages/Matches";
import { Schedule } from "@/modules/competition/pages/Schedule";
import { Scores } from "@/modules/competition/pages/Scores";
import { Tournament } from "@/modules/tournament/pages/Tournament";
import { RootLayout } from "./RootLayout";
import { RequireAuth } from "@/core/auth/RequireAuth";
import { RequirePermission } from "@/core/auth/RequirePermission";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      // ── Public ──────────────────────────────────
      { index: true, Component: LandingPage },

      // ── Protected ───────────────────────────────
      {
        Component: RequireAuth,
        children: [
          { path: "dashboard", element: <Navigate to="/dashboard-player" replace /> },
          { path: "dashboard-player", Component: Dashboard },
          { path: "dashboard-arbitro", Component: ArbitroDashboard },
          { path: "dashboard-arbitro/partido/:id", Component: MatchDetail },
          { path: "dashboard/team-setup", Component: TeamPrePaymentSetup },
          { path: "dashboard-organizer", Component: OrganizerDashboard },
          { path: "organizer/create-tournament", Component: CreateTournament },
          { path: "organizer/payment-report", Component: PaymentReport },
          { path: "organizer/tournaments", Component: ManageTournaments },
          { path: "organizer/tournaments/:id", Component: TournamentDetail },
          {
            path: "dashboard-admin",
            element: (
              <RequirePermission permission="account:read:any">
                <UserManagement />
              </RequirePermission>
            ),
          },
          { path: "events", Component: Events },
          { path: "sport-profile", Component: SportsProfile },
          { path: "profile", Component: Profile },
          { path: "player-search", Component: PlayerSearch },
          { path: "pending-invitations", Component: PendingInvitations },
          { path: "matches", Component: Matches },
          { path: "schedule", Component: Schedule },
          { path: "scores", Component: Scores },
          { path: "tournament", Component: Tournament },
        ],
      },
    ],
  },
]);
