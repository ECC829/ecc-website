/**
 * ECC internal tournament (end of October 2026).
 * Set `show` to false to hide the page, the menu link and the homepage banner.
 */
export const internalTournament = {
  show: true,
  /** Show the "Who's signed up" list (first name + last initial only). */
  showPlayerNames: true,
  name: "ECC Internal T7 Tournament",
  shortName: "Internal Tournament",
  year: 2026,
  dateLabel: "Sat Oct 31 or Sun Nov 1",
  dateNote: "Final date to be confirmed",
  dateOptions: ["Sat Oct 31", "Sun Nov 1", "Either day"],
  format: "T7",
  playersPerTeam: 7,
  playersToBuy: 6,
  captainPoints: 60,
  auctionClock: "1 min 30 sec",
  lateBidWindow: "last 10 seconds",
  extension: "30 sec",
  maxExtensions: 3,
};

const t = internalTournament;

/** The four stages, in order. */
export const tournamentSteps = [
  {
    title: "Sign up",
    text: "Every interested ECC player signs up for the tournament. If you'd like to captain a side, tick the captain box when you sign up.",
  },
  {
    title: "Teams are set",
    text: `The number of teams depends on how many people sign up, with ${t.playersPerTeam} players per team. For example, 70 sign-ups means 10 teams of ${t.playersPerTeam}.`,
  },
  {
    title: "Captains by lottery",
    text: "Players who nominate themselves as captain go into a lottery, and the captains are drawn from it — one per team.",
  },
  {
    title: "Player auction",
    text: `All other players go into one pool. Each captain gets ${t.captainPoints} points to buy ${t.playersToBuy} players and complete a ${t.playersPerTeam}-player squad.`,
  },
];

/** Auction rules, shown as a checklist. */
export const auctionRules = [
  `Every player who isn't a captain goes into the auction pool.`,
  `Each captain starts with ${t.captainPoints} points.`,
  `Each captain must buy ${t.playersToBuy} players, so every team has ${t.playersPerTeam} including the captain.`,
  `Bidding on each player runs for ${t.auctionClock}.`,
  `A bid in the ${t.lateBidWindow} adds another ${t.extension} to the clock.`,
  `The clock can be extended up to ${t.maxExtensions} times per player. After that, the highest bid wins.`,
];
