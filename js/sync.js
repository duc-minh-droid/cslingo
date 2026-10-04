/* Account sync (optional). Progress still lives in localStorage; signing in copies it to your account (Supabase) so it follows you.
     NIC.sync.user()          → {email} when signed in, else null
     NIC.sync.signIn(name, pw) → username + password sign-in. A bare username maps to <name>@cslingo.app (no email is ever sent).
     NIC.sync.signUp(name, pw) → "Create account" in the Log in screen: the `signup` edge function makes <name>@cslingo.app (already
                                confirmed, so there is no email and no password reset), then signs in.
     NIC.sync.signOut()        → logs out on this device only (scope "local"); the progress copy stays here
     NIC.sync.status()         → {loggedIn, user: username, state: "out" | "syncing" | "synced" | "offline" | "error", at: ms of the last sync}
     NIC.sync.on(fn)          → called with the user (or null) whenever that changes (window event "nic:sync" fires on every state change)
     NIC.sync.askAdopt        → set by js/app/account.js: asks "add this device's progress, or start fresh?" when a different account signs in
   The account is stored as one row per item (public.progress_items) plus settings (public.progress_prefs), all protected by row-level security;
   saves go through public.save_progress(), which only ever adds to progress. (public.progress / progress_legacy_backup are the old one-row copy.)
   Progress from every device is MERGED, never overwritten: finished lessons, quiz answers, XP per day and review history only grow, so
   two laptops add up. The merge runs on sign-in, after every change, on focus and every 45 s. There is no reset button; nic.resetAt is only read for old data.
   The first sync for an account lets the account win the keys that have no merge rule (goal, course, ...), so a new device's onboarding
   defaults never overwrite them. nic.lastUser is the account this device's progress belongs to; a different account signing in over
   progress is asked what to do before anything is merged. Every read and write goes through NIC.store (it never throws).
   The publishable key below is public by design; the row-level security policies are what protect the data. */
