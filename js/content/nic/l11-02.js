/* l11-02: Lecture 11: figures for 11.1 (slime mould, movement types, balance, template, V-formation) and lesson 11.2, Reynolds' boids. */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = (NIC.shared.nicL11 = NIC.shared.nicL11 || {});
  const { C, pr, mulberry, svgBox, btn, tint } = sh;
  const wrapBox = (box) => box.appendChild(el(`<div class="fig-wrap" aria-live="polite"></div>`));
  const deg = (r) => (r * 180) / Math.PI;

  /* ---------- 11.1 figures ---------- */
  /** Cells wander alone when food is plentiful and crawl together into one slug when it runs out. */
  sh.slime = (box) => {
    const out = wrapBox(box),
      r = mulberry(5),
      n = 36;
    const free = Array.from({ length: n }, () => [24 + r() * 410, 22 + r() * 150]);
    const slug = Array.from({ length: n }, (_, i) => [
      150 + (i % 12) * 17 + Math.floor(i / 12) * 5,
      74 + Math.floor(i / 12) * 17,
    ]);
    out.innerHTML = `<div class="controls" data-c style="justify-content:center"></div>${svgBox(460, 190, free.map(() => `<circle class="nw11-dot" r="6" fill="var(--blue)"/>`).join("") + `<g data-food>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${40 + i * 70}" y="${i % 2 ? 150 : 30}" width="9" height="9" fill="var(--amber)"/>`).join("")}</g>`, "Cells of a slime mould: spread out when food is plentiful, joined into one slug when it is scarce")}<p class="fig-cap" data-m></p>`;
    const dots = [...out.querySelectorAll(".nw11-dot")];
    const show = (scarce) => {
      dots.forEach(
        (d, i) =>
          (d.style.transform = `translate(${(scarce ? slug : free)[i][0]}px,${(scarce ? slug : free)[i][1]}px)`),
      );
      qs("[data-food]", out).style.opacity = scarce ? 0 : 1;
      qs("[data-m]", out).innerHTML = scarce
        ? "Food scarce: <b>one slug</b> that can crawl away."
        : "Food plentiful: <b>many separate cells</b>, each wandering alone.";
    };
    qs("[data-c]", out).append(
      N.seg(
        [
          ["0", "Food plentiful"],
          ["1", "Food runs out"],
        ],
        "0",
        (v) => show(v === "1"),
      ),
    );
    show(false);
  };
  /** Same arrows, three ways of moving: flocking, swarming, formation. Shows the polarisation score. */
  sh.movement = (box) => {
    const out = wrapBox(box),
      r = mulberry(11);
    const base = Array.from({ length: 20 }, () => [60 + r() * 340, 25 + r() * 120]);
    const vee = base.map((_, i) => [230 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 20, 30 + Math.ceil(i / 2) * 11]);
    const rnd = base.map(() => r() * 360);
    const mode = {
      flock: {
        pos: base,
        ang: base.map((_, i) => 62 + ((i * 7) % 19) - 9),
        say: "Flocking: everyone heads the same way",
      },
      swarm: { pos: base, ang: rnd, say: "Swarming: together, but nobody agrees on a direction" },
      form: { pos: vee, ang: base.map(() => 90), say: "Formation: a fixed shape, all heading the same way" },
    };
    out.innerHTML = `<div class="controls" data-c style="justify-content:center"></div>${svgBox(460, 170, base.map(() => `<g class="nw11-arrow"><path d="M-9 -5 L9 0 L-9 5 L-5 0Z" fill="var(--blue)"/></g>`).join(""), "Twenty arrows showing the heading of each animal")}<p class="fig-cap" data-m></p>`;
    const gs = [...out.querySelectorAll(".nw11-arrow")];
    const show = (k) => {
      const m = mode[k];
      gs.forEach(
        (g, i) => (g.style.transform = `translate(${m.pos[i][0]}px,${m.pos[i][1]}px) rotate(${m.ang[i] - 90}deg)`),
      );
      const rad = m.ang.map((a) => (a * Math.PI) / 180),
        P =
          Math.hypot(
            rad.reduce((s, a) => s + Math.cos(a), 0),
            rad.reduce((s, a) => s + Math.sin(a), 0),
          ) / rad.length;
      qs("[data-m]", out).innerHTML = `${m.say}. Polarisation <b>${P.toFixed(2)}</b>.`;
    };
    qs("[data-c]", out).append(
      N.seg(
        [
          ["flock", "Flocking"],
          ["swarm", "Swarming"],
          ["form", "Formation"],
        ],
        "flock",
        show,
      ),
    );
    show("flock");
  };
  /** Two fish: too close they push apart, too far they pull together, between they hold steady. */
  sh.balance = (box, life) => {
    const out = wrapBox(box);
    let d = 6;
    out.innerHTML = `<div class="controls" data-c></div><div data-s></div><p class="fig-cap" data-m></p>`;
    const s = N.slider("Distance between the fish", 0.5, 8, 0.5, d, (v) => v + " lengths");
    const draw = () => {
      const x1 = 60,
        x2 = 60 + d * 48,
        mode = d < 2.5 ? "rose" : d > 3.5 ? "blue" : "teal",
        arrow = (x, dir) =>
          `<path d="M${x} 62 h${dir * 34}" stroke="var(--${mode})" stroke-width="5" stroke-linecap="round"/><path d="M${x + dir * 34} 62 l${-dir * 9} -7 v14z" fill="var(--${mode})"/>`;
      const fish = (x) =>
        `<ellipse cx="${x}" cy="62" rx="22" ry="11" fill="var(--violet)"/><path d="M${x - 22} 62 l-12 -9 v18z" fill="var(--violet)"/><circle cx="${x + 12}" cy="59" r="2.5" fill="var(--panel)"/>`;
      qs("[data-s]", out).innerHTML = svgBox(
        460,
        130,
        `<rect x="${60 + 2.5 * 48}" y="96" width="48" height="12" fill="var(--teal)" opacity=".5"/><rect x="60" y="96" width="${2.5 * 48}" height="12" fill="var(--rose)" opacity=".35"/><rect x="${60 + 3.5 * 48}" y="96" width="${4.5 * 48}" height="12" fill="var(--blue)" opacity=".35"/><text x="${60 + 1.2 * 48}" y="124" class="fig-sub">too close</text><text x="${60 + 3 * 48}" y="124" class="fig-sub">steady</text><text x="${60 + 5.8 * 48}" y="124" class="fig-sub">too far</text>${fish(x1)}${fish(x2)}${d < 2.5 ? arrow(x1 - 24, -1) + arrow(x2 + 24, 1) : d > 3.5 ? arrow(x1 + 26, 1) + arrow(x2 - 26, -1) : ""}`,
        `Two fish ${d} body lengths apart`,
      );
      qs("[data-m]", out).innerHTML =
        d < 2.5
          ? "<b>Repulsion</b> wins: they push apart."
          : d > 3.5
            ? "<b>Attraction</b> wins: they pull together."
            : "The urges <b>cancel</b>: they hold steady.";
    };
    s.onInput((v) => ((d = v), draw()));
    qs("[data-c]", out).append(
      s,
      btn(
        "Let go",
        () => {
          let n = 0;
          const stop = life.interval(() => {
            d += (3 - d) * 0.25;
            s.value = Math.round(d * 10) / 10;
            draw();
            if (Math.abs(d - 3) < 0.05 || ++n > 40) {
              d = 3;
              s.value = 3;
              draw();
              stop();
            }
          }, 70);
        },
        "primary",
      ),
    );
    draw();
  };
  /** Neighbours say east, the compass says north: the bird blends the two. */
  sh.template = (box) => {
    const out = wrapBox(box);
    let m = 50;
    out.innerHTML = `<div class="controls" data-c></div><div data-s></div><p class="fig-cap" data-m></p>`;
    const s = N.slider("Trust in the compass", 0, 100, 10, m, (v) => v + "%");
    const draw = () => {
      const th = (1 - m / 100) * 90,
        arr = (a, c, len, w) =>
          `<g transform="rotate(${a} 230 100)"><path d="M230 100 v${-len}" stroke="var(--${c})" stroke-width="${w}" stroke-linecap="round"/><path d="M230 ${100 - len - 10} l-8 14 h16z" fill="var(--${c})"/></g>`;
      qs("[data-s]", out).innerHTML = svgBox(
        460,
        180,
        `<circle cx="230" cy="100" r="74" fill="none" stroke="var(--line-2)" stroke-dasharray="4 5"/><text x="230" y="14" class="fig-sub">north (compass)</text><text x="330" y="105" class="fig-sub" style="text-anchor:start">east (neighbours)</text>${arr(90, "blue", 70, 4)}${arr(0, "amber", 70, 4)}${arr(th, "violet", 58, 7)}`,
        `A bird blends neighbours heading east and a compass pointing north: heading ${th} degrees`,
      );
      qs("[data-m]", out).innerHTML =
        `Heading <b>${Math.round(th)}°</b> round from north. Blue: neighbours (90°). Orange: compass (0°). Purple: the bird.`;
    };
    s.onInput((v) => ((m = v), draw()));
    qs("[data-c]", out).append(s);
    draw();
  };
  /** Range in a V-formation: over 70% further than flying alone. */
  sh.vee = (box) => {
    const out = wrapBox(box);
    out.innerHTML = `<div class="controls" data-c></div><div data-b></div><p class="fig-cap">Over 70% further means more than 1.7 times the solo range.</p>`;
    const s = N.slider("Range alone", 600, 1500, 100, 1000, (v) => v.toLocaleString("en-GB") + " km");
    const draw = (v) =>
      (qs("[data-b]", out).innerHTML = F.bars(
        [
          ["Flying alone", v, "blue"],
          ["V-formation (over)", Math.round(v * 1.7), "teal"],
        ],
        { max: 2600, unit: " km", label: "Range alone against range in a V" },
      ));
    s.onInput(draw);
    qs("[data-c]", out).append(s);
    draw(1000);
  };

  /* steps of 11.1 (the lesson is registered in l11-01) */
  L["l11-flock"] = {
    sum: "A <b>flock</b> is a leaderless group that moves as one. It balances attraction against repulsion and gains range, calmer water and safety.",
    steps: [
      {
        t: "From slime mould to flocks",
        b: `<p>Lecture 7's big idea was <b>emergent intelligence</b>: a skill no single member has, which the group shows because its members interact. Levine (1998) gives the ultimate example, the <b>slime mould</b>.</p><p>When food is <b>plentiful</b> it is a crowd of separate amoebae, each wandering alone. When food runs <b>scarce</b> the cells crawl together and become <b>one many-celled slug</b> that can move off as a unit. So 200 cells that could each only wander become one slug that travels. Press the two buttons in the picture.</p>`,
        v: (box, life) => sh.slime(box, life),
        c: C(
          "Food runs out and separate slime mould cells join into one slug. What does the slug show? | A group acting as one, with no cell in charge | A leader cell commanding the rest to follow | Each cell finding food alone and walking apart | The slug moves as a unit, yet no cell gives orders. The unit's skill is emergent.",
        ),
      },
      {
        t: "Ways to move together",
        b: `<p>Animal groups move together in several ways: <b>flocking</b> or <b>shoaling</b> (birds, fish), <b>swarming</b> (fruit flies milling about) and <b>formation travelling</b> (geese in a V). This lecture is about <b>coordinated</b> movement, where members head the same way, not a cloud that merely stays put. In nature the movement is 2D (herds) or 3D (air, water).</p><p>To tell them apart, score a group from 0 to 1 for how far its members point the same way. For example, two animals heading opposite ways score 0, and two heading east score 1. Flip the switch in the picture.</p><details class="math-more"><summary>Show the maths</summary><p>Turn every heading into an arrow of length 1, add the arrows, and divide the length of the sum by the number of animals $N$:</p><p>$$P=\\frac{1}{N}\\left\\lVert\\sum_{i=1}^{N}\\hat{\\mathbf v}_i\\right\\rVert$$</p><p>Two east-facing animals give $(2,0)/2$, so $P=1$. One east and one west give $(0,0)$, so $P=0$. This <b>polarisation</b> is the number the demos show.</p></details>`,
        v: (box) => sh.movement(box),
        c: C(
          "A cloud of fruit flies stays in one spot with every fly pointing a different way. Which is it? | Swarming, not coordinated | Flocking, coordinated | Formation travelling | Staying together is not enough. Coordinated movement needs members to head the same way, which a swarm of fruit flies does not.",
        ),
      },
      {
        t: "What a flock does",
        b: `<p>Flocks show a recognisable set of behaviours:</p><ul><li><b>Rapid, directed</b> movement of the whole flock.</li><li><b>Reactivity to predators</b>: <b>flash expansion</b> and the <b>fountain effect</b>.</li><li><b>Reactivity to obstacles</b>, with <b>no collisions</b> between members.</li><li><b>Coalescing and splitting</b> of flocks.</li><li><b>Tolerance</b> of members joining or leaving.</li><li><b>No dedicated leader</b>.</li></ul><p>Try it: scare the flock, then remove 10 boids and see whether it still moves as one.</p>`,
        v: (box, life) =>
          sh.flock(box, life, {
            buttons: ["scare", "more", "less", "reset"],
            stats: ["polar", "groups", "n"],
            trace: true,
          }),
        c: C(
          "Which statement is <b>not</b> true of flocking? | One dedicated leader steers every turn | The flock reacts to a nearby predator | A flock can split and later rejoin | Flocks have no dedicated leader: each member reacts to its neighbours, so the flock survives losing members.",
        ),
      },
      {
        t: "Flocks everywhere",
        b: `<p>Flocking shows up in <b>all media</b> (air, water and land) and in many animal families: insects, fish, birds, mammals, young and old, large and small. It runs from <b>tiny groups</b>, such as two geese, to <b>huge ones</b>, such as herring shoals 17 miles long (over 27 km). Some animals flock only in special circumstances, for example during <b>migration</b>.</p><p>So the rules cannot rely on one body or one medium. They must be simple enough to suit a goose and a herring alike.</p>`,
        v: F.cells([
          { v: "Air", sub: "geese, starlings" },
          { v: "Water", sub: "herring, sardines" },
          { v: "Land", sub: "antelope, wildebeest" },
        ]),
        c: C(
          "Two geese and a herring shoal 17 miles long both flock. What does this suggest? | The rules are simple enough to work at any size | Flocking only starts once there are thousands | Each species needs a unique rule book to flock | Flocking appears from tiny to enormous groups in air, water and land, so its rules must be simple and general.",
        ),
      },
      {
        t: "Pull in, push out",
        b: `<p>A flock balances two urges. <b>Attraction</b> (aggregation) keeps members near each other. <b>Repulsion</b> (segregation) keeps them from crowding. With too much attraction the group jams and collides, and with too much repulsion it drifts apart.</p><p>In the picture, two fish 1 body length apart push away from each other. Two fish 6 lengths apart pull together. Near 3 lengths the two urges cancel and they hold steady. Drag the distance, then press <b>Let go</b>.</p>`,
        v: (box, life) => sh.balance(box, life),
        c: C(
          "Two fish are too far apart to feel comfortable. Which urge wins? | Attraction, so they swim closer | Repulsion, so they swim apart | Neither, so they hold still | Beyond the comfortable gap, attraction (aggregation) wins and pulls them together. Repulsion wins only when they are too close.",
        ),
      },
      {
        t: "Neighbours plus the environment",
        b: `<p>Flocks coordinate by <b>copying their neighbours</b> (neighbour mimetism). Often a second guide helps: an <b>environmental template</b> such as the Earth's magnetic field or an odour field. Birds use both for taking off, landing, turning and keeping to a route.</p><p>Picture each bird blending two headings, the average of its neighbours and the cue. For example, neighbours head east (90° round from north) and the compass says north (0°). A bird that trusts both equally points at 45°. Slide the mix in the picture.</p><details class="math-more"><summary>Show the maths</summary><p>With $m$ as the share of trust placed in the cue:</p><p>$$\\theta=(1-m)\\,\\theta_{\\text{neighbours}}+m\\,\\theta_{\\text{cue}}$$</p><p>For $m=\\tfrac12$ this is $0.5\\times90+0.5\\times0=45^\\circ$. For $m=\\tfrac13$ it is $\\tfrac23\\times90=60^\\circ$.</p></details>`,
        v: (box) => sh.template(box),
        c: C(
          "Neighbours head east and the compass says north. A bird trusts its neighbours twice as much as the compass. Which way does it point? | Closer to east than to north | Closer to north than to east | Exactly halfway between the two | Two thirds of its trust goes to east, so the blend lies nearer east (60° round from north).",
          "Two thirds of the weight is on east.",
        ),
      },
      {
        t: "Why flock?",
        b: `<p>Flocking pays in several ways. Geese in a <b>V-formation</b> can extend their range by over 70%, and each flies faster in a flock. Fish cast off slime as they swim, which <b>reduces turbulence</b> and the energy needed. Flocks also <b>repel predators</b>: flash expansion and the fountain effect in fish, <b>pronging</b> in antelope (visual confusion), and schooling that may confuse a hunter.</p><p>For example, a goose that manages 1,000 km alone could manage over 1,700 km in a V. Slide the solo range in the picture.</p><details class="math-more"><summary>Show the maths</summary><p>"Over 70% further" means the new range is more than $1.7$ times the old one: $1000\\times1.7=1700$ km.</p></details>`,
        v: (box) => sh.vee(box),
        c: C(
          "A goose can fly 800 km alone. In a V it goes over 70% further. About how far? | Over 1,300 km | Roughly 900 km | Roughly 1,100 km | 70% of 800 is 560, and 800 + 560 = 1,360 km. So over 1,300 km.",
          "70% of 800 is 560.",
        ),
      },
    ],
    guide: [
      "Press <b>Scare them</b> and watch the polarisation trace dip and recover.",
      "Press <b>Remove 10</b> and <b>Add 10</b> and watch the number of groups.",
      "Press <b>Scatter</b> to start again. Answer the questions after the demo.",
    ],
  };

  /* ============ 11.2 Reynolds' boids ============ */
  /** One boid and twelve flockmates. The radius slider decides who it can sense. */
  const MATES = [
    [40, -20],
    [70, 35],
    [-60, 20],
    [-30, -70],
    [95, -10],
    [20, 85],
    [-110, -35],
    [125, 50],
    [150, -80],
    [-150, 70],
    [190, 15],
    [0, -100],
    [170, -10],
  ];
  sh.sensing = (box) => {
    const out = wrapBox(box);
    let R = 80;
    out.innerHTML = `<div class="controls" data-c></div><div data-s></div><p class="fig-cap" data-m></p>`;
    const s = N.slider("Perception radius", 30, 200, 10, R);
    const draw = () => {
      const near = MATES.filter(([x, y]) => Math.hypot(x, y) < R),
        first = near.reduce((m, p) => (!m || Math.hypot(...p) < Math.hypot(...m) ? p : m), null);
      qs("[data-s]", out).innerHTML = svgBox(
        460,
        220,
        `<circle cx="230" cy="110" r="${R}" fill="${tint("amber", 14)}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5"/>${MATES.map(([x, y]) => `<circle cx="${230 + x}" cy="${110 + y}" r="6" fill="${Math.hypot(x, y) < R ? "var(--teal)" : "var(--line-2)"}"/>`).join("")}<path d="M230 110 m-12 -8 l24 8 l-24 8 l5 -8z" fill="var(--violet)"/>`,
        `A boid in the middle with a circle showing how far it senses; ${near.length} flockmates are inside`,
      );
      qs("[data-m]", out).innerHTML = near.length
        ? `The purple boid senses <b>${near.length}</b> flockmate${near.length === 1 ? "" : "s"}, all directions, none hidden. For the nearest it knows the distance (<b>${Math.round(Math.hypot(...first))}</b>) and the bearing (<b>${Math.abs(Math.round(deg(Math.atan2(first[1], first[0]))))}°</b> to its ${first[1] < 0 ? "left" : "right"}).`
        : "Nobody is inside the circle: the boid senses nothing.";
    };
    s.onInput((v) => ((R = v), draw()));
    qs("[data-c]", out).append(s);
    draw();
  };
  const rule = (o) => (box, life) => sh.flock(box, life, { n: 30, arrows: true, buttons: ["pause", "reset"], ...o });

  N.register({
    id: "l11-boids",
    lecture: 11,
    order: 2,
    num: "11.2",
    title: "Reynolds' boids: three rules",
    blurb: "Separation, alignment and cohesion. Turn each rule up and down on a live flock and see what it does.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Craig Reynolds' <b>boids</b> (1987) fly as a flock using only three local rules: <b>separation</b> (do not crowd), <b>alignment</b> (match your neighbours' heading) and <b>cohesion</b> (move towards your neighbours' centre). The purple boid shows its three pushes as arrows: red, blue and green.",
        ),
      );
      const card = el(
        `<div class="card"><div class="card-head"><h2>The boids sandbox</h2></div><div data-box></div></div>`,
      );
      root.appendChild(card);
      sh.flock(qs("[data-box]", card), life, {
        n: 40,
        bare: true,
        arrows: true,
        sliders: ["ws", "wa", "wc", "R"],
        buttons: ["reset", "fast", "pause"],
        stats: ["polar", "groups", "close"],
        trace: true,
      });
      root.appendChild(
        pr(
          "l11-boids-1",
          "Set <b>Alignment</b> to 0, leave the rest, press <b>Scatter</b> and wait ten seconds. What happens to the polarisation? | It stays low: the boids never agree on a heading | It climbs to near 1, as cohesion makes them agree | It drops to exactly 0 and the boids stop | Alignment is the rule that matches headings. Without it the boids may gather but they keep pointing different ways.",
        ),
      );
      root.appendChild(
        pr(
          "l11-boids-2",
          "Set <b>Separation</b> to 0 and press <b>Scatter</b>. What changes? | The flock still forms, but many boids overlap | The flock never forms, as separation holds it together | The boids fly faster to avoid each other | Cohesion and alignment still pull the flock together. Only separation stops boids sitting on top of each other.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A boid senses flockmates within a radius, with no noise and no hidden boids, and responds at once.",
            "<b>Separation</b> avoids crowding, <b>alignment</b> matches heading, <b>cohesion</b> moves towards the neighbours' centre.",
            "No single rule makes a flock. The three together, balanced, do.",
          ],
          "Three local rules, one moving flock.",
        ),
      );
    },
  });

  L["l11-boids"] = {
    sum: "Reynolds' <b>boids</b> flock with three local rules: <b>separation</b>, <b>alignment</b> and <b>cohesion</b>, using only what each boid can sense nearby.",
    steps: [
      {
        t: "An animator's problem",
        b: `<p>In 1987 <b>Craig Reynolds</b>, a computer animator, wanted flocks that looked <b>realistic</b>, worked in <b>3D</b> and were <b>cheap to compute</b>. Scripting every bird's path by hand would be slow and stiff. His idea: give each bird, a <b>boid</b>, a few local rules and let the flock appear.</p><p>For example, to animate 100 birds you write the three rules once, and all 100 boids use them.</p>`,
        v: F.compare(
          { title: "Script every path", c: "amber", body: "One path per bird<br>Slow to make, stiff to watch" },
          { title: "Give each boid rules", c: "teal", body: "Same few rules for all<br>The flock emerges" },
        ),
        c: C(
          "Why did Reynolds give every boid local rules instead of scripting paths? | Realistic 3D flocks at a low computing cost | So the flock would follow a lead boid | So each boid could learn from past flocks | Local rules are cheap, work in 3D and give lifelike flocks without scripting any path.",
        ),
      },
      {
        t: "What a boid can sense",
        b: `<p>Reynolds made simple assumptions about senses. A boid has a <b>local, all-direction</b> sense: it knows the <b>distance and bearing</b> of every flockmate inside a radius, with <b>no occlusion</b> (nobody hides behind someone else). It <b>identifies every flockmate perfectly</b>, with <b>no noise</b>, and <b>responds immediately</b>: one loop from perception to action. All boids are <b>identical</b>.</p><p>A boid cannot sense speed directly. It <b>estimates velocity from two position readings</b>. Slide the radius to see who is in range.</p><details class="math-more"><summary>Show the maths</summary><p>Velocity from two readings of a neighbour's position, one time step apart:</p><p>$$\\mathbf v\\approx\\frac{\\mathbf p_{t}-\\mathbf p_{t-1}}{\\Delta t}$$</p><p>A neighbour seen at $(10,5)$ and then at $(12,5)$ is moving at $(2,0)$ per step: east.</p></details>`,
        v: (box) => sh.sensing(box),
        c: C(
          "Which is one of Reynolds' sensing assumptions for a boid? | Perfect distance and bearing, with no noise | Only the flockmate straight ahead is seen | Boids differ in how far each can see | Boids in front hide those behind them | Each boid senses every flockmate within its radius, noise-free, with no occlusion, and all boids are identical.",
        ),
      },
      {
        t: "Rule 1: separation",
        b: `<p><b>Separation</b>: steer to avoid crowding local flockmates. A boid nudges away from any flockmate that is too close, harder the closer it is. For example, with a personal space of 20, a flockmate at distance 5 pushes with strength 0.75, one at 15 with 0.25, and one at 20 or more not at all.</p><p>On its own this keeps boids apart but never forms a flock. Watch the red arrow, and the polarisation staying low.</p><details class="math-more"><summary>Show the maths</summary><p>For each flockmate $j$ closer than the personal space $r$, push directly away with strength that fades to zero at $r$:</p><p>$$\\mathbf s=-\\sum_{j:\\,d_j\\lt r}\\frac{\\mathbf d_j}{\\lVert\\mathbf d_j\\rVert}\\left(1-\\frac{\\lVert\\mathbf d_j\\rVert}{r}\\right)$$</p><p>With $r=20$: $1-5/20=0.75$ at distance 5, $1-15/20=0.25$ at distance 15.</p></details>`,
        v: rule({ ws: 1, wa: 0, wc: 0, sliders: ["ws"], stats: ["polar", "close"] }),
        c: C(
          "A flockmate is very close on a boid's left. What does separation do? | Pushes it to the right, away from the flockmate | Pushes it to the left, towards the flockmate | Turns it to match the flockmate's heading | Separation always steers away from the crowding flockmate. Matching heading is alignment, and moving towards others is cohesion.",
        ),
      },
      {
        t: "Rule 2: alignment",
        b: `<p><b>Alignment</b> (velocity matching): steer towards the <b>average heading</b> of flockmates. The boid compares its own direction with the average of those it senses and turns part of the way. For example, a boid heading north among neighbours heading east turns a little east on every tick, and soon agrees.</p><p>On its own, alignment makes boids <b>polarise</b>, but nothing holds them together, so they can drift apart. Watch the blue arrow and the polarisation climb.</p>`,
        v: rule({ ws: 0, wa: 1, wc: 0, sliders: ["wa"], stats: ["polar", "groups"] }),
        c: C(
          "A boid heads north and all its neighbours head east. What does alignment do? | Turns it a little towards east | Turns it a little towards west | Moves it towards the neighbours' centre | Alignment steers towards the neighbours' average heading, which here is east.",
        ),
      },
      {
        t: "Rule 3: cohesion",
        b: `<p><b>Cohesion</b>: steer to move toward the <b>average position</b> of local flockmates. A boid looks at where its neighbours' centre is and leans that way. For example, neighbours mostly to its right pull it right.</p><p>On its own, cohesion gathers boids into clumps that do not agree on a heading, so polarisation stays low. Raise <b>Cohesion</b> to 3 and watch the green arrow and the number of groups fall.</p>`,
        v: rule({ ws: 0, wa: 0, wc: 3, sliders: ["wc"], stats: ["polar", "groups"] }),
        c: C(
          "Most of a boid's neighbours are on its right. What does cohesion do? | Leans it towards the right, to join them | Leans it towards the left, away from them | Matches its heading to theirs | Cohesion moves the boid towards the average position of its flockmates, here on the right.",
        ),
      },
      {
        t: "Putting the three together",
        b: `<p>Each tick every boid does the same short job: <b>sense</b> flockmates in range, work out the three pushes, <b>add them up</b> (each times its weight), turn, and move. All boids do this at once. The sliders set the weights, and the arrows show the purple boid's pushes. Click another boid to follow it.</p><p>For example, if separation gives 0.8, alignment 0.2 and cohesion 0.1 the boid is mostly steering away, so a flock in a crowd spreads out first and tightens later.</p><details class="math-more"><summary>Show the maths</summary><p>With weights $w_s,w_a,w_c$ for the three pushes $\\mathbf s,\\mathbf a,\\mathbf c$, a boid with velocity $\\mathbf v$ updates</p><p>$$\\mathbf v\\leftarrow\\mathbf v+w_s\\mathbf s+w_a\\mathbf a+w_c\\mathbf c$$</p><p>then keeps its speed and moves. Setting a weight to 0 switches that rule off.</p></details>`,
        v: (box, life) =>
          sh.flock(box, life, {
            n: 40,
            arrows: true,
            sliders: ["ws", "wa", "wc"],
            buttons: ["reset", "fast", "pause"],
            stats: ["polar", "groups", "close"],
          }),
        c: C(
          "Separation and alignment both push a boid left, and a weaker cohesion pushes right. Overall it turns... | Left, as the two stronger pushes agree | Right, as cohesion always wins | Straight on, as the pushes cancel exactly | The pushes add: two agree on left and the third is weaker, so the sum points left.",
        ),
      },
    ],
    guide: [
      "Drag <b>Separation</b>, <b>Alignment</b>, <b>Cohesion</b> and <b>Perception radius</b>.",
      "Press <b>Scatter</b> to restart, <b>Speed ×3</b> to hurry and <b>Pause</b> to freeze a frame.",
      "Click a boid to follow its three arrows. Answer the questions after the demo.",
    ],
  };
})();
