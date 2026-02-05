# ChatInputCard Component

## Overview

A premium, fully-animated chat input component with typing animation, button press feedback, loading pulse, and sound effects. Built for high-energy, professional video content.

## Features

✨ **6-Phase Animation System:**
1. **Entrance** - Smooth slide-in with whoosh sound
2. **Typing** - Character-by-character reveal with keyboard sounds
3. **Pause** - Button glow intensifies, building anticipation
4. **Button Press** - Satisfying press animation with sparkle burst
5. **Loading Pulse** - Energy waves emanate from button
6. **Exit** - Graceful fade and scale down

🎨 **Visual Effects:**
- Glassmorphism design with backdrop blur
- Rotating sparkle icon
- Animated shimmer sweep
- Pulsing glow effects
- Sparkle particle burst on click
- Subtle floating animation
- Card shake for haptic feel

🔊 **Sound Integration:**
- Whoosh on entrance
- Keyboard clicks while typing (randomized)
- Satisfying click on button press

⚙️ **Fully Customizable:**
- Flexible timing control via presets or custom values
- Optional loading pulse phase
- Scalable for different sizes
- Custom sound effect paths

## Installation

Component is located at:
```
.claude/skills/video-assembly/components/ChatInputCard.tsx
```

## Usage

### Basic Example

```tsx
import { ChatInputCard } from './.claude/skills/video-assembly/components/ChatInputCard';
import { CHAT_INPUT_PRESETS } from './.claude/skills/video-assembly/components/presets/chatInputPresets';
import { Sequence } from 'remotion';

// Use in your composition
<Sequence from={0} durationInFrames={105}>
  <ChatInputCard
    prompt="Generate me as a game character"
    timings={CHAT_INPUT_PRESETS.energetic}
    sounds={{
      typingSound: 'sound_effects/keyboard-click',
      buttonClickSound: 'sound_effects/button-click-satisfying.wav',
      whooshSound: 'sound_effects/ui-whoosh-entrance.wav',
    }}
    showLoadingPulse={true}
    scale={1}
  />
</Sequence>
```

### Props API

```typescript
interface ChatInputCardProps {
  // The text to type out
  prompt: string;

  // Timing configuration (use presets or custom)
  timings: ChatInputTimings;

  // Optional sound effects (paths relative to public/ folder)
  sounds?: {
    typingSound?: string;        // Base path, will append -1.wav, -2.wav, -3.wav
    buttonClickSound?: string;   // Full path to button click sound
    whooshSound?: string;        // Full path to entrance whoosh
  };

  // Visual customization
  scale?: number;               // Scale factor (default: 1)
  showLoadingPulse?: boolean;   // Show loading animation (default: true)
}
```

### Timing Presets

Four built-in presets for different pacing needs:

#### **ultraFast** - 2.0 seconds total
```typescript
CHAT_INPUT_PRESETS.ultraFast
// Perfect for: High-energy montages, rapid cuts
// Type: 0.5s | Pause: 0.3s | Press: 0.3s | Load: 0.5s | Exit: 0.4s
```

#### **energetic** - 3.5 seconds total (RECOMMENDED)
```typescript
CHAT_INPUT_PRESETS.energetic
// Perfect for: Product demos, feature showcases
// Type: 0.8s | Pause: 0.5s | Press: 0.5s | Load: 1.0s | Exit: 0.7s
```

#### **dramatic** - 4.9 seconds total
```typescript
CHAT_INPUT_PRESETS.dramatic
// Perfect for: Hero sections, important reveals
// Type: 1.0s | Pause: 0.8s | Press: 0.6s | Load: 1.5s | Exit: 1.0s
```

#### **minimal** - 1.5 seconds total
```typescript
CHAT_INPUT_PRESETS.minimal
// Perfect for: Quick transitions, B-roll inserts
// Type: 0.4s | Pause: 0.2s | Press: 0.2s | Load: 0s | Exit: 0.3s
// Note: No loading pulse
```

### Custom Timings

```typescript
const customTimings: ChatInputTimings = {
  typeInDuration: 30,        // frames
  pauseAfterTyping: 20,      // frames
  buttonPressDuration: 15,   // frames
  loadingPulseDuration: 40,  // frames
  exitDuration: 25,          // frames
};

<ChatInputCard
  prompt="Custom timing example"
  timings={customTimings}
  // ... other props
/>
```

### Calculate Total Duration

```typescript
import { getTotalDuration, getPhaseRanges } from './presets/chatInputPresets';

// Get total frames needed
const totalFrames = getTotalDuration(CHAT_INPUT_PRESETS.energetic);
// Returns: 105 frames (3.5 seconds at 30fps)

// Get frame ranges for each phase
const phases = getPhaseRanges(CHAT_INPUT_PRESETS.energetic);
console.log(phases);
// {
//   typing: { start: 0, end: 24 },
//   pause: { start: 24, end: 39 },
//   buttonPress: { start: 39, end: 54 },
//   loading: { start: 54, end: 84 },
//   exit: { start: 84, end: 105 },
//   total: 105
// }
```

