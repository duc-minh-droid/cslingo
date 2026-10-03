(function () {
  const pl = (NIC.shared.enginePlayer = NIC.shared.enginePlayer || {});
  const { fx, missed, open, practice, reduce, revSaved, revWrite, revise, sound } = pl;
  const N = NIC,
    { qs, qsa } = N;

  // =====================================================================
  //  Quit, keys, close
  // =====================================================================
  pl.askQuit = function askQuit() {
    if (!pl.S) return;
    const done = pl.S.screens[pl.S.i] && ["complete", "streak"].includes(pl.S.screens[pl.S.i].kind);
    if (done) return pl.close();
    const m = qs(".pl-modal", pl.S.root);
    m.innerHTML = `<div class="pl-sheet">${N.mascot({ who: "berry", size: 120, mood: "cry", act: "cry" })}<h2>Wait, don't go!</h2><p class="lede">You're doing great. ${pl.S.kind === "lesson" ? "Your place is saved, but the XP for this lesson isn't banked yet." : "Leave now and this round won't count."}</p>
      <button class="btn big primary" data-m="stay">Keep learning</button><button class="btn big ghost pl-quit-btn" data-m="quit">End session</button></div>`;
    m.hidden = false;
    sound("sad");
    if (fx() && fx().ok)
      fx().clean(
        qs(".pl-sheet", m),
        fx().animate(
          qs(".pl-sheet", m),
          reduce()
            ? { opacity: [0, 1] }
            : { transform: ["translateY(60px) scale(0.96)", "translateY(0px) scale(1)"], opacity: [0, 1] },
          reduce() ? { duration: fx().DUR.m } : fx().SPRING,
        ),
      );
    if (fx() && fx().ok) fx().clean(m, fx().animate(m, { opacity: [0, 1] }, { duration: fx().DUR.s }), ["opacity"]);
    qs('[data-m="stay"]', m).onclick = () => {
      sound("pop");
      if (!fx() || !fx().exit || !fx().ok) {
        m.hidden = true;
        return;
      }
      m.style.pointerEvents = "none"; // the sheet drops away, then the layer hides
      Promise.all([
        fx().exit(qs(".pl-sheet", m), { y: 40, scale: 0.97, dur: 0.18 }),
        fx().exit(m, { scale: 1, dur: 0.18 }),
      ]).then(() => {
        m.hidden = true;
        m.style.pointerEvents = "";
        requestAnimationFrame(() => setTimeout(() => (m.style.opacity = ""), 0));
      });
    };
    qs('[data-m="quit"]', m).onclick = () => pl.close();
  };

  pl.onKey = function onKey(e) {
    if (!pl.S || e.ctrlKey || e.metaKey || e.altKey) return;
    const m = qs(".pl-modal", pl.S.root);
    const typing = /input|textarea|select/i.test(document.activeElement && document.activeElement.tagName);
    if (e.key === "Escape") {
      e.preventDefault();
      if (!m.hidden) m.hidden = true;
      else pl.askQuit();
      return;
    }
    if (!m.hidden) {
      if (e.key === "Enter") {
        e.preventDefault();
        m.hidden = true;
      }
      return;
    }
    if (typing) return;
    // a workshop owns its keys: Enter presses the focused control, arrows move the plan dot (not "Continue" / "back")
    if ((e.key === "Enter" || e.key === "ArrowLeft") && e.target.closest && e.target.closest(".wk")) return;
    // keyboard moves take the no-animation path: no slide between screens, no sheet slide (S.kbd is read synchronously)
    const kbd = (fn) => {
      const s = pl.S;
      s.kbd = true;
      try {
        fn();
      } finally {
        s.kbd = false;
      }
    };
    if (/^[1-9]$/.test(e.key)) {
      const opts = qsa(
        ".pl-screen:not(.leaving) .pl-body .opt, .pl-screen:not(.leaving) .pl-body .qc-line",
        pl.S.stage,
      ).filter((b) => !b.disabled);
      const b = opts[+e.key - 1];
      if (b) {
        e.preventDefault();
        kbd(() => b.click());
      }
      return;
    }
    if (e.key === "Enter" && !pl.S.go.disabled) {
      e.preventDefault();
      kbd(() => pl.S.go.click());
    }
    if (
      e.key === "ArrowLeft" &&
      !qs(".pl-back", pl.S.root).hidden &&
      !(e.target.closest && e.target.closest(".rn, .pl-body"))
    ) {
      e.preventDefault();
      kbd(pl.goBack);
    }
  };

  pl.close = function close(silent = false) {
    if (!pl.S) return;
    const s = pl.S;
    pl.S = null;
    if (!silent && s.kind === "revise") {
      const r = revSaved();
      if (r) revWrite({ ...r, paused: true });
    } // quit: keep the round, but a refresh shouldn't reopen it
    document.removeEventListener("keydown", s.keys);
    s.stopIdle && s.stopIdle();
    s.life.dispose();
    if (s.holder) s.holder.remove();
    document.body.classList.remove("in-lesson");
    N.shield(false);
    const root = s.root;
    const gone = () => root.remove();
    if (!silent && s.completed) {
      // the app flies the XP from the gold card to the top-bar counter (NIC.player.lastXP)
      const card = qs(".pd-card.c-gold[data-xp]", root);
      const r = card ? card.getBoundingClientRect() : s.goldRect;
      N.player.lastXP = { n: s.xpTotal || 0, rect: r && r.width ? r : null };
    }
    if (!silent && N.fx && N.fx.ok && N.fx.exit) {
      root.classList.add("m-ghost");
      N.fx.exit(root, { y: 30, scale: 1, dur: N.fx.DUR.m }).then(gone);
    } else gone();
    if (!silent) {
      const h = s.opts.home || "home";
      if (location.hash.slice(1) !== h) location.hash = h;
      else window.dispatchEvent(new Event("hashchange"));
    }
    if (s.opts.returnToRevise) {
      const r = revSaved();
      if (r)
        setTimeout(() => {
          if (!pl.S) revise({ resume: true, ...(r.opts || {}), home: (r.opts && r.opts.home) || "practice" });
        }, 80);
    }
  };

  /** For tools/smoke.js and tools/boss-test.js. */
  const state = () => {
    if (!pl.S) return { open: false };
    const sc = pl.S.screens[pl.S.i] || {};
    return {
      open: true,
      who: pl.S.who,
      kind: sc.kind,
      Q: sc.Q || null,
      key: sc.key,
      i: pl.S.i,
      n: pl.S.screens.length,
      foot: pl.S.foot.className.replace("pl-foot ", ""),
      goDisabled: pl.S.go.disabled,
    };
  };

  /* originRect: set by the path right before opening, so the player grows out of the tapped node (read once, then cleared).
     lastXP: {n, rect} of the gold XP card, set as the player closes after a complete screen (the app flies it to the counter). */
  N.player = {
    open,
    practice,
    revise,
    revSaved,
    close: pl.close,
    state,
    isOpen: () => !!pl.S,
    missed,
    originRect: null,
    lastXP: null,
  };
})();
