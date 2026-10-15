/* l7-workshop: Lecture 7 workshop 7.W, the ant trail sandbox (no code): a double bridge and a five-town delivery round. */
(function () {
  const N = NIC,
    { qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const sh = (NIC.shared.nicL7 = NIC.shared.nicL7 || {});
  const { bridge, outcome, bridgeSVG, SHORT, TICKS, rolling } = sh;
  const { allTours, tourLen, tourName, edgesOf, sendAnt, trailOn, strongest, mapSVG, sum } = sh;

  // Five towns on a rough pentagon (not to scale). The perimeter tour A-B-C-D-E is the shortest (46), A-C-E-B-D the longest (73).
  const M5 = {
    names: ["A", "B", "C", "D", "E"],
    pos: { A: [70, 70], B: [240, 35], C: [410, 95], D: [340, 235], E: [100, 225] },
    dist: { "A-B": 9, "A-C": 17, "A-D": 16, "A-E": 8, "B-C": 9, "B-D": 11, "B-E": 12, "C-D": 8, "C-E": 17, "D-E": 12 },
  };
  const AT5 = { "A-C": 0.22, "A-D": 0.22, "B-D": 0.25, "B-E": 0.25, "C-E": 0.22 };
  const TOURS = allTours(M5),
    LENS = TOURS.map((t) => tourLen(M5, t)),
    BEST = TOURS[LENS.indexOf(Math.min(...LENS))],
    WORST = TOURS[LENS.indexOf(Math.max(...LENS))];
  const Q = 300,
    TAU0 = 10,
    BOOST = 60;
  const fresh = () => Object.fromEntries(Object.keys(M5.dist).map((k) => [k, TAU0]));

  function view(c, stage) {
    stage.innerHTML = `
      <div class="wk-card"><h3>1 · Double bridge</h3>
        <div class="wk-row" data-bc></div>
        <div data-bsvg></div>
        <p class="nw7-note" data-bnote aria-live="polite"></p>
        <div class="wk-stats" data-bst></div></div>
      <div class="wk-card"><h3>2 · Delivery round</h3>
        <div class="wk-row" data-dc></div>
        <div class="wk-row nw7-acts"><button class="btn primary" data-one>Send 1 ant</button><button class="btn" data-ten>Send 10 ants</button><button class="btn" data-boost>Boost the longest tour</button><button class="btn ghost" data-reset>Reset trails</button></div>
        <div data-map></div>
        <div class="wk-stats" data-dst></div>
        <p class="nw7-note" data-dnote aria-live="polite"></p></div>`;
    const sB = N.slider("Lower branch length", SHORT, 15, 1, c.len),
      sR = N.slider("Evaporation ρ", 0, 90, 10, c.rho, (v) => v + "%");
    sB.onInput((v) => {
      c.len = v;
      c.sim = null;
      paintBridge(c);
    });
    sR.onInput((v) => {
      c.rho = v;
      paintMap(c);
    });
    const run = N.el(`<button class="btn primary" data-run>Run colony</button>`);
    qs("[data-bc]", stage).append(sB, run);
    qs("[data-dc]", stage).append(sR);
    c.q = (s) => qs(s, stage);
  }

  function paintBridge(c) {
    const b = c.sim,
      at = TICKS - 1;
    c.q("[data-bsvg]").innerHTML = b
      ? bridgeSVG({ lenL: c.len, tU: b.tu[at], tL: b.tl[at], picks: b.picks, at })
      : bridgeSVG({ lenL: c.len, tU: 0, tL: 0 });
    const mine = c.runs.filter((r) => r.len === c.len),
      n = (o) => mine.filter((r) => r.o === o).length;
    c.q("[data-bnote]").innerHTML = b
      ? `Upper branch ${SHORT}, lower branch ${c.len}. This colony ended <b>${{ up: "on the upper branch", down: "on the lower branch", split: "split between both" }[outcome(b)]}</b> (${Math.round(rolling(b.picks, 40)[at])}% of its last 40 ants used the upper branch).`
      : `Pick a lower branch length and press <b>Run colony</b>. The upper branch is always ${SHORT} long.`;
    c.q("[data-bst]").innerHTML =
      N.wk.stat(`Colonies at ${c.len}`, mine.length, "blue") +
      N.wk.stat("Upper won", n("up"), "teal") +
      N.wk.stat("Lower won", n("down"), "amber") +
      N.wk.stat("Split", n("split"), "");
  }

  const top = (c) => strongest(M5, c.tau, TOURS);
  function paintMap(c) {
    const t = top(c);
    c.q("[data-map]").innerHTML = mapSVG(M5, c.tau, { hl: new Set(edgesOf(t)), at: AT5, short: true });
    const tag = (x) => `${tourName(x)} (${tourLen(M5, x)})`;
    c.q("[data-dst]").innerHTML =
      N.wk.stat("Ants sent", c.n, "blue") +
      N.wk.stat("Strongest trail", tag(t), tourName(t) === tourName(BEST) ? "teal" : "rose") +
      N.wk.stat("Shortest tour", tag(BEST), "teal") +
      N.wk.stat("Total pheromone", sum(Object.values(c.tau)).toFixed(0), "amber");
    c.q("[data-dnote]").innerHTML = c.msg;
  }

  function check(c) {
    const { api } = c;
    const eq = c.runs.filter((r) => r.len === SHORT);
    if (eq.some((r) => r.o === "up") && eq.some((r) => r.o === "down")) api.done("equal");
    if (c.runs.some((r) => r.len >= 10 && r.o === "up")) api.done("short");
    const t = tourName(top(c));
    if (!c.boosted && c.n >= 10 && t === tourName(BEST)) api.done("best");
    if (c.boosted && c.noEvap && c.since >= 20 && t === tourName(WORST)) api.done("trap");
    if (c.boosted && c.since >= 5 && c.rho >= 40 && t !== tourName(WORST)) api.done("escape");
  }

  function send(c, k) {
    for (let i = 0; i < k; i++) {
      sendAnt(M5, c.tau, Math.random, c.rho / 100, Q);
      c.n++;
      if (c.boosted) {
        c.since++;
        if (c.rho > 0) c.noEvap = false;
      }
    }
    c.msg = c.boosted
      ? `Boosted tour <b>${tourName(WORST)}</b> now holds ${trailOn(c.tau, WORST).toFixed(0)} in total. Evaporation ${c.rho}%.`
      : `Trails so far: the best tour holds <b>${trailOn(c.tau, BEST).toFixed(0)}</b>, the longest <b>${trailOn(c.tau, WORST).toFixed(0)}</b>.`;
    paintMap(c);
    check(c);
  }

  function wire(c, stage) {
    qs("[data-run]", stage).onclick = () => {
      c.sim = bridge(0, c.len, Math.random);
      c.runs.push({ len: c.len, o: outcome(c.sim) });
      paintBridge(c);
      c.api.say(
        c.len === SHORT
          ? "Equal branches: nothing favours either side, so luck decides. Run a few more."
          : "The shorter branch is paid first. Does it win every time?",
      );
      check(c);
    };
    qs("[data-one]", stage).onclick = () => send(c, 1);
    qs("[data-ten]", stage).onclick = () => send(c, 10);
    qs("[data-boost]", stage).onclick = () => {
      edgesOf(WORST).forEach((e) => (c.tau[e] += BOOST));
      Object.assign(c, { boosted: true, since: 0, noEvap: true });
      c.msg = `Added ${BOOST} pheromone to every road of the longest tour, <b>${tourName(WORST)}</b>. A bad early trail.`;
      c.api.say("A bad trail has been planted. Can the colony ignore it?", "think");
      paintMap(c);
    };
    qs("[data-reset]", stage).onclick = () => {
      Object.assign(c, { tau: fresh(), n: 0, boosted: false, since: 0, noEvap: true, msg: "Trails reset." });
      paintMap(c);
    };
  }

  function build(stage, api) {
    const c = {
      api,
      len: SHORT,
      sim: null,
      runs: [],
      rho: 20,
      tau: fresh(),
      n: 0,
      boosted: false,
      since: 0,
      noEvap: true,
      msg: `Roads start equal (${TAU0} each). Distances are on the labels; thicker lines mean more pheromone.`,
    };
    view(c, stage);
    wire(c, stage);
    paintBridge(c);
    paintMap(c);
  }

  N.register({
    id: "l7-wtrail",
    lecture: 7,
    order: 90,
    num: "7.W",
    workshop: true,
    title: "Workshop: ant trail sandbox",
    blurb: "No code. Run double-bridge colonies, then send ants round a five-town delivery map and fight a bad trail.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "Two sandboxes. The <b>bridge</b> shows how a colony picks a branch. The <b>delivery round</b> lets you send ants, change evaporation and plant a bad trail.",
        missions: [
          {
            id: "equal",
            t: "Equal branches, both outcomes",
            d: "Keep <b>Lower branch length</b> at 5 and press <b>Run colony</b> until one colony settles on the upper branch and another on the lower.",
            hint: "Each run is random, and about four in ten end on each side. Keep pressing.",
          },
          {
            id: "short",
            t: "Make the short branch win",
            d: "Slide <b>Lower branch length</b> to 10 or more and run colonies until the upper (short) branch wins.",
            hint: "It wins most runs, but not all. Try again if a colony picks the long branch.",
          },
          {
            id: "best",
            t: "Find the shortest round",
            d: "On the delivery map press <b>Send 10 ants</b> until the strongest trail (green) follows the shortest tour. Use at least 10 ants.",
            hint: "Keep sending: ants are random, so it can take 20 to 40 ants. Evaporation near 20% works well. If the trail locks onto a wrong tour, press <b>Reset trails</b> and try again.",
          },
          {
            id: "trap",
            t: "Trapped by a bad trail",
            d: "Press <b>Reset trails</b> and <b>Boost the longest tour</b>. Set <b>Evaporation ρ</b> to 0% and send 20 ants. The bad tour stays the strongest.",
            hint: "With no evaporation the 60 units never fade, so the boosted tour keeps its lead.",
          },
          {
            id: "escape",
            t: "Evaporation frees the colony",
            d: "Boost the longest tour again, set <b>Evaporation ρ</b> to 40% or more and send ants until the longest tour is no longer the strongest trail.",
            hint: "At 40 to 60% the planted 60 units fade within about seven ants. If the colony keeps following the bad tour, send more ants.",
          },
        ],
        build,
      });
      root.appendChild(
        predict({
          id: "l7-wtrail-1",
          q: "You boost the longest tour, set <b>Evaporation ρ</b> to 0% and send 20 ants. Which tour holds the strongest trail?",
          opts: [
            "Still the boosted longest tour",
            "The shortest tour, as the ants find it",
            "A random tour, which changes with each ant",
          ],
          a: 0,
          why: "Nothing evaporates, so the planted 60 units on each of its roads stay. Twenty ants cannot add enough elsewhere to overtake that.",
        }),
      );
      root.appendChild(
        predict({
          id: "l7-wtrail-2",
          q: "A road holds a planted 60 units. Ignoring new deposits, evaporation of 50% per ant leaves it under 1 unit after about how many ants?",
          opts: ["About 2", "About 6", "About 30"],
          a: 1,
          hint: "Halve it each time: 60, 30, 15, 7.5, ...",
          why: "60, 30, 15, 7.5, 3.75, 1.9, 0.94: six halvings. With no evaporation it would take for ever.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A colony on <b>equal</b> branches still commits to one, by chance. With a <b>shorter</b> branch it usually commits to that one.",
            "On the delivery map the trails drift towards <b>short tours</b>, since shorter tours deposit more per road.",
            "<b>No evaporation</b> means an early mistake never fades. Evaporation lets the colony forget it.",
          ],
          "Reinforce what works, and let the rest evaporate.",
        ),
      );
    },
  });

  L["l7-wtrail"] = {
    sum: "Run double-bridge colonies, send ants round a five-town map and see evaporation rescue a colony from a bad trail.",
    steps: [
      {
        t: "Two sandboxes",
        b: `<p>The <b>bridge</b> sandbox runs a colony of ${TICKS} ants over two branches. The <b>delivery round</b> sandbox sends ants round five towns. Line thickness shows pheromone, and the number on each road is its distance. Missions come from what you <b>do</b>: run, slide, send and boost.</p>`,
        v: F.compare(
          { title: "Double bridge", c: "blue", body: "Two branches<br>Slide the lower length<br>Run a colony" },
          { title: "Delivery round", c: "teal", body: "Five towns, ten roads<br>Send ants<br>Set evaporation ρ" },
        ),
        c: {
          q: "On the delivery map, what does a thicker line mean?",
          o: ["More pheromone on that road", "A longer road", "A road the ant has already visited"],
          a: 0,
          why: "Thickness is drawn from the pheromone level. Distances are written on the labels.",
        },
      },
      {
        t: "Evaporation forgets a bad start",
        b: `<p>A planted trail of 60 units on a road fades if nothing refills it. With evaporation of 50% it loses half each ant. With none, it stays for ever. That is the difference you will test.</p>`,
        v: F.plot(
          [
            { pts: Array.from({ length: 9 }, (_, i) => [i, 60]), c: "rose", label: "no evaporation" },
            { pts: Array.from({ length: 9 }, (_, i) => [i, 60 * 0.5 ** i]), c: "teal", label: "50% evaporation" },
          ],
          { x: [0, 8], y: [0, 64], xl: "ants sent", yl: "pheromone", h: 190 },
        ),
        c: {
          q: "A road holds 60 and nothing refills it. Half is lost each time. What does it hold after two ants?",
          o: ["15", "30", "0"],
          a: 0,
          why: "60 → 30 → 15.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
