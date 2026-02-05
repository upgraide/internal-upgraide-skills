# Examples

Complete working video compositions that demonstrate successful patterns.

## Purpose

This folder stores full composition examples that have been built iteratively with user feedback and proven to produce professional-quality videos.

## When to Save an Example

Save an example here when:
- ✅ Complete composition works well end-to-end
- ✅ User is satisfied with the quality
- ✅ It demonstrates a useful pattern others can learn from
- ✅ It has been tested through multiple iterations
- ✅ It's ready to serve as a reference for future projects

## Types of Examples

**Composition files (.tsx):**
- Complete React components
- Full video compositions
- Use when pattern involves custom logic

**Configuration files (.json):**
- Data-driven compositions
- Scene configurations
- Use when pattern can be represented as data

**Both are valid** - choose based on what makes sense for the pattern.

## How to Save

1. **Name descriptively:** `fast-paced-tutorial.tsx` not `example1.tsx`
2. **Add header comment:** Explain what makes this pattern work
3. **Include context:** What style it achieves, when to use it

## Example Format (.tsx)

```typescript
/**
 * Fast-Paced Tutorial Pattern
 *
 * Style: 89 cuts/min, energetic pacing for tech tutorials
 * Works well for: Product demos, quick tips, feature showcases
 *
 * Key features:
 * - Very short scenes (20-30 frames avg)
 * - Mix of avatar close-ups and screen recordings
 * - Hard cuts (no transitions)
 * - Continuous background music with ducked volume during voice
 *
 * Iterative refinement notes:
 * - Started with 15-frame cuts, too fast - increased to 20-30
 * - Added audio ducking for better voice clarity
 * - Split-screen sections work better than full overlays
 */

import { Series, AbsoluteFill, Video, Audio, staticFile } from 'remotion';

export const FastPacedTutorial: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* Scene composition */}
      <Series>
        <Series.Sequence durationInFrames={30}>
          <Video src={staticFile('inputs/avatar.mp4')} startFrom={0} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={40}>
          <Video src={staticFile('inputs/broll/screen1.mp4')} />
        </Series.Sequence>
        {/* ... more scenes */}
      </Series>

      {/* Audio mix */}
      <Audio src={staticFile('inputs/avatar.mp4')} volume={1.0} />
      <Audio
        src={staticFile('inputs/music.mp3')}
        volume={(f) => /* ducking logic */ 0.15}
      />
    </AbsoluteFill>
  );
};
```

## Example Format (.json)

```json
{
  "name": "split-screen-demo",
  "description": "Avatar + UI demo in split screen for product walkthroughs",
  "style": {
    "pacing": "medium",
    "cuts_per_minute": 45,
    "transitions": "fade"
  },
  "scenes": [
    {
      "id": "intro",
      "type": "avatar",
      "durationInFrames": 90,
      "videoSource": "inputs/avatar.mp4"
    },
    {
      "id": "demo",
      "type": "split",
      "durationInFrames": 450,
      "topSource": "inputs/avatar.mp4",
      "bottomSource": "inputs/broll/ui-demo.mp4"
    }
  ],
  "notes": "Works well for feature demonstrations. 60/40 split ratio gives avatar prominence while showing UI clearly."
}
```

## Good Example Topics

Examples worth saving:
- **Fast-paced tutorial** (89+ cuts/min, tech content)
- **Cinematic narrative** (slow pacing, dramatic transitions)
- **Split-screen product demo** (avatar + UI simultaneously)
- **Hook + body + CTA structure** (Instagram Reel format)
- **Continuous avatar with dynamic overlays** (avatar never restarts)
- **Beat-synced cuts** (transitions aligned with music beats)

## Organizing Examples

As examples accumulate, organize by:
- **Pacing:** `fast-paced-*.tsx`, `medium-paced-*.tsx`, `slow-paced-*.tsx`
- **Format:** `full-avatar-*.tsx`, `split-screen-*.tsx`, `mixed-*.tsx`
- **Use case:** `tutorial-*.tsx`, `product-demo-*.tsx`, `story-*.tsx`

