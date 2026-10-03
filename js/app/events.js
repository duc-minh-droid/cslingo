(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, closePop, main, onboarding, togglePop, top } = app;
  const { qs, store, updateScore } = NIC;
  const fx = NIC.fx,
    game = NIC.game;

  // =====================================================================
  //  Game events → top bar + toasts
  // =====================================================================
  game.on("xp", () => app.renderTop());
  game.on("freeze", (d) =>
    fx.toast(
      `${NIC.emo("ice")}<b>${d.earned ? "Streak freeze earned!" : "Streak freeze used"}</b><span>${d.earned ? `You have ${d.left}. It covers a day you miss.` : "Yesterday was covered, so your streak is safe."}</span>`,
      { tone: "blue", ms: 3200 },
    ),
  );
  // canvases and charts bake colours in when drawn: redraw the page when the theme flips (never under an open lesson)
  if (NIC.theme)
    NIC.theme.onChange(() => {
      if (!NIC.player.isOpen() && qs("canvas", main)) app.route();
    });
  // level-up burst: on the complete screen's gold XP card while a lesson is open (the top bar is hidden then)
  game.on("goal", (d) => {
    setTimeout(
      () =>
        fx.lottieAt((NIC.player.isOpen() && qs(".player .pd-card.c-gold")) || qs(".tb-xp", top), "levelup", {
          size: 160,
        }),
      150,
    );
    fx.toast(
      `${NIC.mascot({ who: "chip", size: 40, mood: "love", poke: false })}<b>Daily goal reached!</b><span>${d.today} XP today</span>`,
      { ms: 2400 },
    );
    NIC.sfx.play("achieve");
  });
  game.on("quest", (q) => {
    if (q.done) {
      fx.toast(`${IC.chest}<b>Quest complete!</b><span>${q.t}. Claim it from the chest.</span>`, { ms: 2600 });
      setTimeout(() => NIC.sfx.play("chest"), 200);
      app.renderTop();
    }
  });
  game.on("ach", (a) => {
    setTimeout(() => {
      fx.toast(
        `${NIC.mascot({ who: "sprout", size: 44, mood: "laugh", acc: [a.acc], poke: false })}<b>${a.t}!</b><span>Unlocked: ${NIC.cast.ACC[a.acc].name}</span>`,
        { ms: 2800 },
      );
      NIC.sfx.play("achieve");
    }, 900);
  });

  // ---- keys: "/" search, M mute ----
  document.addEventListener("keydown", (e) => {
    if (NIC.player.isOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if (e.key === "/" && !typing) {
      e.preventDefault();
      const b = qs('[data-pop="course"]', top);
      if (app.popKind !== "course") togglePop("course", b, { instant: true });
    } // keyboard: no animation
    if (e.key === "Escape") {
      closePop();
      app.closeNodePop();
    }
    if ((e.key === "m" || e.key === "M") && !typing) NIC.sfx.set(!NIC.sfx.on());
  });

  window.addEventListener("nic:progress", () => app.renderTop());
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      window.dispatchEvent(new Event("nic:resize"));
      closePop();
    }, 150);
  });
  window.addEventListener("hashchange", app.route);
  if (NIC.cast) NIC.cast.course = SUBJECTS[app.course].who;
  updateScore();
  if ("scrollRestoration" in history) history.scrollRestoration = "manual"; // the path restores its own scroll (scrollMem)
  NIC.refresh = () => {
    updateScore();
    app.renderTop();
    app.route();
  };
  const boot = () => {
    app.route();
    setTimeout(onboarding, 400);
    // the other courses (and then the revision questions) download once the first screen is up
    setTimeout(
      () =>
        (window.requestIdleCallback || setTimeout)(() =>
          NIC.content
            .all()
            .then(() => NIC.bank && NIC.bank.load())
            .catch(() => {}),
        ),
      1200,
    );
  };
  {
    const first = NIC.content.courseOf(location.hash.slice(1) || store.get("nic.lastHome", "home"));
    (first === "all" ? NIC.content.all() : NIC.content.load(first)).catch(() => {});
  } // overlap the download with the account sync
  // logged in before: load the account's progress first so the page opens already up to date (js/sync.js waits at most 2.5 s)
  if (NIC.syncReady) NIC.syncReady.then(boot);
  else boot();
  // offline + installable: only on the deployed site (dev servers and file:// would cache stale work)
  if (
    "serviceWorker" in navigator &&
    location.protocol === "https:" &&
    !/^(localhost|127\.|\[::1\])/.test(location.hostname)
  )
    addEventListener("load", () => navigator.serviceWorker.register(`sw.js?v=${NIC.BUILD}`).catch(() => {}));
})();
