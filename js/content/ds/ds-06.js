(function () {
  const partScope = (NIC.shared.ds = NIC.shared.ds || {});
  const { addV } = partScope;
  const FG = NIC.fig;
  addV(
    "ds-twitter",
    4,
    FG.bars(
      [
        ["target delivery", 5, "teal", "s"],
        ["celebrity fan-out", 87, "rose", "s"],
      ],
      { max: 87 },
    ) +
      `<div class="fig-cap">30 million mailbox writes ÷ 345k writes/s ≈ <b>87 seconds</b>, way over the 5 s goal. Hence the hybrid.</div>`,
  );
  addV(
    "ds-scaling",
    0,
    FG.compare(
      { title: "Before", c: "dim", body: "🚐 one van, 4 CPUs, 16 GB" },
      { title: "Scale up", c: "violet", body: "🚚 one lorry, 64 CPUs, 1 TB, still <b>one</b> machine" },
    ),
  );
  addV(
    "ds-scaling",
    1,
    FG.plot(
      [
        { f: (p) => p, c: "teal", dash: "5 4", label: "fair price" },
        { f: (p) => 0.15 * Math.pow(p, 2.2), c: "rose", label: "real price" },
      ],
      { x: [0.5, 4], xl: "power →", yl: "cost", h: 170 },
    ),
  );
  addV(
    "ds-scaling",
    2,
    FG.graph({
      nodes: {
        LB: { x: 60, y: 110, label: "LB" },
        N1: { x: 250, y: 30, label: "1" },
        N2: { x: 270, y: 90, label: "2" },
        N3: { x: 270, y: 150, label: "3" },
        N4: { x: 250, y: 205, label: "4", c: "rose", sub: "down" },
      },
      edges: [
        ["LB", "N1"],
        ["LB", "N2"],
        ["LB", "N3"],
        ["LB", "N4", null, "rose"],
      ],
      hl: { N1: "teal", N2: "teal", N3: "teal" },
      w: 360,
      h: 240,
    }) +
      `<div class="fig-cap">A load balancer spreads requests over several ordinary machines. One dies, and the others keep serving.</div>`,
  );
  addV(
    "ds-scaling",
    3,
    FG.compare(
      { title: "You gain", c: "teal", body: "cheaper growth · no single point of failure" },
      { title: "You pay", c: "amber", body: "coordination · consistency · partial failures to handle" },
    ),
  );
  addV(
    "ds-maintain",
    1,
    FG.cells(
      [
        { v: "📈 monitoring", c: "teal" },
        { v: "🤖 automation", c: "teal" },
        { v: "🔁 no special machines", c: "teal" },
        { v: "🎯 no surprises", c: "teal" },
      ],
      { size: 140 },
    ),
  );
  addV(
    "ds-maintain",
    2,
    FG.compare(
      {
        title: "Essential complexity",
        c: "violet",
        body: "part of the problem itself: bus routes really do change hourly",
      },
      {
        title: "Accidental complexity",
        c: "rose",
        body: "caused by how it was built: three formats for the same timestamp, undocumented scripts",
      },
    ) +
      `<div class="fig-cap">Good abstractions remove the accidental kind and leave only what the problem needs.</div>`,
  );
  addV(
    "ds-maintain",
    3,
    FG.flow([
      { t: "new requirement", s: '"add ferries"' },
      { t: "simple design", s: "one new module", c: "teal" },
      { t: "shipped", s: "in days, not months" },
    ]),
  );
})();
