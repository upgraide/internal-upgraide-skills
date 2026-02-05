---
name: generating-avatar
description: Generates talking head avatar videos with lip-sync using InfiniteTalk on RunPod. Use when creating videos of a person speaking from an image and audio file.
---

# Generating Avatar

Generate lip-synced talking head videos from a static image and audio file.

## Quick Start

```bash
tsx scripts/generate-avatar.ts \
  --image public/avatar/person.jpg \
  --audio public/audio/narration.mp3 \
  --output public/avatar/talking.mp4
```

## Requirements

**Environment:**
```
RUNPOD_AVATAR_API_KEY=your_api_key_here
```

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--image` | Yes | - | Path to person image (jpg/png) |
| `--audio` | Yes | - | Path to audio file (wav/mp3) |
| `--output` | Yes | - | Output video path |
| `--prompt` | No | "A person is talking naturally" | Action description |
| `--width` | No | 512 | Output width |
| `--height` | No | 512 | Output height |

**Common resolutions:**
- `512x512` — Square (default, fastest)
- `1280x720` — Landscape HD
- `720x1280` — Portrait HD (Reels)

## Workflow

1. Prepare inputs:
   - Image: Clear face, front-facing preferred
   - Audio: Generated via `generating-audio` skill or existing file

2. Generate avatar:
   ```bash
   tsx scripts/generate-avatar.ts \
     --image public/avatar/speaker.png \
     --audio public/audio/script.mp3 \
     --output public/avatar/result.mp4
   ```

3. Script handles:
   - Converts files to base64
   - Submits job to RunPod
   - Polls for completion (up to 10 minutes)
   - Downloads result

## Error Handling

Scripts retry with exponential backoff.

**"API key not found"**: Set `RUNPOD_AVATAR_API_KEY` in `.env`

**"Job failed"**: Check image quality and audio format

**Timeout**: Large files may take longer, script waits up to 10 minutes