(function () {
  const N = NIC;
  const URL_ = "https://yrgilitzuqsfxqkkfwox.supabase.co";
  const KEY = "sb_publishable_Idll9DDUY29DYfInfXiKhg_KKhN8Lbo";
  const S = N.store;
  const SKIP = new Set([
    "nic.syncAt",
    "nic.syncUser",
    "nic.syncDirty",
    "nic.syncForce",
    "nic.lastUser", // the account this device's progress belongs to
    "nic.syncedUser", // the account this device last finished a sync with
  ]);
  const KEEP_ON_FRESH = new Set(["nic.onboarded", ...SKIP]);
  const parse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  };
  const num = (x) => (typeof x === "number" ? x : 0);
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  let sb = null,
    user = null,
    pushT = 0,
    ready = null,
    busy = false; // a sync is waiting or in flight
  const subs = [];
  const emit = () =>
    subs.forEach((f) => {
      try {
        f(user);
      } catch (e) {
        console.error(e);
      }
    });

  const snapshot = () => {
    const d = {};
    S.keys().forEach((k) => {
      const v = k.startsWith("nic.") && !SKIP.has(k) ? S.raw(k) : null;
      if (v !== null && v !== undefined) d[k] = v;
    });
    return d;
  };

  /** Read the stored session. A stored login whose token couldn't be refreshed (offline, a flaky network) stays marked as this
      device's account: it is retried when the network returns, and only a real log out or a rejected login clears it. */
  async function readSession() {
    const { data, error } = await sb.auth.getSession();
    const u = data && data.session && data.session.user;
    const net =
      error && (navigator.onLine === false || /fetch|network|timeout|load failed/i.test(String(error.message)));
    if (!u && net && S.raw("nic.syncUser")) return setState("offline");
    setUser(u ? { id: u.id, email: u.email } : null, "INITIAL");
  }
  const recover = () => !user && sb && S.raw("nic.syncUser") && readSession().catch((e) => console.error(e));

  function client() {
    if (ready) return ready;
    ready = N.lazy("vendor/supabase.js").then(() => {
      sb = window.supabase.createClient(URL_, KEY, {
        auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true, autoRefreshToken: true },
      });
      sb.auth.onAuthStateChange((ev, session) => {
        const u = session && session.user;
        // an empty session at start-up or after a failed refresh is not a log out (the offline case is handled below)
        if (!u && ev !== "SIGNED_OUT" && S.raw("nic.syncUser")) return;
        setUser(u ? { id: u.id, email: u.email } : null, ev);
      });
      return readSession().then(() => sb);
    });
    ready.catch(() => (ready = null)); // offline when the library was fetched: the next attempt starts again
    return ready;
  }

  /* state: "out" (logged out) | "new" (not synced yet) | "synced" | "offline" | "error". NIC.sync.status() turns it into what the menu shows. */
  let state = S.raw("nic.syncUser") ? "new" : "out",
    syncedAt = 0,
    held = false, // a different account signed in over progress: nothing syncs until it has been decided
    firstP = Promise.resolve();
  const announce = () => window.dispatchEvent(new CustomEvent("nic:sync", { detail: { busy, state, at: syncedAt } }));
  const setState = (s, at) => {
    if (s === state && !at) return;
    state = s;
    if (at) syncedAt = at;
    announce();
  };
  const bootEmail = parse(S.raw("nic.syncUser")); // who this browser was logged in as before this page loaded (older builds stored no id)
  const uname = (email) => String(email || "").replace(/@cslingo\.app$/, "");
  const refreshNow = () => N.refresh && !(N.player && N.player.isOpen && N.player.isOpen()) && N.refresh();

  /** Real progress on this device (not just onboarding defaults). */
  const hasProgress = (d) => {
    const n = (k) => {
      const p = parse(d[k]);
      return Array.isArray(p) ? p.length : isObj(p) ? Object.values(p).filter(Boolean).length : 0;
    };
    const xp = parse(d["nic.xp"]);
    return n("nic.lessonDone") + n("nic.quiz") + n("nic.rev") + n("nic.activeDays") > 0 || num(xp && xp.total) > 0;
  };
  /** A different account than this device last held, and progress on it: ask before anything is merged into the new account. */
  const mustAsk = (u) => {
    const last = S.raw("nic.lastUser");
    return !!last && last !== u.id && hasProgress(snapshot());
  };
  /** The first sync for an account on this device: the account wins the keys that have no merge rule. */
  const isFirst = (u) => S.raw("nic.syncedUser") !== u.id;

  async function begin(u) {
    if (mustAsk(u)) {
      held = true;
      setState("new");
      let pick = "add";
      for (let i = 0; i < 100 && !N.sync.askAdopt; i++) await new Promise((r) => setTimeout(r, 100)); // the dialog loads after this file
      if (N.sync.askAdopt)
        pick = await Promise.resolve()
          .then(() => N.sync.askAdopt(uname(u.email)))
          .catch(() => null);
      held = false;
      if (!user || user.id !== u.id) return; // logged out while the question was open
      if (!pick) return sb.auth.signOut({ scope: "local" }).catch((e) => console.error(e)); // "Cancel": nothing was merged
      if (pick === "fresh") {
        if (S.raw("nic.syncDirty") && S.raw("nic.lastUser"))
          S.setRaw("csl.backup." + S.raw("nic.lastUser"), JSON.stringify(snapshot())); // changes that never reached the old account
        S.keys().forEach((k) => k.startsWith("nic.") && !KEEP_ON_FRESH.has(k) && S.removeRaw(k));
        S.removeRaw("csl.revSession"); // a paused revision round belongs to the old account
        S.removeRaw("nic.syncDirty");
        refreshNow();
      }
    }
    if (!S.raw("nic.lastUser") && bootEmail === u.email) S.setRaw("nic.syncedUser", u.id); // an older build stored no id: same email = a returning device
    S.setRaw("nic.lastUser", u.id);
    return syncNow();
  }

  let first = true;
  function setUser(u, ev) {
    const was = user && user.id;
    user = u;
    if (u) S.setRaw("nic.syncUser", JSON.stringify(u.email));
    else S.removeRaw("nic.syncUser");
    if (u && (was !== u.id || first)) {
      first = false;
      firstP = begin(u).catch((e) => console.error(e));
    }
    if (!u) {
      first = true;
      held = false;
      setState("out");
    } else if (state === "out") setState("new");
    if ((was || null) !== (u ? u.id : null)) emit();
    // drop ?code=… from the address bar once the session is made
    if (/[?&]code=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
  }

  /* ---------- merge: progress only ever grows, so two devices can never erase each other ----------
     Each key has a rule (union of finished lessons, higher XP per day, latest review of a question, ...). Anything without
     a rule takes the side that changed last. A "Reset everything" stamps nic.resetAt, and the newer reset wins wholesale. */
  const { stable, canon, sameData, sumDays, mergeData } = N.shared.syncMerge;

  /* ---------- the account's tables: one row per item, so a save only touches what changed ----------
     public.progress_items (kind, item, value): finished lessons, quiz answers, XP per day, reviews, ...
     public.progress_prefs (key, value, raw):   course, goal, quests, ... (raw = the browser stored a plain string)
     public.save_progress(items, prefs) adds to these with a rule per kind (the database never lowers progress);
     public.reset_progress() is the only thing that removes it. */
  const KINDS = {
    "nic.lessonDone": "lesson_done",
    "nic.visited": "visited",
    "nic.predict": "predict",
    "nic.quiz": "quiz",
    "nic.rev": "rev",
    "nic.lessonPos": "lesson_pos",
    "nic.lessonSeen": "lesson_seen",
    "nic.chests": "chest",
    "nic.ach": "achievement",
    "nic.stats": "stat",
  };
  const KEY_OF = Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [v, k]));
  /** snapshot {"nic.*": raw string} -> Map "kind\u0000item" -> JSON value text, and Map "key" -> {value, raw} text */
  function toRows(snap) {
    const items = new Map(),
      prefs = new Map();
    const put = (kind, item, v) => items.set(kind + "\u0000" + item, JSON.stringify(stable(v))); // canonical: the database re-orders object keys, so compare sorted
    Object.entries(snap).forEach(([key, raw]) => {
      const p = parse(raw);
      if (KINDS[key] && isObj(p))
        Object.entries(p).forEach(([id, v]) => {
          if (key === "nic.lessonDone" || key === "nic.visited") {
            if (v) put(KINDS[key], id, true);
          } else put(KINDS[key], id, v);
        });
      else if (key === "nic.xp" && isObj(p)) {
        const days = isObj(p.days) ? p.days : {};
        Object.entries(days).forEach(([d, n]) => put("xp_day", d, num(n)));
        prefs.set("xp_base", JSON.stringify({ value: Math.max(0, num(p.total) - sumDays(days)), raw: false }));
      } else if (key === "nic.activeDays" && Array.isArray(p)) p.forEach((d) => put("active_day", String(d), true));
      else
        prefs.set(key, JSON.stringify(stable(p === undefined ? { value: raw, raw: true } : { value: p, raw: false })));
    });
    return { items, prefs };
  }
  /** the account's rows -> a snapshot in the shape the rest of the app (and mergeData) uses */
  function fromRows(itemRows, prefRows) {
    const snap = {},
      byKind = {};
    itemRows.forEach((r) => {
      (byKind[r.kind] = byKind[r.kind] || {})[r.item] = r.value;
    });
    Object.entries(byKind).forEach(([kind, o]) => {
      if (KEY_OF[kind]) snap[KEY_OF[kind]] = JSON.stringify(o);
      else if (kind === "active_day") snap["nic.activeDays"] = JSON.stringify(Object.keys(o).sort());
    });
    const base = (prefRows.find((r) => r.key === "xp_base") || {}).value,
      days = byKind.xp_day || {};
    if (base !== undefined || byKind.xp_day)
      snap["nic.xp"] = JSON.stringify({ total: num(base) + sumDays(days), days });
    prefRows.forEach((r) => {
      if (r.key !== "xp_base") snap[r.key] = r.raw ? String(r.value) : JSON.stringify(r.value);
    });
    return snap;
  }
  async function readAll(table, cols) {
    const out = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb
        .from(table)
        .select(cols)
        .range(from, from + 999);
      if (error) throw error;
      out.push(...data);
      if (data.length < 1000) return out;
    }
  }

  /** Bring this browser and the account together: read the account, merge it with this browser, send the account only what
      it was missing (the database applies its own add-never-replace rules), and take whatever this browser was missing. */
  let syncing = null,
    again = false,
    waiting = false,
    warned = false,
    starting = false;
  function syncNow() {
    if (!sb || !user || held) return Promise.resolve();
    if (syncing) {
      again = true;
      return syncing;
    }
    syncing = run()
      .catch((e) => fail(e))
      .finally(() => {
        syncing = null;
        setBusy(false);
        if (again) {
          again = false;
          syncNow();
        }
      });
    return syncing;
  }
  function fail(e) {
    console.error("sync failed", e);
    const net =
      navigator.onLine === false || /fetch|network|offline|timeout|load failed/i.test(String((e && e.message) || e));
    setState(net ? "offline" : "error");
    if (!warned) {
      warned = true; // once per outage; the next success re-arms it
      N.fx &&
        N.fx.toast(
          "<b>Can't reach your account</b><span>Your progress is saved on this device and will sync when you're back online.</span>",
          { ms: 4500 },
        );
    }
  }
  async function run() {
    const u = user;
    setBusy(true);
    const [itemRows, prefRows] = await Promise.all([
      readAll("progress_items", "kind,item,value"),
      readAll("progress_prefs", "key,value,raw"),
    ]);
    const cloud = fromRows(itemRows, prefRows),
      local = snapshot(),
      dirty = !!S.raw("nic.syncDirty"),
      forced = !!S.raw("nic.syncForce");
    // this device's own changes win keys with no merge rule, except on the first sync for an account (a new device's defaults must not overwrite it)
    const final = forced ? local : mergeData(local, cloud, dirty && !isFirst(u));
    const A = toRows(final),
      B = forced ? { items: new Map(), prefs: new Map() } : toRows(cloud);
    const items = [],
      prefs = [];
    A.items.forEach((v, k) => {
      if (B.items.get(k) !== v) {
        const [kind, item] = k.split("\u0000");
        items.push({ kind, item, value: JSON.parse(v) });
      }
    });
    A.prefs.forEach((v, k) => {
      if (B.prefs.get(k) !== v) {
        const o = JSON.parse(v);
        prefs.push({ key: k, value: o.value, raw: o.raw });
      }
    });
    if (forced) {
      const r = await sb.rpc("reset_progress");
      if (r.error) throw r.error;
    }
    for (let i = 0; i < Math.max(1, Math.ceil(items.length / 400)); i++) {
      const chunk = items.slice(i * 400, i * 400 + 400);
      if (!chunk.length && !(i === 0 && prefs.length)) continue;
      const r = await sb.rpc("save_progress", { p_items: chunk, p_prefs: i === 0 ? prefs : [] });
      if (r.error) throw r.error;
    }
    S.removeRaw("nic.syncDirty");
    S.removeRaw("nic.syncForce");
    S.setRaw("nic.syncedUser", u.id);
    warned = false;
    setState("synced", Date.now());
    if (!sameData(final, local)) applyLocal(final);
  }
  /** The account had progress this browser didn't: take it and redraw (never mid-lesson; that waits until the player closes). */
  function applyLocal(final) {
    if (!starting && N.player && N.player.isOpen && N.player.isOpen()) {
      waiting = true;
      return;
    }
    Object.keys(snapshot()).forEach((k) => S.removeRaw(k));
    Object.entries(final).forEach(([k, v]) => S.setRaw(k, v));
    if (starting || window.__nicNoReload) return; // before the first screen is drawn (or in tests): nothing to refresh
    if (N.refresh) N.refresh();
    else location.reload(); // otherwise redraw the page in place, no reload
  }

  /* busy: a sync is waiting or in flight. The menu's sync row shows a pending dot (js/app/ listens for nic:sync). */
  const setBusy = (b) => {
    if (b === busy) return;
    busy = b;
    announce();
  };
  function push(now) {
    if (!sb || !user || held) return;
    clearTimeout(pushT);
    if (!now) {
      setBusy(true);
      pushT = setTimeout(syncNow, 600);
      return;
    }
    return syncNow();
  }

  // push whenever progress changes (NIC.store is the main writer; the timer catches direct localStorage writes)
  const set0 = S.set;
  S.set = (k, v) => {
    set0(k, v);
    if (String(k).startsWith("nic.") && !SKIP.has(k)) {
      S.setRaw("nic.syncDirty", "1"); // never throws: blocked storage falls back to memory
      if (user) push(false);
    }
  };
  // keep devices together: sync when the tab is left or comes back, on focus and when the network returns, and every 45 s while it is open
  const kick = () => user && syncNow();
  document.addEventListener("visibilitychange", kick);
  window.addEventListener("focus", kick);
  window.addEventListener("online", () => {
    warned = false;
    if (user) syncNow();
    else if (!sb && S.raw("nic.syncUser"))
      client().catch((e) => console.error(e)); // the library never loaded while offline: try again
    else recover(); // loaded, but the session couldn't be refreshed offline
  });
  window.addEventListener("offline", () => user && setState("offline"));
  setInterval(() => {
    if (user && document.visibilityState === "visible") syncNow();
    else if (!user) recover();
  }, 45000);
  window.addEventListener("hashchange", () => {
    if (waiting && !(N.player && N.player.isOpen())) {
      waiting = false;
      syncNow();
    }
  });

  const status = () => {
    const email = user ? user.email : parse(S.raw("nic.syncUser"));
    const st = !email ? "out" : state === "new" || (busy && state !== "synced") ? "syncing" : state;
    return { loggedIn: !!email, user: email ? uname(email) : null, state: st, at: syncedAt };
  };
  N.sync = {
    user: () => user,
    busy: () => busy,
    pending: () => !!S.raw("nic.syncUser"),
    email: () => parse(S.raw("nic.syncUser")) ?? null,
    status,
    /** Resolves when the first sync after signing in has finished (or after ms), so the Log in screen can say "Loading your progress". */
    settled: (ms = 10000) => Promise.race([firstP, new Promise((r) => setTimeout(r, ms))]),
    on: (fn) => {
      subs.push(fn);
    },
    async signIn(name, password) {
      const c = await client();
      const email = name.includes("@") ? name : `${name.toLowerCase()}@cslingo.app`;
      const { data, error } = await c.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data && data.user;
      if (u && (!user || user.id !== u.id)) setUser({ id: u.id, email: u.email }, "SIGNED_IN"); // in case the auth event has not landed yet
    },
    /** Creates the account through the `signup` edge function (no email is involved), then signs in. */
    async signUp(name, password) {
      const r = await fetch(`${URL_}/functions/v1/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: KEY },
        body: JSON.stringify({ username: name, password }),
      }).catch(() => null);
      if (!r) throw new Error("No connection. Try again when you're online.");
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Couldn't create the account.");
      return N.sync.signIn(name, password);
    },
    /** Logs out on this device only. The progress copy stays here (a different account signing in is asked what to do with it). */
    async signOut() {
      const c = await client();
      await syncNow();
      if (S.raw("nic.syncDirty")) {
        const e = new Error("Some changes on this device haven't reached your account yet. Connect and try again.");
        e.unsynced = true;
        throw e; // signing out now would leave them only on this device
      }
      await c.auth.signOut({ scope: "local" });
    },
    async changePassword(password) {
      const c = await client();
      const { error } = await c.auth.updateUser({ password });
      if (error) throw error;
    },
    start: client,
    now: syncNow,
    _test: {
      mergeData,
      sameData,
      canon,
      toRows,
      fromRows,
      setUser: (u) => setUser(u, "SIGNED_IN"),
      use: (c, u) => ((sb = c), (user = u), (ready = Promise.resolve(c))),
    },
  };

  // Only load the library when there's something to do: a link just came back, or this browser was logged in before.
  // Logged in before: the app waits (at most 2.5 s) for the account's progress, so the first screen is already up to date.
  if (S.raw("nic.syncUser")) {
    starting = true;
    N.syncReady = Promise.race([client().then(() => syncing || syncNow()), new Promise((r) => setTimeout(r, 2500))])
      .catch((e) => {
        console.error(e);
        setState("offline");
      })
      .then(() => {
        starting = false;
      });
  } else N.syncReady = Promise.resolve();
  if (/[?&]code=/.test(location.search)) client().catch((e) => console.error(e));
})();
