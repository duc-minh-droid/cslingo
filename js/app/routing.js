(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const {
    IC,
    SUBJECTS,
    SUBJ_ORDER,
    closePop,
    flyXP,
    hideTip,
    home,
    main,
    modal,
    pathAnchor,
    practicePage,
    profilePage,
    setCourse,
    subjOf,
  } = app;
  const { modules, qs, qsa, el, store, lifecycle } = NIC;
  const fx = NIC.fx,
    game = NIC.game;

  // =====================================================================
  //  Dock + routing
  // =====================================================================
  const dock = qs("#dock");
  dock.innerHTML = `<button data-to="learn" aria-label="Learn">${IC.home}<span>Learn</span></button><button data-to="practice" aria-label="Practice">${IC.dumbbell}<span>Practice</span><i class="dk-badge" hidden></i></button>`;
  qsa("button", dock).forEach((b) =>
    b.addEventListener("click", () => {
      location.hash = b.dataset.to === "learn" ? SUBJECTS[app.course].home : b.dataset.to;
    }),
  );
  /* The blue "on" pill is one indicator that slides between tabs (FLIP: jump to the new box, animate from the old one). */
  let dockK = null,
    dockN = null;
  function dockInd(animate) {
    let ind = qs(".dk-ind", dock);
    if (!ind) {
      ind = el(`<i class="dk-ind" aria-hidden="true"></i>`);
      dock.prepend(ind);
      dock.classList.add("m-ind");
      if (window.ResizeObserver) new ResizeObserver(() => dockInd(false)).observe(dock); // fonts, phone layout
    }
    const b = qs("button.on", dock);
    ind.style.opacity = b ? "" : "0"; // the Profile page has no dock tab: no pill
    if (!b) return;
    flipInd(ind, b, animate);
  }
  /** Move a sliding indicator onto button b: jump to the new box, then animate from the old one (transform-origin is the centre). */
  function flipInd(ind, b, animate) {
    const box = { x: b.offsetLeft, y: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight },
      was = ind._box;
    ind._box = box;
    Object.assign(ind.style, { left: box.x + "px", top: box.y + "px", width: box.w + "px", height: box.h + "px" });
    if (
      animate &&
      was &&
      was.w &&
      box.w &&
      box.h &&
      (was.x !== box.x || was.y !== box.y || was.w !== box.w) &&
      fx.ok &&
      !fx.reduce()
    ) {
      const dx = was.x + was.w / 2 - (box.x + box.w / 2),
        dy = was.y + was.h / 2 - (box.y + box.h / 2);
      const a = fx.animate(
        ind,
        {
          transform: [
            `translate(${dx}px, ${dy}px) scale(${was.w / box.w}, ${was.h / box.h})`,
            "translate(0px, 0px) scale(1, 1)",
          ],
        },
        { ...fx.SPRING_UI },
      );
      fx.clean(ind, a, ["transform"]);
    }
  }
  /** Any single-choice .seg gets one pill that slides to the button marked .on (goal, theme, practice tabs). Call again after the choice changes. */
  app.segPill = function segPill(seg, animate = true) {
    if (!seg) return;
    let ind = seg.querySelector(":scope > .seg-ind");
    if (!ind) {
      ind = el(`<i class="seg-ind" aria-hidden="true"></i>`);
      seg.prepend(ind);
      seg.classList.add("m-pill");
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => (seg.isConnected ? app.segPill(seg, false) : ro.disconnect()));
        ro.observe(seg);
      }
    }
    const b = seg.querySelector(":scope > button.on");
    ind.classList.toggle("off", !b);
    if (b) flipInd(ind, b, animate);
  };
  /** Mark b as the chosen button of seg (class + ARIA) and slide the pill to it. */
  app.pickSeg = function pickSeg(seg, b) {
    qsa(":scope > button", seg).forEach((x) => {
      x.classList.toggle("on", x === b);
      if (x.hasAttribute("aria-checked")) x.setAttribute("aria-checked", x === b);
      if (x.hasAttribute("aria-selected")) x.setAttribute("aria-selected", x === b);
    });
    app.segPill(seg);
  };
  NIC.segPill = app.segPill;
  const setDock = (k) => {
    qsa("button", dock).forEach((b) => b.classList.toggle("on", b.dataset.to === k));
    const moved = dockK !== null && dockK !== k;
    dockK = k;
    dockInd(moved);
    const ic = qs(`button[data-to="${k}"] svg`, dock);
    if (moved && ic) fx.bump(ic, { scale: 1.25, y: -4 });
    const n = NIC.bank ? NIC.bank.dueSeen() : 0,
      bd = qs(".dk-badge", dock);
    if (n) {
      bd.hidden = false;
      bd.classList.remove("m-ghost");
      bd.textContent = n > 99 ? "99+" : n;
    } else if (!bd.hidden) {
      // count reached 0: the badge shrinks away instead of vanishing
      if (dockN && fx.ok) {
        bd.classList.add("m-ghost");
        fx.exit(bd, { scale: 0.3 }).then(() => {
          if (bd.classList.contains("m-ghost")) {
            bd.hidden = true;
            bd.classList.remove("m-ghost");
          }
          bd.style.opacity = "";
          bd.style.transform = "";
        });
      } else bd.hidden = true;
    }
    if (n && dockN !== null && n !== dockN)
      dockN
        ? fx.bump(bd, { scale: 1.35 })
        : fx.springIn(bd, { from: 0.2, bounce: fx.SPRING_POP.bounce, dur: fx.SPRING_POP.duration });
    dockN = n;
  };

  /** First visit: pick a course and a daily goal, with Sprout waving. Shown once. */
  function onboarding() {
    if (navigator.webdriver || store.get("nic.onboarded", false) || Object.keys(store.get("nic.lessonDone", {})).length)
      return; // automated test browsers skip it
    let pick = app.course,
      goal = game.goal();
    const m = modal(
      `<div class="ob">
      <div class="ob-hero">${NIC.mascot({ who: "sprout", size: 120, act: "wave", mood: "happy", acc: ["party"] })}<div class="bubble ob-bubble">Hi! I'm Sprout. Let's learn some computer science, one bite at a time.</div></div>
      <h2>Pick a course</h2>
      <div class="ob-courses">${SUBJ_ORDER.map((k) => `<button class="ob-c ${k === pick ? "on" : ""}" data-c="${k}">${NIC.mascot({ who: SUBJECTS[k].who, size: 56, mood: "happy", poke: false })}<b>${SUBJECTS[k].name}</b><small>${SUBJECTS[k].code}</small></button>`).join("")}</div>
      <h2>Daily goal</h2>
      <div class="seg goal-seg ob-goal">${[
        [10, "Casual"],
        [20, "Regular"],
        [30, "Serious"],
        [50, "Intense"],
      ]
        .map(([v, t]) => `<button data-g="${v}" class="${v === goal ? "on" : ""}">${t}<small>${v} XP</small></button>`)
        .join("")}</div>
      <button class="btn big primary ob-go">Let's go</button></div>`,
      { cls: "ob-modal" },
    );
    const finish = () => {
      store.set("nic.onboarded", true);
    };
    qsa(".ob-c", m).forEach((b) =>
      b.addEventListener("click", () => {
        pick = b.dataset.c;
        qsa(".ob-c", m).forEach((x) => x.classList.toggle("on", x === b));
        NIC.sfx.play("select");
      }),
    );
    const obSeg = qs(".ob-goal", m);
    app.segPill(obSeg, false);
    qsa("[data-g]", m).forEach((b) =>
      b.addEventListener("click", () => {
        goal = +b.dataset.g;
        app.pickSeg(obSeg, b);
        NIC.sfx.play("select");
      }),
    );
    qs(".ob-go", m).addEventListener("click", () => {
      finish();
      game.setGoal(goal);
      setCourse(pick);
      m.close();
      NIC.sfx.play("complete");
      const h = SUBJECTS[pick].home;
      if (location.hash.slice(1) !== h) location.hash = h;
      else app.route(); // the hashchange routes; only route by hand when the hash is already there
    });
    qs(".modal-x", m).addEventListener("click", finish);
    m.addEventListener("click", (e) => {
      if (e.target === m) finish();
    });
  }

  /* Page changes animate through fx.swap (View Transitions): dock tabs slide left/right in tab order, other page changes crossfade.
     Opening a lesson, the first render, re-rendering the same page and leaving the player all render at once (tests rely on it). */
  const TABS = ["learn", "practice", "profile"];
  const tabOf = (id) => {
    const p = id.split("/")[0];
    return p === "profile" ? "profile" : p === "practice" || p === "revise" ? "practice" : "learn";
  };
  let routeTok = 0;
  app.lastRoute = null;
  app.route = function route() {
    const id = location.hash.slice(1) || store.get("nic.lastHome", "home");
    // a course's lessons download the first time it is needed (the rest load quietly after the first screen)
    const need = NIC.content.courseOf(id);
    if (need && !(need === "all" ? NIC.content.allLoaded() : NIC.content.has(need))) {
      (need === "all" ? NIC.content.all() : NIC.content.load(need)).then(app.route, (e) => console.error(e));
      return;
    }
    const mod = modules.some((m) => m.id === id),
      prev = app.lastRoute,
      tok = ++routeTok;
    app.lastRoute = { id, mod, tab: tabOf(id) };
    const go = (sw) => {
      if (tok === routeTok) render(!!sw);
    }; // a newer route wins over a transition still waiting to run
    const inTabs = prev && prev.tab === "practice" && app.lastRoute.tab === "practice" && !prev.mod && !mod; // Due <-> Mistakes: the panel changes in place
    if (mod || !prev || prev.mod || prev.id === id || inTabs || NIC.player.isOpen() || !fx.swap) return go();
    fx.swap(() => go(true), { dir: Math.sign(TABS.indexOf(app.lastRoute.tab) - TABS.indexOf(prev.tab)), el: main });
  };
  /* homeIn: the course whose path is in #main right now (null for other pages). scrollMem: path scroll per course home. */
  let homeIn = null;
  app.calm = false;
  const scrollMem = {};
  function render(swapped = false) {
    const id = location.hash.slice(1) || store.get("nic.lastHome", "home");
    const mod = modules.find((m) => m.id === id);
    const page = id.split("/")[0];
    app.calm = swapped; // the page transition already moved the page: skip in-page staggers
    const lesson = (m) => {
      const s = subjOf(m);
      store.set("nic.lastHome", SUBJECTS[s].home);
      setCourse(s);
      const last = store.get("nic.last", {});
      last[s] = m.id;
      store.set("nic.last", last);
      document.title = `${m.num} ${m.title} · CSLingo`;
      NIC.player.lastXP = null;
      NIC.player.open(m, { home: SUBJECTS[s].home, who: SUBJECTS[s].who });
    };
    // a lesson opened from its own course's path: keep the path as it is under the player
    if (mod && homeIn === subjOf(mod) && app.life && qs(".path-page", main)) {
      closePop();
      app.closeNodePop();
      hideTip();
      lesson(mod);
      return;
    }
    const wasHome = homeIn,
      wasAt = homeIn ? pathAnchor() : null;
    if (homeIn) scrollMem[SUBJECTS[homeIn].home] = wasAt;
    homeIn = null;
    if (app.life) app.life.dispose();
    app.life = lifecycle();
    closePop();
    app.closeNodePop();
    main.innerHTML = "";
    if (!mod && NIC.player.isOpen()) NIC.player.close(true);
    if (page === "practice" || page === "profile" || page === "revise") {
      app.renderTop();
      setDock(page === "profile" ? "profile" : "practice");
      document.title = `${page === "profile" ? "Profile" : "Practice"} · CSLingo`;
      page === "profile" ? profilePage() : practicePage();
      window.scrollTo(0, 0);
      flyXP();
      return;
    }
    setDock("learn");
    if (!mod) {
      const s = SUBJ_ORDER.find((k) => SUBJECTS[k].home === id) || "nic";
      store.set("nic.lastHome", SUBJECTS[s].home);
      setCourse(s);
      document.title = `${SUBJECTS[s].name} · CSLingo`;
      // the same path again (lesson closed, theme flip, reset): keep the scroll and skip the entrance; coming back from another page: restore its scroll
      const again = wasHome === s,
        at = again ? wasAt : scrollMem[SUBJECTS[s].home];
      window.scrollTo(0, 0);
      home(s, { quiet: again, at });
      homeIn = s;
      flyXP();
      return;
    }
    const s = subjOf(mod);
    window.scrollTo(0, 0);
    home(s);
    homeIn = s;
    lesson(mod);
  }
  Object.assign(app, { onboarding });
})();
