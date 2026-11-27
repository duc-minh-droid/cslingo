/* l17-02: Lecture 17 lessons 17.1 to 17.3: why robots want a different brain, talking in spikes (coding), and the leaky neuron with spike propagation. Figures and demos come from l17-01.js (NIC.shared.nicL17). */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL17;
  const { C, pr, raster, encode, popCode, POP, archFig, trace, lif, propFig, encDemo, lifDemo } = sh;

  // ---------- 17.1 why a different brain (no demo) ----------
  N.register({
    id: "l17-why",
    lecture: 17,
    order: 1,
    num: "17.1",
    title: "A brain for a tiny robot",
    blurb: "Pip the garden rover runs on a coin battery. Why an ordinary neural network is the wrong brain for it.",
    render(root) {
      root.appendChild(header(this, "Robots, batteries and a brain that talks in spikes."));
      root.appendChild(
        takeaways(
          [
            "Robots read <b>high-dimensional</b>, <b>sparse</b> sensor data and must react with <b>low latency</b> and little <b>energy</b>.",
            "Conventional ANNs are <b>slow and costly to train</b>, have <b>high latency</b> and are <b>energy hungry</b>.",
            "<b>Spiking neural networks</b> send discrete <b>spikes over time</b>: more <b>biologically plausible</b>, and <b>sparse</b>, so low power.",
          ],
          "Spikes only when something happens: that is where the energy saving comes from.",
        ),
      );
    },
  });

  L["l17-why"] = {
    sum: "Robots need energy-efficient, low-latency processing of sparse sensor data and must adapt as they go. Conventional ANNs are costly to train, slow to respond and energy hungry; spiking neural networks transmit discrete spikes over time and only work when needed.",
    steps: [
      {
        t: "Meet Pip",
        b: `<p>Meet <b>Pip</b>, a palm-sized rover that patrols a garden on one coin battery. It has whiskers, a light sensor and a tiny microphone.</p><p>Like any robot, Pip must <b>perceive</b> its world through lots of sensor readings at once (<b>high-dimensional</b> data), react quickly (<b>low latency</b>), sip power (<b>energy efficient</b>) and <b>learn to adapt</b> when the garden changes. Most of the time nothing happens, so its data is <b>sparse</b> and full of repeats.</p>`,
        v: F.flow(["Whiskers, light, sound", "Pip's brain", { t: "Turn, stop, go", c: "teal" }]),
      },
      {
        t: "The wrong brain for the job",
        b: `<p>Lecture 16 built <b>artificial neural networks</b>: every neuron passes a number on, every step, whether anything changed or not. Picture a shop that keeps every light on all night in case a customer comes.</p><p>For Pip that hurts. Conventional ANNs are <b>time consuming and expensive to train</b>, have <b>high latency</b>, and are <b>energy hungry</b>. The coin battery would be flat by lunch.</p>`,
        v: F.compare(
          {
            title: "Conventional ANN",
            c: "rose",
            body: "Every neuron computes every step<br>Costly to train<br>High latency, energy hungry",
          },
          {
            title: "What Pip needs",
            c: "teal",
            body: "Work only when something happens<br>Quick reactions<br>Low power, learns on the go",
          },
        ),
        c: C(
          "Why is a conventional neural network a poor fit for Pip's coin battery? | It is energy hungry: every neuron computes all the time | It cannot handle more than one sensor at a time | It only works on images, not sound or touch | The lecture lists ANNs as energy hungry, slow to respond and costly to train. They can read many sensors; the problem is the cost.",
        ),
      },
      {
        t: "Talk only when there's news",
        b: `<p>Your brain doesn't hum along at full power: a neuron stays quiet and sends a brief electrical <b>spike</b> only when it has something to say.</p><p>A <b>spiking neural network</b> (SNN) copies that. It sends <b>discrete spikes over time</b>, which makes it more <b>biologically plausible</b> and good at <b>sequential, time-varying</b> data. Neurons work only when needed (<b>sparse</b> processing), so it can run on very <b>low power</b>. Uses: robotics, speech recognition, sensory processing.</p>`,
        v: raster([
          { lab: "ANN neuron", s: Array(20).fill(true), c: "rose" },
          { lab: "SNN neuron", s: encode(3, "rate"), c: "teal" },
        ]),
        c: C(
          "Where does an SNN's energy saving come from? | Neurons only spike when needed, so most stay quiet | Its spikes carry larger numbers than an ANN's outputs | It skips the time dimension and answers in one step | Sparse processing: neurons are only activated when necessary, which is what enables low-power computing.",
        ),
      },
    ],
  };

  // ---------- 17.2 talking in spikes (demo) ----------
  N.register({
    id: "l17-codes",
    lecture: 17,
    order: 2,
    num: "17.2",
    title: "Morse code for neurons",
    blurb: "A spike is just a blip. How a train of blips can carry 'bright light', 'loud noise' or 'gentle bump'.",
    render(root) {
      root.appendChild(
        header(
          this,
          "Pip's light sensor turned into spikes. Slide the <b>light strength</b> and switch the <b>coding</b>.",
        ),
      );
      encDemo(root);
      root.appendChild(
        pr(
          "l17-codes-1",
          "Switch to <b>Temporal</b> and slide the light from dim to bright. What changes? | The single spike arrives earlier | More and more spikes appear | The spike gets taller | In temporal coding the message is the timing: a stronger input fires sooner. Spikes never get taller; every spike is the same blip.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>spike train</b> is a neuron's sequence of spikes over time; every neuron receives and emits them.",
            "<b>Rate coding</b>: how many spikes. <b>Temporal coding</b>: when they come.",
            "<b>Population coding</b>: the message is spread across which neurons of a group fire.",
          ],
          "Count them, time them, or see who's talking.",
        ),
      );
    },
  });

  L["l17-codes"] = {
    sum: "Each neuron receives and emits spikes; its sequence of spikes over time is a spike train. Information is encoded in spike rates (rate coding), spike timing (temporal coding) or across a group of neurons (population coding).",
    steps: [
      {
        t: "A blip in time",
        b: `<p>Think of a smoke alarm's chirp: a short blip, all the same size. What matters is how often and when it chirps.</p><p>An SNN neuron's spike is like that. Its run of spikes over time is a <b>spike train</b>. Every neuron <b>receives</b> spike trains from others and <b>emits</b> its own. Here Pip's three sensors feed one neuron, which answers with a train of its own.</p>`,
        v: () => archFig(),
        c: C(
          "What is a spike train? | One neuron's sequence of spikes over time | A chain of neurons wired one after another | One very large spike that carries a number | A spike train is the timeline of a single neuron's spikes. Every spike is the same blip; the pattern in time carries the message.",
        ),
      },
      {
        t: "Count the spikes",
        b: `<p>Imagine a friend tapping the table faster the more excited they are. You don't need to see the taps' size, just how many per second.</p><p>That is <b>rate coding</b>: a stronger signal means <b>more spikes</b> in the same time. Dim light gives Pip a few spikes; bright light, a busy train.</p><details class="math-more"><summary>Show the maths</summary><p>The rate over a window of length $\\Delta t$ is $r = n_{\\text{spikes}}/\\Delta t$. In the demo, strength $s$ out of 10 gives exactly $s$ evenly spaced spikes in 20 steps.</p></details>`,
        v: raster([
          { lab: "dim (2)", s: encode(2, "rate") },
          { lab: "medium (5)", s: encode(5, "rate") },
          { lab: "bright (9)", s: encode(9, "rate") },
        ]),
      },
      {
        t: "Time the spikes",
        b: `<p>In a sprint, the fastest runner crosses the line first. You learn who's quickest from <b>when</b> they arrive, not how often.</p><p><b>Temporal coding</b> puts the message in <b>spike timing</b>: a strong input fires early, a weak one late. One well-timed spike can be enough, which saves even more energy.</p>`,
        v: raster([
          { lab: "dim (2)", s: encode(2, "temporal") },
          { lab: "medium (5)", s: encode(5, "temporal") },
          { lab: "bright (9)", s: encode(9, "temporal") },
        ]),
        c: C(
          "Two light readings each produce exactly one spike, one at step 3 and one at step 15. Under temporal coding, which was brighter? | The one that spiked at step 3 | The one that spiked at step 15 | Neither: one spike each means they were equal | In temporal coding the timing is the message: stronger inputs fire earlier. Counting spikes is rate coding.",
        ),
      },
      {
        t: "Ask the whole team",
        b: `<p>A choir sings a chord: no single voice tells you the chord, but which voices are singing does.</p><p><b>Population coding</b> spreads the message across a <b>group of neurons</b>. Each one prefers a range of strengths, so the pattern of <b>who is busy</b> says how bright the light is. Here strength 7 wakes the neurons that like 5, 7.5 and 10.</p>`,
        v: raster(popCode(7).map((s, i) => ({ lab: `likes ${POP[i]}`, s }))),
      },
    ],
    guide: [
      "Slide <b>Light strength</b> from 0 to 10 with <b>Rate</b> on and count the spikes.",
      "Switch to <b>Temporal</b> and watch where the single spike lands.",
      "Try <b>Population</b> and see which neurons wake up.",
      "Answer the question after the demo.",
    ],
  };

  // ---------- 17.3 the leaky neuron and propagation (demo) ----------
  N.register({
    id: "l17-neuron",
    lecture: 17,
    order: 3,
    num: "17.3",
    title: "A leaky bucket that fires",
    blurb:
      "Charge builds up, leaks away, and at the threshold: a spike. Then watch spikes ripple through a small network.",
    render(root) {
      root.appendChild(
        header(this, "One spiking neuron fed a steady drip of input. Change the <b>input</b> and the <b>leak</b>."),
      );
      lifDemo(root);
      root.appendChild(
        pr(
          "l17-neuron-1",
          "Choose <b>Fast leak</b> and set the input to <b>0.20</b>. What does the neuron do over 20 steps? | It never fires: the leak keeps pace with the input | It fires once, right at the very end of the 20 steps | It fires on every step | With a fast leak the charge levels off below the threshold, so it never spikes. With no leak the same drip would fire 4 times.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A neuron's <b>charge accumulates over time</b>, from inputs or from other neurons' spikes.",
            "At the <b>threshold</b> it <b>fires</b>, sends a spike down every outgoing connection, and starts again.",
            "<b>Leakage</b>: charge below the threshold drains away, so weak or old input fades.",
          ],
          "Fill, leak, fire, reset.",
        ),
      );
    },
  });

  L["l17-neuron"] = {
    sum: "A spiking neuron's charge accumulates over time from inputs or other neurons. When it reaches a threshold the neuron fires and emits a spike along each outgoing connection; below-threshold charge leaks away. Spikes then propagate through the network step by step.",
    steps: [
      {
        t: "A bucket under a tap",
        b: `<p>Picture a bucket under a dripping tap. Each drop adds a little water.</p><p>A spiking neuron holds a <b>charge</b> like that bucket. The charge <b>accumulates over time</b>, either from input signals (Pip's whiskers) or from spikes sent by other neurons. Nothing leaves the neuron yet: it is just filling up.</p>`,
        v: trace(lif(0.12, 0, 1, 8)),
      },
      {
        t: "Over the brim: fire!",
        b: `<p>When the bucket overflows, it tips and empties in one splash.</p><p>When the charge reaches the <b>threshold</b>, the neuron <b>fires</b>: it emits a spike along <b>each</b> of its outgoing connections, then its charge resets and it starts filling again. Steady input gives a steady rhythm of spikes.</p>`,
        v: trace(lif(0.25, 0)),
        c: C(
          "A neuron's charge reaches its threshold. What happens next? | It fires a spike down every outgoing connection and resets | It sends its charge value to one chosen neighbour | It keeps the charge and waits for the next step | Reaching the threshold makes it fire along each outgoing connection, then the charge starts again from zero.",
        ),
      },
      {
        t: "A hole in the bucket",
        b: `<p>Now drill a small hole in the bucket. A slow drip drains out as fast as it comes in, and the bucket never overflows.</p><p>That is <b>leakage</b>: charge that stays <b>below the threshold</b> slowly <b>dissipates over time</b>. Only input that arrives strongly or close together tips the neuron over. Old, weak signals fade, which keeps Pip from reacting to stray rustles.</p><details class="math-more"><summary>Show the maths</summary><p>A simple leaky integrate-and-fire update (an illustration; the lecture describes it in words):</p>$$v_{t} = (1-\\lambda)\\,v_{t-1} + I_t,\\qquad v_t \\ge \\theta \\Rightarrow \\text{spike},\\ v_t \\leftarrow 0$$<p>$\\lambda$ is the leak, $I_t$ the input and $\\theta$ the threshold. With steady input $I$ the charge levels off at $I/\\lambda$, so it fires only if $I/\\lambda > \\theta$.</p></details>`,
        v: trace(lif(0.2, 0.3)),
        c: C(
          "Pip's whisker brushes a leaf once, then nothing for a long time. With leakage, what happens to the charge it added? | It drains away, so the neuron may never fire | It stays in the neuron until the next brush | It is passed on to the next neuron at once | Below-threshold charge dissipates over time. One faint touch fades; a burst of touches close together can still reach the threshold.",
        ),
      },
      {
        t: "Ripples through the network",
        b: `<p>Drop pebbles in a pond and the ripples spread outwards, one ring after another.</p><p>Spikes <b>propagate</b> the same way. At t = 1 input A fires; one step later both of its neighbours fire. Neuron O needs <b>three</b> spikes at once to reach its threshold, so it only fires when A's <b>and</b> B's neighbours fire together. Slide through the time steps.</p>`,
        v: (b) => propFig(b),
      },
    ],
    guide: [
      "Slide <b>Input per step</b> and count the spikes with <b>No leak</b>.",
      "Switch to <b>Fast leak</b> and find the smallest input that still fires.",
      "Answer the question after the demo.",
    ],
  };
})();
