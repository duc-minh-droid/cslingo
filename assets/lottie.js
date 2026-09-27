/* In-house Lottie animations for CSLingo, drawn in code in the cast palette (no third-party files).
   Each entry is plain Lottie JSON (bodymovin 5.x), built by the small helpers below, and played by NIC.lottie(el, name).
   Inlined as JS rather than .json so it loads over file:// without fetch.
   To add one: write a function returning anim({...}, [layers]) and add it to window.CSL_LOTTIE. */
(function () {
  const FR = 60;
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1]; };
  const C = { green: "#58cc02", greenInk: "#58a700", gold: "#ffc800", goldInk: "#e0a800", orange: "#ff9600", orangeInk: "#cd7900", red: "#ff4b4b", blue: "#1cb0f6", violet: "#ce82ff", white: "#ffffff", cream: "#fff4d6", brown: "#a0522d" };

  // ---------- property helpers ----------
  const st = (k) => ({ a: 0, k });
  const EASE = { i: { x: [0.3], y: [1] }, o: { x: [0.7], y: [0] } };
  const BOUNCE = { i: { x: [0.34], y: [1.56] }, o: { x: [0.64], y: [0] } };
  /** keyframes: [[frame, value], …] (value is a number or array). */
  const kf = (list, ease = EASE) => ({ a: 1, k: list.map(([t, v], n) => (n < list.length - 1 ? { t, s: [].concat(v), ...ease } : { t, s: [].concat(v) })) });
  const val = (v) => (v && v.a !== undefined ? v : st(v));

  // ---------- shape helpers ----------
  const fill = (c, o = 100) => ({ ty: "fl", c: st(hex(c)), o: val(o), r: 1 });
  const stroke = (c, w = 4, o = 100) => ({ ty: "st", c: st(hex(c)), o: val(o), w: val(w), lc: 2, lj: 2 });
  const tr = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) => ({ ty: "tr", p: val(p), a: val(a), s: val(s), r: val(r), o: val(o) });
  const group = (items, t) => ({ ty: "gr", it: [...items, tr(t)] });
  const ellipse = (w, h = w, p = [0, 0]) => ({ ty: "el", p: val(p), s: val([w, h]) });
  const rect = (w, h, r = 0, p = [0, 0]) => ({ ty: "rc", p: val(p), s: val([w, h]), r: val(r) });
  const star = (outer, inner, n = 5, round = 0) => ({ ty: "sr", sy: 1, d: 1, pt: st(n), p: st([0, 0]), r: st(0), or: val(outer), ir: val(inner), os: st(round), is: st(round) });
  /** closed path through points with optional smoothing handles [[x,y,inX,inY,outX,outY]] */
  const path = (pts, closed = true) => ({ ty: "sh", ks: st({ c: closed, v: pts.map((q) => [q[0], q[1]]), i: pts.map((q) => [q[2] || 0, q[3] || 0]), o: pts.map((q) => [q[4] || 0, q[5] || 0]) }) });

  let ind = 0;
  /** A shape layer. ks: {p, s, r, o, a} (static or keyframed). */
  const to3 = (v, z) => (v && v.a === 1 ? { a: 1, k: v.k.map((f) => ({ ...f, s: f.s.length === 2 ? [...f.s, z] : f.s })) } : v.length === 2 ? [...v, z] : v);
  function layer(shapes, { p = [100, 100], s = [100, 100], r = 0, o = 100, a = [0, 0], ip = 0, op = 600, nm = "l" } = {}) {
    p = to3(p, 0); s = to3(s, 100);
    return { ddd: 0, ind: ++ind, ty: 4, nm, sr: 1, ip, op, st: 0, bm: 0, ao: 0,
      ks: { o: val(o), r: val(r), p: val(p), a: val([...a, 0]), s: val(s) }, shapes: shapes.slice().reverse() }; // Lottie draws the first shape on top; callers list bottom → top
  }
  const scale3 = (list, ease) => kf(list.map(([t, v]) => [t, [v, v, 100]]), ease);
  const anim = ({ w = 200, h = 200, op = 90, nm }, layers) => ({ v: "5.7.4", fr: FR, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers: layers.reverse() });

  /** Sparkles flying outward from (cx, cy). */
  function burst(cx, cy, { n = 10, dist = 70, t0 = 10, dur = 34, colors = [C.gold, C.orange, C.green, C.blue, C.violet], size = 10 } = {}) {
    return Array.from({ length: n }, (_, k) => {
      const ang = (k / n) * Math.PI * 2 + (k % 2) * 0.2, d = dist * (0.75 + ((k * 37) % 10) / 20);
      const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d, c = colors[k % colors.length];
      const shp = k % 3 === 0 ? star(size * 0.7, size * 0.3, 4) : k % 3 === 1 ? ellipse(size * 0.8) : rect(size * 0.5, size * 1.1, 2);
      return layer([group([shp, fill(c)])], { p: kf([[t0, [cx, cy]], [t0 + dur, [x, y]]]), s: scale3([[t0, 30], [t0 + 8, 110], [t0 + dur, 0]]), r: kf([[t0, 0], [t0 + dur, k % 2 ? 180 : -180]]), ip: t0, op: t0 + dur + 1, nm: "spark" + k });
    });
  }
  /** Soft rays rotating behind something. */
  const rays = (cx, cy, r, c, t0 = 0, o = 35) => layer([group([star(r, r * 0.35, 12), fill(c, 100)])], { p: [cx, cy], s: scale3([[t0, 0], [t0 + 18, 100]], BOUNCE), r: kf([[t0, 0], [t0 + 240, 180]], { i: { x: [1], y: [1] }, o: { x: [0], y: [0] } }), o, nm: "rays" });

  // ---------- the animations ----------
  function chest() {
    ind = 0;
    const lid = layer([
      group([rect(92, 30, 10, [0, -15]), fill(C.orange)]),
      group([rect(92, 8, 3, [0, -3]), fill(C.orangeInk)]),
      group([rect(16, 14, 4, [0, -2]), fill(C.gold)]),
    ], { p: [54, 116], a: [-46, 0], s: [100, 100], r: kf([[0, 0], [14, -8], [18, 6], [24, -4], [30, 0], [38, 0], [48, -34]], BOUNCE), nm: "lid" });
    const body = layer([
      group([rect(92, 54, 10, [0, 0]), fill(C.orange)]),
      group([rect(92, 10, 0, [0, -12]), fill(C.orangeInk)]),
      group([rect(16, 54, 0, [-26, 0]), fill(C.orangeInk, 55)]),
      group([rect(16, 54, 0, [26, 0]), fill(C.orangeInk, 55)]),
      group([rect(18, 18, 5, [0, -4]), fill(C.gold)]),
      group([ellipse(5, 7, [0, -4]), fill(C.goldInk)]),
    ], { p: kf([[0, [100, 144]], [6, [100, 140]], [10, [100, 144]], [16, [100, 141]], [20, [100, 144]]]), nm: "body" });
    const glow = layer([group([ellipse(120, 120), fill(C.gold, 100)])], { p: [100, 104], s: scale3([[46, 0], [60, 100], [90, 110]]), o: kf([[46, 0], [54, 70], [90, 0]]), ip: 46, nm: "glow" });
    const coins = [-24, 0, 24].map((dx, k) => layer([group([ellipse(22), fill(C.gold)]), group([ellipse(12), fill(C.goldInk)])], { p: kf([[50 + k * 3, [100, 114]], [72 + k * 3, [100 + dx, 44 + (k === 1 ? -12 : 0)]]], BOUNCE), s: scale3([[50 + k * 3, 20], [66 + k * 3, 100]]), ip: 50 + k * 3, nm: "coin" + k }));
    return anim({ nm: "chest", op: 110 }, [rays(100, 90, 96, C.gold, 48, 30), glow, body, lid, ...coins, ...burst(100, 96, { t0: 50, n: 12, dist: 80 })]);
  }

  function flame() {
    ind = 0;
    const tongue = (w, h, c, dx, t0, amp) => layer([group([path([[0, -h, 0, 0, w * 0.1, h * 0.3], [w / 2, h * 0.15, 0, -h * 0.35, 0, h * 0.35], [0, h * 0.55, w * 0.35, 0, -w * 0.35, 0], [-w / 2, h * 0.15, 0, h * 0.35, 0, -h * 0.35]]), fill(c)])],
      { p: [100 + dx, 130], s: kf([[0, [0, 0, 100]], [12 + t0, [100, 112, 100]], [22 + t0, [96, 100, 100]], [34 + t0, [104, 110, 100]], [46 + t0, [98, 102, 100]], [60 + t0, [102, 108, 100]]], BOUNCE), r: kf([[0, 0], [20, amp], [40, -amp], [60, amp * 0.6], [80, 0]]), nm: "tongue" });
    const embers = Array.from({ length: 6 }, (_, k) => layer([group([ellipse(7 + (k % 3) * 2), fill(k % 2 ? C.gold : C.orange)])], { p: kf([[16 + k * 6, [100 + (k - 2.5) * 12, 120]], [60 + k * 6, [100 + (k - 2.5) * 22, 30]]]), o: kf([[16 + k * 6, 100], [60 + k * 6, 0]]), ip: 16 + k * 6, op: 61 + k * 6, nm: "ember" + k }));
    const ring = layer([group([ellipse(120), stroke(C.orange, 8)])], { p: [100, 120], s: scale3([[6, 30], [34, 140]]), o: kf([[6, 90], [34, 0]]), ip: 6, op: 35, nm: "ring" });
    return anim({ nm: "flame", op: 100 }, [ring, tongue(96, 88, C.orange, 0, 0, 3), tongue(62, 60, C.gold, 2, 4, -4), tongue(28, 30, C.cream, 3, 8, 5), ...embers]);
  }

  function trophy() {
    ind = 0;
    const cup = layer([
      group([path([[-26, -30], [26, -30], [22, 6, 0, 0, 0, 0], [0, 22, 14, 0, -14, 0], [-22, 6]]), fill(C.gold)]),
      group([ellipse(22, 26, [-30, -14]), stroke(C.goldInk, 7)]),
      group([ellipse(22, 26, [30, -14]), stroke(C.goldInk, 7)]),
      group([rect(12, 18, 2, [0, 30]), fill(C.goldInk)]),
      group([rect(44, 12, 4, [0, 44]), fill(C.orangeInk)]),
      group([rect(8, 26, 4, [-10, -12]), fill(C.white, 55)]),
      group([star(9, 4, 5), fill(C.white)], { p: [0, -8] }),
    ], { p: kf([[0, [100, -40]], [22, [100, 104]], [30, [100, 98]], [36, [100, 104]]], BOUNCE), s: kf([[20, [100, 100, 100]], [24, [118, 84, 100]], [32, [94, 106, 100]], [38, [100, 100, 100]]]), nm: "cup" });
    const shine = layer([group([rect(10, 80, 4), fill(C.white, 70)])], { p: kf([[40, [60, 96]], [60, [140, 96]]]), r: 20, o: kf([[40, 0], [46, 80], [60, 0]]), ip: 40, op: 61, nm: "shine" });
    return anim({ nm: "trophy", op: 110 }, [rays(100, 96, 98, C.gold, 20, 32), cup, shine, ...burst(100, 90, { t0: 24, n: 14, dist: 86 })]);
  }

  function levelUp() {
    ind = 0;
    const big = layer([group([star(52, 24, 5, 12), fill(C.gold)]), group([star(52, 24, 5, 12), stroke(C.goldInk, 6)]), group([ellipse(10, 14, [-10, -6]), fill(C.white, 70)])],
      { p: [100, 102], s: scale3([[0, 0], [18, 120], [26, 92], [34, 104], [40, 100]], BOUNCE), r: kf([[0, -90], [26, 8], [40, 0]]), nm: "star" });
    const ring = (t0, c) => layer([group([ellipse(110), stroke(c, 6)])], { p: [100, 102], s: scale3([[t0, 40], [t0 + 26, 170]]), o: kf([[t0, 100], [t0 + 26, 0]]), ip: t0, op: t0 + 27, nm: "ring" });
    return anim({ nm: "levelup", op: 100 }, [rays(100, 102, 96, C.orange, 10, 26), ring(14, C.gold), ring(22, C.green), big, ...burst(100, 102, { t0: 16, n: 14, dist: 90 })]);
  }

  function combo() {
    ind = 0;
    const f = flame();
    f.nm = "combo"; f.op = 70;
    ind = 100;
    const bolt = layer([group([path([[6, -30], [-14, 4], [0, 4], [-6, 30], [14, -6], [0, -6]]), fill(C.white)])], { p: [100, 116], s: scale3([[10, 0], [22, 110], [30, 100]], BOUNCE), nm: "bolt" });
    f.layers.unshift(bolt);
    return f;
  }

  window.CSL_LOTTIE = { chest: chest(), flame: flame(), trophy: trophy(), levelup: levelUp(), combo: combo() };
})();
