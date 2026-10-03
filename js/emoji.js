/* Emoji → Fluent Emoji (Flat) icons. Data: vendor/fluent-emoji.js (see tools/emoji-build.py).
   Any mapped emoji typed in content is swapped for the flat icon automatically, in HTML and inside SVG figures.
     NIC.emo(nameOrChar, cls?)  → HTML string for one icon (use it directly in new code)
     NIC.emojify(root)          → convert a subtree now (the MutationObserver does this for everything added to the page)
   Unmapped emoji are left as-is, so add new ones to tools/emoji-build.py and rerun it. */
(function () {
  const D = window.FLUENT_EMOJI;
  if (!D) return;
  // Our own sticker badges for the plain marks lessons use a lot: ✓ ✗ and ①–④ (a coloured coin with a darker lip, like the buttons).
  const coin = (top, lip, inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="13.2" r="10.4" fill="${lip}"/><circle cx="12" cy="11.6" r="10.4" fill="${top}"/>${inner}</svg>`;
  const MARKS = {
    "mk-check": coin(
      "#58cc02",
      "#58a700",
      '<path d="M7.1 11.9l3.3 3.2 6.5-6.6" fill="none" stroke="#fff" stroke-width="2.9" stroke-linecap="round" stroke-linejoin="round"/>',
    ),
    "mk-cross": coin(
      "#ff4b4b",
      "#ea2b2b",
      '<path d="M8.4 8l7.2 7.2M15.6 8l-7.2 7.2" fill="none" stroke="#fff" stroke-width="2.9" stroke-linecap="round"/>',
    ),
  };
  ["①", "②", "③", "④", "⑤"].forEach((c, k) => {
    MARKS[`mk-${k + 1}`] = coin(
      "#1cb0f6",
      "#1899d6",
      `<text x="12" y="16" text-anchor="middle" font-family="Nunito, ui-rounded, sans-serif" font-weight="900" font-size="13" fill="#fff">${k + 1}</text>`,
    );
    D.map[c] = `mk-${k + 1}`;
  });
  Object.assign(D.svg, MARKS);
  D.map["✓"] = "mk-check";
  D.map["✔"] = "mk-check";
  D.map["✗"] = "mk-cross";
  D.map["✘"] = "mk-cross";
  const SVGNS = "http://www.w3.org/2000/svg";
  const keys = Object.keys(D.map).sort((a, b) => b.length - a.length);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const SRC = `(${keys.map(esc).join("|")})\\uFE0F?`;
  const RE = new RegExp(SRC, "gu"),
    HAS = new RegExp(SRC, "u");
  const nameOf = (x) => (D.svg[x] ? x : D.map[x] || D.map[String(x).replace(/️/g, "")]);

  NIC.emo = (x, cls = "") => {
    const n = nameOf(x);
    if (!n) return String(x);
    const mk = n.startsWith("mk-"),
      label = mk ? { "mk-check": "correct", "mk-cross": "wrong" }[n] || n.slice(3) : n.replace(/-/g, " ");
    return `<span class="emo ${mk ? "emo-mk" : ""} ${cls}" role="img" aria-label="${label}">${D.svg[n]}</span>`;
  };

  function htmlNode(t) {
    const frag = document.createDocumentFragment();
    let last = 0;
    t.nodeValue.replace(RE, (m, k, i) => {
      if (i > last) frag.appendChild(document.createTextNode(t.nodeValue.slice(last, i)));
      const s = document.createElement("span");
      s.innerHTML = NIC.emo(k);
      frag.appendChild(s.firstChild);
      last = i + m.length;
      return m;
    });
    if (last < t.nodeValue.length) frag.appendChild(document.createTextNode(t.nodeValue.slice(last)));
    t.replaceWith(frag);
  }

  /** SVG <text>: strip the emoji from the text and place a nested <svg> icon beside it (or centred if nothing is left). */
  function svgNode(t) {
    const text = t.parentElement.closest("text");
    if (!text || text.dataset.emo) return;
    const raw = text.textContent,
      found = [...raw.matchAll(RE)];
    if (!found.length) return;
    const lead = found[0].index === 0;
    text.dataset.emo = "1";
    const v = t.nodeValue.replace(RE, "");
    t.nodeValue = lead ? v.replace(/^\s+/, "") : v.replace(/\s+$/, "");
    const fs = parseFloat(getComputedStyle(text).fontSize) || 13,
      size = fs * 1.3;
    const left = text.textContent.trim().length === 0 ? "centre" : lead ? "left" : "right";
    let bb;
    try {
      bb = text.getBBox();
    } catch {
      bb = null;
    }
    const tx = parseFloat(text.getAttribute("x")) || 0,
      ty = parseFloat(text.getAttribute("y")) || 0;
    const g = document.createElementNS(SVGNS, "g");
    g.innerHTML = D.svg[nameOf(found[0][1])];
    const icon = g.firstElementChild;
    let x, y;
    if (left === "centre" || !bb || !bb.width) {
      const s2 = size * 1.35;
      icon.setAttribute("width", s2);
      x = tx - s2 / 2;
      y = ty - s2 * 0.72;
      icon.setAttribute("height", s2);
      icon.setAttribute("x", x);
      icon.setAttribute("y", y);
      icon.setAttribute("class", "emo-svg");
      text.after(icon);
      return;
    } else {
      y = bb.y + bb.height / 2 - size / 2;
      x = left === "left" ? bb.x - size - 3 : bb.x + bb.width + 3;
    }
    icon.setAttribute("x", x);
    icon.setAttribute("y", y);
    icon.setAttribute("width", size);
    icon.setAttribute("height", size);
    icon.setAttribute("class", "emo-svg");
    text.after(icon);
  }

  function emojify(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      if (HAS.test(root.nodeValue)) convert(root);
      return;
    }
    if (root.nodeType !== 1 || (root.closest && root.closest(".emo, script, style, textarea, input"))) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let t = w.nextNode(); t; t = w.nextNode()) if (HAS.test(t.nodeValue)) hits.push(t);
    hits.forEach(convert);
  }
  function convert(t) {
    const p = t.parentElement;
    if (!p || p.closest(".emo, script, style, textarea, title")) return;
    if (p.namespaceURI === SVGNS) svgNode(t);
    else htmlNode(t);
  }
  NIC.emojify = emojify;

  // Convert everything that appears on the page, now and later.
  let queue = new Set(),
    pending = false;
  const flush = () => {
    pending = false;
    const q = queue;
    queue = new Set();
    q.forEach((n) => n.isConnected && emojify(n));
  };
  const mo = new MutationObserver((recs) => {
    recs.forEach((r) => {
      if (r.type === "characterData") queue.add(r.target);
      else r.addedNodes.forEach((n) => queue.add(n));
    });
    if (!pending) {
      pending = true;
      queueMicrotask(flush);
    }
  });
  const start = () => {
    emojify(document.body);
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  document.body ? start() : document.addEventListener("DOMContentLoaded", start);
})();
