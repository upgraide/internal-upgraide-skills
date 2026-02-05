# Production Defaults

Tested values that produce professional results. Use as starting points.

## Spring Presets

```typescript
const SPRINGS = {
  // Gentle settle - text entrances, subtle reveals
  entrance: { damping: 18, stiffness: 120, mass: 1 },

  // Quick response - cards, UI elements
  snappy: { damping: 15, stiffness: 200, mass: 0.8 },

  // Dramatic overshoot - punch words, impact moments
  punch: { damping: 8, stiffness: 400, mass: 0.4 },

  // Smooth out - section exits, fade outs
  exit: { damping: 20, stiffness: 120, mass: 1 },

  // Heavy, deliberate - slider reveals, morphs
  slider: { damping: 28, stiffness: 80, mass: 1.2 },

  // Dramatic entrance from behind
  dramatic: { damping: 18, stiffness: 100, mass: 1.2 },
};
```

## Audio Mixing

| Layer | Volume | Notes |
|-------|--------|-------|
| Narration (avatar) | 1.0 - 1.4 | Boost if competing with SFX |
| Background music | 0.08 - 0.15 | Loop, very low |
| Whoosh SFX | 0.25 - 0.4 | Per transition |
| Click/UI SFX | 0.15 - 0.25 | Subtle |
| Impact/punch SFX | 0.4 - 0.5 | Key moments |
| Ding/success SFX | 0.35 - 0.4 | Finale moments |

**Ducking pattern:**
```typescript
<Audio
  src={staticFile("music.mp3")}
  volume={(f) => {
    // Duck during voice highlight (frames 488-530)
    if (f >= 488 && f < 530) return 0.05;
    return 0.1;
  }}
  loop
/>
```

## Safe Zones (Instagram Reels / TikTok)

```typescript
const SAFE_ZONES = {
  top: 150,      // Username, follow button
  bottom: 350,   // Caption, buttons, nav bar
  horizontal: 70,
};
```

Content area: `1920 - 150 - 350 = 1420px` usable height.

## Typography

```typescript
const TYPOGRAPHY = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',

  // Sizes (for 1080x1920)
  heading: { fontSize: 82, fontWeight: 700, letterSpacing: -3 },
  subheading: { fontSize: 72, fontWeight: 600, letterSpacing: -2 },
  body: { fontSize: 48, fontWeight: 600, letterSpacing: -1 },
  label: { fontSize: 32, fontWeight: 700, letterSpacing: 1 },
};
```

## Colors (Apple-inspired)

```typescript
const COLORS = {
  background: "#F0F0F0",
  text: "#1D1D1F",
  textSecondary: "#86868B",

  // Accents
  accent: "#007AFF",
  error: "#FF3B30",
  success: "#34C759",

  // Gradients
  gradient: "linear-gradient(180deg, #1e3a5f 0%, #3b82f6 60%, #93c5fd 100%)",

  // Shadows
  cardShadow: "0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)",
  heavyShadow: "0 16px 50px rgba(0, 0, 0, 0.28), 0 6px 16px rgba(0, 0, 0, 0.18)",
};
```

## Common Animation Patterns

**Fade + slide entrance:**
```typescript
const springValue = spring({ frame: localFrame, fps, config: SPRINGS.entrance });
const opacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
const y = interpolate(springValue, [0, 1], [40, 0]);
const scale = interpolate(springValue, [0, 1], [0.95, 1]);
```

**Punch text (overshoot):**
```typescript
const springValue = spring({ frame: localFrame, fps, config: SPRINGS.punch });
const scale = interpolate(springValue, [0, 1], [1.4, 1.0]);
const y = interpolate(springValue, [0, 1], [-30, 0]);
```

**Crossfade morph with pulse:**
```typescript
const morphProgress = spring({ frame: frame - MORPH_START, fps, config: SPRINGS.snappy });
const pulseScale = morphProgress > 0 && morphProgress < 1
  ? 1 + Math.sin(morphProgress * Math.PI) * 0.03
  : 1;

// Image A
<Img style={{ opacity: 1 - morphProgress }} />
// Image B
<Img style={{ opacity: morphProgress }} />
```
