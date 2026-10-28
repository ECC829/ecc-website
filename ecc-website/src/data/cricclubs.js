/**
 * ECC on CricClubs (scores, schedules and stats live there).
 * To add a new league or season: add it to `leagues` (newest first).
 * The league number is the `league=` value in its CricClubs link.
 */
const BASE = "https://cricclubs.com/EastonCricketLeague";
const CLUB = "clubId=1100194";

export const cricclubs = {
  name: "Easton Cricket League",
  home: BASE,
  links: [
    { label: "Results", note: "Every scorecard", href: `${BASE}/listMatches.do?${CLUB}` },
    { label: "Schedule", note: "Upcoming fixtures", href: `${BASE}/fixtures.do?${CLUB}` },
    { label: "Points table", note: "Standings", href: `${BASE}/viewPointsTable.do?${CLUB}` },
    { label: "Batting", note: "Runs & averages", href: `${BASE}/battingRecords.do?${CLUB}` },
    { label: "Bowling", note: "Wickets & economy", href: `${BASE}/bowlingRecords.do?${CLUB}` },
    { label: "Player rankings", note: "Top performers", href: `${BASE}/playerRankings.do?${CLUB}` },
  ],
  leagues: [
    {
      name: "SupremeFresh Presents Easton Premier League",
      id: 22,
      current: true,
      sponsor: { name: "Supreme Fresh Halal Meat & Grocery", logo: "/sponsors/supreme-fresh-badge.png" },
    },
    { name: "ECC Premier League 2025", id: 19 },
    { name: "Easton BleedBlue T7 – 2025", id: 18 },
  ],
};

export const leagueUrl = (id, page = "viewLeague") =>
  `${BASE}/${page}.do?league=${id}&${CLUB}`;
