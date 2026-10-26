/*
 * Cricket scoring engine.
 *
 * A match is stored as its setup plus a list of events. Everything you see
 * (score, batting and bowling cards, who is on strike, whose over it is) is
 * worked out from those events, so "undo" is just removing the last event and
 * the public scorecard always matches the scorer's phone exactly.
 *
 * Players are stored by their position in the team list to keep the data small.
 *
 * Events:
 *   ["s", striker, nonStriker, bowler]   start an innings (openers + opening bowler)
 *   ["o", bowler]                         bowler for a new over
 *   ["n", batter]                         new batter after a wicket
 *   ["x"]                                 swap strike by hand
 *   ["e"]                                 end the innings early
 *   ["b", runs, extra, extraRuns, wicket, outIndex, fielderIndex]   one delivery
 *       runs       runs off the bat (0 for wides, byes and leg byes)
 *       extra      "" | "wd" | "nb" | "b" | "lb"
 *       extraRuns  runs run (or boundary) on a wide, bye or leg bye,
 *                  or byes taken off a no-ball
 *       wicket     "" or a key of WICKETS
 *       outIndex   batter out (-1 = the striker)
 *       fielderIndex  catcher / keeper / thrower (-1 = none)
 *
 * Club rules: a wide or no-ball is 1 run and is bowled again. A no-ball gives
 * the batter a free hit on the next legal ball (it carries over a wide).
 */

export const WICKETS = {
  b: { label: "Bowled", bowler: true },
  c: { label: "Caught", bowler: true, fielder: true },
  lbw: { label: "LBW", bowler: true },
  st: { label: "Stumped", bowler: true, fielder: true },
  ro: { label: "Run out", fielder: true, either: true, runs: true },
  hw: { label: "Hit wicket", bowler: true },
  rt: { label: "Retired out", either: true },
};

/** Which dismissals are possible on this delivery. */
export function allowedWickets(extra, freeHit) {
  if (extra === "nb" || freeHit) return ["ro", "rt"];
  if (extra === "wd") return ["st", "ro", "hw", "rt"];
  if (extra === "b" || extra === "lb") return ["ro", "rt"];
  return Object.keys(WICKETS);
}

export const oversText = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;

function newInnings(m, index) {
  const bat = index === 0 ? m.battingFirst : 1 - m.battingFirst;
  return {
    index,
    bat,
    bowl: 1 - bat,
    runs: 0,
    wkts: 0,
    balls: 0,
    extras: { wd: 0, nb: 0, b: 0, lb: 0 },
    batters: [], // { p, r, b, f4, f6, out: null | { k, bowler, fielder } }
    bowlers: [], // { p, balls, runs, wkts, wd, nb, dots, maidens }
    fow: [], // { runs, wkts, balls, p }
    overs: [], // { bowler, balls: [label], runs, legal }
    striker: -1,
    nonStriker: -1,
    bowler: -1,
    lastBowler: -1,
    freeHit: false,
    closed: false,
    done: false,
    maxWkts: Math.max(1, (m.teams[bat]?.players?.length || 2) - 1),
  };
}

function batterOf(inn, p) {
  let row = inn.batters.find((x) => x.p === p);
  if (!row) {
    row = { p, r: 0, b: 0, f4: 0, f6: 0, out: null };
    inn.batters.push(row);
  }
  return row;
}

function bowlerOf(inn, p) {
  let row = inn.bowlers.find((x) => x.p === p);
  if (!row) {
    row = { p, balls: 0, runs: 0, wkts: 0, wd: 0, nb: 0, dots: 0, maidens: 0 };
    inn.bowlers.push(row);
  }
  return row;
}

function ballLabel(runs, extra, extraRuns, wicket) {
  let s;
  if (extra === "wd") s = extraRuns ? `${1 + extraRuns}wd` : "wd";
  else if (extra === "nb") s = runs ? `nb+${runs}` : extraRuns ? `nb+${extraRuns}b` : "nb";
  else if (extra === "b" || extra === "lb") s = `${extraRuns}${extra}`;
  else s = runs ? String(runs) : "•";
  if (wicket) s = s === "•" ? "W" : `${s} W`;
  return s;
}

function swap(inn) {
  const s = inn.striker;
  inn.striker = inn.nonStriker;
  inn.nonStriker = s;
}

