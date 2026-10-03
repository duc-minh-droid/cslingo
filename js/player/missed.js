/* Full-screen lesson player (Duolingo-style).
   One screen at a time, fixed footer: pick → CHECK → green/red sheet → CONTINUE.
   Sessions:
     NIC.player.open(mod, {home})      lesson: steps (+ quick checks) → Try it (demo + checklist) → predicts → mistakes → recap → complete → streak
                                       boss:   intro → questions → results → complete
     NIC.player.practice({home})       mixed review of missed questions + quick checks from finished lessons
     NIC.player.revise({home, n, subjects})  shuffled revision deck from NIC.bank (finished sessions); answers update the Leitner boxes
   Content is never re-authored: steps come from NIC.LESSONS, predicts/takeaways/demo are lifted out of mod.render(). */
(function () {
  const pl = (NIC.shared.enginePlayer = NIC.shared.enginePlayer || {});

  const N = NIC,
    { store } = N;
  const fx = () => N.fx,
    game = () => N.game;
  const sound = (n) => N.sfx && N.sfx.play(n);
  const T = () => N.QUIZ_TYPES;
  const PRAISE = [
    "Nice!",
    "Awesome!",
    "Spot on!",
    "Great job!",
    "Excellent!",
    "You got it!",
    "Brilliant!",
    "Nailed it!",
  ];
  const CHEER = ["happy", "laugh", "love", "wink"];
  const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
  const stripTags = (h) => String(h).replace(/<[^>]+>/g, "");
  const reduce = () => fx() && fx().reduce();

  const IC = {
    back: `<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    retry: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M8 12a4 4 0 1 0 1.2-2.85M8 7.5v2.4h2.4" fill="none" stroke="var(--bg)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    x: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
    ok: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#58cc02" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    no: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M8 8l8 8M16 8l-8 8" stroke="#ff4b4b" stroke-width="3.2" stroke-linecap="round"/></svg>`,
    bolt: `<svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#ffc800" stroke="#ff9600" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    target: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#58cc02" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#58cc02"/></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#1cb0f6" stroke-width="3"/><path d="M12 7v5l3 2" stroke="#1cb0f6" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
    book: `<svg viewBox="0 0 24 24"><path d="M4 5c3-1 5.5-.6 8 1.4V20c-2.5-2-5-2.4-8-1.4zM20 5c-3-1-5.5-.6-8 1.4V20c2.5-2 5-2.4 8-1.4z" fill="currentColor"/></svg>`,
  };

  // ---------- missed-question store (feeds Practice) ----------
  const missed = {
    all: () => store.get("nic.missed", []),
    add(k, ref) {
      const a = missed.all().filter((x) => x.k !== k);
      a.push({ k, ...ref });
      store.set("nic.missed", a.slice(-60));
    },
    drop(k) {
      store.set(
        "nic.missed",
        missed.all().filter((x) => x.k !== k),
      );
    },
  };

  pl.S = null;
  Object.assign(pl, { CHEER, IC, PRAISE, T, fx, game, missed, pickOne, reduce, sound, stripTags });
})();
