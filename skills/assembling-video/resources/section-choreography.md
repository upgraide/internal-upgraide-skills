# Section Choreography

Pattern for smooth transitions between full-screen sections.

## Core Pattern

Each section:
1. **Enters** from one direction (usually RIGHT)
2. **Pushes** previous section out the opposite direction (LEFT)
3. **Exits** before next section enters (overlap creates smoothness)

```
Section A                    Section B                    Section C
[████████] ──────────────→  [████████] ──────────────→  [████████]
           ← exits LEFT                ← exits LEFT
                            enters RIGHT →              enters RIGHT →
```

## Implementation

```typescript
const TIMING = {
  ENTRANCE_DURATION: 12,  // Frames for entrance animation
  EXIT_START: 67,         // Start exit BEFORE section ends (e.g., section is 79 frames)
};

const SPRINGS = {
  sectionEntrance: { damping: 20, stiffness: 120, mass: 1 },
  exit: { damping: 20, stiffness: 120, mass: 1 },
};

export const MySection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ═══ ENTRANCE from RIGHT ═══
  const entranceSpring = spring({
    frame,
    fps,
    config: SPRINGS.sectionEntrance,
  });

  let sectionX = interpolate(entranceSpring, [0, 1], [1200, 0]);
  let sectionScale = interpolate(entranceSpring, [0, 1], [0.9, 1]);
  let sectionOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ═══ EXIT to LEFT ═══
  if (frame >= TIMING.EXIT_START) {
    const exitSpring = spring({
      frame: frame - TIMING.EXIT_START,
      fps,
      config: SPRINGS.exit,
    });

    sectionX = interpolate(exitSpring, [0, 1], [0, -1200]);
    sectionScale = interpolate(exitSpring, [0, 1], [1, 0.9]);
    sectionOpacity = interpolate(exitSpring, [0, 1], [1, 0]);
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F0F0F0",
        transform: `translateX(${sectionX}px) scale(${sectionScale})`,
        opacity: sectionOpacity,
      }}
    >
      {/* Section content */}
    </AbsoluteFill>
  );
};
```

## Direction Variations

| Transition | Enter | Exit | Use Case |
|------------|-------|------|----------|
| Horizontal push | RIGHT (+1200) | LEFT (-1200) | Default, most common |
| Vertical push | BOTTOM (+1200 Y) | UP (-800 Y) | Hook → Problem |
| Scale from behind | scale 0.5 → 1 | scale 1 → 0.85 | Dramatic reveal |

**Vertical example (push UP):**
```typescript
// Entrance from BOTTOM
sectionY = interpolate(entranceSpring, [0, 1], [1200, 0]);

// Exit UP
exitY = interpolate(exitSpring, [0, 1], [0, -800]);
```

## Sequencing in Main Composition

```typescript
// Main composition orchestrates sections
<Sequence from={0} durationInFrames={103}>
  <HookSection />
</Sequence>

<Sequence from={103} durationInFrames={77}>
  <ProblemSection />  {/* Enters as Hook exits */}
</Sequence>

<Sequence from={180} durationInFrames={72}>
  <TutorialSection />  {/* Enters as Problem exits */}
</Sequence>
```

**Key timing:** Section A's `EXIT_START` should be ~10-15 frames before Section B's `Sequence from={}`. This creates overlap where both are animating simultaneously.

## SFX Pairing

Each section transition typically has:
- **Whoosh** on entrance: `whoosh_arrow_01.wav` at 0.25-0.3 volume
- **Optional impact** for dramatic sections

```typescript
<Sequence from={0}>
  <Audio src={staticFile("audio/modern-updated/whoosh_arrow_01.wav")} volume={0.25} />
</Sequence>
```
