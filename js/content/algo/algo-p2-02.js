(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  /* ============ 2.2 A* vs Dijkstra ============ */
  /** Step-through A* on a small grid: one frame per expansion. Tap a cell to toggle a wall. */
  function astarRun(box, life) {
    const GW = 10,
      GH = 7,
      CS = 40,
      S = [1, 3],
      T = [8, 3];
    const kOf = (x, y) => x + "," + y,
      SK = kOf(...S),
      TK = kOf(...T);
    const walls = new Set([1, 2, 3, 4].map((y) => kOf(5, y)));
    const hOf = (x, y) => Math.abs(x - T[0]) + Math.abs(y - T[1]);
    function* frames() {
      const g = { [SK]: 0 },
        parent = {},
        closed = [],
        open = new Map([[SK, 0]]);
      let order = 0;
      const seq = { [SK]: order++ };
      const fOf = (k) => {
        const [x, y] = k.split(",").map(Number);
        return g[k] + hOf(x, y);
      };
      const snap = (x) => ({ g: { ...g }, open: [...open.keys()], closed: closed.slice(), path: [], ...x });
      yield snap({
        cap: `Start: the open set holds only the start. g = <b>0</b>, h = <b>${hOf(...S)}</b>, so f = <b>${hOf(...S)}</b>.`,
        line: 0,
      });
      let asked = 0,
        lastAsk = -9;
      for (let round = 0; open.size; round++) {
        const keys = [...open.keys()],
          fmin = Math.min(...keys.map(fOf));
        // lowest f; ties go to the smaller h, then the older cell
        const cur = keys
          .filter((k) => fOf(k) === fmin)
          .sort((a, b) => fOf(a) - g[a] - (fOf(b) - g[b]) || seq[a] - seq[b])[0];
        const ties = keys.filter((k) => fOf(k) === fmin);
        const [cx, cy] = cur.split(",").map(Number),
          cg = g[cur],
          ch = hOf(cx, cy);
        let ask = null;
        if (asked < 2 && round >= 2 && round - lastAsk >= 3 && ties.length < keys.length && cur !== TK) {
          asked++;
          lastAsk = round;
          ask = {
            q: "Which cell does A* expand next? Tap it.",
            pick: ".rn-gc.open",
            a: ties,
            why: `The lowest f in the open set wins: g ${cg} + h ${ch} = <b>f ${cg + ch}</b>.`,
          };
        }
        open.delete(cur);
        if (cur === TK) {
          const path = [];
          for (let k = TK; k; k = parent[k]) path.push(k);
          yield snap({
            path,
            cap: `The goal has the lowest f, so stop. Path cost <b>${cg}</b>, found after expanding <b>${closed.length + 1}</b> cells. The solid green cells are the path.`,
            line: 2,
            mood: "love",
            ask,
          });
          return;
        }
        closed.push(cur);
        let added = 0;
        [
          [1, 0],
          [0, 1],
          [-1, 0],
          [0, -1],
        ].forEach(([dx, dy]) => {
          const nx = cx + dx,
            ny = cy + dy,
            nk = kOf(nx, ny);
          if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || walls.has(nk) || closed.includes(nk)) return;
          if (g[nk] === undefined || cg + 1 < g[nk]) {
            g[nk] = cg + 1;
            parent[nk] = cur;
            if (!open.has(nk)) {
              seq[nk] = order++;
              added++;
            }
            open.set(nk, 1);
          }
        });
        yield snap({
          cur,
          cap: `Expand the <b>orange</b> cell: g = <b>${cg}</b>, h = <b>${ch}</b>, f = <b>${cg + ch}</b>, the lowest in the open set. ${added ? `It adds <b>${added}</b> new cell${added > 1 ? "s" : ""} to the open set.` : "No new neighbours."}`,
          line: added ? 4 : 3,
          ask,
        });
      }
      yield snap({
        cap: "The open set is empty: <b>no path exists</b>. Tap a wall to remove it.",
        line: 1,
        mood: "sad",
      });
    }
    F.run(box, life, {
      code: [
        "open = {start}; g[start] = 0",
        "cur = open cell with the lowest f = g + h",
        "if cur is the goal: stop, trace the path back",
        "move cur from open to closed",
        "for each free neighbour n: g[n] = g[cur] + 1, add n to open",
      ],
      build(stage, api) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${GW * CS} ${GH * CS}`);
        svg.setAttribute("class", "fig rn-svg rn-astar");
        svg.style.maxHeight = GH * CS + "px";
        let html = "";
        for (let y = 0; y < GH; y++)
          for (let x = 0; x < GW; x++) {
            const k = kOf(x, y),
              fixed = k === SK || k === TK;
            html += `<g class="rn-gc${fixed ? (k === SK ? " rn-gc-start" : " rn-gc-goal") : " rn-gc-free"}" data-k="${k}" transform="translate(${x * CS} ${y * CS})"><rect x="2" y="2" width="${CS - 4}" height="${CS - 4}" rx="7"/><text x="${CS / 2}" y="${CS / 2 + 5}">${k === SK ? "S" : k === TK ? "G" : ""}</text></g>`;
          }
        svg.innerHTML = `<g>${html}</g>`;
        stage.appendChild(svg);
        const cells = {};
        svg.querySelectorAll(".rn-gc").forEach((c) => (cells[c.dataset.k] = { g: c, t: c.querySelector("text") }));
        svg.querySelectorAll(".rn-gc-free").forEach((c) =>
          c.addEventListener("click", () => {
            if (stage.querySelector(".rn-pickable")) return; // a predict is waiting: that click is an answer
            const k = c.dataset.k;
            walls.has(k) ? walls.delete(k) : walls.add(k);
            N.sfx && N.sfx.play("select");
            api.recompute(
              walls.has(k) ? "Wall added. Replaying from the start." : "Wall removed. Replaying from the start.",
            );
          }),
        );
        return { svg, cells };
      },
      draw(sc, f, c) {
        const open = new Set(f.open),
          closed = new Set(f.closed),
          path = new Set(f.path);
        Object.entries(sc.cells).forEach(([k, h]) => {
          const [x, y] = k.split(",").map(Number);
          h.g.classList.toggle("wall", walls.has(k));
          h.g.classList.toggle("open", open.has(k));
          h.g.classList.toggle("closed", closed.has(k));
          h.g.classList.toggle("cur", k === f.cur);
          h.g.classList.toggle("path", path.has(k));
          if (k !== SK && k !== TK)
            h.t.textContent =
              !path.has(k) && (open.has(k) || closed.has(k) || k === f.cur) && f.g[k] !== undefined
                ? f.g[k] + hOf(x, y)
                : "";
          if ((k === f.cur && (!c.prev || c.prev.cur !== k)) || (path.has(k) && !c.prev?.path.length))
            F.rn.pulse(c, h.g.querySelector("rect"), path.has(k) ? 0.03 * f.path.length - 0.03 * f.path.indexOf(k) : 0);
        });
      },
      frames,
    });
  }

  L["a2-astar"] = {
    sum: "A* is Dijkstra plus a sense of direction. It ranks nodes by <b>f = g + h</b>: the real distance travelled so far plus an estimate of what's left. As long as the estimate never overestimates, A* still finds the shortest path, and it explores far less.",
    steps: [
      {
        t: "Dijkstra searches in every direction",
        b: `<p>Dijkstra only knows how far each cell is from the <b>start</b>. On a grid it expands in a growing diamond, including all the cells that head <i>away</i> from the goal.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 170" role="img" aria-label="Dijkstra explores in a full circle around the start, including cells that head away from the goal on the right" style="max-height:170px">${[5, 4, 3, 2, 1].map((r) => `<circle cx="110" cy="85" r="${r * 16}" fill="rgba(206,130,255,${0.05 + (5 - r) * 0.02})" stroke="rgba(206,130,255,.35)" class="fi"/>`).join("")}<circle cx="110" cy="85" r="7" fill="var(--amber)"/><text x="110" y="160" class="fig-sub">start: explores a full circle</text><circle cx="360" cy="85" r="7" fill="var(--rose)"/><text x="360" y="110" class="fig-sub">goal</text></svg>`,
      },
      {
        t: "A* adds an estimate of the distance left",
        b: `<p>Each frontier cell gets a score <code>f = g + h</code>:</p><p><b>g</b> = real cost from the start (known).<br><b>h</b> = a <i>guess</i> of the cost to the goal, such as the grid (Manhattan) distance.</p><p>The cell with the smallest f is expanded next, so cells heading toward the goal win.</p>`,
        v:
          F.compare(
            { title: "Cell P", c: "violet", body: "g = 3, h = 5<br><b>f = 8</b>" },
            { title: "Cell Q  ← expanded first", c: "teal", body: "g = 4, h = 2<br><b>f = 6</b>" },
          ) +
          `<div class="fig-cap">Q is further from the start but much closer to the goal, and that makes it more promising.</div>`,
        c: {
          q: "What happens if h = 0 for every cell?",
          o: [
            "A* gets faster, since it's less work",
            "A* becomes exactly Dijkstra",
            "A* stops finding the shortest path",
          ],
          a: 1,
          why: "With no estimate there's no sense of direction left. It's plain distance-from-start ordering.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>A* goes from <b>S</b> to <b>G</b> around a wall. Each number is a cell's <b>f</b>. <b style="color:var(--violet-ink)">Purple</b> cells are the open set (waiting), <b style="color:var(--teal-ink)">green</b> ones are closed (done) and <b style="color:var(--amber-ink)">orange</b> is the cell being expanded.</p><p>It will ask you to predict the next cell. Tap any empty cell to add or remove a wall.</p>`,
        v: (box, life) => astarRun(box, life),
      },
      {
        t: "The one rule: never overestimate",
        b: `<p>A* is guaranteed to find the shortest path if h is <b>admissible</b>, meaning it never guesses higher than the true remaining cost.</p><p>On an open grid, Manhattan distance is admissible because no real path can be shorter. Doubling it makes A* greedier and faster, but it may skip the true shortest path.</p>`,
        v: F.bars(
          [
            ["true cost left", 10, "teal"],
            ["h = Manhattan", 8, "violet", "OK: ≤ 10"],
            ["h = 2 × Manhattan", 16, "rose", "overestimates"],
          ],
          { max: 16 },
        ),
        c: {
          type: "match",
          q: "On an open grid, match each choice of the estimate <b>h</b> to what A* then does.",
          pairs: [
            ["h = 0 for every cell", "Behaves exactly like Dijkstra"],
            ["h = Manhattan distance", "Never overestimates, so the path is still the shortest"],
            ["h = 2 × Manhattan distance", "Explores fewer cells, but may miss the shortest path"],
          ],
          hint: "Ask whether the estimate ever guesses higher than the true cost left, and what a guess of 0 tells A*.",
          why: "With h = 0 there is no sense of direction, so A* is Dijkstra. Manhattan distance never overestimates, so the path stays shortest. Doubling it overestimates, so a good path can be missed.",
        },
      },
      {
        t: "How to read the grid below",
        b: `<p>Dark cells are walls. <b style="color:var(--amber-ink)">Orange</b> is the start and <b style="color:var(--rose-ink)">red</b> is the goal. Faint purple cells were <i>expanded</i> (looked at), and the <b style="color:var(--teal-ink)">green</b> line is the final path.</p><p>Compare the <b>Cells expanded</b> counter between the two algorithms. That number is the work done.</p>`,
      },
    ],
    guide: [
      "Press <b>Run A*</b> and note the number of cells expanded.",
      "Press <b>Run Dijkstra</b>. Same path cost, but how many more cells?",
      "Set the <b>h weight</b> slider to 0 and run A* again: it matches Dijkstra.",
      "Push the <b>h weight</b> slider to 2.5. Is the path still the same length?",
    ],
  };

  N.register({
    id: "a2-astar",
    subject: "algo",
    lecture: 2,
    order: 2,
    num: "2.2",
    title: "A* vs Dijkstra on a grid",
    blurb:
      "Same grid, same goal — count how many cells each algorithm expands. Tune the heuristic and watch the guarantee bend.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const W = 21,
        H = 13,
        CS = 24;
      const walls = new Set();
      for (let y = 2; y < 11; y++) walls.add(7 + "," + y);
      for (let x = 7; x < 16; x++) walls.add(x + "," + 10);
      for (let y = 1; y < 9; y++) walls.add(14 + "," + y);
      const S = [2, 6],
        T = [18, 6];
      const open = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !walls.has(x + "," + y);
      let wgt = 1;
      function search(useH) {
        const g = { [S.join()]: 0 },
          parent = {},
          expanded = [];
        const pq = [[0, S]];
        while (pq.length) {
          pq.sort((a, b) => a[0] - b[0]);
          const [, cur] = pq.shift();
          const key = cur.join();
          if (expanded.includes(key)) continue;
          expanded.push(key);
          if (cur[0] === T[0] && cur[1] === T[1]) break;
          [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ].forEach(([dx, dy]) => {
            const nx = cur[0] + dx,
              ny = cur[1] + dy,
              nk = nx + "," + ny;
            if (!open(nx, ny)) return;
            const ng = g[key] + 1;
            if (g[nk] === undefined || ng < g[nk]) {
              g[nk] = ng;
              parent[nk] = key;
              const h = useH ? wgt * (Math.abs(nx - T[0]) + Math.abs(ny - T[1])) : 0;
              pq.push([ng + h, [nx, ny]]);
            }
          });
        }
        const path = [];
        let k = T.join();
        while ((k && parent[k] !== undefined) || k === S.join()) {
          path.push(k);
          if (k === S.join()) break;
          k = parent[k];
        }
        return { expanded, path: new Set(path), cost: g[T.join()] };
      }
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="a">Run A*</button><button class="btn" id="d">Run Dijkstra</button><span id="hw"></span></div>
        <canvas class="viz" id="cv"></canvas>
        <div class="stat-row"><div class="stat teal"><small>Cells expanded</small><b id="ex"></b></div><div class="stat"><small>Path cost</small><b id="co"></b></div><div class="stat amber"><small>Heuristic weight</small><b id="wv">1.0</b></div></div></div>`);
      root.appendChild(card);
      const sl = N.slider("h weight", 0, 2.5, 0.25, 1, (v) => v.toFixed(2));
      sl.onInput((v) => {
        wgt = v;
        qs("#wv", card).textContent = v.toFixed(2);
      });
      qs("#hw", card).appendChild(sl);
      function draw(res) {
        const { ctx } = N.setupCanvas(qs("#cv", card), H * CS);
        const C = N.colors(),
          cv = (c) => (c.startsWith("var(--") ? C[c.slice(6, -1).replace("-", "_")] || c : c);
        const cell = (x, y, c) => {
          ctx.fillStyle = cv(c);
          ctx.fillRect(x * CS + 1, y * CS + 1, CS - 2, CS - 2);
        };
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) cell(x, y, walls.has(x + "," + y) ? NIC.colors().text : NIC.colors().line);
        if (res) {
          res.expanded.forEach((k) => {
            const [x, y] = k.split(",").map(Number);
            if (!res.path.has(k)) cell(x, y, "rgba(206,130,255,0.35)");
          });
          res.path.forEach((k) => {
            const [x, y] = k.split(",").map(Number);
            cell(x, y, "var(--teal)");
          });
        }
        cell(S[0], S[1], "var(--amber)");
        cell(T[0], T[1], "var(--rose)");
        if (res) {
          qs("#ex", card).textContent = res.expanded.length;
          qs("#co", card).textContent = res.cost ?? "unreachable";
        }
      }
      qs("#a", card).onclick = () => draw(search(true));
      qs("#d", card).onclick = () => draw(search(false));
      draw(null);
      root.appendChild(
        predict({
          id: "a2-ast-1",
          q: "On an open grid (no walls), heuristic weight 1 (Manhattan) vs weight 0 (Dijkstra): which expands fewer cells?",
          opts: [
            "Weight 0, since Dijkstra has no bias to lead it astray",
            "Weight 1: the heuristic steers toward the goal",
            "Identical counts, since both are guaranteed optimal on a grid",
          ],
          a: 1,
          why: "An admissible heuristic prunes the directions that lead away. Dijkstra expands a disk; A* expands a cone toward the goal.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<code>f = g + h</code>: real cost so far + estimate to goal.",
            "<b>h = 0 → Dijkstra.</b> The heuristic is pure added direction.",
            "Admissible (never overestimates) → optimal. Inflated → faster, possibly wrong.",
          ],
          "A* is Dijkstra with a compass — keep the compass honest and the answer stays optimal.",
        ),
      );
    },
  });
})();
