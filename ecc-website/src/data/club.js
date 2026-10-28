export const club = {
  shortName: "ECC",
  name: "Easton–Emeralds Cricket Club",
  tagline: "Central Ohio Cricket",
  founded: "Formed from the Easton and Emeralds cricket groups",
  base: "Columbus, Ohio",
  email: "eccevents.columbus@gmail.com",
  phone: "+1 872-216-6480",
  phoneHref: "tel:+18722166480",
  logo: "/ecc-logo.png",
};

/** Set to true to show the season schedule on the Home and Tournaments pages. */
export const showSchedule = false;

/** Set to true to show the Leadership nominations page and its links. */
export const showLeadership = false;

export const season = {
  year: 2026,
  start: "April 2026",
  startISO: "2026-04-01",
  label: "2026 Season",
};

export const formats = [
  {
    code: "T7",
    name: "Seven-over",
    overs: "7 overs",
    squad: "7 players",
    ball: "Tennis / tape ball",
    text: "Sprint cricket. Every ball is an event and a single over can decide the match.",
  },
  {
    code: "T15",
    name: "Fifteen-over",
    overs: "15 overs",
    squad: "11 players",
    ball: "Tennis / tape ball",
    text: "ECC's core competitive format — tactical cricket played at pace on full-sized grounds.",
  },
  {
    code: "T20",
    name: "Twenty-over",
    overs: "20 overs",
    squad: "11 players",
    ball: "Leather",
    text: "Leather ball cricket that rewards batting depth and disciplined bowling plans.",
  },
  {
    code: "T40",
    name: "Forty-over",
    overs: "40 overs",
    squad: "11 players",
    ball: "Leather",
    text: "The club's longest format — endurance, rotation, and patient match-building.",
  },
];

export const clubValues = [
  {
    title: "Competitive Cricket",
    text: "ECC fields teams across four formats and competes in leagues throughout Columbus, Dublin, Dayton and Cincinnati.",
  },
  {
    title: "Player Development",
    text: "Structured squads and multiple formats give players a real pathway from weekend cricket to leather ball competition.",
  },
  {
    title: "Community",
    text: "The club is a home for cricketers across Central Ohio — matches, events, and a group that turns up for each other.",
  },
  {
    title: "Long-Term Platform",
    text: "Records, rosters, and results in one place so the club's history is documented season after season.",
  },
];

export const timeline = [
  {
    period: "Origins",
    title: "Two clubs, one idea",
    text: "Easton and Emeralds were two passionate cricket groups in the Central Ohio community, competing separately across local leagues.",
  },
  {
    period: "The merger",
    title: "ECC is formed",
    text: "Players from both sides came together to form a single club with more depth, more formats, and a shared identity.",
  },
  {
    period: "Growth",
    title: "Nine teams, four formats",
    text: "ECC now runs T7, T15, leather ball and women's sides, taking part in tournaments across Columbus, Dublin, Dayton and Cincinnati.",
  },
  {
    period: `${season.year}`,
    title: "The season ahead",
    text: `Squads, leadership and fixtures for the ${season.year} campaign are taking shape ahead of a ${season.start} start.`,
  },
];

export const socialLinks = [
  {
    name: "Instagram",
    handle: "@eastoncricketclub",
    url: "https://instagram.com/eastoncricketclub",
    description:
      "Match posters, tournament highlights, player features, and club moments.",
    accent: "from-fuchsia-500/20 to-orange-400/20",
  },
  {
    name: "WhatsApp",
    handle: "ECC Family",
    url: "https://chat.whatsapp.com/LOCrGwxUvl28SGIZNi9AiM?mode=gi_t",
    description:
      "Quick team communication, tournament updates, and club announcements.",
    accent: "from-emerald-500/20 to-lime-400/20",
  },
  {
    name: "YouTube",
    handle: "ECC Sports Events",
    url: "https://www.youtube.com/@ECCSportsEvents",
    description:
      "Highlights, player interviews, tournament recaps, and club content.",
    accent: "from-red-500/20 to-orange-400/20",
  },
  {
    name: "Facebook",
    handle: "ECC Columbus",
    url: "https://www.facebook.com/share/g/1AskeBaJZM/",
    description:
      "Community updates, event promotions, and sponsor visibility posts.",
    accent: "from-sky-500/20 to-blue-400/20",
  },
];

export const fixtures = [
  {
    id: 1,
    competition: "Season Opener",
    opponent: "To be announced",
    date: "April 2026",
    venue: "Central Ohio",
    format: "T15",
    status: "Upcoming",
  },
  {
    id: 2,
    competition: "League Match",
    opponent: "To be announced",
    date: "April 2026",
    venue: "Central Ohio",
    format: "T7",
    status: "Upcoming",
  },
  {
    id: 3,
    competition: "League Match",
    opponent: "To be announced",
    date: "May 2026",
    venue: "Central Ohio",
    format: "T20",
    status: "Upcoming",
  },
];

export const sponsorTiers = [
  {
    name: "Jersey Sponsor",
    text: "Your brand on ECC match kit across every format, all season.",
    perks: ["Logo on playing kit", "Season-long visibility", "Team photo credit"],
  },
  {
    name: "Tournament Sponsor",
    text: "Presenting partner visibility at ECC-run and ECC-entered events.",
    perks: ["Event branding", "Announcer mentions", "Banner placement"],
  },
  {
    name: "Digital Partner",
    text: "Placement across ECC's social channels and match-day content.",
    perks: ["Social media features", "Match poster branding", "Highlight reel credit"],
  },
  {
    name: "Community Partner",
    text: "Support the club and reach the Central Ohio cricket community directly.",
    perks: ["Event booth space", "Newsletter mention", "Community goodwill"],
  },
];

export const joinCriteria = [
  "Commitment to team culture and discipline",
  "Interest in T7, T15, T20 or T40 cricket",
  "Availability for practice sessions and tournaments",
  "A positive attitude and willingness to grow with the club",
];

/** Current-season sponsors, shown on the Home and Sponsor pages. */
export const sponsors = [
  {
    name: "Supreme Fresh Halal Meat & Grocery",
    category: "Halal meat & grocery",
    logo: "/sponsors/supreme-fresh.webp",
    accent: "#2ec4b6",
    locations: [
      { label: "Polaris", address: "8635 Sancus Blvd, Columbus, OH 43240" },
      { label: "Dublin", address: "7416 Sawmill Rd, Columbus, OH 43235" },
    ],
  },
  {
    name: "Luna Pizza Worthington",
    category: "Pizza restaurant",
    logo: "/sponsors/luna-pizza.webp",
    logoBg: "#eadfd1",
    accent: "#f97316",
    locations: [
      { label: "Polaris", address: "150 Hutchinson Ave, Columbus, OH 43235" },
    ],
  },
  {
    name: "One Global Info Systems",
    category: "IT services",
    accent: "#7c5cff",
    locations: [
      { label: "Head office", address: "3030 Warrenville Rd, Lisle, IL 60532" },
    ],
  },
];
