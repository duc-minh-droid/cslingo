#!/usr/bin/env bash
# One-time setup of the local TTS environment (Linux/macOS/cloud; on Windows use the commands in README.md).
# Creates tools/tts/.venv with PyTorch (CUDA build when an NVIDIA GPU is present, CPU build otherwise) and the TTS packages.
set -euo pipefail
cd "$(dirname "$0")"
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
if command -v nvidia-smi >/dev/null 2>&1; then
  .venv/bin/python -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
else
  .venv/bin/python -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
fi
.venv/bin/python -m pip install -r requirements.txt
echo "done: export TTS_PYTHON=tools/tts/.venv/bin/python"
echo "      export FFMPEG=\$(tools/tts/.venv/bin/python -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')"
