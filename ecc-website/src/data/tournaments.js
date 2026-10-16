export const tournaments = [
  {
    id: "t7",
    title: "T7 Tournaments",
    tag: "Sprint format",
    accent: "#e8b234",
    formats: ["7 overs per side", "7 players per team", "Short, intense matches"],
    teams: ["Kurralu", "BleedBlue"],
    events: [
      "Dublin Cricket League",
      "SWATS Cricket League",
      "TANA Tournament",
      "TACO Tournament",
      "CSK Amigos Tournament",
    ],
    description:
      "ECC actively competes in action-packed T7 tournaments where quick decisions, explosive batting, and aggressive bowling make every ball count.",
  },
  {
    id: "t15",
    title: "T15 Tournaments",
    tag: "Core format",
    accent: "#2ec4b6",
    formats: [
      "15 overs per side",
      "11 players per team",
      "Played on a full-sized cricket ground",
    ],
    teams: ["Royals", "Kurralu", "Vikings", "Sena"],
    events: [
      "Dublin Cricket League",
      "PDCC Cricket Tournament",
      "Columbus Cricket Tournament",
      "Dayton Premier League",
      "Cincinnati Premier League",
    ],
    description:
      "The T15 format blends tactical cricket with aggressive intent and remains one of ECC's strongest competitive platforms across Central Ohio.",
  },
  {
    id: "leather",
    title: "T20 & T40 Leather Ball",
    tag: "Long format",
    accent: "#f97316",
    formats: [
      "20 or 40 overs per side",
      "11 players per team",
      "Leather ball on a full cricket ground",
    ],
    teams: ["Vajras", "Garudas", "Rudras"],
    events: ["Midwest Cricket Tournament", "Dublin Premier League"],
    description:
      "These longer-format competitions test endurance, strategic planning, batting depth, bowling discipline, and overall team balance.",
  },
  {
    id: "women",
    title: "Women's Cricket",
    tag: "New in 2026",
    accent: "#a855f7",
    formats: [
      "Women's competition",
      "ECC's first women's team",
      "Debut season in 2026",
    ],
    teams: ["Fearless Femies"],
    events: ["TACO Women's Cricket"],
    description:
      "ECC entered women's cricket for the first time this year, with Fearless Femies taking part in TACO women's cricket.",
  },
];

/** Every distinct competition ECC enters, for the marquee strip. */
export const allEvents = [
  ...new Set(tournaments.flatMap((tournament) => tournament.events)),
];

export const cities = ["Columbus", "Dublin", "Dayton", "Cincinnati", "Westerville"];
