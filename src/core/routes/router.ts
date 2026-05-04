/**
 * @file src\core\routes\router.ts
 * @description Main source file for the DemoFront application architecture.
 */
import { createBrowserRouter } from "react-router";
import { LandingPage } from "@/modules/auth/pages/LandingPage";
import { Dashboard } from "@/modules/competition/pages/Dashboard";
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
import { Login } from "@/modules/auth/pages/Login";
import { Register } from "@/modules/auth/pages/Register";
import { Matches } from "@/modules/competition/pages/Matches";
import { Schedule } from "@/modules/competition/pages/Schedule";
import { Scores } from "@/modules/competition/pages/Scores";
import { Tournament } from "@/modules/tournament/pages/Tournament";
import { RootLayout } from "./RootLayout";

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
      { index: true, Component: LandingPage },
      { path: "dashboard", Component: Dashboard },
      { path: "dashboard-arbitro", Component: ArbitroDashboard },
      { path: "dashboard-arbitro/partido/:id", Component: MatchDetail },
      { path: "dashboard/team-setup", Component: TeamPrePaymentSetup },
      { path: "dashboard-organizer", Component: OrganizerDashboard },
      { path: "organizer/create-tournament", Component: CreateTournament },
      { path: "organizer/payment-report", Component: PaymentReport },
      { path: "organizer/tournaments", Component: ManageTournaments },
      { path: "organizer/tournaments/:id", Component: TournamentDetail },
      { path: "events", Component: Events },
      { path: "profile", Component: Profile },
      { path: "matches", Component: Matches },
      { path: "schedule", Component: Schedule },
      { path: "scores", Component: Scores },
      { path: "tournament", Component: Tournament },
    ],
  },
]);


