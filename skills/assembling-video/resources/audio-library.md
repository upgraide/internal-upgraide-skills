# Audio Library

Sound effects and music for video production. **6,223 files** across 14 categories.

## Quick Reference by Use Case

| Use Case | Category | Search Keywords | Duration |
|----------|----------|-----------------|----------|
| **UI clicks/buttons** | Multimedia | `Click`, `Button`, `Beep` | 0.2-1s |
| **Pop-up notifications** | Multimedia | `Pop Up`, `Ding`, `Alert` | 0.3-1s |
| **Scene transitions** | Production Elements, Multimedia | `Whoosh`, `Wipe`, `Sweep` | 1-3s |
| **Title card hits** | Production Elements | `Hit Impact`, `Stab`, `Blast` | 0.5-2s |
| **Tech/digital sounds** | Multimedia, Science Fiction | `Digital`, `Hi-Tech`, `Electronic` | 0.5-3s |
| **Keyboard/typing** | sfx, Technology | `Keyboard` | 1-3s |
| **Reactions (yes/no/wow)** | Human Elements | `Yes`, `No`, `Gasp`, `Cheer` | 0.5-2s |
| **Funny/playful** | Cartoon | `Balloon`, `Squeak`, `Boing` | 0.5-2s |
| **Dramatic impacts** | Impacts | `Impact Metal`, `Crash` | 0.5-2s |
| **Footsteps** | Foley Footsteps | `Footstep` | 0.5-15s |
| **Everyday objects** | Foley | `Door`, `Paper`, `Bell` | 0.5-5s |
| **Sci-fi/futuristic** | Science Fiction | `Laser`, `Scanner`, `Energy` | 0.5-5s |
| **Explosions/fire** | Fire and Explosions | `Explosion`, `Fire` | 3-60s |
| **Background ambience** | Ambience_1 | `Ambience` | 90s loops |
| **Background music** | music | `background_music` | 25s |

## Categories

### Multimedia (1,355 files) ⭐ Best for social media
UI sounds, digital effects, app interactions. **Perfect for Instagram/TikTok.**

**Subcategories:**
- **Clicks**: `Click Mechanical`, `Click Multiple` (80+ files)
- **Buttons**: `Buttons Electronic` (42 files)
- **Beeps**: `Beep Electronic`, `Beep High Pitch`, `Beep Low Pitch` (130+ files)
- **Pop-ups**: `Pop Up`, `Pop Up Short`, `Pop Up Electronic` (100+ files)
- **Whooshes**: `Whoosh`, `Whoosh Short`, `Whoosh Electronic` (110+ files)
- **Wipes**: `Wipe`, `Wipe Electronic` (85+ files)
- **Dings**: `Ding` (35 files)
- **Hi-Tech**: `Hi-Tech` (67 files)
- **Digital**: `Digital` (58 files)
- **Blasts**: `Blast` (46 files)
- **Animations**: `Animation`, `Animation Cartoon` (90+ files)

**Typical durations:** 0.2-3 seconds

```typescript
// UI button click
<Sequence from={clickFrame}>
  <Audio src={staticFile('audio/Multimedia/Multimedia Internet CD-Rom Flash Click Mechanical 05.wav')} volume={0.5} />
</Sequence>

// Notification pop-up
<Sequence from={notificationFrame}>
  <Audio src={staticFile('audio/Multimedia/Multimedia Internet CD-Rom Flash Pop Up 12.wav')} volume={0.4} />
</Sequence>
```

### Production Elements (1,460 files)
Professional transition sounds, whooshes, hits, stingers.

**Subcategories:**
- **Whooshes**: `Whoosh Warble`, `Whoosh Alarm`, `Whoosh Fire` (80+ files)
- **Hits**: `Hit Impact Short`, `Hit Impact Ping`, `Stab Dark` (100+ files)
- **Electrical**: `Electrical Surge`, `Electrical Zap` (45+ files)
- **Metallic**: `Metallic Hit`, `Metallic Blast`, `Metallic Swell` (70+ files)
- **Delays**: `Delay Short`, `Delay Medium` (77 files)
- **Bells**: `Bell Hit`, `Bell Swell` (50+ files)
- **Sweeps**: `Swell`, `Sweep`, `Ascend`, `Descend` (40+ files)

**Typical durations:** 1-10 seconds

```typescript
// Transition whoosh
<Sequence from={transitionFrame}>
  <Audio src={staticFile('audio/Production Elements/Production Element Title Transition Whoosh Alarm 03.wav')} volume={0.6} />
</Sequence>
```

### Human Elements (531 files)
Vocal reactions, body sounds, character voices.

**Subcategories:**
- **Reactions**: `Yes`, `No`, `Gasp`, `Wow` (30+ files)
- **Cheers**: `Yells And Cheers Yeah`, `Yells And Cheers Go`, `Boo` (20+ files)
- **Laughs**: `Laugh`, `Giggle`, `Evil Laugh` (20+ files)
- **Body sounds**: `Burp`, `Cough`, `Sneeze`, `Snore` (30+ files)
- **Character voices**: `Pirate Laugh`, `Cowboy` (20+ files)
- **Kisses**: `Kiss` (10+ files)

**Typical durations:** 0.5-5 seconds

```typescript
// Reaction sound
<Sequence from={reactionFrame}>
  <Audio src={staticFile('audio/Human Elements/Human Male Yells And Cheers Yeah 03.wav')} volume={0.5} />
</Sequence>
```

### Cartoon (284 files)
Playful, comedic, attention-grabbing sounds.

