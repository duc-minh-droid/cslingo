/* global window, document, location, console, URLSearchParams, localStorage, addEventListener, setTimeout */
/* Dev-only debug helper. index.html injects this file only on localhost / 127.x / [::1]; it lives in tools/, which the
   deploy never copies, so production neither loads nor ships it. Use it from the console, from a deep link or from the
   DEV panel (bottom-left, Ctrl+Shift+D). It never changes a lesson's content, only where you are and what is saved.

   Console:   dbg.go("l1-what", 3)        open a lesson or boss at screen 3 (0 = first)   dbg.go("profile") any route
              dbg.step(5) | "+1" | "-1" | "q"   move inside the open lesson ("q" = next question screen)
              dbg.screens()               list the open lesson's screens   dbg.info()   where am I, what is saved
              dbg.list("heap")            find modules   dbg.done("l1-what" | "all" | "upto:l3-heap")   dbg.undone(...)
              dbg.reset()                 wipe saved progress   dbg.theme("dark"|"light")   dbg.store(key[, value])
   Deep link: http://localhost:8650/?dbg=l1-what@3   (opens it at screen 3 on load)   ?dbg=profile */
(function () {
  const N = window.NIC;
  if (!N || window.dbg) return;
  const pl = () => N.shared.enginePlayer,
    wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const mods = () => N.modules.slice();
  const find = (id) => mods().find((m) => m.id === id);
  const store = N.store;

  async function until(test, ms = 6000) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const v = test();
      if (v) return v;
      await wait(60);
    }
    return null;
  }

  const dbg = {
    /** Open a module (lesson or boss) at a screen, or any route. */
    async go(target, step) {
      await N.content.all();
      if (N.bank && N.bank.load) await N.bank.load();
      const want = String(target || "home").replace(/^#/, "");
      const same = location.hash.slice(1) === want;
      if (pl().S && pl().close) pl().close(true);
      if (same) {
        location.hash = "";
        await wait(50);
      }
      location.hash = `#${want}`;
      if (!find(want)) return (await wait(400), dbg.info());
      const ok = await until(
        () => pl().S && pl().S.mod && pl().S.mod.id === want && pl().S.screens && pl().S.screens.length,
      );
      if (!ok) return `could not open ${want}`;
      if (step !== undefined) await dbg.step(step);
      return dbg.info();
    },

    /** Jump inside the open lesson: a number, "+1" / "-1", or a screen kind such as "q", "try", "note". */
    async step(to) {
      const S = pl().S;
      if (!S) return "no lesson open";
      let i;
      if (typeof to === "number") i = to;
      else if (/^[+-]\d+$/.test(String(to))) i = S.i + Number(to);
      else {
        const j = S.screens.findIndex((x, k) => k > S.i && x.kind === to);
        if (j < 0) return `no later "${to}" screen`;
        i = j;
      }
      S.i = Math.max(0, Math.min(S.screens.length - 1, i));
      S.barBack = true;
      pl().show(0);
      await wait(150);
      return dbg.info();
    },

    screens() {
      const S = pl().S;
      return S
        ? S.screens
            .map(
              (x, k) => `${k === S.i ? "▶" : " "} ${k}  ${x.kind}${x.retry ? " (retry)" : ""}${x.t ? "  " + x.t : ""}`,
            )
            .join("\n")
        : "no lesson open";
    },

    info() {
      const S = pl().S,
        done = store.get("nic.lessonDone", {});
      return {
        route: location.hash || "#",
        module: S && S.mod ? `${S.mod.id}  ${S.mod.num} ${S.mod.title}` : null,
        screen: S ? `${S.i + 1}/${S.screens.length}  ${S.screens[S.i] && S.screens[S.i].kind}` : null,
        finishedLessons: Object.keys(done).length,
        modules: mods().length,
      };
    },

    list(q = "") {
      const s = String(q).toLowerCase();
      return mods()
        .filter((m) => !s || `${m.id} ${m.num} ${m.title} ${m.subject || "nic"}`.toLowerCase().includes(s))
        .map((m) => `${m.id}  ${m.subject || "nic"} L${m.lecture} ${m.num}  ${m.title}`)
        .join("\n");
    },

    /** Mark lessons finished ("all", one id, or "upto:<id>" = everything before it in path order) so gated pages open. */
    done(which = "all") {
      const d = store.get("nic.lessonDone", {}),
        list = mods().filter((m) => m.num !== "Boss" && !m.video);
      let ids;
      if (which === "all") ids = list.map((m) => m.id);
      else if (String(which).startsWith("upto:")) {
        const k = list.findIndex((m) => m.id === which.slice(5));
        ids = list.slice(0, Math.max(0, k)).map((m) => m.id);
      } else ids = [which];
      ids.forEach((id) => (d[id] = true));
      store.set("nic.lessonDone", d);
      return `${ids.length} lesson(s) marked finished; reload to see the path update`;
    },
    undone(which = "all") {
      const d = which === "all" ? {} : store.get("nic.lessonDone", {});
      if (which !== "all") delete d[which];
      store.set("nic.lessonDone", d);
      return "ok; reload to see the path update";
    },

    reset() {
      Object.keys(localStorage)
        .filter((k) => /^(nic|csl)\./.test(k))
        .forEach((k) => localStorage.removeItem(k));
      return "saved progress wiped; reload";
    },
    store(key, value) {
      if (value === undefined) return store.get(key, null);
      store.set(key, value);
      return "saved";
    },
    theme(t) {
      document.documentElement.dataset.theme = t;
      document.documentElement.dataset.themeNow = t;
      return t;
    },
  };
  window.dbg = dbg;

  // ---- DEV panel ----
  function panel() {
    const css = document.createElement("style");
    css.textContent = `#dbg-btn{position:fixed;left:8px;bottom:8px;z-index:99999;font:700 11px/1 monospace;background:#f59e0b;color:#000;border:0;border-radius:6px;padding:6px 8px;cursor:pointer;opacity:.85}
#dbg-box{position:fixed;left:8px;bottom:40px;z-index:99999;width:300px;max-height:70vh;overflow:auto;background:#111;color:#eee;font:12px/1.4 monospace;border:2px solid #f59e0b;border-radius:8px;padding:10px;display:none}
#dbg-box select,#dbg-box input,#dbg-box button{font:12px monospace;margin:2px 0;max-width:100%}#dbg-box button{cursor:pointer}#dbg-box pre{white-space:pre-wrap;margin:6px 0 0;color:#9ca3af}
#dbg-box .row{display:flex;gap:4px;flex-wrap:wrap}`;
    document.head.append(css);
    const btn = document.createElement("button");
    btn.id = "dbg-btn";
    btn.textContent = "DEV";
    btn.title = "Debug helper (Ctrl+Shift+D)";
    const box = document.createElement("div");
    box.id = "dbg-box";
    document.body.append(btn, box);
    const out = () => box.querySelector("pre");
    const show = (v) => (out().textContent = typeof v === "string" ? v : JSON.stringify(v, null, 1));
    async function build() {
      await N.content.all();
      const groups = {};
      mods().forEach((m) => (groups[`${m.subject || "nic"} L${m.lecture}`] ||= []).push(m));
      box.innerHTML = `<b>CSLingo DEV</b> <small>(dbg in console)</small><br>
        <select id="dbg-mod" style="width:100%">${Object.entries(groups)
          .map(
            ([g, ms]) =>
              `<optgroup label="${g}">${ms.map((m) => `<option value="${m.id}">${m.num} ${m.title.replace(/<[^>]+>/g, "")}</option>`).join("")}</optgroup>`,
          )
          .join("")}</select>
        <div class="row"><label>screen <input id="dbg-step" type="number" min="0" value="0" style="width:52px"></label><button id="dbg-go">Open</button><button id="dbg-prev">◀</button><button id="dbg-next">▶</button><button id="dbg-nq">next Q</button></div>
        <div class="row"><select id="dbg-route"><option>home</option><option>ds-home</option><option>algo-home</option><option>profile</option><option>revise</option><option>glossary</option></select><button id="dbg-rgo">Go</button></div>
        <div class="row"><button id="dbg-done">Finish all lessons</button><button id="dbg-undone">Unfinish all</button><button id="dbg-reset">Wipe progress</button><button id="dbg-theme">Theme</button><button id="dbg-scr">Screens</button></div><pre></pre>`;
      const $ = (id) => box.querySelector("#dbg-" + id);
      $("go").onclick = async () => show(await dbg.go($("mod").value, Number($("step").value) || undefined));
      $("prev").onclick = async () => show(await dbg.step("-1"));
      $("next").onclick = async () => show(await dbg.step("+1"));
      $("nq").onclick = async () => show(await dbg.step("q"));
      $("rgo").onclick = async () => show(await dbg.go($("route").value));
      $("done").onclick = () => show(dbg.done("all"));
      $("undone").onclick = () => show(dbg.undone("all"));
      $("reset").onclick = () => show(dbg.reset());
      $("theme").onclick = () =>
        show(dbg.theme(document.documentElement.dataset.themeNow === "dark" ? "light" : "dark"));
      $("scr").onclick = () => show(dbg.screens());
      show(dbg.info());
    }
    const toggle = () => {
      box.style.display = box.style.display === "block" ? "none" : "block";
      if (box.style.display === "block") build();
    };
    btn.onclick = toggle;
    addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") toggle();
    });
  }
  panel();

  // ---- deep link: ?dbg=<id>@<screen> ----
  const q = new URLSearchParams(location.search).get("dbg");
  if (q) {
    const [id, st] = q.split("@");
    dbg.go(id, st === undefined ? undefined : Number(st));
  }
  console.info(
    "[dbg] debug helper ready: dbg.go(id, screen), dbg.step(n), dbg.list(q), dbg.done(), dbg.info()  (Ctrl+Shift+D opens the panel)",
  );
})();
