(function () {
  const partScope = (NIC.shared.algoP1 = NIC.shared.algoP1 || {});
  const { SURF, table } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header, randint, rnd } = N;
  const L = NIC.LESSONS;

  N.register({
    id: "a1-surfer",
    subject: "algo",
    lecture: 1,
    order: 3,
    num: "1.3",
    title: "The random surfer",
    blurb: "One lazy reader, clicking links and occasionally teleporting. Her visit counts ARE the PageRank.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let gkey = "leaky",
        d = 0.85,
        cur = "A",
        visits = {},
        hops = 0,
        teleports = 0,
        running = null;
      const card = el(`<div class="card">
        <div class="card-head"><h2>Drop a surfer on the web</h2><span class="faint">each tick: follow a link with probability d, else teleport</span></div>
        <div class="grid side">
          <div>
            <div id="svgWrap"></div>
            <div class="controls" id="ctl">
              <button class="btn primary" id="go">Surf</button>
              <button class="btn" id="hop">1 hop</button>
              <button class="btn ghost" id="rs">Reset</button>
            </div>
            <div class="controls" id="dRow"></div>
            <div class="controls" id="gRow"><span class="faint" style="font-size:13px">Web:</span></div>
            <div id="status" class="callout" style="margin-top:4px"></div>
          </div>
          <div>
            <h3 style="margin-top:0">Visit share so far</h3>
            <div id="vbars"></div>
            <div class="stat-row" style="margin-top:14px">
              <div class="stat"><small>Hops</small><b id="sh">0</b></div>
              <div class="stat amber"><small>Teleports</small><b id="st">0</b></div>
              <div class="stat violet"><small>Current page</small><b id="sc">—</b></div>
            </div>
            <p class="faint" id="truth" style="font-size:12.5px"></p>
          </div>
        </div></div>`);
      root.appendChild(card);
      const dSlider = N.slider(
        "Damping d (follow links)",
        0,
        1,
        0.05,
        d,
        (v) => `d = ${v.toFixed(2)} · teleport ${(1 - v).toFixed(2)}`,
      );
      dSlider.onInput((v) => {
        d = v;
        drawStatus();
      });
      qs("#dRow", card).appendChild(dSlider);
      qs("#gRow", card).appendChild(
        N.seg(
          Object.keys(SURF).map((k) => [k, SURF[k].name]),
          gkey,
          (v) => {
            gkey = v;
            reset();
          },
        ),
      );
      const G = () => SURF[gkey];
      function svgHTML() {
        const g = G(),
          P = g.nodes,
          parts = [
            `<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="none" stroke="var(--text-dim)" stroke-width="1.4"/></marker></defs>`,
          ];
        for (const u of Object.keys(g.out))
          for (const v of g.out[u]) {
            const [x1, y1] = P[u],
              [x2, y2] = P[v];
            const dx = x2 - x1,
              dy = y2 - y1,
              len = Math.hypot(dx, dy);
            const mx = (x1 + x2) / 2,
              my = (y1 + y2) / 2;
            const recip = (g.out[v] || []).includes(u);
            const off = recip ? 22 : 7;
            const cx = mx - (dy / len) * off,
              cy = my + (dx / len) * off;
            // shorten ends so arrow lands at circle edge
            const tx = x2 + (cx - x2) * 0.16,
              ty = y2 + (cy - y2) * 0.16;
            parts.push(
              `<path d="M${x1},${y1} Q${cx},${cy} ${tx},${ty}" fill="none" stroke="var(--line-2)" stroke-width="1.6" marker-end="url(#ah)"/>`,
            );
          }
        for (const [k, [x, y]] of Object.entries(P)) {
          parts.push(`<circle cx="${x}" cy="${y}" r="20" fill="var(--panel-2)" stroke="${g.out[k].length ? "var(--teal)" : "var(--rose)"}" stroke-width="2.5"/>
            <text x="${x}" y="${y + 5}" fill="var(--text)" font-size="14" font-weight="700" text-anchor="middle">${k}</text>
            ${g.out[k].length ? "" : `<text x="${x}" y="${y + 34}" fill="var(--rose)" font-size="10" text-anchor="middle" font-family="var(--mono)">dead end</text>`}`);
        }
        parts.push(
          `<circle id="dot" r="8" fill="var(--amber)" stroke="var(--panel)" stroke-width="2" cx="${P[cur][0]}" cy="${P[cur][1]}"/><circle id="tp" r="8" fill="none" stroke="var(--amber)" stroke-width="2" cx="${P[cur][0]}" cy="${P[cur][1]}" opacity="0"/>`,
        );
        return `<svg class="viz" viewBox="0 0 540 210" style="max-height:230px">${parts.join("")}</svg>`;
      }
      function reset() {
        const g = G();
        cur = Object.keys(g.nodes)[0];
        visits = {};
        Object.keys(g.nodes).forEach((k) => (visits[k] = 0));
        visits[cur] = 1;
        hops = 0;
        teleports = 0;
        qs("#svgWrap", card).innerHTML = svgHTML();
        draw();
      }
      function tick() {
        const g = G(),
          links = g.out[cur];
        if (rnd() < d) {
          if (!links.length) {
            visits[cur]++;
            hops++;
          } else {
            cur = links[randint(0, links.length - 1)];
            visits[cur]++;
            hops++;
          }
        } else {
          const names = Object.keys(g.nodes);
          cur = names[randint(0, names.length - 1)];
          visits[cur]++;
          hops++;
          teleports++;
          const tp = qs("#tp", card),
            P = g.nodes[cur];
          if (tp) {
            tp.setAttribute("cx", P[0]);
            tp.setAttribute("cy", P[1]);
            tp.setAttribute("r", 8);
            tp.setAttribute("opacity", 0.9);
            let r0 = 8;
            const anim = life.interval(() => {
              r0 += 3;
              tp.setAttribute("r", r0);
              tp.setAttribute("opacity", Math.max(0, 0.9 - r0 / 40));
              if (r0 > 36) anim();
            }, 40);
          }
        }
        draw();
      }
      function draw() {
        const g = G(),
          P = g.nodes[cur],
          dot = qs("#dot", card);
        if (dot) {
          dot.setAttribute("cx", P[0]);
          dot.setAttribute("cy", P[1]);
        }
        const tot = Object.values(visits).reduce((a, b) => a + b, 0) || 1;
        qs("#vbars", card).innerHTML = Object.keys(g.nodes)
          .map((k) => {
            const pct = (visits[k] / tot) * 100;
            return `<div style="display:grid;grid-template-columns:30px 1fr 52px;gap:10px;align-items:center;margin-bottom:7px"><b class="mono">${k}</b><span style="height:14px;border-radius:7px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${pct.toFixed(1)}%;background:var(--teal);transition:width .25s"></span></span><span class="mono dim" style="font-size:12px">${pct.toFixed(0)}%</span></div>`;
          })
          .join("");
        qs("#sh", card).textContent = hops;
        qs("#st", card).textContent = teleports;
        qs("#sc", card).textContent = cur;
        qs("#truth", card).innerHTML =
          d < 1
            ? `True PageRank at d = ${d.toFixed(2)}: <b>${G().converges}</b> — the bars settle toward it as hops grow.`
            : `d = 1: no teleports. Whatever trap exists wins — there is no single right answer.`;
        drawStatus();
      }
      function drawStatus() {
        const st = qs("#status", card);
        if (d >= 1 && !G().out[cur].length) {
          st.className = "callout rose";
          st.innerHTML = `<b>Stuck.</b> The surfer reached ${cur}, which has no out-links, and d = 1 means she never teleports. She will click here forever — every visit share collapses onto ${cur}.`;
        } else if (d >= 1) {
          st.className = "callout amber";
          st.innerHTML = `<b>No teleporting (d = 1).</b> ${gkey === "trap" ? "She'll fall into the A↔B cycle and bounce forever — X never sees her again." : "She can only follow links. Wait until she lands on D — there's no way out."}`;
        } else {
          st.className = "callout teal";
          st.innerHTML = G().note;
        }
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Surf";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(() => {
          tick();
        }, 320);
      };
      qs("#hop", card).onclick = () => {
        stop();
        tick();
      };
      qs("#rs", card).onclick = () => {
        stop();
        reset();
      };
      reset();
      root.appendChild(
        predict({
          id: "a1-surfer-1",
          q: "On the leaky web with teleporting <b>off</b> (d = 1.00), what do the visit shares converge to?",
          opts: [
            "Evenly spread — she visits everything eventually",
            "All on D — once she arrives there's no way out",
            "All on C — it has the most incoming links",
          ],
          a: 1,
          why: "D is a <b>sink</b>: links go in, none come out. Every random walk ends parked there — the visit share collapses to 100% D, and the ranking is meaningless. That's the dangling leak in surfer form.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Rank <b>flows</b> through links: a link's worth = source's rank ÷ its out-degree.",
            "<b>Dangling</b> pages leak rank (nothing to pour through); repair = pour uniformly to everyone.",
            "<b>Closed loops</b> trap rank — the A↔B slosh. Teleporting escapes every trap and gives every page a floor.",
            "Damping d is the dial between trusting link structure (d→1) and trusting nothing (d→0).",
          ],
          "A random surfer who mostly clicks links and sometimes teleports ends up spending time on pages in exactly PageRank proportions.",
        ),
      );
    },
  });

  /* ================================================================
     1.4 — PageRank mechanics
     ================================================================ */
  const PRG = {
    names: ["P", "Q", "R", "S", "T"],
    out: { P: ["Q", "R"], Q: ["R"], R: ["P", "S"], S: ["R"], T: [] },
    pos: { P: [70, 70], Q: [195, 40], R: [330, 80], S: [255, 180], T: [440, 175] },
  };

  L["a1-pagerank"] = {
    sum: "links → matrix H → repair dangling → A → teleport → G → iterate. Every G entry is positive, so rank can never be trapped — and the numbers converge.",
    steps: [
      {
        t: "Links become a matrix",
        b: `<p>On our five-page web (<code>P→Q,R &nbsp;Q→R &nbsp;R→P,S &nbsp;S→R &nbsp;T→∅</code>), build <b>H</b> where <b>H[i,j]</b> = probability of jumping <i>from j to i</i>. <b>Columns are sources</b>: each page's rank pours fully into its column.</p>`,
        v:
          table(
            ["to ↓ from →", "P", "Q", "R", "S", "T"],
            [
              { c: ["<b>P</b>", "0", "0", ".5", "0", "0"] },
              { c: ["<b>Q</b>", ".5", "0", "0", "0", "0"] },
              { c: ["<b>R</b>", ".5", "1", "0", "1", "0"], hl: true },
              { c: ["<b>S</b>", "0", "0", ".5", "0", "0"] },
              { c: ["<b>T</b>", "0", "0", "0", "0", "0"], bad: true },
            ],
          ) +
          `<p class="dim" style="margin-top:8px">Column sums: 1, 1, 1, 1, <b>0</b> — T's column leaks, exactly like the token trace.</p>`,
        c: {
          q: "Which single fact catches a transposed H?",
          o: ["The matrix is square", "Sources are columns", "All entries are small"],
          a: 1,
          why: "Orientation is where most PageRank bugs live. Column-stochastic = every source distributes all of its rank.",
        },
      },
      {
        t: "Repair, then teleport",
        b: `<p>Two fixes produce <b>G</b>, the Google matrix:</p><span class="key">A = H with every dangling column replaced by 1/N<br>B = every entry 1/N (pure teleport)<br><b>G = d·A + (1−d)·B</b></span><p>At N = 5 and d = 0.75, teleport adds (1−d)/N = <b>0.05 to every entry</b> — no entry of G is ever 0, so no trap can hold rank forever.</p>`,
        c: {
          q: "Column P of G (P links to Q and R) = 0.75·[0,.5,.5,0,0] + 0.05 everywhere. Rows P…T =",
          o: ["[0.25, 0.375, 0.375, 0.05, 0.05]", "[0.05, 0.425, 0.425, 0.05, 0.05]", "[0, 0.5, 0.5, 0, 0]"],
          a: 1,
          why: "0.75·0.5 + 0.05 = 0.425; everything else gets just the 0.05 teleport floor. Column sums to 1 ✓.",
        },
      },
      {
        t: "One power-iteration step, by hand",
        b: `<p>Start with p₀ = [0.4, 0.1, 0.2, 0.2, 0.1]. Compute p₁ = G·p₀ (trick: 0.75·(A·p₀) + 0.05·Σp₀):</p>`,
        v:
          table(
            ["Page", "A·p₀", "×0.75 + 0.05"],
            [
              ["P", "0.12", "0.14"],
              ["Q", "0.22", "0.215"],
              ["R", "0.52", "<b>0.44</b>"],
              ["S", "0.12", "0.14"],
              ["T", "0.02", "0.065"],
            ],
          ) +
          `<p class="dim" style="margin-top:8px">Sanity checks to always run: sum(p₁) = 1 ✓ · all entries ≥ 0 ✓ · R wins because everyone feeds it.</p>`,
      },
      {
        t: "Why it converges",
        b: `<p>Every entry of G is <b>strictly positive</b> (thanks to the teleport floor). A positive matrix can mix but never trap: starting from <i>any</i> valid p₀, repeated multiplication settles to one answer — the PageRank vector. At d = 0.85 ours is roughly <b>R 0.41, P ≈ S 0.21, Q 0.13, T 0.04</b>.</p>`,
        c: {
          q: "Two different starting vectors converge to the same ranking. That proves the code is…",
          o: ["correct", "stable", "fast"],
          a: 1,
          why: "Convergence agreement shows the iteration is stable, not that the matrix was built right. You still need column-sum and mass checks.",
        },
      },
      {
        t: "What it costs",
        b: `<p>Each iteration multiplies a vector by G:</p>`,
        v:
          table(
            ["Implementation", "Cost per iteration"],
            [
              ["Dense matrix", "O(N²) — touches all N² entries"],
              ["Sparse (walk the links)", "O(N + L) — each page and each link once"],
            ],
          ) +
          `<p class="dim" style="margin-top:8px">Real webs have billions of pages and ~10 links each. Sparse is the difference between “trillion operations” and “fine”.</p>`,
      },
    ],
    guide: [
      "Press <b>Iterate</b> once: watch the five bars jump from the start vector.",
      "Press <b>Run</b>: the bars settle and the error curve dives toward zero — that's convergence.",
      "Set damping to <b>0.75</b> and the start vector to <b>session p₀</b>: the first step should print the session's numbers (0.14 / 0.215 / 0.44 / 0.14 / 0.065).",
      "Turn <b>repair dangling</b> OFF and run: watch total mass leak below 1.0 — T's column goes nowhere.",
      "Drag damping near 1.00: convergence crawls. That's d ≈ 1 being fragile.",
      "Answer the Predict question.",
    ],
  };
  Object.assign(partScope, { PRG });
})();
