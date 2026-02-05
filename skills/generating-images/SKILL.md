---
name: generating-images
description: Generates images using Nano Banana Pro (Gemini 3) and Seedream-4. Use when creating B-roll, portraits, infographics, backgrounds, or extracting logos.
---

# Generating Images

## Workflow: Generate → Review → Iterate

```
Image Generation Progress:
- [ ] Step 1: Generate image with appropriate generator
- [ ] Step 2: Show image to user for review
- [ ] Step 3: Get feedback (approve or request changes)
- [ ] Step 4: If changes needed, regenerate with adjusted prompt
- [ ] Step 5: Repeat until approved
```

**Critical**: Never skip user review. Each image must be approved before use.

## Requirements

**Environment:**
```
GEMINI_API_KEY=your_key_here
REPLICATE_API_TOKEN=your_key_here
LOGO_DEV_API_KEY=your_key_here   # Optional, for logo extraction
```

## Generator Selection

| Use Case | Generator | Model |
|----------|-----------|-------|
| **People with likeness** | Seedream-4 + reference | `bytedance/seedream-4` |
| **Text/infographics** | Nano Banana Pro | `gemini-3-pro-image-preview` |
| **B-roll, backgrounds** | Seedream-4 | `bytedance/seedream-4` |
| **Image editing** | Nano Banana Pro + images | `gemini-3-pro-image-preview` |

**Key rules:**
- For specific people → ALWAYS use Seedream-4 with `--reference`
- Nano Banana = text rendering, infographics, editing (NOT for generating people)
- Gemini 3 Pro is intelligent — use simple, direct prompts

## Prompting Formulas

### Nano Banana Pro (Reasoning-First)

```text
**Role**: [Professional role for the shot].
**Subject**: [What/who is in the image].
**Thinking Process**:
1. **[Aspect 1]**: [Specific detail]
2. **[Aspect 2]**: [Specific detail]
3. **[Aspect 3]**: [Specific detail]
**Technical**: [Camera specs: lens, f-stop, shutter].
```

### Seedream-4 (Structured)

```text
[Style] + [Subject] + [Action/Pose] + [Environment] + [Lighting] + [Technical]
```

## Commands

**Nano Banana Pro:**
```bash
node servers/nanobanana/generate-image.js \
  --prompt "**Role**: ... **Subject**: ..." \
  --aspect-ratio "9:16"
```

**Nano Banana Pro with reference images:**
```bash
node servers/nanobanana/generate-image.js \
  --prompt "Add text 'TITLE' to this image" \
  --images "/path/to/image1.png,/path/to/image2.jpg" \
  --aspect-ratio "9:16"
```

**Seedream-4:**
```bash
node servers/seedream/generate-image.js \
  --prompt "subject, environment, lighting, style" \
  --aspect-ratio "9:16"
```

**Seedream-4 with reference:**
```bash
node servers/seedream/generate-image.js \
  --prompt "same character in new pose" \
  --reference "/path/to/base-image.png" \
  --ref-strength 0.85 \
  --aspect-ratio "9:16"
```

**Logo extraction:**
```bash
node servers/logodev/search-brand.js --brand "Nike" --size 128 --format "png"
```

## Output

Images save to specified output path or default `outputs/`. Output JSON:
```json
{ "path": "/absolute/path/to/image.png" }
```

## Aspect Ratios

- `9:16` — Vertical (Reels, TikTok) — **default**
- `16:9` — Landscape (YouTube)
- `1:1` — Square

## Iteration Tips

- Adjust ONE element at a time (lighting OR pose OR expression)
- Be more specific where the previous attempt failed
- Use reference images for consistency across shots
- Small iterative edits work best — build up step by step
- Use layout references for specific compositions

## Resources

- [resources/prompting-guide.md](resources/prompting-guide.md) — Complete prompting techniques
- [resources/examples.md](resources/examples.md) — Prompt templates by category
- [resources/logo-guidelines.md](resources/logo-guidelines.md) — Logo extraction guide
