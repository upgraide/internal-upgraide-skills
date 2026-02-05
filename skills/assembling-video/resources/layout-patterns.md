# Layout Patterns

Proven composition patterns for Instagram Reels. Pick a pattern, don't invent one.

## Pattern A: Avatar + Content (Split)

**Use when:** Hook, explanations, any moment with speaking avatar

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─ TOP_TEXT (Y=100) ─────────────┐ │
│  │   [Logo] Headline text         │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ HERO_CARD (Y=230) ────────────┐ │
│  │ ┌────────────────────────────┐ │ │
│  │ │                            │ │ │
│  │ │      Content Card          │ │ │
│  │ │      (16:9 or mockup)      │ │ │
│  │ │                            │ │ │
│  │ └────────────────────────────┘ │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ BOTTOM_TEXT (Y=830) ──────────┐ │
│  │   Supporting text line         │ │
│  └────────────────────────────────┘ │
│                                     │
│  ╔════════════════════════════════╗ │
│  ║                                ║ │
│  ║   AVATAR (height: 48%)         ║ │
│  ║   bottom: 0                    ║ │
│  ║                                ║ │
│  ╚════════════════════════════════╝ │
└─────────────────────────────────────┘
```

**Code skeleton:**
```typescript
// Layer order (back to front): avatar, card, text
<div style={{ position: 'absolute', bottom: 0, height: '48%' }}>
  <Video src={avatar} />
</div>
<div style={{ position: 'absolute', top: 230, left: '50%', transform: 'translateX(-50%)' }}>
  <ContentCard />
</div>
<div style={{ position: 'absolute', top: 100, width: '100%', textAlign: 'center' }}>
  <Headline />
</div>
```

---

## Pattern B: Full Canvas Hero

**Use when:** Hero moment, big reveal, punchline, no avatar

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─ TOP_TEXT (Y=200) ─────────────┐ │
│  │   Setup text                   │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ HERO (Y=350, centered) ───────┐ │
│  │ ┌────────────────────────────┐ │ │
│  │ │                            │ │ │
│  │ │                            │ │ │
│  │ │      HERO ELEMENT          │ │ │
│  │ │      (scales to 1.1-1.2)   │ │ │
│  │ │                            │ │ │
│  │ │                            │ │ │
│  │ └────────────────────────────┘ │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ BOTTOM_TEXT (Y=1100) ─────────┐ │
│  │   Punchline or CTA             │ │
│  └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Transition into this pattern:**
- Avatar exits (slides down, opacity 0)
- Card moves from Y=230 → Y=350 (centers vertically)
- Card scales from 1.0 → 1.15 (becomes hero)

---

## Pattern C: Vertical Stack (Comparison)

**Use when:** Comparing options, "X vs Y", building to punchline

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─ TEXT_1 (Y=480) ───────────────┐ │
│  │   "That's better than"         │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ LOGO_ROW (Y=700) ─────────────┐ │
│  │   [Logo A]  +  [Logo B]        │ │
│  │   ─────────────────────        │ │ ← strikethrough
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ PUNCHLINE (Y=980) ────────────┐ │
│  │        combined.               │ │
│  │        (big, gradient)         │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ CONTENT (Y=1050) ─────────────┐ │
│  │   [Previous hero pushed down]  │ │
│  │   (smaller, exiting right)     │ │
│  └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Vertical rhythm:** Equal spacing (~180-220px) between elements creates visual balance.

---

## Pattern D: Browser Mockup

**Use when:** Product demos, UI walkthroughs

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─ BROWSER (Y=180, 920×700) ─────┐ │
│  │ ┌──────────────────────────┐   │ │
│  │ │ ● ● ●    URL bar         │   │ │
│  │ ├──────────────────────────┤   │ │
│  │ │                          │   │ │
│  │ │     Browser Content      │   │ │
│  │ │     (ChatGPT, Kimi, etc) │   │ │
│  │ │                          │   │ │
│  │ └──────────────────────────┘   │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ TEXT (Y=920) ─────────────────┐ │
│  │   Caption text                 │ │
│  └────────────────────────────────┘ │
│                                     │
│  ╔════════════════════════════════╗ │
│  ║   AVATAR (smaller, ~35%)       ║ │
│  ╚════════════════════════════════╝ │
└─────────────────────────────────────┘
```

---

## Pattern E: Side-by-Side Comparison

**Use when:** Before/after, good vs bad

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─ HEADER (Y=150) ───────────────┐ │
│  │   Comparison title             │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ LEFT (X=70) ──┐ ┌─ RIGHT ─────┐ │  Y=280
│  │ ┌────────────┐ │ │ ┌──────────┐│ │
│  │ │            │ │ │ │          ││ │
│  │ │   BAD      │ │ │ │   GOOD   ││ │
│  │ │   (red X)  │ │ │ │  (check) ││ │
│  │ │            │ │ │ │          ││ │
│  │ └────────────┘ │ │ └──────────┘│ │
│  │    ChatGPT     │ │    Kimi     │ │
│  └────────────────┘ └─────────────┘ │
│                                     │
│  ┌─ BOTTOM_TEXT (Y=900) ──────────┐ │
│  │   "Kimi actually searches..."  │ │
│  │   (multi-line caption)         │ │
│  └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Pattern Transitions

How patterns flow into each other:

| From | To | Transition |
|------|-----|------------|
| A (Avatar+Content) | B (Full Hero) | Avatar exits down, card moves to center + scales up |
| A (Avatar+Content) | C (Stack) | Avatar exits, content slides left, stack enters right |
| B (Full Hero) | C (Stack) | Hero shrinks + moves down, stack builds above |
| D (Browser) | A (Avatar+Content) | Browser shrinks/morphs, avatar rises |

---

## Act Structure Template

Most videos follow this pattern:

| Act | Typical Pattern | Purpose |
|-----|-----------------|---------|
| 1 (Hook) | A: Avatar + Content | Establish credibility, show result |
| 2 (Transition) | A → B or A → C | Clear stage, build anticipation |
| 3 (Build) | C: Stack or D: Browser | Deliver value, comparisons |
| 4 (Payoff) | B: Full Hero | Punchline, big moment |
| 5 (CTA) | A: Avatar + Content | Call to action with avatar |

---

## Quick Reference

| Pattern | Avatar | Best For |
|---------|--------|----------|
| A: Avatar + Content | Yes (48%) | Hooks, explanations |
| B: Full Canvas Hero | No | Reveals, punchlines |
| C: Vertical Stack | No | Comparisons, builds |
| D: Browser Mockup | Optional (35%) | Product demos |
| E: Side-by-Side | No | Before/after |
