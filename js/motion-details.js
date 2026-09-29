/* Animated disclosures: every <details> in the app (lesson "From step N" cards, the path popover's
   "What's inside", anything added later) opens and closes with a height + fade instead of snapping.
   Pointer clicks only: keyboard toggles stay instant (AGENTS.md: keyboard actions never animate).
   Reduced motion: the contents fade in, nothing moves. Uses WAAPI, so it's interruptible mid-way. */
(function () {
  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)"; // --ease-out
  const OPEN_MS = 220, CLOSE_MS = 170;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = (d) => [...d.children].filter((c) => c.tagName !== "SUMMARY");

  function closedHeight(d, sum) {
    const cs = getComputedStyle(d), px = (k) => parseFloat(cs[k]) || 0;
    return sum.offsetHeight + px("paddingTop") + px("paddingBottom") + px("borderTopWidth") + px("borderBottomWidth");
  }

  document.addEventListener("click", (e) => {
    const sum = e.target.closest && e.target.closest("summary");
    const d = sum && sum.parentElement;
    if (!d || d.tagName !== "DETAILS" || sum !== d.querySelector(":scope > summary") || !d.animate) return;
    if (e.detail === 0) return; // keyboard (Enter/Space): native, instant
    e.preventDefault();
    const from = d.offsetHeight; // measure before cancelling, so a reversal starts where the box is now
    const opening = !d.open || d.classList.contains("m-closing");
    if (d._mAnim) { d._mAnim.cancel(); d._mAnim = null; }
    d.classList.remove("m-closing");

    if (opening) {
      d.open = true;
      const kids = body(d);
      if (reduce()) { kids.forEach((k) => k.animate({ opacity: [0, 1] }, { duration: OPEN_MS, easing: "ease" })); return; }
      const to = d.offsetHeight;
      d.classList.add("m-anim");
      kids.forEach((k) => k.animate({ opacity: [0, 1], transform: ["translateY(-4px)", "none"] }, { duration: OPEN_MS, easing: EASE }));
      const a = (d._mAnim = d.animate({ height: [from + "px", to + "px"] }, { duration: OPEN_MS, easing: EASE }));
      a.onfinish = a.oncancel = () => { d.classList.remove("m-anim"); if (d._mAnim === a) d._mAnim = null; };
    } else {
      if (reduce()) { d.open = false; return; }
      const to = closedHeight(d, sum);
      d.classList.add("m-anim", "m-closing");
      const fades = body(d).map((k) => k.animate({ opacity: [1, 0] }, { duration: CLOSE_MS * 0.7, easing: "ease", fill: "forwards" }));
      const a = (d._mAnim = d.animate({ height: [from + "px", to + "px"] }, { duration: CLOSE_MS, easing: EASE }));
      a.onfinish = () => { d.open = false; fades.forEach((f) => f.cancel()); d.classList.remove("m-anim", "m-closing"); d._mAnim = null; };
      a.oncancel = () => { fades.forEach((f) => f.cancel()); d.classList.remove("m-anim"); };
    }
  });
})();
