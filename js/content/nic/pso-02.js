/* pso-02: Lecture 12: 12.2 continuous problems and the basic loop, 12.3 updating velocities (pull figure and the live swarm with pulls). */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL12;
  const { C, pr, mulberry, newSwarm, step, swarmDemo, mapSVG, arrow, px, COL } = sh;

  // ---------- the pull figure: one particle, its velocity, its two pulls, head to tail ----------
  const SC = { x: [2, 2], v: [1.5, 1], p: [3, 6.5], g: [8, 4] };
  const f2 = (v) => (Math.abs(v) < 0.005 ? "0" : v.toFixed(2).replace(/\.?0+$/, ""));
  const lab = (pt, t, col, dx = 10, dy = -10) => {
    const [x, y] = px(pt);
    return `<text x="${x + dx}" y="${y + dy}" class="nw12-lab2" style="fill:${col}">${t}</text>`;
  };
  /** o: {show: ["v","p","g"], live, cloud, c1, c2, z1:[..], z2:[..]}; builds the figure and (live) its sliders into box. */
  function pullFig(box, life, o = {}) {
    const st = { c1: o.c1 ?? 2, c2: o.c2 ?? 2, z1: o.z1 || [0.2, 0.3], z2: o.z2 || [0.2, 0.25] };
    const show = o.show || ["v", "p", "g"],
      r = mulberry(3);
    const hasP = show.includes("p"),
      hasG = show.includes("g");
    box.innerHTML = `<div data-pc class="controls nw12-pc"></div><div data-pf></div><div data-pt class="nw12-tbl"></div>`;
    const draw = () => {
      const { x, v, p, g } = SC;
      const cog = [0, 1].map((j) => (hasP ? st.c1 * st.z1[j] * (p[j] - x[j]) : 0));
      const soc = [0, 1].map((j) => (hasG ? st.c2 * st.z2[j] * (g[j] - x[j]) : 0));
      const nv = [0, 1].map((j) => v[j] + cog[j] + soc[j]),
        nx = [0, 1].map((j) => x[j] + nv[j]);
      const a = [x[0] + v[0], x[1] + v[1]],
        b = [a[0] + cog[0], a[1] + cog[1]];
      let s = "";
      for (let i = 0; i <= 10; i += 2)
        s += `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="400" stroke="var(--line)"/><line x1="0" y1="${i * 40}" x2="400" y2="${i * 40}" stroke="var(--line)"/>`;
      if (o.cloud)
        for (let i = 0; i < 40; i++) {
          const w = [0, 1].map((j) => x[j] + v[j] + st.c1 * r() * (p[j] - x[j]) + st.c2 * r() * (g[j] - x[j]));
          s += `<circle cx="${px(w)[0].toFixed(1)}" cy="${px(w)[1].toFixed(1)}" r="4" fill="var(--teal)" fill-opacity=".45"/>`;
        }
      s += arrow(x, a, COL.v) + (hasP ? arrow(a, b, COL.cog) : "") + (hasG ? arrow(b, nx, COL.soc) : "");
      s += arrow(x, nx, "var(--teal)", { dash: "2 6", w: 2.5 });
      s += `<circle cx="${px(x)[0]}" cy="${px(x)[1]}" r="7" fill="var(--blue)"/>${lab(x, "x", "var(--blue-ink)", -22, 18)}`;
      if (hasP)
        s += `<circle cx="${px(p)[0]}" cy="${px(p)[1]}" r="8" fill="none" stroke="var(--violet)" stroke-width="3"/>${lab(p, "p (own best)", "var(--violet-ink)", 12, 4)}`;
      if (hasG)
        s += `<text x="${px(g)[0]}" y="${px(g)[1] + 8}" text-anchor="middle" class="nw12-star">★</text>${lab(g, "g (swarm best)", "var(--amber-ink)", 0, -16)}`;
      s += `<circle cx="${px(nx)[0].toFixed(1)}" cy="${px(nx)[1].toFixed(1)}" r="6" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>${lab(nx, "new x", "var(--teal-ink)", 10, -8)}`;
      qs("[data-pf]", box).innerHTML =
        `<svg class="fig nw12-map" viewBox="0 0 400 400" style="width:min(100%,340px);max-height:340px" role="img" aria-label="One particle at x with its current velocity, ${hasP ? "a pull towards its own best p, " : ""}${hasG ? "a pull towards the swarm best g, " : ""}added head to tail to reach the new position.">${s}</svg>`;
      const row = (n, vals, c) =>
        `<tr><td><b style="color:var(--${c || "text"})">${n}</b></td>${vals.map((t) => `<td>${f2(t)}</td>`).join("")}</tr>`;
      qs("[data-pt]", box).innerHTML =
        `<table class="t"><tr><th></th><th>dimension 1</th><th>dimension 2</th></tr>${row("current velocity v", v)}${hasP ? row(`c₁ z₁ (p − x), z₁ = ${st.z1.map(f2).join(", ")}`, cog, "blue-ink") : ""}${hasG ? row(`c₂ z₂ (g − x), z₂ = ${st.z2.map(f2).join(", ")}`, soc, "amber-ink") : ""}${row("new velocity", nv)}${row("new position x + v", nx, "teal-ink")}</table>`;
    };
    if (o.live) {
      const ctl = qs("[data-pc]", box);
      if (hasP) {
        const s = N.slider("c₁", 0, 4, 0.5, st.c1);
        s.onInput((v) => ((st.c1 = v), draw()));
        ctl.append(s);
      }
      if (hasG) {
        const s = N.slider("c₂", 0, 4, 0.5, st.c2);
        s.onInput((v) => ((st.c2 = v), draw()));
        ctl.append(s);
      }
      const b = el(`<button class="btn primary">Roll z₁ and z₂</button>`);
      b.onclick = () => {
        st.z1 = [r(), r()].map((t) => +t.toFixed(2));
        st.z2 = [r(), r()].map((t) => +t.toFixed(2));
        draw();
      };
      ctl.append(b);
    }
    draw();
  }
  const live = (o) => (box, life) => pullFig(box, life, o);

  /** The 1-D worked example: x = 4, v = 1, p = 7, g = 2, c1 = c2 = 2, z1 = z2 = 0.5. */
  function numLine() {
    const X = (v) => 30 + v * 34;
    const ar = (x1, x2, y, col, t) =>
      `<line x1="${X(x1)}" y1="${y}" x2="${X(x2)}" y2="${y}" stroke="${col}" stroke-width="4" stroke-linecap="round"/><polygon points="${X(x2)},${y} ${X(x2) + (x2 > x1 ? -9 : 9)},${y - 6} ${X(x2) + (x2 > x1 ? -9 : 9)},${y + 6}" fill="${col}"/><text x="${(X(x1) + X(x2)) / 2}" y="${y - 9}" text-anchor="middle" class="nw12-lab2" style="fill:${col}">${t}</text>`;
    const ticks = Array.from(
      { length: 11 },
      (_, i) =>
        `<line x1="${X(i)}" y1="150" x2="${X(i)}" y2="156" stroke="var(--line-2)"/><text x="${X(i)}" y="172" text-anchor="middle" class="fig-sub">${i}</text>`,
    ).join("");
    const drop = (v, y1, y2) =>
      `<line x1="${X(v)}" y1="${y1}" x2="${X(v)}" y2="${y2}" stroke="var(--line-2)" stroke-dasharray="3 4"/>`;
    return `<svg class="fig" viewBox="0 0 400 190" style="max-height:200px" role="img" aria-label="Number line from 0 to 10. A particle at 4 moves by its velocity plus 1, plus 3 towards its own best at 7, minus 2 towards the swarm best at 2, and lands on 6."><line x1="${X(0)}" y1="150" x2="${X(10)}" y2="150" stroke="var(--line-2)" stroke-width="2"/>${ticks}${drop(4, 40, 150)}${drop(5, 80, 110)}${drop(8, 80, 50)}${ar(4, 5, 118, COL.v, "v = 1")}${ar(5, 8, 84, COL.cog, "+3")}${ar(8, 6, 50, COL.soc, "−2")}<circle cx="${X(4)}" cy="150" r="8" fill="var(--blue)"/><circle cx="${X(7)}" cy="150" r="9" fill="none" stroke="var(--violet)" stroke-width="3"/><text x="${X(2)}" y="158" text-anchor="middle" class="nw12-star">★</text><circle cx="${X(6)}" cy="150" r="6" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/><text x="${X(4)}" y="136" text-anchor="middle" class="nw12-lab2" style="fill:var(--blue-ink)">x = 4</text><text x="${X(7)}" y="136" text-anchor="middle" class="nw12-lab2" style="fill:var(--violet-ink)">p = 7</text><text x="${X(2)}" y="136" text-anchor="middle" class="nw12-lab2" style="fill:var(--amber-ink)">g = 2</text><text x="${X(6)}" y="190" text-anchor="middle" class="nw12-lab2" style="fill:var(--teal-ink)">new x = 6</text></svg>`;
  }
  Object.assign(sh, { pullFig, live, numLine });

  // ---------- 12.2 continuous problems and the basic loop ----------
  const drift = () => {
    const S = newSwarm(7, 8, 4),
      out = [];
    for (let i = 0; i <= 5; i++) {
      if ([0, 2, 5].includes(i)) out.push({ t: i ? `After ${i} steps` : "Start", v: mapSVG(S, { cells: 12, h: 190 }) });
      step(S, { c1: 0, c2: 0, w: 1 });
    }
    return out;
  };
  const rows = (...r) => r.join("");

  N.register({
    id: "l12-vectors",
    lecture: 12,
    order: 2,
    num: "12.2",
    title: "Continuous problems and the basic loop",
    blurb: "PSO was built for vectors of real numbers. See why, then watch the position update on its own.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Bit strings and routes are <b>discrete</b>. PSO was built for <b>continuous</b> problems: a position is a list of real numbers, and moving means adding a velocity to it. Here the pulls are switched off (<b>c₁</b> and <b>c₂</b> are 0), so every dot just keeps going.",
        ),
      );
      swarmDemo(root, life, {
        controls: ["c1", "c2"],
        title: "The position update on its own",
        params: { c1: 0, c2: 0, vs: 4, n: 10 },
        seed: 9,
      });
      root.appendChild(
        pr(
          "l12-vectors-1",
          "With <b>c₁</b> and <b>c₂</b> both at 0, press <b>Step</b> several times. How does a dot move? | In a straight line at a steady velocity until the map edge stops it | In a curve that bends towards the star at the centre of the swarm | It jumps to a fresh random spot somewhere on the map each step | With no pulls, the velocity never changes, so each step adds the same velocity to the position. Nothing bends the path.",
        ),
      );
      root.appendChild(
        pr(
          "l12-vectors-2",
          "Now raise <b>c₂</b> to about 2 and keep stepping. What changes? | The dots' velocities change, so their paths bend towards the star | Their positions are no longer updated by adding the velocity at each step | The star stops recording the best odour that the swarm has found | The position update is the same as before. The pull acts on the velocity, and the new velocity is what gets added.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Discrete</b> problems use bit strings or permutations. <b>Continuous</b> problems use a vector of real numbers, and PSO was developed for these.",
            "Each number in a particle's vector is one <b>dimension</b>: a dial of the design being optimised.",
            "The loop: create <b>N</b> random particles, then every time step update each particle's position and velocity.",
            "The position update adds the velocity, one dimension at a time: $x_{ij}^{t+1} = x_{ij}^{t} + v_{ij}^{t+1}$.",
          ],
          "Position plus velocity gives the next position.",
        ),
      );
    },
  });

  const cellRow = (t, a, c) => `<div style="margin:6px 0"><b class="dim">${t}</b>${F.cells(a, { size: 40 })}</div>`;
  L["l12-vectors"] = {
    sum: "Discrete problems use bit strings or permutations; PSO was developed for continuous real vectors. The basic loop moves each particle by adding a velocity to its position.",
    steps: [
      {
        t: "Discrete problems",
        b: `<p>Many problems are easy to picture as <b>discrete</b> choices. A <b>binary</b> string says which of eight sensors to switch on. A <b>permutation</b> gives the order to visit six depots.</p><p>For the binary string $(0,1,1,0,1,0,1,1)$ the guess is five sensors on. For the permutation $(3,0,5,1,4,2)$ it is depot 3 first, then 0, and so on.</p>`,
        v: rows(
          cellRow("Binary: sensors on or off", [0, 1, 1, 0, 1, 0, 1, 1]),
          cellRow("Permutation: depot order", [3, 0, 5, 1, 4, 2]),
        ),
        c: C(
          "Which is a permutation problem? | Choosing the order to visit six depots | Switching eight sensors on or off, one after another | Setting a wing thickness to any real value in metres | A permutation is an ordering of items. Switching items on or off is a binary string, and a thickness is a real number.",
        ),
      },
      {
        t: "Continuous problems",
        b: `<p>PSO was developed for <b>continuous</b> representations: the guess is a vector of real numbers. Each number is one dial, and every dial can take any value in a range.</p><p>For example, four dials of a loudspeaker design might read $(2.40, -0.35, 1.10, 0.75)$.</p>`,
        v: cellRow("A particle as a vector of four real numbers", [2.4, -0.35, 1.1, 0.75]),
        c: C(
          "A particle is x = (2.4, −0.35, 1.1, 0.75). How many dimensions does the search space have? | 4, one per number | 1, since it is one particle | 2, a position and a velocity | Each number is one dimension. A velocity of the same length is kept alongside, but it does not add dimensions.",
        ),
      },
      {
        t: "Where real vectors turn up",
        b: `<p>Continuous vectors describe <b>designs</b>: antennae, aircraft wings, amplifiers, controllers and circuits. A wing might be four numbers: span, sweep, thickness and twist.</p><p>The loop is always the same: set the dials, run a simulation, read off one fitness score. The swarm just tries many dial settings.</p>`,
        v: F.flow(
          [
            "Vector of dials (a particle)",
            "Simulate the design",
            "One fitness score",
            { t: "Move the dials", c: "violet" },
          ],
          { loop: true },
        ),
        c: C(
          "In a wing-design search, what does one particle hold? | One complete set of dial settings for a wing | One wing's final drag value after the simulation has run | The source code of the simulator that scores each wing | A particle is a candidate solution: a full vector of the design numbers. The simulation turns it into a fitness.",
        ),
      },
      {
        t: "Why PSO wants numbers",
        b: `<p>PSO moves a particle by <b>adding a velocity</b> and <b>scaling pulls</b> towards good positions. That needs arithmetic that means something. On a dial, $4.0 + 0.7 = 4.7$ is a small, sensible nudge.</p><p>Add $0.7$ to a delivery order, or to a bit, and the result is not a valid guess. This is why discrete problems need a modified PSO (Step 12.5).</p>`,
        v: F.compare(
          {
            title: "Real numbers",
            c: "teal",
            body: "4.0 + 0.7 = 4.7<br>small nudges make sense<br>'halfway to p' makes sense",
          },
          {
            title: "Bits and routes",
            c: "rose",
            body: "bit 1 + 0.7 = ?<br>depot 3 + 0.7 = ?<br>no meaningful halfway",
          },
        ),
        c: C(
          "Why is basic PSO awkward for a bit string? | Adding a velocity to a bit does not give another valid bit | Bit strings are always too short for a swarm to search properly | Bit strings cannot be given a fitness by any function at all | The update adds a real velocity to a position. A 0 or 1 plus 0.37 is not a bit, so the update needs a modified form.",
        ),
      },
      {
        t: "The basic PSO loop",
        b: `<p>The whole algorithm fits in two lines. <b>1.</b> Create and initialise $N$ random particles on the search space. <b>2.</b> For each time step, for each particle: update its position by adding its velocity, and update its velocity.</p><p>With 10 particles and 30 time steps that is 300 particle updates.</p>`,
        v: F.flow(
          [
            "Create N random particles",
            "For each time step...",
            "...for each particle: update position, update velocity",
            { t: "Stop?", c: "violet" },
          ],
          { loop: true },
        ),
        c: C(
          "A swarm of 20 particles runs for 15 time steps. How many particle updates happen in all? | 300 | 35 | 150 | Each of the 20 particles is updated at each of the 15 steps: 20 × 15 = 300.",
          "20 × 15 is 20 × 10 plus 20 × 5.",
        ),
      },
      {
        t: "Updating the position",
        b: `<p>To find the new position of particle $i$, add its velocity, one dimension at a time. A particle at $(3, 5)$ with velocity $(2, -1)$ moves to $(5, 4)$.</p><p>In the picture, the grey arrow is the velocity. The dotted green line is the move from the blue dot to the new position.</p><details class="math-more"><summary>Show the maths</summary><p>For particle $i$ in dimension $j$ at time $t+1$:</p>$$x_{ij}^{t+1} = x_{ij}^{t} + v_{ij}^{t+1}$$<p>$x_{ij}^{t}$ is the position now, and $v_{ij}^{t+1}$ is the particle's velocity in dimension $j$ at the new step: the velocity just computed by the update rule of Step 12.3.</p></details>`,
        v: live({ show: ["v"] }),
        c: C(
          "A particle is at (3, 5) with the new velocity (2, −1). Where is it after the position update? | (5, 4) | (1, 6) | (6, 5) | Add each velocity component to the matching position: 3 + 2 = 5 and 5 + (−1) = 4.",
        ),
      },
      {
        t: "With no pulls, they drift",
        b: `<p>The position update alone moves every particle in a straight line at its own velocity. Without pulls, the swarm never learns anything and never finds a good spot.</p><p>These snapshots show eight particles with no pulls: after 2 and 5 steps each is just further along its own line.</p>`,
        v: F.frames(
          drift(),
          "Eight particles drift in straight lines with no pulls: start, after 2 steps, after 5 steps.",
        ),
        c: C(
          "Why is the position update alone not enough to optimise? | Nothing makes the velocities depend on good positions found | It cannot move a particle at all, since it adds a velocity of zero | It only ever works in one dimension of the search space | Adding the velocity moves particles, but the velocity must be shaped by the best positions found. That is the velocity update.",
        ),
      },
    ],
    guide: [
      "Press <b>Step</b> several times with <b>c₁</b> and <b>c₂</b> at 0 and watch the dots fly straight.",
      "Raise <b>c₂</b> to about 2, press <b>Step</b> again and see the paths bend.",
      "Press <b>Reset</b> to give the swarm new starting positions and velocities.",
      "Answer the questions after the demo.",
    ],
  };

  // ---------- 12.3 updating velocities ----------
  N.register({
    id: "l12-velocity",
    lecture: 12,
    order: 3,
    num: "12.3",
    title: "Updating velocities",
    blurb: "Current velocity, a pull to your own best, a pull to the swarm's best. Follow one particle's arrows.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A particle's new velocity is the sum of three things: <b>where it was heading</b>, a pull towards <b>its own best</b> spot, and a pull towards the <b>swarm's best</b> spot. Press <b>Step</b>, then read the grey, blue and orange arrows of the followed particle.",
        ),
      );
      swarmDemo(root, life, {
        controls: ["c1", "c2"],
        title: "Follow one particle",
        pulls: true,
        seed: 12,
        params: { n: 12 },
      });
      root.appendChild(
        pr(
          "l12-velocity-1",
          "Set <b>c₁</b> to 0 and press <b>Step</b>. What happens to the blue arrow of the followed particle? | It disappears, because the personal pull is scaled to zero | It doubles in length, because c₁ now counts twice in the sum | It points at the star instead of at the particle's own best | The blue arrow is c₁ × z₁ × (p − x). With c₁ at 0 the whole term is 0, so nothing is left to draw.",
        ),
      );
      root.appendChild(
        pr(
          "l12-velocity-2",
          "Set <b>c₂</b> high and <b>c₁</b> to 0, then <b>Run</b>. How do the dots behave? | They rush towards the star and bunch up around it | They scatter away from the star and spread over the whole map | They ignore the star and stay put where they started | With only the global pull, every particle is drawn to the swarm's best spot, so they crowd round it.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>New velocity</b> = the current velocity + a pull to the particle's best position + a pull to the swarm's best position.",
            "<b>c₁</b> and <b>c₂</b> are constants that weight personal against global experience.",
            "<b>z₁</b> and <b>z₂</b> are fresh draws from $U(0,1)$, so the same pulls never give the same step twice.",
            "<b>i</b> labels the particle and <b>j</b> the dimension: the update is done for every dimension separately.",
          ],
          "Keep going, return to my best, and follow the swarm's best.",
        ),
      );
    },
  });

  L["l12-velocity"] = {
    sum: "v = v + c1 z1 (p - x) + c2 z2 (g - x): the current velocity plus a random weighting of the pull to the personal best and to the global best.",
    steps: [
      {
        t: "Three ingredients",
        b: `<p>Each step, a particle's new velocity is built from three parts: <b>the velocity it already has</b>, a pull back towards <b>the best place it has visited</b> (pbest), and a pull towards <b>the best place anyone has visited</b> (gbest).</p><p>The grey arrow is where it was heading. The blue arrow is the pull to $p$. The orange arrow is the pull to $g$. Laid head to tail, they end at the new position.</p>`,
        v: live({}),
        c: C(
          "Which of these is NOT an ingredient of the new velocity? | A pull towards the average position of the nearest neighbours | The velocity the particle already had from the previous step | A pull to the best position the particle has itself visited | A pull to the best position found by the whole swarm | The basic rule has three terms: current velocity, pull to pbest, pull to gbest. There is no neighbour-averaging term.",
        ),
      },
      {
        t: "Keep going: the current velocity",
        b: `<p>The first term, $v_{ij}^{t}$, is the <b>current velocity</b>. It carries the particle on the way it was going, a bit like momentum. A particle at $(2,2)$ moving $(1.5, 1)$ is already heading to $(3.5, 3)$ before any pull is added.</p>`,
        v: live({ show: ["v"] }),
        c: C(
          "A particle has no pulls on it at all. What does it do next step? | Carries on along its current velocity | Stops dead where it stands, as nothing is moving it | Jumps back to the best position it has visited so far | Without any pull terms the velocity is unchanged, so the particle keeps going the way it was.",
        ),
      },
      {
        t: "Pull to your own best",
        b: `<p>The second term pulls the particle back to <b>$p$, the best position it has itself found</b>. The pull is the gap $p - x$ scaled by $c_1$ and a random number $z_1$. If the gap is 3, $c_1 = 2$ and $z_1 = 0.5$, the pull adds $2 \\times 0.5 \\times 3 = 3$.</p><p>It draws a particle back towards the fittest areas of the landscape <b>it</b> has met. Roll the dice and change $c_1$ to see how big the blue arrow gets.</p><details class="math-more"><summary>Show the maths</summary>$$c_1\\,z_1\\,(p_{ij}-x_{ij})$$<p>$p_{ij}$ is the particle's best position in dimension $j$. The further the particle is from it, the longer the pull.</p></details>`,
        v: live({ show: ["v", "p"], live: true }),
        c: C(
          "A particle is at x = 5, its own best is p = 9, c₁ = 2 and z₁ = 0.5. What does the personal pull add to the velocity? | 4 | 2 | 8 | c₁ z₁ (p − x) = 2 × 0.5 × 4 = 4. The pull points towards p, so the velocity rises by 4.",
          "p − x = 9 − 5 = 4. Then 2 × 0.5 = 1.",
        ),
      },
      {
        t: "Pull to the swarm's best",
        b: `<p>The third term does the same with <b>$g$, the best position found by the whole swarm</b>. This is how the experience of everyone guides one particle. If the particle is at 4 and $g$ is 2, the gap $g - x$ is $-2$: a pull to the <b>left</b>. With $c_2 = 2$ and $z_2 = 0.5$ it adds $2 \\times 0.5 \\times (-2) = -2$.</p><details class="math-more"><summary>Show the maths</summary>$$c_2\\,z_2\\,(g_j-x_{ij})$$<p>$g_j$ is the best position of the population in dimension $j$. A negative gap gives a negative pull.</p></details>`,
        v: live({ show: ["v", "g"], live: true }),
        c: C(
          "A particle is at x = 4 and the swarm best is g = 2. Which way does the global pull point? | Left, towards 2 | Right, away from 2 | It has no direction | The gap g − x = −2 is negative, so the pull is in the negative direction, towards g.",
        ),
      },
      {
        t: "Add them up",
        b: `<p>Take a particle at $x = 4$ with velocity $1$. Its best is $p = 7$ and the swarm's best is $g = 2$. With $c_1 = c_2 = 2$ and $z_1 = z_2 = 0.5$: personal pull $+3$, global pull $-2$. New velocity $= 1 + 3 - 2 = 2$, so the new position is $4 + 2 = 6$.</p><details class="math-more"><summary>Show the maths</summary>$$v_{ij}^{t+1}=v_{ij}^{t}+c_1\\,z_1\\,(p_{ij}-x_{ij})+c_2\\,z_2\\,(g_j-x_{ij})$$<p>$$v^{t+1}=1+(2)(0.5)(7-4)+(2)(0.5)(2-4)=1+3-2=2$$</p></details>`,
        v: numLine(),
        c: C(
          "x = 4, v = 1, p = 7, g = 2, c₁ = c₂ = 2, z₁ = z₂ = 0.5. What is the new position? | 6 | 5 | 8 | New velocity = 1 + 3 − 2 = 2. New position = 4 + 2 = 6.",
          "Personal pull +3, global pull −2, then add the result to x.",
        ),
      },
      {
        t: "c₁ and c₂: personal against global",
        b: `<p>The constants $c_1$ and $c_2$ set how much a particle trusts <b>its own experience</b> against <b>the whole swarm's</b>. Set $c_2$ high and every particle is pulled hard to the swarm's best. Set $c_1$ high and each one keeps returning to its own favourite place.</p><p>Drag the sliders in the picture and watch which arrow wins.</p>`,
        v: live({ show: ["v", "p", "g"], live: true }),
        c: C(
          "A swarm has c₁ = 0 and a large c₂. What would you expect? | Particles crowd towards the swarm's best spot | Particles each return to their own best spot | Particles stay exactly where they started | With only the global term, the one position shared by everybody is the only attractor.",
        ),
      },
      {
        t: "Why two random draws",
        b: `<p>$z_1$ and $z_2$ are <b>two different draws</b> from the uniform distribution between 0 and 1, fresh for every particle, dimension and step. So the same particle with the same pulls takes a different step each time.</p><p>Every green dot in the picture is one possible landing spot. The randomness spreads the particles out and <b>prevents premature convergence</b> on a single spot.</p>`,
        v: live({ show: ["v", "p", "g"], live: true, cloud: true }),
        c: C(
          "What would happen if z₁ and z₂ were fixed at 1 for ever? | Every step would be exactly determined: no spread around the best spots | Particles would stop moving, because every pull would cancel exactly | The swarm would stop sharing information about the best positions | With fixed weights the landing spot is exactly the same every time for the same state, so the helpful random spread is lost.",
        ),
      },
    ],
    guide: [
      "Press <b>Step</b> once, then read the three arrows of the followed particle: grey, blue and orange.",
      "Press <b>Follow next particle</b> to look at another one, or click any blue dot.",
      "Slide <b>c₁</b> and <b>c₂</b> and press <b>Step</b> again to see which pull wins.",
      "Press <b>Run</b> and watch the swarm gather. Answer the questions after the demo.",
    ],
  };
})();
