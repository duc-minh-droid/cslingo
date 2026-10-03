(function () {
  const pl = (NIC.shared.enginePlayer = NIC.shared.enginePlayer || {});
  const { fx, missed, sound, stripTags } = pl;
  const N = NIC,
    { el, qs, qsa, store } = N; // the one active session

  // =====================================================================
  //  Session building
  // =====================================================================
  function base(kind, opts) {
    return {
      kind,
      opts,
      i: 0,
      screens: [],
      life: N.lifecycle(),
      combo: 0,
      wrongRun: 0,
      xp: 0,
      start: Date.now(),
      answered: 0,
      firstRight: 0,
      firstTotal: 0,
      retries: {},
      done: false,
      demoXP: false,
    };
  }

  function lessonScreens(mod) {
    const L = N.LESSONS[mod.id] || { steps: [] };
    // each quick check gets its own screen straight after its step (like Duolingo), so the options are never below the fold
    const out = L.steps.flatMap((s, k) =>
      [{ kind: "step", k, s, Q: null, key: `read:${mod.id}:${k}` }].concat(
        s.c
          ? [
              {
                kind: "q",
                check: true,
                k,
                Q: { type: "mcq", q: s.c.q, o: s.c.o, a: s.c.a, why: s.c.why || "" },
                key: `step:${mod.id}:${k}`,
              },
            ]
          : [],
      ),
    );
    // lift the demo, predicts and takeaways out of the module's own page
    const holder = el(`<div class="pl-holder" aria-hidden="true"></div>`);
    document.body.appendChild(holder);
    const page = el(`<div class="page pl-demo"></div>`);
    holder.appendChild(page);
    try {
      mod.render(page, pl.S.life);
    } catch (e) {
      console.error("[player] render failed", mod.id, e);
      page.innerHTML = `<div class="callout rose">This demo failed to load: ${e.message}</div>`;
    }
    const head = qs("header", page);
    if (head) head.remove();
    const preds = qsa(".predict", page).filter((n) => n.__opts);
    preds.forEach((n) => n.remove());
    const tk = qs(".takeaways", page);
    if (tk) tk.remove();
    pl.S.demo = page;
    pl.S.holder = holder;
    const hasDemo = page.children.length > 0;
    if (hasDemo || L.guide) out.push({ kind: "try", guide: mod.workshop ? null : L.guide, workshop: !!mod.workshop });
    preds.forEach((n) => {
      const o = n.__opts;
      out.push({
        kind: "q",
        Q: { type: "mcq", q: o.q, o: o.opts, a: o.a, why: o.why || "" },
        key: `pred:${o.id}`,
        pred: o.id,
      });
    });
    pl.S.recap = tk;
    return out;
  }

  function open(mod, opts = {}) {
    if (pl.S) pl.close(true);
    const boss = mod.num === "Boss" && N.bossDef && N.bossDef(mod.id);
    pl.S = base(boss ? "boss" : "lesson", opts);
    pl.S.mod = mod;
    pl.S.who = (N.cast && N.cast.who(opts.who)) || "sprout";
    pl.S.review = !boss && !!store.get("nic.lessonDone", {})[mod.id];
    pl.mount(boss ? "Boss" : mod.num);
    if (boss) bossSession(mod, boss);
    else {
      pl.S.screens = lessonScreens(mod);
      const pos = store.get("nic.lessonPos", {})[mod.id] || 0;
      pl.S.i = pos > 0 && pos < pl.S.screens.length ? pos : 0;
      if (pl.S.i > 0 && fx())
        setTimeout(
          () =>
            fx().toast(
              `<b>Welcome back!</b><span>Picked up where you left off. "Start over" is in the lesson's popover.</span>`,
              { tone: "blue", ms: 2600, live: true },
            ),
          400,
        );
    }
    if (!pl.S.screens.length)
      pl.S.screens.push({ kind: "note", t: "Nothing here yet", b: "This module has no lesson steps." });
    const v = store.get("nic.visited", {});
    v[mod.id] = true;
    store.set("nic.visited", v);
    sound("whoosh");
    pl.show(0);
  }

  function bossSession(mod, B) {
    const key = (i) => `${B.id}-${i}`,
      st = store.get("nic.quiz", {});
    let todo = B.qs.map((_, i) => i).filter((i) => !(key(i) in st && typeof st[key(i)] === "object"));
    pl.S.boss = B;
    if (!todo.length) {
      pl.S.screens = [{ kind: "bossResult" }];
      return;
    }
    if (todo.length === B.qs.length) pl.S.screens.push({ kind: "bossIntro" });
    todo.forEach((i) =>
      pl.S.screens.push({ kind: "q", Q: B.qs[i], key: `boss:${B.id}:${i}`, bossIdx: i, idKey: key(i) }),
    );
    pl.S.screens.push({ kind: "bossResult" });
    if (B.matrix || B.aside)
      pl.S.refHTML = `${B.matrix ? `<h3>Distance matrix</h3><div style="max-width:360px">${N.matrixHTML()}</div>` : ""}${B.aside || ""}`;
  }

  function practice(opts = {}) {
    if (N.content && !N.content.allLoaded()) {
      N.content.all().then(() => practice(opts));
      return;
    } // it draws on every finished course
    if (pl.S) pl.close(true);
    pl.S = base("practice", opts);
    pl.S.who = "berry";
    pl.S.mod = { id: "practice", num: "Practice", title: "Practice" };
    pl.mount("Practice");
    const items = [];
    missed
      .all()
      .slice()
      .reverse()
      .forEach((m) => {
        if (items.length >= 6) return;
        if (m.boss) {
          const B = N.bossDef && N.bossDef(m.boss);
          const Q = B && B.qs[m.i];
          if (Q) items.push({ kind: "q", Q, key: m.k, practice: true, idKey: `${m.boss}-${m.i}` });
        } else if (m.Q) items.push({ kind: "q", Q: m.Q, key: m.k, practice: true });
      });
    const done = store.get("nic.lessonDone", {});
    const pool = [];
    N.modules
      .filter((m) => done[m.id] && N.LESSONS[m.id])
      .forEach((m) =>
        N.LESSONS[m.id].steps.forEach((s, k) => {
          if (s.c)
            pool.push({
              kind: "q",
              Q: { type: "mcq", q: s.c.q, o: s.c.o, a: s.c.a, why: s.c.why || "" },
              key: `step:${m.id}:${k}`,
              practice: true,
            });
        }),
      );
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    while (items.length < 8 && pool.length) {
      const p = pool.pop();
      if (!items.some((x) => x.key === p.key)) items.push(p);
    }
    pl.S.screens = items.length
      ? [{ kind: "practiceIntro", n: items.length, fixes: Math.min(6, missed.all().length) }, ...items]
      : [
          {
            kind: "note",
            who: "berry",
            mood: "sleepy",
            t: "Nothing to practise yet",
            b: "Finish a lesson first. Anything you get wrong lands here so you can fix it later.",
          },
        ];
    sound("whoosh");
    pl.show(0);
  }

  // A revision round survives a refresh or a quit: the deck (question ids), how many are answered and the score live in localStorage
  // (csl.revSession, per device). Finishing clears it; quitting only pauses it, so the Revise page offers "Continue".
  const REV_KEY = "csl.revSession";
  const revSaved = () => {
    try {
      const r = JSON.parse(localStorage.getItem(REV_KEY));
      return r && Array.isArray(r.ids) && r.ids.length ? r : null;
    } catch {
      return null;
    }
  };
  const revWrite = (r) => {
    try {
      r ? localStorage.setItem(REV_KEY, JSON.stringify(r)) : localStorage.removeItem(REV_KEY);
    } catch {
      /* storage blocked: the round just can't be resumed */
    }
  };
  const revSave = () => {
    if (pl.S && pl.S.kind === "revise" && pl.S.revIds)
      revWrite({
        ids: pl.S.revIds,
        t: pl.S.start,
        done: pl.S.firstTotal,
        right: pl.S.firstRight,
        wrong: pl.S.revWrong || [],
        xp: pl.S.xp,
        paused: false,
        opts: { n: pl.S.opts.n, subjects: pl.S.opts.subjects || null, home: pl.S.opts.home },
      });
  };

  /** A finished round goes into the history on the Revise page (nic.revRounds, synced: one entry per round, keyed by its start time). */
  function revLog() {
    if (!pl.S || !pl.S.revIds || !pl.S.revIds.length || !pl.S.firstTotal) return;
    const h = store.get("nic.revRounds", {});
    h[pl.S.start] = {
      n: pl.S.revIds.length,
      right: pl.S.firstRight,
      ids: pl.S.revIds,
      wrong: pl.S.revWrong || [],
      mods: new Set(pl.S.screens.filter((x) => x.revId).map((x) => x.mod)).size,
      end: Date.now(),
    };
    store.set("nic.revRounds", h);
  }

  function revise(opts = {}) {
    if (N.bank && !N.bank.loaded()) {
      N.bank.load().then(
        () => revise(opts),
        (e) => console.error(e),
      );
      return;
    } // question lists load on demand
    if (pl.S) pl.close(true);
    pl.S = base("revise", opts);
    pl.S.who = opts.who || "chip";
    pl.S.mod = { id: "revise", num: "Revise", title: "Revision" };
    pl.mount("Revise");
    let deck = [],
      saved = null;
    if (opts.resume && (saved = revSaved()) && N.bank) {
      const byId = new Map(N.bank.all({ learnedOnly: false }).map((x) => [x.id, x]));
      deck = saved.ids.map((id) => byId.get(id)).filter(Boolean);
      if (deck.length !== saved.ids.length) {
        saved = null;
        deck = [];
      } // the bank changed under it: start fresh below
    }
    if (!deck.length && opts.ids && N.bank) {
      // redo a past round: the same questions again
      const byId = new Map(N.bank.all({ learnedOnly: false }).map((x) => [x.id, x]));
      deck = opts.ids.map((id) => byId.get(id)).filter(Boolean);
    }
    if (!deck.length) deck = N.bank ? N.bank.deck({ n: opts.n || 10, subjects: opts.subjects || null }) : [];
    pl.S.revIds = deck.map((d) => d.id);
    const title = (id) => {
      const m = N.modules.find((x) => x.id === id);
      return m ? `${m.num === "Boss" ? "Boss" : m.num} · ${stripTags(m.title)}` : "";
    };
    pl.S.screens = deck.length
      ? [
          { kind: "reviseIntro", n: deck.length, mods: new Set(deck.map((d) => d.mod)).size },
          ...deck.map((d) => ({
            kind: "q",
            Q: d.Q,
            key: `rev:${d.id}`,
            revId: d.id,
            revTag: title(d.mod),
            mod: d.mod,
            practice: true,
          })),
        ]
      : [
          {
            kind: "note",
            who: "chip",
            mood: "sleepy",
            t: "Nothing to revise yet",
            b: "Finish a lesson first. Its questions join your revision deck.",
          },
        ];
    if (saved) {
      pl.S.firstTotal = Math.min(saved.done || 0, deck.length);
      pl.S.firstRight = Math.min(saved.right || 0, pl.S.firstTotal);
      pl.S.xp = saved.xp || 0;
      if (saved.t) pl.S.start = saved.t;
      pl.S.revWrong = saved.wrong || [];
      pl.S.i = pl.S.firstTotal ? 1 + pl.S.firstTotal : 0; // already answered ones are skipped, the intro only shows for a fresh round
      if (pl.S.i >= pl.S.screens.length) {
        revWrite(null);
        pl.S.i = 0;
        pl.S.firstTotal = pl.S.firstRight = pl.S.xp = 0;
      } else if (pl.S.firstTotal && fx())
        setTimeout(
          () =>
            fx().toast(
              `<b>Welcome back!</b><span>Question ${pl.S.firstTotal + 1} of ${deck.length}. Your round was saved.</span>`,
              { tone: "blue", ms: 2600, live: true },
            ),
          400,
        );
    }
    revSave();
    sound("whoosh");
    pl.show(0);
  }
  Object.assign(pl, { open, practice, revLog, revSave, revSaved, revWrite, revise });
})();
