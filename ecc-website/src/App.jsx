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
import CaptainDrawPage from "./pages/CaptainDrawPage";
import AuctionPage from "./pages/AuctionPage";
import ScorerPage from "./pages/ScorerPage";
import { LiveListPage, LiveMatchPage } from "./pages/LivePage";
import { internalTournament } from "./data/internalTournament";
import SocialPage from "./pages/SocialPage";
import SponsorPage from "./pages/SponsorPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* The scorer app runs full screen, without the site header. */}
      {internalTournament.show && <Route path="score" element={<ScorerPage />} />}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="tournaments" element={<TournamentsPage />} />
        {internalTournament.show && (
          <Route path="internal-tournament" element={<InternalTournamentPage />} />
        )}
        {internalTournament.show && (
          <Route path="captain-draw" element={<CaptainDrawPage />} />
        )}
        {internalTournament.show && <Route path="auction" element={<AuctionPage />} />}
        {internalTournament.show && <Route path="live" element={<LiveListPage />} />}
        {internalTournament.show && <Route path="live/:id" element={<LiveMatchPage />} />}
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
