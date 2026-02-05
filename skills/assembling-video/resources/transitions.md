# Transitions

Smooth transitions between scenes using `@remotion/transitions`.

## Presentation vs Timing

Remotion separates **what the transition looks like** from **how it animates over time**.

**Presentation** - Visual effect (fade, wipe, slide)
**Timing** - Animation curve (linear, spring, custom)

```typescript
import { TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { linearTiming } from '@remotion/transitions';

<TransitionSeries.Transition
  presentation={fade()}           // What: fade effect
  timing={linearTiming({ durationInFrames: 30 })}  // How: linear over 30 frames
/>
```

This separation allows mixing any presentation with any timing.

## Presentation Types

### Fade

Crossfade between scenes:

```typescript
import { fade } from '@remotion/transitions/fade';

<TransitionSeries.Transition presentation={fade()} timing={timing} />
```

### Wipe

One scene wipes over another:

```typescript
import { wipe } from '@remotion/transitions/wipe';

// Wipe from right
<TransitionSeries.Transition
  presentation={wipe({ direction: 'from-right' })}
  timing={timing}
/>

// Wipe from left
<TransitionSeries.Transition
  presentation={wipe({ direction: 'from-left' })}
  timing={timing}
/>

// Other directions: 'from-top', 'from-bottom'
```

### Slide

Slide one scene over another:

```typescript
import { slide } from '@remotion/transitions/slide';

// Slide from left
<TransitionSeries.Transition
  presentation={slide({ direction: 'from-left' })}
  timing={timing}
/>

// Other directions: 'from-right', 'from-top', 'from-bottom'
```

### Flip

3D flip effect:

```typescript
import { flip } from '@remotion/transitions/flip';

<TransitionSeries.Transition
  presentation={flip({ direction: 'from-left' })}
  timing={timing}
/>
```

## Timing Functions

### Linear Timing

Constant speed throughout transition:

```typescript
import { linearTiming } from '@remotion/transitions';

const timing = linearTiming({ durationInFrames: 30 });
```

**Use for:** Professional, predictable transitions. Most common choice.

### Spring Timing

Physics-based animation with bounce:

```typescript
import { springTiming } from '@remotion/transitions';

const timing = springTiming({
  config: { damping: 200 },
  durationRestThreshold: 0.001,
});
```

**Parameters:**
- `damping`: Higher = less bounce (100-300 typical)
- `durationRestThreshold`: When to consider spring "settled"

**Use for:** Playful, energetic transitions.

**Note:** Spring timing duration is calculated automatically, not specified.

### Custom Timing

Create custom easing curves:

```typescript
import { customTiming } from '@remotion/transitions';

const timing = customTiming({
  durationInFrames: 30,
  easing: (t) => t * t,  // Ease-in quadratic
});
```

## Complete Transition Example

```typescript
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';

<TransitionSeries>
  {/* Scene 1 */}
  <TransitionSeries.Sequence durationInFrames={150}>
    <AvatarScene />
  </TransitionSeries.Sequence>

  {/* Fade transition */}
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 20 })}
  />

  {/* Scene 2 */}
  <TransitionSeries.Sequence durationInFrames={120}>
    <BRollScene />
  </TransitionSeries.Sequence>

  {/* Wipe transition */}
  <TransitionSeries.Transition
    presentation={wipe({ direction: 'from-right' })}
    timing={linearTiming({ durationInFrames: 25 })}
  />

  {/* Scene 3 */}
  <TransitionSeries.Sequence durationInFrames={180}>
    <AvatarScene />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Duration Impact

**Critical:** Transitions overlap scenes, reducing total duration.

**Without transitions:**
```
Scene1 (150) → Scene2 (120) → Scene3 (180)
Total: 150 + 120 + 180 = 450 frames
```

**With transitions:**
```
Scene1 (150) →[fade 20]→ Scene2 (120) →[wipe 25]→ Scene3 (180)
Total: 150 + 120 + 180 - 20 - 25 = 405 frames
```

**Formula:**
```
totalDuration = sum(scene durations) - sum(transition durations)
```

**Example calculation:**

```typescript
const scenes = [
  { durationInFrames: 150 },
  { durationInFrames: 120 },
  { durationInFrames: 180 },
];

const transitions = [
  { durationInFrames: 20 },  // fade
  { durationInFrames: 25 },  // wipe
];

const totalSceneDuration = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
// 150 + 120 + 180 = 450

const totalTransitionDuration = transitions.reduce((sum, t) => sum + t.durationInFrames, 0);
// 20 + 25 = 45

const compositionDuration = totalSceneDuration - totalTransitionDuration;
// 450 - 45 = 405 frames
```

## Choosing Transition Duration

**General guidelines:**

- **Fast cuts (20-30 frames):** 0.67-1 second at 30fps - Energetic, modern
- **Medium (30-45 frames):** 1-1.5 seconds - Balanced, professional
- **Slow (45-60 frames):** 1.5-2 seconds - Dramatic, cinematic

**Match to pacing:**

```typescript
// Fast-paced video (89 cuts/min)
const transitionDuration = 20;  // 0.67s - quick transitions

// Medium-paced video (45 cuts/min)
const transitionDuration = 35;  // 1.2s - smooth transitions

// Slow-paced video (20 cuts/min)
const transitionDuration = 50;  // 1.67s - lingering transitions
```

## Mixing Transition Types

Vary transitions to maintain interest:

```typescript
const getTransition = (index: number) => {
  const types = [
    fade(),
    wipe({ direction: 'from-right' }),
    slide({ direction: 'from-left' }),
  ];
  return types[index % types.length];
};

<TransitionSeries>
  {scenes.map((scene, index) => (
    <React.Fragment key={scene.id}>
      <TransitionSeries.Sequence durationInFrames={scene.durationInFrames}>
        {renderScene(scene)}
      </TransitionSeries.Sequence>

      {index < scenes.length - 1 && (
        <TransitionSeries.Transition
          presentation={getTransition(index)}
          timing={linearTiming({ durationInFrames: 30 })}
        />
      )}
    </React.Fragment>
  ))}
</TransitionSeries>
```

---

**Key Takeaways:**

1. Presentation (visual) is separate from timing (animation curve)
2. Main types: fade, wipe, slide, flip
3. linearTiming for professional feel, springTiming for playful
4. Transitions reduce total duration (scenes overlap)
5. Fast transitions (20-30 frames) for energetic pacing
6. Vary transition types to maintain visual interest