## Required Sound Effects

Place these files in `public/sound_effects/`:

```
public/sound_effects/
├── keyboard-click-1.wav    # Typing variation 1
├── keyboard-click-2.wav    # Typing variation 2
├── keyboard-click-3.wav    # Typing variation 3
├── button-click-satisfying.wav
└── ui-whoosh-entrance.wav
```

**Note:** The component will look for `keyboard-click-1.wav`, `keyboard-click-2.wav`, etc. when you specify `typingSound: 'sound_effects/keyboard-click'`.

## Advanced Examples

### Multiple Cards in Sequence

```tsx
import { Series } from 'remotion';

<Series>
  <Series.Sequence durationInFrames={105}>
    <ChatInputCard
      prompt="Trump dancing with a banana"
      timings={CHAT_INPUT_PRESETS.energetic}
      sounds={{ /* ... */ }}
    />
  </Series.Sequence>

  <Series.Sequence durationInFrames={60}>
    <ChatInputCard
      prompt="Quick example"
      timings={CHAT_INPUT_PRESETS.ultraFast}
      sounds={{ /* ... */ }}
    />
  </Series.Sequence>
</Series>
```

### Skip Loading Pulse

```tsx
<ChatInputCard
  prompt="No loading animation"
  timings={CHAT_INPUT_PRESETS.minimal}
  showLoadingPulse={false}  // Skips loading phase
/>
```

### Scale for Different Layouts

```tsx
// Smaller card for split-screen layout
<ChatInputCard
  prompt="Scaled down"
  timings={CHAT_INPUT_PRESETS.energetic}
  scale={0.7}
/>
```

### Without Sound Effects

```tsx
// Silent mode - no sounds
<ChatInputCard
  prompt="Silent animation"
  timings={CHAT_INPUT_PRESETS.energetic}
  // sounds prop omitted
/>
```

## Animation Phases Explained

### Phase 1: Entrance (9 frames)
- Card slides up from below
- Scales from 0.85 → 1.0
- Fade in opacity
- Whoosh sound plays

### Phase 2: Typing (customizable)
- Characters appear one by one
- Blinking cursor visible
- Keyboard click sounds every ~3 characters
- Natural typing rhythm

### Phase 3: Pause (customizable)
- Full text visible
- Cursor blinks 2-3 times
- Button glow intensifies (draws attention)
- Builds anticipation

### Phase 4: Button Press (customizable)
- Button scales: 1.0 → 0.95 → 1.05 → 1.0
- Sparkle particles burst outward (4 particles)
- Card shakes slightly (haptic feedback)
- Click sound plays

### Phase 5: Loading Pulse (customizable, optional)
- 3 pulsing waves emanate from button
- Glow intensity increases
- Shimmer speed doubles
- Shows "processing" state

### Phase 6: Exit (customizable)
- Fade out opacity
- Scale down to 0.9
- Smooth spring animation
- Graceful disappearance

## Performance Notes

- Uses spring animations for natural motion
- Efficient re-renders (only active phases calculate)
- Sound files are loaded on-demand
- No external dependencies beyond Remotion

## Customization Tips

### Change Button Color

Edit the button gradient in ChatInputCard.tsx:
```tsx
background: 'linear-gradient(135deg, #d4ff00 0%, #c8f000 100%)'
// Change to your brand colors
```

### Adjust Glow Intensity

Modify `buttonGlowIntensity` calculation in the pause phase.

### Different Sparkle Icon

Change the sparkle character:
```tsx
<div>✦</div>  // Current
<div>★</div>  // Star
<div>◆</div>  // Diamond
<div>✨</div>  // Sparkles emoji
```

## Tips for Best Results

1. **Timing**: Use `energetic` preset for most cases - perfect balance
2. **Sound**: Make sure all 3 keyboard-click variations exist for natural feel
3. **Layout**: Component centers itself - use in `<Sequence>` or `<AbsoluteFill>`
4. **Prompt Length**: Keep prompts under 50 characters for best readability
5. **Multiple Cards**: Use `<Series>` for sequential cards without overlap
6. **Background**: Works best over images or video (glassmorphism shines)

## Troubleshooting

**"Cannot find module" error:**
- Check import paths are correct relative to your file location
- Ensure TypeScript can resolve `.claude/skills/` directory

**Sound not playing:**
- Verify sound files exist in `public/sound_effects/`
- Check file paths don't include `public/` prefix in props
- Ensure sound file names match exactly (case-sensitive)

**Animation feels slow:**
- Try `ultraFast` or `minimal` presets
- Reduce individual timing values in custom timings

**Button not pulsing:**
- Ensure `showLoadingPulse={true}`
- Check `loadingPulseDuration` is > 0

## Examples in the Wild

See `src/remotion/ChatInputTest.tsx` for a working demo composition.

---

**Built for:** High-energy Instagram Reels, TikTok videos, product demos
**Optimized for:** 9:16 vertical video (1080x1920)
**Frame rate:** 30fps (adjustable)
**Remotion version:** 4.0+
