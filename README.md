# SOMA audio demo

Audio demonstrations for **Support-Constrained One-Sided Mass-Adaptive Guidance for Instruction-Guided Text-to-Speech**.

The page presents 90 paired baseline and +SOMA speech examples from CosyVoice2, CosyVoice3, and Qwen3-TTS-AC, grouped by APS, DSD, and RP, with English and Mandarin examples. It uses static HTML, CSS, JavaScript, and WAV files, so GitHub Pages can serve it directly from the repository root.

To rebuild `samples.json` and `audio/` from the source collection:

```text
node scripts/prepare-samples.mjs C:\path\to\some_sample
```

The script checks that each model and task contains ten samples and copies each `baseline.wav` and `method.wav` pair. The page publishes only instruction text and audio paths from the source collection.
