# Keyframes Object Pattern

Declarative animation timeline for complex multi-property animations.

## The Problem

Complex animations have multiple properties changing at different times:

```typescript
// Hard to read and maintain
const topTextTop = frame < 42 ? 100 : interpolate(frame, [42, 54], [100, -100]);
const topTextOpacity = frame < 15 ? interpolate(frame, [0, 15], [0, 1]) : frame < 42 ? 1 : interpolate(frame, [42, 54], [1, 0]);
const topTextScale = /* ... even more complex ... */
```

Each property has different keyframes, making it hard to:
- See the full animation timeline
- Adjust timing consistently
- Understand when each phase happens

## The Solution: KEYFRAMES Object

Group all properties for an element together:

```typescript
const KEYFRAMES = {
  topText: {
    frames:  [0,   15,  42,  54],   // Shared timeline
    top:     [100, 100, 100, -100], // Position
    opacity: [0,   1,   1,   0],    // Fade in/out
    scale:   [0.9, 1,   1,   0.95], // Scale
  },

  broll: {
    frames:  [0,   4,   42,  54,   72,   86,   97],
    top:     [230, 230, 230, 1050, 1050, 1100, 1150],
    x:       [0,   0,   0,   0,    0,    400,  1200],
    scale:   [0.9, 1.0, 1.0, 0.9,  0.9,  0.85, 0.8],
    opacity: [0,   1.0, 1.0, 1.0,  1.0,  0.8,  0],
  },
};
```

## Usage with interpolate()

```typescript
const frame = useCurrentFrame();

const opts = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

// Interpolate each property using shared frames array
const topTextTop = interpolate(frame, KEYFRAMES.topText.frames, KEYFRAMES.topText.top, opts);
const topTextOpacity = interpolate(frame, KEYFRAMES.topText.frames, KEYFRAMES.topText.opacity, opts);
const topTextScale = interpolate(frame, KEYFRAMES.topText.frames, KEYFRAMES.topText.scale, opts);

// Apply to element
<div style={{
  position: 'absolute',
  top: topTextTop,
  opacity: topTextOpacity,
  transform: `scale(${topTextScale})`,
}}>
  {/* content */}
</div>
```

## Benefits

**1. Visual Timeline**

Reading vertically shows the animation at each frame:
```typescript
frames:  [0,   15,  42,  54]
         ↓    ↓    ↓    ↓
top:     [100, 100, 100, -100]  // stays at 100, then exits up
opacity: [0,   1,   1,   0]     // fades in, holds, fades out
scale:   [0.9, 1,   1,   0.95]  // grows in, holds, shrinks out
```

**2. Easy Timing Adjustments**

Change one frame number, all properties update:
```typescript
// Move the exit earlier
frames:  [0, 15, 35, 47]  // Changed 42→35 and 54→47
// All properties now animate with new timing
```

**3. Centralized Frame Constants**

Use named constants for important moments:
```typescript
const FRAMES = {
  ENTRANCE_END: 15,
  ACT_1_END: 42,
  TRANSITION_END: 54,
};

const KEYFRAMES = {
  topText: {
    frames:  [0, FRAMES.ENTRANCE_END, FRAMES.ACT_1_END, FRAMES.TRANSITION_END],
    top:     [100, 100, 100, -100],
    // ...
  },
};
```

## When to Use

**Good for:**
- Elements with 3+ properties animating
- Complex timelines with multiple phases
- Coordinated animations between elements

**Not needed for:**
- Simple fade in/out
- Single property animations
- One-time transitions

## Pattern Variations

**With named phases:**

```typescript
const KEYFRAMES = {
  card: {
    // Phase names as comments for clarity
    frames: [
      0,    // entrance start
      10,   // entrance end
      100,  // hold
      110,  // exit start
      120,  // exit end
    ],
    y:       [-50, 0, 0, 0, 50],
    opacity: [0, 1, 1, 1, 0],
  },
};
```

**With easing options:**

```typescript
// Different easing per property
const topTextTop = interpolate(
  frame,
  KEYFRAMES.topText.frames,
  KEYFRAMES.topText.top,
  { ...opts, easing: Easing.out(Easing.cubic) }
);

const topTextOpacity = interpolate(
  frame,
  KEYFRAMES.topText.frames,
  KEYFRAMES.topText.opacity,
  { ...opts, easing: Easing.inOut(Easing.quad) }
);
```

## Combining with Springs

Use KEYFRAMES for orchestration, springs for micro-interactions:

```typescript
// KEYFRAMES: When element should be visible
const elementOpacity = interpolate(
  frame,
  KEYFRAMES.element.frames,
  KEYFRAMES.element.opacity,
  opts
);

// Spring: How it enters (bouncy feel)
const entranceSpring = spring({
  frame: frame - ENTRANCE_FRAME,
  fps,
  config: { damping: 12, stiffness: 200, mass: 0.8 },
});

// Combine: KEYFRAMES controls visibility, spring controls motion
const finalScale = elementOpacity * interpolate(entranceSpring, [0, 1], [0.8, 1]);
```

## Complete Example

```typescript
import { useCurrentFrame, interpolate, Easing } from 'remotion';

const FRAMES = {
  LOGO_ENTER: 2,
  TEXT_ENTER: 12,
  ACT_1_END: 42,
  TRANSITION_END: 54,
};

const KEYFRAMES = {
  logo: {
    frames:  [0, FRAMES.LOGO_ENTER, FRAMES.ACT_1_END, FRAMES.TRANSITION_END],
    scale:   [0, 1, 1, 0.95],
    opacity: [0, 1, 1, 0],
    y:       [-30, 0, 0, -20],
  },
  text: {
    frames:  [0, FRAMES.TEXT_ENTER, FRAMES.ACT_1_END, FRAMES.TRANSITION_END],
    opacity: [0, 1, 1, 0],
    x:       [40, 0, 0, -20],
  },
};

const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();

  const opts = {
    extrapolateLeft: 'clamp' as const,
    extrapolateRight: 'clamp' as const,
    easing: Easing.out(Easing.cubic),
  };

  // Logo animations
  const logoScale = interpolate(frame, KEYFRAMES.logo.frames, KEYFRAMES.logo.scale, opts);
  const logoOpacity = interpolate(frame, KEYFRAMES.logo.frames, KEYFRAMES.logo.opacity, opts);
  const logoY = interpolate(frame, KEYFRAMES.logo.frames, KEYFRAMES.logo.y, opts);

  // Text animations
  const textOpacity = interpolate(frame, KEYFRAMES.text.frames, KEYFRAMES.text.opacity, opts);
  const textX = interpolate(frame, KEYFRAMES.text.frames, KEYFRAMES.text.x, opts);

  return (
    <>
      <div style={{
        transform: `translateY(${logoY}px) scale(${logoScale})`,
        opacity: logoOpacity,
      }}>
        Logo
      </div>
      <div style={{
        transform: `translateX(${textX}px)`,
        opacity: textOpacity,
      }}>
        Text
      </div>
    </>
  );
};
```

---

**Key insight:** The KEYFRAMES object is just data organization. The power comes from having a single source of truth for complex animation timelines that you can read, adjust, and maintain easily.
