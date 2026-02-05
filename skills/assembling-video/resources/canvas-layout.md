# Canvas Layout Guide

Visual map of the 1080×1920 Instagram Reels canvas with named zones.

## The Canvas

```
┌─────────────────────────────────────┐ Y=0
│░░░░░░░░░░ SAFE ZONE TOP ░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ Y=150
├─────────────────────────────────────┤
│                                     │
│  ┌─ TOP_TEXT ─────────────────────┐ │ Y=100-180
│  │ Headlines, logos, short text   │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ HERO_ZONE ────────────────────┐ │ Y=200-550
│  │                                │ │
│  │   Main content card/video      │ │
│  │   16:9 aspect = ~560px tall    │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ MIDDLE_TEXT ──────────────────┐ │ Y=480-600
│  │ Comparison text, transitions   │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ CONTENT_ZONE ─────────────────┐ │ Y=600-850
│  │ Logo rows, secondary cards     │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ BOTTOM_TEXT ──────────────────┐ │ Y=830-950
│  │ Punchlines, CTAs               │ │
│  └────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤ Y=1000
│  ┌─ AVATAR_ZONE ──────────────────┐ │
│  │                                │ │
│  │   Avatar video (bottom 48%)    │ │ height: 48% = 922px
│  │   Anchored to bottom: 0        │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│░░░░░░░░░░ SAFE ZONE BOTTOM ░░░░░░░░│ Y=1570
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────┘ Y=1920

Width: 1080px (horizontal safe zone: 70px each side)
```

## Zone Presets

Copy these into your composition:

```typescript
const ZONES = {
  // Safe areas (Instagram UI overlays)
  SAFE_TOP: 150,
  SAFE_BOTTOM: 350,
  SAFE_HORIZONTAL: 70,

  // Named content zones (Y coordinates)
  TOP_TEXT: 100,        // Headlines just below safe zone
  HERO_CARD: 230,       // Main content card (when avatar visible)
  HERO_FULL: 300,       // Hero card when avatar NOT visible (more centered)
  MIDDLE_TEXT: 480,     // Transition text, comparisons
  CONTENT_ROW: 700,     // Logo rows, secondary content
  BOTTOM_TEXT: 830,     // Text above avatar
  PUNCHLINE: 980,       // Big impact text (when avatar gone)

  // Avatar
  AVATAR_HEIGHT: '48%', // Bottom portion of screen
  AVATAR_BOTTOM: 0,     // Anchored to bottom

  // Calculated values
  USABLE_HEIGHT: 1420,  // 1920 - 150 - 350
  CENTER_Y: 860,        // Visual center of usable area
};
```

## Common Y Positions (Tested Values)

These positions were validated in successful videos:

| Zone | Y Position | Use Case |
|------|------------|----------|
| 100 | Top headline, logo + text | "Kimi just dropped" |
| 230 | Hero card with avatar below | Main content in split layout |
| 300-350 | Hero card without avatar | Centered hero moment |
| 480 | Middle text | "That's better than" comparison |
| 700 | Logo/comparison row | Gamma + Canva logos |
| 830 | Bottom text | "a free slide generator" |
| 980 | Punchline | "combined." finale |
| 1050 | Content pushed down | When element moves for new content |

## The Golden Rule

**Every frame should feel intentionally full.**

When an element exits, another element should:
- Enter to fill the space, OR
- Move/scale to occupy the vacated area

```
BAD:  Element exits → Empty space → New element enters
GOOD: Element exits → Simultaneous → New element enters/expands
```

## Visual Checklist

Before coding, sketch your layout for each act:

```
Act 1: ____________
┌─────────────────┐
│ [what's here?]  │ ← Zone: _______
│                 │
│ [what's here?]  │ ← Zone: _______
│                 │
│ [what's here?]  │ ← Zone: _______
└─────────────────┘

Transition: [what exits?] → [what enters/moves?]
```

## Width Guidelines

| Element | Width | Notes |
|---------|-------|-------|
| Full-width text | 940px | Centered, 70px margins |
| Hero card | 900-1000px | Prominent, centered |
| Browser mockup | 920px | Standard mockup width |
| Logo pill | ~280px | Logo + name |
| Logo row (2 items) | ~600px | Two logos with gap |

## Aspect Ratios in the Canvas

| Content | Aspect | At 900px width | At 1000px width |
|---------|--------|----------------|-----------------|
| Slide/Card | 16:9 | 506px tall | 562px tall |
| Browser | ~16:10 | 562px tall | 625px tall |
| Square | 1:1 | 900px tall | 1000px tall |
