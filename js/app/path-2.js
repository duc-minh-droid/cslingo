(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, UNIT_COLORS, inLec, inSubj, isBoss, kindOf, modal, numLabel, status, subjOf } = app;
  const { modules, qs, qsa, el, esc, store } = NIC;
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

  /** The sticky banner shows whichever unit you're scrolling through, and its title opens a picker to jump to any other one. */
  app.stickyHeader = function stickyHeader(page, quiet) {
    const box = qs(".unit-sticky", page),
      inn = box && qs(".us-in", box),
      units = qsa(".unit", page);
    if (!box || !units.length) {
      if (box) box.hidden = true; // a course with no lessons yet has no units to name
      return;
    }
    const word = SUBJECTS[app.course].unit.toLowerCase();
    let curU = -1;
    const menu = el(`<div class="us-menu" role="group" aria-label="Jump to a ${word}" hidden></div>`);
    box.appendChild(menu);
    const closeMenu = (focus) => {
      const b = qs(".us-pick", inn);
      menu.hidden = true;
      if (b) {
        b.setAttribute("aria-expanded", "false");
        if (focus) b.focus({ preventScroll: true });
      }
    };
    const openMenu = () => {
      app.closePop();
      app.closeNodePop();
      menu.innerHTML = units
        .map((sec, k) => {
          const [d, n] = sec.dataset.p.split("/").map(Number);
          return `<button class="us-opt u-${UNIT_COLORS[k % 4]} ${k === curU ? "on" : ""}" data-k="${k}" ${k === curU ? 'aria-current="true"' : ""}><span class="us-opt-n">${sec.dataset.lbl}</span><span class="us-opt-t">${sec.dataset.ttl}</span><span class="us-opt-p ${d === n ? "done" : ""}" aria-label="${d} of ${n} done">${d === n ? IC.check : `${d}/${n}`}</span></button>`;
        })
        .join("");
      menu.hidden = false;
      qs(".us-pick", inn).setAttribute("aria-expanded", "true");
      qsa(".us-opt", menu).forEach((b) =>
        b.addEventListener("click", () => {
          closeMenu(true);
          const target = units[+b.dataset.k];
          target.style.scrollMarginTop = Math.round(box.getBoundingClientRect().bottom + 8) + "px"; // its divider lands just under the banner
          target.scrollIntoView({ behavior: fx.reduce() ? "auto" : "smooth", block: "start" });
          NIC.sfx.play("whoosh");
        }),
      );
      const on = qs(".us-opt.on", menu);
      if (on) on.scrollIntoView({ block: "nearest" });
    };
    const paint = (u, still = false) => {
      if (u === curU) return;
      const dir = u > curU ? 1 : -1,
        open = !menu.hidden;
      curU = u;
      const lost =
        !!document.activeElement &&
        document.activeElement.classList.contains("us-pick") &&
        inn.contains(document.activeElement);
      const sec = units[u];
      box.className = `unit-sticky u-${UNIT_COLORS[u % 4]}`;
      inn.innerHTML = `<div class="us-t"><small>${sec.dataset.lbl} · ${sec.dataset.p}</small><h2>${
        units.length > 1
          ? `<button class="us-pick" aria-haspopup="true" aria-expanded="${open}" aria-label="${esc(sec.dataset.ttl)}. Jump to another ${word}"><span>${sec.dataset.ttl}</span>${IC.chev}</button>`
          : sec.dataset.ttl
      }</h2></div><button class="us-guide" aria-label="Guidebook for ${esc(sec.dataset.ttl)}">${IC.book}<span>Guidebook</span></button>`;
      qs(".us-guide", inn).addEventListener("click", () => guidebook(sec));
      const pick = qs(".us-pick", inn);
      if (pick) pick.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu(false)));
      if (lost && pick) pick.focus({ preventScroll: true }); // the button that had the keyboard was just replaced
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
      // the very bottom of a long page belongs to the last unit, even when it is too short to reach the banner
      if (window.scrollY > 8 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)
        return units.length - 1;
      const y = box.getBoundingClientRect().bottom;
      let u = 0;
      units.forEach((sec, k) => {
        if (sec.getBoundingClientRect().top < y + 34) u = k; // slack: a one-line banner after the jump is shorter
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
    menu.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const rows = qsa(".us-opt", menu),
        at = rows.indexOf(document.activeElement);
      rows[Math.max(0, Math.min(rows.length - 1, at + (e.key === "ArrowDown" ? 1 : -1)))].focus();
    });
    const onKey = (e) => {
      if (e.key === "Escape" && !menu.hidden) {
        e.stopPropagation();
        closeMenu(true);
      }
    };
    const onDown = (e) => {
      if (!menu.hidden && !e.target.closest(".us-menu, .us-pick")) closeMenu(false);
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onDown);
    app.life.onCleanup(() => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onDown);
    });
    paint(unitAt(), quiet); // a restored scroll may start in a later unit
  };

  /** A unit's guidebook: every lesson in it, each one opens that lesson, and the finished ones carry a tick. */
  function guidebook(sec) {
    const s = app.course,
      list = inLec(s, sec.dataset.lec),
      col = UNIT_COLORS[+sec.dataset.u % 4];
    const m = modal(
      `<div class="gb-head u-${col}">${NIC.mascot({ who: SUBJECTS[s].who, size: 84, mood: "smug", acc: ["detective"] })}<div><small>${sec.dataset.lbl} guidebook</small><h2>${sec.dataset.ttl}</h2></div></div>
      ${list
        .map((x) => {
          const L = NIC.LESSONS[x.id],
            done = status(x) === "done";
          return `<a class="gb-mod ${done ? "done" : ""}" href="#${x.id}" data-id="${x.id}"><h3><span class="gb-num">${numLabel(x)}</span><span class="gb-title">${x.title}</span>${done ? `<span class="gb-tick" role="img" aria-label="Done">${IC.check}</span>` : ""}</h3>${L && L.sum ? `<p>${L.sum}</p>` : `<p>${x.blurb || ""}</p>`}${L ? `<ul>${L.steps.map((st) => `<li>${st.t}</li>`).join("")}</ul>` : ""}</a>`;
        })
        .join("")}`,
      { cls: `guidebook u-${col}` },
    );
    qsa(".gb-mod", m).forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        m.close();
        location.hash = a.dataset.id;
      }),
    );
  }

  /** What a lesson holds, for the path tooltip and the node popover. Workshops and the boss are not counted in "Lesson x of y". */
  function lessonInfo(m) {
    const list = inSubj(subjOf(m)).filter((x) => x.lecture === m.lecture),
      plain = list.filter((x) => !isBoss(x) && !x.workshop && !x.video),
      idx = plain.indexOf(m) + 1;
    if (isBoss(m)) {
      const B = NIC.bossDef(m.id) || { qs: [] },
        n = B.qs.length;
      return {
        boss: true,
        idx,
        of: plain.length,
        qs: n,
        mins: Math.max(2, Math.round(n * 0.6)),
        topics: list.filter((x) => !isBoss(x)).map((x) => x.title),
        R: NIC.bossResult ? NIC.bossResult(m.id) : null, // null until the quiz's questions have loaded
      };
    }
    if (m.video)
      return {
        kind: "video",
        idx,
        of: plain.length,
        sum: m.blurb || "",
        steps: m.video.chapters || [],
        qs: 0,
        demo: false,
        runner: false,
        mins: m.video.mins || 2,
        video: true,
      };
    const L = NIC.LESSONS[m.id] || { steps: [] },
      steps = L.steps || [];
    const qs = steps.filter((s) => s.c).length,
      demo = !!(L.guide && L.guide.length),
      runner = steps.some((s) => typeof s.v === "function" && /run\(/i.test(String(s.v)));
    return {
      kind: kindOf(m),
      idx,
      of: plain.length,
      sum: L.sum || m.blurb || "",
      steps: steps.map((s) => s.t),
      qs,
      demo,
      runner,
      mins: Math.max(2, Math.round(steps.length * 0.6 + qs * 0.3 + (demo ? 2 : 0))),
    };
  }
  /** The small line above a lesson's title: "Lesson 3 of 8 · 3.2", or a Workshop / Code lab tag instead of "3.W" / "3.C". */
  const whereLine = (m, I) =>
    I.boss
      ? `Boss quiz · pass at ${Math.round(NIC.BOSS_PASS * 100)}%`
      : I.kind === "lesson"
        ? `Lesson ${I.idx} of ${I.of} · ${m.num}`
        : `<span class="np-kind">${numLabel(m)}</span> ${NIC.unitName(m)} ${m.lecture}`;
  const infoChips = (I) =>
    `<div class="pt-chips"><span>${IC.clock || ""}~${I.mins} min</span>${I.qs ? `<span>${I.qs} ${I.boss ? "question" : "quick check"}${I.qs > 1 ? "s" : ""}</span>` : ""}${I.demo ? "<span>live demo</span>" : ""}${I.runner ? '<span class="pt-run">runs step by step</span>' : ""}</div>`;
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
      <small>${I.boss ? `Boss quiz · ${I.topics.length} lessons` : whereLine(m, I)}</small>
      <b>${m.title}</b>${I.boss ? `<p>${m.blurb || ""}</p><div class="pt-h">Covers</div>` : `<p>${I.sum}</p><div class="pt-h">${I.video ? "Chapters" : "Inside"}</div>`}
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
    const t = g.parentElement && qs(".p-node", g.parentElement);
    if (t) {
      t.setAttribute("aria-expanded", "false");
      t.removeAttribute("aria-controls");
    }
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
      boss = isBoss(m),
      R = boss ? I.R : null, // the boss score, or null until its questions have loaded
      failed = !!R && R.answered === R.n && !R.passed; // every question answered and still under the pass mark
    const btn = boss
      ? st === "done"
        ? "Retake quiz"
        : failed
          ? "Retry quiz"
          : R && R.attempted
            ? "Continue quiz"
            : "Start quiz +20 XP"
      : m.video
        ? st === "done"
          ? "Watch again"
          : "Watch +5 XP"
        : st === "done"
          ? "Review +5 XP"
          : st === "started"
            ? "Continue"
            : "Start +10 XP";
    const score =
      R && R.attempted
        ? `<p class="np-score"><span class="np-n">${R.right}/${R.n}</span> right${R.passed ? ", passed" : failed ? `, not yet. You need ${R.need}.` : ` so far, ${R.answered} of ${R.n} answered`}</p>`
        : "";
    const second =
      boss && failed
        ? `<button class="np-restart" data-see>See your result</button>`
        : !boss && st === "started" && (store.get("nic.lessonPos", {})[m.id] || 0) > 0
          ? `<button class="np-restart">Start over</button>`
          : "";
    nodePopEl =
      el(`<div class="node-pop" id="np-${m.id}" role="group" aria-label="${esc(m.title)}"><b>${m.title}</b><small>${whereLine(m, I)}</small>${score}<p>${m.blurb || ""}</p>
      <details class="np-more"><summary>${boss ? "What it covers" : m.video ? "Chapters" : "What's inside"}</summary>${infoList(I)}</details>${infoChips(I)}<button class="btn big np-go">${btn}</button>${second}</div>`);
    const trigger = qs(".p-node", row);
    if (trigger) {
      trigger.setAttribute("aria-expanded", "true");
      trigger.setAttribute("aria-controls", nodePopEl.id);
    }
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
      if (boss && (st === "done" || failed)) NIC.bossFresh = m.id; // a retake asks everything again; the stored answers stay until each is replaced
      launch();
    });
    const rs = qs(".np-restart", nodePopEl);
    if (rs)
      rs.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!boss) {
          const p = store.get("nic.lessonPos", {});
          delete p[m.id];
          store.set("nic.lessonPos", p);
        }
        launch();
      });
    setTimeout(() => {
      if (nodePopEl) qs(".np-go", nodePopEl).focus({ preventScroll: true });
    }, 30);
    nodePopEl.scrollIntoView({ block: "nearest", behavior: fx.reduce() ? "auto" : "smooth" });
  };
  Object.assign(app, { hideTip });
})();
