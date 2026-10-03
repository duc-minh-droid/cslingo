(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, UNIT_COLORS, inLec, inSubj, isBoss, modal, status, subjOf } = app;
  const { modules, qs, qsa, el, store } = NIC;
  const fx = NIC.fx;

  /** One path item springs in; a finished node's check mark pops a beat later. Mascots rise instead. */
  app.popNode = function popNode(n, delay) {
    if (n.classList.contains("mascot")) {
      if (!fx.ok) return;
      const a = fx.animate(
        n,
        fx.reduce()
          ? { opacity: [0, 1] }
          : { opacity: [0, 1], transform: ["translateY(30px) scale(0.7)", "translateY(0px) scale(1)"] },
        { ...fx.SPRING_POP, bounce: 0.4, delay: delay + 0.2 },
      );
      fx.clean(n, a);
      return;
    }
    fx.springIn(n, { delay, from: 0.3, bounce: 0.45 });
    const mark = n.closest(".st-done") && (qs(".p-badge", n) || qs(".p-face > svg", n));
    if (mark && !fx.reduce())
      fx.springIn(mark, { delay: delay + 0.2, from: 0, rot: -30, bounce: 0.6, dur: fx.SPRING_POP.duration });
  };

  /** The sticky banner shows whichever unit you're scrolling through. */
  app.stickyHeader = function stickyHeader(page, quiet) {
    const box = qs(".unit-sticky", page),
      inn = qs(".us-in", box),
      units = qsa(".unit", page);
    let curU = -1;
    const paint = (u, still = false) => {
      if (u === curU) return;
      const dir = u > curU ? 1 : -1;
      curU = u;
      const sec = units[u];
      box.className = `unit-sticky u-${UNIT_COLORS[u % 4]}`;
      inn.innerHTML = `<div class="us-t"><small>${sec.dataset.lbl} · ${sec.dataset.p}</small><h2>${sec.dataset.ttl}</h2></div><button class="us-guide">${IC.book}<span>Guidebook</span></button>`;
      qs(".us-guide", inn).addEventListener("click", () => guidebook(sec));
      // the banner is sticky: never leave an inline transform on it
      if (!still && fx.ok && !fx.reduce())
        fx.clean(
          inn,
          fx.animate(
            inn,
            { opacity: [0, 1], transform: [`translateY(${10 * dir}px)`, "translateY(0px)"] },
            { duration: fx.DUR.m, ease: fx.EASE },
          ),
        );
    };
    const unitAt = () => {
      const y = box.getBoundingClientRect().bottom;
      let u = 0;
      units.forEach((sec, k) => {
        if (sec.getBoundingClientRect().top < y + 10) u = k;
      });
      return u;
    };
    const spy = () => paint(unitAt());
    let q = false;
    const onScroll = () => {
      if (!q) {
        q = true;
        requestAnimationFrame(() => {
          q = false;
          spy();
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    app.life.onCleanup(() => window.removeEventListener("scroll", onScroll));
    paint(unitAt(), quiet); // a restored scroll may start in a later unit
  };

  function guidebook(sec) {
    const s = app.course,
      list = inLec(s, sec.dataset.lec);
    modal(
      `<div class="gb-head u-${UNIT_COLORS[+sec.dataset.u % 4]}">${NIC.mascot({ who: SUBJECTS[s].who, size: 84, mood: "smug", acc: ["detective"] })}<div><small>${sec.dataset.lbl} guidebook</small><h2>${sec.dataset.ttl}</h2></div></div>
      ${list
        .map((m) => {
          const L = NIC.LESSONS[m.id];
          return `<div class="gb-mod"><h3><span class="gb-num">${m.num}</span>${m.title}</h3>${L && L.sum ? `<p>${L.sum}</p>` : `<p>${m.blurb || ""}</p>`}${L ? `<ul>${L.steps.map((st) => `<li>${st.t}</li>`).join("")}</ul>` : ""}</div>`;
        })
        .join("")}`,
      { cls: `guidebook u-${UNIT_COLORS[+sec.dataset.u % 4]}` },
    );
  }

  /** What a lesson holds, for the path tooltip and the node popover. */
  function lessonInfo(m) {
    const list = inSubj(subjOf(m)).filter((x) => x.lecture === m.lecture),
      idx = list.indexOf(m) + 1;
    if (isBoss(m)) {
      const B = NIC.bossDef(m.id) || { qs: [] },
        n = B.qs.length;
      return {
        boss: true,
        idx,
        of: list.length,
        qs: n,
        mins: Math.max(2, Math.round(n * 0.6)),
        topics: list.filter((x) => !isBoss(x)).map((x) => x.title),
      };
    }
    const L = NIC.LESSONS[m.id] || { steps: [] },
      steps = L.steps || [];
    const qs = steps.filter((s) => s.c).length,
      demo = !!(L.guide && L.guide.length),
      runner = steps.some((s) => typeof s.v === "function" && /run\(/i.test(String(s.v)));
    return {
      idx,
      of: list.length,
      sum: L.sum || m.blurb || "",
      steps: steps.map((s) => s.t),
      qs,
      demo,
      runner,
      mins: Math.max(2, Math.round(steps.length * 0.6 + qs * 0.3 + (demo ? 2 : 0))),
    };
  }
  const infoChips = (I) =>
    `<div class="pt-chips"><span>${IC.clock || ""}~${I.mins} min</span>${I.qs ? `<span>${I.qs} question${I.qs > 1 ? "s" : ""}</span>` : ""}${I.demo ? "<span>live demo</span>" : ""}${I.runner ? '<span class="pt-run">runs step by step</span>' : ""}</div>`;
  const infoList = (I) => {
    const items = I.boss ? I.topics : I.steps,
      max = 5;
    return items.length
      ? `<ol class="pt-list">${items
          .slice(0, max)
          .map((t) => `<li>${t}</li>`)
          .join("")}</ol>${items.length > max ? `<div class="pt-more">+${items.length - max} more</div>` : ""}`
      : "";
  };

  let tipEl = null,
    tipT = 0;
  function hideTip() {
    clearTimeout(tipT);
    if (!tipEl) return;
    const g = tipEl;
    tipEl = null;
    if (!fx.ok || !fx.exit || !g.isConnected) return g.remove();
    g.classList.add("m-ghost");
    fx.exit(g, { scale: 0.96, dur: fx.DUR.xs }).then(() => g.remove());
  }
  function showTip(row) {
    if (nodePopEl || (tipEl && tipEl.parentElement === row)) return;
    hideTip();
    const m = modules.find((x) => x.id === row.dataset.id),
      I = lessonInfo(m);
    const side = parseFloat(row.style.getPropertyValue("--k")) > 0.2 ? "left" : "right";
    tipEl = el(`<div class="pt-tip pt-${side}" role="tooltip">
      <small>${I.boss ? `Boss quiz · ${I.topics.length} lessons` : `Lesson ${I.idx} of ${I.of} · ${m.num}`}</small>
      <b>${m.title}</b>${I.boss ? `<p>${m.blurb || ""}</p><div class="pt-h">Covers</div>` : `<p>${I.sum}</p><div class="pt-h">Inside</div>`}
      ${infoList(I)}${infoChips(I)}</div>`);
    row.appendChild(tipEl);
    {
      // keep it above the dock: slide it up and move the arrow down to stay on the node
      const r = tipEl.getBoundingClientRect(),
        dockTop = (qs("#dock") && qs("#dock").getBoundingClientRect().top) || innerHeight,
        over = r.bottom - (dockTop - 10);
      if (over > 0) {
        const up = Math.min(over, r.height - 70);
        tipEl.style.top = `${-6 - up}px`;
        tipEl.style.setProperty("--ay", `${36 + up}px`);
      }
    }
    if (fx.ok)
      fx.clean(
        tipEl,
        fx.animate(
          tipEl,
          fx.reduce()
            ? { opacity: [0, 1] }
            : {
                opacity: [0, 1],
                transform: [`translateX(${side === "left" ? 8 : -8}px) scale(0.92)`, "translateX(0px) scale(1)"],
              },
          { ...fx.SPRING_UI },
        ),
      );
  }
  app.wireTips = function wireTips(page) {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    qsa(".p-node", page).forEach((b) => {
      const row = b.closest(".p-row");
      b.addEventListener("mouseenter", () => {
        clearTimeout(tipT);
        tipT = setTimeout(() => showTip(row), 280);
      });
      b.addEventListener("mouseleave", hideTip);
      b.addEventListener("focus", () => showTip(row));
      b.addEventListener("blur", hideTip);
    });
    app.life.onCleanup(hideTip);
  };

  let nodePopEl = null;
  app.closeNodePop = function closeNodePop() {
    if (!nodePopEl) return;
    const g = nodePopEl;
    nodePopEl = null;
    if (!fx.ok || !fx.exit || !g.isConnected) return g.remove();
    g.classList.add("m-ghost");
    fx.exit(g, { base: "translateX(-50%)", y: -8, scale: 0.9, dur: fx.DUR.s }).then(() => g.remove());
  };
  app.nodePop = function nodePop(row) {
    const had = nodePopEl && nodePopEl.parentElement === row;
    app.closeNodePop();
    hideTip();
    if (had) return;
    const m = modules.find((x) => x.id === row.dataset.id),
      st = status(m),
      I = lessonInfo(m),
      boss = isBoss(m);
    const btn = boss
      ? st === "done"
        ? "Retake quiz"
        : st === "started"
          ? "Continue quiz"
          : "Start quiz +20 XP"
      : st === "done"
        ? "Review +5 XP"
        : st === "started"
          ? "Continue"
          : "Start +10 XP";
    nodePopEl =
      el(`<div class="node-pop"><b>${m.title}</b><small>${boss ? "Boss quiz" : `Lesson ${I.idx} of ${I.of} · ${m.num}`}</small><p>${m.blurb || ""}</p>
      <details class="np-more"><summary>${boss ? "What it covers" : "What's inside"}</summary>${infoList(I)}</details>${infoChips(I)}<button class="btn big np-go">${btn}</button>${!boss && st === "started" && (store.get("nic.lessonPos", {})[m.id] || 0) > 0 ? `<button class="np-restart">Start over</button>` : ""}</div>`);
    row.appendChild(nodePopEl);
    {
      // stay inside the screen on phones; the arrow keeps pointing at the node
      const r = nodePopEl.getBoundingClientRect(),
        dx = r.right > innerWidth - 12 ? r.right - (innerWidth - 12) : r.left < 12 ? r.left - 12 : 0;
      if (dx) {
        nodePopEl.style.marginLeft = `${-dx}px`;
        nodePopEl.style.setProperty("--ax", `${dx}px`);
      }
    }
    NIC.sfx.play("pop");
    // grows out of its node: transform-origin sits on the arrow tip (css/motion.css)
    // cleaned afterwards: the CSS translateX(-50%) takes over again
    if (fx.ok)
      fx.clean(
        nodePopEl,
        fx.animate(
          nodePopEl,
          fx.reduce()
            ? { opacity: [0, 1] }
            : {
                opacity: [0, 1],
                transform: [
                  "translateX(-50%) translateY(-12px) scale(0.6)",
                  "translateX(-50%) translateY(0px) scale(1)",
                ],
              },
          { ...fx.SPRING },
        ),
      );
    // START: the node squashes and the player grows out of it (js/player/ reads originRect)
    const launch = () => {
      const node = qs(".p-node", row);
      app.closeNodePop();
      if (node) {
        if (fx.ok && !fx.reduce())
          fx.clean(
            node,
            fx.animate(
              node,
              { transform: ["scale(1)", "scale(0.86)", "scale(1)"] },
              { duration: fx.DUR.m, ease: fx.EASE, times: [0, 0.4, 1] },
            ),
            ["transform"],
          );
        NIC.player.originRect = node.getBoundingClientRect();
      }
      location.hash = m.id;
    };
    qs(".np-go", nodePopEl).addEventListener("click", (e) => {
      e.stopPropagation();
      launch();
    });
    const rs = qs(".np-restart", nodePopEl);
    if (rs)
      rs.addEventListener("click", (e) => {
        e.stopPropagation();
        const p = store.get("nic.lessonPos", {});
        delete p[m.id];
        store.set("nic.lessonPos", p);
        launch();
      });
    setTimeout(() => {
      if (nodePopEl) qs(".np-go", nodePopEl).focus({ preventScroll: true });
    }, 30);
    const r = nodePopEl.getBoundingClientRect();
    if (r.bottom > innerHeight - 90)
      window.scrollBy({ top: r.bottom - innerHeight + 110, behavior: fx.reduce() ? "auto" : "smooth" });
  };
  Object.assign(app, { hideTip });
})();