## Not Good for Examples

Don't save here if:
- ❌ It's a single reusable component (save in `components/` instead)
- ❌ It hasn't been tested with user feedback
- ❌ It's project-specific without reusable patterns
- ❌ Quality isn't production-level yet

---

## Available Examples

### Kimi Hook Pre-flight Plan (2025-12-27)
**File:** `kimi-hook-preflight.md`
**Type:** Pre-flight planning document (not code)
**Use Case:** Reference for how to plan a composition BEFORE coding

**Key Features:**
- Complete script-to-acts breakdown
- Layout pattern selection with reasoning
- Element-by-element positioning with zones
- Transition choreography (what exits, enters, moves)
- Full KEYFRAMES object written before coding
- Visual frame sketches for each act

**Why it matters:** This pre-flight plan led to our best-performing hook with minimal iterations. Use as template for planning your own compositions.

---

### Virtual Camera Tutorial (2025-12-02)
**File:** `virtual-camera-tutorial.tsx`
**Style:** Scrolling "tall page" with camera keyframes
**Use Case:** Step-by-step tutorials, scrolling content reveals, multi-section videos

**Key Features:**
- Content positioned at fixed Y coordinates on a tall "page"
- Camera Y interpolated between keyframes (HOLD → SNAP pattern)
- Content animates in after camera arrives
- Decouples content layout from timing

**Architecture Pattern:**
```
Y positions (content layout):     CAMERA keyframes (movement):
├── SECTION_1: 100               frames: [0, 90, 100, ...]
├── SECTION_2: 2000       →      y:      [0, 0,  1900, ...]
└── SECTION_3: 4000
```

**When to use:** Tutorials with multiple sections, content that scrolls vertically, any video where you want to reveal content progressively.

---

### Fast-Paced Instagram Reel (2025-11-19)
**File:** `fast-paced-instagram-reel-2025-11-19.tsx`
**Style:** 61.8 cuts/min, hard cuts, split-screen alternation, flash transitions
**Use Case:** Product demos, feature showcases, high-energy Instagram Reels
**Key Features:**
- Hook → Body → CTA structure (0.8s hook, 20.7s body, 3.5s CTA)
- Zoom-out effect on hook (1.2x → 1.0x over 6 frames)
- Flash transitions synchronized with sound effects
- Word-level caption sync with dynamic positioning
- Audio layering (7 layers: music, SFX, impacts)

**Archived Project:** `archive/2025-11-19-pimelli-fast-paced-reel/`
**Learnings:** Hook animations must start visible (no opacity fade), multi-sensory sync creates impact, strict pattern creates rhythm at fast pace

---

### Fast-Paced Product Demo
**File:** `fast-paced-product-demo.tsx`
**Status:** Reference example (existing)

### Fast-Paced Tech Demo (WIP)
**File:** `fast-paced-tech-demo-wip.tsx`
**Status:** Work in progress template

---

### Music-Synced Montage (2026-01-06)
**File:** `music-synced-montage.tsx`
**Style:** B-roll clips with hard cuts synced to music beats, cumulative text overlay
**Use Case:** Fitness/lifestyle reels, listicle videos, any music-driven montage

**Key Features:**
- Scene timings extracted from beat detection or reference video analysis
- Hard cuts via Series component (no transitions)
- CumulativeTextOverlay for building list items
- Data-driven SCENES array for easy timing adjustments

**Workflow:**
1. Extract beat timeline: `python detect-beats.py audio.mp3`
2. OR extract cuts from reference: `ffmpeg -i ref.mp4 -filter:v "select='gt(scene,0.3)',showinfo" -f null -`
3. Define SCENES array with frame timings
4. Render with HDR fix: `--color-space=bt709 --image-format=png --gl=angle`

**Archived Project:** `archive/2026-01-06-life-change-reel/`

---

**Start empty.** Build examples through iterative development. Each successful project contributes patterns for future use.
