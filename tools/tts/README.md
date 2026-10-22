# Local voice-over (open-source TTS)

`tools/narrate.js --engine qwen|chatterbox|kokoro` hands its lines to `tools/tts/speak.py`, which runs the model on this machine.
Nothing is sent to an API.

## Which engine

Measured against this laptop (RTX 4060 Laptop, 8 GB VRAM, 24 GB RAM): all three run locally, no VM needed.

| Engine | Size | Fits 8 GB? | Good for |
|---|---|---|---|
| Qwen3-TTS 1.7B **Base** (voice clone) | 1.7B | yes, in bf16 | **What every recap video uses.** Clones `videos/voice-ref/narrator.wav`, so every line and every video has the same voice (VoiceDesign invents a slightly different voice per call) |
| Chatterbox (original, 0.5B) | 0.5B | yes | Dramatic delivery (`exaggeration` 0.7+, `cfg_weight` ~0.3); can clone from a 10 s clip you have the right to use. Adds an inaudible watermark |
| Kokoro | 82M | yes (runs on CPU too) | Fastest, very stable, but plain delivery; fixed voices |

## Setup (once)

`bash tools/tts/setup.sh` does all of this on Linux, macOS and Git Bash (CUDA PyTorch when `nvidia-smi` exists). By hand on Windows:

```bash
python -m venv tools/tts/.venv
tools/tts/.venv/Scripts/python -m pip install --upgrade pip
tools/tts/.venv/Scripts/python -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
tools/tts/.venv/Scripts/python -m pip install soundfile numpy librosa
tools/tts/.venv/Scripts/python -m pip install qwen-tts        # or: chatterbox-tts   or: kokoro>=0.9.4 (needs espeak-ng)
```

Then point narrate.js at that Python: `TTS_PYTHON=tools/tts/.venv/Scripts/python` (put it in `.env.local`). The first run downloads
the model weights from Hugging Face (Qwen 1.7B is a few GB).

## The narrator voice

Set it per engine in `videos/narration/<name>.json`:

```json
"engine": "qwen",
"voices": {
  "qwen": { "model": "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", "language": "English",
            "instruct": "Deep, calm, confident male narrator of a dark anime. Measured and slightly theatrical, every sentence lands with weight, short dramatic pauses before key terms." },
  "chatterbox": { "exaggeration": 0.75, "cfg_weight": 0.3 },
  "kokoro": { "voice": "am_michael", "lang": "a" }
},
"pace": { "pause": 0.8, "lead": 0.9, "tail": 1.4, "speed": 0.88 }
```

Only clone from a recording you made or have permission to use. Do not clone a real actor's voice from a fan model.

## Music and beat sync

1. Put a track you are licensed to use in `videos/music/` (royalty-free / CC0 / bought with a licence).
2. `tools/tts/.venv/Scripts/python tools/tts/beats.py videos/music/<track>.mp3 --start 0 --length 300` writes the beat times.
3. In the narration script: `"music": {"file": "videos/music/<track>.mp3", "beats": "videos/music/<track>.beats.json", "start": 0, "volume": 0.18}`.
4. `node tools/narrate.js <name>` stretches each scene so its cut lands on the next beat; `tools/render-video.js` mixes the
   music under the voice (ducked while the narrator speaks, faded out at the end), using only as much of the track as the video needs.

## Voicing the recap videos

`tools/voice-video.sh <name>` (voice, check with faster-whisper, record) and `tools/voice-all.sh <name> ...` (several, skipping finished ones) drive
`tools/narrate.js`, `tools/tts/verify.py` and `tools/render-video.js`; they find `tools/tts/.venv` on Linux, macOS and Windows (Git Bash) by themselves.
Clips are cached in `videos/audio/clips/` (git-ignored) by a hash of the text, so an interrupted run resumes where it stopped. The list of videos and the
exact commands are in `TODO.md`.
