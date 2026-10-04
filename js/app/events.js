(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, closePop, main, onboarding, togglePop, top } = app;
  const { qs, qsa, store, updateScore } = NIC;
  const fx = NIC.fx,
    game = NIC.game;

  // =====================================================================
  //  Game events → top bar + toasts
  // =====================================================================
  game.on("xp", () => app.renderTop());
  game.on("freeze", (d) =>
    fx.toast(
      `${NIC.emo("ice")}<b>${d.earned ? "Streak freeze earned!" : "Streak freeze used"}</b><span>${d.earned ? `You have ${d.left}. It covers a day you miss.` : d.count > 1 ? `${d.count} missed days were covered, so your streak is safe.` : "Yesterday was covered, so your streak is safe."}</span>`,
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
  // sound: the Profile switch and the menu row follow the setting, whichever of them (or the M key) changed it
  window.addEventListener("csl:sound", (e) => {
    const on = !!(e.detail && e.detail.on);
    qsa('[data-act="sound"] b').forEach((b) => (b.textContent = on ? "on" : "off"));
    const sw = qs("#pfSound");
    if (sw) {
      sw.classList.toggle("on", on);
      sw.setAttribute("aria-checked", on);
    }
  });
  let rt,
    lastW = innerWidth;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      window.dispatchEvent(new Event("nic:resize"));
      // a phone's keyboard shrinks the window's height but not its width: that must not close the popover being typed in
      if (innerWidth !== lastW) closePop();
      lastW = innerWidth;
    }, 150);
  });
  // a new day: the flame, the goal ring and the quests start again at midnight, also in a tab that stayed open (or asleep) overnight
  let shownDay = game.today();
  const newDay = () => {
    if (game.today() === shownDay) return;
    shownDay = game.today();
    app.renderTop();
  };
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && newDay());
  window.addEventListener("focus", newDay);
  (function midnight() {
    const n = new Date();
    setTimeout(
      () => {
        newDay();
        midnight();
      },
      new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 2) - n,
    );
  })();
  // skip link: the dock comes after the whole path in the page, so the first Tab offers a jump to it (the hash must not change: it is the route)
  const skip = qs(".skip-link");
  if (skip)
    skip.addEventListener("click", (e) => {
      e.preventDefault();
      const b = qs("#dock button.on") || qs("#dock button");
      if (b) b.focus();
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
  /* Data Saver and 2G connections don't prefetch: the other courses and the revision questions download when a page needs them. */
  const lean = () => {
    const c = navigator.connection;
    return !!c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ""));
  };
  const boot = () => {
    app.route();
    setTimeout(onboarding, 400);
    // the other courses (and then the revision questions) download once the first screen is up
    if (!lean())
      setTimeout(
        () =>
          (window.requestIdleCallback || setTimeout)(() =>
            NIC.content
              .all()
              .then(() => NIC.bank && NIC.bank.load())
              .catch(() => {})
              .then(() => setTimeout(NIC.saveForOffline, 1500)),
          ),
        1200,
      );
    else setTimeout(() => NIC.saveForOffline && NIC.saveForOffline(), 8000); // what has loaded so far; nothing more is fetched on a lean connection
  };
  {
    const first = NIC.content.courseOf(location.hash.slice(1) || store.get("nic.lastHome", "home"));
    (first === "all" ? NIC.content.all() : NIC.content.load(first)).catch(() => {});
  } // overlap the download with the account sync
  // logged in before: load the account's progress first so the page opens already up to date (js/sync.js waits at most 2.5 s)
  if (NIC.syncReady) NIC.syncReady.then(boot);
  else boot();
  // offline + installable: only on the deployed site (dev servers and file:// would cache stale work)
  const SW_ON =
    "serviceWorker" in navigator &&
    location.protocol === "https:" &&
    !/^(localhost|127\.|\[::1\])/.test(location.hostname);
  if (SW_ON) addEventListener("load", () => navigator.serviceWorker.register(`sw.js?v=${NIC.BUILD}`).catch(() => {}));
  /** Tell the service worker which files this visit used (sw.js saves them, so the app opens offline after one visit). */
  NIC.saveForOffline = () => {
    if (!SW_ON) return;
    navigator.serviceWorker.ready
      .then((reg) => {
        const urls = performance.getEntriesByType("resource").map((r) => r.name);
        if (reg.active) reg.active.postMessage({ type: "precache", urls });
      })
      .catch(() => {});
  };
})();
