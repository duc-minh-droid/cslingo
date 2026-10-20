"""Local text-to-speech for tools/narrate.js. Reads one JSON job on stdin and writes one WAV per line:

    {"engine": "qwen" | "chatterbox" | "kokoro",
     "voice": {...engine settings, from "voices" in videos/narration/<name>.json...},
     "speed": 0.9,
     "lines": [{"text": "...", "out": "videos/audio/clips/<hash>.wav"}, ...]}

The model loads once per job. Setup (venv, PyTorch with CUDA, the engine's package): tools/tts/README.md.
Voice settings per engine:
    qwen        {"model": "Qwen/Qwen3-TTS-12Hz-1.7B-Base", "ref": "videos/voice-ref/narrator.wav", "ref_text": "<what the clip says>"}
                (clone: the same voice on every line; ref_text optional but better), or
                {"model": "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", "instruct": "<what the voice sounds like>", "language": "English"}
                or a preset speaker: {"model": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice", "speaker": "Ryan", "instruct": "<delivery>"}
    chatterbox  {"exaggeration": 0.7, "cfg_weight": 0.3, "ref": "<10 s wav of a voice you have the right to use>"}  (ref optional)
    kokoro      {"voice": "am_michael", "lang": "a"}
"""

import json
import os
import sys

import numpy as np
import soundfile as sf

# the models are public: never send a stored (possibly expired) Hugging Face login with the download
os.environ.setdefault("HF_HUB_DISABLE_IMPLICIT_TOKEN", "1")


def qwen(voice, speed):
    import torch
    from qwen_tts import Qwen3TTSModel

    model_id = voice.get("model", "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign")
    # a GPU when there is one (bf16), else the CPU (float32: slower, but a cloud machine without a GPU still works)
    gpu = torch.cuda.is_available()
    model = Qwen3TTSModel.from_pretrained(
        model_id, device_map="cuda:0" if gpu else "cpu", dtype=torch.bfloat16 if gpu else torch.float32
    )
    lang = voice.get("language", "English")
    # Qwen has no speed control: the pace goes into the description
    pace = (
        " Speak slowly, with deliberate pauses."
        if speed < 0.97
        else " Speak fast, with intense, urgent, dramatic energy." if speed > 1.03 else ""
    )

    clone = None
    if voice.get("ref"):
        # one reference clip -> one voice for every line (VoiceDesign invents a slightly different voice on each call)
        ref_text = voice.get("ref_text")
        clone = model.create_voice_clone_prompt(ref_audio=voice["ref"], ref_text=ref_text, x_vector_only_mode=not ref_text)

    def say(text):
        if clone is not None:
            wavs, sr = model.generate_voice_clone(text=text, language=lang, voice_clone_prompt=clone)
        elif "VoiceDesign" in model_id:
            wavs, sr = model.generate_voice_design(text=text, language=lang, instruct=voice["instruct"] + pace)
        else:
            wavs, sr = model.generate_custom_voice(
                text=text, language=lang, speaker=voice.get("speaker", "Ryan"), instruct=voice.get("instruct", "") + pace
            )
        return wavs[0], sr

    return say


def chatterbox(voice, speed):
    import torch
    from chatterbox.tts import ChatterboxTTS

    model = ChatterboxTTS.from_pretrained(device="cuda" if torch.cuda.is_available() else "cpu")
    kw = {"exaggeration": voice.get("exaggeration", 0.7), "cfg_weight": voice.get("cfg_weight", 0.3)}
    if voice.get("ref"):
        kw["audio_prompt_path"] = voice["ref"]

    def say(text):
        wav = model.generate(text, **kw)
        return wav.squeeze(0).cpu().numpy(), model.sr

    return say


def kokoro(voice, speed):
    from kokoro import KPipeline

    pipe = KPipeline(lang_code=voice.get("lang", "a"))

    def say(text):
        parts = [audio for _, _, audio in pipe(text, voice=voice.get("voice", "am_michael"), speed=speed)]
        return np.concatenate([np.asarray(p) for p in parts]), 24000

    return say


ENGINES = {"qwen": qwen, "chatterbox": chatterbox, "kokoro": kokoro}


def main():
    job = json.load(sys.stdin)
    say = ENGINES[job["engine"]](job.get("voice") or {}, float(job.get("speed", 1)))
    for k, line in enumerate(job["lines"], 1):
        audio, sr = say(line["text"])
        sf.write(line["out"], np.asarray(audio, dtype=np.float32), sr, subtype="PCM_16")
        print(f"  [{k}/{len(job['lines'])}] {line['text'][:60]}", flush=True)


if __name__ == "__main__":
    main()
