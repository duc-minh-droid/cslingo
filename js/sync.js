/* Account sync (optional). Progress still lives in localStorage; signing in copies it to a Supabase row so it follows you.
     NIC.sync.user()          → {email} when signed in, else null
     NIC.sync.signIn(name, pw) → username + password sign-in. A bare username maps to <name>@cslingo.app (no email is ever sent).
                                The account is made by the owner in the Supabase dashboard; the app has no sign-up, so nobody else can join.
     NIC.sync.signOut()
     NIC.sync.on(fn)          → called with the user (or null) whenever that changes
   Table public.progress (user_id = auth.uid(), data jsonb = {"nic.*": raw localStorage string}), protected by row-level security.
   First sign-in on a browser: if the account is empty this browser's progress is uploaded (the migration); if the account has
   progress and this browser has none, it's downloaded; if both have some, the learner chooses. After that every change is pushed.
   The publishable key below is public by design; the row-level security policies are what protect the data. */
(function () {
  const N = NIC;
  const URL_ = "https://yrgilitzuqsfxqkkfwox.supabase.co";
  const KEY = "sb_publishable_Idll9DDUY29DYfInfXiKhg_KKhN8Lbo";
  const SKIP = new Set(["nic.syncAt", "nic.syncUser", "nic.syncDirty"]);
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
    if (u && (was !== u.id || first)) { first = false; reconcile(); }
    if (!u) first = true;
    if ((was || null) !== (u ? u.id : null)) emit();
    // drop ?code=… from the address bar once the session is made
    if (/[?&]code=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
  }

  /** First contact between this browser and the account. */
  async function reconcile() {
    const { data, error } = await sb.from("progress").select("data, updated_at").maybeSingle();
    if (error) { console.error(error); N.fx && N.fx.toast(`<b>Sync failed</b><span>${N.esc(error.message)}</span>`, { tone: "rose" }); return; }
    const local = snapshot(), cloud = (data && data.data) || {};
    const linked = +localStorage.getItem("nic.syncAt") || 0, cloudT = data ? Date.parse(data.updated_at) : 0;
    if (!data || !hasProgress(cloud)) { await push({ force: true }); toast("Progress saved to your account", "This browser's progress is now in your account."); return; }
    if (same(local, cloud)) { stamp(cloudT); return; }
    if (linked) {
      // a device that has synced before: unsent local changes win, otherwise take the newer account copy
      if (localStorage.getItem("nic.syncDirty")) { await push(true); return; }
      if (cloudT > linked) apply(cloud, cloudT);
      return;
    }
    if (!hasProgress(local)) { apply(cloud, cloudT); return; }
    choose(local, cloud, cloudT);
  }

  function choose(local, cloud, cloudT) {
    const n = (d) => { try { return Object.keys(JSON.parse(d["nic.lessonDone"] || "{}")).length; } catch { return 0; } };
    const box = N.el(`<div class="modal-back"><div class="modal sy-choose" role="dialog" aria-modal="true">
      ${N.mascot({ who: "chip", size: 90, mood: "think" })}<h2>Two sets of progress</h2>
      <p>This browser has <b>${n(local)}</b> finished lessons. Your account has <b>${n(cloud)}</b>. Which should win?</p>
      <div class="controls"><button class="btn primary" data-k="cloud">Use my account's</button><button class="btn" data-k="local">Use this browser's</button></div></div></div>`);
    document.body.appendChild(box);
    box.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-k]"); if (!b) return;
      box.remove();
      if (b.dataset.k === "cloud") apply(cloud, cloudT); else { await push({ force: true }); toast("Progress saved to your account", "Your account now matches this browser."); }
    });
  }

  function apply(cloud, t) {
    if (N.player && N.player.isOpen && N.player.isOpen()) { waiting = [cloud, t]; return; } // never reload mid-lesson
    applying = true;
    Object.keys(snapshot()).forEach((k) => localStorage.removeItem(k));
    Object.entries(cloud).forEach(([k, v]) => localStorage.setItem(k, v));
    localStorage.removeItem("nic.syncDirty");
    stamp(t);
    sessionStorage.setItem("nic.syncToast", "1");
    location.reload();
  }
  let waiting = null;
  const stamp = (t) => localStorage.setItem("nic.syncAt", String(t || Date.now()));

  async function push(now) {
    if (!sb || !user || applying) return;
    clearTimeout(pushT);
    if (!now) { pushT = setTimeout(() => push(true), 2500); return; }
    if (!now.force && !localStorage.getItem("nic.syncDirty") && localStorage.getItem("nic.syncAt")) return;
    const t = new Date();
    const { error } = await sb.from("progress").upsert({ user_id: user.id, data: snapshot(), updated_at: t.toISOString() });
    if (error) console.error("sync push failed", error); else { localStorage.removeItem("nic.syncDirty"); stamp(t.getTime()); }
  }
  const toast = (t, s) => N.fx && N.fx.toast(`${N.mascot({ who: "chip", size: 40, mood: "love", poke: false })}<b>${t}</b><span>${s}</span>`, { tone: "blue", ms: 2800 });

  // push whenever progress changes (NIC.store is the main writer; the timer catches direct localStorage writes)
  const set0 = N.store.set;
  N.store.set = (k, v) => { set0(k, v); if (String(k).startsWith("nic.") && !SKIP.has(k)) { localStorage.setItem("nic.syncDirty", "1"); if (user) push(false); } };
  // leaving the tab: send; coming back: pick up anything another device saved meanwhile
  document.addEventListener("visibilitychange", () => {
    if (!user) return;
    if (document.visibilityState === "hidden") push(true); else if (!localStorage.getItem("nic.syncDirty")) reconcile();
  });
  window.addEventListener("hashchange", () => { if (waiting && !(N.player && N.player.isOpen())) { const [c, t] = waiting; waiting = null; apply(c, t); } });

  N.sync = {
    user: () => user,
    pending: () => !!localStorage.getItem("nic.syncUser"),
    email: () => { try { return JSON.parse(localStorage.getItem("nic.syncUser")); } catch { return null; } },
    on: (fn) => { subs.push(fn); },
    async signIn(name, password) {
      const c = await client();
      const email = name.includes("@") ? name : `${name.toLowerCase()}@cslingo.app`;
      const { error } = await c.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { const c = await client(); await push({ force: true }); await c.auth.signOut(); localStorage.removeItem("nic.syncAt"); },
    start: client,
  };

  // Only load the library when there's something to do: a link just came back, or this browser was signed in before.
  if (/[?&]code=/.test(location.search) || localStorage.getItem("nic.syncUser")) client().catch((e) => console.error(e));
  if (sessionStorage.getItem("nic.syncToast")) { sessionStorage.removeItem("nic.syncToast"); setTimeout(() => toast("Progress loaded from your account", "Welcome back!"), 800); }
})();
