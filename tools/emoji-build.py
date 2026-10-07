"""Regenerate vendor/fluent-emoji.js from Microsoft Fluent Emoji (Flat), via the Iconify JSON package.

Usage:  python tools/emoji-build.py
To add an emoji: add  "<the emoji character(s)>": "<fluent-emoji-flat icon name>"  to MAP below and rerun.
Names: https://icon-sets.iconify.design/fluent-emoji-flat/  (e.g. "fire", "brain", "chart-increasing").
"""
import json, os, urllib.request

MAP = {
    "🧬": "dna", "🧠": "brain", "🐜": "ant", "💥": "collision", "📬": "open-mailbox-with-raised-flag",
    "🎩": "top-hat", "✂": "scissors", "✈": "airplane", "🔁": "repeat-button", "🐞": "lady-beetle",
    "💀": "skull", "🚐": "minibus", "🚚": "delivery-truck", "📈": "chart-increasing", "🤖": "robot",
    "🎯": "bullseye", "🐒": "monkey", "🦎": "lizard", "🚗": "automobile", "📡": "satellite-antenna",
    "📅": "calendar", "💧": "droplet", "🥾": "hiking-boot", "🔥": "fire", "🧊": "ice", "⚠": "warning",
    "🇬🇧": "crown", "🇺🇸": "statue-of-liberty",  # Fluent has no flags: London / New York stand-ins
}
# Topic icon for each lesson's path node (module id -> Fluent name). Add one when you add a module.
TOPICS = {
    "l1-what": "seedling", "l1-monkey": "monkey", "l1-ingredients": "test-tube", "l1-apps": "rocket",
    "l2-generic": "dna", "l2-optim": "bullseye", "l2-complexity": "hourglass-not-done", "l2-mst": "evergreen-tree", "l2-approx": "straight-ruler",
    "l3-recipe": "memo", "l3-tsp": "world-map", "l3-hc": "mountain", "l3-landscape": "snow-capped-mountain", "l3-neighbourhood": "house-with-garden",
    "l3-local": "compass", "l3-population": "busts-in-silhouette",
    "l4-types": "counterclockwise-arrows-button", "l4-replacement": "recycling-symbol", "l4-pressure": "flexed-biceps", "l4-roulette": "slot-machine",
    "l4-rank": "sports-medal", "l4-tournament": "crossed-swords", "l4-mutation": "microbe", "l4-crossover": "handshake", "l4-lab": "alembic",
    "ds-why": "thinking-face", "ds-blocks": "brick", "ds-reliability": "shield", "ds-load": "high-voltage", "ds-twitter": "bird",
    "ds-scaling": "building-construction", "ds-maintain": "wrench",
    "ds-models": "card-file-box", "ds-schema": "puzzle-piece", "ds-graph": "spider-web", "ds-nosql": "package",
    "ds-ops": "control-knobs", "ds-querylab": "magnifying-glass-tilted-right", "ds-engine": "gear",
    "ds-log": "scroll", "ds-hashidx": "file-cabinet", "ds-sstable": "books",
    "a1-code": "link", "a3-lab": "bullseye", "a4-build": "electric-plug", "a5-code": "gem-stone", "a6-wire": "satellite-antenna", "a7-build": "deciduous-tree", "a10-code": "eyes", "a11-picker": "compass",
    "a8-chain": "chains", "a9-mix": "level-slider", "a2-watch": "world-map", "a2-code": "laptop",
    "a1-anatomy": "magnifying-glass-tilted-left", "a1-bigo": "stopwatch", "a1-surfer": "person-surfing", "a1-pagerank": "globe-with-meridians",
    "a2-dijkstra": "round-pushpin", "a2-astar": "glowing-star", "a2-routing": "satellite-antenna",
    "a3-lp": "chart-increasing", "a3-simplex": "triangular-ruler", "a3-bracket": "left-right-arrow", "a3-nm": "triangular-flag",
    "a4-cut": "scissors", "a4-mst": "deciduous-tree", "a5-orient": "compass", "a5-wrap": "wrapped-gift", "a5-graham": "pushpin",
    "a6-crc": "check-mark-button", "a6-hamming": "hammer", "a7-entropy": "game-die", "a7-huffman": "evergreen-tree", "a7-lzw": "books",
    "a8-hash": "locked", "a8-keys": "key", "a9-dft": "water-wave", "a9-fft": "butterfly", "a10-attn": "eyes",
    "l5-valid": "puzzle-piece", "l5-direct": "clipboard", "l5-indirect": "calendar", "l5-nozzle": "rocket", "l5-antenna": "satellite-antenna", "l6-idea": "robot", "l6-random": "game-die", "l6-vary": "scissors", "l6-regress": "chart-increasing", "l6-prep": "memo", "a5-convex": "pushpin", "a5-edge": "straight-ruler", "a5-race": "stopwatch", "a5-onion": "onion", "a5-uses": "compass", "a4-intro": "seedling", "a4-prim": "herb", "a4-kruskal": "scissors", "a4-proof": "balance-scale", "a4-cost": "stopwatch", "a4-edge": "link", "a4-tsp": "world-map", "a6-noise": "satellite-antenna", "a6-parity": "balance-scale", "a6-crcpoly": "input-numbers", "a6-distance": "straight-ruler", "a6-game": "game-die", "a6-matrix": "abacus", "a6-codes": "package", "a7-redundancy": "package", "a7-binary-entropy": "game-die", "a7-source-coding": "balance-scale", "a7-kl": "bullseye", "a7-huffman-worked": "deciduous-tree", "a7-huffman-algo": "stopwatch", "a7-lzw-decode": "open-book", "a7-gif": "framed-picture", "a7-rate-distortion": "control-knobs", "a8-cipher": "locked", "a8-owf": "puzzle-piece", "a8-rsa": "locked-with-key", "a8-bitcoin": "coin", "a8-pow": "hammer-and-pick", "a9-series": "musical-note", "a9-cft": "abacus", "a9-leak": "magnifying-glass-tilted-left", "a9-filter": "level-slider", "a9-fftcode": "stopwatch", "a9-2d": "framed-picture", "a10-tokens": "input-latin-letters", "a10-softmax": "bar-chart", "a10-qkv": "key", "a10-heads": "eyes", "a10-block": "brick", "a10-decoder": "speech-balloon", "a10-uses": "globe-with-meridians", "a10-recap": "books", "a2-graphs": "world-map", "a2-astar-hand": "pencil", "a2-admissible": "compass", "a2-weighted": "balance-scale", "a2-astar-code": "laptop", "a2-internet": "globe-with-meridians", "a2-linkstate": "satellite-antenna", "a2-bellman": "envelope", "a2-hierarchy": "building-construction", "a3-formulate": "memo", "a3-standard": "wrench", "a3-slack": "puzzle-piece", "a3-bakery": "bread", "a3-implement": "laptop", "a3-apps": "briefcase", "a3-convex": "chart-decreasing", "a3-bisect": "scissors", "a3-brent": "bullseye", "a3-nm-ops": "triangular-ruler", "a3-nm-stop": "chequered-flag",
    "l5-encsand": "puzzle-piece", "l5-genomelab": "dna", "l5-tourlab": "laptop", "l6-wtree": "evergreen-tree", "l6-wevolve": "dna", "l6-wcode": "abacus",
}
URL = "https://cdn.jsdelivr.net/npm/@iconify-json/fluent-emoji-flat@1/icons.json"
OUT = os.path.join(os.path.dirname(__file__), "..", "vendor", "fluent-emoji.js")

data = json.load(urllib.request.urlopen(URL))
W, H = data.get("width", 32), data.get("height", 32)
svgs = {}
for name in sorted(set(MAP.values()) | set(TOPICS.values())):
    ic = data["icons"].get(name)
    if not ic:
        print("missing icon:", name); continue
    svgs[name] = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{ic.get("left", 0)} {ic.get("top", 0)} {ic.get("width", W)} {ic.get("height", H)}">{ic["body"]}</svg>'
with open(OUT, "w", encoding="utf-8") as f:
    f.write("/* Fluent Emoji (Flat) by Microsoft Corporation, MIT License. https://github.com/microsoft/fluentui-emoji\n"
            "   Generated by tools/emoji-build.py from @iconify-json/fluent-emoji-flat. Do not edit by hand. */\n")
    f.write("window.FLUENT_EMOJI = " + json.dumps({"map": MAP, "topics": {k: v for k, v in TOPICS.items() if v in svgs}, "svg": svgs}, ensure_ascii=False) + ";\n")
print(f"wrote {OUT}: {len(svgs)} icons")
