# Remotion Core Concepts

Essential Remotion-specific concepts for building video compositions.

## Frame-Based Rendering Model

Remotion renders React components once per frame. A 10s video at 30fps = 300 renders.

```typescript
const MyVideo: React.FC = () => {
  const frame = useCurrentFrame(); // 0, 1, 2, 3, ... 299
  return <div>Frame: {frame}</div>;
};
```

Each render produces one video frame.

## Time is Measured in Frames

**Everything uses frames, not seconds:**

```typescript
const { fps, durationInFrames } = useVideoConfig();

// Frame-based
const startFrame = 60;
const durationInFrames = 90;

// Convert: frames → seconds
const startSeconds = startFrame / fps;      // 60 / 30 = 2s
const durationSeconds = durationInFrames / fps; // 90 / 30 = 3s

// Convert: seconds → frames
const frames = Math.floor(seconds * fps);
```

**Why frames?** Pixel-perfect timing, no floating-point issues.

## useCurrentFrame()

Returns current frame number being rendered.

**Critical behavior: Frame context in Sequences**

```typescript
<Composition durationInFrames={300}>
  <Sequence from={0} durationInFrames={100}>
    <SceneOne />  {/* useCurrentFrame() returns 0-99 */}
  </Sequence>
  <Sequence from={100} durationInFrames={200}>
    <SceneTwo />  {/* useCurrentFrame() returns 0-199, NOT 100-299 */}
  </Sequence>
</Composition>
```

`useCurrentFrame()` returns frame **relative to current Sequence**, not composition. This makes components reusable.

**Example: Conditional rendering based on frame**

```typescript
const frame = useCurrentFrame();

// Show caption only during specific frame range
const showCaption = frame >= 30 && frame < 90;

if (showCaption) {
  return <Caption text="Hello" />;
}
return null;
```

## useVideoConfig()

Get composition metadata:

```typescript
const { fps, durationInFrames, width, height } = useVideoConfig();

// Use for calculations
const currentSeconds = useCurrentFrame() / fps;
const progress = useCurrentFrame() / durationInFrames; // 0 to 1
```

## staticFile() for Assets

Reference assets from `public/` folder:

```typescript
import { staticFile } from 'remotion';

// File at: public/inputs/avatar.mp4
<Video src={staticFile('inputs/avatar.mp4')} />

// File at: public/assets/logo.png
<Img src={staticFile('assets/logo.png')} />
```

**Important:** Paths are relative to `public/`, not project root.

## Deterministic Rendering

Remotion requires deterministic output for the same frame.

**Never use:**
- `Math.random()` directly
- `Date.now()` or `new Date()`
- Network requests during render
- Non-deterministic state

**Use instead:**
```typescript
import { random } from 'remotion';

// Deterministic random with seed
const value = random('unique-seed-123'); // Always same for this seed

// For animations, use frame number
const frame = useCurrentFrame();
const rotation = (frame * 2) % 360; // Predictable rotation
```

## Video and Audio Components

### Video Props

```typescript
<Video
  src={staticFile('video.mp4')}
  startFrom={60}        // Skip first 60 frames (2s at 30fps)
  endAt={180}           // End at frame 180 (6s)
  volume={0.5}          // 50% volume (0-1)
  volume={(f) => ...}   // Dynamic volume function
/>
```

**Trimming:**
- `startFrom`: Skip N frames from start
- `endAt`: Stop at frame N (absolute, not relative to startFrom)

**Volume:**
- Number: Constant volume (0 = mute, 1 = full)
- Function: `(frame: number) => number` for dynamic control

```typescript
// Fade in over first 30 frames
<Video
  src={src}
  volume={(f) => interpolate(f, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })}
/>
```

### Audio

Same API as `<Video>`:

```typescript
<Audio
  src={staticFile('music.mp3')}
  startFrom={0}
  volume={0.3}
/>
```

Layer multiple audio tracks by rendering multiple `<Audio>` components.

## interpolate()

Animate values over frame ranges.

**Basic usage:**

```typescript
import { interpolate, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();

// Fade in: opacity 0→1 over frames 0-30
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp'
});

// Slide in: x position 1080→0 over frames 0-40
const x = interpolate(frame, [0, 40], [1080, 0], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp'
});
```

**Always use `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'`** to prevent values going outside ranges.

**Multi-point interpolation:**

```typescript
// Fade in, hold, fade out
const opacity = interpolate(
  frame,
  [0, 15, 135, 150],      // Input range
  [0, 1, 1, 0],           // Output range
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  }
);
```

## Sequence

Control when components appear in timeline:

```typescript
<Sequence from={100} durationInFrames={150}>
  <MyComponent />
</Sequence>
```

