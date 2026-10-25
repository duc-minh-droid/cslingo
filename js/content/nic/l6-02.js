/* l6-02: Lecture 6: 6.2 random programs. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, randint, rnd } = N;
  const L = N.LESSONS;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});
  const { row, mulberry, FN, fn, tm, size, depth, randomProgram, treeSVG, sx } = sh;

  /* ============ 6.2 Random programs ============ */
  const FS_RAND = ["+", "-", "*", "%", "IF"],
    TS_RAND = [() => "X", () => "Y", () => Math.round(rnd() * 50) / 10];

  N.register({
    id: "l6-random",
    lecture: 6,
    order: 2,
    num: "6.2",
    title: "Creating random programs",
    blurb: "Expand a random program one node at a time and see how the depth limit forces terminals.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "To start a GP run you need a <b>function set</b> F (here PLUS, MINUS, TIMES, DIV, IF) and a <b>terminal set</b> T (X, Y and any real number), with syntax rules: PLUS, MINUS, TIMES and DIV take two children and <b>IF takes four</b> (IF A &gt; B then C else D). Pick a maximum depth, choose a random function for the root, then keep giving children to function nodes that don't have any yet.",
        ),
      );
      let maxD = 5,
        tree = null,
        pend = [];
      const card = el(
        `<div class="card"><div class="card-head"><h2>Grow a program</h2></div><div class="controls" id="c"></div><div id="tr"></div><div id="note"></div><div class="controls"><button class="btn" id="stat">Create 300 random programs</button></div><canvas class="viz" id="hist" style="display:none"></canvas><div id="st"></div></div>`,
      );
      root.appendChild(card);
      const sD = N.slider("Maximum depth", 2, 6, 1, maxD);
      sD.onInput((v) => {
        maxD = v;
        newProg();
      });
      const bStep = el(`<button class="btn primary">Expand one node</button>`),
        bAll = el(`<button class="btn">Finish the program</button>`),
        bNew = el(`<button class="btn ghost">New program</button>`);
      qs("#c", card).append(sD, bStep, bAll, bNew);
      const term = () => tm(TS_RAND[Math.floor(rnd() * 3)]());
      function newProg() {
        const op = FS_RAND[randint(0, 4)];
        tree = fn(op);
        tree.kids = [];
        tree.pendingNode = true;
        pend = [{ n: tree, d: 1 }];
        draw();
      }
      function expand() {
        if (!pend.length) return;
        const i = randint(0, pend.length - 1),
          { n, d } = pend.splice(i, 1)[0];
        n.kids = Array.from({ length: FN[n.op].n }, () => {
          if (d < maxD - 1 && rnd() < 0.5) {
            const f = fn(FS_RAND[randint(0, 4)]);
            f.kids = [];
            pend.push({ n: f, d: d + 1 });
            return f;
          }
          return term();
        });
        draw(d);
      }
      bStep.onclick = expand;
      bAll.onclick = () => {
        while (pend.length) expand();
      };
      bNew.onclick = newProg;
      function draw(last) {
        const pset = new Set(pend.map((p) => p.n));
        qs("#tr", card).innerHTML = treeSVG(tree, { pend: pset, showDepth: true });
        const done = !pend.length;
        qs("#note", card).innerHTML =
          `<div class="callout ${done ? "teal" : "blue"}">${done ? `<b>Finished.</b> ` : `<b>${pend.length}</b> function node${pend.length === 1 ? " is" : "s are"} still waiting for children (dashed). `}${last === maxD - 1 ? `That node was at depth ${last} = max − 1, so all its children had to be <b>terminals</b>.` : last ? `That node was at depth ${last}, so its children could be functions or terminals.` : ""}${done ? `Size <b>${size(tree)}</b> nodes, depth <b>${depth(tree)}</b>. As a formula: <span class="mono">${sx(tree)}</span>` : ""}</div>`;
      }
      qs("#stat", card).onclick = () => {
        const sizes = [],
          bins = Array(8).fill(0);
        let hit = 0;
        for (let k = 0; k < 300; k++) {
          const t = randomProgram(Math.random, maxD, FS_RAND, TS_RAND),
            s = size(t);
          sizes.push(s);
          if (depth(t) === maxD) hit++;
        }
        const mx = Math.max(...sizes),
          w = Math.max(1, Math.ceil((mx + 1) / 8));
        sizes.forEach((s) => bins[Math.min(7, Math.floor(s / w))]++);
        const cv = qs("#hist", card);
        cv.style.display = "";
        N.barChart(cv, {
          groups: [{ values: bins, color: N.colors().blue }],
          labels: bins.map((_, i) => `${i * w}–${i * w + w - 1}`),
          height: 170,
          decimals: 0,
          names: ["programs"],
        });
        qs("#st", card).innerHTML =
          `<p>With maximum depth ${maxD}: sizes range from <b>${Math.min(...sizes)}</b> to <b>${mx}</b> nodes (mean <b>${(sizes.reduce((a, b) => a + b, 0) / 300).toFixed(1)}</b>); <b>${hit}</b> of 300 reached the full depth.</p>`;
      };
      newProg();
      root.appendChild(
        predict({
          id: "l6-rand-1",
          q: "Maximum depth is 5. A function node at depth 4 is expanded. What can its children be?",
          opts: ["Only terminals", "Functions or terminals", "Only functions"],
          a: 0,
          why: "A function at depth Max − 1 is given terminals only. Its children sit at depth 5 = Max, so they cannot have children of their own.",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-rand-2",
          q: "Press <b>Create 300 random programs</b> with maximum depth 5. Which describes the sizes?",
          opts: [
            "All programs have almost exactly the same size",
            "Sizes vary a lot, from a handful of nodes to dozens",
            "Every program fills all five levels with 31 nodes",
          ],
          a: 1,
          why: "Each expansion randomly picks function or terminal, so some trees stop early and others fill out. Random programs differ greatly in size.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Initialisation needs a function set F, a terminal set T and syntax rules (arity of each function).",
            "Choose a random function for the root; then give random children to each childless function node.",
            "At depth Max − 1 the children are terminals, which caps the depth at Max.",
          ],
          "A depth limit turns an unbounded random program into a finite one.",
        ),
      );
    },
  });

  L["l6-random"] = {
    sum: "Random programs are built from a <b>function set</b> and a <b>terminal set</b>, with a <b>depth limit</b> so they stop growing.",
    steps: [
      {
        t: "Function set, terminal set, syntax",
        b: `<p><b>F</b> = PLUS, MINUS, TIMES, DIV, IF. <b>T</b> = X, Y, any real number. Syntax rules say how many children each function has: two for PLUS, MINUS, TIMES and DIV; <b>four</b> for IF (IF A &gt; B then return C else return D).</p>`,
        v:
          row(
            "F",
            `<span class="genome">${["PLUS", "MINUS", "TIMES", "DIV", "IF"].map((s) => `<span class="gene p1" style="padding:2px 6px">${s}</span>`).join("")}</span>`,
          ) +
          row(
            "T",
            `<span class="genome">${["X", "Y", "3.7"].map((s) => `<span class="gene good" style="padding:2px 6px">${s}</span>`).join("")}</span>`,
          ),
        c: {
          q: "How many children does IF have in the lecture's syntax?",
          o: ["2", "3", "4"],
          a: 2,
          why: "A, B, C and D: if A &gt; B return C, else return D.",
        },
      },
      {
        t: "Grow it with a depth limit",
        b: `<p>Maximum depth 5. <b>Start:</b> pick a random function for the root (depth 1). <b>Repeat:</b> pick a function node without children. If its depth is less than Max − 1, give it random children (functions or terminals) one level deeper. If its depth is <b>exactly Max − 1</b>, its children must all be terminals.</p>`,
        v: (box) => {
          const r = mulberry(11),
            t = randomProgram(r, 4, FS_RAND, [() => "X", () => "Y", () => Math.round(r() * 50) / 10]);
          box.innerHTML =
            treeSVG(t, { showDepth: true }) +
            `<p class="dim" style="text-align:center">A program with maximum depth 4; <i>d</i> labels show each node's depth.</p>`;
        },
        c: {
          q: "Maximum depth is 5. A function node at depth 4 gets its children. They must be…",
          o: ["Terminals", "Functions", "Anything"],
          a: 0,
          why: "Depth 4 = Max − 1, so the children land on the last allowed level.",
        },
      },
      {
        t: "Reading a random program",
        b: `<p>A tree can be read as ordinary code. Random programs are often silly: for example an IF whose two branches return the same thing. That is fine; selection will sort the useful ones from the useless ones.</p>`,
        v: `<div class="mono" style="text-align:center">(IF (&gt; X 3.1) <b>Y</b> <b>Y</b>)</div><p class="dim" style="text-align:center">Both branches return Y: harmless, and selection will not reward it.</p>`,
        c: {
          q: "A random program contains useless code, such as an IF that returns Y on both branches. What should we do?",
          o: [
            "Nothing: evolution works with random material",
            "Reject it and generate another random program",
            "Edit it by hand to remove the useless branch",
          ],
          a: 0,
          why: "GP starts from random programs and relies on selection.",
        },
      },
      {
        t: "Sizes vary a lot",
        b: `<p>Because each child is randomly a function or a terminal, one random program may stop after 3 nodes and the next may fill every level. The depth limit is the only thing that stops growth.</p>`,
        v: (box) => {
          const mk = (n) => {
            const r = mulberry(n),
              t = randomProgram(r, 4, FS_RAND, [() => "X", () => "Y", () => Math.round(r() * 50) / 10]);
            return `<div>${treeSVG(t)}<p class="dim" style="text-align:center">${size(t)} nodes</p></div>`;
          };
          box.innerHTML = `<div class="grid two">${mk(3)}${mk(21)}</div><p class="dim" style="text-align:center">Same depth limit (4), very different sizes.</p>`;
        },
        c: {
          q: "What stops a random program from growing without end?",
          o: ["The maximum depth rule", "The fitness function", "The size of the population"],
          a: 0,
          why: "At depth Max − 1 children must be terminals.",
        },
      },
    ],
    guide: [
      "Press <b>Expand one node</b> several times.",
      "Change the <b>Maximum depth</b> and press <b>Finish the program</b>.",
      "Press <b>Create 300 random programs</b> and look at the sizes.",
      "Answer the questions after the demo.",
    ],
  };

  /* ============ shared mini-figures (lectures 7 and 8, plain-words steps): small interactive pictures ============ */
  const nf = (NIC.shared.nicFig = NIC.shared.nicFig || {});
  const tint = (c, p = 18) => `color-mix(in srgb, var(--${c}) ${p}%, var(--panel))`;
  const r2 = (v) => +v.toFixed(2);
  const wrap = (box) => box.appendChild(el(`<div class="fig-wrap" aria-live="polite"></div>`));
  const btn = (t, f, cls = "") => {
    const b = el(`<button class="btn small ${cls}">${t}</button>`);
    b.onclick = f;
    return b;
  };

  /** A strip cut into slices by weight. "Draw" drops a marker at a random spot and counts the slice it lands in.
   *  items: [{n, w, c}]; o.ends shows where each slice stops on the 0 to 1 line. Returns {set(items)}. */
  nf.spin = (box, items, o = {}) => {
    const out = o.bare ? box.appendChild(el(`<div></div>`)) : wrap(box);
    out.innerHTML = `<div data-s></div><p class="dim" data-m style="text-align:center;margin:8px 0"></p><div class="controls" data-b style="justify-content:center"></div>`;
    let cnt = items.map(() => 0),
      u = null;
    const draw = () => {
      const tot = items.reduce((s, i) => s + i.w, 0) || 1;
      let acc = 0,
        hit = -1;
      const ends = items.map((it) => (acc += it.w / tot));
      if (u !== null) hit = ends.findIndex((e) => u < e);
      qs("[data-s]", out).innerHTML =
        `<div style="position:relative;padding-top:22px"><div style="display:flex;border:2px solid var(--line);border-radius:12px;overflow:hidden">${items
          .map(
            (it, i) =>
              `<div style="flex:${Math.max(it.w, 0.0001)};min-width:0;padding:8px 2px;text-align:center;font-size:12.5px;line-height:1.3;background:${tint(it.c, hit === i ? 48 : 16)};border-right:2px solid var(--line)"><b style="display:block;overflow:hidden">${it.n}</b><span style="font-weight:800;color:var(--text-dim)">${Math.round((it.w / tot) * 100)}%</span>${o.ends ? `<small style="display:block;color:var(--text-dim)">to ${r2(ends[i])}</small>` : ""}${cnt[i] ? `<small style="display:block;font-weight:800">×${cnt[i]}</small>` : ""}</div>`,
          )
          .join(
            "",
          )}</div>${u === null ? "" : `<div style="position:absolute;top:0;left:calc(${(u * 100).toFixed(1)}% - 7px);font-size:16px;line-height:1;color:var(--text)">▼</div>`}</div>`;
      qs("[data-m]", out).innerHTML =
        u === null
          ? o.hint || "Press <b>Draw</b>: a random spot on the strip picks the winner."
          : `The marker landed at <b>${r2(u)}</b>, so <b>${items[hit].n}</b> is picked. Total picks so far: ${cnt.reduce((a, b) => a + b, 0)}.`;
    };
    const pick = (n) => {
      for (let k = 0; k < n; k++) {
        const tot = items.reduce((s, i) => s + i.w, 0) || 1;
        u = rnd();
        let acc = 0;
        const i = items.findIndex((it) => u < (acc += it.w / tot));
        cnt[i < 0 ? items.length - 1 : i]++;
      }
      draw();
    };
    qs("[data-b]", out).append(
      btn("Draw one", () => pick(1), "primary"),
      btn("Draw 20", () => pick(20)),
      btn(
        "Reset",
        () => {
          cnt = items.map(() => 0);
          u = null;
          draw();
        },
        "ghost",
      ),
    );
    draw();
    return {
      set(next) {
        items = next;
        cnt = items.map(() => 0);
        u = null;
        draw();
      },
    };
  };

  /** Scouts vote on the better of two routes; each is right 60% of the time. */
  nf.vote = (box) => {
    const out = wrap(box);
    let n = 11,
      tally = [0, 0],
      last = null;
    const draw = () => {
      qs("[data-d]", out).innerHTML = last
        ? `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">${last.map((r) => `<span style="width:16px;height:16px;border-radius:50%;background:${r ? "var(--teal)" : "var(--rose)"}"></span>`).join("")}</div><p style="text-align:center;margin:8px 0 0"><b>${last.filter(Boolean).length}</b> of ${n} scouts chose the better route (green), so the colony goes ${last.filter(Boolean).length * 2 > n ? "the <b>right</b> way" : "the <b>wrong</b> way"}.</p>`
        : `<p class="dim" style="text-align:center;margin:0">Each dot is one scout. Green: picked the better route. Red: picked the worse one.</p>`;
      const t = tally[0] + tally[1];
      qs("[data-t]", out).innerHTML = t
        ? `<b>${tally[0]}</b> of ${t} colonies of ${n} went the right way (${Math.round((tally[0] / t) * 100)}%).`
        : "";
    };
    out.innerHTML = `<div class="controls" data-c></div><div data-d></div><p style="text-align:center;margin:8px 0 0" data-t></p><div class="controls" data-b style="justify-content:center"></div>`;
    const hold = (k) => {
      for (let j = 0; j < k; j++) {
        last = Array.from({ length: n }, () => rnd() < 0.6);
        tally[last.filter(Boolean).length * 2 > n ? 0 : 1]++;
      }
      draw();
    };
    qs("[data-c]", out).append(
      N.seg(
        [
          ["1", "1 scout"],
          ["11", "11 scouts"],
          ["31", "31 scouts"],
        ],
        "11",
        (v) => {
          n = +v;
          tally = [0, 0];
          last = null;
          draw();
        },
      ),
    );
    qs("[data-b]", out).append(
      btn("Hold a vote", () => hold(1), "primary"),
      btn("Hold 50 votes", () => hold(50)),
    );
    draw();
  };

  /** A trail as a bucket: ants pour in, a fraction leaks out each step. Level settles where gain equals loss. */
  nf.bucket = (box, life) => {
    const S = { a: 4, rho: 20, stop: "never", t: 0 };
    const out = wrap(box),
      c = el(`<div class="controls"></div>`),
      c2 = el(`<div class="controls"></div>`);
    const sA = N.slider("Ants per step", 1, 6, 1, S.a),
      sR = N.slider("Leak per step", 5, 40, 5, S.rho, (v) => v + "%");
    const levels = () => {
      const o = [0];
      for (let t = 1; t <= 40; t++)
        o.push(o[t - 1] * (1 - S.rho / 100) + (S.stop === "never" || t <= +S.stop ? S.a : 0));
      return o;
    };
    let timer = null;
    const draw = () => {
      const lv = levels(),
        top = Math.max(S.a / (S.rho / 100), 4) * 1.15,
        X = (t) => 120 + (t / 40) * 270,
        Y = (v) => 170 - (v / top) * 150,
        prev = S.t ? lv[S.t - 1] : 0,
        loss = prev * (S.rho / 100),
        gain = S.stop === "never" || S.t <= +S.stop ? S.a : 0;
      out.querySelector("[data-g]").innerHTML =
        `<svg class="fig" viewBox="0 0 400 190" style="max-height:230px" role="img" aria-label="A bucket that fills by ${S.a} ants per step and leaks ${S.rho} percent per step, and its level over 40 steps."><rect x="30" y="20" width="56" height="150" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><rect x="33" y="${Y(lv[S.t]).toFixed(1)}" width="50" height="${Math.max(0, 170 - Y(lv[S.t]) - 3).toFixed(1)}" rx="5" fill="var(--blue)" opacity=".55"/><text x="58" y="14" class="fig-sub">+${gain} in</text><text x="102" y="${Math.min(160, Y(lv[S.t]) + 14).toFixed(0)}" class="fig-sub" style="text-anchor:start;fill:var(--rose-ink)">−${r2(loss)}</text><line x1="120" y1="${Y(S.a / (S.rho / 100)).toFixed(1)}" x2="390" y2="${Y(S.a / (S.rho / 100)).toFixed(1)}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5"/><text x="388" y="${(Y(S.a / (S.rho / 100)) - 5).toFixed(1)}" class="fig-sub" style="text-anchor:end">where it levels off: ${r2(S.a / (S.rho / 100))}</text><polyline fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round" points="${lv
          .slice(0, S.t + 1)
          .map((v, t) => `${X(t).toFixed(1)},${Y(v).toFixed(1)}`)
          .join(" ")}"/><text x="255" y="186" class="fig-sub">step ${S.t} of 40</text></svg>`;
      out.querySelector("[data-n]").innerHTML =
        `Level now <b>${r2(lv[S.t])}</b>. Each step it gains <b>${gain}</b> from the ants and loses <b>${S.rho}%</b> of what it held (${r2(loss)}).`;
    };
    const play = () => {
      if (timer) timer();
      S.t = 0;
      draw();
      timer = life.interval(() => {
        if (S.t >= 40) return timer();
        S.t++;
        draw();
      }, 110);
    };
    sA.onInput((v) => ((S.a = v), play()));
    sR.onInput((v) => ((S.rho = v), play()));
    c.append(sA, sR);
    c2.append(
      N.seg(
        [
          ["never", "Ants keep walking"],
          ["20", "Ants stop at step 20"],
        ],
        "never",
        (v) => ((S.stop = v), play()),
      ),
      btn("Replay", play, "ghost"),
    );
    out.innerHTML = `<div data-g></div><p style="text-align:center;margin:6px 0" data-n></p>`;
    out.prepend(c, c2);
    play();
  };

  /** Evaporation with nobody depositing: each round keeps the same fraction of what is left. */
  nf.fade = (box) => {
    const out = wrap(box);
    let rho = 0.5;
    const sl = N.slider("Fraction lost each round", 0.1, 0.9, 0.1, rho, (v) => `${Math.round(v * 100)}%`);
    const draw = () => {
      const v = Array.from({ length: 6 }, (_, i) => 8 * (1 - rho) ** i);
      qs("[data-g]", out).innerHTML =
        `<svg class="fig" viewBox="0 0 400 150" style="max-height:170px" role="img" aria-label="A trail of 8 losing ${Math.round(rho * 100)} percent each round with no deposits: ${v.map(r2).join(", ")}">${v
          .map(
            (x, i) =>
              `<rect x="${24 + i * 62}" y="${(120 - x * 13).toFixed(1)}" width="46" height="${(x * 13).toFixed(1)}" rx="6" fill="var(--blue)" opacity="${(0.25 + 0.75 * (x / 8)).toFixed(2)}" stroke="var(--blue)" stroke-width="2"/><text x="${47 + i * 62}" y="${(114 - x * 13).toFixed(1)}" class="fig-n">${r2(x)}</text><text x="${47 + i * 62}" y="140" class="fig-sub">${i ? "round " + i : "start"}</text>`,
          )
          .join("")}</svg>`;
      qs("[data-n]", out).textContent =
        `Nobody deposits, so every round keeps ${Math.round((1 - rho) * 100)}% of what was there.`;
    };
    out.innerHTML = `<div class="controls" data-c></div><div data-g></div><p class="dim" data-n style="text-align:center;margin:6px 0 0"></p>`;
    sl.onInput((v) => ((rho = v), draw()));
    qs("[data-c]", out).append(sl);
    draw();
  };

  /** Q only sets the scale: the dab an ant lays is Q / tour length, so ratios between ants never change. */
  nf.qScale = (box) => {
    const out = wrap(box);
    const blob = (x, q, c, lab) =>
      `<circle cx="${x}" cy="70" r="${(14 * Math.sqrt(q)).toFixed(1)}" fill="${tint(c, 28)}" stroke="var(--${c})" stroke-width="3"/><text x="${x}" y="70" dy="5" class="fig-n">${q}</text><text x="${x}" y="142" class="fig-sub">${lab}</text>`;
    const draw = (Q) => {
      qs("[data-g]", out).innerHTML =
        `<svg class="fig" viewBox="0 0 400 155" style="max-height:170px" role="img" aria-label="With Q ${Q} a 20 km ant lays ${Q / 20} and a 100 km ant lays ${Q / 100}: always five to one.">${blob(110, Q / 20, "teal", "20 km tour lays")}${blob(290, Q / 100, "blue", "100 km tour lays")}</svg><p style="text-align:center;margin:4px 0 0">The short tour always lays <b>5 times</b> as much. Only the overall loudness changes.</p>`;
    };
    out.innerHTML = `<div class="controls" data-c></div><div data-g></div>`;
    qs("[data-c]", out).append(
      N.seg(
        [
          ["100", "Q = 100"],
          ["200", "Q = 200"],
        ],
        "100",
        (v) => draw(+v),
      ),
    );
    draw(100);
  };

  Object.assign(nf, { tint, r2, wrap, btn });
})();
