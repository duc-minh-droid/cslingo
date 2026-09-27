"""Dev server with caching disabled: python serve.py [port]  (index.html also works by double-clicking)."""
import functools, http.server, os, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8650
handler = functools.partial(NoCache, directory=os.path.dirname(os.path.abspath(__file__)))
print(f"Serving on http://localhost:{port}")
http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