**Key properties:**
- `from`: Start frame in parent timeline
- `durationInFrames`: How long to show
- `from={-10}`: Negative offset starts immediately but skips first 10 frames of children

**Inside `<Sequence>`, `useCurrentFrame()` resets to 0.**

## Series

Play sequences back-to-back without manual frame calculations:

```typescript
<Series>
  <Series.Sequence durationInFrames={100}>
    <SceneOne />
  </Series.Sequence>
  <Series.Sequence durationInFrames={150}>
    <SceneTwo />  {/* Auto-starts at frame 100 */}
  </Series.Sequence>
</Series>
```

**Offset for overlaps:**

```typescript
<Series>
  <Series.Sequence durationInFrames={100}>
    <SceneOne />
  </Series.Sequence>
  <Series.Sequence durationInFrames={150} offset={-10}>
    <SceneTwo />  {/* Starts 10 frames early at frame 90 */}
  </Series.Sequence>
</Series>
```

## AbsoluteFill

Position elements with `position: absolute`, filling composition area:

```typescript
<AbsoluteFill>
  <Video src="background.mp4" />
</AbsoluteFill>

// Layer elements (last = on top)
<AbsoluteFill>
  <AbsoluteFill>
    <Video src="video.mp4" />  {/* Bottom layer */}
  </AbsoluteFill>
  <AbsoluteFill>
    <Captions />               {/* Top layer */}
  </AbsoluteFill>
</AbsoluteFill>
```

Elements later in tree appear on top.

## Composition Registration

Register compositions in `src/remotion/Root.tsx`:

```typescript
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"              // ID for CLI rendering
      component={MyVideo}       // Your component
      durationInFrames={1350}   // 45s at 30fps
      fps={30}
      width={1080}              // 9:16 for Instagram/TikTok
      height={1920}
      defaultProps={{}}         // Optional props
    />
  );
};
```

**Instagram/TikTok specs:**
- Width: 1080, Height: 1920 (9:16 aspect)
- FPS: 30
- Codec: H.264

## Common Patterns

### Continuous Video with Format Changes

Keep video playing while layout changes:

```typescript
<AbsoluteFill>
  {/* Background: Continuous avatar */}
  <Video src={staticFile('avatar.mp4')} />

  {/* Foreground: Time-based overlays */}
  <Sequence from={300} durationInFrames={300}>
    <BRollOverlay src={staticFile('broll.mp4')} />
  </Sequence>
</AbsoluteFill>
```

Avatar plays continuously, overlay appears frames 300-600.

### Audio Mixing

Layer multiple audio sources:

```typescript
<AbsoluteFill>
  {/* Video with voice */}
  <Video src={staticFile('avatar.mp4')} volume={1.0} />

  {/* Background music */}
  <Audio src={staticFile('music.mp3')} volume={0.2} />

  {/* Sound effect at specific time */}
  <Sequence from={150}>
    <Audio src={staticFile('whoosh.mp3')} volume={0.5} />
  </Sequence>
</AbsoluteFill>
```

### Dynamic Volume (Ducking)

Lower music when voice is speaking:

```typescript
const isVoicePlaying = (frame: number) => {
  // Voice plays frames 0-600, 750-1200
  return (frame >= 0 && frame <= 600) || (frame >= 750 && frame <= 1200);
};

<Audio
  src={staticFile('music.mp3')}
  volume={(frame) => isVoicePlaying(frame) ? 0.1 : 0.3}
/>
```

## Frame Calculation Examples

**From timeline.json:**

```typescript
const timeline = await readJSON('workspace/timeline.json');
const durationInFrames = Math.ceil(timeline.duration * 30);
```

**Caption timing:**

```typescript
// WebVTT: "00:00:02.500 --> 00:00:05.000"
const startFrame = Math.floor(2.5 * 30);  // 75
const endFrame = Math.floor(5.0 * 30);    // 150

const frame = useCurrentFrame();
const isActive = frame >= startFrame && frame < endFrame;
```

**Scene pacing (89 cuts/min):**

```typescript
const cutsPerMinute = 89;
const avgShotLengthSeconds = 60 / cutsPerMinute;  // 0.67s
const avgShotLengthFrames = Math.floor(avgShotLengthSeconds * 30);  // 20 frames

// Create ~53 scenes for 36s video
const totalDuration = 36;
const totalCuts = Math.floor((totalDuration / 60) * cutsPerMinute);  // 53
```

---

**Key Takeaways:**

1. Everything in frames, convert when needed
2. `useCurrentFrame()` is relative to current Sequence
3. Use `staticFile()` for assets from `public/`
4. Always clamp `interpolate()` extrapolation
5. Rendering must be deterministic (no `Math.random()`)
6. Layer with `<AbsoluteFill>`, last element on top
