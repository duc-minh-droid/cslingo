(function () {
  const pl = (NIC.shared.enginePlayer = NIC.shared.enginePlayer || {});
  const { fx, missed, open, practice, reduce, revSaved, revWrite, revise, sound } = pl;
  const N = NIC,
    { qs, qsa } = N;

  // =====================================================================
  //  Quit, keys, close
  // =====================================================================
  /** Nothing to lose: the very first screen with no answer given (or a finished lesson), so closing needs no "Wait, don't go". */
  const nothingToLose = () => {
    const sc = pl.S.screens[pl.S.i];
    return (
      (sc && ["complete", "streak"].includes(sc.kind)) ||
      (pl.S.i === 0 && !pl.S.answered) ||
      (pl.S.kind === "revise" && !pl.S.firstTotal)
    );
  };
  const QUIT_COPY = {
    lesson: "Your place is saved, but the XP for this lesson isn't banked yet.",
    boss: "Your answers so far are saved, so you can pick up where you left off. The XP isn't banked until you finish.",
    revise: "Your answers so far are saved. Continue from Practice.",
  };
  /** Take the quit sheet away. The page behind it is live again and the keyboard goes back to what had it when the sheet
      opened (the Quit button, an answer option, Continue), or to the screen itself when that is gone or was never a control. */
  function hideSheet(m, animate) {
    const back = () => {
      m.hidden = true;
      m.style.pointerEvents = "";
      qsa(":scope > :not(.pl-modal)", pl.S.root).forEach((n) => (n.inert = false));
      const from = pl.S.quitFrom;
      pl.S.quitFrom = null;
      const target =
        from && from.isConnected && !from.disabled && !from.closest("[hidden], .leaving")
          ? from
          : qs(".pl-screen:not(.leaving)", pl.S.stage);
      if (target) target.focus({ preventScroll: true });
    };
    if (!animate || !fx() || !fx().exit || !fx().ok) return back();
    m.style.pointerEvents = "none"; // the sheet drops away, then the layer hides
    Promise.all([
      fx().exit(qs(".pl-sheet", m), { y: 40, scale: 0.97, dur: 0.18 }),
      fx().exit(m, { scale: 1, dur: 0.18 }),
    ]).then(() => {
      if (!pl.S) return;
      back();
      requestAnimationFrame(() => setTimeout(() => (m.style.opacity = ""), 0));
    });
  }
  pl.askQuit = function askQuit() {
    if (!pl.S) return;
    if (nothingToLose()) return pl.close();
    const m = qs(".pl-modal", pl.S.root);
    const had = document.activeElement;
    // remembered for hideSheet; asking again while the sheet is already up keeps the first one (the focus is on the sheet by then)
    if (m.hidden) pl.S.quitFrom = had && had !== document.body && pl.S.root.contains(had) ? had : null;
    m.setAttribute("role", "alertdialog");
    m.setAttribute("aria-modal", "true");
    m.setAttribute("aria-labelledby", "pl-quit-h");
    m.innerHTML = `<div class="pl-sheet">${N.mascot({ who: "berry", size: 120, mood: "cry", act: "cry" })}<h2 id="pl-quit-h">Wait, don't go!</h2><p class="lede">You're doing great. ${QUIT_COPY[pl.S.kind] || "Leave now and this round won't count."}</p>
      <button class="btn big primary" data-m="stay">Keep learning</button><button class="btn big ghost pl-quit-btn" data-m="quit">End session</button></div>`;
    m.hidden = false;
    qsa(":scope > :not(.pl-modal)", pl.S.root).forEach((n) => (n.inert = true)); // Tab stays in the sheet
    qs('[data-m="stay"]', m).focus({ preventScroll: true });
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
      hideSheet(m, true);
    };
    qs('[data-m="quit"]', m).onclick = () => pl.close();
  };

  /** The browser's Back button during a lesson or boss quiz: ask before leaving, and put the lesson's hash back
      (history.forward(); its hashchange names the open lesson, which route() ignores). Returns true when it took over. */
  pl.guardBack = function guardBack(id) {
    const s = pl.S;
    if (!s || !s.mod || !["lesson", "boss"].includes(s.kind) || !s.opts.cameFrom || s.opts.cameFrom !== id)
      return false;
    if (nothingToLose()) return false; // nothing started: Back simply leaves
    history.forward();
    pl.askQuit();
    return true;
  };

  /* A control inside a figure or demo that the keyboard reached (Tab) owns Enter (it presses the control) and the arrows (they
     move a plan dot), instead of "Continue" / "back". One the mouse pressed doesn't: Enter still continues, as it always did. */
  let pressed = null;
  document.addEventListener(
    "pointerdown",
    (e) => {
      pressed = e.target.closest ? e.target.closest("button, a, summary, [tabindex], input, select, textarea") : null;
    },
    true,
  );
  const ownsKeys = (t) =>
    !!(t.closest && t.closest(".rn, .pl-try-demo")) && !(pressed && pressed === document.activeElement);
  /* Enter belongs to the control the keyboard has focused (Quit, Back, an answer option, a link, a details summary): it presses
     that control, it does not mean "Continue". Only the Continue/Check button itself continues. Two exceptions keep the quick
     flow: a control the mouse pressed (Enter continues, as it always did) and an option that is already selected (Enter checks it). */
  const CONTROL = "button, a[href], summary, [role=radio], [role=button], [data-pick]";
  const ownsEnter = (t) => {
    const c = t.closest && t.closest(CONTROL);
    if (!c || c === pl.S.go || (pressed && pressed === c)) return false;
    return !(c.matches(".opt.sel, .qc-line.sel") && !pl.S.go.disabled);
  };

  pl.onKey = function onKey(e) {
    if (!pl.S || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Tab") pressed = null; // from here on the keyboard moves the focus
    const m = qs(".pl-modal", pl.S.root);
    const typing = /input|textarea|select/i.test(document.activeElement && document.activeElement.tagName);
    if (e.key === "Escape") {
      // the code editor uses Esc to hand the keyboard back (it blurs itself); that press is not a request to quit
      if (e.clEsc || (e.target.closest && e.target.closest(".cl-ta"))) return;
      e.preventDefault();
      if (!m.hidden) hideSheet(m, false);
      else pl.askQuit();
      return;
    }
    if (!typing && (e.key === "m" || e.key === "M")) {
      // sound can be muted without quitting (js/sfx.js tells the Profile and menu switches)
      e.preventDefault();
      N.sfx.set(!N.sfx.on());
      if (fx() && fx().toast) fx().toast(`<b>Sound ${N.sfx.on() ? "on" : "off"}</b>`, { ms: 1200, live: true });
      return;
    }
    if (!m.hidden) {
      // Enter on "End session" or "Keep learning" presses that button; anywhere else it keeps learning
      if (e.key === "Enter" && !(e.target.closest && e.target.closest(".pl-sheet button"))) {
        e.preventDefault();
        hideSheet(m, false);
      }
      return;
    }
    if (typing) return;
    if ((e.key === "Enter" || e.key === "ArrowLeft") && ownsKeys(e.target)) return;
    if (e.key === "Enter" && ownsEnter(e.target)) return;
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
      if (r) revWrite(s.firstTotal ? { ...r, paused: true, at: Date.now() } : null);
    } // quit: keep the round, but a refresh shouldn't reopen it; a round with no answer yet has nothing to resume
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
      const here = location.hash.slice(1);
      if (here === h) window.dispatchEvent(new Event("hashchange"));
      else if (s.mod && here === s.mod.id) {
        // the lesson's own hash is in the address bar: if it was pushed on top of the page we came from, pop it, so Back doesn't
        // reopen the lesson; a cold deep link or a reload has nothing to pop, and replacing leaves no lesson entry behind
        if (s.opts.cameFrom) history.back();
        else location.replace(`#${h}`);
      } else location.hash = h;
    }
    window.dispatchEvent(new Event("nic:player-closed"));
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
    modId: () => (pl.S && pl.S.mod ? pl.S.mod.id : null),
    /* For tools/smoke.js layout checks: show screen i of the open session without answering anything. */
    peek: (i) => {
      if (!pl.S || i < 0 || i >= pl.S.screens.length) return false;
      pl.S.i = i;
      pl.show(0);
      return true;
    },
    guardBack: pl.guardBack,
    /* For tools/smoke.js: the rule that ticks a guide item when a demo control is used (see js/player/screens-2.js). */
    guideHit: pl.guideHit,
    controlLabel: pl.controlLabel,
    missed,
    originRect: null,
    lastXP: null,
  };
})();
