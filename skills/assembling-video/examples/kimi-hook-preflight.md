# Kimi Hook Pre-flight Plan (Completed Example)

This is the pre-flight plan for our best-performing hook. Use as reference.

**Result:** 110 frames (3.67s), minimal iterations needed.

---

## Script

> "Kimi just dropped a free slide generator. That's better than Gamma and Canva combined."

---

## Step 1: Script → Acts

| Act | Frames | Script Beat | Duration |
|-----|--------|-------------|----------|
| 1 | 0-42 | "Kimi just dropped a free slide generator" | 1.4s |
| 2 | 42-54 | [Transition - clear stage, build anticipation] | 0.4s |
| 3 | 54-72 | "That's better than" | 0.6s |
| 4 | 72-110 | "Gamma and Canva combined." | 1.27s |

---

## Step 2: Pattern per Act

| Act | Pattern | Why |
|-----|---------|-----|
| 1 | A: Avatar + Content | Hook with credibility, show the product |
| 2 | A → B Transition | Clear avatar, card becomes hero |
| 3 | C: Vertical Stack | Build comparison |
| 4 | C: Vertical Stack + Punchline | Complete the comparison, land the message |

---

## Step 3: Elements per Act

```
ACT 1 (Avatar + Content):
├── Avatar (bottom: 0, height: 48%)
│   └── Purpose: Credibility, human connection
├── Hero card with B-roll (top: 230, width: 1000px)
│   └── Purpose: Show the product result immediately
├── Top text: "[Kimi logo] just dropped" (top: 100)
│   └── Purpose: Name drop with visual anchor
└── Bottom text: "a free slide generator" (top: 832)
    └── Purpose: Value proposition

ACT 2 (Transition):
├── Avatar → exits down (bottom: 0 → -500, 6 frames)
│   └── FAST exit - done by frame 48
├── Top text → exits up (top: 100 → -100)
├── Bottom text → exits down (top: 832 → 1100)
└── Hero card → stays at 230, preparing to move
    └── Movement delayed until frame 46 (after avatar gone)

ACT 3 (Stack builds):
├── Hero card → moves down (top: 230 → 1050), scales to 0.9
│   └── Makes room for comparison above
├── "That's better than" → enters (top: 480)
│   └── Word-by-word punch: "That's" → "better" → "than"
└── Logo row: [Gamma] + [Canva] → enters (top: 700)
    └── Staggered: Gamma at frame 72, Canva at frame 86

ACT 4 (Punchline):
├── Logo row → gets red strikethrough (frames 92-100)
├── "combined." → enters (top: 980)
│   └── BIG punch: scale 1.5 → 1.0, gradient text
└── Hero card → exits right (x: 0 → 1200, opacity 0)
    └── Clears frame for punchline impact
```

---

## Step 4: Transition Choreography

**ACT 1 → ACT 2 (frame 42):**
```
EXITS (fast, decisive):
  - Avatar: bottom 0 → -600, scale 1 → 0.8, opacity → 0
    Timing: frames 42-48 (6 frames, FAST)
  - Top text: top 100 → -100, opacity → 0
    Timing: frames 42-54 (12 frames)
  - Bottom text: top 832 → 1100, opacity → 0
    Timing: frames 42-54 (12 frames)

STAYS:
  - Hero card: remains at top 230
    Reason: Avatar must exit first, then card moves

SFX:
  - Whoosh at frame 42
```

**ACT 2 → ACT 3 (frame 46-54):**
```
MOVES (after avatar is gone):
  - Hero card: top 230 → 1050, scale 1.0 → 0.9
    Timing: starts frame 46, arrives by frame 54
    Reason: Creates space for comparison stack

ENTERS:
  - "That's better than" text at top 480
    Timing: frame 54 (word-by-word continues through act)
```

**ACT 3 → ACT 4 (frame 72):**
```
ENTERS:
  - Gamma logo at frame 72
  - Canva logo at frame 86
  - Strikethrough sweeps frames 92-100
  - "combined." punches at frame 97

EXITS:
  - Hero card: x 0 → 1200, opacity → 0
    Timing: frames 86-97 (exits as punchline enters)
```

---

## Step 5: Keyframes Object

```typescript
const KEYFRAMES = {
  // Top text: "[Kimi logo] just dropped"
  topText: {
    frames:  [0,   2,    42,   54],
    top:     [100, 100,  100,  -100],
    opacity: [0,   1,    1,    0],
    scale:   [0.9, 1,    1,    0.95],
  },

  // B-roll hero card
  broll: {
    frames:  [0,   4,   42,  46,  54,   72,   86,   97,   110],
    top:     [230, 230, 230, 230, 1050, 1050, 1100, 1150, 1150],
    x:       [0,   0,   0,   0,   0,    0,    400,  1200, 1200],
    scale:   [0.9, 1.0, 1.0, 1.0, 0.9,  0.9,  0.85, 0.8,  0.8],
    opacity: [0,   1,   1,   1,   1,    1,    0.8,  0,    0],
  },

  // Bottom text: "a free slide generator"
  bottomText: {
    frames:  [0,   26,  42,   54],
    top:     [832, 832, 832,  1100],
    opacity: [0,   1,   1,    0],
    scale:   [0.9, 1,   1,    0.95],
  },

  // Avatar
  avatar: {
    frames:  [0,    4,   42,  48],
    bottom:  [0,    0,   0,   -600],
    opacity: [0,    1,   1,   0],
    scale:   [0.95, 1,   1,   0.8],
  },

  // "That's better than" text
  comparisonText: {
    frames:  [54,  62,  110],
    top:     [480, 480, 480],
    opacity: [0,   1,   1],
  },

  // Logo row
  logoRow: {
    frames:  [72,  82,  110],
    top:     [700, 700, 700],
    opacity: [0,   1,   1],
  },

  // Strikethrough
  strikethrough: {
    frames:  [92,  100, 110],
    width:   [0,   100, 100],
  },

  // "combined." punchline
  combinedText: {
    frames:  [97,  107, 110],
    top:     [980, 980, 980],
    opacity: [0,   1,   1],
  },
};
```

---

## Step 6: Visual Verification

**Act 1 frame sketch:**
```
┌─────────────────────────────────────┐
│  [Kimi logo] just dropped     Y=100 │
│                                     │
│  ┌────────────────────────────┐     │
│  │                            │ 230 │
│  │     B-roll (slide output)  │     │
│  │                            │     │
│  └────────────────────────────┘     │
│                                     │
│  a free slide generator       Y=832 │
│                                     │
│  ╔════════════════════════════╗     │
│  ║     AVATAR (48%)           ║     │
│  ╚════════════════════════════╝     │
└─────────────────────────────────────┘
✓ Frame is full
✓ Clear hierarchy: avatar → card → text
✓ Avatar head visible (48% leaves room)
```

**Act 4 frame sketch:**
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│     That's  better  than      Y=480 │
│                                     │
│     [Gamma]  +  [Canva]       Y=700 │
│     ────────────────────            │
│                                     │
│        combined.              Y=980 │
│        (gradient, huge)             │
│                                     │
│                                     │
└─────────────────────────────────────┘
✓ Vertical stack is balanced (~200px gaps)
✓ Punchline has impact (big, gradient)
✓ Strikethrough adds visual drama
```

---

## Result

This pre-flight plan led to `KimiHookFull.tsx` - our best-performing hook.

**Key success factors:**
1. Every frame was planned before coding
2. Transitions had clear choreography (what exits when, what enters when)
3. Y positions were intentional, not guessed
4. Overlap timing prevented empty frames
5. Pattern selection matched message intent
