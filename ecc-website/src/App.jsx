import { useMemo, useState } from "react";

export default function ECCClubWebsite() {
  const [activePage, setActivePage] = useState("home");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("batting");
  const [leadershipForm, setLeadershipForm] = useState({
    
    garudasCaptainNominee: "",
    garudasViceCaptainNominee: "",
    submitterName: "",
    submitterContact: "",
    submitterEmail: "",
    vajrasCaptainChange: "",
    vajrasCaptainNominee: "",
    vajrasViceCaptainChange: "",
    vajrasViceCaptainNominee: "",
    garudasCaptainInterested: "",
    garudasViceCaptainInterested: "",
  });
  const [leadershipErrors, setLeadershipErrors] = useState({});
  const [isSubmittingLeadership, setIsSubmittingLeadership] = useState(false);
  const socialLinks = [
    {
      name: "Instagram",
      handle: "@eastoncricketclub",
      url: "https://instagram.com/eastoncricketclub",
      description: "Match posters, tournament highlights, player features, and club moments.",
    },
    {
      name: "WhatsApp Community",
      handle: "ECC Family",
      url: "https://chat.whatsapp.com/LOCrGwxUvl28SGIZNi9AiM?mode=gi_t",
      description: "Quick team communication, tournament updates, and club announcements.",
    },
    {
      name: "YouTube",
      handle: "ECC Club Media",
      url: "https://www.youtube.com/@ECCSportsEvents",
      description: "Highlights, player interviews, tournament recap videos, and club content.",
    },
    {
      name: "Facebook",
      handle: "ECC Columbus",
      url: "https://www.facebook.com/share/g/1AskeBaJZM/",
      description: "Community updates, event promotions, and sponsor visibility posts.",
    },
  ];

  const season = {
    year: 2026,
    start: "April 2026",
  };

  const clubLogo = "/ecc-logo.jpg";
  const fallbackImage = "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80";

  const players = [
    {
      name: "Raavy",
      team: "Vikings",
      role: "Allrounder",
      image: fallbackImage,
      email: "raavy.pothela@gmail.com",
      phone: "6146799277",
      stats: {
        matches: 18,
        runs: 542,
        battingAverage: 38.7,
        strikeRate: 146.2,
        wickets: 19,
        bowlingEconomy: 6.4,
        bestBatting: "78*",
        bestBowling: "4/17",
        playerType: "Allrounder",
        battingStyle: "Right-hand batter",
        bowlingStyle: "Right-arm medium",
        nationality: "Indian",
        jerseyNo: 7,
        debutSeason: 2020,
        dateOfBirth: "31 January 1997",
        profileImage: fallbackImage,
        about:
          "Raavy is one of ECC Vikings' core all-rounders, known for high intent batting, smart game awareness, and dependable overs in pressure situations. He brings balance to the side and can shift momentum with both bat and ball.",
        seasonBatting: [
          { year: "Career", mat: 18, inns: 16, no: 3, runs: 542, hs: "78*", avg: 38.7, bf: 371, sr: 146.2, fifties: 4, fours: 46, sixes: 21, ct: 8 },
          { year: "2026", mat: 5, inns: 5, no: 1, runs: 162, hs: "61", avg: 40.5, bf: 102, sr: 158.8, fifties: 1, fours: 13, sixes: 8, ct: 2 },
          { year: "2025", mat: 7, inns: 6, no: 1, runs: 201, hs: "78*", avg: 40.2, bf: 143, sr: 140.5, fifties: 2, fours: 18, sixes: 7, ct: 3 },
          { year: "2024", mat: 6, inns: 5, no: 1, runs: 179, hs: "54", avg: 44.8, bf: 126, sr: 142.1, fifties: 1, fours: 15, sixes: 6, ct: 3 },
        ],
        seasonBowling: [
          { year: "Career", mat: 18, inns: 15, overs: 42, runs: 269, wkts: 19, bbi: "4/17", eco: 6.4 },
          { year: "2026", mat: 5, inns: 4, overs: 12, runs: 76, wkts: 6, bbi: "3/14", eco: 6.33 },
          { year: "2025", mat: 7, inns: 6, overs: 18, runs: 121, wkts: 8, bbi: "4/17", eco: 6.72 },
          { year: "2024", mat: 6, inns: 5, overs: 12, runs: 72, wkts: 5, bbi: "2/11", eco: 6.0 },
        ],
      },
    },
    { name: "Ajay", team: "Vikings", role: "Batsman", image: fallbackImage, email: "ajaymanyam007@gmail.com", phone: "9372516898" },
    { name: "Bala sai bharath raju Jayapathi", team: "Kurralu", role: "Batsman", image: fallbackImage, email: "bharathcrazy100@gmail.com", phone: "3802428816" },
    { name: "Balaji Maandapuram", team: "Kurralu", role: "Allrounder", image: fallbackImage, email: "balajimaandapuram@gmail.com", phone: "6145883018" },
    { name: "Jithendra Kumar Pedarla", team: "Kurralu", role: "Allrounder", image: fallbackImage, email: "jithendra.kumarb1@gmail.com", phone: "6145569893" },
    { name: "Likith Muddu Krishna", team: "Kurralu", role: "Allrounder", image: fallbackImage, email: "likithmk05@gmail.com", phone: "2164664608" },
    { name: "Sravan Kumar Tumu", team: "Kurralu", role: "Allrounder", image: fallbackImage, email: "sravantumu7@gmail.com", phone: "6144403016" },
    { name: "Santosh Bharadwaj", team: "Vikings", role: "Batsman", image: fallbackImage, email: "santoshbharadwaj17@gmail.com", phone: "9379561200" },
    { name: "Vishal", team: "Royals", role: "Allrounder", image: fallbackImage, email: "vishal123m@gmail.com", phone: "6185409935" },
    { name: "Srini Chinnakonda", team: "Royals", role: "Allrounder", image: fallbackImage, email: "ccsrinivasan1985@gmail.com", phone: "6145318606" },
    { name: "Nishanth", team: "Royals", role: "Batsman", image: fallbackImage, email: "nishanth.b1950@gmail.com", phone: "6163340822" },
    { name: "Aditya panchamukh Yalla", team: "Royals", role: "Allrounder", image: fallbackImage, email: "adityapanchamukh@gmail.com", phone: "5107668762" },
    { name: "Pk", team: "Kurralu", role: "Allrounder", image: fallbackImage, email: "pavankalyan.karimi@gmail.com", phone: "9373293514" },
    { name: "Adithya Radhakrishnan", team: "Kurralu", role: "Allrounder", image: fallbackImage, email: "adithya.rk24@gmail.com", phone: "9372517272" },
    { name: "Bobby", team: "Royals", role: "Batsman", image: fallbackImage, email: "babiadireddi@gmail.com", phone: "3127744025" },
    { name: "Shubhodeep Ghosh (Ronie)", team: "Royals", role: "Batsman", image: fallbackImage, email: "shubhodeep.ghosh.1704@gmail.com", phone: "6142606360" },
    { name: "Jayanth Buchala", team: "Vikings", role: "Allrounder", image: fallbackImage, email: "jayanth.buchala18@gmail.com", phone: "9373293653" },
    { name: "Mohithkumar Bolisetti", team: "Vikings", role: "Bowler", image: fallbackImage, email: "mohithkumar187@gmail.com", phone: "9372045257" },
    { name: "Saivishal Lingala", team: "Vikings", role: "Batsman", image: fallbackImage, email: "saivarunlingala37@gmail.com", phone: "6146224426" },
    { name: "Umesh", team: "Kurralu", role: "Batsman", image: fallbackImage, email: "umeford@gmail.com", phone: "8164896010" },
    { name: "Satwik Reddy", team: "Vikings", role: "Allrounder", image: fallbackImage, email: "saisatwik123456@gmail.com", phone: "9373210299" },
    { name: "Mahesh Mannam", team: "Royals", role: "Allrounder", image: fallbackImage, email: "srimahr@gmail.com", phone: "6146803804" },
    { name: "deepak", team: "Kurralu", role: "Allrounder", image: fallbackImage, email: "mdeepu3006@gmail.com", phone: "9373464673" },
    { name: "Ajit", team: "Vikings", role: "Batsman", image: fallbackImage, email: "dvajith04@gmail.com", phone: "9135531302" },
    { name: "Krishna Vamshi Dampuri", team: "Vikings", role: "Allrounder", image: fallbackImage, email: "krishnadampuri@gmail.com", phone: "9374769411" },
    { name: "Ram Mekala", team: "Royals", role: "Allrounder", image: fallbackImage, email: "ramchandar28790@gmail.com", phone: "6146957655" },
    { name: "Ramu", team: "Royals", role: "Allrounder", image: fallbackImage, email: "yadav.ramu@gmail.com", phone: "9403440807" },
    { name: "Sachin Kumar Pradhan", team: "Vikings", role: "Bowler", image: fallbackImage, email: "sachinkumarpradhan1123@gmail.com", phone: "6143841303" },
    { name: "Satya", team: "Vikings", role: "Batsman", image: fallbackImage, email: "sai.satyaprasanna@gmail.com", phone: "6145562947" },
    { name: "Naresh", team: "Royals", role: "Bowler", image: fallbackImage, email: "nkanyan1269@gmail.com", phone: "7085526517" },
    { name: "Kiran", team: "Royals", role: "Batsman", image: fallbackImage, email: "n.saikiran88@gmail.com", phone: "7814914191" },
    { name: "Aman Madathil", team: "Royals", role: "Batsman", image: fallbackImage, email: "amancs1729@gmail.com", phone: "8155643013" },
    { name: "Nithin", team: "Royals", role: "Bowler", image: fallbackImage, email: "shoponline448@gmail.com", phone: "4436913348" },
    { name: "Achutha Telluri", team: "Vikings", role: "Allrounder", image: fallbackImage, email: "achuthramireddy123@gmail.com", phone: "2037107221" },
    { name: "Satheesh Bommavaram", team: "Royals", role: "Batsman", image: fallbackImage, email: "satheeshrao777@gmail.com", phone: "8143845525" },
    { name: "Saumitra Kulkarni", team: "Vikings", role: "Batsman", image: fallbackImage, email: "kulkarni100mitra@gmail.com", phone: "9377893826" },
    { name: "Praveen K", team: "Vikings", role: "Batsman", image: fallbackImage, email: "ignoreemailfornnow@gmail.com", phone: "6144074302" },
    { name: "Vamsi Duggampudi", team: "Vikings", role: "Bowler", image: fallbackImage, email: "eccevents.columbus@gmail.com", phone: "8722166480" },
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
  }, [players, season.year]);

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

  const teamStories = {
    royals:
      "Royals represent ECC with a composed and balanced squad, combining dependable batting depth with all-round contributions and disciplined bowling options.",
    kurralu:
      "Kurralu bring energy, aggression, and flexibility to ECC’s campaign, featuring match-winners who can contribute in multiple phases of the game.",
    vikings:
      "Vikings are one of ECC’s competitive squads, built with strong all-round depth, impactful bowlers, and a dynamic batting lineup.",
    bleedblue:
      "BleedBlue represent ECC in the T7 format with fearless intent, quick impact players, and a fast-paced cricket identity.",
    vajras:
      "Vajras are one of ECC’s leather ball teams, built for strategic cricket, disciplined execution, and strong performances in longer formats.",
    garudas:
      "Garudas represent ECC in leather ball competition with balanced squad strength, endurance, and tactical depth across T20 and T40 matches.",
  };

  const renderHomePage = () => (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-blue-500/20" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-4 w-fit rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1 text-sm text-orange-200">
              Season starts {season.start}
            </span>
            <h2 className="text-4xl font-extrabold leading-tight md:text-6xl">Welcome to ECC Club</h2>
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Fixtures & Results</p>
            <h3 className="mt-3 text-3xl font-bold md:text-4xl">Featured on the first page</h3>
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
            ECC is a unified cricket club formed by bringing together players from the Easton and Emeralds teams, two passionate cricket groups in the Central Ohio cricket community.
          </p>
          <p>
            Over the years, ECC has evolved into a recognized cricket club in Central Ohio, participating in tournaments across Columbus, Dublin, Dayton, and Cincinnati.
          </p>
          <p>
            ECC focuses on competitive cricket, community engagement, player development, and building a long-term platform for growth.
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
          Team names are separated by format so visitors can clearly understand which ECC teams compete in T7, T15, and T20/T40 leather ball tournaments.
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
          {squad.length > 0 ? squad.map((player) => (
            <button
              key={`${player.team}-${player.name}`}
              onClick={() => {
                if (player.stats) {
                  setSelectedPlayer(player);
                  setActiveProfileTab("batting");
                }
              }}
              className="rounded-3xl border border-white/10 bg-slate-900 p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-orange-400/30"
            >
              <div className="flex items-start gap-4">
                <img
                  src={player.image || fallbackImage}
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

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {player.stats ? (
                  <>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-slate-400">Matches</p>
                      <p className="mt-1 font-semibold text-white">{player.stats.matches}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-slate-400">Runs</p>
                      <p className="mt-1 font-semibold text-white">{player.stats.runs}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-slate-400">Wickets</p>
                      <p className="mt-1 font-semibold text-white">{player.stats.wickets}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-slate-400">Strike Rate</p>
                      <p className="mt-1 font-semibold text-white">{player.stats.strikeRate}</p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-slate-400">
                    Stats can be added here later
                  </div>
                )}
              </div>
            </button>
          )) : (
            <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-slate-900 p-8 text-slate-300">
              Player roster for {teamName} can be added here.
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderPlayersPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Player Directory</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">Player Information</h3>
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlayers.map((player) => (
          <button
            key={`${player.team}-${player.name}`}
            onClick={() => {
              if (player.stats) {
                setSelectedPlayer(player);
                setActiveProfileTab("batting");
              }
            }}
            className="rounded-3xl border border-white/10 bg-slate-900 p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-orange-400/30"
          >
            <div className="flex items-start gap-4">
              <img
                src={player.image || fallbackImage}
                alt={player.name}
                className="h-14 w-14 rounded-full object-cover border border-white/10"
              />
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white">{player.name}</h4>
                <p className="mt-1 text-sm text-slate-400">{player.team}</p>
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
          </button>
        ))}
      </div>
    </section>
  );

  const updateLeadershipField = (field, value) => {
    setLeadershipForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "vajrasCaptainChange" && value !== "Yes" ? { vajrasCaptainNominee: "" } : {}),
      ...(field === "vajrasViceCaptainChange" && value !== "Yes" ? { vajrasViceCaptainNominee: "" } : {}),
      ...(field === "garudasCaptainInterested" && value !== "Yes" ? { garudasCaptainNominee: "" } : {}),
      ...(field === "garudasViceCaptainInterested" && value !== "Yes" ? { garudasViceCaptainNominee: "" } : {}),
    }));
  };

  const validateLeadershipForm = () => {
    const errors = {};
    const email = leadershipForm.submitterEmail.trim();
    const digitsOnlyContact = leadershipForm.submitterContact.split("").filter((ch) => ch >= "0" && ch <= "9").join("");

    if (!leadershipForm.submitterName.trim()) {
      errors.submitterName = "Name is required.";
    }

    if (!leadershipForm.submitterContact.trim()) {
      errors.submitterContact = "Contact number is required.";
    } else if (digitsOnlyContact.length < 10) {
      errors.submitterContact = "Enter a valid contact number.";
    }

    if (!email) {
      errors.submitterEmail = "Email is required.";
    } else if (!email.includes("@") || !email.includes(".")) {
      errors.submitterEmail = "Enter a valid email address.";
    }

    if (!leadershipForm.vajrasCaptainChange) {
      errors.vajrasCaptainChange = "Please select Yes or No.";
    }
    if (leadershipForm.vajrasCaptainChange === "Yes" && !leadershipForm.vajrasCaptainNominee.trim()) {
      errors.vajrasCaptainNominee = "Please nominate a captain.";
    }

    if (!leadershipForm.vajrasViceCaptainChange) {
      errors.vajrasViceCaptainChange = "Please select Yes or No.";
    }
    if (leadershipForm.vajrasViceCaptainChange === "Yes" && !leadershipForm.vajrasViceCaptainNominee.trim()) {
      errors.vajrasViceCaptainNominee = "Please nominate a vice captain.";
    }

    if (!leadershipForm.garudasCaptainInterested) {
      errors.garudasCaptainInterested = "Please select Yes or No.";
    }
    if (leadershipForm.garudasCaptainInterested === "Yes" && !leadershipForm.garudasCaptainNominee.trim()) {
      errors.garudasCaptainNominee = "Please nominate Garudas captain.";
    }

    if (!leadershipForm.garudasViceCaptainInterested) {
      errors.garudasViceCaptainInterested = "Please select Yes or No.";
    }
    if (leadershipForm.garudasViceCaptainInterested === "Yes" && !leadershipForm.garudasViceCaptainNominee.trim()) {
      errors.garudasViceCaptainNominee = "Please nominate Garudas vice captain.";
    }

    setLeadershipErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLeadershipSubmit = async () => {
    if (!validateLeadershipForm()) {
      return;
    }

    setIsSubmittingLeadership(true);

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbziWvPSEJ2SP7wtQV_306-9HjyT-1Hnu6ne2M67QsCGVZQg78JoxF7kCm3l2UNNTjk1oA/exec", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(leadershipForm),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("Leadership form submitted successfully!");
        setLeadershipForm({
          garudasCaptainNominee: "",
          garudasViceCaptainNominee: "",
          submitterName: "",
          submitterContact: "",
          submitterEmail: "",
          vajrasCaptainChange: "",
          vajrasCaptainNominee: "",
          vajrasViceCaptainChange: "",
          vajrasViceCaptainNominee: "",
          garudasCaptainInterested: "",
          garudasViceCaptainInterested: "",
        });
        setLeadershipErrors({});
      } else {
        alert("Something went wrong while submitting the form.");
      }
    } catch (error) {
      console.error(error);
      alert("Submission failed.");
    } finally {
      setIsSubmittingLeadership(false);
    }
  };

  const renderLeadershipPage = () => (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Leadership Page</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">ECC Leadership</h3>
        <p className="mt-4 text-slate-300">
          This Page is used to nominate the Captain and Vice Captain for ECC Vajras and ECC Garudas for the 2026 season. If you feel a leadership change is needed, you can nominate yourself or recommend a player you believe is best suited for the role.

Your input is valuable in helping us identify strong leaders who can represent the team, support players, and drive us toward success this season.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Submitted By</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <input
                type="text"
                value={leadershipForm.submitterName}
                onChange={(e) => updateLeadershipField('submitterName', e.target.value)}
                placeholder="Name"
                className={`w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 ${leadershipErrors.submitterName ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
              />
              {leadershipErrors.submitterName && (
                <p className="mt-2 text-sm text-red-300">{leadershipErrors.submitterName}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                value={leadershipForm.submitterContact}
                onChange={(e) => updateLeadershipField('submitterContact', e.target.value)}
                placeholder="Contact"
                className={`w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 ${leadershipErrors.submitterContact ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
              />
              {leadershipErrors.submitterContact && (
                <p className="mt-2 text-sm text-red-300">{leadershipErrors.submitterContact}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                value={leadershipForm.submitterEmail}
                onChange={(e) => updateLeadershipField('submitterEmail', e.target.value)}
                placeholder="Email"
                className={`w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 ${leadershipErrors.submitterEmail ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
              />
              {leadershipErrors.submitterEmail && (
                <p className="mt-2 text-sm text-red-300">{leadershipErrors.submitterEmail}</p>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Section 1</p>
          <h4 className="mt-2 text-2xl font-bold text-white">Vajras Leadership</h4>

          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white">Vajras Captaincy-Change from last year</label>
              <div className="mt-3 flex gap-3">
                {['Yes', 'No'].map((option) => {
                  const active = leadershipForm.vajrasCaptainChange === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateLeadershipField('vajrasCaptainChange', option)}
                      className={active ? 'rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition' : `rounded-2xl border px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 ${leadershipErrors.vajrasCaptainChange ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {leadershipErrors.vajrasCaptainChange && (
                <p className="mt-2 text-sm text-red-300">{leadershipErrors.vajrasCaptainChange}</p>
              )}
              {leadershipForm.vajrasCaptainChange === 'Yes' && (
                <div>
                  <input
                    type="text"
                    value={leadershipForm.vajrasCaptainNominee}
                    onChange={(e) => updateLeadershipField('vajrasCaptainNominee', e.target.value)}
                    placeholder="Nominate Vajras Captain"
                    className={`mt-4 w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 ${leadershipErrors.vajrasCaptainNominee ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
                  />
                  {leadershipErrors.vajrasCaptainNominee && (
                    <p className="mt-2 text-sm text-red-300">{leadershipErrors.vajrasCaptainNominee}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white">Vajras Vice Captaincy-Change from last year</label>
              <div className="mt-3 flex gap-3">
                {['Yes', 'No'].map((option) => {
                  const active = leadershipForm.vajrasViceCaptainChange === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateLeadershipField('vajrasViceCaptainChange', option)}
                      className={active ? 'rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition' : `rounded-2xl border px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 ${leadershipErrors.vajrasViceCaptainChange ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {leadershipErrors.vajrasViceCaptainChange && (
                <p className="mt-2 text-sm text-red-300">{leadershipErrors.vajrasViceCaptainChange}</p>
              )}
              {leadershipForm.vajrasViceCaptainChange === 'Yes' && (
                <div>
                  <input
                    type="text"
                    value={leadershipForm.vajrasViceCaptainNominee}
                    onChange={(e) => updateLeadershipField('vajrasViceCaptainNominee', e.target.value)}
                    placeholder="Nominate Vajras VC"
                    className={`mt-4 w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 ${leadershipErrors.vajrasViceCaptainNominee ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
                  />
                  {leadershipErrors.vajrasViceCaptainNominee && (
                    <p className="mt-2 text-sm text-red-300">{leadershipErrors.vajrasViceCaptainNominee}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Section 2</p>
          <h4 className="mt-2 text-2xl font-bold text-white">Garudas Leadership</h4>

          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white">Garudas Captaincy-Change from Last Year</label>
              <div className="mt-3 flex gap-3">
                {['Yes', 'No'].map((option) => {
                  const active = leadershipForm.garudasCaptainInterested === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateLeadershipField('garudasCaptainInterested', option)}
                      className={active ? 'rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition' : `rounded-2xl border px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 ${leadershipErrors.garudasCaptainInterested ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {leadershipErrors.garudasCaptainInterested && (
                <p className="mt-2 text-sm text-red-300">{leadershipErrors.garudasCaptainInterested}</p>
              )}
              {leadershipForm.garudasCaptainInterested === 'Yes' && (
                <div>
                  <input
                    type="text"
                    value={leadershipForm.garudasCaptainNominee}
                    onChange={(e) => updateLeadershipField('garudasCaptainNominee', e.target.value)}
                    placeholder="Nominate Garudas Captain"
                    className={`mt-4 w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 ${leadershipErrors.garudasCaptainNominee ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
                  />
                  {leadershipErrors.garudasCaptainNominee && (
                    <p className="mt-2 text-sm text-red-300">{leadershipErrors.garudasCaptainNominee}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white">Garudas Vice Captaincy – Change from Last Year</label>
              <div className="mt-3 flex gap-3">
                {['Yes', 'No'].map((option) => {
                  const active = leadershipForm.garudasViceCaptainInterested === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateLeadershipField('garudasViceCaptainInterested', option)}
                      className={active ? 'rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition' : `rounded-2xl border px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 ${leadershipErrors.garudasViceCaptainInterested ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {leadershipErrors.garudasViceCaptainInterested && (
                <p className="mt-2 text-sm text-red-300">{leadershipErrors.garudasViceCaptainInterested}</p>
              )}
              {leadershipForm.garudasViceCaptainInterested === 'Yes' && (
                <div>
                  <input
                    type="text"
                    value={leadershipForm.garudasViceCaptainNominee}
                    onChange={(e) => updateLeadershipField('garudasViceCaptainNominee', e.target.value)}
                    placeholder="Nominate Garudas VC"
                    className={`mt-4 w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 ${leadershipErrors.garudasViceCaptainNominee ? 'border-red-400 bg-red-500/10' : 'border-white/10 bg-white/5'}`}
                  />
                  {leadershipErrors.garudasViceCaptainNominee && (
                    <p className="mt-2 text-sm text-red-300">{leadershipErrors.garudasViceCaptainNominee}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLeadershipSubmit}
            disabled={isSubmittingLeadership}
            className="mt-8 w-full rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmittingLeadership ? "Submitting..." : "Submit Leadership Form"}
          </button>
        </div>
      </div>
    </section>
  );

  const renderSocialPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Social Media</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">Stay Connected With ECC</h3>
        <p className="mt-4 text-slate-300">
          Follow ECC across social platforms for tournament news, player announcements, match-day posters, sponsor collaborations, and club updates.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {socialLinks.map((item) => (
          <div key={item.name} className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-300">{item.name}</p>
            <h4 className="mt-3 text-2xl font-bold text-white">{item.handle}</h4>
            <p className="mt-4 text-slate-300">{item.description}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01]"
            >
              Open {item.name}
            </a>
          </div>
        ))}
      </div>
    </section>
  );

  const renderContactPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Contact ECC</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">Let’s Connect With ECC</h3>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Quick Actions</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <button
              onClick={() => setActivePage("social")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <p className="text-lg font-bold text-white">Social Media Page</p>
              <p className="mt-2 text-sm text-slate-300">View ECC social platforms and public club presence.</p>
            </button>
            <button
              onClick={() => setActivePage("sponsor")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <p className="text-lg font-bold text-white">Sponsor Enquiry</p>
              <p className="mt-2 text-sm text-slate-300">Let brands and partners reach ECC for sponsorship opportunities.</p>
            </button>
            <button
              onClick={() => setActivePage("register")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <p className="text-lg font-bold text-white">Player Registration</p>
              <p className="mt-2 text-sm text-slate-300">Allow interested players to submit interest and playing details.</p>
            </button>
            
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">General Contact</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Club Contact</p>
              <p className="mt-1 font-semibold text-white">ECC Admin</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Email</p>
              <a href="mailto:eccevents.columbus@gmail.com" className="mt-1 block font-semibold text-white hover:text-orange-300">
                eccevents.columbus@gmail.com
              </a>
            </div>
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Phone</p>
              <a href="tel:+18722166480" className="mt-1 block font-semibold text-white hover:text-orange-300">
                +1 872-216-6480
              </a>
            </div>
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Location</p>
              <p className="mt-1 font-semibold text-white">Columbus, Ohio</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Contact Form</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your Name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <input type="email" placeholder="Your Email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <textarea rows="5" placeholder="Your Message" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <button type="submit" className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01]">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );

  const renderSponsorPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Sponsor Enquiry</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">Partner With ECC</h3>
        <p className="mt-4 text-slate-300">
          ECC welcomes brands, businesses, and community partners who want visibility through tournaments, jerseys, digital promotions, and event branding.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Why Sponsor ECC</p>
          <div className="mt-6 space-y-4 text-slate-300">
            <div className="rounded-2xl bg-white/5 p-4">Tournament branding and digital visibility</div>
            <div className="rounded-2xl bg-white/5 p-4">Jersey, flyer, and social media promotion</div>
            <div className="rounded-2xl bg-white/5 p-4">Community engagement in Central Ohio</div>
            <div className="rounded-2xl bg-white/5 p-4">Event booth and collaborative promotional opportunities</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Sponsor Form</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Business / Sponsor Name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <input type="text" placeholder="Contact Person" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <input type="email" placeholder="Business Email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <input type="text" placeholder="Phone Number" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
              <option className="bg-slate-900 text-white">Interested Sponsorship Type</option>
              <option className="bg-slate-900 text-white">Jersey Sponsor</option>
              <option className="bg-slate-900 text-white">Tournament Sponsor</option>
              <option className="bg-slate-900 text-white">Digital / Social Media Sponsor</option>
              <option className="bg-slate-900 text-white">Event Sponsor</option>
            </select>
            <textarea rows="5" placeholder="Tell us about your sponsorship interest" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <button type="submit" className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01]">
              Submit Sponsor Enquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  );

  const renderRegistrationPage = () => (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Player Registration</p>
        <h3 className="mt-3 text-3xl font-bold md:text-5xl">Join ECC</h3>
        <p className="mt-4 text-slate-300">
          Interested players can use this registration form to share their details, preferred role, playing format, and availability for the upcoming season.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">What We Look For</p>
          <div className="mt-6 space-y-4 text-slate-300">
            <div className="rounded-2xl bg-white/5 p-4">Commitment to team culture and discipline</div>
            <div className="rounded-2xl bg-white/5 p-4">Interest in T7, T15, T20, or T40 formats</div>
            <div className="rounded-2xl bg-white/5 p-4">Availability for practice sessions and tournaments</div>
            <div className="rounded-2xl bg-white/5 p-4">Positive attitude and willingness to grow with ECC</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Registration Form</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Full Name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <input type="email" placeholder="Email Address" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <input type="text" placeholder="Phone Number" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
              <option className="bg-slate-900 text-white">Preferred Role</option>
              <option className="bg-slate-900 text-white">Batsman</option>
              <option className="bg-slate-900 text-white">Bowler</option>
              <option className="bg-slate-900 text-white">Allrounder</option>
              <option className="bg-slate-900 text-white">Wicket Keeper</option>
            </select>
            <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
              <option className="bg-slate-900 text-white">Preferred Format</option>
              <option className="bg-slate-900 text-white">T7</option>
              <option className="bg-slate-900 text-white">T15</option>
              <option className="bg-slate-900 text-white">T20</option>
              <option className="bg-slate-900 text-white">T40</option>
            </select>
            <textarea rows="5" placeholder="Tell us about your cricket experience and availability" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400" />
            <button type="submit" className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01]">
              Submit Registration
            </button>
          </form>
        </div>
      </div>
    </section>
  );

  const renderActivePage = () => {
    if (selectedPlayer) {
      return (
        <PlayerProfilePage
          player={selectedPlayer}
          activeTab={activeProfileTab}
          setActiveTab={setActiveProfileTab}
          onBack={() => {
            setSelectedPlayer(null);
            setActivePage("players");
          }}
        />
      );
    }

    if (activePage === "home") return renderHomePage();
    if (activePage === "about") return renderAboutPage();
    if (activePage === "tournaments") return renderTournamentsPage();
    if (activePage === "teams") return renderTeamsPage();
    if (activePage === "players") return renderPlayersPage();
    if (activePage === "social") return renderSocialPage();
    if (activePage === "sponsor") return renderSponsorPage();
    if (activePage === "register") return renderRegistrationPage();
    if (activePage === "leadership") return renderLeadershipPage();
    if (activePage === "contact") return renderContactPage();
    if (teamStories[activePage]) return renderSingleTeamPage(activePage.charAt(0).toUpperCase() + activePage.slice(1), teamStories[activePage]);
    return renderHomePage();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src={clubLogo} alt="ECC Logo" className="h-10 w-10 rounded-full object-cover" />
              <h1 className="text-2xl font-bold tracking-wide">ECC Club</h1>
            </div>
            <p className="text-sm text-slate-300">Dynamic club website · Season starts {season.start}</p>
          </div>

          <nav className="flex flex-wrap gap-3">
            <NavButton label="Home" isActive={activePage === "home" && !selectedPlayer} onClick={() => { setSelectedPlayer(null); setActivePage("home"); }} />
            <NavButton label="About ECC" isActive={activePage === "about" && !selectedPlayer} onClick={() => { setSelectedPlayer(null); setActivePage("about"); }} />
            <NavButton label="Tournaments" isActive={activePage === "tournaments" && !selectedPlayer} onClick={() => { setSelectedPlayer(null); setActivePage("tournaments"); }} />
            <NavButton label="Teams" isActive={(activePage === "teams" || Object.keys(teamStories).includes(activePage)) && !selectedPlayer} onClick={() => { setSelectedPlayer(null); setActivePage("teams"); }} />
            <NavButton label="Players" isActive={activePage === "players" && !selectedPlayer} onClick={() => { setSelectedPlayer(null); setActivePage("players"); }} />
            <NavButton label="Leadership" isActive={activePage === "leadership" && !selectedPlayer} onClick={() => { setSelectedPlayer(null); setActivePage("leadership"); }} />
            <NavButton label="Contact" isActive={activePage === "contact" && !selectedPlayer} onClick={() => { setSelectedPlayer(null); setActivePage("contact"); }} />
          </nav>
        </div>
      </header>

      <main>{renderActivePage()}</main>
    </div>
  );
}

function NavButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
        isActive ? "bg-orange-500 text-white shadow-lg" : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
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

function PlayerProfilePage({ player, activeTab, setActiveTab, onBack }) {
  const summaryCards = [
    { value: player.stats.debutSeason, label: "ECC Debut" },
    { value: player.stats.playerType, label: "Specialization" },
    { value: player.stats.dateOfBirth, label: "Date of Birth" },
    { value: player.stats.matches, label: "Matches" },
  ];

  const tabs = [
    { key: "batting", label: "Batting" },
    { key: "bowling", label: "Bowling" },
    { key: "about", label: "About" },
  ];

  return (
    <section className="bg-slate-100 text-slate-900">
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white">
        <div className="relative mx-auto max-w-7xl px-6 py-8 md:py-12">
          <button onClick={onBack} className="mb-6 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
            ← Back to Players
          </button>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="grid gap-8 md:grid-cols-[300px_1fr] md:items-end">
              <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-orange-300/20 to-transparent p-4">
                <img src={player.stats.profileImage || player.image} alt={player.name} className="relative mx-auto h-[360px] w-full object-cover object-top" />
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-orange-300">ECC {player.team}</p>
                <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">{player.name}</h1>
                <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
                  <span className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2">{player.stats.nationality}</span>
                  <span className="rounded-2xl border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-orange-200">Jersey #{player.stats.jerseyNo}</span>
                  <span className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2">{player.role}</span>
                </div>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">{player.stats.about}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur">
              {summaryCards.map((item, index) => (
                <div key={item.label} className={`border-white/10 p-6 md:p-8 ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b" : ""}`}>
                  <p className="text-3xl font-bold text-white md:text-4xl">{item.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-6 max-w-7xl px-6">
        <div className="inline-flex flex-wrap rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${activeTab === tab.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        {activeTab === "about" && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold">About</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{player.stats.about}</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold">Player Overview</h3>
              <div className="mt-6 space-y-4 text-slate-700">
                <OverviewRow label="Batting Style" value={player.stats.battingStyle} />
                <OverviewRow label="Bowling Style" value={player.stats.bowlingStyle} />
                <OverviewRow label="Specialization" value={player.stats.playerType} />
                <OverviewRow label="Best Batting" value={player.stats.bestBatting} />
                <OverviewRow label="Best Bowling" value={player.stats.bestBowling} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "batting" && (
          <StatsTable
            title="Batting & Fielding Stats"
            columns={["Year", "MAT", "INNS", "NO", "RUNS", "HS", "AVG", "BF", "SR", "50", "4S", "6S", "CT"]}
            rows={player.stats.seasonBatting.map((row) => [row.year, row.mat, row.inns, row.no, row.runs, row.hs, row.avg, row.bf, row.sr, row.fifties, row.fours, row.sixes, row.ct])}
          />
        )}

        {activeTab === "bowling" && (
          <StatsTable
            title="Bowling Stats"
            columns={["Year", "MAT", "INNS", "OVERS", "RUNS", "WKTS", "BBI", "ECO"]}
            rows={player.stats.seasonBowling.map((row) => [row.year, row.mat, row.inns, row.overs, row.runs, row.wkts, row.bbi, row.eco])}
          />
        )}
      </div>
    </section>
  );
}

function OverviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-5 py-4">
      <span className="text-sm uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function StatsTable({ title, columns, rows }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-8 py-6">
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] whitespace-nowrap">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-200 even:bg-slate-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={`px-6 py-5 whitespace-nowrap ${cellIndex === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