**Subcategories:**
- **Balloon sounds**: `Balloon Blow Up`, `Balloon Squeak`, `Balloon Fart` (40+ files)
- **Funny vocals**: `Evil Laugh`, `Scream`, `Giggle` (30+ files)
- **Weird noises**: `Weird Noise`, `Boing` (20+ files)
- **Instruments**: `Trombone`, `Horn`, `Drum` (15+ files)
- **Squeaks**: `Squeak`, `Toy Squeak` (15+ files)

**Typical durations:** 0.5-5 seconds

```typescript
// Comedic accent
<Sequence from={funnyMomentFrame}>
  <Audio src={staticFile('audio/Cartoon/Cartoon Balloon Fart 02.wav')} volume={0.4} />
</Sequence>
```

### Science Fiction (281 files)
Futuristic, electronic, sci-fi sounds.

**Subcategories:**
- **Electronic**: `Electronic Distortion`, `Electronic Beep` (50+ files)
- **Lasers**: `Laser`, `Zap` (15+ files)
- **Computers**: `Computer Readout`, `Computer Terminal` (20+ files)
- **Scanners**: `Scanner`, `Readout` (15+ files)
- **Alien**: `Alien Hiss`, `Alien Growl` (15+ files)

**Typical durations:** 0.5-7 seconds

```typescript
// Futuristic UI sound
<Sequence from={techFrame}>
  <Audio src={staticFile('audio/Science Fiction/Science Fiction Sci-Fi Electronic Scanner 02.wav')} volume={0.4} />
</Sequence>
```

### Impacts (634 files)
Physical collisions - metal, wood, glass, objects.

**Types:** Metal impacts, wood breaking, glass shattering, object drops

**Typical durations:** 0.2-3 seconds

### Foley (530 files)
Realistic everyday object sounds.

**Types:** Doors, paper, bells, bags, household items

**Typical durations:** 0.5-10 seconds

### Foley Footsteps (299 files)
Various footstep types on different surfaces.

**Types:** Barefoot, boots, heels, sneakers on wood/concrete/leaves/gravel

**Typical durations:** 0.5-15 seconds

### Liquid-Water (296 files)
Water and liquid sounds.

**Types:** Splashes, pours, drips, underwater

**Typical durations:** 0.5-90 seconds

### Technology (278 files)
Electronic device sounds.

**Types:** Phones, keyboards, remotes, CD players, TV static

**Typical durations:** 0.2-5 seconds

### Fire and Explosions (135 files)
Explosions, fire crackle, blasts.

**Typical durations:** 3-60 seconds

### Ambience_1 (104 files)
Environmental background loops.

**Types:** Indoor (factory, office), outdoor (traffic), mechanical (AC)

**Typical durations:** 90 second loops

### sfx (35 files)
Curated whooshes and keyboard sounds.

**Highlights:**
- `mixkit-arrow-whoosh-1491.wav` (1.1s) - Clean whoosh
- `mixkit-fast-rocket-whoosh-1714.wav` (4.7s) - Dramatic whoosh
- `Keyboard-01` to `Keyboard-14` - Typing sequences

### music (1 file)
- `background_music.mp3` (25.5s)

## Finding Sounds

```bash
# Find by keyword
find public/audio -iname "*whoosh*"
find public/audio -iname "*click*"
find public/audio -iname "*pop*up*"

# List category contents
ls "public/audio/Multimedia/" | grep -i "click" | head -20
ls "public/audio/Human Elements/" | grep -i "yes"
```

## Common Patterns

### UI interaction sounds
```typescript
// Button click + pop-up notification
<Sequence from={clickFrame}>
  <Audio src={staticFile('audio/Multimedia/Multimedia Internet CD-Rom Flash Click Mechanical 05.wav')} volume={0.4} />
</Sequence>
<Sequence from={clickFrame + 10}>
  <Audio src={staticFile('audio/Multimedia/Multimedia Internet CD-Rom Flash Pop Up Short 08.wav')} volume={0.5} />
</Sequence>
```

### Scene transition with whoosh
```typescript
<Sequence from={transitionFrame - 5}>
  <Audio src={staticFile('audio/sfx/mixkit-arrow-whoosh-1491.wav')} volume={0.5} />
</Sequence>
```

### Text reveal with hit
```typescript
<Sequence from={textFrame - 3}>
  <Audio src={staticFile('audio/Production Elements/Production Element Title Transition Hit Impact Short 01.wav')} volume={0.6} />
</Sequence>
```

### Background with music ducking
```typescript
<Audio
  src={staticFile('audio/music/background_music.mp3')}
  volume={(frame) => hasVoice(frame) ? 0.08 : 0.2}
  loop
/>
```

## File Paths

```
staticFile('audio/Multimedia/[filename].wav')
staticFile('audio/Production Elements/[filename].wav')
staticFile('audio/Human Elements/[filename].wav')
staticFile('audio/Cartoon/[filename].wav')
staticFile('audio/Science Fiction/[filename].wav')
staticFile('audio/Impacts/[filename].wav')
staticFile('audio/Foley/[filename].wav')
staticFile('audio/Foley Footsteps/[filename].wav')
staticFile('audio/Liquid-Water/[filename].wav')
staticFile('audio/Technology/[filename].wav')
staticFile('audio/Fire and Explosions/[filename].wav')
staticFile('audio/Ambience_1/[filename].wav')
staticFile('audio/sfx/[filename].wav')
staticFile('audio/music/[filename].mp3')
```

## Tips

1. **Volume levels**: SFX 0.3-0.5, ambience 0.05-0.1, music 0.1-0.2
2. **Timing**: Play impacts 2-5 frames before visual hit
3. **Layer sparingly**: 2-3 simultaneous sounds max
4. **Duck for voice**: Lower music/ambience during narration
5. **Match energy**: Fast cuts = short whooshes; slow = swells
