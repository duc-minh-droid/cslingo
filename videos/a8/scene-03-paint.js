/* Phase 8 · scene 03 paint (12 s): the paint picture of Diffie-Hellman (lesson 8.3). Alice and Bob start with the same PUBLIC paint,
   each adds a SECRET paint, they swap the mixtures along the open pipe, each adds their own secret to the mixture they received,
   and both hold the same colour. Eve sees both mixtures but cannot unmix paint. Paints are literal colours here (gold, rose, blue,
   a pot is the average of its paints); everything else keeps the video's roles (blue public, purple secret, red Eve).
   Every paint list comes from A8.PAINT (common.js); this file asserts it and lays it out.
   Story (local seconds): 0.2-1.0 Alice, Bob and the pipe; 1.0-1.8 the public pots; 3.4-4.0 the secret pots; 4.4-5.0 the secret drops
   rise into the pots, both mix; 5.8-7.0 the swap; 5.9-6.9 Eve and her copies; 7.7-8.3 the second drops, both pots turn the same tan
   and go purple (secret again); 8.8-9.3 the equals sign; 9.7 the purple key icon under it (the shared colour IS the key from scene 2);
   11.1-11.9 Eve tries to unmix each copy (a red arrow back towards the secret paint, stopped by a red cross); 12.0 her question mark.
   Colour exception, on purpose: the paints are literal CSLingo tokens (gold, rose, blue), so Alice's rose paint is the same red as
   Eve. The roles are carried by the frames and tags instead: purple dashed frame plus "secret" for the pots only their owner holds,
   red dashed frames for Eve's copies. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const { ramp, flash, ease: E } = V;

  const P = A8.PAINT;
  const sorted = (d) => d.slice().sort();
  A8.same("paint: the three paints", P.paints, { P: "gold", A: "rose", B: "blue" });
  A8.same(
    "paint: what travels is the public paint plus one secret",
    [P.mixA, P.mixB],
    [
      ["P", "A"],
      ["P", "B"],
    ],
  );
  A8.same("paint: Alice ends with Bob's mixture plus her own secret", sorted(P.finalAlice), sorted([...P.mixB, "A"]));
  A8.same("paint: Bob ends with Alice's mixture plus his own secret", sorted(P.finalBob), sorted([...P.mixA, "B"]));
  A8.same("paint: both end with the same paints", sorted(P.finalAlice), sorted(P.finalBob));
  A8.same("paint: Eve sees the public paint and the two mixtures", P.eveSees, [["P"], P.mixA, P.mixB]);

  const lin = E.lin;
  const AX = 110; // Alice's working spot (the left end of the pipe)
  const BX = 826; // Bob's working spot
  const WY = 190; // the pipe's centre line
  const SY = 380; // the secret pots, below the pipe
  const BEND = 46; // how far the two pots arc apart (up and down) so they pass without touching
  // times in local seconds. The swapped pots: Alice's mixture ends at Bob's spot (and becomes Bob's final colour), Bob's ends at Alice's
  const T = {
    people: 0.2,
    pipe: [0.3, 1.0],
    pubPot: 1.0,
    pubFrame: 1.3,
    pulse: [2.3, 2.8],
    secPot: 3.4,
    secFrame: 3.6,
    drop1: [4.4, 5.0],
    mix: 5.0,
    swap: [5.8, 7.0],
    eve: 5.9,
    eye: 6.1,
    copyL: 6.3,
    copyR: 6.55,
    drop2: [7.7, 8.3],
    final: 8.3,
    equals: 8.8,
    key: 9.7,
    undo: [11.1, 11.6],
    cross: 11.55,
    qmark: 12.0,
  };
  const pop = (t, a, d = 0.35) => ramp(t, a, a + d, lin);

  // the label under each working spot names the state of the paint there; each state pops in, and the last one stays
  const PHASES = [
    { text: "public", tone: "blue", at: 1.5, out: [4.2, 4.4] },
    { text: "mix", tone: "blue", at: 5.05, out: [5.75, 5.95] },
    { text: "received", tone: "blue", at: 6.9, out: [7.55, 7.75] },
    { text: "shared", tone: "purple", at: 8.5 },
  ];
  const spotLabel = (t) => {
    const p = PHASES.filter((x) => t >= x.at).pop();
    if (!p) return { k: 0 };
    return { text: p.text, tone: p.tone, k: pop(t, p.at, 0.3), o: p.out ? 1 - ramp(t, p.out[0], p.out[1], lin) : 1 };
  };

  // a drop of secret paint flies straight up from its secret pot into the working pot, then melts into it
  const flight = (t, [a, b], from, to) => {
    const p = A8.arc(from, to, ramp(t, a, b, E.inOut), 0);
    const end = ramp(t, b - 0.12, b, lin);
    return { x: p.x, y: p.y, s: 1 - 0.6 * end, o: ramp(t, a - 0.1, a, lin) * (1 - end) };
  };

  function build(stage) {
    // paint colours come from the page's tokens, so the colour facts are checked here (not at load)
    const fill = (d) => A8.paintRgb(d).fill;
    A8.must(fill(P.finalAlice) === fill(P.finalBob), "both end with the very same colour");
    A8.must(
      P.eveSees.every((d) => fill(d) !== fill(P.finalAlice)),
      "Eve never sees the final colour",
    );
    A8.must(fill(P.mixA) !== fill(P.mixB), "the two mixtures are different colours");

    const wire = A8.wire(stage, { x: 172, y: WY, w: 592, h: 176 });
    const wireTag = A8.tag(stage, { x: 468, y: 66, text: "the open wire" });

    // Eve's copy arrows sit under everything else
    const copyArrowL = A8.link(stage, {
      pts: [
        [390, 290],
        [390, 362],
      ],
      tone: "red",
      w: 5,
      head: 16,
    });
    const copyArrowR = A8.link(stage, {
      pts: [
        [546, 290],
        [546, 362],
      ],
      tone: "red",
      w: 5,
      head: 16,
    });

    const spotL = A8.tag(stage, { x: AX, y: 280, text: "public", tone: "blue" });
    const spotR = A8.tag(stage, { x: BX, y: 280, text: "public", tone: "blue" });
    const secTagL = A8.tag(stage, { x: AX, y: 466, text: "secret", tone: "purple" });
    const secTagR = A8.tag(stage, { x: BX, y: 466, text: "secret", tone: "purple" });
    const secL = A8.pot(stage, { x: AX, y: SY, r: 40 });
    const secR = A8.pot(stage, { x: BX, y: SY, r: 40 });

    const potA = A8.pot(stage, { x: AX, y: WY, r: 40 }); // Alice's: public, then her mixture, then it flies to Bob's spot
    const potB = A8.pot(stage, { x: BX, y: WY, r: 40 });
    const equals = A8.icon(stage, "equals", { x: 468, y: WY, tone: "green", disc: true, size: 64 });

    const eve = A8.person(stage, { who: "eve", x: 468, y: 578 });
    const eye = A8.icon(stage, "eye", { x: 468, y: 490, tone: "red" });
    const copyL = A8.pot(stage, { x: 390, y: 410, r: 32 });
    const copyR = A8.pot(stage, { x: 546, y: 410, r: 32 });
    const unknown = A8.icon(stage, "qmark", { x: 468, y: 410, tone: "red", size: 50 });
    // the shared colour is the key (scene 2's question answered); it hangs under the equals sign, off the open wire
    const shareKey = A8.icon(stage, "key", { x: 468, y: 334, tone: "purple", size: 96 });
    // Eve's attempt to unmix: an arrow from each copy back towards the secret paint, stopped by a red cross
    const undoL = A8.link(stage, {
      pts: [
        [336, 410],
        [214, 410],
      ],
      tone: "red",
      w: 5,
      head: 16,
    });
    const undoR = A8.link(stage, {
      pts: [
        [600, 410],
        [722, 410],
      ],
      tone: "red",
      w: 5,
      head: 16,
    });
    const crossL = A8.icon(stage, "cross", { x: 275, y: 410, tone: "red", size: 50, disc: true });
    const crossR = A8.icon(stage, "cross", { x: 661, y: 410, tone: "red", size: 50, disc: true });

    const dropA1 = A8.drop(stage, { x: AX, y: SY, r: 18, paint: "A" });
    const dropB1 = A8.drop(stage, { x: BX, y: SY, r: 18, paint: "B" });
    const dropA2 = A8.drop(stage, { x: AX, y: SY, r: 18, paint: "A" });
    const dropB2 = A8.drop(stage, { x: BX, y: SY, r: 18, paint: "B" });

    const alice = A8.person(stage, { who: "alice", x: 52, y: 50 });
    const bob = A8.person(stage, { who: "bob", x: 884, y: 50, name: "left" });

    const hereA = { x: AX, y: WY };
    const hereB = { x: BX, y: WY };
    const secA = { x: AX, y: SY };
    const secB = { x: BX, y: SY };

    return (t) => {
      alice.set({ k: pop(t, T.people, 0.5) });
      bob.set({ k: pop(t, T.people + 0.1, 0.5) });
      wire.set({ k: ramp(t, ...T.pipe) });
      wireTag.set({ k: pop(t, 0.8) });

      // the pots: public gold, then mixed, then swapped, then topped up with the other secret
      const swap = ramp(t, ...T.swap, E.inOut);
      const mixA = t < T.mix ? ["P"] : t < T.final ? P.mixA : P.finalBob;
      const mixB = t < T.mix ? ["P"] : t < T.final ? P.mixB : P.finalAlice;
      const kick = 1 + 0.15 * Math.max(flash(t, T.mix, T.mix + 0.4), flash(t, T.final, T.final + 0.4));
      const pulse = 1 + 0.08 * flash(t, ...T.pulse);
      const frame = t < T.final ? "blue" : "purple";
      // the blue frames let go while the pots are on the open wire (so two frames never overlap) and come back on arrival
      const away = ramp(t, T.swap[0], T.swap[0] + 0.25, lin) * (1 - ramp(t, T.swap[1] - 0.25, T.swap[1], lin));
      const frameK = ramp(t, T.pubFrame, T.pubFrame + 0.4, lin) * (1 - away);
      // they never touch: Alice's pot arcs up, Bob's arcs down
      const posA = A8.arc(hereA, hereB, swap, BEND);
      const posB = A8.arc(hereB, hereA, swap, -BEND);
      potA.set({ drops: mixA, frame, frameK, k: pop(t, T.pubPot, 0.5), s: kick * pulse, ...posA });
      potB.set({ drops: mixB, frame, frameK, k: pop(t, T.pubPot + 0.1, 0.5), s: kick * pulse, ...posB });
      spotL.set(spotLabel(t));
      spotR.set(spotLabel(t));

      // the secret pots stay full all the way through
      const secK = ramp(t, T.secFrame, T.secFrame + 0.4, lin);
      secL.set({ drops: ["A"], frame: "purple", frameK: secK, k: pop(t, T.secPot, 0.5) });
      secR.set({ drops: ["B"], frame: "purple", frameK: secK, k: pop(t, T.secPot + 0.1, 0.5) });
      secTagL.set({ k: pop(t, 3.9, 0.3) });
      secTagR.set({ k: pop(t, 4.0, 0.3) });

      // the secret drops: first into the pots they each own, then into the mixture they received
      dropA1.set(flight(t, T.drop1, secA, hereA));
      dropB1.set(flight(t, T.drop1, secB, hereB));
      dropA2.set(flight(t, T.drop2, secA, hereA));
      dropB2.set(flight(t, T.drop2, secB, hereB));

      // Eve sees both mixtures but cannot take a paint out of a mix
      eve.set({ k: pop(t, T.eve, 0.3) });
      eye.set({ k: pop(t, T.eye, 0.3) });
      copyArrowL.set({ k: ramp(t, T.copyL - 0.2, T.copyL + 0.1, lin) });
      copyArrowR.set({ k: ramp(t, T.copyR - 0.2, T.copyR + 0.1, lin) });
      copyL.set({ drops: P.eveSees[1], frame: "red", k: pop(t, T.copyL, 0.4) });
      copyR.set({ drops: P.eveSees[2], frame: "red", k: pop(t, T.copyR, 0.4) });

      equals.set({ k: pop(t, T.equals, 0.4) });
      shareKey.set({ k: pop(t, T.key, 0.4), s: 1 + 0.1 * flash(t, T.key + 0.3, T.key + 0.7) });
      undoL.set({ k: ramp(t, ...T.undo) });
      undoR.set({ k: ramp(t, ...T.undo) });
      crossL.set({ k: pop(t, T.cross, 0.3), draw: ramp(t, T.cross, T.cross + 0.3, lin) });
      crossR.set({ k: pop(t, T.cross + 0.1, 0.3), draw: ramp(t, T.cross + 0.1, T.cross + 0.4, lin) });
      const u = ramp(t, T.qmark, T.qmark + 0.5, lin);
      unknown.set({ k: pop(t, T.qmark, 0.3), dx: 6 * Math.sin(u * Math.PI * 6) * (1 - u) });
    };
  }

  V.scene({
    kicker: "SHARED SECRET",
    title: ["Mix paint in public,", "share a secret colour"],
    dur: 13.4,
    caps: [
      [1.2, 3.4, "Both start with the same public paint."],
      [3.6, 5.8, "Each adds a secret paint of their own."],
      [6.0, 8.0, "They swap the mixtures. Eve can see those."],
      [8.0, 9.6, "Each adds their own secret again: the very same colour."],
      [9.7, 11.0, "That colour is their shared key."],
      [11.1, 13.2, "Eve cannot unmix paint to find a secret."],
    ],
    build,
  });
})();