function applyBall(m, inn, ev) {
  const [, runs = 0, extra = "", extraRuns = 0, wicket = "", outIndex = -1, fielder = -1] = ev;
  const legal = extra !== "wd" && extra !== "nb";
  const penalty = extra === "wd" || extra === "nb" ? 1 : 0;
  const total = runs + extraRuns + penalty;

  const striker = inn.striker >= 0 ? batterOf(inn, inn.striker) : null;
  const bowler = inn.bowler >= 0 ? bowlerOf(inn, inn.bowler) : null;
  let over = inn.overs[inn.overs.length - 1];
  if (!over || over.legal >= 6) {
    over = { bowler: inn.bowler, balls: [], runs: 0, legal: 0 };
    inn.overs.push(over);
  }

  // Batter
  if (striker) {
    if (extra !== "wd") striker.b += 1;
    if (extra === "" || extra === "nb") {
      striker.r += runs;
      if (runs === 4) striker.f4 += 1;
      if (runs === 6) striker.f6 += 1;
    }
  }

  // Bowler (byes and leg byes aren't charged to the bowler)
  const charged = runs + (extra === "wd" ? 1 + extraRuns : extra === "nb" ? 1 : 0);
  if (bowler) {
    bowler.runs += charged;
    if (extra === "wd") bowler.wd += 1;
    if (extra === "nb") bowler.nb += 1;
    if (legal) {
      bowler.balls += 1;
      if (total === 0) bowler.dots += 1;
    }
  }

  // Extras
  if (extra === "wd") inn.extras.wd += 1 + extraRuns;
  if (extra === "nb") {
    inn.extras.nb += 1;
    inn.extras.b += extraRuns;
  }
  if (extra === "b") inn.extras.b += extraRuns;
  if (extra === "lb") inn.extras.lb += extraRuns;

  inn.runs += total;
  over.runs += charged;
  if (legal) {
    inn.balls += 1;
    over.legal += 1;
  }
  over.balls.push(ballLabel(runs, extra, extraRuns, wicket));

  // Batters cross on an odd number of runs actually run
  const ran = extra === "wd" || extra === "b" || extra === "lb" ? extraRuns : runs + (extra === "nb" ? extraRuns : 0);
  if (ran % 2 === 1) swap(inn);

  // Wicket
  if (wicket && WICKETS[wicket]) {
    const outP = outIndex >= 0 ? outIndex : striker ? striker.p : -1;
    if (outP >= 0) {
      const row = batterOf(inn, outP);
      row.out = { k: wicket, bowler: WICKETS[wicket].bowler ? inn.bowler : -1, fielder };
      if (inn.striker === outP) inn.striker = -1;
      else if (inn.nonStriker === outP) inn.nonStriker = -1;
    }
    if (WICKETS[wicket].bowler && bowler) bowler.wkts += 1;
    inn.wkts += 1;
    inn.fow.push({ runs: inn.runs, wkts: inn.wkts, balls: inn.balls, p: outP });
  }

  // Free hit: set by a no-ball, used up by the next legal ball
  if (extra === "nb") inn.freeHit = true;
  else if (legal) inn.freeHit = false;

  // End of over
  if (legal && over.legal === 6) {
    if (bowler && over.runs === 0) bowler.maidens += 1;
    swap(inn);
    inn.lastBowler = inn.bowler;
    inn.bowler = -1;
  }
}

function checkDone(m, inn, target) {
  if (
    inn.closed ||
    inn.balls >= m.overs * 6 ||
    inn.wkts >= inn.maxWkts ||
    (target && inn.runs >= target)
  ) {
    inn.done = true;
  }
}

/**
 * Work out the full state of a match from its events.
 * Returns { innings, current, target, result, status, need }.
 *   status: "setup" | "live" | "break" | "done"
 *   need:   what the scorer must pick next: "openers" | "batter" | "bowler" | null
 */
