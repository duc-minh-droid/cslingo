(function () {
  const pl = (NIC.shared.enginePlayer = NIC.shared.enginePlayer || {});
  const { IC, fx, game, progress, reduce, sound, stripTags } = pl;
  const N = NIC,
    { el, qs, qsa, store } = N;

  // =====================================================================
  //  Screens
  // =====================================================================
  pl.show = function show(dir = 1) {
    const sc = pl.S.screens[pl.S.i];
    const oldSkip = pl.S.foot && qs(".pl-skip", pl.S.foot);
    if (oldSkip) oldSkip.remove();
    if (!sc) return pl.finish();
    if (sc.kind === "bossResult" && pl.S.answered) {
      const B = pl.S.boss,
        st = store.get("nic.quiz", {}),
        n = B.qs.length,
        c = B.qs.filter((_, i) => st[`${B.id}-${i}`] && st[`${B.id}-${i}`].ok).length;
      pl.S.bossPct = c / n;
      pl.S.bossScore = `${c}/${n}`;
      if (c === n) {
        game().unlock("perfect");
        pl.S.bossPerfect = true;
        pl.S.i++;
        return pl.finish();
      } // nothing to review: go straight to the payoff
    }
    if (pl.S.kind === "lesson" && !["complete", "streak"].includes(sc.kind)) {
      const p = store.get("nic.lessonPos", {});
      p[pl.S.mod.id] = pl.S.i;
      store.set("nic.lessonPos", p);
    }
    qsa(".pl-screen.leaving", pl.S.stage).forEach((x) => x.remove());
    const old = qs(".pl-screen", pl.S.stage);
    const node = el(`<div class="pl-screen" data-kind="${sc.kind}"></div>`);
    const F = fx(),
      anim = !!(F && F.ok && dir);
    if (old) {
      if (anim && !reduce() && F.exit) {
        // pin the leaving screen where it is on screen before the stage scrolls back to the top
        const y = pl.S.stage.scrollTop;
        old.classList.add("leaving");
        old.style.top = `${-y}px`;
        F.exit(old, { x: -24 * dir, scale: 1, dur: F.DUR.s }).then(() => old.remove());
      } else old.remove();
    }
    pl.S.stage.appendChild(node);
    pl.S.stage.scrollTop = 0;
    pl.S.graded = false;
    const bk = qs(".pl-back", pl.S.root);
    if (bk) bk.hidden = prevIdx() < 0;
    qs(".pl-ref", pl.S.root).hidden = !pl.S.refHTML;
    if (pl.S.refHTML) qs(".pl-drawer", pl.S.root).innerHTML = pl.S.refHTML;
    progress();
    (pl.RENDER[sc.kind] || pl.RENDER.note)(node, sc);
    node.setAttribute("tabindex", "-1");
    node.focus({ preventScroll: true }); // Tab starts inside the new screen
    const vis = qs(".lesson-visual", node);
    // two layers at most: the screen slides in, then either its figure draws itself or its blocks rise
    const draws = !!(vis && qs(".draw, .fi", vis));
    if (anim) {
      F.clean(
        node,
        F.animate(
          node,
          reduce()
            ? { opacity: [0, 1] }
            : { opacity: [0, 1], transform: [`translateX(${24 * dir}px)`, "translateX(0px)"] },
          { duration: F.DUR.m, delay: old && !reduce() ? F.DUR.xs : 0, ease: F.EASE },
        ),
      );
      if (!reduce() && !draws)
        qsa(".pl-in > *", node).forEach((p, k) =>
          F.clean(
            p,
            F.animate(
              p,
              { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] },
              { duration: F.DUR.m, delay: F.DUR.xs + k * 0.04, ease: F.EASE },
            ),
          ),
        );
    }
    if (vis && F && !pl.S.kbd) F.play(vis); // keyboard moves don't animate
  };
  pl.next = () => {
    pl.S.i++;
    while (
      pl.S.screens[pl.S.i] &&
      pl.S.screens[pl.S.i].kind === "q" &&
      !pl.S.screens[pl.S.i].retry &&
      pl.S.gradedKeys &&
      pl.S.gradedKeys.has(pl.S.screens[pl.S.i].key)
    )
      pl.S.i++;
    pl.show(pl.S.kbd ? 0 : 1);
  };

  /** Every question screen brings the material it depends on, because it no longer sits under it:
      - a lesson quick check (also in Practice and Revise): its step's figure `v` and any table/figure in the step text
      - a boss question (also in Practice and Revise): the boss's reference card (distance matrix, aside)
      - a predict: the live demo from the Try-it screen
      The card is open when the question points at it ("using the table…", a tour like ABDCE, the demo), otherwise
      it is a tap-to-open card, so the options stay on screen. */
  function stepOf(sc) {
    if (sc.check && pl.S.mod) return { mod: pl.S.mod.id, k: sc.k };
    const m = /^step:(.+):(\d+)$/.exec(sc.key || "");
    if (m) return { mod: m[1], k: +m[2] };
    if (sc.Q && sc.Q.step != null && sc.mod) return { mod: sc.mod, k: sc.Q.step };
    return null;
  }
  function bossOf(sc) {
    const id =
      pl.S.kind === "boss" && pl.S.boss ? pl.S.boss.id : sc.idKey ? String(sc.idKey).replace(/-\d+$/, "") : sc.mod;
    const B = id && N.bossDef && N.bossDef(id);
    return B && (B.matrix || B.aside) ? B : null;
  }
  function contextCard(node, sc) {
    let title,
      fill,
      open = false,
      demo = false; // reference dropdowns always start closed
    const st = stepOf(sc),
      B = st ? null : bossOf(sc);
    if (st) {
      const s = ((N.LESSONS[st.mod] || {}).steps || [])[st.k];
      if (!s) return;
      const tmp = el(`<div>${s.b || ""}</div>`);
      const fromBody = qsa("table, .fig, svg, pre", tmp).filter(
        (x) => !x.parentElement.closest("table, .fig, svg, pre"),
      );
      if (!s.v && !fromBody.length) return;
      title = `From ${st.mod === (pl.S.mod && pl.S.mod.id) ? `step ${st.k + 1}` : "the lesson"}: ${stripTags(s.t)}`;
      fill = (vis) => {
        fromBody.forEach((x) => vis.appendChild(x));
        if (typeof s.v === "function") {
          const d = el(`<div></div>`);
          vis.appendChild(d);
          try {
            s.v(d, pl.S.life);
          } catch (e) {
            console.error(e);
          }
        } else if (s.v) vis.insertAdjacentHTML("beforeend", s.v);
      };
    } else if (B) {
      title = B.matrix ? "Distance matrix" : "Reference";
      fill = (vis) => {
        vis.innerHTML = `${B.matrix ? `<div style="max-width:360px">${N.matrixHTML()}</div>` : ""}${B.aside || ""}`;
      };
    } else if (sc.pred && pl.S.demo) {
      title = "The demo";
      demo = true;
      fill = (vis) => vis.appendChild(pl.S.demo); // the live demo moves here (the Try-it screen takes it back if you return)
    } else return;
    const box = el(
      `<details class="pl-look${demo ? " pl-look-demo" : ""}"${open ? " open" : ""}><summary>${IC.book}<span>${title}</span><i class="pl-look-car" aria-hidden="true"></i></summary><div class="pl-look-in lesson-visual"></div></details>`,
    );
    const vis = qs(".pl-look-in", box);
    fill(vis);
    qs(".pl-quiz", node).insertBefore(box, qs(".pl-qwrap", node));
    const resize = () => setTimeout(() => window.dispatchEvent(new Event("nic:resize")), 30);
    if (open) resize();
    box.addEventListener("toggle", () => {
      sound(box.open ? "pop" : "tap");
      if (box.open) {
        if (fx()) fx().reveal(vis);
        resize();
      }
    });
  }

  /** Back: the nearest earlier teaching screen (steps, notes, try-its, intros). Questions, retries and end screens are
      skipped, so going back reviews the material without re-answering; Continue then walks forward again. */
  const NO_BACK = ["q", "complete", "streak", "hype", "mistakes", "bossResult"];
  function prevIdx() {
    // lessons only: boss quizzes, Practice and Revise are tests, so there is no going back to change an answer
    if (!pl.S || pl.S.kind !== "lesson" || NO_BACK.slice(1).includes((pl.S.screens[pl.S.i] || {}).kind)) return -1;
    for (let j = pl.S.i - 1; j >= 0; j--) {
      const x = pl.S.screens[j];
      if (x && !x.retry && !NO_BACK.includes(x.kind)) return j;
    }
    return -1;
  }
  pl.goBack = function goBack() {
    if (!pl.S || pl.S.leavingSheet) return;
    const j = prevIdx();
    if (j < 0) return;
    sound("back");
    pl.S.i = j;
    pl.show(pl.S.kbd ? 0 : -1);
  };
  const goldRect = () => {
    const c = pl.S && qs(".pd-card.c-gold", pl.S.stage);
    return c ? c.getBoundingClientRect() : null;
  };

  const presenter = (html, mood = "idle", who = pl.S.who) =>
    `<div class="pl-ask">${N.mascot({ who, size: 88, mood, cls: "pl-presenter" })}<div class="bubble pl-prompt">${html}</div></div>`;
  Object.assign(pl, { contextCard, goldRect, presenter });
})();
