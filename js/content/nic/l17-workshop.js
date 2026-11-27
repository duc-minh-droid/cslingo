/* l17-workshop: Lecture 17 workshop 17.W, Pip's spiking brain lab (no code): tune a leaky neuron, relay spikes through a network, train a synapse with STDP, and feel a surrogate's slope. Kernel and demos from l17-01.js (NIC.shared.nicL17). */
(function () {
  const N = NIC;
  const { qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL17;
  const { C, pr, card, stat, lifDemo, stdpDemo, propagate, netSvg, slope } = sh;

  /** Relay card: toggle input spikes for A and B at steps 1 to 4, then watch the network over 6 steps. */
  function relay(stage, api) {
    const A = [1, 0, 0, 0],
      B = [0, 1, 0, 0];
    let t = 1;
    const c = card(
      stage,
      "Spike relay",
      `<p class="nw17-note">Tap the input steps to switch spikes on or off. Neuron <b>O</b> needs <b>3</b> spikes arriving at once.</p><div class="nw17-grid" data-g></div><div class="controls" data-c></div><div data-p></div><p class="nw17-note" data-n aria-live="polite"></p>`,
    );
    const sl = N.slider("Time step t", 1, 6, 1, 1);
    qs("[data-c]", c).append(sl);
    const draw = () => {
      const R = propagate(A, B);
      const row = (k, arr) =>
        `<div class="nw17-row"><span class="nw17-rl">${k}</span>${arr
          .map(
            (f, i) =>
              `<button class="nw17-cell${f ? " on" : ""}" data-k="${k}" data-t="${i}" aria-pressed="${!!f}" aria-label="${k} spike at step ${i + 1}">${i + 1}</button>`,
          )
          .join("")}</div>`;
      qs("[data-g]", c).innerHTML = row("A", A) + row("B", B);
      qs("[data-p]", c).innerHTML = netSvg(R[t - 1], t);
      const fired = R.map((s, i) => (s.O ? i + 1 : 0)).filter(Boolean);
      qs("[data-n]", c).innerHTML = fired.length
        ? `O fires at step <b>${fired.join(", ")}</b>.`
        : "O never fires: it never gets 3 spikes in the same step.";
      if (fired.length) {
        api.say(`A and B fired together, so all four middle neurons hit O at once (step ${fired[0]}).`, "happy");
        api.done("relay");
      }
    };
    qs("[data-g]", c).addEventListener("click", (e) => {
      const b = e.target.closest("[data-t]");
      if (!b) return;
      const arr = b.dataset.k === "A" ? A : B;
      arr[+b.dataset.t] = arr[+b.dataset.t] ? 0 : 1;
      draw();
    });
    sl.onInput((v) => ((t = v), draw()));
    draw();
  }

  /** Surrogate card: choose k and the input a, read the slope. */
  function slopeCard(stage, api) {
    let k = 1;
    const c = card(
      stage,
      "Surrogate slope meter",
      `<div class="controls" data-c></div><div data-p></div><div class="nw17-stats" data-t></div>`,
    );
    const sl = N.slider("a (charge minus threshold)", -4, 4, 0.5, 0, (v) => v.toFixed(1));
    const draw = () => {
      const a = sl.value,
        s = slope(a, k);
      qs("[data-p]", c).innerHTML = N.fig.plot([{ f: (x) => slope(x, k), c: "violet", label: `k = ${k}` }], {
        x: [-4, 4],
        y: [0, 5.2],
        xl: "a",
        yl: "slope",
        h: 180,
        vlines: [[a, `a = ${a}`]],
      });
      qs("[data-t]", c).innerHTML =
        stat("k", k, "violet") +
        stat("a", a.toFixed(1), "blue") +
        stat("Slope here", s < 0.01 ? "almost 0" : s.toFixed(2), "amber");
      if (k === 20 && a !== 0 && s < 0.01) {
        api.say(
          "Sharp surrogate, and only a little way from the threshold the slope is already almost 0: backprop would get no signal there.",
          "happy",
        );
        api.done("slope");
      }
    };
    qs("[data-c]", c).append(
      N.seg(
        [
          ["1", "k = 1"],
          ["5", "k = 5"],
          ["20", "k = 20"],
        ],
        "1",
        (v) => ((k = +v), draw()),
      ),
      sl,
    );
    sl.onInput(draw);
    draw();
  }

  function build(stage, api) {
    lifDemo(stage, {
      title: "Leaky neuron",
      leak: 0,
      I: 0.1,
      onDraw: (R, I, leak) => {
        if (leak === 0.3 && R.n === 3) {
          api.say(`Fast leak with input ${I.toFixed(2)}: exactly 3 spikes. The leak eats most of the drip.`, "happy");
          api.done("leak");
        }
      },
    });
    relay(stage, api);
    stdpDemo(stage, {
      title: "Synapse trainer",
      pre: Array(12).fill(0),
      post: Array(12).fill(0),
      onDraw: (R) => {
        if (R.w >= 3) {
          api.say(`Weight +${R.w}: every time pre fired just before post, the link grew.`, "happy");
          api.done("stdp");
        }
      },
    });
    slopeCard(stage, api);
  }

  N.register({
    id: "l17-wlab",
    lecture: 17,
    order: 90,
    num: "17.W",
    workshop: true,
    title: "Workshop: Pip's spiking brain lab",
    blurb:
      "No code. Tune a leaky neuron, relay spikes to a picky neuron, train a synapse with STDP and test a surrogate.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "Four cards for Pip's brain: a <b>leaky neuron</b>, a <b>spike relay</b>, a <b>synapse trainer</b> and a <b>surrogate slope meter</b>.",
        missions: [
          {
            id: "leak",
            t: "Three and no more",
            d: "On the <b>Leaky neuron</b>, choose <b>Fast leak</b> and set <b>Input per step</b> so it fires exactly 3 times.",
            hint: "With a fast leak, small inputs never reach the threshold. Creep the input up one notch at a time.",
          },
          {
            id: "relay",
            t: "Wake neuron O",
            d: "On the <b>Spike relay</b>, switch input spikes on or off until <b>O</b> fires.",
            hint: "O needs 3 spikes in one step. One input only lights two middle neurons. What if A and B fire at the same step?",
          },
          {
            id: "stdp",
            t: "Grow a connection",
            d: "On the <b>Synapse trainer</b>, place spikes so the <b>Weight</b> reaches +3 or more.",
            hint: "Each pre spike followed one step later by a post spike adds 1. Avoid post just before pre.",
          },
          {
            id: "slope",
            t: "Feel the flat ground",
            d: "On the <b>Surrogate slope meter</b>, choose <b>k = 20</b> and move <b>a</b> until the slope reads <b>almost 0</b>.",
            hint: "A sharp surrogate only has a slope right at a = 0. Step a away from 0.",
          },
        ],
        build,
      });
      root.appendChild(
        pr(
          "l17-wlab-1",
          "In the spike relay, why did O stay silent when A and B fired at different steps? | Its spikes arrived 2 at a time, short of the 3 it needs | The middle neurons blocked the spikes coming from A | O can only fire once A has fired twice | Each input lights two middle neurons, so O only ever got 2 spikes per step. Firing A and B together delivers 4 at once.",
        ),
      );
      root.appendChild(
        pr(
          "l17-wlab-2",
          "With k = 20, the slope is large at a = 0 but almost 0 at a = 1. What does that mean for training? | Neurons not near their threshold barely get a learning signal | Training speeds up for every neuron in the network | The network stops producing spikes | A sharp surrogate behaves almost like the Dirac delta: a useful slope only right at the threshold. A smaller k spreads the signal wider.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>leak</b> means weak input never reaches the threshold; strong or bunched input still fires.",
            "Spikes <b>arriving together</b> push a neuron over its threshold where scattered ones fail.",
            "<b>STDP</b> grows a link when pre fires just before post, with no teacher.",
            "A sharp <b>surrogate</b> (large k) gives slope only near the threshold.",
          ],
          "Timing is everything in a spiking brain.",
        ),
      );
    },
  });

  L["l17-wlab"] = {
    sum: "Tune a leaky neuron to fire three times, relay spikes so a picky neuron fires, grow a synapse with STDP, and see where a sharp surrogate's slope vanishes.",
    steps: [
      {
        t: "The lab",
        b: `<p>Four cards, one little rover. Pip's brain is made of <b>leaky</b> spiking neurons joined by <b>synapses</b> that learn from <b>spike timing</b>. You'll tune a neuron, wake a picky one, grow a link and test the trick that lets backprop train spikes.</p>`,
        v: F.flow(["Tune a leak", "Relay spikes", "Grow a synapse", { t: "Test a surrogate", c: "teal" }]),
        c: C(
          "A neuron with a fast leak gets a very weak, steady input. What is most likely? | It never reaches the threshold, so it never fires | It fires on every single step | It fires once early on and then stops for good | The leak drains charge about as fast as the weak input adds it, so the charge levels off below the threshold.",
        ),
      },
      {
        t: "What to watch",
        b: `<p>Every number on the cards comes from the simulation: <b>spikes</b> counted over 20 steps, a network that passes spikes on one step at a time, a <b>weight</b> that moves +1 or −1 per pair, and the surrogate's <b>slope</b>.</p>`,
        v: F.cycle(["Charge builds", "Threshold: fire", "Spike travels", "Synapse adapts"]),
        c: C(
          "In the synapse trainer, post fires at step 4 and pre at step 5. What happens to the weight? | It goes down by 1 | It goes up by 1 | It stays the same | Post before pre is depression: the connection is weakened.",
        ),
      },
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();
