(function () {
  const pl = (NIC.shared.enginePlayer = NIC.shared.enginePlayer || {});
  const { IC, fx, game, reduce, sound, stripTags } = pl;
  const N = NIC,
    { el, qs } = N;

  // =====================================================================
  //  Shell
  // =====================================================================
  const webdriver = () => !!navigator.webdriver; // tools/*.js click straight through: no Continue guard, no sheet exit

  pl.mount = function mount(chip) {
    // the path sets NIC.player.originRect (the tapped node) just before the hash change; opts.from works too
    const from = pl.S.opts.from || N.player.originRect || null;
    N.player.originRect = null;
    const root = el(`<div class="player" role="dialog" aria-modal="true" aria-label="${stripTags(pl.S.mod.title)}">
      <header class="pl-top"><button class="pl-x" aria-label="Quit lesson">${IC.x}</button><button class="pl-x pl-back" aria-label="Previous screen" title="Back" hidden>${IC.back}</button>
        <div class="pl-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span class="pl-fill"></span><span class="pl-combo"></span></div>
        <span class="pl-retry" hidden title="Questions to redo at the end" aria-label="Questions to redo at the end">${IC.retry}<b>0</b><em>redo</em></span>
        <span class="pl-chip" title="Lesson ${stripTags(String(chip))}" aria-label="Lesson ${stripTags(String(chip))}">${chip}</span><button class="pl-ref" hidden title="Reference">${IC.book}</button></header>
      <div class="pl-stage"></div>
      <footer class="pl-foot"><div class="pl-foot-in"><div class="pl-fb" aria-live="polite"></div><div class="pl-actions"><button class="btn big primary pl-go">Continue</button></div></div></footer>
      <div class="pl-modal" hidden></div><div class="pl-drawer" hidden></div></div>`);
    document.body.appendChild(root);
    document.body.classList.add("in-lesson");
    N.shield(true);
    pl.S.root = root;
    pl.S.stage = qs(".pl-stage", root);
    pl.S.foot = qs(".pl-foot", root);
    pl.S.go = qs(".pl-go", root);
    pl.S.go.addEventListener("click", onGoClick);
    qs(".pl-x", root).addEventListener("click", pl.askQuit);
    qs(".pl-back", root).addEventListener("click", pl.goBack);
    const ref = qs(".pl-ref", root),
      drawer = qs(".pl-drawer", root);
    const closeDrawer = () => {
      if (drawer.hidden || drawer.classList.contains("m-ghost")) return;
      drawer.classList.add("m-ghost"); // no pointer events while it leaves
      (fx() && fx().exit ? fx().exit(drawer, { y: -6, scale: 0.98, dur: fx().DUR.s }) : Promise.resolve()).then(() => {
        const clear = () => {
          drawer.style.opacity = "";
          drawer.style.transform = "";
        };
        drawer.hidden = true;
        drawer.classList.remove("m-ghost");
        clear();
        requestAnimationFrame(() => setTimeout(clear, 0)); // Motion can write its last frame late
      });
    };
    ref.addEventListener("click", () => {
      if (!drawer.hidden && !drawer.classList.contains("m-ghost")) return closeDrawer();
      drawer.classList.remove("m-ghost");
      drawer.style.opacity = "";
      drawer.style.transform = "";
      drawer.hidden = false;
      if (fx()) fx().reveal(drawer);
    });
    // a tap anywhere outside the drawer (and its button) closes it
    root.addEventListener("pointerdown", (e) => {
      if (!drawer.hidden && !drawer.contains(e.target) && !ref.contains(e.target)) closeDrawer();
    });
    pl.S.keys = (e) => pl.onKey(e);
    document.addEventListener("keydown", pl.S.keys);
    if (fx() && fx().ok) {
      const F = fx();
      if (reduce())
        F.clean(root, F.animate(root, { opacity: [0, 1] }, { duration: F.DUR.m, ease: F.EASE }), ["opacity"]);
      else if (from && from.width) {
        // grow out of the tapped path node
        root.style.transformOrigin = `${from.left + from.width / 2}px ${from.top + from.height / 2}px`;
        F.clean(root, F.animate(root, { opacity: [0, 1], transform: ["scale(0.9)", "scale(1)"] }, F.SPRING_UI), [
          "transform",
          "opacity",
          "transformOrigin",
        ]);
      } else
        F.clean(
          root,
          F.animate(
            root,
            { opacity: [0, 1], transform: ["translateY(40px)", "translateY(0px)"] },
            { duration: F.DUR.l, ease: F.EASE },
          ),
        );
    }
    if (fx() && fx().preloadLottie) fx().preloadLottie();
    pl.S.stopIdle = N.cast ? N.cast.idle(root) : () => {};
    if (fx()) pl.S.life.onCleanup(fx().watchStats(root));
  };

  // screens that count towards the bar: the main run (plus the recap), not the mistakes round or the payoff
  const MAIN = (x) => !x.retry && !["mistakes", "complete", "streak", "hype"].includes(x.kind);

  function progress() {
    // the denominator is fixed when the session starts (S.total), so queued retries never pull the bar back
    if (!pl.S.total)
      pl.S.total = Math.max(1, pl.S.screens.filter(MAIN).length + (pl.S.kind === "lesson" && pl.S.recap ? 1 : 0)); // + the recap finish() adds
    const total = pl.S.total;
    const sc = pl.S.screens[pl.S.i] || {};
    const done = ["complete", "streak"].includes(sc.kind) ? total : pl.S.screens.slice(0, pl.S.i).filter(MAIN).length;
    const f = Math.max(pl.S.barF || 0, Math.min(1, done / total));
    const fill = qs(".pl-fill", pl.S.root),
      bar = qs(".pl-bar", pl.S.root);
    fill.style.transform = `scaleX(${f})`;
    bar.setAttribute("aria-valuenow", Math.round(f * 100));
    // the mistakes round is its own state: the bar holds and turns orange (css/motion-player.css)
    bar.classList.toggle("retry", !!sc.retry || sc.kind === "mistakes");
    // moving forward sweeps a shine across the fill (css/motion.css .m-shine)
    if (f > (pl.S.barF || 0)) {
      bar.classList.remove("m-shine");
      void bar.offsetWidth;
      bar.classList.add("m-shine");
    }
    pl.S.barF = f;
    retryChip(false);
  }

  /** Mistakes still to fix (queued retries not yet passed). Bumps when a wrong answer adds one. */
  function retryChip(bump) {
    const chip = qs(".pl-retry", pl.S.root);
    if (!chip) return;
    const n =
      pl.S.screens.filter((x, j) => x.retry && j > pl.S.i).length +
      (pl.S.screens[pl.S.i] && pl.S.screens[pl.S.i].retry && !pl.S.graded ? 1 : 0);
    qs("b", chip).textContent = n;
    const was = chip.hidden;
    chip.hidden = !n;
    if (!n || !fx()) return;
    if (was) fx().springIn(chip, { from: 0.4, bounce: 0.5, dur: 0.4 });
    else if (bump) fx().bump(chip, { scale: 1.3, y: -3 });
  }

  function combo(prev = 0) {
    const c = qs(".pl-combo", pl.S.root),
      F = fx(),
      anim = F && F.ok && !reduce();
    qs(".pl-bar", pl.S.root).classList.toggle("hot", pl.S.combo >= 5);
    clearTimeout(pl.S.comboT);
    const clear = () => {
      c.style.transform = "";
      c.style.opacity = "";
    };
    if (pl.S.combo >= 3) {
      c.textContent = `${pl.S.combo} IN A ROW`;
      c.classList.remove("mini");
      c.classList.add("on");
      clear();
      if (anim)
        F.clean(
          c,
          F.animate(
            c,
            { transform: ["translate(-50%, 6px) scale(0.6)", "translate(-50%, 0px) scale(1)"] },
            F.SPRING_POP,
          ),
          ["transform"],
        );
      if (pl.S.combo === 3 || pl.S.combo === 5 || pl.S.combo % 10 === 0) sound("streak");
      if (pl.S.combo === 5 || pl.S.combo % 10 === 0)
        setTimeout(() => fx() && fx().lottieAt(c, "combo", { size: 96, dy: -6 }), 120);
    } else if (pl.S.combo >= 1) {
      // 1–2 in a row: a small "+1" pops over the bar and fades
      c.textContent = "+1";
      c.classList.add("on", "mini");
      clear();
      if (anim)
        F.clean(
          c,
          F.animate(
            c,
            { transform: ["translate(-50%, 6px) scale(0.5)", "translate(-50%, 0px) scale(1)"] },
            F.SPRING_POP,
          ),
          ["transform"],
        );
      pl.S.comboT = setTimeout(() => c.classList.remove("on"), 900);
    } else if (prev >= 3 && c.classList.contains("on") && anim && F.exit) {
      // the combo broke: the chip drops and fades
      F.exit(c, { y: 10, scale: 0.9, base: "translate(-50%, 0px)", dur: F.DUR.m }).then(() => {
        if (pl.S && pl.S.combo === 0) {
          c.classList.remove("on", "mini");
          clear();
          requestAnimationFrame(() => setTimeout(clear, 0));
        }
      });
    } else c.classList.remove("on", "mini");
  }

  /** CONTINUE / CHECK. A green or red sheet slides away first; presses right after it lands are ignored. */
  function onGoClick() {
    if (!pl.S || pl.S.go.disabled || !pl.S.onGo || pl.S.leavingSheet) return;
    const t = performance.now();
    if (t < (pl.S.lockUntil || 0) && !webdriver()) return;
    const go = pl.S.onGo,
      s = pl.S,
      inner = qs(".pl-foot-in", pl.S.foot);
    const sheet = /\bf-(ok|no)\b/.test(pl.S.foot.className);
    if (sheet || /\bf-continue\b/.test(pl.S.foot.className)) sound("step"); // Check is followed by correct/wrong instead
    if (!sheet || pl.S.kbd || webdriver() || !fx() || !fx().ok || !fx().exit) return go();
    pl.S.leavingSheet = true;
    const F = fx();
    F.exit(inner, { y: reduce() ? 0 : Math.min(inner.offsetHeight, 160), scale: 1, dur: F.DUR.s }).then(() => {
      if (pl.S !== s) return;
      pl.S.leavingSheet = false;
      const clear = () => {
        inner.style.transform = "";
        inner.style.opacity = "";
      };
      go();
      clear();
      requestAnimationFrame(() => setTimeout(clear, 0));
    });
  }

  /** An explanation taller than its box scrolls. While there is more to read below, its bottom edge fades out (a mask: .more). */
  function fadeCue(box) {
    if (!box || !window.ResizeObserver) return;
    const upd = () => box.classList.toggle("more", box.scrollHeight - box.scrollTop - box.clientHeight > 4);
    box.addEventListener("scroll", upd, { passive: true });
    new ResizeObserver(upd).observe(box); // also runs once the sheet has laid out
  }

  /** Footer: mode = continue | check | ok | no | hidden */
  function foot(mode, { label, onGo, fb = "", enabled = true, danger = false } = {}) {
    if (pl.S.go) pl.S.go.classList.remove("pl-go-blue");
    const sheet = mode === "ok" || mode === "no";
    // the green/red sheet overlays the stage instead of growing the footer, so the stage keeps its height
    const footH = sheet ? pl.S.foot.offsetHeight : 0;
    pl.S.foot.className = `pl-foot f-${mode}${sheet ? " f-sheet" : ""}`;
    if (sheet) pl.S.foot.style.setProperty("--pl-foot-h", `${footH}px`);
    else pl.S.foot.style.removeProperty("--pl-foot-h");
    const fbEl = qs(".pl-fb", pl.S.foot);
    fbEl.innerHTML = fb;
    fadeCue(qs(".pl-fb-t", fbEl));
    pl.S.go.textContent = label || (mode === "check" ? "Check" : mode === "no" ? "Got it" : "Continue");
    pl.S.go.disabled = !enabled;
    pl.S.go.className = `btn big pl-go ${mode === "no" || danger ? "rose" : "primary"}`;
    pl.S.onGo = onGo;
    const inner = qs(".pl-foot-in", pl.S.foot);
    // pad the stage by the overlap, so what the sheet covers can still be scrolled into view
    pl.S.stage.style.setProperty("--pl-sheet-pad", sheet ? `${Math.max(0, inner.offsetHeight - footH)}px` : "0px");
    pl.S.sheetMs = 0;
    if (sheet) {
      const sk = qs(".pl-skip", pl.S.foot);
      if (sk) sk.remove();
    } // answered: nothing left to skip
    if (sheet) pl.S.lockUntil = performance.now() + 250;
    if (sheet && fx() && fx().ok && !pl.S.kbd) {
      const F = fx();
      pl.S.sheetMs = F.DUR.m * 1000;
      pl.S.lockUntil = performance.now() + pl.S.sheetMs + 80;
      F.clean(
        inner,
        F.animate(inner, reduce() ? { opacity: [0, 1] } : { transform: ["translateY(100%)", "translateY(0%)"] }, {
          duration: F.DUR.m,
          ease: F.EASE,
        }),
      );
      // the verdict icon pops, the title slides in beside it, the +XP chip lands last
      if (!reduce() && fx().springIn) {
        fx().springIn(qs(".pl-fb-h svg", fbEl), {
          from: 0.2,
          rot: mode === "ok" ? -45 : 45,
          bounce: 0.55,
          dur: 0.35,
          delay: 0.05,
        });
        fx().enter(qs(".pl-fb-h b", fbEl), { x: -12, y: 0, delay: 0.08, dur: 0.2 });
        fx().springIn(qs(".pl-xp", fbEl), { from: 0.4, bounce: 0.6, dur: 0.35, delay: 0.14 });
      }
      const m = qs(".mascot", fbEl);
      if (m) setTimeout(() => N.mascotReact(m, m.dataset.mood), 120);
    }
  }

  /** Workshop screen: the module's no-code lab fills the page; missions award XP, Continue is always available. */
  function workshopScreen(node, sc) {
    node.innerHTML = `<div class="pl-in pl-try pl-wk"><div class="pl-try-head"><div><div class="pl-tag violet">Workshop</div><h1>${pl.S.mod.title.replace(/^Workshop:\s*(.)/, (_, c) => c.toUpperCase())}</h1></div></div><div class="pl-try-demo"></div></div>`;
    qs(".pl-try-demo", node).appendChild(pl.S.demo);
    if (pl.S.holder) {
      pl.S.holder.remove();
      pl.S.holder = null;
    }
    setTimeout(() => window.dispatchEvent(new Event("nic:resize")), 60);
    const wk = qs(".wk", node);
    if (wk && wk.classList.contains("wk-code")) node.classList.add("xwide");
    const say = () =>
      foot("continue", {
        label: "Skip for now",
        onGo: pl.next,
        fb: `<span class="faint">Finish the missions for XP, or skip and come back.</span>`,
      });
    say();
    if (!wk) return;
    wk.addEventListener("nic:wk-mission", (e) => {
      if (!pl.S) return;
      pl.S.xp += 8;
    });
    wk.addEventListener("nic:wk-done", () => {
      if (!pl.S || pl.S.demoXP) return;
      pl.S.demoXP = true;
      pl.S.xp += 10;
      game().track("demo");
      foot("continue", {
        onGo: pl.next,
        fb: `<div class="pl-fb-row">${N.mascot({ who: "chip", size: 52, mood: "love" })}<b>Workshop complete! Bonus +10 XP</b></div>`,
      });
    });
  }
  Object.assign(pl, { combo, foot, progress, retryChip, workshopScreen });
})();
