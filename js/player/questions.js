(function () {
  const pl = (NIC.shared.enginePlayer = NIC.shared.enginePlayer || {});
  const {
    CHEER,
    IC,
    PRAISE,
    T,
    combo,
    foot,
    fx,
    game,
    missed,
    open,
    pickOne,
    presenter,
    reduce,
    retryChip,
    revLog,
    revSave,
    revWrite,
    sound,
  } = pl;
  const N = NIC,
    { el, qs, qsa, store } = N;

  // =====================================================================
  //  Asking a question (reuses the boss engine's question types)
  // =====================================================================
  const SELECT = {
    mcq: (b, v) =>
      qsa(".opt", b).forEach((o) => {
        o.classList.toggle("sel", +o.dataset.k === v);
        o.setAttribute("aria-checked", +o.dataset.k === v);
      }),
    bug: (b, v) =>
      qsa(".qc-line", b).forEach((o) => {
        o.classList.toggle("sel", +o.dataset.k === v);
        o.setAttribute("aria-pressed", +o.dataset.k === v); // the chosen line is announced as pressed, like the look says
      }),
  };

  pl.askQ = function askQ(wrap, sc, { compact = false } = {}) {
    const Q = sc.Q,
      type = Q.type || "mcq",
      TT = T()[type];
    const deferred = !!SELECT[type] || (type === "pick" && !Array.isArray(Q.a));
    wrap.classList.add("predict"); // reuse the answer-tile styles
    wrap.innerHTML = `${compact ? `<div class="pl-check-q"><span class="pl-tag orange">Quick check</span><div class="pl-q-text">${Q.q}</div></div>` : presenter(Q.q)}
      <div class="q-fig"></div><div class="q-body pl-body qt-${type}"></div>${Q.hint ? `<div class="q-hint"><button class="btn ghost small" data-hint>Need a nudge?</button><div class="q-hint-t" hidden>${Q.hint}</div></div>` : ""}`;
    const fig = qs(".q-fig", wrap),
      body = qs(".q-body", wrap);
    if (sc.revId && N.glossify) N.glossify(qs(".pl-prompt, .pl-q-text", wrap)); // revision questions: underline key terms with a short definition on hover or tap
    if (Q.fig && type !== "pick") {
      try {
        typeof Q.fig === "function" ? Q.fig(fig) : (fig.innerHTML = Q.fig);
      } catch (e) {
        console.error(e);
      }
    }
    const hb = qs("[data-hint]", wrap);
    if (hb)
      hb.onclick = () => {
        const t = qs(".q-hint-t", wrap);
        t.hidden = false;
        hb.remove();
        if (fx()) fx().reveal(t);
      };
    let pending,
      answered = false;
    const grade = (v) => {
      if (answered) return;
      answered = true;
      const ok = TT.grade(Q, v);
      qsa(".sel", body).forEach((x) => x.classList.remove("sel"));
      const focus = TT.reveal(Q, body, v, ok);
      const h = qs(".q-hint", wrap);
      if (h) h.remove();
      if (fx() && focus) ok ? (fx().bounce || fx().pop)(focus) : fx().shake(focus);
      result(sc, ok, v);
      // once the sheet has landed, bring the graded answer into view above it (the stage is padded by the overlap)
      const s = pl.S,
        kbd = pl.S.kbd;
      pl.S.life.timeout(
        () => {
          if (pl.S !== s || !wrap.isConnected) return;
          const t = focus || qs(".right, .wrong", body);
          if (t && t.scrollIntoView)
            t.scrollIntoView({ block: "nearest", behavior: reduce() || kbd ? "auto" : "smooth" });
        },
        (pl.S.sheetMs || 0) + 20,
      );
    };
    // a retry shows the same options in a new order (NIC.optSalt feeds NIC.optOrder), so the answer can't be remembered by its position
    N.optSalt = sc.retry ? `retry${pl.S.retries[sc.key] || 1}` : "";
    try {
      TT.render(
        Q,
        body,
        (v) => {
          if (answered) return;
          if (!deferred) return grade(v);
          pending = v;
          if (SELECT[type]) SELECT[type](body, v);
          else
            qsa("[data-pick]", body).forEach((e) => {
              e.classList.toggle("sel", e.dataset.pick === v);
              if (TT.ring) TT.ring(e, e.dataset.pick === v ? "sel" : "");
            });
          sound("select");
          foot("check", { onGo: () => grade(pending), enabled: true });
        },
        sc.idKey || sc.key,
      );
    } catch (e) {
      // a question that can't draw must not strand the learner on a screen with no way forward: say so and offer to skip it.
      // The error is still thrown (on the next tick) so the page's error handlers, smoke() and bug reports all see it.
      body.innerHTML = `<div class="callout rose"><b>This question couldn't load.</b> Skip it and carry on.</div>`;
      foot("continue", { label: "Skip", onGo: pl.next });
      setTimeout(() => {
        throw e;
      });
      return;
    } finally {
      N.optSalt = "";
    }
    if (deferred) foot("check", { enabled: false });
    else {
      const chk = qs("[data-check]", body);
      if (!chk) {
        foot("check", { enabled: false });
        return;
      }
      const sync = () => {
        if (!answered) pl.S.go.disabled = chk.disabled;
      };
      foot("check", { onGo: () => chk.click(), enabled: !chk.disabled });
      const mo = new MutationObserver(sync);
      mo.observe(chk, { attributes: true, attributeFilter: ["disabled"] });
      pl.S.life.onCleanup(() => mo.disconnect());
    }
  };

  function result(sc, ok, v) {
    const Q = sc.Q,
      first = !sc.retry,
      prevCombo = pl.S.combo;
    pl.S.answered++;
    pl.S.graded = true;
    (pl.S.gradedKeys = pl.S.gradedKeys || new Set()).add(sc.key);
    if (first) {
      pl.S.firstTotal++;
      if (ok) pl.S.firstRight++;
      else if (sc.revId) (pl.S.revWrong = pl.S.revWrong || []).push(sc.revId);
    }
    game().answered(ok);
    // persistence
    if (sc.bossIdx !== undefined) {
      const st = store.get("nic.quiz", {});
      st[sc.idKey] = { v, ok };
      store.set("nic.quiz", st);
      if (ok) game().track("boss");
      window.dispatchEvent(new Event("nic:progress"));
    }
    // one review log for everything: lesson checks, boss questions and Practice fixes all move the question's Leitner box
    const bid =
      sc.revId ||
      (N.bank && (sc.key.match(/^(?:step|boss):([^:]+):/) || [])[1] && N.bank.idFor(sc.key.split(":")[1], Q));
    if (bid && first && N.bank) N.bank.record(bid, ok);
    if (sc.pred) {
      const p = store.get("nic.predict", {});
      if (!(sc.pred in p)) {
        p[sc.pred] = ok;
        store.set("nic.predict", p);
        N.updateScore && N.updateScore();
      }
    }
    if (ok) {
      if (sc.practice && missed.all().some((m) => m.k === sc.key)) {
        game().track("practice");
        game().unlock("fixer");
      }
      // Detective: a revision question you got wrong, right on its second go (the retry isn't logged, so the bank can't see it)
      if (sc.retry && sc.revId && pl.S.kind === "revise") game().unlock("fixer");
      if (sc.practice || sc.retry) missed.drop(sc.key);
      if (first) pl.S.xp += pl.S.kind === "boss" ? 2 : 1;
      pl.S.combo++;
      pl.S.wrongRun = 0;
      game().track("combo", pl.S.combo);
      // a hype screen is a treat between questions: at most twice a session, never in a boss or revision round, and never
      // as the last thing before the mistakes round or the finish
      const nxt = pl.S.screens[pl.S.i + 1];
      if (
        pl.S.combo >= 5 &&
        pl.S.combo % 5 === 0 &&
        ["lesson", "practice"].includes(pl.S.kind) &&
        (pl.S.hypes || 0) < 2 &&
        nxt &&
        !["mistakes", "recap", "complete", "streak"].includes(nxt.kind)
      ) {
        pl.S.hypes = (pl.S.hypes || 0) + 1;
        pl.S.screens.splice(pl.S.i + 1, 0, { kind: "hype", n: pl.S.combo });
      }
    } else {
      pl.S.combo = 0;
      pl.S.wrongRun++;
      const ref = sc.bossIdx !== undefined ? { boss: pl.S.boss.id, i: sc.bossIdx } : { Q };
      missed.add(sc.key, ref);
      if (pl.S.kind !== "boss") {
        pl.S.retries[sc.key] = (pl.S.retries[sc.key] || 0) + 1;
        if (pl.S.retries[sc.key] <= 2) queueMistake(sc);
      }
    }
    combo(prevCombo);
    retryChip(!ok);
    revSave();
    const answer = T()[Q.type || "mcq"].answer(Q);
    const why = Q.why ? `<div class="pl-why">${Q.why}</div>` : "";
    const mood = ok ? pickOne(CHEER) : pl.S.wrongRun >= 3 ? "dizzy" : pickOne(["sad", "surprised", "shocked"]);
    // the presenter who asked the question reacts too (compact quick checks have none)
    const pres = qs(".pl-screen:not(.leaving) .pl-presenter", pl.S.stage);
    if (pres && N.mascotReact) N.mascotReact(pres, mood);
    const who = sc.retry ? "berry" : pl.S.who;
    const fb = ok
      ? `<div class="pl-fb-row">${N.mascot({ who, size: 64, mood, poke: false })}<div class="pl-fb-t"><div class="pl-fb-h">${IC.ok}<b>${pickOne(PRAISE)}</b>${first ? `<span class="pl-xp">+${pl.S.kind === "boss" ? 2 : 1} XP</span>` : ""}</div>${why}</div></div>`
      : `<div class="pl-fb-row">${N.mascot({ who, size: 64, mood, poke: false })}<div class="pl-fb-t"><div class="pl-fb-h">${IC.no}<b>Correct answer:</b></div><div class="pl-ans">${answer}</div>${why}</div></div>`;
    sound(ok ? "correct" : "wrong");
    foot(ok ? "ok" : "no", { fb, onGo: pl.next });
    if (ok && fx() && first) fx().floatText(pl.S.go, `+${pl.S.kind === "boss" ? 2 : 1}`, "#ffc800");
  }

  /** The lesson that teaches a revision question: its own module, or for a boss question the first lesson of that lecture. */
  pl.studyTarget = function studyTarget(modId) {
    const m = N.modules.find((x) => x.id === modId);
    if (!m) return null;
    if (m.num !== "Boss") return m;
    return (
      N.modules
        .filter(
          (x) =>
            x.num !== "Boss" && !x.workshop && (x.subject || "nic") === (m.subject || "nic") && x.lecture === m.lecture,
        )
        .sort((a, b) => (a.order || 0) - (b.order || 0))[0] || null
    );
  };
  /** Revision question -> its lesson -> back to the same question. The round is saved first; closing the lesson (finished or quit) reopens it. */
  pl.studyThenReturn = function studyThenReturn(sc) {
    const m = pl.studyTarget(sc.mod);
    if (!m) return;
    revSave();
    const WHO = { nic: "sprout", ds: "pebble", algo: "byte" };
    const home = location.hash.slice(1) || "practice";
    pl.close(true);
    open(m, { home, who: WHO[m.subject || "nic"], returnToRevise: true });
  };

  /** A previous-mistake screen can be skipped: it just moves on (the question stays in Practice's mistakes list). */
  pl.addSkip = function addSkip() {
    const acts = qs(".pl-actions", pl.S.foot);
    if (!acts || qs(".pl-skip", acts)) return;
    const b = el(`<button class="btn big ghost pl-skip">Skip</button>`);
    b.onclick = () => {
      if (pl.S.graded && pl.S.screens[pl.S.i] && pl.S.screens[pl.S.i].kind === "q" && !pl.S.screens[pl.S.i].retry)
        return;
      sound("tap");
      pl.next();
    };
    acts.insertBefore(b, pl.S.go);
  };

  function queueMistake(sc) {
    // mistakes wait at the end of the main run, behind a "Let's fix your mistakes" interstitial
    if (!pl.S.screens.some((x) => x.kind === "mistakes")) pl.S.screens.push({ kind: "mistakes" });
    pl.S.screens.push({ ...sc, retry: true, practice: false, bi: null }); // not a base screen: it never sets the resume position
  }

  pl.finish = function finish() {
    // recap once after the main + mistakes run, then complete
    const has = (k) => pl.S.screens.some((x) => x.kind === k);
    if (pl.S.kind === "lesson" && pl.S.recap && !has("recap")) {
      pl.S.screens.push({ kind: "recap" });
      return pl.show(1);
    }
    if (!has("complete")) {
      if (pl.S.kind === "revise") {
        revLog();
        revWrite(null);
      }
      pl.S.screens.push({ kind: "complete" });
      return pl.show(1);
    }
    pl.close();
  };
})();
