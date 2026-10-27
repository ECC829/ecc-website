/*
 * Lot order for the player auction.
 *
 * By default players come up in random order. Optionally, the organiser can
 * list some players to be spread through the auction: the order is split into
 * sets (players 1–20, 21–40, 41–60, 61+) and those players are placed at random
 * positions inside the sets — 2, 3, 3 and 3 of them for a list of 11, or the
 * same proportions for other list sizes — never two in a row. Everyone else
 * fills the remaining positions in random order.
 */

const SET_BOUNDS = [20, 40, 60];
const WEIGHTS = [2, 3, 3, 3];

// Lower-case, no dots/commas, no invisible characters (WhatsApp and
// spreadsheets often add them when copying), single spaces.
const normalise = (name) =>
  String(name)
    .normalize("NFKC")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, "")
    .toLowerCase()
    .replace(/[.,;:'"()\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const words = (name) => normalise(name).split(" ").filter(Boolean);

/**
 * Same person, allowing short forms: "Teja" ~ "Teja Naidu",
 * "Kishore Y" ~ "Kishore Yadav", "Bala Jayapathi" ~ "Bala Sai Bharath Raju Jayapathi".
 * The first name must match; every other word typed must start a word of the
 * pool name (in order).
 */
function looselySame(typed, pool) {
  const a = words(typed);
  const b = words(pool);
  if (!a.length || !b.length || a[0] !== b[0]) return false;
  let j = 1;
  for (let i = 1; i < a.length; i++) {
    while (j < b.length && !b[j].startsWith(a[i])) j++;
    if (j >= b.length) return false;
    j++;
  }
  return true;
}

/**
 * Match each typed name to one player in the pool.
 * Exact matches win; otherwise a short form must point to exactly one player.
 * Returns { matched: [{ typed, player }], missing: [typed], ambiguous: [{ typed, options }] }.
 */
export function resolveListed(players, typedNames) {
  const matched = [];
  const missing = [];
  const ambiguous = [];
  const used = new Set();
  typedNames.forEach((typed) => {
    const exact = players.find((p) => normalise(p) === normalise(typed));
    if (exact) {
      if (!used.has(exact)) matched.push({ typed, player: exact });
      used.add(exact);
      return;
    }
    const options = players.filter((p) => looselySame(typed, p));
    if (options.length === 1) {
      if (!used.has(options[0])) matched.push({ typed, player: options[0] });
      used.add(options[0]);
    } else if (options.length > 1) ambiguous.push({ typed, options });
    else missing.push(typed);
  });
  return { matched, missing, ambiguous };
}

function shuffle(list, randomIndex) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** How many listed players go in each set (largest-remainder split, capped by set size). */
function splitAcrossSets(total, sizes) {
  const weights = sizes.map((_, i) => WEIGHTS[Math.min(i, WEIGHTS.length - 1)]);
  const sum = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (total * w) / sum);
  const counts = exact.map(Math.floor);
  let left = total - counts.reduce((a, b) => a + b, 0);
  exact
    .map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r || b.i - a.i)
    .forEach(({ i }) => {
      if (left > 0) {
        counts[i] += 1;
        left -= 1;
      }
    });
  // Never more than fits in a set (at most every other position); overflow moves on.
  let carry = 0;
  for (let i = 0; i < counts.length; i++) {
    const cap = Math.ceil(sizes[i] / 2);
    counts[i] += carry;
    carry = Math.max(0, counts[i] - cap);
    counts[i] -= carry;
  }
  for (let i = counts.length - 1; carry > 0 && i >= 0; i--) {
    const room = sizes[i] - counts[i];
    const add = Math.min(room, carry);
    counts[i] += add;
    carry -= add;
  }
  return counts;
}

/** Pick `k` positions in [start, end) at random, avoiding neighbours where possible. */
function pickPositions(start, end, k, taken, randomIndex) {
  const chosen = [];
  for (let n = 0; n < k; n++) {
    const free = [];
    const spaced = [];
    for (let p = start; p < end; p++) {
      if (taken.has(p)) continue;
      free.push(p);
      if (!taken.has(p - 1) && !taken.has(p + 1)) spaced.push(p);
    }
    const from = spaced.length ? spaced : free;
    if (!from.length) break;
    const p = from[randomIndex(from.length)];
    taken.add(p);
    chosen.push(p);
  }
  return chosen;
}

/**
 * Returns the full lot order (every player once), or [] if no listed player
 * is in the pool — in which case the board just picks at random.
 */
export function buildLotOrder(players, spreadNames, randomIndex) {
  const wanted = new Set(resolveListed(players, spreadNames).matched.map((m) => m.player));
  const listed = shuffle(players.filter((p) => wanted.has(p)), randomIndex);
  if (!listed.length) return [];
  const others = shuffle(players.filter((p) => !wanted.has(p)), randomIndex);

  const n = players.length;
  const bounds = [0, ...SET_BOUNDS.filter((b) => b < n), n];
  const sizes = bounds.slice(1).map((b, i) => b - bounds[i]);
  const counts = splitAcrossSets(listed.length, sizes);

  const order = new Array(n).fill(null);
  const taken = new Set();
  let next = 0;
  counts.forEach((k, i) => {
    pickPositions(bounds[i], bounds[i + 1], k, taken, randomIndex).forEach((p) => {
      order[p] = listed[next++];
    });
  });
  // Anything that didn't fit (tiny pools) goes in any free slot.
  for (let p = 0; p < n && next < listed.length; p++) {
    if (order[p] === null) order[p] = listed[next++];
  }
  let o = 0;
  for (let p = 0; p < n; p++) if (order[p] === null) order[p] = others[o++];
  return order;
}
