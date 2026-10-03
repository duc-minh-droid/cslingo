(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, inLec, inSubj, isBoss, main, progress, rail, status, subjOf } = app;
  const { modules, qs, qsa, el, esc, store } = NIC;
  const fx = NIC.fx,
    game = NIC.game;

  // =====================================================================
  //  Home: the path
  // =====================================================================
  const UNIT_COLORS = ["green", "blue", "violet", "orange"];
  const ROW = 104;
  const zig = (i) => Math.sin((i * Math.PI) / 4); // 0, .7, 1, .7, 0, -.7, -1, -.7 …
  const PATH_CAST = [
    { who: null, act: "juggle", acc: ["propeller"] },
    { who: "chip", act: "sleep", acc: ["nightcap"], mood: "sleepy" },
    { who: "blaze", act: "skate", acc: ["shades"], mood: "smug" },
    { who: "berry", act: "headbang", acc: ["headphones"], mood: "laugh" },
    { who: "pebble", act: "spin", acc: ["party"], mood: "happy" },
    { who: "byte", act: "wave", acc: ["tophat", "monocle"], mood: "wink" },
    { who: "sprout", act: "dance", acc: ["chef", "moustache"], mood: "laugh" },
    { who: "chip", act: "juggle", acc: ["wizard"], mood: "determined" },
  ];

  /** A round button that appears when the current lesson is scrolled off screen and takes you back to it. */
  function jumpButton(page) {
    const cur = qs(".p-row.cur", page);
    if (!cur || !window.IntersectionObserver) return;
    const b = el(
      `<button class="p-jump" aria-label="Jump to your current lesson" hidden><svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`,
    );
    page.appendChild(b);
    b.addEventListener("click", () => {
      cur.scrollIntoView({ behavior: fx.reduce() ? "auto" : "smooth", block: "center" });
      NIC.sfx.play("whoosh");
    });
    let shown = false;
    const io = new IntersectionObserver(
      ([e]) => {
        b.classList.toggle("up", e.boundingClientRect.top < 0); // the arrow flips with a transition (css/motion-app.css)
        const want = !e.isIntersecting;
        if (want === shown) return;
        shown = want;
        if (want) {
          b.hidden = false;
          fx.springIn(b, { from: 0.5, bounce: 0.4, dur: fx.SPRING_UI.duration });
        } else if (!fx.ok || b.hidden) b.hidden = true;
        else {
          b.classList.add("m-ghost");
          fx.exit(b, { scale: 0.6 }).then(() => {
            b.classList.remove("m-ghost");
            b.style.opacity = "";
            b.style.transform = "";
            if (!shown) b.hidden = true;
          });
        }
      },
      { threshold: 0.2 },
    );
    io.observe(qs(".p-node", cur));
    app.life.onCleanup(() => io.disconnect());
  }

  /** A unit's path: its lessons, with a reward chest after every third lesson (like Duolingo's path chests). */
  function pathItems(list, lec) {
    const out = [];
    let n = 0;
    list.forEach((m, k) => {
      out.push({ m });
      if (!isBoss(m) && ++n % 3 === 0 && k < list.length - 1)
        out.push({ chest: `${subjOf(m)}-${lec}-${n}`, after: m.id });
    });
    return out;
  }
  /** Layered chest, so it can open where it sits: rays, open lid (behind), body, dark opening, closed lid, lock, coins. */
  app.CHEST = (open) => `<svg viewBox="0 0 64 56" class="p-chest-svg${open ? " is-open" : ""}" overflow="visible">
    <g class="ch-rays">${Array.from({ length: 8 }, (_, k) => `<path d="M32 22 L25 -34 L39 -34Z" transform="rotate(${k * 45} 32 22)" fill="#ffc800"/>`).join("")}</g>
    <g class="ch-lid-o"><path d="M9 23 L14 2 H50 L55 23Z" fill="#e0a800"/><path d="M15 21 L19 5 H45 L49 21Z" fill="#a85f00"/></g>
    <rect x="6" y="20" width="52" height="30" rx="7" fill="#cd7900"/><rect x="6" y="28" width="52" height="5" fill="#a85f00"/>
    <rect x="16" y="20" width="6" height="30" fill="#a85f00" opacity=".5"/><rect x="42" y="20" width="6" height="30" fill="#a85f00" opacity=".5"/>
    <g class="ch-in"><rect x="8" y="19" width="48" height="9" rx="4.5" fill="#6b3d00"/><ellipse class="ch-glow" cx="32" cy="22" rx="20" ry="4.5" fill="#ffc800"/></g>
    <g class="ch-lid-c"><path d="M6 27a13 13 0 0 1 13-13h26a13 13 0 0 1 13 13v3H6z" fill="#ff9600"/><rect x="6" y="28" width="52" height="2" fill="#a85f00"/><rect x="16" y="14" width="6" height="16" fill="#a85f00" opacity=".5"/><rect x="42" y="14" width="6" height="16" fill="#a85f00" opacity=".5"/></g>
    <rect x="26" y="27" width="12" height="13" rx="3.5" fill="#ffc800"/><circle cx="32" cy="33" r="2" fill="#a85f00"/>
    <g class="ch-coins">${Array.from({ length: 6 }, () => `<circle class="ch-coin" cx="32" cy="22" r="3.6" fill="#ffc800" stroke="#cd7900" stroke-width="1.2"/>`).join("")}</g></svg>`;
  function chestRow(it, i) {
    const opened = !!store.get("nic.chests", {})[it.chest],
      ready = !opened && status(modules.find((x) => x.id === it.after)) === "done";
    return `<div class="p-row p-chest-row ${opened ? "opened" : ready ? "ready" : "locked"}" style="--k:${zig(i).toFixed(3)};top:${i * ROW}px" data-chest="${it.chest}">
      <button class="p-chest" aria-label="${opened ? "Opened chest" : ready ? "Open reward chest" : "Reward chest: finish the lesson before it"}" ${ready ? "" : "disabled"}>${app.CHEST(opened)}</button></div>`;
  }
  /** The chest opens in place: squash and shake, the lid flips back on its hinge, light pours out, coins arc up and fall. */
  app.chestAnim = function chestAnim(svg, { onPop, onEnd }) {
    const end = () => {
      svg.classList.add("is-open");
      svg.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      onEnd();
    };
    if (!fx.ok || fx.reduce() || !svg.animate) {
      svg.classList.add("is-open");
      onPop();
      setTimeout(end, 300);
      return;
    }
    const q1 = (c) => qs("." + c, svg),
      hinge = "32px 22px",
      all = [];
    const go = (el, kf, o) => {
      const a = el.animate(kf, { fill: "both", ...o });
      all.push(a);
      return a;
    };
    go(
      svg,
      [
        { transform: "scale(1,1)" },
        { transform: "scale(1.1,.86)" },
        { transform: "scale(.96,1.07) rotate(-5deg)" },
        { transform: "scale(1.04,.97) rotate(5deg)" },
        { transform: "scale(1,1) rotate(0deg)" },
      ],
      { duration: 420, easing: "ease-in-out", transformOrigin: "50% 100%" },
    );
    go(q1("ch-lid-c"), [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], {
      delay: 420,
      duration: 90,
      easing: "ease-in",
      transformOrigin: hinge,
    });
    go(
      q1("ch-lid-o"),
      [
        { opacity: 1, transform: "scaleY(0)" },
        { opacity: 1, transform: "scaleY(1.12)" },
        { opacity: 1, transform: "scaleY(1)" },
      ],
      { delay: 510, duration: 300, easing: "cubic-bezier(.3,1.4,.5,1)", transformOrigin: hinge },
    );
    go(q1("ch-in"), [{ opacity: 0 }, { opacity: 1 }], { delay: 520, duration: 120 });
    go(q1("ch-glow"), [{ opacity: 0 }, { opacity: 0.95 }, { opacity: 0.35 }], { delay: 520, duration: 700 });
    go(
      q1("ch-rays"),
      [
        { opacity: 0, transform: "scale(.4) rotate(0deg)" },
        { opacity: 0.5, transform: "scale(1) rotate(10deg)", offset: 0.3 },
        { opacity: 0, transform: "scale(1.2) rotate(28deg)" },
      ],
      { delay: 520, duration: 900, easing: "ease-out", transformOrigin: hinge },
    );
    go(svg, [{ transform: "scale(1,1)" }, { transform: "scale(1.09,.93)" }, { transform: "scale(1,1)" }], {
      delay: 520,
      duration: 260,
      easing: "ease-out",
      transformOrigin: "50% 100%",
    }).finished.catch(() => {});
    qsa(".ch-coin", svg).forEach((c, i) => {
      const dx = (i - 2.5) * 14,
        peak = -40 - (i % 3) * 9;
      go(
        c,
        [
          { opacity: 0, transform: "translate(0px,0px) scale(.5)", easing: "cubic-bezier(.2,.7,.4,1)" },
          {
            opacity: 1,
            transform: `translate(${dx * 0.6}px,${peak}px) scale(1.05)`,
            offset: 0.48,
            easing: "cubic-bezier(.5,0,.9,.6)",
          },
          { opacity: 1, transform: `translate(${dx}px,${6 + (i % 2) * 6}px) scale(.9)`, offset: 0.9 },
          { opacity: 0, transform: `translate(${dx * 1.05}px,${10 + (i % 2) * 6}px) scale(.8)` },
        ],
        { delay: 540 + i * 50, duration: 820 },
      );
    });
    setTimeout(onPop, 600);
    setTimeout(end, 1700);
  };
  function openChest(row) {
    const id = row.dataset.chest,
      c = store.get("nic.chests", {});
    if (c[id]) return;
    c[id] = NIC.game.today();
    store.set("nic.chests", c);
    const b = qs(".p-chest", row),
      svg = qs(".p-chest-svg", b),
      xp = 5 + Math.floor(Math.random() * 6);
    NIC.sfx.play("chest");
    b.disabled = true;
    row.classList.remove("ready");
    row.classList.add("paying");
    app.chestAnim(svg, {
      onPop() {
        game.award(xp, "chest");
        fx.floatText(b, `+${xp} XP`, "#ff9600");
        fx.celebrate(b, { silent: true });
      },
      onEnd() {
        row.classList.remove("paying");
        row.classList.add("opened");
      },
    });
  }

  /** The boss in this course with the lowest score under 80%, if any. */
  function weakBoss(s) {
    const q = store.get("nic.quiz", {});
    return (
      inSubj(s)
        .filter(isBoss)
        .map((m) => {
          const B = NIC.bossDef(m.id);
          if (!B) return null;
          const n = B.qs.length,
            c = B.qs.filter((_, i) => q[`${m.id}-${i}`] && q[`${m.id}-${i}`].ok).length;
          return { m, f: c / n };
        })
        .filter((x) => x && x.f < 0.8)
        .sort((a, b) => a.f - b.f)
        .map((x) => x.m)[0] || null
    );
  }

  /** "What should I do now?" One primary action (continue > due reviews > next lesson) plus the others as chips. */
  function todayCard(s, all, next) {
    const pos = store.get("nic.lessonPos", {});
    const started = all.find((m) => status(m) !== "done" && pos[m.id] > 0);
    const due = NIC.bank ? NIC.bank.dueSeen({ subjects: [s] }) : 0;
    const acts = [];
    if (started) {
      const L = NIC.LESSONS[started.id];
      acts.push({
        k: "cont",
        to: started.id,
        t: `Continue ${esc(started.title)}`,
        sub: L ? `You stopped partway through` : "",
        icon: IC.play,
      });
    }
    if (due >= 5)
      acts.push({
        k: "due",
        to: "practice/due",
        t: `Review ${due} due question${due === 1 ? "" : "s"}`,
        sub: "Short spaced reviews keep it stuck",
        icon: IC.reset,
      });
    if (next && (!started || next !== started))
      acts.push({
        k: "next",
        to: next.id,
        t: `${status(next) === "new" && !Object.keys(store.get("nic.lessonDone", {})).length ? "Start" : "Next"}: ${esc(next.title)}`,
        sub: `${next.num === "Boss" ? "Boss quiz" : "Lesson " + next.num}`,
        icon: IC.star,
      });
    if (due > 0 && due < 5) acts.push({ k: "due", to: "practice/due", t: `Review ${due} due`, icon: IC.reset });
    if (!acts.length) return "";
    const [top, ...rest] = acts;
    return `<div class="td-card"><button class="td-main" data-to="${top.to}"><span class="td-ic">${top.icon}</span><span class="td-t"><small>Up next</small><b>${top.t}</b>${top.sub ? `<em>${top.sub}</em>` : ""}</span><span class="td-go">${IC.play}</span></button>
      ${
        rest.length
          ? `<div class="td-more">${rest
              .slice(0, 3)
              .map((a) => `<button class="td-chip" data-to="${a.to}">${a.icon}<span>${a.t}</span></button>`)
              .join("")}</div>`
          : ""
      }</div>`;
  }

  /** Where the path is scrolled to: the first row on screen and its offset (content above can change height, e.g. the Up next card). */
  const pathKey = (r) => r.dataset.id || r.dataset.chest;
  function pathAnchor() {
    const r = qsa(".p-row", main).find((x) => x.getBoundingClientRect().top >= 80);
    return { y: window.scrollY, key: r ? pathKey(r) : null, top: r ? r.getBoundingClientRect().top : 0 };
  }
  /** Put that row back at the same place; again next frame, after late layout (emoji icons, fonts) above it settles. */
  function restorePath(page, a) {
    const go = () => {
      if (!page.isConnected) return;
      const r = a.key && qsa(".p-row", page).find((x) => pathKey(x) === a.key);
      window.scrollTo(0, r ? window.scrollY + r.getBoundingClientRect().top - a.top : a.y);
    };
    go();
    requestAnimationFrame(go);
  }
  /** quiet: the same path is being rebuilt (lesson closed, theme flip), so nothing re-enters. at: a pathAnchor() to restore. */
  function home(s, { quiet = false, at = null } = {}) {
    const S = SUBJECTS[s],
      all = inSubj(s),
      P = progress(all);
    const lastId = store.get("nic.last", {})[s],
      last = modules.find((m) => m.id === lastId);
    const next = all.find((m) => status(m) !== "done");
    const resume = last && status(last) !== "done" ? last : next;
    const lecs = Object.entries(S.lectures).filter(([lec]) => inLec(s, lec).length);
    const page = el(`<div class="page path-page">
      <h1 class="sr-only">${S.name}</h1>
      ${NIC.art ? NIC.art.banner(s, { title: S.name, sub: `${S.code} · ${P.d}/${P.n} lessons done` }) : ""}
      ${todayCard(s, all, next)}
      <div class="unit-sticky"><div class="us-in"></div></div>
      ${lecs
        .map(([lec, title], u) => {
          const list = inLec(s, lec),
            p = progress(list),
            col = UNIT_COLORS[u % 4];
          const [lbl, ttl] = title.includes(" — ") ? title.split(" — ") : [`${S.unit} ${lec}`, title];
          const cast = PATH_CAST[u % PATH_CAST.length],
            side = u % 2 ? "right" : "left";
          const castRow = Math.min(list.length - 1, 2);
          return `<section class="unit u-${col}" data-u="${u}" data-lbl="${esc(lbl)}" data-ttl="${esc(ttl)}" data-p="${p.d}/${p.n}" data-lec="${lec}">
          ${u ? `<div class="unit-divider"><span>${lbl} · ${ttl}</span></div>` : ""}
          <div class="path" style="height:${pathItems(list, lec).length * ROW + 20}px">
            ${pathItems(list, lec)
              .map((it, i) => {
                if (it.chest) return chestRow(it, i);
                const m = it.m;
                const st = status(m),
                  boss = isBoss(m),
                  cur = resume === m;
                const topic = !boss && window.FLUENT_EMOJI && FLUENT_EMOJI.topics && FLUENT_EMOJI.topics[m.id];
                const ic = topic
                  ? NIC.emo(topic, "p-topic") + (st === "done" ? `<span class="p-badge">${IC.check}</span>` : "")
                  : st === "done"
                    ? boss
                      ? IC.trophy
                      : IC.check
                    : boss
                      ? IC.trophy
                      : cur
                        ? IC.play
                        : IC.star;
                const L = NIC.LESSONS[m.id],
                  pos = store.get("nic.lessonPos", {})[m.id] || 0,
                  frac =
                    st === "started" && L
                      ? Math.min(0.95, pos / (L.steps.length + L.steps.filter((x) => x.c).length + 2))
                      : 0;
                return `<div class="p-row st-${st} ${boss ? "boss" : ""} ${cur ? "cur" : ""}" style="--k:${zig(i).toFixed(3)};top:${i * ROW}px" data-id="${m.id}">
                <button class="p-node" aria-label="${m.num} ${esc(m.title)}">${cur || st === "started" ? `<svg class="p-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" stroke-width="8"/><circle cx="50" cy="50" r="46" fill="none" stroke="var(--u)" stroke-width="8" stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="${289 * (1 - frac)}" transform="rotate(-90 50 50)"/></svg>` : ""}<span class="p-face">${ic}</span></button>
                ${cur ? `<span class="p-bubble">${status(m) === "started" ? "Continue" : P.d ? "Jump in" : "Start"}</span>` : ""}</div>`;
              })
              .join("")}
            <div class="p-cast ${side}" style="top:${castRow * ROW - 10}px">${NIC.mascot({ who: cast.who || S.who, size: 110, act: cast.act, acc: cast.acc, mood: cast.mood || "idle" })}</div>
          </div></section>`;
        })
        .join("")}
      <div class="path-end ${P.d === P.n ? "won" : ""}">${NIC.mascot({ who: S.who, size: 100, mood: P.d === P.n ? "love" : "determined", acc: ["crown"], act: P.d === P.n ? "dance" : "" })}<b>${P.d === P.n ? "Course complete!" : `${P.n - P.d} to go`}</b><span class="faint">${S.name} · ${P.d}/${P.n} done</span>
        ${P.d === P.n ? `<div class="pe-acts"><button class="btn primary" data-to="practice/due">Revise this course</button>${weakBoss(s) ? `<button class="btn" data-to="${weakBoss(s).id}">Retry ${esc(weakBoss(s).title)}</button>` : ""}</div>` : ""}</div>
    </div>`);
    main.appendChild(page);
    if (at) restorePath(page, at);
    if (NIC.art)
      page.style.setProperty("--pat", NIC.art.pattern({ nic: "leaves", ds: "waves", algo: "circuit" }[s] || "dots"));
    qsa(".p-node", page).forEach((b) =>
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        app.nodePop(b.closest(".p-row"));
      }),
    );
    app.wireTips(page);
    rail();
    qsa(".p-chest-row.ready", page).forEach((r) =>
      qs(".p-chest", r).addEventListener("click", (e) => {
        e.stopPropagation();
        openChest(r);
      }),
    );
    jumpButton(page);
    qsa("[data-to]", page).forEach((b) =>
      b.addEventListener("click", () => {
        location.hash = b.dataset.to;
      }),
    );
    app.stickyHeader(page, quiet);
    // entrance: nodes on the first screen spring in one after another; the rest spring in as they scroll into view
    if (!quiet) {
      const pops = qsa(".p-node, .p-chest, .p-cast .mascot", page);
      let k0 = 0;
      pops.forEach((n) => {
        if (n.getBoundingClientRect().top < innerHeight * 0.92) app.popNode(n, 0.05 + k0++ * 0.05);
      });
      app.life.onCleanup(fx.onView(pops, { run: (n) => app.popNode(n, 0) }));
    }
    app.life.onCleanup(NIC.cast.idle(page));
    // came back from a finished lesson: glide to the next node and nudge it
    if (NIC.lastFinished) {
      const fin = NIC.lastFinished;
      NIC.lastFinished = null;
      const target = qs(".p-row.cur", page) || qs(`.p-row[data-id="${fin}"]`, page);
      if (target)
        setTimeout(() => {
          target.scrollIntoView({ behavior: fx.reduce() ? "auto" : "smooth", block: "center" });
          setTimeout(() => {
            fx.bump(qs(".p-node", target), { scale: 1.2 });
            NIC.sfx.play("pop");
            const mark = qs(`.p-row[data-id="${fin}"] .p-badge, .p-row.st-done[data-id="${fin}"] .p-face > svg`, page); // the check mark you just earned
            if (mark && mark.isConnected) fx.springIn(mark, { from: 0, rot: -40, bounce: 0.6, delay: 0.12 });
          }, 500);
        }, 200);
    } else if (!at) {
      // first visit: bring the current lesson on screen
      const cur = qs(".p-row.cur", page);
      if (cur && cur.getBoundingClientRect().top > innerHeight * 0.75) cur.scrollIntoView({ block: "center" });
    }
  }
  Object.assign(app, { UNIT_COLORS, home, pathAnchor });
})();
