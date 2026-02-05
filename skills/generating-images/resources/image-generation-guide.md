# Image Generation Guide

## Seedream-4 Best Practices

### Model Characteristics

**Seedream-4** (by ByteDance) is optimized for:
- Photorealistic images
- Text rendering in images (store fronts, signs, posters)
- Natural lighting and composition
- Professional photography aesthetic
- Instagram-ready visual quality

**Strengths:**
- Accurate text generation in scenes
- Consistent brand aesthetics
- High-quality product photography
- Natural environments and interiors

**Limitations:**
- Slower generation (~30-60 seconds)
- Works best with detailed prompts
- May struggle with complex abstract concepts

---

## Prompting Strategies

### Structure for Best Results

**Effective prompt formula:**
```
[Subject] + [Setting/Context] + [Style/Mood] + [Technical details]
```

**Example:**
```
"a modern coffee shop storefront called 'Daily Grind',
large windows, warm lighting, wooden accents,
professional architectural photography, natural daylight"
```

### B-roll Generation Patterns

**For concept illustration:**
```
Concept: "Team collaboration"
Prompt: "diverse team members collaborating around a modern conference table,
bright office space, engaged discussion, laptops and notebooks,
professional photography, natural window lighting"
```

**For product/service visualization:**
```
Concept: "SaaS product interface"
Prompt: "clean modern laptop displaying analytics dashboard,
minimalist workspace, coffee cup nearby, soft natural lighting,
professional product photography, shallow depth of field"
```

**For location/environment:**
```
Concept: "Startup office culture"
Prompt: "vibrant modern startup office, open floor plan,
standing desks, plants, collaborative spaces, natural light,
architectural photography, wide angle"
```

---

## Quality Tips

### Lighting

**Natural lighting (recommended for realism):**
- "natural daylight"
- "soft window lighting"
- "golden hour lighting"
- "bright indirect sunlight"

**Artificial lighting (for specific moods):**
- "warm ambient lighting"
- "soft studio lighting"
- "cinematic lighting"
- "accent lighting"

### Composition

**Professional photography terms improve quality:**
- "professional photography"
- "architectural photography"
- "product photography"
- "editorial style"
- "shallow depth of field"
- "wide angle"
- "close-up"

### Detail Level

**More detail = better results:**

❌ **Too vague:** "an office"

✅ **Better:** "modern office workspace with laptop, plants, and natural lighting"

✅ **Best:** "clean modern office workspace featuring MacBook Pro on wooden desk,
succulent plants, large window with city view, warm natural lighting,
professional interior photography, minimalist aesthetic"

---

## Text in Images

**Seedream-4 excels at text rendering:**

**Store fronts:**
```
"a store front called \"Seedream 4\", it sells books,
a poster in the window says \"Seedream 4 now on Replicate\""
```

**Signage:**
```
"modern office building entrance, glass doors,
metal sign reading \"TechCorp Headquarters\",
professional architectural photography"
```

**Products with labels:**
```
"product bottle on white background, label reads \"Premium Quality\",
clean product photography, soft shadows"
```

**Tips for text:**
- Use quotation marks around text to appear
- Be specific about text placement
- Keep text short (2-5 words works best)
- Specify style: "modern sans-serif text" or "elegant script"

---

## Aspect Ratios for Instagram Reels

### Recommended Ratios

**9:16 (Vertical - Standard Reels):**
- Best for: Full-screen mobile viewing
- Use for: Primary B-roll, establishing shots
- Dimensions: 1080x1920 ideal

**4:5 (Portrait - Feed-friendly):**
- Best for: Instagram feed compatibility
- Use for: Product shots, close-ups
- Dimensions: 1080x1350

**16:9 (Horizontal - Landscape):**
- Best for: Cinematic shots, wide scenes
- Use for: Environments, group shots
- Dimensions: 1920x1080

**1:1 (Square):**
- Best for: Consistent framing
- Use for: Products, icons, simple compositions
- Dimensions: 1080x1080

### Composition Tips by Aspect Ratio

**For 9:16 (vertical):**
- Center subject vertically
- Use foreground/background depth
- Vertical lines and elements work well

**For 16:9 (horizontal):**
- Wide establishing shots
- Panoramic environments
- Side-by-side comparisons

---

## Common Patterns

### Office/Workspace

```
"clean modern office workspace, MacBook Pro on wooden desk,
succulent plants, window with blurred city view background,
warm natural lighting, professional interior photography,
minimalist aesthetic, shallow depth of field"
```

**Tags:** office, workspace, modern, laptop, professional

### Team/Collaboration

```
"diverse team of four people collaborating around a modern conference table,
laptops and notebooks, engaged discussion, bright modern office,
large windows with natural light, professional business photography,
candid moment"
```

**Tags:** team, collaboration, meeting, office, professional

### Technology/Software

```
"smartphone displaying colorful app interface, held in hand,
blurred modern office background, soft lighting,
professional product photography, shallow depth of field,
focus on screen details"
```

