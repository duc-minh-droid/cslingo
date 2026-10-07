/* Lecture 6 · Genetic programming: the tree toolkit every scene of this video shares (window.VID.l6, short name L below).
   Two files: this one (tree literals, algorithms, layer, tile, pill) and common-2.js (L.tree, L.plot, the pictograms).
   Both are already loaded by videos/lecture-6.html before the scenes; scenes just use V.l6.

   ───────────────────────────── 1. TREE LITERALS (plain data) ─────────────────────────────
   A program is a nested literal  { label, kids: [...], id?, tone? }.  A node with kids is a FUNCTION (purple tile), a node
   without kids is a TERMINAL (blue tile). Labels: + - * / (shown as + − × ÷), % (protected divide, shown ÷), >, IF,
   variables (X, TIME, ...), numbers ("10", "-1", "0.5"). Never write "x" for times: write "*".
     L.N("+", [L.N("1"), L.N("2")], "id?")      build one node (kids array, optional id)
     L.parse("(+ 1 2 (IF (> TIME 10) 3 4))")      s-expression -> literal. Add #id to name a node: "(+#root X#a 1)"
   Nodes get an `id` the first time a function needs one (g1, g2, ... never repeated, so ids from different trees do not
   clash). Names you pick yourself (#id / the 3rd arg of N) must be unique within a tree, and across the two parents if you
   swap subtrees. Literals are never changed by the helpers below except for those ids; they return new trees.
     L.size(root) nodes in the tree   L.depth(root) edges on the longest path (a lone node is 0, the root is at depth 0)
     L.subtreeAt(root, id) -> node|null   L.walk(root, (node, parent, depth) => ...)   L.clone(root, fresh?)   L.ensureIds(root)
     L.replaceSubtree(root, id, sub) -> new tree          (subtree mutation)
     L.swapSubtrees(a, ida, b, idb) -> [newA, newB]       (subtree crossover; sizes change: size(a) - size(sa) + size(sb))

   ───────────────────────────── 2. ALGORITHMS (every number comes from here) ─────────────
     L.evalTree(root, env)   -> number | boolean   env = { X: 3, TIME: 11 }. + - * are n-ary, / is protected (a/0 = 1),
                                > gives true/false, IF has 4 kids (IF a > b THEN c ELSE d) or 3 kids (boolean, then, else).
                                A variable is found by exact name, else ignoring case (label x finds env.X).
     L.evalAll(root, env)    -> Map id -> value of EVERY node (for the "evaluate from the leaves up" animation)
     L.evalSteps(root, env)  -> [{id, label, value, text, height}] leaves first (height 0), then up, left to right
     L.fmtVal(v) -> "7" | "0.67" | "true" | "false" (2 decimals at most, real minus sign)
     L.formula(root) -> "x² + x + 1" (infix; single-letter variables lower-cased; x*x prints x², 2*x prints 2x)
     L.fn(rootOrFn, name = "X") -> x => number     L.sample(root, xs, name = "X") -> numbers     L.linspace(a, b, n)
     L.area(a, b, from, to) -> number   area between two curves (each a tree or a function); this is the lecture's "error"
     L.sae(root, [[x, y], ...]) -> sum of absolute errors over data points (the other fitness measure)
     L.TARGET (x => x² + x + 1), L.POINTS (11 points x = -1 ... 1), L.TARGET_TREE
     L.GEN0 = [{tree, formula, error}] the lecture's generation 0 in order: x + 1 (0.67), x² + 1 (1.00), 2 (1.70), x (2.67)

   ───────────────────────────── 3. DRAWING: layers, tiles, pills ──────────────────────────
   Everything draws into one shared SVG LAYER per parent element (the stage), so trees, tiles and pills all stack correctly
   (all edges under all tiles, `lift` above everything, value badges on top). Coordinates are the parent's (stage px, 936 x 640).
   Tones: "purple" "blue" "orange" "green" "red" "grey". Looks: "solid" (default, sticker), "soft" (tinted), "ghost" (dashed).
   Every draw call is PURE: it applies exactly the state you give it, nothing is remembered from an earlier frame.

     const tr = L.tree(stage, { root, x: 0, y: 0, w: 936, h: 640, node: 56, rows: 2, room: 45, grow: 1, hidden: false, valign: "top" })
       root   the literal (required). x,y,w,h the box the tree is fitted into (default the whole stage), centred in it.
       node   tile height in px (default 56). A wider label (TIME) gets a wider tile. Font is 0.56 x node (31 px at 56).
       rows   row pitch in tiles (default 2: leaves room for a value badge between rows).
       room   px kept free above the root for its value badge (default 0.8 x node = 45; pass 0 when you show no values).
       grow   largest scale-up when the tree is smaller than its box (default 1 = never bigger than `node`).
       hidden every node starts invisible (reveal them with set / reveal).   valign "top" | "middle".
       If the tree is too big for the box it is scaled down: tr.scale tells you (< 1), tr.tileSize is the real tile px.
     READ (static, from the layout): tr.nodes = [{id, label, op, kind: "fn"|"term", depth, parent (id|null), kids (ids),
       size (subtree nodes), cx, cy (tile centre, stage px), w, h (tile px)}] in pre-order; tr.node(id); tr.pos(id) -> {x, y};
       tr.sub(id) -> ids of the subtree (id first); tr.all(); tr.leaves(); tr.size(id); tr.row(depth) -> y of that row;
       tr.anchor(id) -> [x, y] bottom centre of a tile (where its child edges start); tr.deltaTo(otherTree, id) -> {dx, dy}|null.
     WRITE one frame:   tr.set(idOrIds, {...}); tr.value(...); tr.reveal(...); ...; tr.draw()   (draw applies and clears)
       set props:  o 0..1 opacity (0 hides) · s scale · r degrees · dx, dy offset in px from the layout position (the edge
       follows) · tone · look · label (text override) · pulse 0..1 (scale bump) · halo 0..1 (ring in the tone) · lift true
       (draw on top, for a subtree that travels over the other tree) · eo 0..1 (opacity of the edge INTO this node) ·
       ek 0..1 (how much of that edge is drawn, from the parent) · etone (colour of that edge) · attach [x, y] (start that
       edge at this point instead of at the parent, to re-attach a moved subtree to a new parent).
       Edges are grey; an edge is tinted when its node and its parent have the SAME explicit tone (select a whole subtree with
       tr.set(tr.sub(id), {tone: "orange"}) and its inner edges turn orange). A node literal may carry a default `tone`.
       An edge shows while both its ends do (min of their o). If you set ek the edge shows with its parent only (growing out).
       tr.value(id, text, k = 1, tone = "green")  small value badge above the node (28 px text, beside the edge so it never
                               hides it), pops in as k goes 0 -> 1. Use tone "red" for a bad value, "orange" for a chosen one.
       tr.edgeOpacity(id, o)   shorthand for set(id, {eo: o})
       tr.reveal(idOrIds, k)   grow a node in as k goes 0 -> 1: the edge grows out of the parent first, then the tile pops
       tr.reset()              forget the pending state without drawing
     A frame looks like:  tr.all().forEach(id => tr.reveal(id, ramp(t, 1 + i * 0.4, 1.5 + i * 0.4))); tr.draw();

     L.tile(stage, label, {size: 56, tone, look}) -> {g, w, h, apply({x, y, s, r, o, tone, look, label, pulse, halo})}
       a loose tile (palettes such as "function set" / "terminal set"); x, y is its CENTRE. Default tone: purple for an
       operator or IF, blue otherwise. apply() draws immediately.
     L.pill(stage, text, {fs: 28}) -> {g, apply({x, y, s, o, text, tone, look})}   a rounded value / label sticker, centred on x, y
     L.layer(stage) -> the shared layer {svg, edges, nodes, edgesTop, nodesTop, badges}; L.layer(stage, {fresh: true}) a new one
     Size note: pills and tile text do not shrink with a scaled-down tree (they stay 28 px); keep trees at scale >= 0.85.

   ───────────────────────────── 4. PLOTS AND PICTOGRAMS ────────────────────────────────────
     const pl = L.plot(stage, {x, y, w, h, xmin: -1, xmax: 1, ymin: 0, ymax: 3, grid: false, frame: true,
                               xticks: [-1, 0, 1], yticks: [0, 1, 2, 3]})      a sticker card with axes (its own SVG)
       pl.toPx(vx, vy) -> [x, y] in stage px (to put a label or an icon next to a point of the plot)
       pl.area = {x, y, w, h}  the inner drawing area in stage px (inside the card and the tick labels)
       pl.curve(fnOrTree, tone, o = 1, {w: 7, dash: false}) -> c;  c.set({o, k, fn, tone})  k 0..1 draws it left to right
       pl.points(data, tone, o = 1) -> p;  p.set({o, k, tone})  data = [[x, y], ...]; k 0..1 pops the dots in one by one
       pl.gap(fnA, fnB, tone, o = 1) -> g;  g.set({o, k, tone})  shades the area between two curves (k sweeps left to right)
       Create handles once in build(); in update(t) call .set() with values computed from t (set() with nothing = defaults).
     L.tick(size, tone, on) L.cross(...) L.arrow(...) L.scissors(...) -> an <svg> sized size x size (default 48; scissors 56),
       absolutely positioned at 0,0: append it to the stage and move it with V.place(el, {x, y, s, r, o}) (x, y = top-left).
       `on` true draws in the -on shade (for use on top of a saturated tile). The arrow points right (rotate with r).
       scissors(...).snip(k) closes the blades, k 0 = open ... 1 = shut (pure: call it each frame).
*/
(function () {
  const V = window.VID;
  const L = (V.l6 = V.l6 || {});
  const { s } = V;
  const TONES = ["purple", "blue", "orange", "green", "red", "grey"];
  const css = (e, o) => (Object.assign(e.style, o), e);
  const f1 = (v) => v.toFixed(1);
  const tone = (t) => {
    if (!TONES.includes(t)) throw new Error(`VID.l6: unknown tone "${t}" (use ${TONES.join(", ")})`);
    return t;
  };
  let uid = 0;

  // ================= 1. tree literals =================
  const N = (label, kids = [], id) => (id ? { label: String(label), kids, id } : { label: String(label), kids });
  function parse(src) {
    const toks = src.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/);
    let i = 0;
    const atom = (tok) => {
      const [label, id] = tok.split("#");
      return N(label, [], id);
    };
    const read = () => {
      const tok = toks[i++];
      if (tok === undefined || tok === ")") throw new Error(`VID.l6.parse: unbalanced brackets in "${src}"`);
      if (tok !== "(") return atom(tok);
      const head = atom(toks[i++]);
      while (toks[i] !== ")") {
        if (i >= toks.length) throw new Error(`VID.l6.parse: missing ")" in "${src}"`);
        head.kids.push(read());
      }
      i++;
      return head;
    };
    const root = read();
    if (i < toks.length) throw new Error(`VID.l6.parse: extra text after the tree in "${src}"`);
    return root;
  }
  function walk(n, fn, parent = null, depth = 0) {
    fn(n, parent, depth);
    n.kids.forEach((k) => walk(k, fn, n, depth + 1));
  }
  const ensureIds = (root) => {
    walk(root, (n) => {
      if (!n.id) n.id = `g${++uid}`;
    });
    return root;
  };
  const size = (n) => 1 + n.kids.reduce((a, k) => a + size(k), 0);
  const depth = (n) => (n.kids.length ? 1 + Math.max(...n.kids.map(depth)) : 0);
  const clone = (n, fresh) => {
    const c = { ...n, kids: n.kids.map((k) => clone(k, fresh)) };
    if (fresh) delete c.id;
    return c;
  };
  function subtreeAt(root, id) {
    let hit = null;
    walk(ensureIds(root), (n) => {
      if (n.id === id && !hit) hit = n;
    });
    return hit;
  }
  function replaceSubtree(root, id, sub) {
    if (!subtreeAt(root, id)) throw new Error(`VID.l6.replaceSubtree: no node "${id}"`);
    ensureIds(sub);
    const rec = (n) => (n.id === id ? clone(sub) : { ...n, kids: n.kids.map(rec) });
    return rec(root);
  }
  function swapSubtrees(a, ida, b, idb) {
    const sa = subtreeAt(a, ida);
    const sb = subtreeAt(b, idb);
    if (!sa || !sb) throw new Error(`VID.l6.swapSubtrees: missing node "${sa ? idb : ida}"`);
    return [replaceSubtree(a, ida, sb), replaceSubtree(b, idb, sa)];
  }

  // ================= 2. algorithms =================
  const OPS = {
    "+": "+", PLUS: "+", "-": "-", "−": "-", MINUS: "-", "*": "*", "×": "*", TIMES: "*",
    "/": "/", "÷": "/", "%": "/", DIV: "/", IF: "IF", if: "IF", ">": ">",
  }; // prettier-ignore
  const opOf = (label) => (Object.hasOwn(OPS, label) ? OPS[label] : null);
  const isNum = (label) => /^[-−]?\d+(\.\d+)?$/.test(label);
  const toNum = (label) => Number(label.replace("−", "-"));
  function lookup(env, label) {
    if (Object.hasOwn(env, label)) return env[label];
    const key = Object.keys(env).find((k) => k.toLowerCase() === label.toLowerCase());
    if (key === undefined) throw new Error(`VID.l6.evalTree: no value for "${label}" in env {${Object.keys(env)}}`);
    return env[key];
  }
  function evalInto(n, env, out) {
    const k = n.kids.map((c) => evalInto(c, env, out));
    const op = k.length ? opOf(n.label) : null;
    const a = k.map(Number);
    let v;
    if (!k.length) v = isNum(n.label) ? toNum(n.label) : lookup(env, n.label);
    else if (op === "+") v = a.reduce((x, y) => x + y);
    else if (op === "-") v = a.reduce((x, y) => x - y);
    else if (op === "*") v = a.reduce((x, y) => x * y);
    else if (op === "/") v = a.reduce((x, y) => (y === 0 ? 1 : x / y));
    else if (op === ">" && k.length === 2) v = k[0] > k[1];
    else if (op === "IF" && k.length === 4) v = k[0] > k[1] ? k[2] : k[3];
    else if (op === "IF" && k.length === 3) v = k[0] ? k[1] : k[2];
    else throw new Error(`VID.l6.evalTree: cannot evaluate "${n.label}" with ${k.length} children`);
    if (out) out.set(n.id, v);
    return v;
  }
  const evalTree = (root, env = {}) => evalInto(root, env, null);
  const evalAll = (root, env = {}) => {
    const out = new Map();
    evalInto(ensureIds(root), env, out);
    return out;
  };
  const fmtVal = (v) => (typeof v === "boolean" ? String(v) : String(Math.round(v * 100) / 100 || 0).replace("-", "−"));
  function evalSteps(root, env) {
    const vals = evalAll(root, env);
    const list = [];
    const height = (n) => {
      const ht = n.kids.length ? 1 + Math.max(...n.kids.map(height)) : 0;
      list.push({ id: n.id, label: n.label, value: vals.get(n.id), text: fmtVal(vals.get(n.id)), height: ht });
      return ht;
    };
    height(root); // post-order: left to right, each node after its kids
    return list.sort((p, q) => p.height - q.height); // stable: keeps left to right inside one height
  }
  const PREC = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const JOIN = { "+": " + ", "-": " − ", "*": " × ", "/": " ÷ " };
  function fx(n) {
    if (!n.kids.length) {
      const t = isNum(n.label) ? n.label.replace("-", "−") : n.label.length === 1 ? n.label.toLowerCase() : n.label;
      return { t, p: 3 };
    }
    const k = n.kids.map(fx);
    const op = opOf(n.label);
    if (op === "*" && k.length === 2) {
      const [l, r] = n.kids;
      if (k[0].t === k[1].t && k[0].p === 3) return { t: `${k[0].t}²`, p: 3 };
      if (isNum(l.label) && !l.kids.length && !r.kids.length && !isNum(r.label) && r.label.length === 1)
        return { t: k[0].t + k[1].t, p: 2 };
    }
    if (PREC[op]) {
      const p = PREC[op];
      const wrap = (c, i) => (c.p < p || (i > 0 && c.p === p && (op === "-" || op === "/")) ? `(${c.t})` : c.t);
      return { t: k.map(wrap).join(JOIN[op]), p };
    }
    if (op === ">") return { t: `${k[0].t} > ${k[1].t}`, p: 0 };
    if (op === "IF" && k.length === 4) return { t: `IF(${k[0].t} > ${k[1].t}, ${k[2].t}, ${k[3].t})`, p: 3 };
    return { t: `${n.label}(${k.map((c) => c.t).join(", ")})`, p: 3 };
  }
  const formula = (root) => fx(root).t;
  const fn = (f, name = "X") => (typeof f === "function" ? f : (x) => Number(evalTree(f, { [name]: x })));
  const sample = (root, xs, name) => xs.map(fn(root, name));
  const linspace = (a, b, n) =>
    Array.from({ length: n }, (_, i) => Math.round((a + ((b - a) * i) / (n - 1)) * 1e9) / 1e9);
  function area(a, b, from, to, n = 2000) {
    const fa = fn(a);
    const fb = fn(b);
    const dx = (to - from) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.abs(fa(from + (i + 0.5) * dx) - fb(from + (i + 0.5) * dx)) * dx;
    return sum;
  }
  const sae = (root, data) => data.reduce((acc, [x, y]) => acc + Math.abs(fn(root)(x) - y), 0);
  const TARGET = (x) => x * x + x + 1;
  const TARGET_TREE = parse("(+ (+ (* X X) X) 1)");
  const GEN0 = ["(+ X 1)", "(+ (* X X) 1)", "2", "X"].map((src) => {
    const tree = parse(src);
    return { tree, formula: formula(tree), error: area(tree, TARGET, -1, 1) };
  });

  // ================= 3. drawing: layer, tile, pill =================
  const layers = new WeakMap();
  function layer(parent, o = {}) {
    if (parent.svg) return parent;
    if (!o.fresh && layers.has(parent)) return layers.get(parent);
    const W = o.w || V.STAGE.w;
    const H = o.h || V.STAGE.h;
    const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const lay = { svg };
    ["edges", "nodes", "edgesTop", "nodesTop", "badges"].forEach((k) => (lay[k] = svg.appendChild(s("g"))));
    parent.append(svg);
    layers.set(parent, lay);
    return lay;
  }
  const LOOKS = {
    solid: { fill: "var(--c)", stroke: "var(--c-lip)", lip: "var(--c-lip)", ink: "var(--c-on)", dash: "" },
    soft: { fill: "var(--c-dim)", stroke: "var(--c-edge)", lip: "var(--c-edge)", ink: "var(--c-ink)", dash: "" },
    ghost: { fill: "none", stroke: "var(--c-edge)", lip: "none", ink: "var(--c-ink)", dash: "9 7" },
  };
  const SYMBOL = /^[+\-−*×/÷%>]$/;
  const tileW = (label, sz) => Math.max(sz, sz * (0.3 + 0.347 * label.length));
  const kindTone = (label) => (opOf(label) ? "purple" : "blue");
  /* the label of a tile: operators are drawn as shapes (they look the same on every machine), the rest as bold text */
  function glyph(label, sz) {
    const u = sz * 0.2;
    const sw = Math.max(3, sz * 0.115);
    const line = (d) =>
      s("path", {
        d,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": sw,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      });
    const dot = (y) => s("circle", { cx: 0, cy: y, r: sw * 0.62, fill: "currentColor" });
    const op = SYMBOL.test(label) ? opOf(label) : null;
    if (op === "+") return [line(`M${-u} 0H${u}M0 ${-u}V${u}`)];
    if (op === "-") return [line(`M${-u} 0H${u}`)];
    if (op === "*")
      return [
        line(`M${-u * 0.85} ${-u * 0.85}L${u * 0.85} ${u * 0.85}M${u * 0.85} ${-u * 0.85}L${-u * 0.85} ${u * 0.85}`),
      ];
    if (op === "/") return [line(`M${-u * 1.1} 0H${u * 1.1}`), dot(-u * 0.95), dot(u * 0.95)];
    if (op === ">") return [line(`M${-u * 0.6} ${-u * 1.05}L${u * 0.75} 0L${-u * 0.6} ${u * 1.05}`)];
    const fs = sz * 0.56;
    const shown = isNum(label) ? label.replace("-", "−") : label;
    const text = s(
      "text",
      { "text-anchor": "middle", y: f1(fs * (/[A-Z0-9]/.test(label) ? 0.35 : 0.26)), fill: "currentColor" },
      shown,
    );
    css(text, { fontSize: `${f1(fs)}px`, fontWeight: "900" });
    return [text];
  }
  function makeTile(group, label, sz, tone0, look0) {
    const w = tileW(label, sz);
    const lip = Math.max(3, Math.round(sz * 0.1));
    const rx = sz * 0.3;
    const rect = (dy) => s("rect", { x: -w / 2, y: -sz / 2 + dy, width: w, height: sz, rx });
    const halo = s("rect", { fill: "none", "stroke-width": Math.max(4, sz * 0.09) });
    const lipR = rect(lip);
    const face = rect(0);
    const body = s("g");
    const g = s("g", {}, halo, lipR, face, body);
    face.setAttribute("stroke-width", Math.max(3, sz * 0.055));
    group.append(g);
    const memo = {};
    return {
      g,
      w,
      h: sz,
      apply(st = {}) {
        const tn = tone(st.tone || tone0);
        const lk = LOOKS[st.look || look0];
        const lb = st.label ?? label;
        if (memo.tn !== tn) g.setAttribute("class", `c-${(memo.tn = tn)}`);
        if (memo.lk !== lk) {
          css(face, { fill: lk.fill, stroke: lk.stroke });
          css(lipR, { fill: lk.lip });
          css(g, { color: lk.ink });
          face.setAttribute("stroke-dasharray", lk.dash);
          memo.lk = lk;
        }
        if (memo.lb !== lb) body.replaceChildren(...glyph((memo.lb = lb), sz));
        const hk = st.halo || 0;
        const pad = 5 + 8 * hk;
        for (const [k, v] of Object.entries({
          x: -w / 2 - pad,
          y: -sz / 2 - pad,
          width: w + 2 * pad,
          height: sz + 2 * pad,
          rx: rx + pad,
        }))
          halo.setAttribute(k, f1(v));
        css(halo, { stroke: "var(--c)", opacity: String(hk), visibility: hk > 0.001 ? "" : "hidden" });
        const sc = (st.s ?? 1) * (1 + 0.16 * (st.pulse || 0));
        g.setAttribute(
          "transform",
          `translate(${f1(st.x || 0)} ${f1(st.y || 0)}) rotate(${st.r || 0}) scale(${sc.toFixed(3)})`,
        );
        V.show(g, st.o ?? 1);
      },
    };
  }
  const pillW = (text, fs) => Math.max(fs + 16, text.length * fs * 0.6 + 26);
  function makePill(group, fs = 28) {
    const hh = fs + 12;
    const lipR = s("rect", { height: hh, rx: hh / 2 });
    const face = s("rect", { height: hh, rx: hh / 2, "stroke-width": 3 });
    const text = s("text", { "text-anchor": "middle", y: f1(fs * 0.35), fill: "currentColor" });
    css(text, { fontSize: `${fs}px`, fontWeight: "900" });
    const g = s("g", {}, lipR, face, text);
    group.append(g);
    return {
      g,
      apply(st = {}) {
        const t = String(st.text ?? "");
        const w = pillW(t, fs);
        const lk = LOOKS[st.look || "solid"];
        g.setAttribute("class", `c-${tone(st.tone || "green")}`);
        for (const [e, dy] of [
          [lipR, 3],
          [face, 0],
        ]) {
          e.setAttribute("x", f1(-w / 2));
          e.setAttribute("y", f1(-hh / 2 + dy));
          e.setAttribute("width", f1(w));
        }
        css(face, { fill: lk.fill, stroke: lk.stroke });
        css(lipR, { fill: lk.lip });
        css(g, { color: lk.ink });
        if (text.textContent !== t) text.textContent = t;
        g.setAttribute("transform", `translate(${f1(st.x || 0)} ${f1(st.y || 0)}) scale(${(st.s ?? 1).toFixed(3)})`);
        V.show(g, st.o ?? 1);
      },
    };
  }

  Object.assign(L, {
    TONES, N, parse, walk, ensureIds, size, depth, clone, subtreeAt, replaceSubtree, swapSubtrees, opOf,
    evalTree, evalAll, evalSteps, fmtVal, formula, fn, sample, linspace, area, sae, TARGET, TARGET_TREE, GEN0,
    POINTS: linspace(-1, 1, 11).map((x) => [x, TARGET(x)]),
    layer,
    tile: (parent, label, o = {}) => makeTile(layer(parent).nodes, label, o.size || 56, o.tone || kindTone(label), o.look || "solid"),
    pill: (parent, text, o = {}) => {
      const p = makePill(layer(parent).badges, o.fs || 28);
      p.apply({ text, ...o });
      return p;
    },
    $: { css, f1, tone, nextId: () => ++uid, tileW, pillW }, // internals for common-2.js (not for scenes)
  }); // prettier-ignore
})();
