/* l15-workshop: Lecture 15: the MOPSO sandbox (15.1 looks it up at call time; the engine is in l15-02.js), and workshop 15.W, the drone route MOPSO lab (no code). */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL15;
  const { C, pr, frame, dot, joinLine, crowd, fmtD, archAdd, contrib, ranksPer } = sh;
  const { TRUE, mopsoInit, mopsoStep, mopsoStats, pruneArch } = sh;
  const { avgRank, AX, pts, star, ARCH } = sh;

  const CTL = {
    rule: [
      "pbest rule",
      "rule",
      [
        ["new", "Keep newest"],
        ["old", "Keep oldest"],
      ],
    ],
    cap: [
      "Archive cap",
      "cap",
      [
        ["6", "6"],
        ["10", "10"],
        ["20", "20"],
        ["0", "No cap"],
      ],
    ],
    prune: [
      "Pruning",
      "prune",
      [
        ["crowd", "Crowding distance"],
        ["clu", "Clustering"],
      ],
    ],
    lead: [
      "Leader",
      "lead",
      [
        ["rand", "Random"],
        ["sparse", "Sparse"],
        ["count", "Dominated count"],
        ["hv", "Hypervolume"],
      ],
    ],
  };
  /** The MOPSO sandbox. o: {ctl: keys of CTL, title, onStep(S)} */
  function mopsoDemo(root, life, o = {}) {
    let seed = 3,
      running = false,
      lines = false;
    const set = { cap: 10, prune: "crowd", lead: "rand", rule: "new" };
    let S = mopsoInit(seed, set);
    const card = el(
      `<div class="card nw13-demo"><div class="card-head"><h2>${o.title || "MOPSO sandbox"}</h2></div><div class="nw15-ctls" data-c></div><div class="controls"><button class="btn primary" data-a="step">Step</button><button class="btn" data-a="run">Run</button><button class="btn ghost" data-a="reset">Reset</button><button class="btn" data-a="ln">Show leaders</button></div><div data-p></div><p class="nw13-legend"><span class="nw13-k blue"></span>particles <span class="nw13-k teal"></span>archive <span class="nw13-k dash"></span>true front</p><div class="nw13-stats" data-t></div></div>`,
    );
    root.appendChild(card);
    const fr = frame({ ...AX, h: 300 });
    const clip = (p) => [p[0], Math.min(10, p[1])];
    const draw = () => {
      const ln = lines
        ? S.P.filter((q) => q.L)
            .map(
              (q) =>
                `<line x1="${fr.X(q.f[0]).toFixed(1)}" y1="${fr.Y(Math.min(10, q.f[1])).toFixed(1)}" x2="${fr.X(q.L[0]).toFixed(1)}" y2="${fr.Y(Math.min(10, q.L[1])).toFixed(1)}" stroke="var(--violet)" stroke-width="1.5" stroke-dasharray="3 3"/>`,
            )
            .join("")
        : "";
      qs("[data-p]", card).innerHTML = fr.wrap(
        joinLine(fr, TRUE, "line-2", "5 4") +
          ln +
          S.A.map((a, i) => dot(fr, `a${i}`, clip(a.f), { c: "teal", lab: false, r: 6 })).join("") +
          S.P.map((q, i) => dot(fr, `p${i}`, clip(q.f), { c: "blue", lab: false, r: 5 })).join(""),
        `Iteration ${S.it}: ${S.P.length} particles, ${S.A.length} archived solutions.`,
      );
      const t = mopsoStats(S);
      qs("[data-t]", card).innerHTML =
        `<div class="wk-stat"><small>Iteration</small><b>${S.it}</b></div><div class="wk-stat teal"><small>Archive size</small><b>${t.size}</b></div><div class="wk-stat blue"><small>Near the true front</small><b>${t.near} of ${t.size}</b></div><div class="wk-stat amber"><small>Time range covered</small><b>${t.lo.toFixed(1)} to ${t.hi.toFixed(1)}</b></div>`;
    };
    (o.ctl || []).forEach((k) => {
      const [lab, key, opts] = CTL[k];
      const w = el(`<div class="nw15-ctl"><small>${lab}</small></div>`);
      w.append(
        N.seg(opts, String(set[key]), (v) => {
          set[key] = S[key] = key === "cap" ? +v : v;
          pruneArch(S);
          draw();
        }),
      );
      qs("[data-c]", card).append(w);
    });
    const go = () => {
      mopsoStep(S);
      draw();
      if (o.onStep) o.onStep(S, set);
    };
    const bt = (a) => qs(`[data-a="${a}"]`, card);
    bt("step").onclick = go;
    bt("run").onclick = () => {
      running = !running;
      bt("run").textContent = running ? "Pause" : "Run";
    };
    bt("reset").onclick = () => ((S = mopsoInit(++seed, set)), draw());
    bt("ln").onclick = () => {
      lines = !lines;
      bt("ln").classList.toggle("primary", lines);
      draw();
    };
    life.interval(() => running && S.it < 400 && go(), 220);
    draw();
    return { state: () => S };
  }
  Object.assign(sh, { mopsoDemo });

  // ---------- 15.W workshop cards ----------
  const card = (stage, title, inner) => {
    const c = el(`<div class="card nw13-demo"><div class="card-head"><h2>${title}</h2></div>${inner}</div>`);
    stage.appendChild(c);
    return c;
  };
  /** Archive gate: decide for each newcomer whether it joins. */
  const QUEUE = [
    [3, 3.5],
    [6.5, 3],
    [9, 0.5],
    [5, 5],
  ];
  function gate(stage, api) {
    let A = Object.values(ARCH),
      k = 0;
    const fr = frame({ ...AX, h: 280 });
    const c = card(
      stage,
      "Archive gate",
      `<div class="controls"><button class="btn primary" data-a="add">Add to archive</button><button class="btn" data-a="no">Turn away</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`,
    );
    const draw = (msg) => {
      const y = QUEUE[k];
      qs("[data-p]", c).innerHTML = fr.wrap(
        A.map((a, i) => dot(fr, i, a, { c: "teal", lab: `(${a.join(", ")})` })).join("") +
          (y ? star(fr, y, `y = (${y.join(", ")})`) : ""),
        `Archive of ${A.length}. ${y ? `Newcomer at (${y.join(", ")}).` : "Queue empty."}`,
      );
      qs("[data-n]", c).innerHTML =
        msg ||
        (y
          ? `Newcomer ${k + 1} of ${QUEUE.length}: <b>(${y.join(", ")})</b>. Does it join?`
          : "All four newcomers handled.");
    };
    const decide = (add) => {
      const y = QUEUE[k];
      if (!y) return;
      const R = archAdd(A, y),
        gone = A.filter((_, i) => R.log[i] === "rm");
      if (add !== R.added) {
        const by = A.filter((_, i) => R.log[i] === "beats");
        api.say(
          R.added
            ? `No archive member dominates (${y.join(", ")}), so it joins.`
            : `(${by[0].join(", ")}) dominates (${y.join(", ")}): lower or equal on both. It is turned away.`,
        );
        return;
      }
      A = R.A;
      k++;
      draw(
        R.added
          ? `Joined.${gone.length ? ` It removed ${gone.map((g) => `(${g.join(", ")})`).join(", ")}.` : ""} Next newcomer.`
          : "Turned away, archive unchanged. Next newcomer.",
      );
      if (k === QUEUE.length) {
        api.say("Every newcomer handled: two joined, two were dominated.", "happy");
        api.done("gate");
      }
    };
    qs("[data-a=add]", c).onclick = () => decide(true);
    qs("[data-a=no]", c).onclick = () => decide(false);
    draw();
  }

  /** Prune by hand: remove the most crowded member until the cap is met. */
  const PR10 = pts(
    "p 0.5 9, q 1.5 7.2, r 1.9 6.6, s 3.5 4.6, t 4 4.1, u 4.4 3.8, v 6.5 2.4, w 7 2.1, x 8.2 1.3, y 9.5 0.6",
  );
  function pruner(stage, api) {
    const ids = Object.keys(PR10),
      V = ids.map((k) => PR10[k]);
    let live = ids.map((_, i) => i),
      show = false;
    const fr = frame({ ...AX, h: 280 });
    const c = card(
      stage,
      "Prune to a cap of 5",
      `<div class="controls"><button class="btn" data-a="d">Show crowding</button><button class="btn ghost" data-a="rs">Start again</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`,
    );
    const draw = () => {
      const d = crowd(V, live);
      qs("[data-p]", c).innerHTML = fr.wrap(
        live.map((i) => dot(fr, ids[i], V[i], { c: "teal", lab: `${ids[i]}${show ? ` ${fmtD(d[i])}` : ""}` })).join(""),
        `Archive of ${live.length}: ${live.map((i) => ids[i]).join(", ")}.`,
      );
      qs("[data-n]", c).innerHTML =
        live.length > 5 ? `Archive <b>${live.length}</b>, cap 5. Tap the member to remove next.` : "Down to 5: done.";
    };
    qs("[data-p]", c).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (!t || live.length <= 5) return;
      const i = ids.indexOf(t.dataset.id),
        d = crowd(V, live);
      const w = live.reduce((a, b) => (d[b] < d[a] ? b : a));
      if (i !== w) {
        api.say(
          `${ids[i]} has crowding distance ${fmtD(d[i])}. Someone is more crowded: remove the smallest distance first.`,
        );
        return;
      }
      live = live.filter((x) => x !== i);
      draw();
      if (live.length === 5) {
        api.say(`Kept ${live.map((x) => ids[x]).join(", ")}: both ends and one from each clump.`, "happy");
        api.done("prune");
      }
    });
    qs("[data-a=d]", c).onclick = (e) => ((show = !show), e.target.classList.toggle("primary", show), draw());
    qs("[data-a=rs]", c).onclick = () => ((live = ids.map((_, i) => i)), draw());
    draw();
  }

  /** Hypervolume leader: the particle is the reference point. */
  const W5 = pts("m1 1.5 9, m2 3 6, m3 4.5 5, m4 6 2.5, m5 8 1.5");
  function hvPick(stage, api) {
    const ids = Object.keys(W5),
      V = ids.map((k) => W5[k]),
      ref = [9.5, 7];
    const cb = contrib(V, ref);
    let show = false;
    const fr = frame({ ...AX, h: 280 });
    const c = card(
      stage,
      "Leader by hypervolume",
      `<div class="controls"><button class="btn" data-a="b">Show boxes</button></div><div data-p></div><p class="nw13-note" data-n aria-live="polite"></p>`,
    );
    const draw = () => {
      qs("[data-p]", c).innerHTML = fr.wrap(
        (show ? sh.exclBoxes(fr, V, ref) : "") +
          ids.map((k, i) => dot(fr, k, V[i], { c: "teal", lab: show ? `${k} ${cb[i]}` : k })).join("") +
          star(fr, ref, "particle (9.5, 7)"),
        `Archive m1 to m5 and a particle at (9.5, 7).`,
      );
    };
    qs("[data-n]", c).innerHTML = "Tap the archive member that would lead this particle.";
    qs("[data-p]", c).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (!t || !ids.includes(t.dataset.id)) return;
      const i = ids.indexOf(t.dataset.id),
        best = cb.indexOf(Math.max(...cb));
      if (i === best) {
        api.say(
          `${ids[i]} adds ${cb[i]} of the ${sh.hv(V, ref)} units of hypervolume on its own: the largest share.`,
          "happy",
        );
        api.done("hv");
      } else
        api.say(
          cb[i]
            ? `${ids[i]} adds only ${cb[i]} on its own. Look for a bigger exclusive box.`
            : `${ids[i]} does not dominate the particle, so it adds nothing here.`,
        );
    });
    qs("[data-a=b]", c).onclick = (e) => ((show = !show), e.target.classList.toggle("primary", show), draw());
    draw();
  }

  /** Average rank for many objectives. */
  const RK = [
    ["M1", [4, 2, 7]],
    ["M2", [1, 8, 5]],
    ["M3", [6, 5, 2]],
    ["M4", [3, 3, 4]],
  ];
  function ranker(stage, api) {
    const V = RK.map((r) => r[1]),
      R = ranksPer(V),
      av = avgRank(V);
    let show = false;
    const c = card(
      stage,
      "Average rank: three objectives",
      `<div class="controls"><button class="btn" data-a="r">Show ranks</button></div><table class="t nw13-tbl nw15-pick" data-t></table><p class="nw13-note" data-n aria-live="polite">Tap the member average rank would prefer as a leader. All three objectives are minimised.</p>`,
    );
    const draw = () => {
      qs("[data-t]", c).innerHTML =
        `<tr><th>member</th><th>f₁</th><th>f₂</th><th>f₃</th><th>average rank</th></tr>` +
        RK.map(
          ([n, v], i) =>
            `<tr data-id="${n}"><td><b>${n}</b></td>${v.map((x, m) => `<td>${x}${show ? ` <small>(r${R[m][i]})</small>` : ""}</td>`).join("")}<td>${show ? av[i].toFixed(2) : "?"}</td></tr>`,
        ).join("");
    };
    qs("[data-t]", c).addEventListener("click", (e) => {
      const t = e.target.closest("[data-id]");
      if (!t) return;
      const i = RK.findIndex((r) => r[0] === t.dataset.id),
        best = av.indexOf(Math.min(...av));
      if (i === best) {
        api.say(
          "M4 is never best on any objective, yet second on all three: average rank 2.00 beats everyone.",
          "happy",
        );
        api.done("rank");
      } else api.say(`${RK[i][0]} averages ${av[i].toFixed(2)}. Rank each column (1 = lowest) and average.`);
    });
    qs("[data-a=r]", c).onclick = (e) => ((show = !show), e.target.classList.toggle("primary", show), draw());
    draw();
  }

  function build(stage, api, life) {
    gate(stage, api);
    pruner(stage, api);
    hvPick(stage, api);
    mopsoDemo(stage, life, {
      ctl: ["cap", "prune", "lead", "rule"],
      title: "MOPSO sandbox",
      onStep: (S) => {
        const t = mopsoStats(S);
        if (S.cap && t.near >= 8 && t.hi - t.lo >= 8) {
          api.say(
            `Iteration ${S.it}: ${t.near} archive members near the front, covering times ${t.lo.toFixed(1)} to ${t.hi.toFixed(1)}. Close and spread.`,
            "happy",
          );
          api.done("run");
        }
      },
    });
    ranker(stage, api);
  }

  N.register({
    id: "l15-wlab",
    lecture: 15,
    order: 90,
    num: "15.W",
    workshop: true,
    title: "Workshop: drone route MOPSO lab",
    blurb:
      "No code. Guard the archive, prune it by crowding, pick a hypervolume leader, run a MOPSO and rank many objectives.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "Five cards: an <b>archive gate</b>, a <b>pruning</b> puzzle, a <b>hypervolume leader</b>, a <b>MOPSO sandbox</b> and an <b>average rank</b> table. Both drone objectives, time and energy, are minimised.",
        missions: [
          {
            id: "gate",
            t: "Guard the archive",
            d: "At the <b>Archive gate</b>, press <b>Add to archive</b> or <b>Turn away</b> for each of the four newcomers.",
            hint: "A newcomer is turned away only if some archive member is lower or equal on both objectives (and lower on one).",
          },
          {
            id: "prune",
            t: "Prune to the cap",
            d: "Tap archive members to remove them, most crowded first, until 5 are left.",
            hint: "Press <b>Show crowding</b>. Remove the smallest distance; the numbers change after each removal.",
          },
          {
            id: "hv",
            t: "Pick the leader",
            d: "Tap the archive member with the largest hypervolume contribution for the particle at (9.5, 7).",
            hint: "Press <b>Show boxes</b>: each member's own box is what would be lost without it.",
          },
          {
            id: "run",
            t: "Run a MOPSO",
            d: "With an <b>Archive cap</b>, reach 8 or more <b>Near the true front</b> with a <b>Time range covered</b> at least 8 wide.",
            hint: "Use cap 10 or 20, press <b>Run</b> and wait 20 to 60 iterations. If it stalls, press <b>Reset</b>.",
          },
          {
            id: "rank",
            t: "Rank many objectives",
            d: "In the <b>Average rank</b> table, tap the member that average rank prefers.",
            hint: "Press <b>Show ranks</b>. The lowest average wins.",
          },
        ],
        build,
      });
      root.appendChild(
        pr(
          "l15-wlab-1",
          "In the sandbox, set <b>Pruning</b> to <b>Crowding distance</b>. Why do the two ends of the archive never get pruned? | Their crowding distance is infinite | They have the most swarm particles nearby | They are the oldest members of the archive | Crowding distance gives the extremes ∞, so they always outrank inner members and the archive keeps its full width.",
        ),
      );
      root.appendChild(
        pr(
          "l15-wlab-2",
          "In the pruning puzzle, which member went first, and why? | t: its neighbours s and u sit very close | p: it is the end with the highest energy | y: it is the end with the longest time | t at (4, 4.1) had the smallest crowding distance, 0.20, squeezed between s and u. The ends p and y are ∞ and can never go first.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A newcomer joins the archive unless a member dominates it, and removes every member it dominates.",
            "<b>Crowding distance</b> pruning removes the most crowded member, recomputes, and always keeps the two ends.",
            "A <b>hypervolume</b> leader is the archive member whose own box against the particle is largest.",
            "<b>Average rank</b> can prefer a balanced member that is best on no single objective.",
          ],
          "Keep the archive small, spread and well led.",
        ),
      );
    },
  });

  L["l15-wlab"] = {
    sum: "Decide which newcomers join an archive, prune it by crowding distance, pick a hypervolume leader, run a capped MOPSO and pick a leader by average rank.",
    steps: [
      {
        t: "The lab",
        b: `<p>Five cards, one drone problem: every route has a <b>time</b> and an <b>energy</b>, both lower is better. Guard the archive, prune it, pick a leader, run the whole algorithm, then try a many-objective ranking.</p>`,
        v: F.flow([
          "Guard the archive",
          "Prune it",
          "Pick a leader",
          "Run MOPSO",
          { t: "Rank many objectives", c: "teal" },
        ]),
        c: C(
          "Archive: (2, 6) and (5, 3). Newcomer (4, 4), both minimised. Does it join? | Yes: neither member dominates it | No: (5, 3) is lower on energy, so it dominates it | No: (2, 6) is lower on time, so it dominates it | (2, 6) is worse on energy and (5, 3) is worse on time, so neither dominates (4, 4). It joins and removes nobody.",
        ),
      },
      {
        t: "One MOPSO iteration",
        b: `<p>Each particle picks a <b>leader</b> from the archive, updates its velocity and position as in plain PSO, updates its <b>pbest</b> with a dominance rule, and offers its new position to the <b>archive</b>. If the archive is over its cap, <b>pruning</b> removes the most crowded member.</p>`,
        v: F.cycle(["Pick a leader", "Move", "Update pbest", "Update archive", "Prune to cap"]),
        c: C(
          "Where does a MOPSO particle get the point that replaces PSO's global best g? | A leader chosen from the archive | Its own pbest, used twice | The swarm's average position | The archive holds the non-dominated set, and a leader is selected from it for each particle.",
        ),
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
