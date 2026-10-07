/* l5-workshops-02.js: Nature-Inspired Lecture 5 workshop 5.W2 "Genome lab" (no code).
   Part A: the jet nozzle, a fixed ordered list of diameters against a variable-length genotype: propose mutations and count the wasted ones.
   Part B: an antenna coordinate written as sign + magnitude bits: which flip moves it furthest.
   Validity, the wasted-proposal counts and every flip size come from running the real mutation rules. */
(function () {
  const N = NIC,
    { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /* ---------- Part A: nozzle ---------- */
  const FIX0 = [1.9, 1.6, 1.0, 1.2, 1.4, 1.8];
  const okFixed = (d) => d[0] >= d[1] && d[1] >= d[2] && d[3] <= d[4] && d[4] <= d[5];
  const rndD = (lo = 0.1, hi = 2) => lo + N.rnd() * (hi - lo);
  const flatOf = (v) => [...v.pre, v.small, ...v.post];
  const mutateVar = (v) => {
    const r = N.randint(0, 3),
      side = N.rnd() < 0.5 ? v.pre : v.post;
    if (r === 0 && v.pre.length + v.post.length) {
      const arr = v.pre.length && (N.rnd() < 0.5 || !v.post.length) ? v.pre : v.post;
      arr[N.randint(0, arr.length - 1)] = rndD(v.small);
    } else if (r === 1) {
      v.small = rndD(0.1, Math.min(...v.pre, ...v.post, 2));
    } else if (r === 2 || v.pre.length + v.post.length <= 2) {
      side.splice(N.randint(0, side.length), 0, rndD(v.small));
    } else {
      const arr = v.pre.length > v.post.length ? v.pre : v.post;
      arr.splice(N.randint(0, arr.length - 1), 1);
    }
  };
  const nozzleSVG = (d, mid = -1, bad = []) => {
    const w = 380,
      h = 120,
      sw = (w - 20) / d.length;
    return `<svg class="nw5-noz" viewBox="0 0 ${w} ${h}" role="img" aria-label="Nozzle with ${d.length} sections">${d
      .map((x, i) => {
        const hh = (x / 2) * (h - 30);
        return `<rect x="${10 + i * sw}" y="${(h - hh) / 2}" width="${Math.max(4, sw - 3)}" height="${hh}" rx="4" fill="${bad.includes(i) ? "var(--rose)" : i === mid ? "var(--amber)" : "var(--teal)"}" opacity="0.88"/>`;
      })
      .join("")}</svg>`;
  };

  function nozzlePanel(host, api) {
    let mode = "fix",
      fix = FIX0.slice(),
      va = { pre: [1.9, 1.4], small: 0.6, post: [1.1, 1.7] },
      last = null;
    const cnt = { fix: { n: 0, ok: 0, bad: 0 }, var: { n: 0, ok: 0, bad: 0 } };
    host.innerHTML = `<div class="wk-card"><h3>Jet nozzle genotypes</h3>
      <p class="wk-note"><b>Fixed:</b> six diameters, rule <b>D1 ≥ D2 ≥ D3</b> and <b>D4 ≤ D5 ≤ D6</b>. A mutation replaces one random gene with a new random diameter (0.1 to 2). A proposal that breaks the rule is <b>wasted</b>. <b>Variable length:</b> sections before and after the smallest one, which must stay the smallest. Mutations change a diameter, add a section or delete one.</p>
      <div class="wk-row" data-seg></div>
      <div class="wk-row"><button class="btn primary" data-p="1">Propose a mutation</button><button class="btn" data-p="20">Propose 20</button><button class="btn" data-add hidden>Add a section</button><button class="btn ghost" data-reset>Reset</button></div>
      <div class="wk-stats" data-stats></div><div data-view></div></div>`;
    const view = qs("[data-view]", host);
    qs("[data-seg]", host).append(
      N.seg(
        [
          ["fix", "Fixed six diameters"],
          ["var", "Variable length"],
        ],
        "fix",
        (v) => {
          mode = v;
          qs("[data-add]", host).hidden = v !== "var";
          last = null;
          draw();
        },
      ),
    );
    function draw() {
      const c = cnt[mode];
      qs("[data-stats]", host).innerHTML =
        N.wk.stat("Proposals", c.n) +
        N.wk.stat("Accepted", c.ok, "teal") +
        N.wk.stat("Wasted", c.bad, c.bad ? "rose" : "");
      if (mode === "fix") {
        const bad = [];
        if (last && last.bad) {
          const d = last.d;
          if (d[0] < d[1]) bad.push(0, 1);
          if (d[1] < d[2]) bad.push(1, 2);
          if (d[3] > d[4]) bad.push(3, 4);
          if (d[4] > d[5]) bad.push(4, 5);
        }
        const show = last && last.bad ? last.d : fix;
        view.innerHTML = `<div class="genome-row"><span class="lbl">${last && last.bad ? "proposed" : "current"}</span><span class="genome">${show.map((x, i) => `<span class="gene ${bad.includes(i) ? "bad" : last && last.i === i ? "changed" : ""}">${x.toFixed(2)}</span>`).join("")}</span></div>${nozzleSVG(show, -1, bad)}<div class="callout ${last && last.bad ? "rose" : "teal"}">${last && last.bad ? `<b>Wasted.</b> The proposal breaks the ordering rule at the red sections, so it is thrown away and the nozzle stays as it was.` : last ? "<b>Valid.</b> The proposal was accepted." : "Press <b>Propose</b> to mutate one gene."}</div>`;
      } else {
        const d = flatOf(va);
        view.innerHTML = `<div class="genome-row"><span class="lbl">sections</span><span class="genome">${d.map((x, i) => `<span class="gene ${i === va.pre.length ? "good" : ""}">${x.toFixed(2)}</span>`).join("")}</span></div>${nozzleSVG(d, va.pre.length)}<div class="callout teal"><b>${d.length} sections, always valid.</b> The orange one is the smallest, in the middle by construction. Nothing a mutation does can break the rule.</div>`;
      }
    }
    const once = () => {
      const c = cnt[mode];
      c.n++;
      if (mode === "fix") {
        const d = fix.slice(),
          i = N.randint(0, 5);
        d[i] = rndD();
        const ok = okFixed(d);
        last = { d, i, bad: !ok };
        if (ok) {
          fix = d;
          c.ok++;
        } else c.bad++;
      } else {
        mutateVar(va);
        c.ok++;
        last = null;
      }
    };
    const check = () => {
      if (cnt.fix.bad >= 5) {
        api.say(
          `<b>${cnt.fix.bad} of ${cnt.fix.n}</b> proposals wasted. Random genes break the ordering most of the time.`,
          "surprised",
        );
        api.done("waste");
      }
      if (cnt.var.ok >= 20 && cnt.var.bad === 0) {
        api.say("<b>20 proposals, none wasted.</b> The encoding cannot express a broken nozzle.", "happy");
        api.done("clean");
      }
      if (mode === "var" && flatOf(va).length >= 8) {
        api.say(
          `A nozzle with <b>${flatOf(va).length} sections</b>: a shape the fixed six-gene encoding can never reach.`,
          "love",
        );
        api.done("grow");
      }
    };
    qsa("[data-p]", host).forEach(
      (b) =>
        (b.onclick = () => {
          for (let r = 0; r < +b.dataset.p; r++) once();
          draw();
          check();
        }),
    );
    qs("[data-add]", host).onclick = () => {
      (N.rnd() < 0.5 ? va.pre : va.post).push(rndD(va.small));
      draw();
      check();
    };
    qs("[data-reset]", host).onclick = () => {
      fix = FIX0.slice();
      va = { pre: [1.9, 1.4], small: 0.6, post: [1.1, 1.7] };
      cnt[mode] = { n: 0, ok: 0, bad: 0 };
      last = null;
      draw();
    };
    draw();
  }

  /* ---------- Part B: antenna coordinate ---------- */
  const W = [8, 4, 2, 1];
  const valOf = (b) => (b[0] ? -1 : 1) * b.slice(1).reduce((s, x, k) => s + x * W[k], 0);
  const flipSize = (b, i) => {
    const c = b.slice();
    c[i] = 1 - c[i];
    return Math.abs(valOf(c) - valOf(b));
  };
  const fmt = (b) => `${b[0] ? "−" : "+"}${b.slice(1).join("")}`;

  function antennaPanel(host, api) {
    const START = [
      [0, 0, 0, 1, 0],
      [1, 0, 0, 1, 1],
      [0, 0, 1, 0, 0],
    ];
    let co = START.map((b) => b.slice()),
      show = false,
      last = null;
    host.innerHTML = `<div class="wk-card"><h3>One antenna wire end: X, Y, Z</h3>
      <p class="wk-note">Each coordinate is <b>5 bits</b>: a <b>sign</b> bit (0 is +, 1 is −) then four magnitude bits with weights <b>8, 4, 2, 1</b>. Tap a bit to flip it and see how far the coordinate moves.</p>
      <div class="wk-row"><button class="btn" data-show>Show every flip size</button><button class="btn ghost" data-reset>Reset</button></div>
      <div class="nw5-coords" data-co></div><div data-note></div></div>`;
    const draw = () => {
      qs("[data-co]", host).innerHTML = co
        .map(
          (b, c) =>
            `<div class="nw5-coord"><div class="nw5-cn"><b>${"XYZ"[c]}</b> = <b class="nw5-val">${valOf(b)}</b> <small>(${fmt(b)})</small></div><div class="nw5-bits">${b
              .map(
                (x, i) =>
                  `<span class="nw5-bit"><small>${i ? W[i - 1] : "sign"}</small><button class="gene click ${last && last.c === c && last.i === i ? "changed" : ""}" data-c="${c}" data-i="${i}" aria-label="Flip ${"XYZ"[c]} bit ${i ? "weight " + W[i - 1] : "sign"}">${i ? x : x ? "−" : "+"}</button><small class="nw5-mv">${show ? "moves " + flipSize(b, i) : ""}</small></span>`,
              )
              .join("")}</div></div>`,
        )
        .join("");
      qsa("[data-c]", host).forEach((b) => (b.onclick = () => flip(+b.dataset.c, +b.dataset.i)));
      qs("[data-note]", host).innerHTML = last
        ? `<div class="callout blue"><b>${"XYZ"[last.c]}</b> went from <b>${last.before}</b> to <b>${last.after}</b>: it moved <b>${last.move}</b> unit${last.move === 1 ? "" : "s"}. That ${last.i ? `was the weight-${W[last.i - 1]} bit` : "was the sign bit"}${last.move === last.best ? ", the <b>biggest</b> move available." : `. The biggest available was ${last.best}.`}</div>`
        : `<p class="wk-note">Try flipping bits. Which one do you expect to move a coordinate furthest?</p>`;
    };
    const flip = (c, i) => {
      const b = co[c],
        sizes = b.map((_, k) => flipSize(b, k)),
        before = valOf(b);
      b[i] = 1 - b[i];
      last = { c, i, before, after: valOf(b), move: sizes[i], best: Math.max(...sizes) };
      draw();
      if (last.move === last.best && !show) {
        api.say(`You picked the biggest available flip: <b>${last.move}</b> units.`, "happy");
        api.done("furthest");
      }
      const s = b.map((_, k) => flipSize(b, k));
      if (s[0] > Math.max(...s.slice(1))) {
        api.say(
          `Now the <b>sign</b> bit is the biggest mover (${s[0]} units), because the magnitude is large enough that negating it beats any single weight.`,
          "surprised",
        );
        api.done("sign");
      }
    };
    qs("[data-show]", host).onclick = () => {
      show = !show;
      qs("[data-show]", host).textContent = show ? "Hide flip sizes" : "Show every flip size";
      draw();
    };
    qs("[data-reset]", host).onclick = () => {
      co = START.map((b) => b.slice());
      last = null;
      draw();
    };
    draw();
  }

  N.register({
    id: "l5-genomelab",
    subject: "nic",
    lecture: 5,
    order: 91,
    num: "5.W2",
    workshop: true,
    title: "Workshop: genome lab",
    blurb:
      "No code. Waste mutations on a fixed nozzle, grow a variable one, and flip antenna bits to see which move furthest.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "nic",
        intro:
          "Two real genomes, two lessons. Start with the jet nozzle: press <b>Propose</b> and count how many mutations are thrown away.",
        missions: [
          {
            id: "waste",
            t: "Waste five proposals",
            d: "In <b>Fixed six diameters</b>, keep pressing <b>Propose</b> until five proposals are wasted.",
            hint: "Press <b>Propose 20</b>. Roughly half of random-gene proposals break the ordering rule.",
          },
          {
            id: "clean",
            t: "Twenty with none wasted",
            d: "Switch to <b>Variable length</b> and make 20 proposals. Wasted must stay at zero.",
            hint: "Press <b>Propose 20</b> once. Every mutation of this genotype is valid.",
          },
          {
            id: "grow",
            t: "Reach a new shape",
            d: "Grow the variable nozzle to <b>8 sections</b>.",
            hint: "Press <b>Add a section</b> until the counter in the green box says 8.",
          },
          {
            id: "furthest",
            t: "Flip the furthest bit",
            d: "Open <b>Antenna</b>. Flip the bit that moves a coordinate the <b>furthest</b>, without showing the flip sizes.",
            hint: "Weights are 8, 4, 2, 1. Compare 8 with what the sign flip does (twice the magnitude).",
          },
          {
            id: "sign",
            t: "Make the sign bit the biggest",
            d: "Set a coordinate so that flipping its <b>sign</b> bit moves it further than any magnitude bit.",
            hint: "Negating a value moves it twice its size, so you need a magnitude above 4. Try 0101 or more.",
          },
        ],
        build(stage, api) {
          const noz = el(`<div></div>`),
            ant = el(`<div hidden></div>`),
            bar = el(`<div class="wk-row nw5-tabs"></div>`);
          bar.appendChild(
            N.seg(
              [
                ["noz", "Nozzle (5.4)"],
                ["ant", "Antenna (5.5)"],
              ],
              "noz",
              (v) => {
                noz.hidden = v !== "noz";
                ant.hidden = v !== "ant";
              },
            ),
          );
          stage.append(bar, noz, ant);
          nozzlePanel(noz, api);
          antennaPanel(ant, api);
        },
      });
      root.appendChild(
        predict({
          id: "l5-genomelab-1",
          q: "A fixed nozzle uses six genes that must stay in order. Why do so many random-gene mutations of it get thrown away?",
          opts: [
            "A new random value often lands outside the ordering it must keep",
            "Random numbers are rarely between 0.1 and 2",
            "Six genes is too few to mutate safely",
          ],
          a: 0,
          why: "The genes depend on each other (D1 ≥ D2 ≥ D3). Replacing one with an unrelated random value often lands it on the wrong side of a neighbour, so the whole nozzle is invalid.",
        }),
      );
      root.appendChild(
        predict({
          id: "l5-genomelab-2",
          q: "An antenna coordinate is +0110 (that is +6). Which single flip moves it furthest?",
          opts: ["The sign bit", "The weight-8 bit", "The weight-4 bit"],
          a: 0,
          why: "Flipping the sign gives −6, a move of 12. Flipping the weight-8 bit gives 14 (a move of 8), and the weight-4 bit gives 2 (a move of 4). With a large enough magnitude the sign bit wins.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>fixed list of constrained genes</b> wastes many mutations on invalid offspring, because a random value ignores the rule linking the genes.",
            "A <b>variable-length</b> genotype built so the rule always holds never wastes a proposal, and can reach shapes the fixed one cannot.",
            "In a <b>sign and magnitude</b> binary genome, flip sizes are uneven: weights 8, 4, 2, 1 move by that much, and the sign bit moves by twice the magnitude.",
          ],
          "Not every gene counts the same: some flips are tiny, some are huge.",
        ),
      );
    },
  });

  L["l5-genomelab"] = {
    sum: "Mutate a constrained nozzle genome and flip antenna bits to see which changes are wasted or large.",
    steps: [
      {
        t: "Fixed against variable length",
        b: `<p>The nozzle must always have its smallest section in the middle. A <b>fixed</b> encoding of six diameters needs the ordering <b>D1 ≥ D2 ≥ D3</b> and <b>D4 ≤ D5 ≤ D6</b>, which random mutation keeps breaking.</p><p>A <b>variable-length</b> genotype stores the smallest one separately, so <span class="key">every mutation stays valid</span>.</p>`,
        v: F.compare(
          { title: "Fixed", c: "rose", body: "random gene mutation often breaks the order: wasted proposals" },
          { title: "Variable length", c: "teal", body: "valid by construction, and sections can be added or deleted" },
        ),
        c: {
          q: "How does the variable-length genotype keep every nozzle valid?",
          o: [
            "The smallest section is its own gene and the others are never smaller",
            "Invalid nozzles are thrown away after each mutation",
            "Only the first three sections are ever mutated",
          ],
          a: 0,
          why: "The smallest section is stored as its own gene and every other diameter is at least that large, so the rule holds for every genotype.",
        },
      },
      {
        t: "Bits are not equal",
        b: `<p>An antenna coordinate is <b>sign + 4 magnitude bits</b>. Flipping a magnitude bit moves the value by its weight, <b>8, 4, 2 or 1</b>. Flipping the sign moves it by <b>twice the magnitude</b>.</p><p>So <span class="key">which bit you mutate decides how big the jump is</span>.</p>`,
        v: F.flow([
          { t: "Sign", c: "violet" },
          { t: "8", c: "rose" },
          { t: "4", c: "amber" },
          { t: "2", c: "blue" },
          { t: "1", c: "teal" },
        ]),
        c: {
          q: "A coordinate is +0001 (that is +1). Which flip moves it furthest?",
          o: ["The weight-8 bit, a move of 8", "The sign bit, a move of 2", "All flips move it the same"],
          a: 0,
          why: "Flipping the weight-8 bit takes 1 to 9, a move of 8. Flipping the sign gives −1, a move of only 2.",
        },
      },
    ],
    guide: [],
  };
})();
