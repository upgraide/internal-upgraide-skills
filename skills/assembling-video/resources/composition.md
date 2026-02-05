# Composition Patterns

Patterns for composing multi-scene videos with captions and overlays.

## Series vs TransitionSeries

Two ways to sequence scenes:

**Series** - Hard cuts between scenes:

```typescript
import { Series } from 'remotion';

<Series>
  <Series.Sequence durationInFrames={100}>
    <SceneOne />
  </Series.Sequence>
  <Series.Sequence durationInFrames={150}>
    <SceneTwo />  {/* Hard cut at frame 100 */}
  </Series.Sequence>
</Series>
```

**TransitionSeries** - Smooth transitions:

```typescript
import { TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { linearTiming } from '@remotion/transitions';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={100}>
    <SceneOne />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={150}>
    <SceneTwo />  {/* Fades in over last 30 frames of SceneOne */}
  </TransitionSeries.Sequence>
</TransitionSeries>
```

**Key difference:** Transitions **overlap** scenes, reducing total duration.

## Duration Calculations

**Without transitions:**
Total = sum of all scene durations

```typescript
const scenes = [
  { durationInFrames: 100 },
  { durationInFrames: 150 },
  { durationInFrames: 120 },
];

const totalDuration = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
// 100 + 150 + 120 = 370 frames
```

**With transitions:**
Total = sum of scenes - sum of transition overlaps

```typescript
const sceneDurations = [100, 150, 120];
const transitionDuration = 30;

const totalSceneDuration = sceneDurations.reduce((a, b) => a + b, 0); // 370
const numTransitions = sceneDurations.length - 1; // 2

const totalDuration = totalSceneDuration - (numTransitions * transitionDuration);
// 370 - (2 × 30) = 310 frames
```

**Formula:**
```
totalDuration = Σ(scene durations) - (number of transitions × transition duration)
```

## Overlapping Scenes

Use negative offset for manual overlaps:

```typescript
<Series>
  <Series.Sequence durationInFrames={100}>
    <SceneOne />
  </Series.Sequence>
  <Series.Sequence durationInFrames={150} offset={-20}>
    <SceneTwo />  {/* Starts 20 frames early, at frame 80 */}
  </Series.Sequence>
</Series>
```

Both scenes visible during frames 80-100.

## Layering with AbsoluteFill

Stack elements vertically. Last element appears on top.

**Basic layering:**

```typescript
<AbsoluteFill>
  <AbsoluteFill>
    <Video src={staticFile('background.mp4')} />  {/* Bottom */}
  </AbsoluteFill>
  <AbsoluteFill>
    <div style={{
      position: 'absolute',
      bottom: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
    }}>
      <CaptionText />  {/* Top */}
    </div>
  </AbsoluteFill>
</AbsoluteFill>
```

**Three-layer composition:**

```typescript
<AbsoluteFill>
  {/* Layer 1: Base video */}
  <Video src={staticFile('video.mp4')} />

  {/* Layer 2: Captions */}
  <Captions />

  {/* Layer 3: Logo overlay (on top of everything) */}
  <Img
    src={staticFile('logo.png')}
    style={{
      position: 'absolute',
      top: '5%',
      right: '5%',
      width: '15%',
    }}
  />
</AbsoluteFill>
```

**Conditional layering:**

```typescript
const frame = useCurrentFrame();

<AbsoluteFill>
  <Video src={staticFile('avatar.mp4')} />

  {/* Show B-roll overlay for frames 300-600 */}
  {frame >= 300 && frame < 600 && (
    <Video src={staticFile('broll.mp4')} />
  )}
</AbsoluteFill>
```

## Captions

Use `@remotion/captions` package to parse SRT/WebVTT files:

```typescript
import { parseSrt } from '@remotion/captions';

const srtContent = await fetch(staticFile('captions.srt')).then(r => r.text());
const { captions } = parseSrt({ input: srtContent });

// Convert to frame-based timing
const fps = 30;
const frameCaptions = captions.map(cap => ({
  text: cap.text,
  startFrame: Math.floor((cap.startMs / 1000) * fps),
  endFrame: Math.floor((cap.endMs / 1000) * fps),
}));

// Find active caption for current frame
const frame = useCurrentFrame();
const activeCaption = frameCaptions.find(
  cap => frame >= cap.startFrame && frame <= cap.endFrame
);

if (activeCaption) {
  return <div>{activeCaption.text}</div>;
}
```

**Caption positioning:**

```typescript
<div style={{
  position: 'absolute',
  bottom: '15%',           // Above Instagram UI
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '56px',
  fontWeight: 'bold',
  color: '#FFFFFF',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: '12px 24px',
  borderRadius: '8px',
  textAlign: 'center',
  maxWidth: '90%',
}}>
  {activeCaption.text}
</div>
```

**Animated captions:**

```typescript
const relativeFrame = frame - activeCaption.startFrame;
const opacity = interpolate(
  relativeFrame,
  [0, 5, activeCaption.endFrame - activeCaption.startFrame - 5, activeCaption.endFrame - activeCaption.startFrame],
  [0, 1, 1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);

<div style={{ opacity }}>
  {activeCaption.text}
</div>
```

## Image Overlays

Display images/logos at specific times:

```typescript
import { Img } from 'remotion';

const frame = useCurrentFrame();
const startFrame = 100;
const endFrame = 250;

// Only show during frame range
if (frame < startFrame || frame > endFrame) {
  return null;
}

// Fade in/out
const relativeFrame = frame - startFrame;
const duration = endFrame - startFrame;

const opacity = interpolate(
  relativeFrame,
  [0, 15, duration - 15, duration],
  [0, 1, 1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);

return (
  <Img
    src={staticFile('logo.png')}
    style={{
      position: 'absolute',
      top: '5%',
      right: '5%',
      width: '15%',
      opacity,
    }}
  />
);
```

