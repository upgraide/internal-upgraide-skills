# Keyframes Before Animation

**Source:** Claude iOS video planning session (2025-12-03)
**Validated:** Multiple failed iterations before this approach worked

## The Insight

Define static "frozen" keyframe layouts BEFORE thinking about transitions or animations. Each keyframe is a poster frame - what does this moment look like when everything has settled?

## Why It Works

When you start with animations, you over-engineer movement without ensuring each destination looks good. By designing frozen layouts first:
- You guarantee each "settled" moment is visually strong
- Transitions become simple: "how do we get from layout A to layout B?"
- You can review static mockups before committing to implementation

## How to Apply

1. **List story beats** - What moments need a distinct visual?
2. **Design each beat as a static layout** - Ignore movement, just position elements
3. **Review layouts** - Do they flow? Is each one visually interesting?
4. **Only then add transitions** - Spring entrances, exits, crossfades

## Example

**Wrong approach (what I tried first):**
```
Frame 0: Avatar enters with spring
Frame 15: Text slides in from right
Frame 30: Card fades in and scales
...trying to choreograph movement without knowing destinations
```

**Right approach:**
```
KEYFRAME 1 (settled state):
- Headline pill at top (Y: 100)
- Content card in middle (Y: 220)
- Avatar at bottom (48% height)
- Caption synced

KEYFRAME 2 (settled state):
- Different layout...

THEN: How do we transition from KF1 to KF2?
```

The layout comes first. Movement serves the layout.
