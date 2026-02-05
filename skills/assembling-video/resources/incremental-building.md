# Incremental Building Pattern

Build videos section-by-section while always previewing the full composition. This ensures smooth transitions and cohesive flow.

## Core Principle

ONE composition file that grows. Never build sections in isolation—always see how they connect.

## Composition Structure

```typescript
// src/remotion/[ProjectName].tsx
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';

// Section components (build these incrementally)
import { HookSection } from './sections/HookSection';
import { ProblemSection } from './sections/ProblemSection';
import { SolutionSection } from './sections/SolutionSection';
import { CTASection } from './sections/CTASection';

// Placeholder for unbuilt sections
const PlaceholderSection: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill style={{
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <div style={{
      color: '#666',
      fontSize: 48,
      fontFamily: 'system-ui'
    }}>
      {label}
    </div>
    <div style={{
      color: '#444',
      fontSize: 24,
      marginTop: 20
    }}>
      [Coming Soon]
    </div>
  </AbsoluteFill>
);

// Frame calculations
const SECTION_FRAMES = {
  hook: 150,      // 5 seconds
  problem: 180,   // 6 seconds
  solution: 300,  // 10 seconds
  cta: 120        // 4 seconds
};

const TOTAL_FRAMES = Object.values(SECTION_FRAMES).reduce((a, b) => a + b, 0);

export const ProjectVideo: React.FC = () => {
  let currentStart = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Section 1: Hook - BUILT */}
      <Sequence from={currentStart} durationInFrames={SECTION_FRAMES.hook}>
        <HookSection />
      </Sequence>
      {(currentStart += SECTION_FRAMES.hook)}

      {/* Section 2: Problem - BUILT */}
      <Sequence from={currentStart} durationInFrames={SECTION_FRAMES.problem}>
        <ProblemSection />
      </Sequence>
      {(currentStart += SECTION_FRAMES.problem)}

      {/* Section 3: Solution - PLACEHOLDER */}
      <Sequence from={currentStart} durationInFrames={SECTION_FRAMES.solution}>
        <PlaceholderSection label="Solution" />
      </Sequence>
      {(currentStart += SECTION_FRAMES.solution)}

      {/* Section 4: CTA - PLACEHOLDER */}
      <Sequence from={currentStart} durationInFrames={SECTION_FRAMES.cta}>
        <PlaceholderSection label="CTA" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Section Component Pattern

Each section is its own file with enter/exit transitions:

```typescript
// src/remotion/sections/HookSection.tsx
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const HookSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Enter animation (first 15 frames)
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 }
  });

  // Exit animation (last 10 frames)
  const exitStart = durationInFrames - 10;
  const exitProgress = interpolate(
    frame,
    [exitStart, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Combined transform
  const translateY = interpolate(enterProgress, [0, 1], [50, 0]) +
                     interpolate(exitProgress, [0, 1], [0, -50]);
  const opacity = interpolate(enterProgress, [0, 1], [0, 1]) *
                  interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill style={{
      transform: `translateY(${translateY}px)`,
      opacity
    }}>
      {/* Section content here */}
    </AbsoluteFill>
  );
};
```

## Preview Workflow

Always preview the full video, even with placeholders:

```bash
# Quick 720p preview (for VL analysis)
npx remotion render src/remotion/index.ts ProjectVideo \
  workspace/previews/v1.mp4 \
  --scale=0.67 --crf=28

# Watch in Remotion Studio (interactive)
npm run remotion:studio
```

## Building Incrementally

### Step 1: Create composition with all placeholders

```typescript
<Sequence from={0} durationInFrames={150}>
  <PlaceholderSection label="Hook" />
</Sequence>
<Sequence from={150} durationInFrames={180}>
  <PlaceholderSection label="Problem" />
</Sequence>
// ... all sections as placeholders
```

### Step 2: Build first section, replace placeholder

```typescript
<Sequence from={0} durationInFrames={150}>
  <HookSection />  {/* Real content */}
</Sequence>
<Sequence from={150} durationInFrames={180}>
  <PlaceholderSection label="Problem" />  {/* Still placeholder */}
</Sequence>
```

### Step 3: Preview full video

See how the built section flows into placeholders. Adjust exit transition if needed.

### Step 4: Build next section

Consider:
- How does the previous section exit?
- How should this section enter?
- What elements persist across the transition?

### Step 5: Repeat until all sections built

## Transition Considerations

When building section N, always consider:

1. **What exits from section N-1?**
   - Elements that slide/fade out
   - Audio that fades

2. **What persists?**
   - Background elements
   - Continuous audio (avatar, music)

3. **What enters in section N?**
   - New visual elements
   - Text overlays
   - Sound effects

```typescript
// Example: Shared background across sections
<AbsoluteFill>
  {/* Continuous background */}
  <Video src={staticFile('inputs/avatar.mp4')} />

  {/* Section-specific overlays */}
  <Sequence from={0} durationInFrames={150}>
    <HookOverlay />
  </Sequence>
  <Sequence from={150} durationInFrames={180}>
    <ProblemOverlay />
  </Sequence>
</AbsoluteFill>
```

## Quality Checkpoints

After each section build:

1. ✅ Section content renders correctly
2. ✅ Enter animation is smooth
3. ✅ Exit animation transitions well to next section (or placeholder)
4. ✅ Audio levels are consistent
5. ✅ Text is readable at 720p preview

## Common Issues

### Jarring transitions
- Add overlap frames (10-15 frames)
- Use consistent animation curves
- Consider cross-fade for dramatic changes

### Timing mismatches
- Always work in frames, not seconds
- Keep SECTION_FRAMES object updated
- Re-calculate cumulative starts after changes

### Audio sync drift
- Use `startFrom` prop on Video/Audio for precise sync
- Keep audio continuous, section visuals as overlays

## Integration with Video Loop

This pattern integrates with `/video-loop`:

1. Loop initializes composition with placeholders
2. VL analyzes full video (including placeholders)
3. Sections are built incrementally
4. Each preview shows full video context
5. VL feedback considers transitions between sections