**Corner positions for 9:16 (1080×1920):**

```typescript
// Top-left
{ top: '5%', left: '5%' }

// Top-right
{ top: '5%', right: '5%' }

// Bottom-left (above Instagram UI)
{ bottom: '12%', left: '5%' }

// Bottom-right
{ bottom: '12%', right: '5%' }

// Centered
{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
```

## Scene Composition Patterns

**Pattern 1: Avatar-only with captions**

```typescript
<AbsoluteFill>
  <Video src={staticFile('inputs/avatar.mp4')} />
  <CaptionOverlay captions={captions} />
</AbsoluteFill>
```

**Pattern 2: Avatar + B-roll cuts**

```typescript
<Series>
  <Series.Sequence durationInFrames={150}>
    <Video src={staticFile('inputs/avatar.mp4')} />
  </Series.Sequence>
  <Series.Sequence durationInFrames={90}>
    <Video src={staticFile('inputs/broll/clip1.mp4')} />
  </Series.Sequence>
  <Series.Sequence durationInFrames={120}>
    <Video src={staticFile('inputs/avatar.mp4')} startFrom={150} />
  </Series.Sequence>
</Series>
```

**⚠️ Lip-sync with continuous audio:** When audio plays continuously but video cuts between scenes, use `startFrom={scene.startFrame}` (composition timeline position) not scene index, otherwise avatar restarts while audio continues.

**Pattern 3: Continuous avatar with overlays**

```typescript
<AbsoluteFill>
  {/* Background: Continuous avatar */}
  <Video src={staticFile('inputs/avatar.mp4')} />

  {/* Foreground: B-roll appears at specific times */}
  <Sequence from={150} durationInFrames={90}>
    <Video
      src={staticFile('inputs/broll/clip1.mp4')}
      style={{ opacity: 0.8 }}  // Semi-transparent overlay
    />
  </Sequence>

  <Sequence from={300} durationInFrames={120}>
    <Video src={staticFile('inputs/broll/clip2.mp4')} />
  </Sequence>

  {/* Captions on top */}
  <CaptionOverlay captions={captions} />
</AbsoluteFill>
```

**Pattern 4: Split screen (top/bottom for reels)**

```typescript
<AbsoluteFill>
  {/* Top half: Avatar */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '50%',
    overflow: 'hidden',
  }}>
    <Video
      src={staticFile('inputs/avatar.mp4')}
      style={{
        width: '100%',
        height: '200%',  // Double height to maintain aspect
        objectFit: 'cover',
      }}
    />
  </div>

  {/* Bottom half: UI/B-roll */}
  <div style={{
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '50%',
    overflow: 'hidden',
  }}>
    <Video
      src={staticFile('inputs/broll/ui-demo.mp4')}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  </div>
</AbsoluteFill>
```

## Dynamic Layouts

Change layout over time while keeping video continuous:

```typescript
const frame = useCurrentFrame();

<AbsoluteFill>
  {/* Continuous avatar plays throughout */}
  <Video src={staticFile('inputs/avatar.mp4')} />

  {/* Layout changes based on time */}
  {frame < 300 && (
    // Full screen avatar (frames 0-300)
    null
  )}

  {frame >= 300 && frame < 600 && (
    // Split screen (frames 300-600)
    <div style={{
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '40%',
      backgroundColor: '#000',
    }}>
      <Video src={staticFile('inputs/broll/demo.mp4')} />
    </div>
  )}

  {frame >= 600 && (
    // Back to full screen (frames 600+)
    null
  )}
</AbsoluteFill>
```

## Multi-Scene Data Structure

Organize scene data for complex compositions:

```typescript
interface Scene {
  id: string;
  type: 'avatar' | 'broll' | 'split';
  startFrame: number;
  durationInFrames: number;
  videoSource?: string;
  brollSource?: string;
  volume?: number;
}

const scenes: Scene[] = [
  {
    id: 'intro',
    type: 'avatar',
    startFrame: 0,
    durationInFrames: 150,
    videoSource: 'inputs/avatar.mp4',
    volume: 1.0,
  },
  {
    id: 'demo',
    type: 'broll',
    startFrame: 150,
    durationInFrames: 90,
    brollSource: 'inputs/broll/clip1.mp4',
    volume: 0.3,
  },
  {
    id: 'explanation',
    type: 'avatar',
    startFrame: 240,
    durationInFrames: 120,
    videoSource: 'inputs/avatar.mp4',
    volume: 1.0,
  },
];

// Render with Series
<Series>
  {scenes.map(scene => (
    <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
      {scene.type === 'avatar' && (
        <Video
          src={staticFile(scene.videoSource!)}
          startFrom={scene.startFrame}
          volume={scene.volume}
        />
      )}
      {scene.type === 'broll' && (
        <Video
          src={staticFile(scene.brollSource!)}
          volume={scene.volume}
        />
      )}
    </Series.Sequence>
  ))}
</Series>
```

---

**Key Takeaways:**

1. Use Series for cuts, TransitionSeries for smooth transitions
2. Transitions reduce total duration (scenes overlap)
3. Layer with AbsoluteFill, last element on top
4. Convert caption timestamps to frames
5. Use conditional rendering for time-based overlays
6. Keep video continuous by layering in background
