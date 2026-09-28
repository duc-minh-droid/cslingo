"""Stamp a build id onto every asset URL in index.html so browsers never mix old and new files after a deploy.

Usage:  python tools/stamp.py [DIR]     (DIR defaults to the Visualizer folder; run it on the publish copy)
Rewrites every  ?v=<anything>  in DIR/index.html to  ?v=<git short hash>-<timestamp>.
NIC.lazy() and the service worker read the same id from js/core.js's own URL.
"""
import os, re, subprocess, sys, time

here = os.path.dirname(os.path.abspath(__file__))
root = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "..")
try:
    h = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=here, text=True).strip()
except Exception:
    h = "nogit"
build = f"{h}-{time.strftime('%y%m%d%H%M')}"
p = os.path.join(root, "index.html")
s = open(p, encoding="utf-8").read()
s, n = re.subn(r"\?v=[A-Za-z0-9_-]+", "?v=" + build, s)
open(p, "w", encoding="utf-8").write(s)
print(f"stamped {n} URLs with v={build}")
