import { useMemo, useState } from "react";

export default function ECCClubWebsite() {
  const [activePage, setActivePage] = useState("home");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const season = {
    year: 2026,
    start: "April 2026",
  };

  const clubLogo = "/ECC_LOGO.png";

  const players = [
    { name: "Raavy", team: "Vikings", role: "Allrounder", image: "https://randomuser.me/api/portraits/men/32.jpg", email: "raavy.pothela@gmail.com", phone: "6146799277" },
    { name: "Ajay", team: "Vikings", role: "Batsman", image: "https://randomuser.me/api/portraits/men/45.jpg", email: "ajaymanyam007@gmail.com", phone: "9372516898" },
    { name: "Bala sai bharath raju Jayapathi", team: "Kurralu", role: "Batsman", image: "https://randomuser.me/api/portraits/men/12.jpg", email: "bharathcrazy100@gmail.com", phone: "3802428816" },
    { name: "Balaji Maandapuram", team: "Kurralu", role: "Allrounder", email: "balajimaandapuram@gmail.com", phone: "6145883018" },
    { name: "Jithendra Kumar Pedarla", team: "Kurralu", role: "Allrounder", email: "jithendra.kumarb1@gmail.com", phone: "6145569893" },
    { name: "Likith Muddu Krishna", team: "Kurralu", role: "Allrounder", email: "likithmk05@gmail.com", phone: "2164664608" },
    { name: "Sravan Kumar Tumu", team: "Kurralu", role: "Allrounder", email: "sravantumu7@gmail.com", phone: "6144403016" },
    { name: "Santosh Bharadwaj", team: "Vikings", role: "Batsman", email: "santoshbharadwaj17@gmail.com", phone: "9379561200" },
    { name: "Vishal", team: "Royals", role: "Allrounder", email: "vishal123m@gmail.com", phone: "6185409935" },
    { name: "Srini Chinnakonda", team: "Royals", role: "Allrounder", email: "ccsrinivasan1985@gmail.com", phone: "6145318606" },
    { name: "Nishanth", team: "Royals", role: "Batsman", email: "nishanth.b1950@gmail.com", phone: "6163340822" },
    { name: "Aditya panchamukh Yalla", team: "Royals", role: "Allrounder", email: "adityapanchamukh@gmail.com", phone: "5107668762" },
    { name: "Pk", team: "Kurralu", role: "Allrounder", email: "pavankalyan.karimi@gmail.com", phone: "9373293514" },
    { name: "Adithya Radhakrishnan", team: "Kurralu", role: "Allrounder", email: "adithya.rk24@gmail.com", phone: "9372517272" },
    { name: "Bobby", team: "Royals", role: "Batsman", email: "babiadireddi@gmail.com", phone: "3127744025" },
    { name: "Shubhodeep Ghosh (Ronie)", team: "Royals", role: "Batsman", email: "shubhodeep.ghosh.1704@gmail.com", phone: "6142606360" },
    { name: "Jayanth Buchala", team: "Vikings", role: "Allrounder", email: "jayanth.buchala18@gmail.com", phone: "9373293653" },
    { name: "Mohithkumar Bolisetti", team: "Vikings", role: "Bowler", email: "mohithkumar187@gmail.com", phone: "9372045257" },
    { name: "Saivishal Lingala", team: "Vikings", role: "Batsman", email: "saivarunlingala37@gmail.com", phone: "6146224426" },
    { name: "Umesh", team: "Kurralu", role: "Batsman", email: "umeford@gmail.com", phone: "8164896010" },
    { name: "Satwik Reddy", team: "Vikings", role: "Allrounder", email: "saisatwik123456@gmail.com", phone: "9373210299" },
    { name: "Mahesh Mannam", team: "Royals", role: "Allrounder", email: "srimahr@gmail.com", phone: "6146803804" },
    { name: "deepak", team: "Kurralu", role: "Allrounder", email: "mdeepu3006@gmail.com", phone: "9373464673" },
    { name: "Ajit", team: "Vikings", role: "Batsman", email: "dvajith04@gmail.com", phone: "9135531302" },
    { name: "Krishna Vamshi Dampuri", team: "Vikings", role: "Allrounder", email: "krishnadampuri@gmail.com", phone: "9374769411" },
    { name: "Ram Mekala", team: "Royals", role: "Allrounder", email: "ramchandar28790@gmail.com", phone: "6146957655" },
    { name: "Ramu", team: "Royals", role: "Allrounder", email: "yadav.ramu@gmail.com", phone: "9403440807" },
    { name: "Sachin Kumar Pradhan", team: "Vikings", role: "Bowler", email: "sachinkumarpradhan1123@gmail.com", phone: "6143841303" },
    { name: "Satya", team: "Vikings", role: "Batsman", email: "sai.satyaprasanna@gmail.com", phone: "6145562947" },
    { name: "Naresh", team: "Royals", role: "Bowler", email: "nkanyan1269@gmail.com", phone: "7085526517" },
    { name: "Kiran", team: "Royals", role: "Batsman", email: "n.saikiran88@gmail.com", phone: "7814914191" },
    { name: "Aman Madathil", team: "Royals", role: "Batsman", email: "amancs1729@gmail.com", phone: "8155643013" },
    { name: "Nithin", team: "Royals", role: "Bowler", email: "shoponline448@gmail.com", phone: "4436913348" },
    { name: "Achutha Telluri", team: "Vikings", role: "Allrounder", email: "achuthramireddy123@gmail.com", phone: "2037107221" },
    { name: "Satheesh Bommavaram", team: "Royals", role: "Batsman", email: "satheeshrao777@gmail.com", phone: "8143845525" },
    { name: "Saumitra Kulkarni", team: "Vikings", role: "Batsman", email: "kulkarni100mitra@gmail.com", phone: "9377893826" },
    { name: "Praveen K", team: "Vikings", role: "Batsman", email: "ignoreemailfornnow@gmail.com", phone: "6144074302" },
    { name: "Vamsi Duggampudi", team: "Vikings", role: "Bowler", email: "vamsiduggampudi@gmail.com", phone: "8722166480" },
  ];

  const fixtures = [
    { id: 1, opponent: "Coming Soon", date: "April 2026", venue: "To be announced", result: "Upcoming" },
    { id: 2, opponent: "Coming Soon", date: "April 2026", venue: "To be announced", result: "Upcoming" },
    { id: 3, opponent: "Coming Soon", date: "May 2026", venue: "To be announced", result: "Upcoming" },
  ];

  const tournaments = [
    {
      title: "T7 Tournaments",
      formats: ["7 overs per side", "7 players per team", "Short and intense matches"],
      teams: ["Kurralu", "BleedBlue"],
      events: ["Dublin Cricket League", "SWATS Cricket League", "TANA Tournament", "TACO Tournament", "CSK Amigos Tournament"],
      description:
        "ECC actively participates in action-packed T7 competitions where quick decisions, explosive batting, and aggressive bowling make every ball count.",
    },
    {
      title: "T15 Tournaments",
      formats: ["15 overs per side", "11 players per team", "Played on a full-sized cricket ground"],
      teams: ["Royals", "Kurralu", "Vikings"],
      events: ["Dublin Cricket League", "PDCC Cricket Tournament", "Columbus Cricket Tournament", "Dayton Premier League", "Cincinnati Premier League"],
      description:
        "The T15 format blends tactical cricket with aggressive intent and remains one of ECC’s strongest competitive platforms across Central Ohio.",
    },
    {
      title: "T20 & T40 Leather Ball",
      formats: ["20 or 40 overs per side", "11 players per team", "Leather ball format on a full cricket ground"],
      teams: ["Vajras", "Garudas"],
      events: ["Midwest Cricket Tournament", "Dublin Premier League"],
      description:
        "These longer-format competitions test endurance, strategic planning, batting depth, bowling discipline, and overall team balance.",
    },
  ];

  const teamSections = [
    {
      format: "T7 Teams",
      description: "Fast-paced 7-over format teams built for explosive cricket and high-energy matches.",
      teams: [
        { name: "Kurralu", page: "kurralu", summary: "An energetic squad known for aggressive intent, all-round options, and dynamic matchups." },
        { name: "BleedBlue", page: "bleedblue", summary: "A high-energy T7 side that represents ECC with intensity, quick impact, and attacking cricket." },
      ],
    },
    {
      format: "T15 Teams",
      description: "ECC’s core 15-over competition teams competing across major Central Ohio tournaments.",
      teams: [
        { name: "Royals", page: "royals", summary: "A balanced unit built on composure, experience, and depth across batting and bowling." },
        { name: "Kurralu", page: "kurralu", summary: "An energetic squad known for aggressive intent, all-round options, and dynamic matchups." },
        { name: "Vikings", page: "vikings", summary: "A competitive side with strong all-rounders, impact bowlers, and attacking top-order options." },
      ],
    },
    {
      format: "T20 / T40 Leather Ball Teams",
      description: "Longer-format ECC teams built for endurance, strategy, and leather ball competition.",
      teams: [
        { name: "Vajras", page: "vajras", summary: "A leather ball unit representing ECC with structure, tactical discipline, and match endurance." },
        { name: "Garudas", page: "garudas", summary: "A strong ECC leather ball side focused on balance, control, and long-format competitiveness." },
      ],
    },
  ];

  const teams = useMemo(() => {
    const grouped = players.reduce((acc, player) => {
      if (!acc[player.team]) {
        acc[player.team] = {
          name: player.team,
          players: [],
          roles: {},
        };
      }

      acc[player.team].players.push(player);
      acc[player.team].roles[player.role] = (acc[player.team].roles[player.role] || 0) + 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((team) => ({
        ...team,
        playerCount: team.players.length,
        description: `${team.name} squad for the ${season.year} season.`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players]);

  const teamOptions = ["All", ...teams.map((team) => team.name)];

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesTeam = selectedTeam === "All" || player.team === selectedTeam;
      const value = `${player.name} ${player.team} ${player.role}`.toLowerCase();
      const matchesSearch = value.includes(searchTerm.toLowerCase());
      return matchesTeam && matchesSearch;
    });
  }, [players, searchTerm, selectedTeam]);

  const roleCounts = useMemo(() => {
    return players.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {});
  }, [players]);

  const renderHomePage = () => (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-blue-500/20" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-4 w-fit rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1 text-sm text-orange-200">
              Season starts {season.start}
            </span>
            <h2 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Welcome to ECC Club
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Easton–Emeralds Cricket Club is building a modern digital home for our players, teams, tournaments, and achievements across Central Ohio.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setActivePage("about")}
                className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02]"
              >
                About ECC
              </button>
              <button
                onClick={() => setActivePage("tournaments")}
                className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white/90 transition hover:bg-white/5"
              >
                View Tournaments
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Total Teams" value={teams.length} />
            <StatCard label="Total Players" value={players.length} />
            <StatCard label="Batsmen" value={roleCounts.Batsman || 0} />
            <StatCard label="Allrounders" value={roleCounts.Allrounder || 0} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
              Fixtures & Results
            </p>
            <h3 className="mt-3 text-3xl font-bold md:text-4xl">
              Featured on the first page
            </h3>
            <p className="mt-3 max-w-2xl text-slate-300">
              Match updates, upcoming fixtures, and result highlights will continue to grow here as ECC moves through the season.
            </p>
          </div>
          <button
            onClick={() => setActivePage("teams")}
            className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5"
          >
            Explore Teams
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {fixtures.map((fixture) => (
            <div
              key={fixture.id}
              className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl transition hover:-translate-y-1"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Match {fixture.id}</p>
              <h4 className="mt-3 text-2xl font-bold">vs {fixture.opponent}</h4>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Date:</span> {fixture.date}</p>
                <p><span className="font-semibold text-white">Venue:</span> {fixture.venue}</p>
                <p><span className="font-semibold text-white">Status:</span> {fixture.result}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderAboutPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">About ECC</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">Easton–Emeralds Cricket Club</h3>
        <div className="mt-8 space-y-6 text-base leading-8 text-slate-300">
          <p>
            ECC (Easton–Emeralds Cricket Club) is a unified cricket club formed by bringing together players from the Easton and Emeralds teams, two passionate cricket groups in the Central Ohio cricket community. The club was established with the vision of creating a strong and competitive platform where players can showcase their talent, grow together as a team, and contribute to the development of cricket in the region.
          </p>
          <p>
            Over the years, ECC has evolved into a well-recognized cricket club in Central Ohio, participating in various tournaments and leagues across cities such as Columbus, Dublin, Dayton, and Cincinnati. The club brings together players from diverse backgrounds who share a common love for the game and a commitment to teamwork, discipline, and sportsmanship.
          </p>
          <p>
            ECC not only focuses on competitive cricket but also emphasizes community engagement, player development, and fostering the next generation of cricketers. Through its structured teams and participation in multiple formats, ECC provides opportunities for players of different skill levels to compete and grow.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "T7", text: "7-over format focused on speed, aggression, and impact." },
          { title: "T15", text: "15-over format combining tactics with quick decision-making." },
          { title: "T20", text: "Strategic short-format leather ball competition." },
          { title: "T40", text: "Longer format built on endurance and tactical depth." },
        ].map((format) => (
          <div key={format.title} className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Format</p>
            <h4 className="mt-2 text-2xl font-bold">{format.title}</h4>
            <p className="mt-3 text-slate-300">{format.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Vision & Community Impact</p>
        <ul className="mt-5 grid gap-4 text-slate-300 md:grid-cols-2">
          <li className="rounded-2xl bg-white/5 p-4">Promoting cricket within the local community</li>
          <li className="rounded-2xl bg-white/5 p-4">Encouraging sportsmanship and teamwork</li>
          <li className="rounded-2xl bg-white/5 p-4">Supporting player development and leadership</li>
          <li className="rounded-2xl bg-white/5 p-4">Building partnerships and sponsorships to grow the club</li>
        </ul>
      </div>
    </section>
  );

  const renderTournamentsPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="mb-10 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Tournament Sections</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">ECC Tournament Participation</h3>
        <p className="mt-4 text-slate-300">
          ECC competes across multiple formats including T7, T15, T20, and T40, giving players opportunities to perform in both fast-paced and endurance-based cricket environments.
        </p>
      </div>

      <div className="space-y-8">
        {tournaments.map((tournament) => (
          <div key={tournament.title} className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Tournament Category</p>
                <h4 className="mt-3 text-3xl font-bold">{tournament.title}</h4>
                <p className="mt-4 text-slate-300">{tournament.description}</p>

                <div className="mt-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Major Tournaments</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {tournament.events.map((event) => (
                      <span key={event} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Format Highlights</p>
                  <div className="mt-3 space-y-2 text-slate-300">
                    {tournament.formats.map((item) => (
                      <p key={item} className="rounded-xl border border-white/10 px-3 py-2">{item}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">ECC Teams</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {tournament.teams.map((team) => (
                      <span key={team} className="rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-semibold text-orange-200">
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderTeamsPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Teams Overview</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">ECC Team Pages by Format</h3>
        <p className="mt-4 text-slate-300">
          Team names are now separated by format so visitors can clearly understand which ECC teams compete in T7, T15, and T20/T40 leather ball tournaments.
        </p>
      </div>

      <div className="space-y-10">
        {teamSections.map((section) => (
          <div key={section.format} className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.2em] text-orange-300">{section.format}</p>
              <h4 className="mt-2 text-2xl font-bold text-white">{section.format}</h4>
              <p className="mt-3 max-w-3xl text-slate-300">{section.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {section.teams.map((team) => (
                <div key={`${section.format}-${team.name}`} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl transition hover:-translate-y-1 hover:border-orange-400/40">
                  <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Team Page</p>
                  <h5 className="mt-3 text-3xl font-bold">{team.name}</h5>
                  <p className="mt-4 text-slate-300">{team.summary}</p>
                  <button
                    onClick={() => setActivePage(team.page)}
                    className="mt-6 w-full rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01]"
                  >
                    Open {team.name} Page
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSingleTeamPage = (teamName, teamStory) => {
    const squad = players.filter((player) => player.team === teamName);
    const teamRoles = squad.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {});

    return (
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-10 max-w-4xl">
          <button
            onClick={() => setActivePage("teams")}
            className="mb-6 rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/5"
          >
            Back to Teams
          </button>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Dedicated Team Page</p>
          <h3 className="mt-3 text-3xl font-bold md:text-5xl">{teamName}</h3>
          <p className="mt-4 text-slate-300">{teamStory}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <InfoCard label="Squad Size" value={squad.length} />
          <InfoCard label="Batsmen" value={teamRoles.Batsman || 0} />
          <InfoCard label="Allrounders / Bowlers" value={(teamRoles.Allrounder || 0) + (teamRoles.Bowler || 0)} />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {squad.map((player) => (
            <div
              key={`${player.team}-${player.name}`}
              className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl transition hover:-translate-y-1 hover:border-orange-400/30"
            >
              <div className="flex items-start gap-4">
                <img
                  src={player.image || "https://randomuser.me/api/portraits/men/1.jpg"}
                  alt={player.name}
                  className="h-14 w-14 rounded-full border border-white/10 object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white">{player.name}</h4>
                  <p className="mt-1 text-sm text-slate-400">{player.team}</p>
                </div>
                <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-200">
                  {player.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderPlayersPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
          Player Directory
        </p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">Player Information</h3>
        <p className="mt-4 text-slate-300">
          This page is fully dynamic. Every player card is created from your roster data, and future stats can be added player by player without changing the website structure.
        </p>
      </div>

      <div className="mb-8 grid gap-4 rounded-3xl border border-white/10 bg-slate-900 p-5 md:grid-cols-[1fr_220px]">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search player, role, or team"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400"
        />
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        >
          {teamOptions.map((team) => (
            <option key={team} value={team} className="bg-slate-900 text-white">
              {team}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex items-center justify-between text-sm text-slate-400">
        <span>Showing {filteredPlayers.length} players</span>
        <span>Season {season.year}</span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlayers.map((player) => (
          <div
            key={`${player.team}-${player.name}`}
            className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl transition hover:-translate-y-1 hover:border-orange-400/30"
          >
            <div className="flex items-start gap-4">
              <img
                src={player.image || "https://randomuser.me/api/portraits/men/1.jpg"}
                alt={player.name}
                className="h-14 w-14 rounded-full object-cover border border-white/10"
              />
              <div className="flex-1">
                <div>
                  <h4 className="text-xl font-bold text-white">{player.name}</h4>
                  <p className="mt-1 text-sm text-slate-400">{player.team}</p>
                </div>
              </div>
              <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-orange-200">
                {player.role}
              </span>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-slate-400">Role</p>
                <p className="mt-1 font-medium text-white">{player.role}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-slate-400">Team</p>
                <p className="mt-1 font-medium text-white">{player.team}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src={clubLogo} alt="ECC Logo" className="h-10 w-10 rounded-full" />
              <h1 className="text-2xl font-bold tracking-wide">ECC Club</h1>
            </div>
            <p className="text-sm text-slate-300">Dynamic club website · Season starts {season.start}</p>
          </div>

          <nav className="flex flex-wrap gap-3">
            <NavButton label="Home" isActive={activePage === "home"} onClick={() => setActivePage("home")} />
            <NavButton label="About ECC" isActive={activePage === "about"} onClick={() => setActivePage("about")} />
            <NavButton label="Tournaments" isActive={activePage === "tournaments"} onClick={() => setActivePage("tournaments")} />
            <NavButton label="Teams" isActive={activePage === "teams" || ["royals", "kurralu", "vikings"].includes(activePage)} onClick={() => setActivePage("teams")} />
            <NavButton label="Players" isActive={activePage === "players"} onClick={() => setActivePage("players")} />
          </nav>
        </div>
      </header>

      <main>
        {activePage === "home" && renderHomePage()}
        {activePage === "about" && renderAboutPage()}
        {activePage === "tournaments" && renderTournamentsPage()}
        {activePage === "teams" && renderTeamsPage()}
        {activePage === "royals" && renderSingleTeamPage("Royals", "Royals represent ECC with a composed and balanced squad, combining dependable batting depth with all-round contributions and disciplined bowling options.")}
        {activePage === "kurralu" && renderSingleTeamPage("Kurralu", "Kurralu bring energy, aggression, and flexibility to ECC’s campaign, featuring match-winners who can contribute in multiple phases of the game.")}
        {activePage === "vikings" && renderSingleTeamPage("Vikings", "Vikings are one of ECC’s competitive squads, built with strong all-round depth, impactful bowlers, and a dynamic batting lineup.")}
        {activePage === "bleedblue" && renderSingleTeamPage("BleedBlue", "BleedBlue represent ECC in the T7 format with fearless intent, quick impact players, and a fast-paced cricket identity.")}
        {activePage === "vajras" && renderSingleTeamPage("Vajras", "Vajras are one of ECC’s leather ball teams, built for strategic cricket, disciplined execution, and strong performances in longer formats.")}
        {activePage === "garudas" && renderSingleTeamPage("Garudas", "Garudas represent ECC in leather ball competition with balanced squad strength, endurance, and tactical depth across T20 and T40 matches.")}
        {activePage === "players" && renderPlayersPage()}
      </main>
    </div>
  );
}

function NavButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-orange-500 text-white shadow-lg"
          : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
      <div className="mb-3 h-10 w-10 rounded-2xl bg-white/10" />
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">Auto-generated from the current club roster.</p>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
