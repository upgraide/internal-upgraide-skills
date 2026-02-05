---
name: generating-audio
description: Generates speech from text using Fish Audio TTS with voice cloning. Use when creating voiceovers, narration, or custom voice content.
---

# Generating Audio

Generate professional speech from text using Fish Audio's TTS API. Create custom voice models from audio samples for consistent branding.

## Quick Start

**Generate speech:**
```bash
tsx scripts/tts.ts --text "Welcome to our product demo" --output audio/narration.mp3
```

**Create custom voice:**
```bash
tsx scripts/create-voice.ts --audio inputs/voice-sample.mp3 --name "Professional Voice"
```

**List available voices:**
```bash
tsx scripts/list-voices.ts
```

## Requirements

**Environment:**
```
FISH_AUDIO_API_KEY=your_api_key_here
```
Get your API key from https://fish.audio

**Dependencies:**
```bash
npm install dotenv
```

## TTS Generation

Low-freedom operation — API calls are fragile, use exact commands.

**Basic:**
```bash
tsx scripts/tts.ts --text "Your narration text" --output path/to/output.mp3
```

**With custom voice:**
```bash
tsx scripts/tts.ts --text "Your text" --voice-id "voice-model-id" --output audio/narration.mp3
```

**Parameters:**
- `--text` (required): Text to convert
- `--output` (required): Output file path
- `--model`: `speech-1.5` (default, balanced) | `speech-1.6` (natural) | `s1` (premium)
- `--voice-id`: Custom voice model ID
- `--format`: `mp3` (default) | `wav` | `opus` | `pcm`
- `--temperature`: Randomness 0-1 (default: 0.7, s1: 0.9)
- `--top-p`: Nucleus sampling 0-1 (default: 0.7, s1: 0.9)

**Model details:** See [resources/models.md](resources/models.md)

## Emotion Control

Add emotions using text markers. Fish Audio supports 64+ expressions.

```bash
tsx scripts/tts.ts \
  --text "(excited) Welcome back! (happy) Today we explore something amazing." \
  --output audio/emotional.mp3
```

**Common tags:**
- `(happy)`, `(sad)`, `(angry)`, `(excited)`, `(calm)`, `(nervous)`
- `(confident)`, `(surprised)`, `(worried)`, `(grateful)`, `(curious)`

**Effects:** `(laughing)`, `(whispering)`, `(shouting)`, `(sighing)`

**Important:** Emotion tags must be at the beginning of sentences for English.

**Full reference:** [resources/emotions.md](resources/emotions.md)

## Voice Cloning

Medium-freedom operation — validation needed, some flexibility in audio quality.

**Step 1: Prepare audio sample**
- Duration: 15-30 seconds (optimal)
- Format: mp3, wav, or similar
- Quality: Clear speech, minimal background noise

**Step 2: Create voice model**
```bash
tsx scripts/create-voice.ts \
  --audio inputs/voice-sample.mp3 \
  --name "Corporate Male Voice" \
  --description "Clear, confident narration style"
```

**Step 3: Use in TTS**
```bash
tsx scripts/tts.ts --text "Hello" --voice-id "returned-voice-id" --output audio/test.mp3
```

**Advanced tips:** [resources/voice-guide.md](resources/voice-guide.md)

## Voice Discovery

```bash
# All voices
tsx scripts/list-voices.ts

# Custom voices only
tsx scripts/list-voices.ts --self
```

## Error Handling

Scripts include retry logic with exponential backoff (5 attempts).

**"API key not found"**: Set `FISH_AUDIO_API_KEY` in `.env`

**"Audio file too short"**: Use 15-30 second samples for voice cloning

**"Invalid format"**: Check format is mp3, wav, opus, or pcm

**"Rate limit exceeded"**: Scripts automatically retry

**"Model not found"**: Verify voice ID with `list-voices.ts`

## Common Use Cases

**Narration from file:**
```bash
tsx scripts/tts.ts --text "$(cat narration.txt)" --voice-id "custom-voice" --output narration.mp3
```

**Multi-language:**
```bash
tsx scripts/tts.ts --text "Bonjour, bienvenue" --model "speech-1.6" --output french-intro.mp3
```

**High-quality:**
```bash
tsx scripts/tts.ts --text "Premium content" --model "s1" --format "wav" --output premium.wav
```

## Resources

- [resources/api-reference.md](resources/api-reference.md) — Complete API details
- [resources/voice-guide.md](resources/voice-guide.md) — Voice cloning best practices
- [resources/models.md](resources/models.md) — Model comparison
- [resources/emotions.md](resources/emotions.md) — All 64+ emotion tags
