---
name: assembling-video
description: Assembles final videos using Remotion for Instagram Reels and TikTok. Use when composing multi-scene videos with transitions, captions, audio mixing, and overlays.
---

# Assembling Video

Professional video editor using Remotion — a React framework for programmatic video creation.

**Core philosophy:** Build section by section, with intentional layout for each. Quick layout thinking (30 seconds) before coding each section = premium results.

## When to Use

- Creating Instagram Reels or TikTok (9:16 format)
- Building custom video compositions
- Composing multi-scene videos with transitions, captions, overlays

## Remotion Fundamentals

**Key concept:** Remotion renders React components once per frame. 10s video at 30fps = 300 renders.

**Critical differences from traditional editing:**
- Time = **frames**, not seconds
- `useCurrentFrame()` returns frame number
- Everything must be deterministic (no `Math.random()`)
- Assets use `staticFile('path')` relative to `public/` folder

**⚠️ All assets must be in `public/` folder** — common error "Format error" usually means file isn't in `public/`.

## Resources

**Layout (use per-section):**
- [resources/canvas-layout.md](resources/canvas-layout.md) — 1080×1920 canvas with named zones
- [resources/layout-patterns.md](resources/layout-patterns.md) — Proven composition patterns

**Remotion fundamentals:**
- [resources/remotion-core.md](resources/remotion-core.md) — Frame-based rendering, hooks
- [resources/composition.md](resources/composition.md) — Multi-scene composition, layering
- [resources/transitions.md](resources/transitions.md) — Smooth transitions
- [resources/audio-library.md](resources/audio-library.md) — 6,200+ sound effects

**Production patterns:**
- [resources/production-defaults.md](resources/production-defaults.md) — Tested springs, audio, typography
- [resources/section-choreography.md](resources/section-choreography.md) — Enter/exit transitions
- [resources/keyframes-pattern.md](resources/keyframes-pattern.md) — Animation timelines
- [resources/incremental-building.md](resources/incremental-building.md) — Build with validation

## Section-by-Section Workflow

For each section: **Layout → Build → Refine → Next.**

### 1. Pick a Pattern (30 seconds)

From [layout-patterns.md](resources/layout-patterns.md):
- **A: Avatar + Content** — Most common for hooks
- **B: Full Canvas Hero** — Punchlines, reveals
- **C: Vertical Stack** — Comparisons
- **D: Browser Mockup** — Product demos
- **E: Side-by-Side** — Before/after

### 2. Assign Zones

From [canvas-layout.md](resources/canvas-layout.md):
```
TOP_TEXT: 100      HERO_CARD: 230
CONTENT_ROW: 700   PUNCHLINE: 980
AVATAR: bottom 0, height 48%
```

### 3. Build & Preview

```bash
npm run remotion:studio  # Interactive preview
```

## Common Patterns

**Full avatar with captions:**
```typescript
<AbsoluteFill>
  <Video src={staticFile('inputs/avatar.mp4')} />
  <CaptionOverlay />
</AbsoluteFill>
```

**Avatar + B-roll cuts:**
```typescript
<Series>
  <Series.Sequence durationInFrames={150}>
    <Video src={staticFile('inputs/avatar.mp4')} />
  </Series.Sequence>
  <Series.Sequence durationInFrames={90}>
    <Video src={staticFile('inputs/broll/clip1.mp4')} />
  </Series.Sequence>
</Series>
```

**Continuous avatar with dynamic overlays:**
```typescript
const frame = useCurrentFrame();
<AbsoluteFill>
  <Video src={staticFile('inputs/avatar.mp4')} />
  {frame >= 300 && frame < 600 && (
    <Video src={staticFile('inputs/broll/clip1.mp4')} />
  )}
  <CaptionOverlay />
</AbsoluteFill>
```

## Audio Mixing

```typescript
<AbsoluteFill>
  <Video src={staticFile('inputs/avatar.mp4')} volume={1.0} />
  <Audio src={staticFile('inputs/music.mp3')} volume={0.2} />
  <Sequence from={450}>
    <Audio src={staticFile('inputs/whoosh.mp3')} volume={0.5} />
  </Sequence>
</AbsoluteFill>
```

See [resources/audio-library.md](resources/audio-library.md) for 6,200+ sounds.

## Workspace Data

**Required:**
- `public/inputs/avatar.mp4` — Avatar video with audio

**Optional:**
- `workspace/timeline.json` — Word-level timestamps
- `workspace/captions.vtt` — WebVTT captions
- `workspace/broll-clips.json` — B-roll metadata
- `workspace/style-blueprint.json` — Style guidance

## Commands

**Preview:**
```bash
npm run remotion:studio
```

**Render:**
```bash
npx remotion render src/remotion/index.ts MyComposition outputs/video.mp4 --codec=h264 --crf=20
```

## Output Specs

- Resolution: 1080 × 1920 (9:16)
- Frame rate: 30 fps
- Codec: H.264 + AAC
- Duration: 30-60 seconds typical

## Available Components

Check `components/` for reusable elements:
- `SliderCard.tsx` — Before/after comparison
- `LogoComparison.tsx` — Logo comparison
- `iOSLiquidGlassCard.tsx` — iOS notification cards
- `CumulativeTextOverlay.tsx` — Building list overlay

## Key Principles

1. **Build from primitives** — Compose Remotion's APIs
2. **Iterate to quality** — Refinement, not one-shot
3. **Save successful patterns** — Accumulate knowledge
4. **Frame-based thinking** — seconds × fps = frames
5. **Deterministic rendering** — No random(), use frame logic
6. **Layer for flexibility** — Use `<AbsoluteFill>` for layouts
