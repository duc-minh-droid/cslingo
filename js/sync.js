/* Account sync (optional). Progress still lives in localStorage; signing in copies it to a Supabase row so it follows you.
     NIC.sync.user()          → {email} when signed in, else null
     NIC.sync.signIn(name, pw) → username + password sign-in. A bare username maps to <name>@cslingo.app (no email is ever sent).
                                The account is made by the owner in the Supabase dashboard; the app has no sign-up, so nobody else can join.
     NIC.sync.signOut()
     NIC.sync.on(fn)          → called with the user (or null) whenever that changes
   The account is stored as one row per item (public.progress_items) plus settings (public.progress_prefs), all protected by row-level security;
   saves go through public.save_progress(), which only ever adds to progress. (public.progress / progress_legacy_backup are the old one-row copy.)
   Progress from every device is MERGED, never overwritten: finished lessons, quiz answers, XP per day and review history only grow, so
   two laptops add up. The merge runs on sign-in, after every change, on focus and every 45 s. "Reset everything" stamps nic.resetAt so the reset wins.
   The publishable key below is public by design; the row-level security policies are what protect the data. */
(function () {
  const N = NIC;
  const URL_ = "https://yrgilitzuqsfxqkkfwox.supabase.co";
  const KEY = "sb_publishable_Idll9DDUY29DYfInfXiKhg_KKhN8Lbo";
  const SKIP = new Set(["nic.syncAt", "nic.syncUser", "nic.syncDirty", "nic.syncForce"]);
  let sb = null, user = null, pushT = 0, ready = null, applying = false;
  const subs = [];
  const emit = () => subs.forEach((f) => { try { f(user); } catch (e) { console.error(e); } });

  const snapshot = () => {
    const d = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("nic.") && !SKIP.has(k)) d[k] = localStorage.getItem(k); }
    return d;
  };
  const hasProgress = (d) => Object.keys(d).some((k) => /^nic\.(lessonDone|xp|quiz|rev|predict)$/.test(k) && d[k] && d[k] !== "{}" && d[k] !== "null");
  const same = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

  function client() {
    if (ready) return ready;
    ready = N.lazy("vendor/supabase.js").then(() => {
      sb = window.supabase.createClient(URL_, KEY, { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true, autoRefreshToken: true } });
      sb.auth.onAuthStateChange((ev, session) => { const u = session && session.user; setUser(u ? { id: u.id, email: u.email } : null, ev); });
      return sb.auth.getSession().then(({ data }) => { const u = data.session && data.session.user; setUser(u ? { id: u.id, email: u.email } : null, "INITIAL"); return sb; });
    });
    return ready;
  }

  let first = true;
  function setUser(u, ev) {
    const was = user && user.id;
    user = u;
    if (u) localStorage.setItem("nic.syncUser", JSON.stringify(u.email)); else localStorage.removeItem("nic.syncUser");
    if (u && (was !== u.id || first)) { first = false; syncNow(); }
    if (!u) first = true;
    if ((was || null) !== (u ? u.id : null)) emit();
    // drop ?code=… from the address bar once the session is made
    if (/[?&]code=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
  }

  /* ---------- merge: progress only ever grows, so two devices can never erase each other ----------
     Each key has a rule (union of finished lessons, higher XP per day, latest review of a question, ...). Anything without
     a rule takes the side that changed last. A "Reset everything" stamps nic.resetAt, and the newer reset wins wholesale. */
  const parse = (s) => { try { return JSON.parse(s); } catch { return undefined; } };
  const num = (x) => (typeof x === "number" ? x : 0);
  const U = (x, y, f) => { const o = { ...x }; Object.keys(y).forEach((k) => { o[k] = k in o ? f(o[k], y[k]) : y[k]; }); return o; };
  const stable = (v) => (Array.isArray(v) ? v.map(stable) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])])) : v);
  const canon = (s) => { const p = parse(s); return p === undefined ? String(s) : JSON.stringify(stable(p)); };
  const sameData = (a, b) => { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every((k) => k in b && canon(a[k]) === canon(b[k])); };
  const sumDays = (d) => Object.values(d).reduce((t, n) => t + num(n), 0);
  const RULES = {
    "nic.lessonDone": (x, y) => U(x, y, (p, q) => p || q),
    "nic.visited": (x, y) => U(x, y, (p, q) => p || q),
    "nic.predict": (x, y) => U(x, y, (p, q) => p || q),
    "nic.chests": (x, y) => U(x, y, (p, q) => (p < q ? p : q)),
    "nic.ach": (x, y) => U(x, y, (p, q) => (p < q ? p : q)),
    "nic.lessonPos": (x, y) => U(x, y, (p, q) => Math.max(num(p), num(q))),
    "nic.lessonSeen": (x, y) => U(x, y, (p, q) => Math.max(num(p), num(q))),
    "nic.stats": (x, y) => U(x, y, (p, q) => Math.max(num(p), num(q))),
    "nic.quiz": (x, y) => U(x, y, (p, q) => ((p && p.ok) || !(q && q.ok) ? p : q)),   // a right answer is never replaced by a wrong one
    "nic.rev": (x, y) => U(x, y, (p, q) => (num(q && q.t) > num(p && p.t) ? q : p)),   // the most recent review of each question
    "nic.activeDays": (x, y) => [...new Set([...x, ...y])].sort(),
    "nic.freeze": (x, y) => { const used = [...new Set([...(x.used || []), ...(y.used || [])])]; return { n: Math.max(0, Math.max(num(x.n), num(y.n)) - (used.length - Math.max((x.used || []).length, (y.used || []).length))), used }; },
    "nic.xp": (x, y) => { const dx = x.days || {}, dy = y.days || {}, days = U(dx, dy, (p, q) => Math.max(num(p), num(q))); return { ...x, days, total: Math.max(num(x.total), num(y.total)) + Math.max(0, sumDays(days) - Math.max(sumDays(dx), sumDays(dy))) }; },
    "nic.quests": (x, y) => {
      if (x.date !== y.date) return x.date > y.date ? x : y;
      const list = x.list.map((it) => { const o = y.list.find((z) => z.id === it.id); return o ? { ...it, prog: Math.max(num(it.prog), num(o.prog)), done: it.done || o.done, claimed: it.claimed || o.claimed } : it; });
      return { ...x, list: list.concat(y.list.filter((z) => !x.list.some((it) => it.id === z.id))) };
    },
  };
  /** Merge two snapshots {"nic.*": raw string}. preferLocal says which side wins keys that have no rule. */
  function mergeData(local, cloud, preferLocal) {
    const rl = num(parse(local["nic.resetAt"])), rc = num(parse(cloud["nic.resetAt"]));
    if (rc > rl) return { ...cloud };   // the account was reset after this device last synced
    if (rl > rc) return { ...local };   // this device reset: the account follows
    const out = {};
    new Set([...Object.keys(local), ...Object.keys(cloud)]).forEach((k) => {
      const a = local[k], b = cloud[k];
      if (a === undefined) out[k] = b; else if (b === undefined) out[k] = a; else if (canon(a) === canon(b)) out[k] = a;
      else { const pa = parse(a), pb = parse(b), r = RULES[k]; out[k] = r && pa !== undefined && pb !== undefined ? JSON.stringify(r(pa, pb)) : (preferLocal ? a : b); }
    });
    return out;
  }

  /* ---------- the account's tables: one row per item, so a save only touches what changed ----------
     public.progress_items (kind, item, value): finished lessons, quiz answers, XP per day, reviews, ...
     public.progress_prefs (key, value, raw):   course, goal, quests, ... (raw = the browser stored a plain string)
     public.save_progress(items, prefs) adds to these with a rule per kind (the database never lowers progress);
     public.reset_progress() is the only thing that removes it. */
  const KINDS = { "nic.lessonDone": "lesson_done", "nic.visited": "visited", "nic.predict": "predict", "nic.quiz": "quiz", "nic.rev": "rev", "nic.lessonPos": "lesson_pos", "nic.lessonSeen": "lesson_seen", "nic.chests": "chest", "nic.ach": "achievement", "nic.stats": "stat" };
  const KEY_OF = Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [v, k]));
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  /** snapshot {"nic.*": raw string} -> Map "kind\u0000item" -> JSON value text, and Map "key" -> {value, raw} text */
  function toRows(snap) {
    const items = new Map(), prefs = new Map();
    const put = (kind, item, v) => items.set(kind + "\u0000" + item, JSON.stringify(v));
    Object.entries(snap).forEach(([key, raw]) => {
      const p = parse(raw);
      if (KINDS[key] && isObj(p)) Object.entries(p).forEach(([id, v]) => { if ((key === "nic.lessonDone" || key === "nic.visited")) { if (v) put(KINDS[key], id, true); } else put(KINDS[key], id, v); });
      else if (key === "nic.xp" && isObj(p)) {
        const days = isObj(p.days) ? p.days : {};
        Object.entries(days).forEach(([d, n]) => put("xp_day", d, num(n)));
        prefs.set("xp_base", JSON.stringify({ value: Math.max(0, num(p.total) - sumDays(days)), raw: false }));
      } else if (key === "nic.activeDays" && Array.isArray(p)) p.forEach((d) => put("active_day", String(d), true));
      else prefs.set(key, JSON.stringify(p === undefined ? { value: raw, raw: true } : { value: p, raw: false }));
    });
    return { items, prefs };
  }
  /** the account's rows -> a snapshot in the shape the rest of the app (and mergeData) uses */
  function fromRows(itemRows, prefRows) {
    const snap = {}, byKind = {};
    itemRows.forEach((r) => { (byKind[r.kind] = byKind[r.kind] || {})[r.item] = r.value; });
    Object.entries(byKind).forEach(([kind, o]) => {
      if (KEY_OF[kind]) snap[KEY_OF[kind]] = JSON.stringify(o);
      else if (kind === "active_day") snap["nic.activeDays"] = JSON.stringify(Object.keys(o).sort());
    });
    const base = (prefRows.find((r) => r.key === "xp_base") || {}).value, days = byKind.xp_day || {};
    if (base !== undefined || byKind.xp_day) snap["nic.xp"] = JSON.stringify({ total: num(base) + sumDays(days), days });
    prefRows.forEach((r) => { if (r.key !== "xp_base") snap[r.key] = r.raw ? String(r.value) : JSON.stringify(r.value); });
    return snap;
  }
  async function readAll(table, cols) {
    const out = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from(table).select(cols).range(from, from + 999);
      if (error) throw error;
      out.push(...data); if (data.length < 1000) return out;
    }
  }

  /** Bring this browser and the account together: read the account, merge it with this browser, send the account only what
      it was missing (the database applies its own add-never-replace rules), and take whatever this browser was missing. */
  let syncing = null, again = false, waiting = false, failedAt = 0, starting = false;
  function syncNow() {
    if (!sb || !user) return Promise.resolve();
    if (syncing) { again = true; return syncing; }
    syncing = run().catch((e) => fail(e)).finally(() => { syncing = null; setBusy(false); if (again) { again = false; syncNow(); } });
    return syncing;
  }
  function fail(e) {
    console.error("sync failed", e);
    if (Date.now() - failedAt > 60000) { failedAt = Date.now(); N.fx && N.fx.toast(`<b>Couldn't reach your account</b><span>${N.esc((e && e.message) || String(e))}</span>`, { tone: "rose" }); }
  }
  async function run() {
    setBusy(true);
    const [itemRows, prefRows] = await Promise.all([readAll("progress_items", "kind,item,value"), readAll("progress_prefs", "key,value,raw")]);
    const cloud = fromRows(itemRows, prefRows), local = snapshot(), dirty = !!localStorage.getItem("nic.syncDirty"), forced = !!localStorage.getItem("nic.syncForce");
    const final = forced ? local : mergeData(local, cloud, dirty);
    const A = toRows(final), B = forced ? { items: new Map(), prefs: new Map() } : toRows(cloud);
    const items = [], prefs = [];
    A.items.forEach((v, k) => { if (B.items.get(k) !== v) { const [kind, item] = k.split("\u0000"); items.push({ kind, item, value: JSON.parse(v) }); } });
    A.prefs.forEach((v, k) => { if (B.prefs.get(k) !== v) { const o = JSON.parse(v); prefs.push({ key: k, value: o.value, raw: o.raw }); } });
    if (forced) { const r = await sb.rpc("reset_progress"); if (r.error) throw r.error; }
    for (let i = 0; i < Math.max(1, Math.ceil(items.length / 400)); i++) {
      const chunk = items.slice(i * 400, i * 400 + 400);
      if (!chunk.length && !(i === 0 && prefs.length)) continue;
      const r = await sb.rpc("save_progress", { p_items: chunk, p_prefs: i === 0 ? prefs : [] });
      if (r.error) throw r.error;
    }
    localStorage.removeItem("nic.syncDirty"); localStorage.removeItem("nic.syncForce");
    if (!sameData(final, local)) applyLocal(final);
  }
  /** The account had progress this browser didn't: take it and reload (never mid-lesson; that waits until the player closes). */
  function applyLocal(final) {
    if (!starting && N.player && N.player.isOpen && N.player.isOpen()) { waiting = true; return; }
    Object.keys(snapshot()).forEach((k) => localStorage.removeItem(k));
    Object.entries(final).forEach(([k, v]) => localStorage.setItem(k, v));
    if (starting || window.__nicNoReload) return;       // before the first screen is drawn (or in tests): nothing to refresh
    if (N.refresh) N.refresh(); else location.reload(); // otherwise redraw the page in place, no reload
  }

  /* busy: a sync is waiting or in flight. The menu's sync row shows a pending dot (js/app.js listens for nic:sync). */
  let busy = false;
  const setBusy = (b) => { if (b === busy) return; busy = b; window.dispatchEvent(new CustomEvent("nic:sync", { detail: { busy } })); };
  function push(now) {
    if (!sb || !user || applying) return;
    clearTimeout(pushT);
    if (!now) { setBusy(true); pushT = setTimeout(syncNow, 600); return; }
    return syncNow();
  }

  // push whenever progress changes (NIC.store is the main writer; the timer catches direct localStorage writes)
  const set0 = N.store.set;
  N.store.set = (k, v) => { set0(k, v); if (String(k).startsWith("nic.") && !SKIP.has(k)) { localStorage.setItem("nic.syncDirty", "1"); if (user) push(false); } };
  // keep devices together: sync when the tab is left or comes back, on focus and when the network returns, and every 45 s while it is open
  document.addEventListener("visibilitychange", () => { if (user) syncNow(); });
  window.addEventListener("focus", () => { if (user) syncNow(); });
  window.addEventListener("online", () => { if (user) syncNow(); });
  setInterval(() => { if (user && document.visibilityState === "visible") syncNow(); }, 45000);
  window.addEventListener("hashchange", () => { if (waiting && !(N.player && N.player.isOpen())) { waiting = false; syncNow(); } });

  N.sync = {
    user: () => user,
    busy: () => busy,
    pending: () => !!localStorage.getItem("nic.syncUser"),
    email: () => { try { return JSON.parse(localStorage.getItem("nic.syncUser")); } catch { return null; } },
    on: (fn) => { subs.push(fn); },
    async signIn(name, password) {
      const c = await client();
      const email = name.includes("@") ? name : `${name.toLowerCase()}@cslingo.app`;
      const { error } = await c.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { const c = await client(); await syncNow(); await c.auth.signOut(); },
    start: client,
    now: syncNow,
    _test: { mergeData, sameData, canon, toRows, fromRows, use: (c, u) => { sb = c; user = u; } },
  };

  // Only load the library when there's something to do: a link just came back, or this browser was logged in before.
  // Logged in before: the app waits (at most 2.5 s) for the account's progress, so the first screen is already up to date.
  if (localStorage.getItem("nic.syncUser")) {
    starting = true;
    N.syncReady = Promise.race([client().then(() => syncing || syncNow()), new Promise((r) => setTimeout(r, 2500))]).catch((e) => console.error(e)).then(() => { starting = false; });
  } else N.syncReady = Promise.resolve();
  if (/[?&]code=/.test(location.search)) client().catch((e) => console.error(e));
})();
