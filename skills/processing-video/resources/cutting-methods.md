# FFmpeg Cutting Methods Comparison

## Overview

FFmpeg offers two approaches to cutting video clips: **accurate (re-encode)** and **fast (stream copy)**.

---

## Method 1: Accurate Cutting (RECOMMENDED)

### Command Pattern
```bash
ffmpeg -i input.mp4 -ss START -to END -c:v libx264 -preset ultrafast -crf 18 -c:a aac output.mp4
```

### Key Characteristics
- `-ss/-to` placed **AFTER** `-i` (input)
- **Re-encodes** video (not stream copy)
- Decodes from beginning to start point
- Frame-perfect timestamp accuracy

### Advantages
✅ **Frame-perfect accuracy** - Exact timestamps, no drift
✅ **No corruption** - Always produces valid clips
✅ **No keyframe issues** - Works with any video codec
✅ **Reliable for production** - Consistent, predictable results

### Disadvantages
❌ **Slower** - Re-encoding takes time (~10-15s per minute)
❌ **Quality loss** - Minimal with CRF 18, but not lossless
❌ **CPU intensive** - Uses more processing power

### When to Use
- Production workflows
- When clip accuracy matters
- When you have time for re-encoding

---

## Method 2: Fast Cutting (NOT RECOMMENDED)

### Command Pattern
```bash
ffmpeg -ss START -i input.mp4 -to END -c copy output.mp4
```

### Key Characteristics
- `-ss` placed **BEFORE** `-i` (input)
- **Stream copy** (no re-encoding)
- Seeks to nearest keyframe

### Advantages
✅ **Very fast** - No re-encoding (~2s per minute)
✅ **Lossless** - No quality degradation

### Disadvantages
❌ **Inaccurate timestamps** - Off by several frames
❌ **Keyframe dependency** - Only cuts at keyframes
❌ **Can produce corrupt clips** - Missing frames, black screens

### When to Use
- Quick previews or drafts
- When accuracy doesn't matter

**⚠️ NOT suitable for production**

---

## Technical Comparison

### How `-ss` Position Affects Behavior

**Case 1: `-ss` AFTER `-i` (Accurate)**
```bash
ffmpeg -i input.mp4 -ss 00:05 -to 00:12 -c:v libx264 output.mp4
```
1. FFmpeg opens input file
2. Decodes from 00:00 → 00:05
3. Starts encoding at exactly 00:05
4. Stops at exactly 00:12
5. Result: Frame-perfect accuracy

**Case 2: `-ss` BEFORE `-i` (Fast)**
```bash
ffmpeg -ss 00:05 -i input.mp4 -to 00:12 -c copy output.mp4
```
1. FFmpeg seeks to nearest keyframe before 00:05
2. May include extra frames or miss frames
3. Result: Fast but inaccurate

---

## Keyframe Explanation

**What are keyframes?**
- Complete video frames (I-frames)
- Occur every 1-10 seconds in typical video
- Other frames (P/B-frames) depend on keyframes

**Why keyframes matter:**
- Stream copy can only cut at keyframes
- If start time = 00:05.000 but nearest keyframe = 00:03.500:
  - Fast method: Starts at 00:03.500 (1.5s early!)
  - Accurate method: Starts at exactly 00:05.000

---

## Command Reference

### Accurate Cutting (Production)
```typescript
const command = [
  'ffmpeg',
  '-hide_banner',
  '-y',
  `-i "${inputPath}"`,
  `-ss ${startTime}`,
  `-to ${endTime}`,
  '-c:v libx264',
  '-preset ultrafast',
  '-crf 18',
  '-c:a aac',
  '-movflags +faststart',
  `"${outputPath}"`,
].join(' ');
```

### Quality Settings
- `ultrafast`: Fastest encoding, larger files
- `fast`: Slightly slower, better compression
- `medium`: Balanced

### CRF (Quality) Settings
- `18`: High quality (production)
- `23`: Good quality (web delivery)
- `28`: Acceptable quality (mobile)

---

## Summary

| Aspect | Accurate Method | Fast Method |
|--------|----------------|-------------|
| **Speed** | Slow (10-15s/min) | Very fast (2s/min) |
| **Accuracy** | Frame-perfect ✅ | Keyframe-aligned ❌ |
| **Reliability** | 100% success ✅ | 50-70% success ❌ |
| **Production Use** | **YES** ✅ | **NO** ❌ |

**Recommendation:** Always use accurate method for production. Speed optimization should come from parallelization and caching, not from sacrificing accuracy.
