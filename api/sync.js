// Relay for the live game. The host's browser runs the game and posts its state;
// phones post their name and answer and read the state back. Everything is kept
// in memory and re-sent by the browsers every second, so a restarted or second
// server instance catches up by itself.
// The admin passcode is optional: set ADMIN_KEY in Vercel to require one on /admin.
const fresh = () => ({ players: new Map(), state: null, stateAt: 0, scores: null, kicked: [], pruned: 0 });

module.exports = (req, res) => {
  const G = globalThis.__wakeup || (globalThis.__wakeup = fresh());
  const KEY = process.env.ADMIN_KEY || '';
  const now = Date.now();
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(200).json({ now });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  if (!b || typeof b !== 'object') b = {};

  if (G.state && now - G.stateAt > 20000) { G.state = null; G.scores = null; G.kicked = []; }
  if (now - G.pruned > 5000) {
    G.pruned = now;
    for (const [k, p] of G.players) if (now - p.seen > 30000) G.players.delete(k);
  }
  const waiting = () => {
    const names = [];
    for (const p of G.players.values()) { if (names.length >= 60) break; names.push(p.name); }
    return { names, n: G.players.size };
  };

  if (b.role === 'h') {
    if (KEY && b.key !== KEY) return res.status(401).json({ now, error: 'bad key' });
    const s = b.state;
    if (s && typeof s === 'object' && Number.isFinite(s.gid) && Number.isFinite(s.v)) {
      const cur = G.state;
      if (!cur || s.gid > cur.gid || (s.gid === cur.gid && s.v >= cur.v)) {
        G.state = s;
        if (b.scores && typeof b.scores === 'object') G.scores = b.scores;
        if (Array.isArray(b.kicked)) G.kicked = b.kicked.slice(0, 100).map(String);
      }
      if (G.state.gid === s.gid) G.stateAt = now;
    }
    const players = {};
    for (const [k, p] of G.players) if (!G.kicked.includes(k)) players[k] = { name: p.name, ans: p.ans };
    return res.status(200).json({ now, players });
  }

  if (b.role === 'p') {
    const pid = String(b.pid || '').slice(0, 40);
    const name = String(b.name || '').slice(0, 60);
    if (!pid || !name) return res.status(400).json({ now, error: 'name needed' });
    if (G.kicked.includes(pid)) return res.status(200).json({ now, kicked: true });
    let p = G.players.get(pid);
    if (!p) {
      if (G.players.size >= 400) return res.status(429).json({ now, error: 'room full' });
      p = { name, ans: null, seen: now };
      G.players.set(pid, p);
    }
    p.name = name;
    p.seen = now;
    const a = b.ans;
    if (a && typeof a === 'object' && typeof a.k === 'string' && a.k.length < 12 && Number.isInteger(a.a) && a.a >= 0 && a.a < 100) {
      // First answer for a question wins. The time is stamped here; a time sent by the
      // phone is only kept when another instance had already stamped it.
      if (!p.ans || p.ans.k !== a.k) {
        const at = Number.isFinite(a.at) && a.at <= now && a.at > now - 60000 ? a.at : now;
        p.ans = { k: a.k, a: a.a, at };
      }
    }
    const out = { now, state: G.state };
    if (p.ans) out.ans = p.ans;
    if (G.state && G.scores && G.scores.c && G.scores.c[pid]) { out.me = G.scores.c[pid]; out.mk = G.scores.k; }
    if (!G.state || G.state.ph === 'LOBBY') Object.assign(out, waiting());
    return res.status(200).json(out);
  }

  return res.status(200).json({ now, live: !!G.state, lock: !!KEY, ...waiting() });
};
