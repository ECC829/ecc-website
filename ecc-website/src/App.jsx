import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import TournamentsPage from "./pages/TournamentsPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import LeadershipPage from "./pages/LeadershipPage";
import { showLeadership } from "./data/club";
import InternalTournamentPage from "./pages/InternalTournamentPage";
import AchievementsPage from "./pages/AchievementsPage";
import { internalTournament } from "./data/internalTournament";
import SocialPage from "./pages/SocialPage";
import SponsorPage from "./pages/SponsorPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="tournaments" element={<TournamentsPage />} />
        {internalTournament.show && (
          <Route path="internal-tournament" element={<InternalTournamentPage />} />
        )}
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/:slug" element={<TeamDetailPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="players/:slug" element={<PlayerProfilePage />} />
        {showLeadership && (
          <Route path="leadership" element={<LeadershipPage />} />
        )}
        <Route path="social" element={<SocialPage />} />
        <Route path="sponsor" element={<SponsorPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
