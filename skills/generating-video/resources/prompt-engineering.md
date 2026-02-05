# SORA Prompt Engineering Guide

Comprehensive guide to writing effective prompts for SORA 2 video generation.

## Core Principles

SORA works best with **detailed, specific prompts** that describe:
1. Shot type and camera work
2. Subject and main focus
3. Action and movement
4. Setting and environment
5. Lighting and atmosphere

**General rule:** The more specific your description, the more consistent and controllable the output.

## Essential Elements

### 1. Shot Type

Specify the camera framing to control composition:

**Wide shot:**
- Shows full scene and environment
- Establishes context and setting
- Example: "Wide shot of a city street during rush hour"

**Medium shot:**
- Balances subject and background
- Standard for conversations, interactions
- Example: "Medium shot of a person working at a desk"

**Close-up:**
- Focuses on details, faces, objects
- Creates intimacy and emphasis
- Example: "Close-up of hands pouring coffee into a white mug"

**Tracking shot:**
- Camera follows subject movement
- Dynamic, cinematic feel
- Example: "Tracking shot following a cyclist through park path"

### 2. Camera Movement

Control the cinematography:

**Static:**
- No camera movement, stable composition
- Example: "Static shot of sunset over ocean"

**Pan (left/right):**
- Horizontal camera rotation
- Example: "Slow pan right across mountain range"

**Tilt (up/down):**
- Vertical camera rotation
- Example: "Tilt up from street level to skyscraper top"

**Zoom (in/out):**
- Change focal length
- Example: "Slow zoom in on coffee cup on table"

**Dolly (forward/backward):**
- Physical camera movement toward/away from subject
- Example: "Dolly forward toward office building entrance"

**Combination:**
- Example: "Wide tracking shot, camera slowly pans upward"

### 3. Subject Description

Be specific about what's in the frame:

**Poor:** "A person"
**Better:** "A young professional in business casual attire"
**Best:** "A woman in her 30s wearing a blue blazer, working on a laptop"

**Poor:** "A product"
**Better:** "A smartphone"
**Best:** "A sleek black smartphone with glowing screen displaying app icons"

### 4. Action and Movement

Describe what's happening:

**Static scenes:**
- "Steam rising from a coffee cup on a wooden table"
- "Sunlight streaming through window blinds onto floor"

**Dynamic scenes:**
- "Hands typing rapidly on a mechanical keyboard"
- "Pages of a book being flipped quickly"
- "Traffic flowing through busy intersection"

**Natural motion:**
- "Leaves rustling in gentle breeze"
- "Clouds moving slowly across blue sky"
- "Water rippling in a pond"

### 5. Setting and Environment

Establish the location and context:

**Indoor settings:**
- "Modern minimalist office with floor-to-ceiling windows"
- "Cozy home kitchen with wooden countertops"
- "Bright conference room with glass walls"

**Outdoor settings:**
- "Urban street corner with tall buildings"
- "Desert highway with distant mountains"
- "Forest clearing with dappled sunlight"

**Time of day:**
- "Early morning mist"
- "Harsh midday sun"
- "Golden hour lighting"
- "Blue hour after sunset"

### 6. Lighting

Critical for mood and atmosphere:

**Natural light:**
- "Morning sunlight through windows"
- "Soft overcast daylight"
- "Golden hour warm glow"
- "Harsh noon sun creating strong shadows"

**Artificial light:**
- "Soft warm indoor lighting"
- "Fluorescent office overhead lights"
- "Dramatic backlight silhouette"
- "Colorful neon signs reflecting on wet pavement"

**Lighting effects:**
- "Lens flare from sun"
- "Soft diffused light"
- "High contrast dramatic lighting"
- "Volumetric light rays through dust"

## Prompt Formula Templates

### Template 1: Standard B-roll

```
[Shot type] of [subject] [action] in/at [setting], [lighting], [camera movement]
```

**Examples:**
- "Wide shot of a modern office building exterior at sunset, warm golden lighting, slow pan right"
- "Close-up of hands typing on laptop keyboard in bright home office, natural window light, static shot"
- "Medium shot of coffee being poured into white cup on wooden table, morning sunlight, shallow depth of field"

### Template 2: Cinematic Sequence

```
[Shot type] of [subject] [action], [environment details], [lighting atmosphere], [camera movement and framing]
```

**Examples:**
- "Wide tracking shot of a teal coupe driving through a desert highway, heat ripples visible on asphalt, hard sun overhead, camera following from side at constant speed"
- "Close-up of raindrops hitting window glass, city lights bokeh in background, blue hour lighting, static shot with shallow focus"

### Template 3: Abstract/Conceptual

```
[Visual concept], [color palette], [movement quality], [atmosphere]
```

**Examples:**
- "Flowing colorful ink dissolving in water, teal and orange tones, slow graceful movement, ethereal atmosphere"
- "Geometric patterns shifting and rotating, metallic silver and blue, rhythmic pulsing motion, futuristic feel"

## B-roll Specific Techniques

### Product B-roll

**Focus on:**
- Clean composition
- Good lighting (usually soft, even)
- Subtle camera movements
- Emphasis on product details

**Example prompts:**
- "Slow rotating 360-degree view of smartphone on white surface, soft studio lighting, minimalist background"
- "Close-up of laptop keyboard being typed on, modern office desk, natural window light from left"
- "Medium shot of product packaging being unboxed, hands visible, bright clean lighting, white background"

### Nature/Environment B-roll

**Focus on:**
- Natural movement (wind, water, clouds)
- Atmospheric conditions
- Time of day lighting
- Organic camera movements

