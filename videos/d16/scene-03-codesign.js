/* Lecture 16 (ds-16) · scene 3 (CO-DESIGN): what the word means (lesson 16.1). Hardware (purple, a chip) on the left,
   software (blue: an algorithm, an ML model, a library) on the right.
   Story (local seconds): 0.3 the two cards pop; 0.8 a purple arrow from Software over the top to Hardware draws, tag
   'hardware shaped by the software'; 3.6 a blue arrow back underneath, tag 'software tuned to the hardware', 4.4 grey tag
   'sometimes before the chip exists'; 6.8 both arrows are redrawn green into one closed loop, 7.6 a green 'co-design' sticker
   pops in the middle and the loop pulses. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const { ramp, flash, ease: E } = V;

  const T = { cards: 0.3, top: 0.8, bottom: 3.6, before: 4.4, loop: 6.8, word: 7.6 };
  const TOP = [[576, 250], [346, 250], -72];
  const BOT = [[346, 392], [576, 392], -72];

  V.scene({
    kicker: "CO-DESIGN",
    title: ["Hardware and software,", "made for each other"],
    dur: 11,
    caps: [
      [0.4, 3.4, "Hardware designed around the software it will run."],
      [3.6, 6.6, "Software tuned to make full use of that hardware."],
      [6.8, 10.6, "Both shaped by each other: hardware–software co-design."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const mk = (g, tone) => D16.arrow(svg, g[0], g[1], { tone, bow: g[2], w: 9, head: 26 });
      const top = mk(TOP, "purple");
      const bot = mk(BOT, "blue");
      const gTop = mk(TOP, "green");
      const gBot = mk(BOT, "green");
      const hw = D16.box(stage, {
        x: 186,
        y: 320,
        w: 300,
        h: 230,
        title: "Hardware",
        sub: "a chip",
        tone: "purple",
        icon: "chip",
        iconSize: 92,
      });
      const sw = D16.box(stage, {
        x: 744,
        y: 320,
        w: 336,
        h: 230,
        title: "Software",
        sub: "an algorithm, an ML model, a library",
        tone: "blue",
        icon: "code",
        iconSize: 80,
      });
      const tTop = D4.tag(stage, { x: 468, y: 118, text: "hardware shaped by the software", tone: "purple" });
      const tBot = D4.tag(stage, { x: 468, y: 530, text: "software tuned to the hardware", tone: "blue" });
      const tBefore = D4.tag(stage, { x: 468, y: 598, text: "sometimes before the chip exists", tone: "grey" });
      const word = D4.tag(stage, { x: 461, y: 321, text: "co-design", tone: "green", solid: true, fs: 36 });

      return (t) => {
        hw.set({ k: ramp(t, T.cards, T.cards + 0.5) });
        sw.set({ k: ramp(t, T.cards + 0.2, T.cards + 0.7) });
        const g = ramp(t, T.loop, T.loop + 0.8, E.inOut);
        top.set({ k: ramp(t, T.top, T.top + 0.8, E.inOut), o: 1 - ramp(t, T.loop + 0.6, T.loop + 1.0, E.lin) });
        bot.set({ k: ramp(t, T.bottom, T.bottom + 0.8, E.inOut), o: 1 - ramp(t, T.loop + 0.6, T.loop + 1.0, E.lin) });
        const pulse = 1 + 0.05 * flash(t, T.word + 0.4, T.word + 1.0) + 0.05 * flash(t, T.word + 1.8, T.word + 2.4);
        gTop.set({ k: g, s: pulse });
        gBot.set({ k: g, s: pulse });
        tTop.set({ k: ramp(t, T.top + 0.6, T.top + 1.0, E.lin) });
        tBot.set({ k: ramp(t, T.bottom + 0.6, T.bottom + 1.0, E.lin) });
        tBefore.set({ k: ramp(t, T.before + 0.4, T.before + 0.8, E.lin) });
        word.set({ k: ramp(t, T.word, T.word + 0.5), s: pulse });
      };
    },
  });
})();