**Tags:** technology, app, mobile, software, product

### Coffee Shop/Casual

```
"modern independent coffee shop interior, wooden counter,
espresso machine, barista working, warm Edison bulb lighting,
plants, exposed brick wall, cozy atmosphere,
lifestyle photography, natural authentic feel"
```

**Tags:** coffee, cafe, casual, lifestyle, small-business

### Abstract/Background

```
"soft gradient background transitioning from deep blue to light cyan,
smooth clean aesthetic, no objects, minimal design,
professional backdrop, even lighting"
```

**Tags:** abstract, background, gradient, minimal, clean

---

## Troubleshooting Failed Generations

### Common Issues

**Issue: Text not rendering correctly**
- Solution: Simplify text (shorter phrases), use quotation marks, specify placement
- Example: Instead of "store with sign", use "store front, sign reads \"Coffee Shop\""

**Issue: Too generic/low quality**
- Solution: Add more specific details, include photography style terms
- Example: Add "professional photography, natural lighting, shallow depth of field"

**Issue: Wrong composition**
- Solution: Specify camera angle and framing
- Example: Add "wide angle shot" or "close-up" or "bird's eye view"

**Issue: Unrealistic lighting**
- Solution: Be specific about light source and quality
- Example: "soft natural window light from left side" instead of just "lighting"

**Issue: API timeout/failure**
- The script automatically retries 5 times
- If all retries fail, consider simplifying the prompt
- Check Replicate API status

---

## Category Auto-Detection

The script automatically categorizes images based on prompt keywords:

**B-roll category:** office, workspace, team, collaboration, people, business, meeting
**Backgrounds category:** background, gradient, abstract, pattern, texture
**Products category:** product, mockup, device, phone, laptop, bottle, packaging

**To force a specific category:**
```bash
# Override auto-detection with --category flag
node servers/seedream/generate-image.js \
  --prompt "modern gradient background" \
  --category "backgrounds"
```

---

## Tag Extraction for Search

Tags are automatically extracted from prompts for catalog searchability:

**Common extracted tags:**
- Subjects: office, team, product, coffee, laptop
- Styles: modern, minimal, professional, casual, cozy
- Elements: plants, windows, lighting, desk, meeting
- Quality: clean, bright, warm, soft, natural

**To improve tag quality:**
- Use consistent terminology
- Include key descriptive words
- Avoid overly long compound phrases
- Use industry-standard terms

---

## Cost and Performance

**Generation cost:** ~$0.02 per image (via Replicate)
**Generation time:** 30-60 seconds average
**Retry strategy:** 5 attempts with exponential backoff

**Cost optimization:**
- Search catalog before generating (instant reuse)
- Review similar assets (50%+ tag match = strong candidate)
- Refine prompts to avoid regeneration
- Build library over time (compound savings)

**Example savings:**
- Video 1: Generate 5 images = $0.10
- Video 2: Reuse 3, generate 2 new = $0.04
- Video 10: Reuse 8, generate 2 new = $0.04
- **Total saved: ~$0.40+ over 10 videos**

---

## Quality Checklist

Before generating a new image, verify:

- [ ] Searched catalog for similar existing assets
- [ ] Prompt includes specific details (not vague)
- [ ] Photography style specified (professional, product, etc.)
- [ ] Lighting described (natural, soft, warm, etc.)
- [ ] Composition guidance included (wide angle, close-up, etc.)
- [ ] Aspect ratio appropriate for use case (9:16 for Reels)
- [ ] Text (if any) in quotation marks and clearly placed
- [ ] Category makes sense (broll/backgrounds/products)

---

## Examples: Before & After

**Before (vague):**
```
"an office"
```
Result: Generic, low quality

**After (detailed):**
```
"clean modern office workspace with MacBook Pro on wooden desk,
succulent plants, large window with soft natural lighting,
professional interior photography, minimalist aesthetic"
```
Result: High-quality, specific, Instagram-ready

---

**Before (unclear):**
```
"people working"
```
Result: Ambiguous, unpredictable

**After (specific):**
```
"diverse team of three people collaborating at a modern standing desk,
laptops open, engaged discussion, bright contemporary office,
natural window lighting, professional business photography, candid moment"
```
Result: Clear subject, professional quality

---

## Integration with Orchestration

**When to generate vs. use existing:**

1. **Generate new** if:
   - No similar asset in catalog (< 50% tag match)
   - Need specific aspect ratio not available
   - Existing assets don't match video aesthetic
   - Specific brand/text rendering required

2. **Reuse existing** if:
   - Similar asset exists (≥ 50% tag match)
   - Visual style matches video tone
   - Aspect ratio compatible
   - Quality sufficient for use case

**In orchestration workflow:**
1. Analyze script for visual concept needs
2. Search catalog for each concept
3. Generate only what's missing
4. Track usage for library insights