**Example prompts:**
- "Wide shot of ocean waves crashing on rocky shore, late afternoon golden light, camera slowly panning right"
- "Close-up of grass swaying in gentle breeze, morning dew visible, soft natural light, shallow depth of field"
- "Aerial view of forest canopy, mist rising in early morning, slow forward dolly movement"

### Urban/Lifestyle B-roll

**Focus on:**
- Human activity and movement
- Urban environment details
- Realistic lighting
- Documentary-style framing

**Example prompts:**
- "Wide shot of city intersection with pedestrians crossing, morning commute, natural daylight, static elevated view"
- "Close-up of hands holding disposable coffee cup walking through busy street, urban background bokeh, tracking shot"
- "Medium shot of person working on laptop in modern coffee shop, window light from side, soft focus background"

### Tech/Abstract B-roll

**Focus on:**
- Clean modern aesthetic
- Motion graphics feel
- Controlled lighting
- Precise camera movements

**Example prompts:**
- "Close-up of code scrolling on computer screen, blue terminal window, soft keyboard lighting, static shot"
- "Macro shot of circuit board with tiny LEDs blinking, shallow depth of field, blue and green lighting"
- "Abstract data visualization floating in 3D space, holographic effect, blue and white color scheme, slow rotation"

## Common Pitfalls to Avoid

### 1. Vague descriptions

**Bad:** "Nice video of office"
**Good:** "Wide shot of modern open-plan office with natural light, people working at desks, morning atmosphere"

### 2. Too many elements

**Bad:** "Wide shot of office with people walking and talking while cars drive by outside and a plane flies overhead and coffee is being poured"
**Good:** "Medium shot of colleagues discussing project at standing desk in bright office, soft natural window light"

Keep focus on 1-2 main elements.

### 3. Contradictory instructions

**Bad:** "Static shot with dramatic camera movement"
**Bad:** "Close-up wide shot"

Ensure descriptions are internally consistent.

### 4. Unrealistic physics

**Bad:** "Water flowing upward"
**Bad:** "Car floating in the air"

SORA understands physics - work with natural movement patterns.

### 5. Missing critical details

**Missing lighting:** Lighting determines mood - always specify
**Missing movement:** Static or dynamic? Specify what moves
**Missing framing:** Shot type controls composition

## Advanced Techniques

### Atmospheric Description

Add depth with atmospheric details:
- "Morning mist visible in background"
- "Heat haze rippling above asphalt"
- "Dust particles visible in light beams"
- "Slight camera shake for handheld feel"

### Depth of Field

Control focus:
- "Shallow depth of field with blurred background"
- "Deep focus with sharp foreground and background"
- "Rack focus shifting from foreground to background"

### Color Grading Hints

Guide the color palette:
- "Warm tones with orange and teal"
- "Desaturated moody color palette"
- "Vibrant saturated colors"
- "Cool blue-tinted lighting"

### Motion Quality

Describe the feel of movement:
- "Smooth steady camera movement"
- "Slight handheld camera shake"
- "Graceful slow motion"
- "Quick dynamic motion"

## Iteration Strategy

### Start Simple, Add Details

**First iteration:**
"Person working on laptop in office"

**Second iteration:**
"Medium shot of person working on laptop in modern office, natural window light"

**Third iteration:**
"Medium shot of person in business casual attire typing on laptop at glass desk, modern minimalist office with floor-to-ceiling windows, soft morning natural light from left, static shot"

### Test One Variable at a Time

When refining:
1. Get basic composition right first
2. Adjust lighting second
3. Fine-tune camera movement third
4. Refine details last

### Use Remix for Targeted Changes

Generate base video with sora-2, then remix for specific adjustments:
- "Change lighting to warm golden hour tones"
- "Slow down the camera movement"
- "Shift color palette to cooler blues and grays"

## Length Considerations

**5 seconds:**
- Simple scenes
- Single actions
- Minimal camera movement
- Good for quick cuts

**10 seconds:**
- More complex scenes
- Multiple elements
- Longer camera movements
- Establishing shots

**Choose based on:**
- How much visual information needs to be conveyed
- Pacing of final video
- Whether scene is establishing or accent

## Quality Checklist

Before submitting a prompt, verify:

- [ ] Shot type specified (wide, medium, close-up, tracking)
- [ ] Subject clearly described
- [ ] Action/movement defined
- [ ] Setting established
- [ ] Lighting described
- [ ] Camera movement specified (or "static")
- [ ] Duration appropriate (5-10 seconds)
- [ ] No contradictory elements
- [ ] Physically plausible
- [ ] Focused on 1-2 main elements

## Example Refinement Process

**Goal:** Office workspace B-roll

**Version 1 (too vague):**
"Office scene"

**Version 2 (better):**
"Modern office with person working"

**Version 3 (good):**
"Medium shot of person working on laptop in modern office, natural lighting"

**Version 4 (excellent):**
"Medium shot of professional in business casual attire typing on laptop at glass desk, modern minimalist office with floor-to-ceiling windows in background, soft morning natural light streaming from left, static shot with shallow depth of field"

## Resources

**SORA Official Documentation:**
- OpenAI SORA 2 prompting guide
- OpenAI video generation examples

**Testing:**
- Start with sora-2 for fast iteration
- Upgrade to sora-2-pro when prompt is refined
- Use remix to make small targeted adjustments

**See also:**
- [model-comparison.md](model-comparison.md) - When to use sora-2 vs sora-2-pro
- [examples.md](examples.md) - Curated example prompts by category
