(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, SUBJ_ORDER, inSubj, main, numLabel, progress, ring, subjOf } = app;
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
    const ready = game.claimable();
    top.innerHTML = `<div class="tb-in">
      <a class="tb-logo" href="#${S.home}" aria-label="CSLingo home"><b>cs</b>lingo</a>
      <button class="tb-btn tb-course" data-pop="course" aria-label="Switch course or search lessons" aria-haspopup="true" aria-expanded="false">${NIC.mascot({ who: S.who, size: 30, poke: false })}<span>${S.code}</span>${IC.chev}</button>
      <div class="tb-right">
        <button class="tb-btn tb-streak ${doneToday ? "lit" : ""}" data-pop="streak" aria-label="Streak: ${st} day${st === 1 ? "" : "s"}${doneToday ? ", done today" : ""}" aria-haspopup="true" aria-expanded="false">${IC.flame}<b>${st}</b></button>
        <button class="tb-btn tb-xp" data-pop="xp" aria-label="Daily goal: ${tx} of ${g} XP" aria-haspopup="true" aria-expanded="false">${ring(tx / g)}<b>${tx}</b></button>
        <button class="tb-btn tb-quest ${ready ? "ready" : ""}" data-pop="quests" aria-label="Daily quests${ready ? ", a reward is ready to claim" : ""}" aria-haspopup="true" aria-expanded="false">${IC.chest}<i class="tb-dot"></i></button>
        <button class="tb-btn tb-me" data-pop="me" aria-label="Menu" aria-haspopup="true" aria-expanded="false">${NIC.mascot({ who: "sprout", size: 30, poke: false, acc: ["beanie"] })}</button>
      </div></div>`;
    if (app.popKind) {
      const open = qs(`[data-pop="${app.popKind}"]`, top);
      if (open) open.setAttribute("aria-expanded", "true"); // the bar was redrawn under an open popover
    }
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
    qsa("[data-pop][aria-expanded]", top).forEach((b) => b.setAttribute("aria-expanded", "false"));
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
  /** Wide screens: streak, daily goal and quests sit in a rail beside the path (Duolingo web layout). The rail is 300px wide and sits
   336px right of centre, so it needs a 1272px window (css/shell/rail-chests-login.css uses the same number). */
  const RAIL_MQ = matchMedia("(min-width: 1272px)");
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
    anchor.setAttribute("aria-expanded", "true");
    pop.innerHTML = `<div class="pop-card pop-${kind}" role="group" aria-label="${POP_NAMES[kind]}">${POPS[kind]()}</div>`;
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
  /* ---- lesson search: course popover ---- */
  const MAX_HITS = 20;
  /** Lower-case, possessives and apostrophes dropped, punctuation turned into spaces: "Dijkstra's" and "dijkstras" read the same. */
  const norm = (t) =>
    String(t || "")
      .toLowerCase()
      .replace(/['\u2019]s\b/g, "")
      .replace(/['\u2019]/g, "")
      .replace(/[^a-z0-9.]+/g, " ")
      .replace(/(^| )\.+|\.+(?= |$)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  let index = { n: -1, rows: [] };
  /** Per lesson: its title, then its number, kind, unit title and course, then its blurb, all normalised once. */
  function searchRows() {
    if (index.n !== modules.length) {
      index = {
        n: modules.length,
        rows: modules.map((m) => {
          const S = SUBJECTS[subjOf(m)];
          return {
            m,
            title: norm(m.title),
            ctx: norm(`${m.num} ${numLabel(m)} ${S.lectures[m.lecture] || ""} ${S.name} ${S.code}`),
            body: norm(m.blurb),
          };
        }),
      };
    }
    return index.rows;
  }
  /** Every word of the query has to appear (in any order, spaces and plurals don't matter). A number matches a whole number or a
      lesson number's first part ("3" finds "Phase 3" and 3.1, not 1.3). Title hits come first, then number, unit and course, then
      the blurb; lessons keep their path order inside each group. */
  function findLessons(q) {
    const words = norm(q).split(" ").filter(Boolean),
      glued = words.join("");
    if (!glued) return [];
    const has = (text, w) => {
      if (/^\d/.test(w)) return text.split(" ").some((x) => x === w || x.startsWith(w + "."));
      return text.includes(w) || (w.length > 3 && w.endsWith("s") && text.includes(w.slice(0, -1)));
    };
    const all = (text) =>
      words.every((w) => has(text, w)) || (!/\d/.test(glued) && text.replace(/ /g, "").includes(glued));
    const out = [];
    searchRows().forEach((r, k) => {
      const rank = all(r.title)
        ? r.title.startsWith(words[0])
          ? 0
          : 1
        : all(`${r.title} ${r.ctx}`)
          ? 2
          : all(`${r.title} ${r.ctx} ${r.body}`)
            ? 3
            : -1;
      if (rank >= 0) out.push([rank, k, r.m]);
    });
    return out.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]);
  }

  const POP_NAMES = {
    course: "Courses and search",
    streak: "Streak",
    xp: "Daily goal",
    quests: "Daily quests",
    me: "Menu",
  };
  const POPS = {
    course:
      () => `<label class="pc-search">${IC.search}<input type="search" role="combobox" aria-expanded="false" aria-controls="pc-res" aria-autocomplete="list" placeholder="Find a lesson" autocomplete="off" aria-label="Find a lesson"><kbd aria-hidden="true">/</kbd></label><div class="pc-res" id="pc-res" role="listbox" aria-label="Matching lessons"></div>
      <div class="pc-courses"><h3>Your courses</h3>${SUBJ_ORDER.map((k) => {
        const S = SUBJECTS[k],
          p = progress(inSubj(k));
        return `<button class="pc-row ${k === app.course ? "on" : ""}" data-s="${k}" ${k === app.course ? 'aria-current="true"' : ""}>${NIC.mascot({ who: S.who, size: 44, poke: false, mood: k === app.course ? "happy" : "idle" })}<span class="pc-t"><b>${S.name}</b><small>${S.code} · ${p.d}/${p.n} done</small><span class="pc-bar"><span style="transform:scaleX(${p.f})"></span></span></span></button>`;
      }).join("")}</div>`,
    streak: () => {
      const st = game.streak(),
        wk = game.week();
      return `<div class="pop-hero">${NIC.mascot({ who: "blaze", size: 90, mood: st ? "happy" : "sleepy", act: st ? "dance" : "sleep", acc: st >= 7 ? ["crown"] : st >= 3 ? ["shades"] : [] })}<div><b class="big-n">${st}</b><span>day streak</span></div></div>
      <div class="ps-week small">${wk.map((d) => `<div class="ps-day ${d.on ? "on" : ""} ${d.frozen ? "frozen" : ""} ${d.today ? "today" : ""}"><span>${d.label}</span><i>${d.frozen ? NIC.emo("ice") : d.on ? IC.check : ""}</i></div>`).join("")}</div>
      ${!game.doneToday() && st && new Date().getHours() >= 18 ? `<div class="sk-risk">${NIC.emo("fire")}<b>Streak at risk!</b> Finish one lesson or practice before midnight.</div>` : ""}
      <p class="faint">${game.doneToday() ? "Today's done. See you tomorrow!" : "Finish a lesson or practice today to keep the flame alive."}</p>
      <div class="sk-freeze">${NIC.emo("ice")}<span><b>${game.freezes()}</b> streak freeze${game.freezes() === 1 ? "" : "s"}</span><small>A freeze covers a day you miss. Claim all 3 daily quests to earn one (you can hold 2).</small></div>`;
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
      let hits = [],
        at = -1;
      const setActive = (k) => {
        at = k;
        qsa(".pc-hit", res).forEach((b, i) => {
          b.classList.toggle("active", i === k);
          b.setAttribute("aria-selected", i === k);
        });
        const b = qsa(".pc-hit", res)[k];
        if (b) {
          inp.setAttribute("aria-activedescendant", b.id);
          b.scrollIntoView({ block: "nearest" });
        } else inp.removeAttribute("aria-activedescendant");
      };
      const run = () => {
        const q = inp.value.trim();
        card.classList.toggle("pc-searching", !!q); // the course rows make way for the results
        inp.setAttribute("aria-expanded", !!q);
        if (!q) {
          hits = [];
          res.innerHTML = "";
          inp.removeAttribute("aria-activedescendant");
          return;
        }
        const found = findLessons(q);
        hits = found.slice(0, MAX_HITS);
        res.innerHTML = hits.length
          ? hits
              .map((m, k) => {
                const S = SUBJECTS[subjOf(m)],
                  unit = (S.lectures[m.lecture] || "").split(" — ")[0];
                return `<button class="pc-hit" role="option" id="pc-hit-${k}" aria-selected="false" data-id="${m.id}"><span class="pc-num">${numLabel(m)}</span><span>${esc(m.title)}<small>${S.name}${unit ? " · " + unit : ""}</small></span></button>`;
              })
              .join("") +
            (found.length > hits.length
              ? `<p class="faint pc-more">+${found.length - hits.length} more. Keep typing to narrow it down.</p>`
              : "")
          : `<p class="faint">No lessons match "${esc(q)}".</p>`;
        qsa(".pc-hit", res).forEach((b) =>
          b.addEventListener("click", () => {
            closePop();
            location.hash = b.dataset.id;
          }),
        );
        setActive(hits.length ? 0 : -1);
      };
      inp.addEventListener("input", run);
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const h = qsa(".pc-hit", res)[Math.max(at, 0)];
          if (h) h.click();
        } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && hits.length) {
          e.preventDefault();
          setActive((at + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length);
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
