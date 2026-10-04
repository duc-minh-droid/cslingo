/* Boss-quiz engine. Content lives in js/content/<course>/boss-*.js.
   Question types (Q.type, default "mcq"):
     mcq     {o:[...], a}                         pick one
     multi   {o:[...], a:[...]}                   select all that apply
     num     {ans, tol?, unit?}                   legacy: shown as tap-to-pick options (never typed)
     slider  {min, max, step, ans, tol, unit?, live?(v)->html}   estimate by dragging
     order   {items:[...correct order]}           tap items into the right order
     match   {pairs:[[left, right], ...]}         pair each left with a right
     cat     {buckets:[...], items:[[text, bucketIdx], ...]}   sort into buckets
     pick    {fig: svg with [data-pick], a: id | [ids]}        click on the diagram
     bug     {code:[...lines], a: lineIdx}        click the faulty line
   Every question: q (prompt), why (explanation), optional fig (html | fn(box)), hint. */
(function () {
  const quiz = (NIC.shared.engineQuiz = NIC.shared.engineQuiz || {});

  const N = NIC;

  // deterministic shuffle so a question looks the same when you come back to it
  function seeded(arr, seed) {
    const a = arr.map((x, i) => [x, i]);
    let s = 0;
    for (const c of String(seed)) s = (s * 31 + c.charCodeAt(0)) >>> 0;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.every(([, i], k) => i === k) && a.length > 1) a.push(a.shift()); // never already solved
    return a;
  }
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  /* Display order for answer options, so the right answer isn't always in the same slot.
     True/False keeps its order, all-numeric options are shown ascending, "both / neither / all / none of…"
     stay last, and everything else is shuffled with a seed from the question text (stable on revisits).
     Buttons keep data-k = the ORIGINAL index, so grading and saved answers are unchanged. */
  const SUP = { "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9 };
  function asNum(h) {
    let s = String(h)
      .replace(/<[^>]+>/g, "")
      .replace(/^(about|roughly|≈|~)\s*/i, "")
      .replace(/[,\s]/g, "")
      .replace(/[−–]/g, "-")
      .replace(/×$/, "")
      .replace(/%$/, "");
    const sup = s.match(/^(-?\d+(?:\.\d+)?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
    if (sup) return Math.pow(+sup[1], +[...sup[2]].map((c) => SUP[c]).join(""));
    const sci = s.match(/^(-?\d+(?:\.\d+)?)×10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
    if (sci) return +sci[1] * Math.pow(10, +[...sci[2]].map((c) => SUP[c]).join(""));
    const fr = s.match(/^(-?\d+)\/(\d+)$/);
    if (fr) return +fr[1] / +fr[2];
    s = s.replace(/(Hz|ms|s|kg|km|bits?|days?|years?|seconds?|steps?|GB|MB)$/i, "");
    return /^-?\d+(\.\d+)?$/.test(s) ? +s : NaN;
  }
  const PIN = /^(both|neither|all of (the|them|these)|none of (the|them|these)|all the above|none of the above)\b/i;
  function optOrder(Q) {
    const o = Q.o,
      idx = o.map((_, k) => k);
    const plain = o.map((x) =>
      String(x)
        .replace(/<[^>]+>/g, "")
        .trim(),
    );
    if (o.length <= 2 && plain.every((x) => /^(true|false|yes|no)$/i.test(x))) return idx;
    const nums = plain.map(asNum);
    if (nums.every((v) => Number.isFinite(v))) return idx.slice().sort((a, b) => nums[a] - nums[b] || a - b);
    const pinned = idx.filter((k) => PIN.test(plain[k])),
      free = idx.filter((k) => !PIN.test(plain[k]));
    const shuffled = (salt) => {
      const a = free.slice();
      let s = 0;
      for (const c of String(Q.q) + "|" + plain.join("|") + salt) s = (s * 31 + c.charCodeAt(0)) >>> 0;
      for (let i = a.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) >>> 0;
        const j = s % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    let order = shuffled("");
    // N.optSalt is set while a retry renders (js/player/questions.js): same options, a different order than the first try
    if (N.optSalt && free.length > 1)
      for (let t = 0; t < 4 && order.join() === shuffled("").join(); t++) order = shuffled(`#${N.optSalt}${t}`);
    return order.concat(pinned);
  }
  N.optOrder = optOrder;
  const fmtNum = (v) => (Number.isInteger(v) ? String(v) : String(+(+v).toFixed(4)));
  /** The corrected answer under a graded question: appended, then revealed (fade + small drop). */
  const correct = (box, html) => {
    box.insertAdjacentHTML("beforeend", `<div class="q-correct">${html}</div>`);
    if (N.fx && N.fx.reveal) N.fx.reveal(box.lastElementChild);
  };
  /** Plain text of an HTML snippet (tags and $ maths marks dropped, spaces collapsed): for aria-labels. */
  const textOf = (h) =>
    String(h ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\$+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  let nameSeq = 0;
  /** Give `node` (a group of answer controls) the question's prompt as its name: the player's .pl-prompt or .pl-q-text beside
      `box`, else the question text, else `fallback`. */
  const nameGroup = (node, box, Q, fallback) => {
    const p = box.parentElement && box.parentElement.querySelector(".pl-prompt, .pl-q-text");
    if (p) {
      p.id = p.id || `qp-${++nameSeq}`;
      node.setAttribute("aria-labelledby", p.id);
    } else node.setAttribute("aria-label", textOf(Q && Q.q).slice(0, 200) || fallback);
  };
  /** Controls that disable themselves when pressed (order chips, matched tiles) drop the keyboard's place. Call with the
      element that had focus before the update: if it can no longer take focus, the next enabled control in `box` gets it. */
  const keepFocus = (box, had) => {
    if (!had || !box.contains(had) || !had.disabled) return;
    const next = [...box.querySelectorAll("button:not([disabled])")].find(
      (b) => !b.matches("[data-undo]") && !b.classList.contains("gone"),
    );
    if (next) next.focus({ preventScroll: true });
  };
  /** A rounded rect around an SVG element's whole box, `pad` units out, kept beside it: inside a <g>, after anything else. Null for HTML. */
  function ringRect(e, cls, pad) {
    if (!(e instanceof SVGGraphicsElement)) return null;
    const own = [...e.querySelectorAll(":scope > .pk-ring, :scope > .pk-focus")];
    own.forEach((r) => (r.style.display = "none")); // our own rings don't count towards the box
    let bb = null;
    try {
      bb = e.getBBox();
    } catch (err) {
      /* not rendered (hidden or detached): no ring */
    }
    own.forEach((r) => (r.style.display = ""));
    if (!bb || !bb.width || !bb.height) return null;
    const w = bb.width + pad * 2,
      h = bb.height + pad * 2;
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("class", cls);
    r.setAttribute("x", bb.x - pad);
    r.setAttribute("y", bb.y - pad);
    r.setAttribute("width", w);
    r.setAttribute("height", h);
    r.setAttribute("rx", Math.min(12, Math.min(w, h) / 2));
    if (e instanceof SVGGElement) e.appendChild(r);
    else {
      // a lone shape can't hold children: the ring sits right after it and copies its transform
      if (e.getAttribute("transform")) r.setAttribute("transform", e.getAttribute("transform"));
      e.after(r);
    }
    return r;
  }
  /** The name a screen reader gives a pick target that the figure didn't label itself: its <title> or text, else its place. */
  function targetLabel(e, n, total) {
    const t = e.querySelector(":scope > title");
    const words = [], // one text piece at a time, so "A" and "3" read as "A 3", not "A3"
      w = document.createTreeWalker(t || e, NodeFilter.SHOW_TEXT);
    for (let x = w.nextNode(); x; x = w.nextNode()) words.push(x.nodeValue);
    const txt = textOf(words.join(" "));
    if (txt) return txt.length > 80 ? txt.slice(0, 77) + "…" : txt;
    const k = e.dataset.pick;
    return `Option ${n + 1} of ${total}${/^\d+$/.test(k) ? "" : `, ${k}`}`;
  }

  Object.assign(quiz, { correct, fmtNum, keepFocus, nameGroup, optOrder, ringRect, same, seeded, targetLabel, textOf });
})();
