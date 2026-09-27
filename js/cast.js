/* The mascot cast. One shared SVG rig (feet, arms, body, face, accessory slots) re-skinned per character,
   so every character gets every expression, accessory and silly action.
     NIC.mascot({who, size, mood, acc:[...], act, cls, poke})  → HTML string
     NIC.mascotReact(el, mood)                                  → swap expression + one-shot motion
     NIC.cast.surprise(el)                                      → random short idle gag
     NIC.feedback(box, "ok"|"no"|"retry", html, animate)        → mascot + bubble feedback row (non-player pages)
   Idle loops are CSS (css/cast.css) so reduced motion can drop them. */
(function () {
  const INK = "#3c3c3c";

  // ---------- characters ----------
  const CHARS = {
    sprout: {
      name: "Sprout", body: "#58cc02", belly: "#89e219", limb: "#58a700", foot: "#ff9600", hy: 0, hs: 1,
      shape: "M60 26 C90 26 106 48 106 72 C106 96 88 110 60 110 C32 110 14 96 14 72 C14 48 30 26 60 26Z",
      bellyEl: `<ellipse cx="60" cy="88" rx="28" ry="18" fill="#89e219"/>`,
      top: `<g class="m-top m-leaf"><path d="M60 30 C60 22 60 18 61 12" stroke="#58a700" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M61 14 C50 2 34 6 32 14 C42 20 54 20 61 14Z" fill="#58a700"/><path d="M61 14 C70 0 88 2 92 10 C82 19 68 20 61 14Z" fill="#89e219"/></g>`,
    },
    pebble: {
      name: "Pebble", body: "#1cb0f6", belly: "#7fd6ff", limb: "#1899d6", foot: "#ffc800", hy: -12, hs: 0.8,
      shape: "M60 12 C66 26 104 50 104 78 C104 98 86 110 60 110 C34 110 16 98 16 78 C16 50 54 26 60 12Z",
      bellyEl: `<ellipse cx="60" cy="90" rx="26" ry="16" fill="#7fd6ff"/>`,
      top: `<g class="m-top m-wobble"><circle cx="83" cy="22" r="4" fill="#7fd6ff"/><circle cx="92" cy="32" r="2.6" fill="#7fd6ff"/></g>`,
    },
    byte: {
      name: "Byte", body: "#ce82ff", belly: "#f4e6ff", limb: "#a560e8", foot: "#777777", hy: 4, hs: 1.05,
      shape: "M26 34 H94 A14 14 0 0 1 108 48 V92 A18 18 0 0 1 90 110 H30 A18 18 0 0 1 12 92 V48 A14 14 0 0 1 26 34Z",
      bellyEl: `<rect x="40" y="92" width="40" height="12" rx="5" fill="#f4e6ff"/><rect x="45" y="96" width="8" height="4" rx="2" fill="#58cc02"/><rect x="56" y="96" width="8" height="4" rx="2" fill="#ffc800"/><rect x="67" y="96" width="8" height="4" rx="2" fill="#ff4b4b"/>`,
      top: `<g class="m-top"><path d="M60 34 V18" stroke="#a560e8" stroke-width="4" stroke-linecap="round"/><circle class="m-bulb" cx="60" cy="14" r="6" fill="#ffc800"/></g>`,
    },
    blaze: {
      name: "Blaze", body: "#ff9600", belly: "#ffc800", limb: "#cd7900", foot: "#ff4b4b", hy: -14, hs: 0.78,
      shape: "M60 6 C70 26 98 40 102 70 C106 96 86 110 60 110 C34 110 14 96 18 70 C20 52 34 44 38 28 C44 38 48 42 53 43 C50 28 53 16 60 6Z",
      bellyEl: `<path class="m-inner" d="M60 50 C66 62 84 70 84 88 C84 102 74 108 60 108 C46 108 36 102 36 88 C36 76 46 72 50 62 C54 68 57 70 60 70 C58 62 58 56 60 50Z" fill="#ffc800"/>`,
      top: "",
    },
    chip: {
      name: "Chip", body: "#ffc800", belly: "#fff1a8", limb: "#e5a800", foot: "#ff9600", hy: 0, hs: 0.95,
      shape: "M60 28 C88 28 104 48 104 72 C104 96 86 110 60 110 C34 110 16 96 16 72 C16 48 32 28 60 28Z",
      bellyEl: `<ellipse cx="60" cy="92" rx="24" ry="14" fill="#fff1a8"/>`,
      top: `<g class="m-top m-tuft"><path d="M58 30 C54 20 56 14 60 10 C60 18 62 24 62 30Z" fill="#e5a800"/><path d="M60 30 C62 20 68 16 74 16 C70 22 66 26 64 31Z" fill="#e5a800"/><path d="M58 31 C54 24 48 20 44 21 C48 26 52 29 56 32Z" fill="#e5a800"/></g>`,
      nose: `<path d="M54 73 L60 69 L66 73 L60 78Z" fill="#ff9600"/>`,
    },
    berry: {
      name: "Berry", body: "#ff4b4b", belly: "#ffb2b2", limb: "#ea2b2b", foot: "#ffb2b2", hy: -2, hs: 0.95,
      shape: "M60 32 C92 30 108 46 104 66 C100 90 80 110 60 112 C40 110 20 90 16 66 C12 46 28 30 60 32Z",
      bellyEl: [[30, 50], [90, 50], [24, 74], [96, 74], [36, 96], [84, 96], [60, 104], [48, 104], [72, 104]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="#ffe28a"/>`).join(""),
      top: `<g class="m-top m-leaf"><path d="M60 36 L48 24 L58 30 L54 16 L62 28 L70 16 L66 30 L76 24 Z" fill="#58cc02"/><path d="M60 28 V18" stroke="#58a700" stroke-width="3.5" stroke-linecap="round"/></g>`,
    },
  };

  // ---------- accessories (hat base sits on y≈32, centred on x=60) ----------
  const ACC = {
    party: { slot: "hat", name: "Party hat", svg: `<path d="M44 34 L60 -4 L76 34Z" fill="#ce82ff"/><path d="M50 20 L70 20 M47 27 L73 27 M54 11 L66 11" stroke="#ffc800" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="-5" r="5" fill="#ffc800"/>` },
    propeller: { slot: "hat", name: "Propeller cap", svg: `<path d="M36 34 Q60 4 84 34Z" fill="#ffc800"/><path d="M60 8 Q48 14 44 34 H52 Q54 16 60 8Z" fill="#ff4b4b"/><path d="M60 8 Q72 14 76 34 H68 Q66 16 60 8Z" fill="#1cb0f6"/><rect x="30" y="31" width="30" height="5" rx="2.5" fill="#e5a800"/><path d="M60 8 V2" stroke="#4b4b4b" stroke-width="3"/><g class="a-prop"><ellipse cx="50" cy="1" rx="11" ry="3" fill="#ff4b4b"/><ellipse cx="70" cy="1" rx="11" ry="3" fill="#1cb0f6"/></g><circle cx="60" cy="1" r="3" fill="#4b4b4b"/>` },
    chef: { slot: "hat", name: "Chef hat", svg: `<circle cx="46" cy="14" r="10" fill="#fff" stroke="#e5e5e5" stroke-width="2"/><circle cx="74" cy="14" r="10" fill="#fff" stroke="#e5e5e5" stroke-width="2"/><circle cx="60" cy="7" r="12" fill="#fff" stroke="#e5e5e5" stroke-width="2"/><rect x="42" y="16" width="36" height="18" rx="3" fill="#fff" stroke="#e5e5e5" stroke-width="2"/>` },
    wizard: { slot: "hat", name: "Wizard hat", svg: `<path d="M38 32 Q52 8 72 -16 Q66 6 82 32Z" fill="#1899d6"/><ellipse cx="60" cy="33" rx="28" ry="5" fill="#1cb0f6"/><path d="M56 16 l2 4 4 .6 -3 3 .8 4 -3.8-2 -3.8 2 .8-4 -3-3 4-.6z" fill="#ffc800"/><circle cx="68" cy="4" r="2" fill="#ffc800"/><circle cx="48" cy="26" r="1.6" fill="#ffc800"/>` },
    crown: { slot: "hat", name: "Crown", svg: `<path d="M40 34 L42 12 L52 22 L60 4 L68 22 L78 12 L80 34Z" fill="#ffc800" stroke="#e5a800" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="24" r="3.5" fill="#ff4b4b"/><circle cx="48" cy="28" r="2.5" fill="#1cb0f6"/><circle cx="72" cy="28" r="2.5" fill="#58cc02"/>` },
    beanie: { slot: "hat", name: "Beanie", svg: `<path d="M36 34 Q60 0 84 34Z" fill="#ff4b4b"/><rect x="34" y="28" width="52" height="9" rx="4.5" fill="#ea2b2b"/><path d="M46 20 V28 M54 14 V28 M62 12 V28 M70 16 V28" stroke="#ea2b2b" stroke-width="2"/><circle class="a-pom" cx="60" cy="4" r="6" fill="#fff"/>` },
    viking: { slot: "hat", name: "Viking helmet", svg: `<path d="M38 34 Q60 2 82 34Z" fill="#afafaf"/><rect x="36" y="29" width="48" height="7" rx="3" fill="#8f8f8f"/><path d="M40 26 C30 22 26 10 30 0 C34 10 38 14 44 18Z" fill="#fff1d6" stroke="#cd7900" stroke-width="1.5"/><path d="M80 26 C90 22 94 10 90 0 C86 10 82 14 76 18Z" fill="#fff1d6" stroke="#cd7900" stroke-width="1.5"/><circle cx="60" cy="18" r="3" fill="#8f8f8f"/>` },
    nightcap: { slot: "hat", name: "Nightcap", svg: `<path d="M36 34 Q44 6 70 6 Q92 8 98 34 Q90 20 78 18 Q84 26 84 34Z" fill="#84d8ff"/><path d="M44 22 L78 20 M40 30 L84 30" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="34" y="30" width="52" height="7" rx="3.5" fill="#1cb0f6"/><circle class="a-pom" cx="98" cy="36" r="6" fill="#fff"/>` },
    detective: { slot: "hat", name: "Detective hat", svg: `<path d="M36 34 Q60 4 84 34Z" fill="#a0722d"/><path d="M28 36 Q40 30 52 34 L50 38 Q38 36 28 36Z" fill="#8a5f22"/><path d="M92 36 Q80 30 68 34 L70 38 Q82 36 92 36Z" fill="#8a5f22"/><path d="M40 28 H80" stroke="#6b4818" stroke-width="3"/><path d="M50 18 L70 18 M46 24 L74 24" stroke="#8a5f22" stroke-width="1.5"/>` },
    tophat: { slot: "hat", name: "Top hat", svg: `<rect x="44" y="0" width="32" height="32" rx="3" fill="#3c3c3c"/><rect x="44" y="22" width="32" height="6" fill="#ff4b4b"/><ellipse cx="60" cy="33" rx="26" ry="5" fill="#3c3c3c"/>` },
    shades: { slot: "face", name: "Sunglasses", svg: `<rect x="29" y="53" width="30" height="18" rx="7" fill="#3c3c3c"/><rect x="61" y="53" width="30" height="18" rx="7" fill="#3c3c3c"/><path d="M59 58 H61" stroke="#3c3c3c" stroke-width="4"/><path d="M34 57 L42 57" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/><path d="M66 57 L74 57" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>` },
    monocle: { slot: "face", name: "Monocle", svg: `<circle cx="76" cy="62" r="16" fill="none" stroke="#ffc800" stroke-width="3.5"/><path d="M90 70 Q96 86 90 100" fill="none" stroke="#ffc800" stroke-width="2"/>` },
    moustache: { slot: "face", name: "Moustache", svg: `<path d="M60 76 C54 70 44 70 38 78 C44 76 48 80 54 80 C57 80 59 78 60 77 C61 78 63 80 66 80 C72 80 76 76 82 78 C76 70 66 70 60 76Z" fill="#6b4818"/>` },
    hearts: { slot: "face", name: "Heart glasses", svg: `<path d="M44 72 C30 62 32 50 40 50 C44 50 44 54 44 54 C44 54 44 50 48 50 C56 50 58 62 44 72Z" fill="#ff86a0" stroke="#ff4b4b" stroke-width="2.5"/><path d="M76 72 C62 62 64 50 72 50 C76 50 76 54 76 54 C76 54 76 50 80 50 C88 50 90 62 76 72Z" fill="#ff86a0" stroke="#ff4b4b" stroke-width="2.5"/><path d="M56 58 H64" stroke="#ff4b4b" stroke-width="3"/>` },
    bowtie: { slot: "neck", name: "Bow tie", svg: `<path d="M60 100 L44 92 L44 108Z" fill="#ff4b4b"/><path d="M60 100 L76 92 L76 108Z" fill="#ff4b4b"/><circle cx="60" cy="100" r="4.5" fill="#ea2b2b"/>` },
    scarf: { slot: "neck", name: "Scarf", svg: `<path d="M24 94 Q60 106 96 94 L96 102 Q60 114 24 102Z" fill="#1cb0f6"/><path d="M76 100 L82 122 L92 120 L86 98Z" fill="#1cb0f6"/><path d="M36 99 L36 106 M50 102 L50 109 M64 103 L64 110 M80 121 L90 119" stroke="#fff" stroke-width="3"/>` },
    headphones: { slot: "ears", name: "Headphones", svg: `<path d="M20 66 Q20 18 60 18 Q100 18 100 66" fill="none" stroke="#3c3c3c" stroke-width="6" stroke-linecap="round"/><rect x="10" y="56" width="16" height="26" rx="7" fill="#ff4b4b"/><rect x="94" y="56" width="16" height="26" rx="7" fill="#ff4b4b"/>` },
  };
  const HATS = Object.keys(ACC).filter((k) => ACC[k].slot === "hat");

  // ---------- face parts ----------
  const eye = (x) => `<circle cx="${x}" cy="62" r="13" fill="#fff"/>`;
  const pupil = (x) => `<circle cx="${x + 2}" cy="64" r="7" fill="${INK}"/><circle cx="${x + 4.5}" cy="61" r="2.6" fill="#fff"/>`;
  const heart = (x) => `<path d="M${x} 72 C${x - 14} 62 ${x - 12} 50 ${x - 4} 50 C${x} 50 ${x} 54 ${x} 54 C${x} 54 ${x} 50 ${x + 4} 50 C${x + 12} 50 ${x + 14} 62 ${x} 72Z" fill="#ff4b4b" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
  const spiral = (x) => `<g class="e-spin"><circle cx="${x}" cy="62" r="13" fill="#fff"/><path d="M${x} 62 m-9 0 a9 9 0 1 1 18 0 a7 7 0 1 1 -14 0 a5 5 0 1 1 10 0 a3 3 0 1 1 -6 0" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></g>`;
  const FACE = (c) => `
    <g class="f-eyes f-open">${eye(44)}${eye(76)}<g class="f-pupils"><g class="f-pl">${pupil(44)}</g><g class="f-pr">${pupil(76)}</g></g>
      <g class="f-lids"><path class="f-lid-l" d="M30 63 A14 14 0 0 1 58 63Z" fill="${c.body}"/><path class="f-lid-r" d="M62 63 A14 14 0 0 1 90 63Z" fill="${c.body}"/></g></g>
    <g class="f-eyes f-arc" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"><path d="M34 64 Q44 52 54 64"/><path d="M66 64 Q76 52 86 64"/></g>
    <g class="f-eyes f-squeeze" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M36 55 L51 62 L36 69"/><path d="M84 55 L69 62 L84 69"/></g>
    <g class="f-eyes f-wink">${eye(44)}${pupil(44)}<path d="M66 64 Q76 54 86 64" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>
    <g class="f-eyes f-heart">${heart(44)}${heart(76)}</g>
    <g class="f-eyes f-spiral">${spiral(44)}${spiral(76)}</g>
    <g class="f-brows" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"><path class="f-brow-l" d="M35 44 L53 44"/><path class="f-brow-r" d="M67 44 L85 44"/></g>
    <g class="f-cheeks"><ellipse cx="29" cy="80" rx="7" ry="4.5" fill="#ff86a0" opacity="0.55"/><ellipse cx="91" cy="80" rx="7" ry="4.5" fill="#ff86a0" opacity="0.55"/></g>
    ${c.nose || ""}
    <path class="f-m f-m-idle" d="M52 81 Q60 88 68 81" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <g class="f-m f-m-happy"><path d="M48 79 Q60 99 72 79Z" fill="${INK}"/><path d="M53 87 Q60 94 67 87 Q60 84 53 87Z" fill="#ff4b4b"/></g>
    <g class="f-m f-m-laugh"><path d="M42 76 Q60 106 78 76Z" fill="${INK}"/><path d="M50 90 Q60 100 70 90 Q60 86 50 90Z" fill="#ff4b4b"/><path d="M46 77 H74" stroke="#fff" stroke-width="3"/></g>
    <path class="f-m f-m-sad" d="M50 89 Q60 80 70 89" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path class="f-m f-m-cry" d="M46 92 Q60 74 74 92 Q60 86 46 92Z" fill="${INK}"/>
    <ellipse class="f-m f-m-o" cx="60" cy="85" rx="6" ry="7" fill="${INK}"/>
    <ellipse class="f-m f-m-shock" cx="60" cy="87" rx="9" ry="11" fill="${INK}"/>
    <path class="f-m f-m-smirk" d="M51 84 Q62 88 71 78" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path class="f-m f-m-wavy" d="M46 85 q4 -5 7 0 t7 0 t7 0 t7 0" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <ellipse class="f-m f-m-small" cx="60" cy="84" rx="3.5" ry="4" fill="${INK}"/>
    <g class="f-m f-m-grin"><path d="M47 78 H73 Q73 90 60 90 Q47 90 47 78Z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M47 83 H73 M56 78 V89 M64 78 V89" stroke="${INK}" stroke-width="1.5"/></g>
    <path class="f-m f-m-flat" d="M53 84 L67 82" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <g class="f-tears"><path class="f-tear" d="M36 70 q-3 8 0 12 q3 -4 0 -12Z" fill="#84d8ff"/><path class="f-tear t2" d="M84 70 q-3 8 0 12 q3 -4 0 -12Z" fill="#84d8ff"/></g>
    <path class="f-sweat" d="M96 40 q-5 9 0 13 q5 -4 0 -13Z" fill="#84d8ff"/>
    <g class="f-blush"><ellipse cx="29" cy="80" rx="10" ry="6" fill="#ff4b4b" opacity="0.35"/><ellipse cx="91" cy="80" rx="10" ry="6" fill="#ff4b4b" opacity="0.35"/></g>`;

  // ---------- extras used by actions ----------
  const EXTRAS = `
    <g class="x x-balls"><circle class="xb b1" r="6" fill="#ff4b4b"/><circle class="xb b2" r="6" fill="#1cb0f6"/><circle class="xb b3" r="6" fill="#ffc800"/></g>
    <g class="x x-zzz" style="font:900 14px var(--sans)" fill="#1cb0f6"><text class="xz z1" x="84" y="30">z</text><text class="xz z2" x="92" y="20">Z</text><text class="xz z3" x="100" y="8">Z</text></g>
    <g class="x x-notes" fill="#ce82ff"><path class="xn n1" d="M92 30 v-12 l8 -2 v12" stroke="#ce82ff" stroke-width="2.5" fill="none"/><circle class="xn n1" cx="90" cy="31" r="3"/><path class="xn n2" d="M22 26 v-12" stroke="#ce82ff" stroke-width="2.5"/><circle class="xn n2" cx="20" cy="27" r="3"/></g>
    <g class="x x-stars" fill="#ffc800"><path class="xs s1" d="M0 -6 l1.8 4 4.2 .5 -3.1 2.9 .8 4.2 -3.7 -2.1 -3.7 2.1 .8 -4.2 -3.1 -2.9 4.2 -.5z"/><path class="xs s2" d="M0 -6 l1.8 4 4.2 .5 -3.1 2.9 .8 4.2 -3.7 -2.1 -3.7 2.1 .8 -4.2 -3.1 -2.9 4.2 -.5z"/><path class="xs s3" d="M0 -6 l1.8 4 4.2 .5 -3.1 2.9 .8 4.2 -3.7 -2.1 -3.7 2.1 .8 -4.2 -3.1 -2.9 4.2 -.5z"/></g>
    <g class="x x-puff" fill="#e5e5e5"><circle cx="100" cy="80" r="8"/><circle cx="110" cy="72" r="6"/><circle cx="112" cy="86" r="5"/></g>
    <g class="x x-skate"><rect x="26" y="113" width="68" height="6" rx="3" fill="#a0722d"/><circle class="xw" cx="38" cy="121" r="4" fill="#4b4b4b"/><circle class="xw" cx="82" cy="121" r="4" fill="#4b4b4b"/></g>`;

  // ---------- mood → parts ----------
  const MOODS = ["idle", "happy", "laugh", "sad", "cry", "surprised", "wink", "love", "dizzy", "sleepy", "determined", "smug", "shocked", "think"];
  const ACTS = ["dance", "juggle", "sleep", "skate", "headbang", "spin", "wave", "peek", "cry"];

  const accSvg = (list) => {
    const bySlot = {};
    (list || []).forEach((a) => ACC[a] && (bySlot[ACC[a].slot] = a));
    return ["ears", "neck", "face", "hat"].map((s) => `<g class="acc acc-${s}" data-a="${bySlot[s] || ""}">${bySlot[s] ? ACC[bySlot[s]].svg : ""}</g>`).join("");
  };

  function svg(who, mood, acc) {
    const c = CHARS[who] || CHARS.sprout;
    const hasHat = (acc || []).some((a) => ACC[a] && ACC[a].slot === "hat");
    return `<svg class="mascot-svg who-${who} ${hasHat ? "has-hat" : ""}" viewBox="-8 -22 136 150" data-mood="${mood}" aria-hidden="true" style="--mb:${c.body};--hy:${c.hy}px;--hs:${c.hs}">
      <ellipse class="m-shadow" cx="60" cy="118" rx="32" ry="5" fill="rgba(0,0,0,0.08)"/>
      <g class="m-all">
        <g class="m-bob">
          ${c.top}
          <ellipse class="m-foot" cx="44" cy="108" rx="10" ry="6" fill="${c.foot}"/><ellipse class="m-foot" cx="76" cy="108" rx="10" ry="6" fill="${c.foot}"/>
          <ellipse class="m-arm m-arm-l" cx="16" cy="76" rx="8" ry="12" fill="${c.limb}"/><ellipse class="m-arm m-arm-r" cx="104" cy="76" rx="8" ry="12" fill="${c.limb}"/>
          <path class="m-body" d="${c.shape}" fill="${c.body}"/>
          ${c.bellyEl}
          <ellipse cx="38" cy="44" rx="10" ry="5.5" fill="#fff" opacity="0.35" transform="rotate(-32 38 44)"/>
          <g class="m-face">${FACE(c)}</g>
          <g class="m-acc">${accSvg(acc)}</g>
        </g>
        ${EXTRAS}
      </g>
    </svg>`;
  }

  const cast = { course: "sprout", CHARS, ACC, MOODS, ACTS, HATS };
  cast.who = (w) => (w && CHARS[w] ? w : cast.course);

  /** HTML for one mascot. */
  NIC.mascot = ({ who, size = 72, mood = "idle", acc, act = "", cls = "", poke = true } = {}) => {
    const w = cast.who(who);
    return `<span class="mascot ${cls} ${poke ? "pokeable" : ""}" style="--ms:${size}px" data-who="${w}" data-mood="${mood}" data-act="${act}" data-acc="${(acc || []).join(",")}" ${poke ? 'role="img" aria-label="' + CHARS[w].name + '"' : ""}>${svg(w, mood, acc)}</span>`;
  };

  const fx = () => NIC.fx;
  const find = (host) => host && (host.classList && host.classList.contains("mascot") ? host : host.querySelector && host.querySelector(".mascot"));

  /** Swap expression and play a matching one-shot motion. */
  NIC.mascotReact = (host, mood) => {
    const m = find(host); if (!m) return;
    m.dataset.mood = mood; m.querySelector(".mascot-svg").setAttribute("data-mood", mood);
    const f = fx(); if (!f || !f.ok || f.reduce()) return;
    const K = {
      happy: ["translateY(0px) scale(1)", "translateY(-14px) scale(1.04,0.97)", "translateY(0px) scale(1.06,0.94)", "translateY(0px) scale(1)"],
      laugh: ["rotate(0deg)", "rotate(-6deg) scale(1.04)", "rotate(6deg)", "rotate(-4deg)", "rotate(0deg)"],
      love: ["scale(1)", "scale(1.12)", "scale(0.96)", "scale(1.05)", "scale(1)"],
      sad: ["rotate(0deg)", "rotate(-7deg)", "rotate(5deg)", "rotate(0deg)"],
      cry: ["translateY(0px)", "translateY(3px) scale(1.02,0.96)", "translateY(0px)"],
      surprised: ["translateY(0px) scale(1)", "translateY(-10px) scale(0.95,1.08)", "translateY(0px) scale(1)"],
      shocked: ["translateY(0px) scale(1)", "translateY(-16px) scale(0.9,1.12)", "translateY(0px) scale(1.04,0.96)", "translateY(0px) scale(1)"],
      dizzy: ["rotate(0deg)", "rotate(-12deg)", "rotate(10deg)", "rotate(-8deg)", "rotate(0deg)"],
    }[mood] || ["scale(0.92)", "scale(1)"];
    f.animate(m, { transform: K }, { duration: 0.55, ease: f.EASE });
  };

  // ---------- one-shot gags ----------
  const GAGS = ["look", "yawn", "hattip", "jump", "sneeze", "trip", "wiggle"];
  cast.surprise = (host, gag) => {
    const m = find(host); if (!m || (fx() && fx().reduce())) return;
    const g = gag || GAGS[Math.floor(Math.random() * GAGS.length)];
    if (g === "yawn") { const old = m.dataset.mood; NIC.mascotReact(m, "sleepy"); setTimeout(() => NIC.mascotReact(m, old || "idle"), 1400); }
    m.classList.add("do-" + g);
    setTimeout(() => m.classList.remove("do-" + g), 1500);
    if (g === "sneeze" && NIC.sfx) setTimeout(() => NIC.sfx.play("sneeze"), 380);
  };

  // ---------- poke: boing, random face, accessory swap; 5 quick pokes = dizzy ----------
  const POKE_MOODS = ["happy", "laugh", "surprised", "love", "wink", "smug", "shocked"];
  let pokes = [];
  function setAcc(m, list) {
    m.dataset.acc = list.join(",");
    const s = m.querySelector(".mascot-svg");
    s.querySelector(".m-acc").innerHTML = accSvg(list);
    s.classList.toggle("has-hat", list.some((a) => ACC[a] && ACC[a].slot === "hat"));
  }
  cast.setAcc = setAcc;
  document.addEventListener("pointerdown", (e) => {
    const m = e.target.closest && e.target.closest(".mascot.pokeable");
    if (!m) return;
    const now = performance.now();
    pokes = pokes.filter((t) => now - t < 3000); pokes.push(now);
    const old = m.dataset.base || m.dataset.mood || "idle";
    m.dataset.base = old;
    const dizzy = pokes.length >= 5;
    if (dizzy) pokes = [];
    NIC.mascotReact(m, dizzy ? "dizzy" : POKE_MOODS[Math.floor(Math.random() * POKE_MOODS.length)]);
    const f = fx(); if (f && f.ok && !f.reduce()) f.animate(m, { transform: ["scale(1,1)", "scale(1.18,0.82)", "scale(0.9,1.12)", "scale(1.04,0.97)", "scale(1,1)"] }, { duration: 0.5, ease: "easeOut" });
    if (NIC.sfx) NIC.sfx.play(dizzy ? "dizzy" : "squeak");
    const pool = cast.unlocked ? cast.unlocked() : HATS;
    const cur = (m.dataset.acc || "").split(",").filter(Boolean);
    const hats = pool.filter((a) => ACC[a] && ACC[a].slot === "hat" && !cur.includes(a));
    if (hats.length && Math.random() < 0.7) setAcc(m, [...cur.filter((a) => ACC[a].slot !== "hat"), hats[Math.floor(Math.random() * hats.length)]]);
    clearTimeout(m._pk);
    m._pk = setTimeout(() => NIC.mascotReact(m, old), dizzy ? 2200 : 1300);
  });

  /** Every 8–15 s, one visible mascot inside `root` does a gag. Returns a stop function. */
  cast.idle = (root) => {
    let t = null, stopped = false;
    const tick = () => {
      if (stopped) return;
      const vis = Array.from(root.querySelectorAll(".mascot")).filter((m) => { const r = m.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 30; });
      if (vis.length && !document.hidden) cast.surprise(vis[Math.floor(Math.random() * vis.length)]);
      t = setTimeout(tick, 8000 + Math.random() * 7000);
    };
    t = setTimeout(tick, 4000 + Math.random() * 3000);
    return () => { stopped = true; clearTimeout(t); };
  };

  // ---------- feedback row (non-player pages) ----------
  const moodOf = (kind) => (kind === "ok" ? ["happy", "laugh", "love"][Math.floor(Math.random() * 3)] : kind === "retry" ? "think" : "sad");
  NIC.feedback = (box, kind, html, animate = true) => {
    box.classList.remove("ok", "no", "retry");
    box.classList.add("fb", kind);
    box.innerHTML = `<div class="fb-row-m">${NIC.mascot({ size: 58, mood: animate ? "idle" : moodOf(kind) })}<div class="bubble">${html}</div></div>`;
    if (animate) { NIC.mascotReact(box, moodOf(kind)); if (NIC.sfx) NIC.sfx.play(kind === "ok" ? "correct" : kind === "retry" ? "retry" : "wrong"); }
  };

  NIC.cast = cast;
})();
