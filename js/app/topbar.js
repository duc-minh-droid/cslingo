(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, SUBJ_ORDER, inSubj, main, progress, ring, subjOf } = app;
  const { modules, qs, qsa, el, esc } = NIC;
  const fx = NIC.fx,
    game = NIC.game;

  // =====================================================================
  //  Top bar + popovers + modal
  // =====================================================================
  const top = qs("#topbar");
  app.renderTop = function renderTop() {
    const S = SUBJECTS[app.course],
      st = game.streak(),
      doneToday = game.week().find((d) => d.today).on;
    const tx = game.todayXP(),
      g = game.goal();
    top.innerHTML = `<div class="tb-in">
      <a class="tb-logo" href="#${S.home}" aria-label="CSLingo home"><b>cs</b>lingo</a>
      <button class="tb-btn tb-course" data-pop="course" aria-label="Switch course">${NIC.mascot({ who: S.who, size: 30, poke: false })}<span>${S.code}</span>${IC.chev}</button>
      <div class="tb-right">
        <button class="tb-btn tb-streak ${doneToday ? "lit" : ""}" data-pop="streak" aria-label="Streak">${IC.flame}<b>${st}</b></button>
        <button class="tb-btn tb-xp" data-pop="xp" aria-label="Daily goal">${ring(tx / g)}<b>${tx}</b></button>
        <button class="tb-btn tb-quest ${game.claimable() ? "ready" : ""}" data-pop="quests" aria-label="Daily quests">${IC.chest}<i class="tb-dot"></i></button>
        <button class="tb-btn tb-me" data-pop="me" aria-label="Menu">${NIC.mascot({ who: "sprout", size: 30, poke: false, acc: ["beanie"] })}</button>
      </div></div>`;
    qsa("[data-pop]", top).forEach((b) =>
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePop(b.dataset.pop, b);
      }),
    );
    if (doneToday) ignite();
    topBump(tx, st, tx / g);
    if (qs(".rail")) rail();
  };
  /** The first time each day the flame is lit on screen, it ignites (css/motion-app.css). The day is kept outside nic.* so it never syncs. */
  let igniteT = 0;
  function ignite() {
    if (document.body.classList.contains("in-lesson")) return; // wait until the top bar is visible again
    const d = game.today();
    let seen = null;
    try {
      seen = localStorage.getItem("csl.ignite");
    } catch {
      /* storage unavailable */
    }
    if (seen === d || igniteT) return;
    try {
      localStorage.setItem("csl.ignite", d);
    } catch {
      /* storage unavailable */
    }
    // a beat later, so the renders that follow a lesson closing don't restart it
    igniteT = setTimeout(() => {
      igniteT = 0;
      const b = qs(".tb-streak.lit", top);
      if (!b) return;
      b.classList.add("ignite");
      setTimeout(() => {
        const n = qs(".tb-streak", top);
        if (n) n.classList.remove("ignite");
      }, 1400);
    }, 300);
  }
  /** XP or streak went up (lesson, chest, quest): count up and bump once the bar is visible again, so you see it after a lesson. */
  let topShown = null;
  function topBump(tx, st, f) {
    if (document.body.classList.contains("in-lesson")) return;
    const was = topShown;
    topShown = { tx, st, f };
    if (!was) return;
    const up = (sel, from, to, wait = 0) => {
      const b = qs(sel, top),
        n = b && qs("b", b);
      if (!n) return;
      n.textContent = from;
      const go = () => {
        if (!n.isConnected) return;
        fx.count(n, to, { from, dur: fx.DUR.bar });
        fx.bump(b, { scale: 1.18, y: -2 });
      };
      wait ? setTimeout(go, wait) : go();
    };
    // XP earned in a lesson flies to the counter first (flyXP); the count starts when it lands
    if (tx > was.tx) up(".tb-xp", was.tx, tx, flying() ? FLY_MS : 0);
    if (st > was.st) up(".tb-streak", was.st, st);
    const rv = qs(".tb-xp .ring-v", top);
    if (rv && was.f !== f) {
      const L = 2 * Math.PI * 9;
      rv.style.strokeDashoffset = L * (1 - Math.min(1, was.f));
      void rv.getBoundingClientRect();
      rv.style.strokeDashoffset = L * (1 - Math.min(1, f));
    }
  }
  /** After a complete screen the player leaves NIC.player.lastXP = {n, rect}: a "+n XP" chip flies from there to the counter. */
  const FLY_MS = 520;
  const flying = () => {
    const x = NIC.player && NIC.player.lastXP;
    return !!(x && x.n && x.rect && fx.ok && !fx.reduce());
  };
  function flyXP() {
    const x = NIC.player && NIC.player.lastXP;
    if (!x) return;
    const go = flying();
    NIC.player.lastXP = null;
    const t = qs(".tb-xp", top);
    if (!go || !t) return;
    const a = t.getBoundingClientRect(),
      r = x.rect;
    const chip = el(`<span class="tb-fly" aria-hidden="true">+${x.n} XP</span>`);
    document.body.appendChild(chip);
    const w = chip.offsetWidth,
      h = chip.offsetHeight;
    const x0 = r.left + r.width / 2 - w / 2,
      y0 = r.top + r.height / 2 - h / 2,
      x1 = a.left + a.width / 2 - w / 2,
      y1 = a.top + a.height / 2 - h / 2;
    const done = () => chip.remove();
    fx.animate(
      chip,
      {
        opacity: [0, 1, 1, 0.4],
        transform: [
          `translate(${x0}px, ${y0 + 10}px) scale(0.8)`,
          `translate(${x0}px, ${y0}px) scale(1.1)`,
          `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) + (y0 - y1) * 0.25}px) scale(1)`,
          `translate(${x1}px, ${y1}px) scale(0.5)`,
        ],
      },
      { duration: FLY_MS / 1000, ease: fx.EASE_IO, times: [0, 0.18, 0.55, 1] },
    ).finished.then(done, done);
  }

  const pop = qs("#pop");
  /** Phones: a dim layer under the card so the page behind it recedes. It starts below the top bar, which stays live
   *  (tap another button to switch, or the same one to close). A tap on the dim layer closes, like any outside tap. */
  const scrim = el(`<div class="tb-scrim" aria-hidden="true"></div>`);
  document.body.appendChild(scrim);
  app.popKind = null;
  function closePop() {
    if (!app.popKind) return;
    const kind = app.popKind;
    app.popKind = null;
    scrim.classList.remove("on");
    // exit: the card leaves as a ghost on <body> (it's position: fixed, so it stays put) while #pop is free for the next one
    const card = qs(".pop-card", pop);
    // focus was inside the card (keyboard): hand it back to the top-bar button that opened it
    if (card && card.contains(document.activeElement)) {
      const t = qs(`[data-pop="${kind}"]`, top);
      if (t) t.focus({ preventScroll: true });
    }
    if (card && fx.ok && fx.exit) {
      card.classList.add("m-ghost");
      card.style.zIndex = 45;
      document.body.appendChild(card);
      fx.exit(card, { y: -6, scale: 0.95 }).then(() => card.remove());
    }
    pop.hidden = true;
    pop.innerHTML = "";
  }
  /** Wide screens: streak, daily goal and quests sit in a rail beside the path (Duolingo web layout). */
  const RAIL_MQ = matchMedia("(min-width: 1240px)");
  function rail() {
    let r = qs(".rail");
    if (!RAIL_MQ.matches || !qs(".path-page", main)) {
      if (r) r.remove();
      return;
    }
    if (!r) {
      r = el(`<aside class="rail" aria-label="Your progress"></aside>`);
      main.appendChild(r);
    }
    r.innerHTML = ["streak", "xp", "quests"]
      .map((k) => `<section class="rail-card pop-card pop-${k}" data-k="${k}">${POPS[k]()}</section>`)
      .join("");
    qsa(".rail-card", r).forEach((c) => (POP_MOUNT[c.dataset.k] || (() => {}))(c));
  }
  RAIL_MQ.addEventListener && RAIL_MQ.addEventListener("change", rail);

  function togglePop(kind, anchor, { instant = false } = {}) {
    if (app.popKind === kind) return closePop();
    if (app.popKind) closePop(); // switching (streak, then goal): the old card ghost-exits while the new one springs in
    app.popKind = kind;
    pop.innerHTML = `<div class="pop-card pop-${kind}">${POPS[kind]()}</div>`;
    pop.hidden = false;
    scrim.style.top = top.getBoundingClientRect().bottom + "px";
    scrim.classList.add("on");
    const r = anchor.getBoundingClientRect(),
      card = qs(".pop-card", pop);
    const w = Math.min(360, innerWidth - 24);
    card.style.width = w + "px";
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    card.style.left = left + "px";
    card.style.top = r.bottom + 10 + "px";
    card.style.setProperty("--ax", r.left + r.width / 2 - left + "px");
    if (fx.ok && !instant)
      fx.clean(
        card,
        fx.animate(
          card,
          fx.reduce()
            ? { opacity: [0, 1] }
            : { opacity: [0, 1], transform: ["translateY(-8px) scale(0.94)", "translateY(0px) scale(1)"] },
          { ...fx.SPRING_UI },
        ),
      );
    (POP_MOUNT[kind] || (() => {}))(card);
    if (kind === "course" && !NIC.content.allLoaded())
      NIC.content.all().then(() => {
        if (app.popKind === "course") {
          const c = qs(".pop-card", pop);
          if (c) {
            c.innerHTML = POPS.course();
            POP_MOUNT.course(c);
          }
        }
      }); // progress and search span every course
  }
  document.addEventListener("pointerdown", (e) => {
    if (app.popKind && !e.target.closest(".pop-card, [data-pop]")) closePop();
    if (!e.target.closest(".p-node, .node-pop")) app.closeNodePop();
  });

  /** Time until the daily quests roll over at local midnight, Duolingo style ("8 HOURS"). */
  const questsLeft = () => {
    const n = new Date(),
      m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1),
      h = Math.floor((m - n) / 36e5);
    return h >= 1 ? `${h} HOUR${h === 1 ? "" : "S"} LEFT` : `${Math.ceil((m - n) / 6e4)} MIN LEFT`;
  };
  const POPS = {
    course: () => `<h3>Your courses</h3>${SUBJ_ORDER.map((k) => {
      const S = SUBJECTS[k],
        p = progress(inSubj(k));
      return `<button class="pc-row ${k === app.course ? "on" : ""}" data-s="${k}">${NIC.mascot({ who: S.who, size: 44, poke: false, mood: k === app.course ? "happy" : "idle" })}<span class="pc-t"><b>${S.name}</b><small>${S.code} · ${p.d}/${p.n} done</small><span class="pc-bar"><span style="transform:scaleX(${p.f})"></span></span></span></button>`;
    }).join("")}
      <label class="pc-search">${IC.search}<input type="search" placeholder="Find a lesson" autocomplete="off" aria-label="Find a lesson"><kbd>/</kbd></label><div class="pc-res"></div>`,
    streak: () => {
      const st = game.streak(),
        wk = game.week();
      return `<div class="pop-hero">${NIC.mascot({ who: "blaze", size: 90, mood: st ? "happy" : "sleepy", act: st ? "dance" : "sleep", acc: st >= 7 ? ["crown"] : st >= 3 ? ["shades"] : [] })}<div><b class="big-n">${st}</b><span>day streak</span></div></div>
      <div class="ps-week small">${wk.map((d) => `<div class="ps-day ${d.on ? "on" : ""} ${d.frozen ? "frozen" : ""} ${d.today ? "today" : ""}"><span>${d.label}</span><i>${d.frozen ? NIC.emo("ice") : d.on ? IC.check : ""}</i></div>`).join("")}</div>
      ${!game.doneToday() && st && new Date().getHours() >= 18 ? `<div class="sk-risk">${NIC.emo("fire")}<b>Streak at risk!</b> Finish one lesson or practice before midnight.</div>` : ""}
      <p class="faint">${game.doneToday() ? "Today's done. See you tomorrow!" : "Finish a lesson or practice today to keep the flame alive."}</p>
      <div class="sk-freeze">${NIC.emo("ice")}<span><b>${game.freezes()}</b> streak freeze${game.freezes() === 1 ? "" : "s"}</span><small>Covers a missed day automatically. Finish all 3 daily quests to earn one (max 2).</small></div>`;
    },
    xp: () => {
      const tx = game.todayXP(),
        g = game.goal();
      return `<div class="pop-hero">${ring(tx / g, 34, 10)}<div><b class="big-n">${tx}<small> / ${g} XP</small></b><span>today · ${game.totalXP()} XP total</span></div></div>
      <h4>Daily goal</h4><div class="seg goal-seg">${[
        [10, "Casual"],
        [20, "Regular"],
        [30, "Serious"],
        [50, "Intense"],
      ]
        .map(([v, t]) => `<button data-g="${v}" class="${v === g ? "on" : ""}">${t}<small>${v}</small></button>`)
        .join("")}</div>`;
    },
    quests:
      () => `<div class="pop-hero">${NIC.mascot({ who: "chip", size: 80, mood: "happy", act: game.claimable() ? "dance" : "", acc: ["propeller"] })}<div><b>Daily quests</b><span class="q-left">${IC.clock}${questsLeft()}</span></div></div>
      ${game
        .quests()
        .map(
          (
            q,
          ) => `<div class="q-row ${q.done ? "done" : ""}"><div class="q-t"><b>${q.t}</b><span class="q-bar"><span style="transform:scaleX(${q.prog / q.n})"></span><i>${q.prog}/${q.n}</i></span></div>
        ${q.claimed ? `<span class="q-got">${IC.check}</span>` : q.done ? `<button class="q-claim" data-q="${q.id}">${IC.chest}<span>Claim</span></button>` : `<span class="q-chest">${IC.chest}</span>`}</div>`,
        )
        .join("")}`,
    me: () => `${app.syncRow()}<button class="menu-row" data-go="profile">${IC.face}<span>Profile & achievements</span></button>
      <button class="menu-row" data-act="sound">${IC.sound}<span>Sound: <b>${NIC.sfx.on() ? "on" : "off"}</b></span><kbd>M</kbd></button>`,
  };
  const POP_MOUNT = {
    course(card) {
      qsa(".pc-row", card).forEach((b) =>
        b.addEventListener("click", () => {
          closePop();
          location.hash = SUBJECTS[b.dataset.s].home;
        }),
      );
      const inp = qs("input", card),
        res = qs(".pc-res", card);
      const run = () => {
        const f = inp.value.trim().toLowerCase();
        if (!f) {
          res.innerHTML = "";
          return;
        }
        const hits = modules
          .filter((m) => (m.title + " " + m.num + " " + (m.blurb || "")).toLowerCase().includes(f))
          .slice(0, 8);
        res.innerHTML = hits.length
          ? hits
              .map(
                (m) =>
                  `<button class="pc-hit" data-id="${m.id}"><span class="pc-num">${m.num}</span><span>${m.title}<small>${SUBJECTS[subjOf(m)].name}</small></span></button>`,
              )
              .join("")
          : `<p class="faint">No lessons match "${esc(f)}".</p>`;
        qsa(".pc-hit", res).forEach((b) =>
          b.addEventListener("click", () => {
            closePop();
            location.hash = b.dataset.id;
          }),
        );
      };
      inp.addEventListener("input", run);
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const h = qs(".pc-hit", res);
          if (h) h.click();
        }
      });
      // touch: the keyboard would cover the course list, so only focus the search with a real pointer
      if (card.dataset.focus !== "no" && !matchMedia("(pointer: coarse)").matches) setTimeout(() => inp.focus(), 30);
    },
    xp(card) {
      const seg = qs(".goal-seg", card);
      app.segPill(seg, false);
      qsa("[data-g]", card).forEach((b) =>
        b.addEventListener("click", () => {
          game.setGoal(+b.dataset.g);
          app.pickSeg(seg, b);
          app.renderTop();
          setTimeout(() => {
            if (app.popKind === "xp" && card.isConnected) closePop();
          }, 200); // let the choice be seen
        }),
      );
    },
    quests(card) {
      qsa(".q-claim", card).forEach((b) =>
        b.addEventListener("click", () => {
          if (b.disabled) return;
          b.disabled = true;
          const row = b.closest(".q-row");
          NIC.sfx.play("chest");
          // the claim chest opens in place, like the path chest
          const old = qs("svg", b);
          old.outerHTML = app.CHEST(false);
          b.style.animation = "none";
          app.chestAnim(qs(".p-chest-svg", b), {
            onPop() {
              const n = game.claim(b.dataset.q);
              b.dataset.n = n;
              fx.floatText(b, `+${n} XP`, "#ff9600");
              fx.celebrate(b, { silent: true });
            },
            onEnd() {
              const got = el(`<span class="q-got">${IC.check}</span>`);
              b.replaceWith(got);
              fx.springIn(got, { from: 0.2, rot: -30, bounce: fx.SPRING_POP.bounce, dur: fx.SPRING_POP.duration });
              row.classList.add("claimed");
              app.renderTop();
            },
          });
        }),
      );
    },
    me(card) {
      qsa("[data-go]", card).forEach((b) =>
        b.addEventListener("click", () => {
          closePop();
          location.hash = b.dataset.go;
        }),
      );
      qs('[data-act="sound"]', card).addEventListener("click", () => {
        NIC.sfx.set(!NIC.sfx.on());
        qs('[data-act="sound"] b', card).textContent = NIC.sfx.on() ? "on" : "off";
      });
      app.wireSync(card);
    },
  };
  Object.assign(app, { closePop, flyXP, rail, togglePop, top });
})();
