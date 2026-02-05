# VEO 3.1 Prompting Guide

Official guide based on Google's Veo 3.1 documentation for creating professional-quality videos.

## The 5-Part Prompt Formula

Use this structure for consistent, high-quality results:

```
[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]
```

### Example:
**Prompt**: Medium shot, a tired corporate worker, rubbing his temples in exhaustion, in front of a bulky 1980s computer in a cluttered office late at night. The scene is lit by the harsh fluorescent overhead lights and the green glow of the monochrome monitor. Retro aesthetic, shot as if on 1980s color film, slightly grainy.

**Breakdown**:
- **Cinematography**: Medium shot
- **Subject**: A tired corporate worker
- **Action**: Rubbing his temples in exhaustion
- **Context**: In front of a bulky 1980s computer in a cluttered office late at night, harsh fluorescent overhead lights and green glow of monitor
- **Style & Ambiance**: Retro aesthetic, shot as if on 1980s color film, slightly grainy

## 1. Cinematography (Camera Work)

### Camera Movement
- **Dolly shot**: Camera moves toward/away from subject on tracks
- **Tracking shot**: Camera follows subject's movement
- **Crane shot**: Camera moves vertically, often revealing scale
- **Aerial view**: Bird's eye perspective from above
- **Slow pan**: Gentle horizontal camera rotation
- **POV shot**: First-person perspective
- **Orbit/Arc shot**: Camera circles around subject

**Example - Crane Shot**:
```
Crane shot starting low on a lone hiker and ascending high above, revealing they are standing on the edge of a colossal, mist-filled canyon at sunrise, epic fantasy style, awe-inspiring, soft morning light.
```

### Shot Composition
- **Wide shot**: Shows full subject and environment
- **Medium shot**: Shows subject from waist up
- **Close-up**: Focuses on face or specific detail
- **Extreme close-up**: Macro detail (eyes, hands, objects)
- **Low angle**: Camera looks up at subject (power, dominance)
- **High angle**: Camera looks down at subject (vulnerability)
- **Two-shot**: Frames two people in conversation
- **Over-the-shoulder**: View from behind one character toward another

### Lens & Focus
- **Shallow depth of field**: Sharp subject, blurred background (cinematic)
- **Deep focus**: Everything in frame is sharp
- **Wide-angle lens**: Exaggerates space and perspective
- **Macro lens**: Extreme close-up of small objects
- **Soft focus**: Dreamy, romantic quality
- **Lens flare**: Light artifacts from bright sources

**Example - Shallow Depth of Field**:
```
Close-up with very shallow depth of field, a young woman's face, looking out a bus window at the passing city lights with her reflection faintly visible on the glass, inside a bus at night during a rainstorm, melancholic mood with cool blue tones, moody, cinematic.
```

## 2. Subject

Clearly identify the main character or focal point:
- **Physical description**: Age, appearance, clothing, defining features
- **Character type**: Explorer, detective, athlete, worker, etc.
- **Emotional state**: Tired, excited, contemplative, determined

**Examples**:
- "A tired corporate worker"
- "A young female explorer with a leather satchel and messy brown hair in a ponytail"
- "A lone hiker"

## 3. Action

Describe what the subject is doing:
- **Physical actions**: Running, jumping, typing, looking, touching
- **Facial expressions**: Smiling, frowning, looking surprised
- **Interactions**: Talking to someone, manipulating objects
- **Movement quality**: Slowly, quickly, gracefully, frantically

**Examples**:
- "Rubbing his temples in exhaustion"
- "Pushes aside a large jungle vine to reveal a hidden path"
- "Looking out a bus window at passing city lights"

## 4. Context (Environment)

Detail the setting and background:
- **Location**: Office, jungle, city street, spaceship, desert
- **Time of day**: Dawn, midday, dusk, night
- **Weather**: Rain, fog, clear sky, storm
- **Background elements**: Furniture, architecture, natural features
- **Spatial relationships**: In front of, behind, surrounded by

**Examples**:
- "In front of a bulky 1980s computer in a cluttered office late at night"
- "On the edge of a colossal, mist-filled canyon at sunrise"
- "Inside a bus at night during a rainstorm"

## 5. Style & Ambiance

Specify the aesthetic, mood, and lighting:

### Lighting
- **Golden hour**: Warm, soft light during sunrise/sunset
- **Harsh fluorescent**: Cold, institutional feel
- **Dramatic spotlight**: High contrast, theatrical
- **Natural light**: Soft, realistic
- **Neon glow**: Vibrant, modern, cyberpunk
- **Candlelight**: Warm, intimate
- **Backlighting**: Subject silhouetted against light source

### Color Palette
- **Warm tones**: Orange, red, yellow (inviting, energetic)
- **Cool tones**: Blue, teal, purple (calm, melancholic)
- **Desaturated**: Muted, realistic
- **Vibrant**: Saturated, eye-catching
- **Monochrome**: Black and white or single color

### Film Style
- **Cinematic**: Professional, movie-like quality
- **1980s color film**: Grainy, retro aesthetic
- **Documentary style**: Handheld, realistic
- **Noir**: High contrast, shadowy
- **Fantasy**: Epic, dreamlike
- **Horror**: Dark, unsettling

### Mood/Emotion
- Melancholic, awe-inspiring, energetic, tense, peaceful, mysterious, romantic

**Examples**:
- "Retro aesthetic, shot as if on 1980s color film, slightly grainy"
- "Epic fantasy style, awe-inspiring, soft morning light"
- "Melancholic mood with cool blue tones, moody, cinematic"

