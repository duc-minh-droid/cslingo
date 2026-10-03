/* In-house illustrations and background patterns (drawn here in the cast palette; no third-party art).
     NIC.art.banner(course)   → HTML: the course banner at the top of the path (scene + cast)
     NIC.art.empty(kind)      → SVG string for an empty state: "practice" | "achievements"
     NIC.art.pattern(kind, c) → CSS url() for a tiling background: "dots" | "leaves" | "circuit" | "waves"
   Scenes are SVG strings, so they scale and theme cleanly. Mascots are added as HTML on top. */
(function () {
  const N = NIC;
  const uri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  // ---------- patterns ----------
  const PAT = {
    dots: (c) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="4" cy="4" r="2" fill="${c}"/><circle cx="16" cy="16" r="2" fill="${c}"/></svg>`,
    leaves: (c) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><path d="M10 30c0-9 7-15 16-16-1 9-7 16-16 16z" fill="${c}"/><path d="M10 30l9-9" stroke="${c}" stroke-width="1.5" opacity=".6"/><path d="M34 44c0-5 4-9 9-9 0 5-4 9-9 9z" fill="${c}" opacity=".7"/><circle cx="38" cy="10" r="2" fill="${c}"/></svg>`,
    circuit: (c) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M0 14h14l8 8h14M56 42H40l-6-6H20"/><path d="M28 0v10M28 46v10"/><circle cx="38" cy="22" r="3" fill="${c}"/><circle cx="18" cy="36" r="3" fill="${c}"/><circle cx="28" cy="12" r="2.5"/></svg>`,
    waves: (c) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="24" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"><path d="M0 8c10 0 10-6 20-6s10 6 20 6 10-6 20-6"/><path d="M0 20c10 0 10-6 20-6s10 6 20 6 10-6 20-6" opacity=".6"/></svg>`,
  };
  const pattern = (kind = "dots", c = "rgba(255,255,255,.22)") => uri((PAT[kind] || PAT.dots)(c));

  // ---------- course banner scenes (viewBox 600×170) ----------
  const cloud = (x, y, s = 1, o = 1) =>
    `<g class="ab-cloud" transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="26" ry="14" fill="#fff"/><ellipse cx="20" cy="-8" rx="18" ry="15" fill="#fff"/><ellipse cx="40" cy="1" rx="22" ry="12" fill="#fff"/></g>`;
  const SCENES = {
    nic: () => `
      <defs><linearGradient id="abN" x1="0" y1="0" x2="0" y2="1"><stop class="ab-s0" offset="0" stop-color="#bdeaff"/><stop class="ab-s1" offset="1" stop-color="#e9f9ff"/></linearGradient></defs>
      <rect width="600" height="170" fill="url(#abN)"/>
      <g class="ab-sun"><circle cx="520" cy="42" r="26" fill="#ffc800"/><circle cx="520" cy="42" r="38" fill="#ffc800" opacity=".18"/></g>
      <g class="ab-drift">${cloud(70, 40, 1, 0.95)}${cloud(300, 28, 0.7, 0.85)}</g>
      <path d="M0 120 C90 80 170 96 250 112 S420 86 600 104 V170 H0z" fill="#a5ed6e"/>
      <path d="M0 140 C120 112 220 126 330 138 S500 118 600 132 V170 H0z" fill="#78d33b"/>
      <path d="M0 158 C140 144 300 150 600 150 V170 H0z" fill="#58cc02"/>
      ${[
        [118, 128],
        [168, 136],
        [402, 124],
        [452, 133],
        [236, 146],
      ]
        .map(
          ([x, y], k) =>
            `<g transform="translate(${x} ${y})"><path d="M0 0v-14" stroke="#58a700" stroke-width="3" stroke-linecap="round"/><path d="M0-10c-7-2-10-8-9-12 6 0 9 5 9 12zM0-12c6-3 11-2 13 1-5 4-10 3-13-1z" fill="#58a700"/>${k % 2 ? `<circle cy="-18" r="5" fill="${["#ff4b4b", "#ce82ff", "#ffc800"][k % 3]}"/><circle cy="-18" r="2" fill="#fff"/>` : ""}</g>`,
        )
        .join("")}
      <path class="ab-vine" d="M540 170c-10-30 14-44 4-70s12-40 4-62" fill="none" stroke="#58a700" stroke-width="4" stroke-linecap="round" stroke-dasharray="4 7"/>`,
    ds: () => `
      <defs><linearGradient id="abD" x1="0" y1="0" x2="0" y2="1"><stop class="ab-s0" offset="0" stop-color="#cdeeff"/><stop class="ab-s1" offset="1" stop-color="#f0faff"/></linearGradient></defs>
      <rect width="600" height="170" fill="url(#abD)"/>
      <g class="ab-drift">${cloud(420, 36, 0.9, 0.9)}${cloud(120, 26, 0.6, 0.8)}</g>
      <path d="M0 104 C120 92 260 110 380 100 S540 92 600 98 V170 H0z" fill="#84d8ff"/>
      <path class="ab-wave" d="M-40 124 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
      <path d="M0 136 C160 128 300 142 600 132 V170 H0z" fill="#1cb0f6"/>
      ${[
        [70, 70],
        [180, 56],
        [470, 62],
      ]
        .map(
          ([x, y], k) =>
            `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="54" height="${60 - k * 4}" rx="7" fill="#fff" stroke="#1899d6" stroke-width="3"/>${[0, 1, 2].map((r) => `<rect x="7" y="${8 + r * 16}" width="40" height="10" rx="3" fill="#ddf4ff"/><circle cx="41" cy="${13 + r * 16}" r="2.6" fill="${r === k ? "#58cc02" : "#1cb0f6"}" class="${r === k ? "ab-blink" : ""}"/>`).join("")}</g>`,
        )
        .join("")}
      ${[
        [140, 100],
        [260, 96],
        [340, 112],
        [420, 102],
      ]
        .map(
          ([x, y], k) =>
            `<path class="ab-drop" style="animation-delay:${k * 0.6}s" transform="translate(${x} ${y})" d="M0-10c5 6 7 9 7 12a7 7 0 0 1-14 0c0-3 2-6 7-12z" fill="#fff" opacity=".85"/>`,
        )
        .join("")}`,
    algo: () => `
      <defs><linearGradient id="abA" x1="0" y1="0" x2="0" y2="1"><stop class="ab-s0" offset="0" stop-color="#e9d5ff"/><stop class="ab-s1" offset="1" stop-color="#f8f0ff"/></linearGradient></defs>
      <rect width="600" height="170" fill="url(#abA)"/>
      <g class="ab-graph" transform="translate(-10 78)" fill="none" stroke="#a560e8" stroke-width="2.5" opacity=".9"><path d="M60 40L130 26L190 54L260 30M130 26L150 70M190 54L150 70"/>
        ${[
          [60, 40],
          [130, 26],
          [190, 54],
          [260, 30],
          [150, 70],
        ]
          .map(
            ([x, y], k) =>
              `<circle cx="${x}" cy="${y}" r="5" fill="${k === 3 ? "#ffc800" : "#fff"}" class="${k === 3 ? "ab-blink" : ""}"/>`,
          )
          .join("")}</g>
      ${[
        [300, 70, 50, 100],
        [356, 44, 44, 126],
        [406, 84, 40, 86],
        [452, 58, 56, 112],
        [514, 90, 44, 80],
      ]
        .map(
          ([x, y, w, h], k) =>
            `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${k % 2 ? "#a560e8" : "#ce82ff"}"/>${Array.from({ length: Math.floor(h / 18) }, (_, r) => [0, 1].map((cc) => `<rect x="${x + 9 + cc * (w / 2 - 4)}" y="${y + 10 + r * 18}" width="${w / 2 - 14}" height="8" rx="2" fill="${(r + cc + k) % 3 ? "#f4e6ff" : "#ffc800"}" opacity="${(r + cc + k) % 3 ? 0.55 : 0.95}"/>`).join("")).join("")}</g>`,
        )
        .join("")}
      <path d="M0 150h140l14 -10h90l12 10h344" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <rect y="152" width="600" height="18" fill="#a560e8"/>
      <circle class="ab-pulse" r="5" fill="#ffc800"><animateMotion dur="5s" repeatCount="indefinite" path="M0 150h140l14 -10h90l12 10h344"/></circle>`,
  };
  const CAST = {
    nic: [
      ["sprout", "wave", ["party"]],
      ["chip", "juggle", ["propeller"]],
    ],
    ds: [
      ["pebble", "skate", ["headphones"]],
      ["berry", "wave", ["shades"]],
    ],
    algo: [
      ["byte", "headbang", ["headphones"]],
      ["blaze", "spin", ["wizard"]],
    ],
  };
  const STARS = `<g class="ab-stars">${[
    [40, 22],
    [150, 50],
    [210, 18],
    [330, 60],
    [380, 22],
    [455, 44],
    [585, 70],
    [270, 36],
  ]
    .map(
      ([x, y], k) =>
        `<circle cx="${x}" cy="${y}" r="${k % 3 ? 1.6 : 2.4}" fill="#fff" class="${k % 2 ? "ab-blink" : ""}"/>`,
    )
    .join("")}</g>`;
  function banner(course, { title = "", sub = "" } = {}) {
    const scene = (SCENES[course] || SCENES.nic)();
    const cast = (CAST[course] || CAST.nic)
      .map(
        ([who, act, acc], k) =>
          `<div class="ab-m ab-m${k}">${N.mascot({ who, size: k ? 74 : 92, act, acc, mood: k ? "laugh" : "happy" })}</div>`,
      )
      .join("");
    return `<div class="ab-banner ab-${course}"><svg class="ab-scene" viewBox="0 0 600 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${scene}${STARS}</svg>${cast}
      ${title ? `<div class="ab-text"><b>${title}</b>${sub ? `<span>${sub}</span>` : ""}</div>` : ""}</div>`;
  }

  // ---------- empty states ----------
  const EMPTY = {
    practice: () => `<svg class="ab-empty" viewBox="0 0 220 150" aria-hidden="true">
      <ellipse cx="110" cy="136" rx="80" ry="9" fill="var(--line)"/>
      <rect x="54" y="36" width="112" height="92" rx="14" fill="var(--panel)" stroke="var(--line)" stroke-width="4"/>
      ${[0, 1, 2].map((r) => `<rect x="74" y="${56 + r * 22}" width="16" height="16" rx="5" fill="#58cc02"/><path d="M78 ${64 + r * 22}l3 3 6-6" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="98" y="${60 + r * 22}" width="${48 - r * 8}" height="8" rx="4" fill="#e5e5e5"/>`).join("")}
      <g class="ab-sparkle"><path d="M176 30l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#ffc800"/><path d="M40 60l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#1cb0f6"/></g></svg>`,
    achievements: () => `<svg class="ab-empty" viewBox="0 0 220 150" aria-hidden="true">
      <ellipse cx="110" cy="136" rx="70" ry="8" fill="var(--line)"/>
      <path d="M84 40h52v26a26 26 0 0 1-52 0z" fill="var(--line)"/><path d="M84 46H70a14 14 0 0 0 14 18M136 46h14a14 14 0 0 1-14 18" fill="none" stroke="var(--line-2)" stroke-width="6"/>
      <rect x="102" y="92" width="16" height="22" fill="#d4d4d4"/><rect x="86" y="112" width="48" height="14" rx="5" fill="#d4d4d4"/>
      <text x="110" y="74" text-anchor="middle" font-size="28" font-weight="900" fill="#fff" font-family="Nunito, sans-serif">?</text>
      <g class="ab-sparkle"><path d="M160 34l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#ffc800"/></g></svg>`,
  };
  const empty = (kind) => (EMPTY[kind] || EMPTY.practice)();

  N.art = { banner, empty, pattern };
})();
