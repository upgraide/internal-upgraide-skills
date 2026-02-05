# Layered Composition Over Flat Cuts

**Source:** Kimi video analysis + Claude iOS planning failures (2025-12-03)
**Validated:** KimiHookFull.tsx has 7 simultaneous layers; flat layouts felt amateur

## The Insight

Good video frames have **multiple layers working simultaneously**, not just one element at a time. Think of each frame as a designed slide with foreground, midground, and background - not a sequence of single elements.

## Why It Works

- Single element + avatar + caption = boring, flat, amateur
- Multiple layers = visual richness, professional feel
- Layers can enter/exit independently, creating visual interest
- The eye has more to engage with

## What Makes a Layered Frame

```
FLAT (wrong):                    LAYERED (right):
┌─────────────────┐              ┌─────────────────┐
│                 │              │  Logo + text    │  ← Layer 5
│                 │              │  ┌───────────┐  │
│  [ONE ELEMENT]  │              │  │ B-roll    │  │  ← Layer 4
│                 │              │  │ playing   │  │
│                 │              │  └───────────┘  │
│                 │              │  Bottom text    │  ← Layer 3
│    [AVATAR]     │              │  ┌───────────┐  │
│                 │              │  │  AVATAR   │  │  ← Layer 2
│   "caption"     │              │  └───────────┘  │  ← Layer 1: bg
└─────────────────┘              └─────────────────┘
```

## Layers in KimiHookFull.tsx

1. **Background** - Static color
2. **Avatar** - Bottom 48%, video
3. **B-roll card** - Middle, 16:9 video showing product
4. **Top text row** - Logo + "just dropped"
5. **Bottom text** - "a free slide generator"
6. **Comparison text** - "That's better than"
7. **Logo pills** - Gamma + Canva with strikethrough

Multiple elements visible AT THE SAME TIME, each with independent animation.

## How to Apply

When designing a keyframe, ask:
1. What's the **main content**? (card, UI, video)
2. What **text supports** it? (top row, bottom row)
3. What **context** is needed? (logos, icons)
4. Is **avatar** present? (emotional connection)

Don't settle for "one thing + avatar + caption" - layer the frame.

## Example

**Before (flat):**
```
┌─────────────────┐
│                 │
│  [Siri icon]    │  ← Just one element
│                 │
│    [AVATAR]     │
│  "Siri fails"   │
└─────────────────┘
```

**After (layered):**
```
┌─────────────────┐
│  🍎 Siri can't..│  ← Top row: logo + text
│  ┌───────────┐  │
│  │ Siri bubble│  │  ← Main content: failure bubble
│  │ "I can't  │  │
│  │  help..." │  │
│  │  📧 ════ ❌│  │  ← Secondary: email strikethrough
│  └───────────┘  │
│  SEARCH EMAILS  │  ← Caption
└─────────────────┘    (no avatar - Type B)
```

Much richer, more professional, more engaging.
