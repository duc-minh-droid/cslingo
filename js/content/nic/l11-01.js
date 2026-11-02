/* l11-01: Lecture 11 (swarm intelligence II: flocking): the boids kernel and sandbox widget (shared as NIC.shared.nicL11), 11.1 flocking. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const sh = (NIC.shared.nicL11 = NIC.shared.nicL11 || {});

  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  /** Quick check and predict builders. Spec: "question | right answer | wrong | wrong | why" (the engine shuffles the order). */
  const parts = (spec) => {
    const x = spec.split(" | ");
    return { q: x[0], opts: x.slice(1, -1), why: x[x.length - 1] };
  };
  const C = (spec, hint) => {
    const { q, opts, why } = parts(spec);
    return { q, o: opts, a: 0, why, ...(hint ? { hint } : {}) };
  };
  const pr = (id, spec) => predict((({ q, opts, why }) => ({ id, q, opts, a: 0, why }))(parts(spec)));
  const tint = (c, p = 18) => `color-mix(in srgb, var(--${c}) ${p}%, var(--panel))`;
  const svgBox = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-height:260px" role="img" aria-label="${label}">${inner}</svg>`;
  const btn = (t, f, cls = "") => {
    const b = el(`<button class="btn small ${cls}">${t}</button>`);
    b.onclick = f;
    return b;
  };

  /* ================= the boids kernel (Reynolds 1987, in 2D on a wrap-around world) ================= */
  const W = 600,
    H = 360,
    SPEED = 2.4,
    SEP_R = 20,
    LINK = 40,
    TOUCH = 8,
    FEAR_R = 150;
  const wrap = (d, len) => (d > len / 2 ? d - len : d < -len / 2 ? d + len : d);
  /** n boids at constant speed. start: "scatter" (anywhere), "together" (one tight clump), "apart" (two clumps far away), "meet" (two flocks heading for each other). */
  function make(n, start, seed) {
    const r = mulberry(seed),
      b = [];
    for (let i = 0; i < n; i++) {
      let x = r() * W,
        y = r() * H;
      if (start === "together") [x, y] = [W / 2 + (r() - 0.5) * 36, H / 2 + (r() - 0.5) * 36];
      if (start === "apart") [x, y] = [(i % 2 ? 450 : 150) + (r() - 0.5) * 70, (i % 2 ? 270 : 90) + (r() - 0.5) * 70];
      let a = r() * Math.PI * 2;
      if (start === "meet")
        [x, y, a] = [
          (i % 2 ? 420 : 180) + (r() - 0.5) * 60,
          180 + (r() - 0.5) * 60,
          (i % 2 ? Math.PI : 0) + (r() - 0.5) * 0.35,
        ];
      b.push({ x, y, vx: Math.cos(a) * SPEED, vy: Math.sin(a) * SPEED });
    }
    return b;
  }
  /** What boid i senses (every boid within R, all directions) and the three weighted steering pushes it feels. */
  function sense(b, i, P) {
    const p = b[i],
      nb = [];
    let sx = 0,
      sy = 0,
      ax = 0,
      ay = 0,
      cx = 0,
      cy = 0;
    b.forEach((q, j) => {
      const dx = wrap(q.x - p.x, W),
        dy = wrap(q.y - p.y, H),
        d = Math.hypot(dx, dy);
      if (j === i || d >= P.R || d === 0) return;
      nb.push({ j, dx, dy, d });
      ax += q.vx;
      ay += q.vy;
      cx += dx;
      cy += dy;
      if (d < SEP_R) {
        sx -= (dx * (SEP_R - d)) / SEP_R / d;
        sy -= (dy * (SEP_R - d)) / SEP_R / d;
      }
    });
    const k = nb.length;
    return {
      nb,
      sep: [P.ws * 0.9 * sx, P.ws * 0.9 * sy],
      ali: k ? [P.wa * 0.08 * (ax / k - p.vx), P.wa * 0.08 * (ay / k - p.vy)] : [0, 0],
      coh: k ? [P.wc * 0.004 * (cx / k), P.wc * 0.004 * (cy / k)] : [0, 0],
    };
  }
  /** One tick for every boid at once. S.fear = {x, y, t}: a predator strike that pushes boids near it away. */
  function step(S) {
    const { b, P, fear } = S;
    const next = b.map((p, i) => {
      const s = sense(b, i, P);
      let vx = p.vx + s.sep[0] + s.ali[0] + s.coh[0],
        vy = p.vy + s.sep[1] + s.ali[1] + s.coh[1];
      if (fear && fear.t > 0) {
        const dx = wrap(p.x - fear.x, W),
          dy = wrap(p.y - fear.y, H),
          d = Math.hypot(dx, dy) || 1;
        if (d < FEAR_R) [vx, vy] = [vx + (dx / d) * 3.2 * (1 - d / FEAR_R), vy + (dy / d) * 3.2 * (1 - d / FEAR_R)];
      }
      const m = Math.hypot(vx, vy) || 1;
      vx = (vx / m) * SPEED;
      vy = (vy / m) * SPEED;
      return { x: (p.x + vx + W) % W, y: (p.y + vy + H) % H, vx, vy };
    });
    next.forEach((p, i) => (b[i] = p));
    if (fear && fear.t > 0) fear.t--;
    S.t++;
  }
  const dist = (p, q) => Math.hypot(wrap(p.x - q.x, W), wrap(p.y - q.y, H));
  /** Polarisation: how far the boids head the same way (0 = random, 1 = all together). */
  const polar = (b) =>
    Math.hypot(
      b.reduce((s, p) => s + p.vx, 0),
      b.reduce((s, p) => s + p.vy, 0),
    ) /
    (b.length * SPEED);
  /** Number of groups when boids closer than LINK count as joined. */
  function groups(b) {
    const par = b.map((_, i) => i),
      f = (i) => (par[i] === i ? i : (par[i] = f(par[i])));
    b.forEach((p, i) => b.forEach((q, j) => j > i && dist(p, q) < LINK && (par[f(i)] = f(j))));
    return new Set(b.map((_, i) => f(i))).size;
  }
  /** Average heading in degrees, clockwise from north. */
  const heading = (b) =>
    ((Math.atan2(
      b.reduce((s, p) => s + p.vx, 0),
      -b.reduce((s, p) => s + p.vy, 0),
    ) *
      180) /
      Math.PI +
      360) %
    360;
  const tooClose = (b) => b.reduce((s, p, i) => s + b.filter((q, j) => j > i && dist(p, q) < TOUCH).length, 0);
  /** Root-mean-square distance from the flock's centre (a circular mean, so it works across the wrap-around edge). */
  function spread(b) {
    const mid = (key, len) => {
      const a = (v) => (v / len) * Math.PI * 2;
      const m = Math.atan2(
        b.reduce((s, p) => s + Math.sin(a(p[key])), 0),
        b.reduce((s, p) => s + Math.cos(a(p[key])), 0),
      );
      return ((m / (Math.PI * 2)) * len + len) % len;
    };
    const mx = mid("x", W),
      my = mid("y", H);
    return Math.sqrt(b.reduce((s, p) => s + wrap(p.x - mx, W) ** 2 + wrap(p.y - my, H) ** 2, 0) / b.length);
  }
  Object.assign(sh, { mulberry, C, pr, parts, tint, svgBox, btn, make, sense, step, polar, groups, tooClose, spread });
  Object.assign(sh, { W, H, SPEED, SEP_R, TOUCH });

  /* ================= the sandbox widget ================= */
  const SL = {
    ws: ["Separation", 0, 3, 0.5, "ws"],
    wa: ["Alignment", 0, 3, 0.5, "wa"],
    wc: ["Cohesion", 0, 3, 0.5, "wc"],
    R: ["Perception radius", 20, 140, 10, "R", (v) => v],
  };
  const STAT = {
    polar: ["Polarisation", (S) => polar(S.b).toFixed(2), (S) => (polar(S.b) >= 0.9 ? "teal" : "")],
    groups: ["Groups", (S) => groups(S.b), () => "blue"],
    close: ["Pairs too close", (S) => tooClose(S.b), (S) => (tooClose(S.b) ? "rose" : "")],
    spread: ["Spread", (S) => Math.round(spread(S.b)), () => "amber"],
    heading: ["Flock heading", (S) => Math.round(heading(S.b)) + "°", () => "blue"],
    n: ["Boids", (S) => S.b.length, () => ""],
  };
  /** Mounts a boids sandbox into box. o: {n, seed, start, ws, wa, wc, R, sliders[], buttons[], stats[], arrows, percept, trace, bare, onTick(ctl)}.
   *  Buttons: reset together apart pause fast scare more less. Returns ctl (also at root.__flock); ctl.step(k) runs k ticks at once. */
  function flock(box, life, o = {}) {
    const col = N.colors;
    const S = { b: [], P: { R: o.R ?? 70, ws: o.ws ?? 1, wa: o.wa ?? 1, wc: o.wc ?? 1 }, t: 0, fear: null, hist: [] };
    let seed = o.seed ?? 7,
      sel = 0,
      paused = !!o.paused,
      fast = 1,
      turn = 0;
    const root = el(
      `<div class="nw11-flock${o.bare ? "" : " fig-wrap"}"><div class="controls" data-sl></div><canvas class="viz nw11-cv" role="img" aria-label="Boids flying on a wrap-around field: each little arrow is one boid"></canvas><div class="wk-stats nw11-stats" data-st></div><div class="controls nw11-btns" data-bt></div><p class="nw11-note" data-note aria-live="polite"></p></div>`,
    );
    box.appendChild(root);
    const cv = qs("canvas", root),
      note = qs("[data-note]", root);
    const reset = (start = "scatter") => {
      S.b = make(o.n ?? 60, start, seed++);
      Object.assign(S, { t: 0, fear: null, hist: [], start, s0: spread(S.b) });
      sel = 0;
      if (o.arrows || o.percept)
        sel = S.b.reduce((m, _, i) => (sense(S.b, i, S.P).nb.length > sense(S.b, m, S.P).nb.length ? i : m), 0);
      draw();
    };
    const BTN = {
      reset: ["Scatter", () => reset("scatter"), "primary"],
      together: ["Start together", () => reset("together")],
      apart: ["Start far apart", () => reset("apart")],
      meet: ["Two flocks meet", () => reset("meet")],
      nudge: ["Turn a third", () => S.b.forEach((p, i) => i % 3 === 0 && ([p.vx, p.vy] = [-p.vy, p.vx]))],
      pause: [
        "Pause",
        function () {
          paused = !paused;
          this.textContent = paused ? "Play" : "Pause";
        },
      ],
      fast: [
        "Speed ×3",
        function () {
          fast = fast === 1 ? 3 : 1;
          this.classList.toggle("on", fast === 3);
        },
      ],
      scare: ["Scare them", () => scare(S.b[sel].x, S.b[sel].y)],
      more: ["Add 10", () => resize(10)],
      less: ["Remove 10", () => resize(-10)],
    };
    function scare(x, y) {
      S.fear = { x, y, t: 20, show: 40 };
      note.textContent = "A predator strikes! Boids near it swerve away.";
    }
    function resize(d) {
      const r = mulberry(seed++);
      if (d > 0) for (let i = 0; i < d; i++) S.b.push(...make(1, "scatter", Math.floor(r() * 1e6)));
      else S.b.splice(0, Math.min(-d, S.b.length - 10));
      sel = Math.min(sel, S.b.length - 1);
    }
    (o.sliders || []).forEach((k) => {
      const [label, lo, hi, st, key, f] = SL[k],
        s = N.slider(label, lo, hi, st, S.P[key], f);
      s.onInput((v) => (S.P[key] = v));
      qs("[data-sl]", root).appendChild(s);
    });
    (o.buttons || []).forEach((k) => qs("[data-bt]", root).appendChild(btn(BTN[k][0], BTN[k][1], BTN[k][2] || "")));
    const paintStats = () => {
      if (o.stats)
        qs("[data-st]", root).innerHTML = o.stats
          .map((k) => N.wk.stat(STAT[k][0], STAT[k][1](S), STAT[k][2](S)))
          .join("");
      if (o.percept) {
        const s = sense(S.b, sel, S.P),
          near = s.nb.reduce((m, q) => (!m || q.d < m.d ? q : m), null),
          p = S.b[sel],
          ang = Math.atan2(p.vy, p.vx);
        let rel = near ? ((Math.atan2(near.dy, near.dx) - ang) * 180) / Math.PI : 0;
        rel = ((rel + 540) % 360) - 180;
        const side =
          Math.abs(rel) < 45 ? "ahead" : Math.abs(rel) > 135 ? "behind" : rel > 0 ? "on its right" : "on its left";
        note.innerHTML = `<b>Percept</b> (boid in purple): ${s.nb.length} neighbour${s.nb.length === 1 ? "" : "s"} within ${S.P.R}${near ? `, nearest ${Math.round(near.d)} away ${side}` : ""}. <b>Action</b>: ${Math.abs(turn) < 0.05 ? "keep straight on" : `turn ${turn > 0 ? "right" : "left"} by ${Math.abs(turn).toFixed(1)}° this tick`}.`;
      }
    };
    function after() {
      const m = S.t % 6 === 0;
      if (m) S.hist.push(polar(S.b));
      if (S.hist.length > 120) S.hist.shift();
      if (m) paintStats();
      if (o.onTick) o.onTick(ctl);
    }
    const tick = (k = 1) => {
      for (let i = 0; i < k; i++) {
        const before = o.percept ? Math.atan2(S.b[sel].vy, S.b[sel].vx) : 0;
        step(S);
        if (o.percept) turn = ((((Math.atan2(S.b[sel].vy, S.b[sel].vx) - before) * 180) / Math.PI + 540) % 360) - 180;
        after();
      }
    };
    function draw() {
      const w = cv.clientWidth;
      if (w < 40) return;
      const dpr = window.devicePixelRatio || 1,
        h = Math.round((w * H) / W),
        k = w / W,
        c = col();
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        cv.style.height = h + "px";
      }
      const g = cv.getContext("2d");
      g.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
      g.clearRect(0, 0, W, H);
      const me = S.b[sel],
        info = o.arrows || o.percept ? sense(S.b, sel, S.P) : null,
        near = new Set(info ? info.nb.map((q) => q.j) : []);
      if (info) {
        g.lineWidth = 1.5;
        g.setLineDash([5, 4]);
        [
          [S.P.R, c.amber],
          [SEP_R, c.rose],
        ].forEach(([r, s]) => {
          g.strokeStyle = s;
          g.beginPath();
          g.arc(me.x, me.y, r, 0, 7);
          g.stroke();
        });
        g.setLineDash([]);
      }
      S.b.forEach((p, i) => {
        g.save();
        g.translate(p.x, p.y);
        g.rotate(Math.atan2(p.vy, p.vx));
        const z = Math.max(1, 0.9 / k) * (i === sel && info ? 1.6 : 1);
        g.scale(z, z);
        g.fillStyle = i === sel && info ? c.violet : near.has(i) ? c.teal : c.blue;
        g.beginPath();
        g.moveTo(8, 0);
        g.lineTo(-5, 4.5);
        g.lineTo(-3, 0);
        g.lineTo(-5, -4.5);
        g.fill();
        if (i === sel && info) {
          g.strokeStyle = c.panel;
          g.lineWidth = 1.5;
          g.stroke();
        }
        g.restore();
      });
      if (o.arrows && info) {
        [
          [info.sep, c.rose],
          [info.ali, c.blue],
          [info.coh, c.teal],
        ].forEach(([v, s]) => {
          const m = Math.hypot(v[0], v[1]);
          if (m < 0.01) return;
          const len = Math.min(52, m * 70),
            ux = (v[0] / m) * len,
            uy = (v[1] / m) * len,
            a = Math.atan2(uy, ux);
          g.strokeStyle = g.fillStyle = s;
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(me.x, me.y);
          g.lineTo(me.x + ux, me.y + uy);
          g.stroke();
          g.beginPath();
          g.moveTo(me.x + ux, me.y + uy);
          g.lineTo(me.x + ux - 8 * Math.cos(a - 0.5), me.y + uy - 8 * Math.sin(a - 0.5));
          g.lineTo(me.x + ux - 8 * Math.cos(a + 0.5), me.y + uy - 8 * Math.sin(a + 0.5));
          g.fill();
        });
      }
      if (S.fear && S.fear.show > 0) {
        g.strokeStyle = c.rose;
        g.lineWidth = 3;
        g.beginPath();
        g.arc(S.fear.x, S.fear.y, 14 + (40 - S.fear.show) * 2.5, 0, 7);
        g.stroke();
        S.fear.show--;
      }
      if (o.trace && S.hist.length > 1) {
        g.fillStyle = c.panel;
        g.globalAlpha = 0.85;
        g.fillRect(W - 164, 8, 156, 56);
        g.globalAlpha = 1;
        g.strokeStyle = c.teal;
        g.lineWidth = 2;
        g.beginPath();
        S.hist.forEach((v, i) => g[i ? "lineTo" : "moveTo"](W - 160 + (i / 119) * 148, 58 - v * 36));
        g.stroke();
        g.fillStyle = c.text_dim;
        g.font = "700 11px sans-serif";
        g.fillText("polarisation", W - 160, 20);
      }
    }
    cv.addEventListener("pointerdown", (e) => {
      const r = cv.getBoundingClientRect(),
        x = ((e.clientX - r.left) / r.width) * W,
        y = ((e.clientY - r.top) / r.height) * H;
      const i = S.b.reduce((m, p, j) => (dist(p, { x, y }) < dist(S.b[m], { x, y }) ? j : m), 0);
      if (o.arrows || o.percept) sel = i;
      else if (o.buttons && o.buttons.includes("scare")) scare(x, y);
      draw();
      paintStats();
    });
    const loop = () => {
      if (!paused && cv.clientWidth > 40) tick(fast);
      draw();
      life.frame(loop);
    };
    const ctl = {
      S,
      root,
      step: (k) => {
        tick(k);
        draw();
      },
      reset,
      scare,
      resize,
      look: () => ({ sel, turn }),
    };
    root.__flock = ctl;
    reset(o.start || "scatter");
    paintStats();
    life.frame(loop);
    return ctl;
  }
  sh.flock = flock;

  /* ============ 11.1 Flocking ============ */
  N.register({
    id: "l11-flock",
    lecture: 11,
    order: 1,
    num: "11.1",
    title: "Collective movement and flocking",
    blurb:
      "From slime mould to starlings: what flocks do, how they hold together and why it pays. Poke a flock and watch.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A <b>flock</b> moves as one with <b>no leader</b>. Each of these arrows is a bird (a boid) following three simple rules, which you meet in the next lesson. Here is a ready-made flock to poke: it can be <b>scared</b>, shrunk and grown.",
        ),
      );
      const card = el(
        `<div class="card"><div class="card-head"><h2>A flock to poke</h2></div><div data-box></div></div>`,
      );
      root.appendChild(card);
      sh.flock(qs("[data-box]", card), life, {
        bare: true,
        buttons: ["scare", "more", "less", "reset"],
        stats: ["polar", "groups", "n"],
        trace: true,
        seed: 3,
      });
      root.appendChild(
        pr(
          "l11-flock-1",
          "In the demo, press <b>Scare them</b> a few seconds after the flock has settled. What happens? | Boids near the strike swerve away, then the flock regroups | Nothing, because the three rules ignore predators | The whole flock freezes until the strike is over | Near the strike the boids are pushed outwards, so the flock splits for a moment. Cohesion and alignment then draw it back together.",
        ),
      );
      root.appendChild(
        pr(
          "l11-flock-2",
          "Press <b>Remove 10</b> four times, so 60 boids become 20. What happens to the polarisation? | It stays high: the rest still head the same way | It drops to near zero, as the leader has gone | It doubles, as fewer boids have to agree | No boid was the leader, so removing members hardly matters. The flock keeps moving as one, and may split into smaller flocks.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>flock</b> shows rapid directed movement, reacts to predators and obstacles, joins and splits, and has <b>no dedicated leader</b>.",
            "It balances <b>attraction</b> (stay together) against <b>repulsion</b> (do not collide), and may follow an environmental cue too.",
            "Flocking pays: longer range, less turbulence and safety from predators.",
          ],
          "Many simple followers, no boss, one moving whole.",
        ),
      );
    },
  });
})();