export function computeMatch(m) {
  const innings = [];
  let inn = null;
  const events = Array.isArray(m?.events) ? m.events : [];
  for (const ev of events) {
    const kind = ev[0];
    if (kind === "s") {
      if (innings.length >= 2) continue;
      inn = newInnings(m, innings.length);
      innings.push(inn);
      inn.striker = ev[1];
      inn.nonStriker = ev[2];
      inn.bowler = ev[3];
      batterOf(inn, ev[1]);
      batterOf(inn, ev[2]);
      bowlerOf(inn, ev[3]);
      continue;
    }
    if (!inn || inn.done) continue;
    if (kind === "o") {
      inn.bowler = ev[1];
      bowlerOf(inn, ev[1]);
    } else if (kind === "n") {
      if (inn.striker < 0) inn.striker = ev[1];
      else if (inn.nonStriker < 0) inn.nonStriker = ev[1];
      batterOf(inn, ev[1]);
    } else if (kind === "x") {
      swap(inn);
    } else if (kind === "e") {
      inn.closed = true;
    } else if (kind === "b") {
      applyBall(m, inn, ev);
    }
    const target = inn.index === 1 ? innings[0].runs + 1 : 0;
    checkDone(m, inn, target);
  }

  const target = innings[0]?.done ? innings[0].runs + 1 : 0;
  let result = null;
  if (innings[1]?.done) {
    const [a, b] = innings;
    const teamName = (i) => m.teams[i]?.name || `Team ${i + 1}`;
    if (b.runs > a.runs) {
      const left = b.maxWkts - b.wkts;
      result = { winner: b.bat, text: `${teamName(b.bat)} won by ${left} wicket${left === 1 ? "" : "s"}` };
      const ballsLeft = m.overs * 6 - b.balls;
      if (ballsLeft > 0) result.text += ` (${ballsLeft} ball${ballsLeft === 1 ? "" : "s"} left)`;
    } else if (a.runs > b.runs) {
      const by = a.runs - b.runs;
      result = { winner: a.bat, text: `${teamName(a.bat)} won by ${by} run${by === 1 ? "" : "s"}` };
    } else {
      result = { winner: -1, text: "Match tied" };
    }
  }

  let status = "setup";
  let need = null;
  const current = innings[innings.length - 1] || null;
  if (result) status = "done";
  else if (!current) {
    need = "openers";
  } else if (current.done) {
    status = "break";
    need = "openers";
  } else {
    status = "live";
    if (current.striker < 0 || current.nonStriker < 0) need = "batter";
    else if (current.bowler < 0) need = "bowler";
  }

  return { innings, current, target, result, status, need };
}

/** Name helpers */
export const teamName = (m, i) => m.teams[i]?.name || `Team ${i + 1}`;

export const playerName = (m, team, p) => (p >= 0 ? m.teams[team]?.players?.[p] || "?" : "");

export function dismissalText(m, inn, row) {
  if (!row.out) return "not out";
  const bowl = (p) => playerName(m, inn.bowl, p);
  const { k, bowler, fielder } = row.out;
  if (k === "b") return `b ${bowl(bowler)}`;
  if (k === "c") return fielder >= 0 && fielder !== bowler ? `c ${bowl(fielder)} b ${bowl(bowler)}` : fielder === bowler ? `c & b ${bowl(bowler)}` : `c ? b ${bowl(bowler)}`;
  if (k === "lbw") return `lbw b ${bowl(bowler)}`;
  if (k === "st") return `st ${fielder >= 0 ? bowl(fielder) : "?"} b ${bowl(bowler)}`;
  if (k === "ro") return fielder >= 0 ? `run out (${bowl(fielder)})` : "run out";
  if (k === "hw") return `hit wicket b ${bowl(bowler)}`;
  if (k === "rt") return "retired out";
  return "out";
}

/** One line per innings for match lists, e.g. "Team 1  45/2 (4.3)". */
export function summarise(m) {
  const s = computeMatch(m);
  const name = (i) => m.teams[i]?.name || `Team ${i + 1}`;
  const lines = s.innings.map((inn) => ({
    team: name(inn.bat),
    score: `${inn.runs}/${inn.wkts}`,
    overs: oversText(inn.balls),
  }));
  let note = "";
  if (s.result) note = s.result.text;
  else if (s.status === "break") note = `${name(1 - s.innings[0].bat)} need ${s.target} to win`;
  else if (s.current?.index === 1) {
    const need = s.target - s.current.runs;
    const left = m.overs * 6 - s.current.balls;
    note = `${name(s.current.bat)} need ${need} from ${left} ball${left === 1 ? "" : "s"}`;
  } else if (!s.current && m.toss) {
    note = `${name(m.toss.winner)} won the toss and chose to ${m.toss.choice}`;
  }
  return {
    title: `${name(0)} v ${name(1)}`,
    ground: m.ground || "",
    status: s.status,
    lines,
    note,
  };
}
