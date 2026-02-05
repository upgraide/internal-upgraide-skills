# Nano Banana Pro & Seedream-4 Prompting Guide

## Model Architecture Differences

| Feature | **Nano Banana Pro** (Gemini 3) | **Seedream-4** (ByteDance) |
| :--- | :--- | :--- |
| **Core Strength** | **Reasoning & Layout**. "Thinks" about composition logic before rendering. | **Identity & Consistency**. Keeps faces/products identical across shots. |
| **Prompt Style** | **Conversational/Directive**. Explain *why* elements are there. | **Structured/Token-Based**. Use explicit tagging and hierarchy. |
| **Text Capability** | **Native**. Full paragraphs, charts, diagrams accurately. | **Labeling**. Short signs/logos only. |
| **Editing** | **Instructional**. "Make the mood gloomier." | **Reference-Based**. "Use this structure, change texture to wood." |

---

## Nano Banana Pro: The "Thinking" Workflow

Nano Banana Pro uses a hidden "Chain of Thought" process. Trigger this reasoning by separating **Intent** from **Visuals**.

### Formula
```
[Role/Goal] + [Thinking Process] + [Visual Description] + [Technical Constraints]
```

### Key Thinking Triggers

| Trigger | Effect |
|---------|--------|
| "Plan the lighting..." | Forces light source calculation before rendering |
| "Ensure anatomical correctness..." | Triggers skeletal check during thinking phase |
| "Visualize the data..." | Structures information before rendering (charts/infographics) |
| "**Thinking Process**: 1. 2. 3." | Explicit reasoning chain for complex compositions |
| "**Narrative**:" | Adds emotional/story depth to portraits |
| "**Symbolism**:" | Embeds meaning into visual elements |

### Prompt Structure

```text
**Role**: [Expert persona]
**Subject**: [Main focus]
**Thinking Process**:
1.  [Narrative/Story element]
2.  [Composition logic]
3.  [Lighting rationale]
**Visuals**: [Specific visual description]
**Technical**: [Camera, lens, film style]
```

### Example

```text
**Role**: Award-winning Editorial Photographer.
**Subject**: An elderly watchmaker.
**Thinking Process**:
1.  **Narrative**: He is realizing he has run out of time himself.
2.  **Symbolism**: Watches around him stopped at different times, his wristwatch blurred (moving fast).
3.  **Lighting**: Late afternoon Golden Hour, dust motes, nostalgic feeling.
4.  **Expression**: Melancholy but peaceful.
**Visuals**: Macro shot, focus on weathered hands holding tiny gear. Cluttered workshop background.
**Technical**: 85mm lens, f/1.8, Kodak Portra 400 film grain.
```

---

## Seedream-4: Multi-Reference & Consistency

Seedream-4 treats generation and editing as the same task. Relies on **Reference Anchors**.

### Formula
```
[Subject Action] + [Reference instructions] + [Style]
```

### Key Parameters

| Parameter | Range | Effect |
|-----------|-------|--------|
| `--ref_strength 0.3-0.5` | Copies vibe/composition, changes subject |
| `--ref_strength 0.8-0.9` | Copies subject identity (face/product) exactly |

### Golden Prompt Formula
```
[Style] + [Subject] + [Action/Pose] + [Environment] + [Lighting] + [Mood]
```

### Multi-Reference Syntax

When using multiple references, explicitly name roles:
```
"Subject from img1, background from img2, style of img3"
```

### Character Consistency Workflow

1. **Start simple**: One clean base image, full-body, clear lighting
2. **Reference directly**: "Same character as image #1" + explicit feature mentions
3. **Change one thing**: New pose OR location OR outfit (not all at once)

Example sequence:
```
Gen 1: Clean character portrait, full body, neutral background
Gen 2: "Same character as image #1 — new pose in a coffee shop"
Gen 3: "Same character — same location, now holding a book"
Gen 4: "That girl from image #3 — add winter coat, keep everything else"
```

### Preserve Elements During Edits

```
"Keep the woman's facial features and clothing unchanged while changing the background"
```

```
"Don't change her face or red boots — just put her in a library with a talking parrot"
```

---

## Common Mistakes

### 1. Vague Prompts
```
Bad:  "Nice landscape"
Good: "Mountain valley at sunrise, mist rising from river, photorealistic, golden light"
```

### 2. Overloaded Prompts
```
Bad:  "Dragon, city, fire, night, aerial, steampunk, futuristic"
Good: "Dragon over medieval castle, fire from mouth, watercolor style"
```

### 3. Style Contradictions
```
Bad:  "oil painting, real photo"
Good: "photorealistic" OR "oil painting style"
```

### 4. No Reasoning for Nano Banana
```
Bad:  "A watchmaker"
Good: "**Role**: Editorial Photographer. **Thinking**: He realizes time is running out..."
```

### 5. Unclear Multi-Reference for Seedream
```
Bad:  [Upload 3 images, no explanation]
Good: "Character from img1, background from img2, palette from img3"
```

---

## Iterative Refinement

**Don't attempt perfection in one prompt.** Start with 60-70% of requirements:

1. Generate base image
2. Issue refinement prompts:
   - "Reduce glare on the surface"
   - "Adjust lighting to sunset warm"
   - "Enhance facial details"

---

## Aspect Ratios

| Ratio | Use Case |
|-------|----------|
| **9:16** | Instagram Reels, TikTok, vertical |
| **16:9** | Cinematic, landscape, YouTube |
| **4:5** | Instagram feed, portrait |
| **1:1** | Square, icons, products |
