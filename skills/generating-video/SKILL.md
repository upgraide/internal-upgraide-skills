---
name: generating-video
description: Generates B-roll videos using VEO3, SORA 2, and Wan 2.5. Use when creating video content, B-roll, or cinematic footage. Note: Wan 2.5 does NOT do lip-sync - for talking heads, use Hedra or D-ID.
---

# Generating Video

## Model Selection

| Model | Use Case | Duration | Input |
|-------|----------|----------|-------|
| **VEO3** | Best quality, extensions | 8s + 7s extensions | Image → Video |
| **SORA 2** | Fast iteration | 5-10s | Text → Video |
| **SORA 2 Pro** | Higher quality | 5-10s | Text → Video |
| **Wan 2.5** | Audio-synced animation | 3-10s | Image + Audio → Video |

**Key rules:**
- VEO3 for professional B-roll with continuity
- SORA for quick text-to-video iteration
- Wan 2.5 animates images with background audio (NOT lip-sync)
- For lip-sync talking heads → use external services (Hedra, D-ID)

## Requirements

**Environment:**
```
GOOGLE_GENAI_API_KEY=your_key     # VEO3
OPENAI_API_KEY=your_key           # SORA (with SORA access)
DASHSCOPE_API_KEY=your_key        # Wan 2.5 (Singapore region)
REPLICATE_API_TOKEN=your_key      # SeedDream images
```

**Dependencies:**
```bash
npm install @google/genai openai
```

## Commands

### VEO3 (Image → Video)

**Generate 8s video:**
```bash
tsx scripts/generate-veo3.ts \
  --prompt "Professional cinematic description" \
  --image ./first-frame.png \
  --aspect-ratio "9:16" \
  --resolution "720p" \
  --duration "8"
```

**Extend video (+7s):**
```bash
# Analyze last frame first
tsx scripts/analyze-last-frame.ts --video public/broll/video.mp4

# Extend with continuation prompt
tsx scripts/extend-veo3-rest.ts \
  --video-uri "https://generativelanguage.googleapis.com/.../download?alt=media" \
  --prompt "Natural continuation based on last frame"
```

Chain 2-3 extensions for 15-22s videos.

### SORA 2 (Text → Video)

```bash
tsx scripts/generate.ts \
  --prompt "Wide shot of modern office, natural lighting, slow pan" \
  --model sora-2 \
  --size 1280x720 \
  --seconds 5
```

Use `--model sora-2-pro` for higher quality.

### Wan 2.5 (Image + Audio → Video)

```bash
tsx scripts/generate-wan25.ts \
  --image inputs/scene.png \
  --audio workspace/narration.mp3 \
  --prompt "Detailed cinematic scene description" \
  --duration 5 \
  --resolution 720p \
  --output public/broll/wan25-output.mp4
```

**Limitations:**
- Duration: 3-10 seconds
- Audio: Must be 3-30 seconds
- Does NOT do lip-sync — just animates image with audio playing

## Typical Workflows

### Professional B-roll (VEO3 Pipeline)
1. Generate base image (use `generating-images` skill)
2. Animate with VEO3 (8s)
3. Analyze last frame → Extend (+7s)
4. Repeat extensions for desired length

### Quick Iteration (SORA)
1. Generate with `scripts/generate.ts`
2. Poll with `scripts/poll-status.ts`
3. Download with `scripts/download.ts`

## Prompting

VEO3 works best with: camera angles + subject action + environment + lighting + style

See [resources/veo3-prompting-guide.md](resources/veo3-prompting-guide.md) for the 5-part formula.

For extensions, use `analyze-last-frame.ts` first, then write prompts that continue naturally.

## Content Restrictions

Videos rejected if:
- Not suitable for under 18
- Copyrighted characters/music
- Real people (including public figures)
- Input images contain human faces

## Error Handling

Scripts auto-retry with exponential backoff (5 attempts).

**"Content policy violation"**: Revise prompt

**"Audio duration out of range"** (Wan 2.5): Audio must be 3-30s

**"Inappropriate content"** (Wan 2.5): Content filter triggered, try different input

## Output

- VEO3: `public/broll/veo3-[id].mp4`
- SORA: `workspace/generated/[id].mp4`

## Resources

- [resources/veo3-prompting-guide.md](resources/veo3-prompting-guide.md) — VEO3 prompting formula
- [resources/model-comparison.md](resources/model-comparison.md) — Detailed model comparison
- [resources/examples.md](resources/examples.md) — Example prompts
