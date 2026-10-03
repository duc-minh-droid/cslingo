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
    let s = 0;
    for (const c of String(Q.q) + "|" + plain.join("|")) s = (s * 31 + c.charCodeAt(0)) >>> 0;
    for (let i = free.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      [free[i], free[j]] = [free[j], free[i]];
    }
    return free.concat(pinned);
  }
  N.optOrder = optOrder;
  const fmtNum = (v) => (Number.isInteger(v) ? String(v) : String(+(+v).toFixed(4)));
  /** The corrected answer under a graded question: appended, then revealed (fade + small drop). */
  const correct = (box, html) => {
    box.insertAdjacentHTML("beforeend", `<div class="q-correct">${html}</div>`);
    if (N.fx && N.fx.reveal) N.fx.reveal(box.lastElementChild);
  };
  Object.assign(quiz, { correct, fmtNum, optOrder, same, seeded });
})();