## Audio Direction

Veo 3.1 generates synchronized audio based on your prompt.

### Dialogue
Use quotation marks for specific speech:
```
A woman says, "We have to leave now."
The detective looks up and says in a weary voice, "Of all the offices in this town, you had to walk into mine."
```

### Sound Effects (SFX)
Describe sounds clearly:
```
SFX: Thunder cracks in the distance
SFX: The rustle of dense leaves, distant exotic bird calls
SFX: Tires screech, engine roars
```

### Ambient Noise
Define the background soundscape:
```
Ambient noise: The quiet hum of a starship bridge
Ambient noise: Bustling city traffic and distant sirens
Ambient noise: Wind howling through trees
```

### Music Cues
```
A swelling, gentle orchestral score begins to play
Upbeat electronic music pulses in the background
```

## Negative Prompts

Describe what you DON'T want by stating what TO show instead:

**Bad**: "No buildings or roads"
**Good**: "A desolate landscape with natural rock formations only"

**Bad**: "No people"
**Good**: "An empty street with abandoned storefronts"

## Advanced Techniques

### Timestamp Prompting
Direct multi-shot sequences with precise timing:

```
[00:00-00:02] Medium shot from behind a young female explorer with a leather satchel and messy brown hair in a ponytail, as she pushes aside a large jungle vine to reveal a hidden path.

[00:02-00:04] Reverse shot of the explorer's freckled face, her expression filled with awe as she gazes upon ancient, moss-covered ruins in the background. SFX: The rustle of dense leaves, distant exotic bird calls.

[00:04-00:06] Tracking shot following the explorer as she steps into the clearing and runs her hand over the intricate carvings on a crumbling stone wall. Emotion: Wonder and reverence.

[00:06-00:08] Wide, high-angle crane shot, revealing the lone explorer standing small in the center of the vast, forgotten temple complex, half-swallowed by the jungle. SFX: A swelling, gentle orchestral score begins to play.
```

### Extension Prompting
When extending videos, describe continuation of existing motion/scene:

**For extensions, analyze the last frame first**, then write prompts that:
- Continue the camera movement naturally
- Maintain lighting and color consistency
- Advance the action logically
- Preserve character positions and momentum

## Complete Example Prompts

### Example 1: Dialogue Scene
```
Medium shot, a grizzled detective behind his cluttered desk, looking up from case files with tired eyes as a mysterious woman enters his dimly lit office. He says in a weary voice, "Of all the offices in this town, you had to walk into mine." Film noir style, dramatic shadows from venetian blinds, cigarette smoke in the air, 1940s aesthetic. SFX: The creak of the door, distant city traffic.
```

### Example 2: Action Scene
```
POV tracking shot, racing through a neon-lit cyberpunk alley on a hoverbike, weaving between holographic advertisements and steam vents, the city skyline rushing past at breakneck speed. Vibrant pink and blue neon reflections on wet pavement, motion blur, adrenaline-fueled energy, rain-slicked surfaces. SFX: High-pitched engine whine, whoosh of passing buildings, electronic music pulse.
```

### Example 3: Nature Documentary
```
Slow dolly shot with shallow depth of field, a single water droplet clinging to a vibrant green leaf, morning dew backlit by golden sunrise, tiny rainbow prism effects visible within the droplet. Extreme macro photography style, serene and peaceful, warm soft light. SFX: Gentle forest ambiance, distant bird song.
```

### Example 4: Emotional Moment
```
Close-up with very shallow depth of field, a young mother's face illuminated by warm candlelight, tears of joy streaming down her cheeks as she looks down at her newborn baby in her arms. Soft focus on background, intimate hospital room setting at night, emotional and tender moment. Warm color palette with golden highlights, cinematic. Ambient noise: Soft lullaby playing quietly, gentle breathing.
```

### Example 5: Epic Reveal
```
Crane shot starting at ground level on a lone astronaut in a white spacesuit, slowly rising and pulling back to reveal they are standing on the edge of a massive crater on an alien planet, with multiple moons visible in the purple sky above. Epic sci-fi style, awe-inspiring scale, dramatic lighting from dual suns creating long shadows. SFX: Spacesuit breathing, wind whistling across barren landscape, distant rumble.
```

## Common Mistakes to Avoid

1. **Too vague**: "A person in a room" → Be specific about everything
2. **Missing cinematography**: Without shot type, results are unpredictable
3. **Ignoring audio**: Describe sounds for complete scenes
4. **Inconsistent style**: Mix retro and modern carefully or pick one
5. **Forgetting context**: Environment heavily influences mood
6. **No lighting description**: Lighting creates emotion and atmosphere
7. **Extension without analysis**: Always analyze last frame before extending

## Quick Reference Checklist

Before submitting your prompt, verify you have:
- [ ] Shot type/composition defined (medium shot, close-up, etc.)
- [ ] Camera movement specified (dolly, tracking, static, etc.)
- [ ] Subject clearly described
- [ ] Action/activity defined
- [ ] Environment/context detailed
- [ ] Lighting described
- [ ] Color palette/mood specified
- [ ] Audio elements included (dialogue, SFX, ambient)
- [ ] Style aesthetic chosen

## For Extensions

Before extending a video:
1. Use `analyze-last-frame.ts` to see what's in the last frame
2. Note: camera position, subject pose, lighting, motion direction
3. Write prompt that continues naturally from that exact state
4. Maintain consistent lighting and color palette
5. Advance action logically from current position
