# Components

Production-quality reusable components built through iterative refinement.

## Purpose

This folder stores React components that have been tested, refined, and proven to work well. These components can be reused across multiple video projects.

## When to Save a Component

Save a component here when:
- ✅ It has been built from Remotion primitives
- ✅ User has reviewed and approved the functionality
- ✅ It solves a reusable pattern (not project-specific)
- ✅ It's production-quality (not a quick experiment)
- ✅ It includes clear props and documentation

## How to Save

1. **Create the file:** `ComponentName.tsx`
2. **Add documentation:** Include JSDoc comments explaining what it does and when to use it
3. **Export properly:** Use named exports for easy importing

## Example Component Structure

```typescript
/**
 * SplitScreenLayout - Displays two videos in top/bottom split screen for reels
 *
 * Use when: Style blueprint specifies "split-screen" layout or when showing
 * avatar + UI demo simultaneously.
 *
 * @example
 * <SplitScreenLayout
 *   topVideo={staticFile('inputs/avatar.mp4')}
 *   bottomVideo={staticFile('inputs/ui-demo.mp4')}
 *   splitRatio={0.6}
 * />
 */

import { AbsoluteFill, Video, staticFile } from 'remotion';

interface SplitScreenLayoutProps {
  topVideo: string;
  bottomVideo: string;
  splitRatio?: number; // 0.5 = 50/50, 0.6 = 60/40
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  topVideo,
  bottomVideo,
  splitRatio = 0.5,
}) => {
  return (
    <AbsoluteFill>
      {/* Top section */}
      <div style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        height: `${splitRatio * 100}%`,
        overflow: 'hidden',
      }}>
        <Video
          src={topVideo}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Bottom section */}
      <div style={{
        position: 'absolute',
        top: `${splitRatio * 100}%`,
        width: '100%',
        height: `${(1 - splitRatio) * 100}%`,
        overflow: 'hidden',
      }}>
        <Video
          src={bottomVideo}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </AbsoluteFill>
  );
};
```

## Good Component Examples

Components worth creating:
- `SplitScreenLayout` - Top/bottom split for reels
- `ContinuousAvatarComposition` - Avatar plays continuously with dynamic overlays
- `AudioMixer` - Mix multiple audio tracks with ducking
- `AnimatedCaptions` - Word-by-word caption animations
- `LogoWatermark` - Persistent logo overlay with fade
- `TransitionPack` - Custom transition collection

## Not Good for Components

Don't save here if:
- ❌ It's project-specific (save in `examples/` instead)
- ❌ It hasn't been tested with user feedback
- ❌ It's a quick experiment or first draft
- ❌ It's too simple (just use Remotion primitives directly)

---

## Available Components

### LogoComparison
**File:** `LogoComparison.tsx`
**Use when:** Hook comparing products ("better than X + Y combined"), any "versus" messaging

**Features:**
- Supports 2+ logos with staggered entrance
- Animated strikethrough sweep (Apple red by default)
- Customizable separator ("+" or "vs" or custom)
- Spring-based animations

**Example:**
```tsx
<LogoComparison
  logos={[
    { src: staticFile("logos/competitor1.png"), name: "Competitor", delay: 0 },
    { src: staticFile("logos/competitor2.png"), name: "Other", delay: 14 },
  ]}
  separator="+"
  strikethrough={{ progress: strikethroughProgress, color: "#FF3B30" }}
/>
```

---

### ChatInputCard
**File:** `ChatInputCard.tsx`
**Documentation:** `README-ChatInputCard.md`
**Use when:** AI product demos, chat interface animations

---

### SliderCard
**File:** `SliderCard.tsx`
**Use when:** Before/after comparisons, transformation reveals, hook sections showing product results

**Features:**
- Animated clip-path reveal from left to right
- Glowing slider line at reveal edge
- Before/After labels that fade based on slider position
- Spring-based entrance and slider animations

**Example:**
```tsx
<SliderCard
  beforeSrc="hook/before.mp4"
  afterSrc="hook/after.mp4"
  entranceFrame={5}
  top={250}
  sliderDelay={15}
  videoZoom={{ scale: 1.6, originX: "50%", originY: "25%" }}
/>
```

---

### iOSLiquidGlassCard
**File:** `iOSLiquidGlassCard.tsx`
**Use when:** Notification-style cards, app comparison hooks, tutorial overlays

Apple's iOS 18+ "liquid glass" design language for notification-style cards. Includes the precise glass blur formula, noise texture, and Apple typography.

**Design Specs:**
- Two-layer white gradient (60% + 25%) for depth
- 100px backdrop blur for glass effect
- Subtle SVG noise texture overlay
- Pill-shaped border radius (50px)
- Apple Vibrant label colors

**Exports:**
- `iOSLiquidGlassCard` - Main notification card with entrance animation
- `StackedNotifications` - Container for stacking multiple cards
- `TypingIndicator` - iOS bouncing dots animation
- `TextureOverlay` - Reusable noise texture
- `IOS_LIQUID_GLASS` - Design tokens (colors, styles)
- `IOS_TYPOGRAPHY` - Font styles
- `IOS_SPRINGS` - Animation configs
- `SAFE_ZONES` - Instagram Reels/TikTok safe areas

**Example:**
```tsx
import {
  iOSLiquidGlassCard,
  StackedNotifications,
  IOS_LIQUID_GLASS,
} from './components/iOSLiquidGlassCard';

// In your composition:
<StackedNotifications>
  <iOSLiquidGlassCard
    icon="icons/siri.png"
    appName="Siri"
    timestamp="10y ago"
    message={<>Is Legitimately <span style={{color: IOS_LIQUID_GLASS.accents.error}}>Useless</span></>}
  />
  <iOSLiquidGlassCard
    icon="icons/claude.png"
    appName="Claude"
    timestamp="now"
    message={<>Get your <span style={{color: IOS_LIQUID_GLASS.accents.claude}}>AI assistant</span></>}
    delay={8}
    entranceDirection="bottom"
  />
</StackedNotifications>
```

---

### CumulativeTextOverlay
**File:** `CumulativeTextOverlay.tsx`
**Use when:** Listicle videos where text builds up item-by-item (e.g., "7 ways to...", "5 things you need...")

**Features:**
- Hook text centered in intro scene
- Cumulative list that builds as scenes progress
- Spring-based entrance animations per item
- Configurable font sizes and hook text

**Example:**
```tsx
<CumulativeTextOverlay
  scenes={SCENES}  // Array with id, label, startFrame, endFrame
  hookText="how to CHANGE your life:"
  fontSize={52}
  hookFontSize={68}
/>
```

---

**Build components as needs arise through iterative development with user feedback.**
