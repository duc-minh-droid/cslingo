(function () {
  const partScope = (NIC.shared.algoP5 = NIC.shared.algoP5 || {});
  const { PTS, cross, svg, turn } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  // the stack R, S, T (solid chain) and the next point U arriving (dashed): the learner taps the point that gets popped
  const popPick = () => {
    const at = { R: [40, 190], S: [220, 190], T: [265, 100], U: [355, 55] };
    const seg = (a, b, dash) =>
      `<line x1="${at[a][0]}" y1="${at[a][1]}" x2="${at[b][0]}" y2="${at[b][1]}" stroke="var(--line-2)" stroke-width="3" ${dash ? 'stroke-dasharray="7 6"' : ""}/>`;
    const dots = Object.entries(at).map(
      ([k, [x, y]]) =>
        `<g data-pick="${k}" aria-label="Point ${k}"><circle cx="${x}" cy="${y}" r="22" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${x}" y="${y + 6}" text-anchor="middle" style="font:900 17px var(--sans);fill:var(--ink)">${k}</text></g>`,
    );
    return `<svg viewBox="0 0 400 230" role="group" aria-label="Four points. R at the bottom left, S at the bottom, T up and to the right of S, and U further up and right. R, S and T are joined by a solid line, and a dashed line leads from T to U">${seg("R", "S")}${seg("S", "T")}${seg("T", "U", true)}${dots.join("")}</svg>`;
  };

  /* ============ 5.3 Graham scan ============ */
  /** Step-through Graham scan on a draggable copy of PTS: pivot, angle sort, then push/pop with the turn test. */
  function grahamRun(box, life) {
    const P = Object.fromEntries(Object.entries(PTS).map(([k, v]) => [k, v.slice()]));
    const names = Object.keys(P);
    const lt = (o, a, b) => -cross(P[o], P[a], P[b]); // > 0 = left turn (maths orientation, y up)
    const sgn = (v) => (v > 0 ? "+" + v : v < 0 ? "−" + -v : "0");
    function* frames() {
      const pivot = names.reduce((m, n) => (P[n][1] > P[m][1] || (P[n][1] === P[m][1] && P[n][0] < P[m][0]) ? n : m));
      const ang = (n) => Math.atan2(-(P[n][1] - P[pivot][1]), P[n][0] - P[pivot][0]);
      const d2 = (n) => (P[n][0] - P[pivot][0]) ** 2 + (P[n][1] - P[pivot][1]) ** 2;
      const order = names.filter((n) => n !== pivot).sort((a, b) => ang(a) - ang(b) || d2(a) - d2(b));
      const stack = [],
        popped = [];
      const snap = (x) => ({ pivot, order, sorted: true, stack: stack.slice(), popped: popped.slice(), ...x });
      yield snap({
        sorted: false,
        cap: `Start at the <b>lowest</b> point, <b>${pivot}</b>. Nothing is lower, so it must be on the hull. It's the pivot.`,
        line: 0,
      });
      yield snap({
        cap: `Sort the rest by angle around ${pivot}, sweeping anticlockwise: <b>${order.join(" → ")}</b>.`,
        line: 1,
      });
      stack.push(pivot, order[0]);
      yield snap({ cap: `Push the pivot and the first point: stack = <b>${stack.join(" ")}</b>.`, line: 2 });
      let asks = 0,
        results = 0;
      for (let k = 1; k < order.length; k++) {
        const p = order[k];
        for (;;) {
          const a = stack[stack.length - 2],
            t = stack[stack.length - 1],
            v = Math.round(lt(a, t, p));
          yield snap({
            cand: p,
            test: [a, t, p],
            cap: `Next point: <b>${p}</b>. Test the turn ${a} → ${t} → ${p}. Keep ${t}, or pop it?`,
            line: 3,
          });
          const pop = v <= 0;
          results++;
          const ask =
            asks < 2 && results >= 2 && (asks === 0 ? pop : !pop)
              ? {
                  q: `Walking ${a} → ${t} → ${p}: <b>keep</b> ${t} on the stack, or <b>pop</b> it? Tap a button.`,
                  pick: ".rn-hull-btn",
                  a: pop ? "pop" : "keep",
                  why: `The cross product is <b>${sgn(v)}</b>: ${pop ? `${v === 0 ? "a straight line" : "a right turn"}, so ${t} is a dent and gets popped.` : `a left turn, so ${t} stays and ${p} is pushed.`}`,
                }
              : null;
          if (ask) asks++;
          if (pop) {
            stack.pop();
            popped.push(t);
            yield snap({
              cand: p,
              gone: t,
              res: "pop",
              ask,
              mood: "surprised",
              cap: `${a} → ${t} → ${p}: cross = <b>${sgn(v)}</b>, ${v === 0 ? "straight on" : "a <b>right</b> turn"}. ${t} dents the hull: <b>pop ${t}</b>.`,
              line: 4,
            });
            if (stack.length < 2) break;
          } else {
            stack.push(p);
            yield snap({
              cand: p,
              res: "keep",
              ask,
              cap: `${a} → ${t} → ${p}: cross = <b>${sgn(v)}</b>, a <b>left</b> turn. Keep ${t} and <b>push ${p}</b>: stack = ${stack.join(" ")}.`,
              line: 5,
            });
            break;
          }
        }
        if (stack[stack.length - 1] !== p) stack.push(p);
      }
      yield snap({
        closed: true,
        mood: "love",
        cap: `All points done. Close back to ${pivot}. The stack is the hull: <b>${stack.join(" ")}</b> (${popped.length} popped).`,
        line: 6,
      });
    }
    F.run(box, life, {
      code: [
        "p0 = lowest point (the pivot)",
        "sort the rest by angle around p0",
        "push p0 and the first point",
        "for each next point p: test top two + p",
        "  not a left turn: pop the top, test again",
        "  left turn: push p",
        "close the hull back to p0",
      ],
      build(stage, api) {
        const NS = "http://www.w3.org/2000/svg";
        const svgEl = document.createElementNS(NS, "svg");
        svgEl.setAttribute("viewBox", "0 0 470 290");
        svgEl.setAttribute("class", "fig rn-svg rn-hull");
        svgEl.style.maxHeight = "290px";
        svgEl.innerHTML = `<g class="rn-hull-rays">${names.map((n) => `<line data-r="${n}"/>`).join("")}</g>
          <polyline class="rn-hull-chain" points=""/><line class="rn-hull-try" style="opacity:0"/>
          <g class="rn-hull-pts">${names.map((n) => `<g class="rn-hull-pt" data-k="${n}"><g class="rn-hull-body"><circle class="rn-halo" r="22"/><circle class="rn-hull-c" r="16"/><text class="rn-hull-l" y="5">${n}</text></g><g class="rn-hull-ord" transform="translate(15 -15)"><circle r="9"/><text y="4"></text></g></g>`).join("")}</g>
          <g class="rn-hull-btns">${[
            ["keep", "Keep", 340],
            ["pop", "Pop", 408],
          ]
            .map(
              ([k, t, x]) =>
                `<g class="rn-hull-btn" data-k="${k}" transform="translate(${x} 22)"><rect x="-30" y="-14" width="60" height="28" rx="10"/><text y="5">${t}</text></g>`,
            )
            .join("")}</g>`;
        stage.appendChild(svgEl);
        const stk = document.createElement("div");
        stk.className = "rn-hull-stack";
        stage.appendChild(stk);
        const q = (s) => svgEl.querySelector(s);
        const scene = { svgEl, stk, q, last: null, pt: (n) => q(`.rn-hull-pt[data-k="${n}"]`) };
        names.forEach((n) =>
          api.drag(scene.pt(n), {
            move(x, y) {
              P[n] = [Math.round(x), Math.round(y)];
              if (scene.last) draw(scene, scene.last, { instant: true, prev: null, i: 0 });
            },
            end() {
              api.recompute("Points moved. Rescanning from the start.");
            },
          }),
        );
        return scene;
      },
      draw,
      frames,
    });
    function draw(s, f, c) {
      s.last = f;
      const at = (n) => P[n];
      names.forEach((n) => {
        const g = s.pt(n),
          [x, y] = at(n),
          k = f.order.indexOf(n);
        g.setAttribute("transform", `translate(${x} ${y})`);
        g.classList.toggle("rn-hull-pivot", n === f.pivot);
        g.classList.toggle("rn-hull-on", f.stack.includes(n) && n !== f.pivot);
        g.classList.toggle("rn-hull-cand", n === f.cand);
        g.classList.toggle("rn-hull-top", !!f.test && n === f.test[1]);
        g.classList.toggle("rn-hull-out", f.popped.includes(n));
        const ord = g.querySelector(".rn-hull-ord");
        ord.querySelector("text").textContent = k >= 0 ? k + 1 : "";
        F.rn.to(c, ord, { opacity: f.sorted && k >= 0 ? 1 : 0 }, 0, 0.3);
        const ray = s.q(`[data-r="${n}"]`),
          [px, py] = at(f.pivot);
        ["x1", "y1", "x2", "y2"].forEach((a, j) => ray.setAttribute(a, [px, py, x, y][j]));
        F.rn.to(c, ray, { opacity: f.sorted && n !== f.pivot ? 1 : 0 }, 0, 0.3);
        if (n === f.cand && c.prev && c.prev.cand !== n) F.rn.pulse(c, g.querySelector(".rn-hull-body"));
      });
      const chain = f.stack.concat(f.closed ? [f.pivot] : []);
      s.q(".rn-hull-chain").setAttribute("points", chain.map((n) => at(n).join(",")).join(" "));
      s.q(".rn-hull-chain").classList.toggle("rn-hull-closed", !!f.closed);
      const tr = s.q(".rn-hull-try");
      if (f.test) {
        const [a, b] = [at(f.test[1]), at(f.test[2])];
        tr.setAttribute("x1", a[0]);
        tr.setAttribute("y1", a[1]);
        tr.setAttribute("x2", b[0]);
        tr.setAttribute("y2", b[1]);
      }
      F.rn.to(c, tr, { opacity: f.test ? 1 : 0 }, 0, 0.25);
      const live = !!f.test || !!f.res;
      s.q(".rn-hull-btns").classList.toggle("rn-hull-idle", !live);
      s.q('.rn-hull-btn[data-k="keep"]').classList.toggle("rn-hull-yes", f.res === "keep");
      s.q('.rn-hull-btn[data-k="pop"]').classList.toggle("rn-hull-no", f.res === "pop");
      if (f.res && c.prev && !c.prev.res) F.rn.pulse(c, s.q(`.rn-hull-btn[data-k="${f.res}"]`));
      s.stk.innerHTML = `<small>stack</small>${f.stack.map((n, j) => `<span class="rn-hull-cell ${j === f.stack.length - 1 ? "top" : ""}">${n}</span>`).join("")}${f.gone ? `<span class="rn-hull-cell gone">${f.gone}</span>` : ""}`;
    }
  }

  L["a5-graham"] = {
    sum: "Graham scan sorts the points by angle around the lowest point, then walks them in order with a <b>stack</b>. Any point that makes a right turn gets popped. Sort once, scan once: <b>O(n log n)</b>.",
    steps: [
      {
        t: "Sort by angle",
        b: `<p>The lowest point is on the hull, so use it as the <b>anchor</b>. Sort the rest by the angle they make with the anchor, sweeping counter-clockwise. Hull corners will now come up in boundary order.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 200" role="img" aria-label="The lowest point is the anchor. The other points are numbered 1 to 6 in order of their angle round it, counter-clockwise." style="max-height:190px"><circle cx="150" cy="180" r="8" fill="var(--amber)"/><text x="150" y="198" class="fig-sub">anchor</text>${[
          [380, 150, 1],
          [360, 90, 2],
          [250, 110, 3],
          [230, 20, 4],
          [120, 90, 5],
          [20, 160, 6],
        ]
          .map(
            ([x, y, k]) =>
              `<line x1="150" y1="180" x2="${x}" y2="${y}" stroke="var(--line-2)" stroke-dasharray="3 4" class="fi"/><circle cx="${x}" cy="${y}" r="6" fill="var(--violet)" class="fi"/><text x="${x + 10}" y="${y - 8}" class="fig-sub" style="fill:var(--violet)">${k}</text>`,
          )
          .join("")}</svg>`,
      },
      {
        t: "The stack pops dents",
        b: `<p>Push points one by one. Before each push, look at the top two points plus the new one. If they make a <b>right turn (or go straight)</b>, the middle point is a dent, so pop it and check again.</p>`,
        v: F.frames([
          {
            t: "Stack C, D, E, then F arrives",
            v: F.cells([{ v: "C" }, { v: "D" }, { v: "E" }, "←", { v: "F", c: "violet" }]),
          },
          {
            t: "E → F → G turns right, so pop F",
            v: F.cells([{ v: "C" }, { v: "D" }, { v: "E" }, { v: "F", c: "rose", sub: "pop" }]),
          },
          {
            t: "E → G is a left turn: push G",
            v: F.cells([{ v: "C" }, { v: "D" }, { v: "E" }, { v: "G", c: "teal" }]),
          },
        ]),
        c: {
          type: "pick",
          q: "A Graham scan has points R, S and T on its stack (T on top) as it walks counter-clockwise, and U arrives next. Tap the point that gets <b>popped</b>.",
          fig: popPick(),
          a: "T",
          hint: "Look at the turn S → T → U. Does the walk turn left or right at T?",
          why: "S → T → U turns right, so T is a dent: it sits inside the edge S–U that skips it, and gets popped. R → S → T turns left, so S stays.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>Here is the whole scan on seven points. Press <b>play</b> or step with the arrows. The small numbers show the sorted order, and the green chain is the stack.</p><p>It will pause and ask you to keep or pop. Drag any point and the scan reruns.</p>`,
        v: (box, life) => grahamRun(box, life),
      },
      {
        t: "Where the time goes",
        b: `<p>Every point is pushed once and popped at most once, so the scan is O(n). The <b>sort</b> costs O(n log n), and that dominates.</p><p>Compared with gift wrapping at O(n·h): Graham wins when the hull is big, and wrapping wins when it's tiny.</p>`,
      },
    ],
    guide: [
      "Press <b>Scan ▸</b> and watch the stack on the right.",
      "Before each step, predict: will the next point push, or pop something first?",
      "At the end the stack holds exactly the hull: C D E G A.",
    ],
  };

  N.register({
    id: "a5-graham",
    subject: "algo",
    lecture: 5,
    order: 3,
    num: "5.3",
    title: "Graham scan stack",
    blurb: "Sort by angle, then let the stack pop every point that dents the hull inward.",
    render(root) {
      root.appendChild(header(this, ""));
      const names = Object.keys(PTS);
      const anchor = names.reduce((m, n) =>
        PTS[n][1] > PTS[m][1] || (PTS[n][1] === PTS[m][1] && PTS[n][0] < PTS[m][0]) ? n : m,
      );
      const rest = names
        .filter((n) => n !== anchor)
        .sort((a, b) => {
          const aa = Math.atan2(-(PTS[a][1] - PTS[anchor][1]), PTS[a][0] - PTS[anchor][0]);
          const bb = Math.atan2(-(PTS[b][1] - PTS[anchor][1]), PTS[b][0] - PTS[anchor][0]);
          return aa - bb; // counter-clockwise sweep from the anchor's right
        });
      // build stack trace
      const stack = [anchor, rest[0]],
        events = [`push ${rest[0]}`];
      const trace = [[anchor, rest[0]]];
      for (let i = 1; i < rest.length; i++) {
        const p = rest[i];
        while (stack.length >= 2 && turn(stack[stack.length - 2], stack[stack.length - 1], p) <= 0) {
          events.push(`pop ${stack[stack.length - 1]} (right/straight turn)`);
          stack.pop();
          trace.push(stack.slice());
        }
        stack.push(p);
        events.push(`push ${p}`);
        trace.push(stack.slice());
      }
      let i = 0;
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="st">Scan ▸</button><button class="btn ghost" id="rs">Reset</button><span class="faint">anchor: ${anchor} (lowest)</span></div>
        <div class="grid two"><div id="svg"></div><div><h3>Stack</h3><div class="mono" id="stk"></div><div class="faint" id="ev" style="margin-top:10px"></div></div></div></div>`);
      root.appendChild(card);
      function draw() {
        const cur = trace[Math.min(i, trace.length - 1)];
        const edges = [];
        for (let k = 0; k < cur.length - 1; k++) edges.push([cur[k], cur[k + 1]]);
        qs("#svg", card).innerHTML = svg(cur, edges);
        qs("#stk", card).innerHTML = cur.map((n) => `<span class="pill teal">${n}</span>`).join(" ");
        qs("#ev", card).textContent = `event ${i}: ${events[i]}`;
        qs("#st", card).disabled = i >= events.length - 1;
      }
      qs("#st", card).onclick = () => {
        if (i < events.length - 1) {
          i++;
          draw();
        }
      };
      qs("#rs", card).onclick = () => {
        i = 0;
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a5-gr-1",
          q: "Graham scan runs on a million points. Which part takes most of the time?",
          opts: [
            "The sort by angle, O(n log n)",
            "The stack scan, since it checks every point's turn",
            "The pops, which can cost O(n²) in the worst case",
          ],
          a: 0,
          why: "Every point is pushed once and popped at most once, so the whole stack scan is only O(n), even though points sometimes pop several others. The sort is O(n log n) and dominates: about 20 comparisons per point for a million points, against a few turn tests.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Sort once by polar angle → scan once with a stack → O(n log n).",
            "Pop = reject: a non-left turn means the middle point is interior.",
            "vs gift wrapping O(n·h): Graham wins when the hull is big; wrapping wins when it's tiny.",
          ],
          "Sorted order + a stack = each point handled twice at most.",
        ),
      );
    },
  });
})();
