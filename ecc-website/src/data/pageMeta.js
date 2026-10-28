import { teams } from "./teams.js";

/**
 * Link-preview text and images for each page (WhatsApp, iMessage, Facebook…).
 * Used at build time (scripts/build-meta.mjs writes one HTML file per page)
 * and in the browser to set the tab title.
 */
export const SITE_URL = "https://eccohiosports.com";
export const SITE_NAME = "ECC · Easton–Emeralds Cricket Club";

const img = (name) => `${SITE_URL}/og/${name}.jpg`;

export const pageMeta = {
  "/": {
    title: "ECC · Easton–Emeralds Cricket Club",
    description: "Nine teams. Four formats. One club. Central Ohio cricket across T7, T15, T20 and T40.",
    image: img("home"),
  },
  "/internal-tournament": {
    title: "ECC Internal T7 Tournament · Saturday, Oct 31",
    description: "Saturday, Oct 31 — 10 teams of 8, picked in the player auction. See the squads.",
    image: img("internal-tournament"),
  },
  "/captain-draw": {
    title: "The Captain Draw · ECC Internal T7",
    description: "Watch the captains for the ECC Internal T7 Tournament drawn live — one per team.",
    image: img("captain-draw"),
  },
  "/auction": {
    title: "The Player Auction · ECC Internal T7",
    description: "Live player auction — 70-point purses, a 1:30 clock and every bid on the big screen.",
    image: img("auction"),
  },
  "/league": {
    title: "SupremeFresh Presents Easton Premier League · ECC",
    description: "Results, fixtures, points table and player stats for the SupremeFresh Presents Easton Premier League, live on CricClubs.",
    image: img("league"),
  },
  "/achievements": {
    title: "ECC Achievements · Trophy cabinet",
    description: "Titles and finals from ECC sides across Central Ohio — see the trophy photos.",
    image: img("achievements"),
  },
  "/teams": {
    title: "ECC Teams",
    description: "Meet the nine ECC squads — tennis ball, leather ball and women's cricket.",
    image: img("teams"),
  },
  "/tournaments": {
    title: "ECC Tournaments",
    description: "T7, T15, T20 and T40 cricket across Columbus, Dublin, Dayton and Cincinnati.",
    image: img("tournaments"),
  },
  "/players": {
    title: "ECC Players",
    description: "The players who represent Easton–Emeralds Cricket Club.",
    image: img("teams"),
  },
  "/about": {
    title: "About ECC",
    description: "One club formed from two Central Ohio cricket groups.",
    image: img("home"),
  },
  "/sponsor": {
    title: "Sponsor ECC",
    description: "Partner with ECC — jerseys, tournaments, digital and community sponsorship.",
    image: img("home"),
  },
  "/register": {
    title: "Play for ECC",
    description: "Register your interest in playing for Easton–Emeralds Cricket Club.",
    image: img("home"),
  },
  "/contact": {
    title: "Contact ECC",
    description: "Get in touch with Easton–Emeralds Cricket Club.",
    image: img("home"),
  },
  ...Object.fromEntries(
    teams.map((team) => [
      `/teams/${team.slug}`,
      {
        title: `${team.name} · ECC (${team.format})`,
        description: team.summary,
        image: img("teams"),
      },
    ])
  ),
};

export function metaFor(path) {
  return pageMeta[path] ?? pageMeta["/"];
}
