/**
 * Team metadata. `slug` is used in routes (/teams/:slug) and to look up
 * accent colours for avatars, badges and team pages.
 */
export const teams = [
  {
    slug: "royals",
    name: "Royals",
    format: "T15",
    formats: ["T15"],
    accent: "#7c5cff",
    accentSoft: "rgba(124, 92, 255, 0.16)",
    summary:
      "A balanced unit built on composure, experience, and depth across batting and bowling.",
    story:
      "Royals represent ECC with a composed and balanced squad, combining dependable batting depth with all-round contributions and disciplined bowling options. The side leans on experience in the middle overs and has the flexibility to adapt its plans to conditions and opposition.",
    traits: ["Composed", "Deep batting", "Experienced core"],
  },
  {
    slug: "kurralu",
    name: "Kurralu",
    format: "T7 · T15",
    formats: ["T7", "T15"],
    accent: "#e8b234",
    accentSoft: "rgba(232, 178, 52, 0.16)",
    summary:
      "An energetic squad known for aggressive intent, all-round options, and dynamic matchups.",
    story:
      "Kurralu bring energy, aggression, and flexibility to ECC's campaign, featuring match-winners who can contribute in multiple phases of the game. The squad's all-round depth means it can be reshaped for the seven-over sprint or the longer fifteen-over contest without losing balance.",
    traits: ["Aggressive intent", "All-round depth", "Two formats"],
  },
  {
    slug: "vikings",
    name: "Vikings",
    format: "T15",
    formats: ["T15"],
    accent: "#2ec4b6",
    accentSoft: "rgba(46, 196, 182, 0.16)",
    summary:
      "A competitive side with strong all-rounders, impact bowlers, and attacking top-order options.",
    story:
      "Vikings are one of ECC's most competitive squads, built with strong all-round depth, impactful bowlers, and a dynamic batting lineup. The side is comfortable chasing or setting, and its bowling group has the variety to squeeze teams through the middle overs.",
    traits: ["Attacking top order", "Impact bowlers", "High energy"],
  },
  {
    slug: "sena",
    name: "Sena",
    format: "T15",
    formats: ["T15"],
    accent: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.16)",
    summary:
      "ECC's newest T15 side, bringing fresh energy and depth to the club's tennis ball cricket.",
    story:
      "Sena are the newest addition to ECC's fifteen-over line-up, giving more players a route into competitive tennis ball cricket. The squad is built around commitment and teamwork, and adds depth to ECC's presence across Central Ohio T15 tournaments.",
    traits: ["New squad", "Tennis ball", "Team first"],
  },
  {
    slug: "bleedblue",
    name: "BleedBlue",
    format: "T7",
    formats: ["T7"],
    accent: "#3b82f6",
    accentSoft: "rgba(59, 130, 246, 0.16)",
    summary:
      "A high-energy T7 side that represents ECC with intensity, quick impact, and attacking cricket.",
    story:
      "BleedBlue represent ECC in the T7 format with fearless intent, quick impact players, and a fast-paced cricket identity. In a format where a single over swings the result, the side backs aggression from ball one.",
    traits: ["Fearless", "Fast starts", "Sprint format"],
  },
  {
    slug: "vajras",
    name: "Vajras",
    format: "T20 · T40 Leather",
    formats: ["T20", "T40"],
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.16)",
    summary:
      "A leather ball unit representing ECC with structure, tactical discipline, and match endurance.",
    story:
      "Vajras are one of ECC's leather ball teams, built for strategic cricket, disciplined execution, and strong performances in longer formats. Leather ball cricket rewards patience and planning, and this squad is assembled around exactly that.",
    traits: ["Leather ball", "Tactical", "Endurance"],
  },
  {
    slug: "garudas",
    name: "Garudas",
    format: "T20 · T40 Leather",
    formats: ["T20", "T40"],
    accent: "#ef4444",
    accentSoft: "rgba(239, 68, 68, 0.16)",
    summary:
      "A strong ECC leather ball side focused on balance, control, and long-format competitiveness.",
    story:
      "Garudas represent ECC in leather ball competition with balanced squad strength, endurance, and tactical depth across T20 and T40 matches. Control with the ball and partnership building with the bat define how this side plays.",
    traits: ["Balanced", "Control", "Long format"],
  },
  {
    slug: "rudras",
    name: "Rudras",
    format: "T20 · T40 Leather",
    formats: ["T20", "T40"],
    accent: "#ec4899",
    accentSoft: "rgba(236, 72, 153, 0.16)",
    summary:
      "ECC's newest leather ball side, adding depth and fresh competition to the club's long-format cricket.",
    story:
      "Rudras are the latest ECC team to step into leather ball cricket, expanding the club's long-format presence alongside Vajras and Garudas. The squad is built on intent and discipline, giving more players a pathway into hard-ball competition.",
    traits: ["New squad", "Leather ball", "Intent"],
  },
  {
    slug: "fearless-femies",
    name: "Fearless Femies",
    format: "Women's",
    formats: ["Women's"],
    accent: "#a855f7",
    accentSoft: "rgba(168, 85, 247, 0.16)",
    summary:
      "ECC's first women's team, competing in TACO women's cricket from the 2026 season.",
    story:
      "Fearless Femies are ECC's first women's side, formed this year and representing the club in TACO women's cricket. The team marks a new chapter for ECC, opening the club to more players and building a home for women's cricket in Central Ohio.",
    traits: ["Women's cricket", "First season", "Fearless"],
  },
];

export const teamBySlug = Object.fromEntries(teams.map((t) => [t.slug, t]));
export const teamByName = Object.fromEntries(teams.map((t) => [t.name, t]));

/** Teams grouped by competition format, used on the Teams index page. */
export const teamGroups = [
  {
    id: "t7",
    format: "T7",
    title: "Seven-Over Teams",
    description:
      "Fast-paced 7-over sides built for explosive cricket and high-energy matches.",
    slugs: ["kurralu", "bleedblue"],
  },
  {
    id: "t15",
    format: "T15",
    title: "Fifteen-Over Teams",
    description:
      "ECC's core 15-over competition teams, competing across major Central Ohio tournaments.",
    slugs: ["royals", "kurralu", "vikings", "sena"],
  },
  {
    id: "leather",
    format: "T20 / T40",
    title: "Leather Ball Teams",
    description:
      "Longer-format ECC sides built for endurance, strategy, and leather ball competition.",
    slugs: ["vajras", "garudas", "rudras"],
  },
  {
    id: "women",
    format: "Women's",
    title: "Women's Team",
    description:
      "ECC's women's side, competing in TACO women's cricket from the 2026 season.",
    slugs: ["fearless-femies"],
  },
];

export function getTeamAccent(name) {
  return teamByName[name]?.accent ?? "#e8b234";
}
