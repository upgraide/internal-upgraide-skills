# FFmpeg Cutting Methods Comparison

## Overview

FFmpeg offers two approaches to cutting video clips: **accurate (re-encode)** and **fast (stream copy)**. This document explains the trade-offs and why we use the accurate method for content-generation001.

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
- **Production workflows** (content-generation001 pipeline)
- When clip accuracy matters
- When file size after cutting is acceptable
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
- No decoding/encoding overhead

### Advantages
✅ **Very fast** - No re-encoding (~2s per minute)
✅ **Lossless** - No quality degradation
✅ **Minimal CPU** - Just copies data streams

### Disadvantages
❌ **Inaccurate timestamps** - Off by several frames
❌ **Keyframe dependency** - Only cuts at keyframes
❌ **Can produce corrupt clips** - Missing frames, black screens
❌ **Timeline drift** - Actual duration may differ from requested

### When to Use
- Quick previews or drafts
- When accuracy doesn't matter
- When source video has frequent keyframes (every 1-2 seconds)

**⚠️ NOT suitable for production in content-generation001**

---

## Technical Comparison

### How `-ss` Position Affects Behavior

**Case 1: `-ss` AFTER `-i` (Accurate)**
```bash
ffmpeg -i input.mp4 -ss 00:05 -to 00:12 -c:v libx264 output.mp4
```
1. FFmpeg opens input file
2. Decodes from 00:00 → 00:05 (reads every frame)
3. Starts encoding at exactly 00:05
4. Stops at exactly 00:12
5. Result: Frame-perfect accuracy

**Case 2: `-ss` BEFORE `-i` (Fast)**
```bash
ffmpeg -ss 00:05 -i input.mp4 -to 00:12 -c copy output.mp4
```
1. FFmpeg seeks to nearest keyframe before 00:05 (e.g., 00:03)
2. Copies data stream starting from keyframe
3. May include extra frames before 00:05
4. May miss frames if cut doesn't align with keyframe
5. Result: Fast but inaccurate

### Keyframe Explanation

**What are keyframes?**
- Complete video frames (I-frames)
- Occur every 1-10 seconds in typical video
- Other frames (P/B-frames) depend on keyframes

**Why keyframes matter for cutting:**
- Stream copy can only cut at keyframes
- If start time = 00:05.000 but nearest keyframe = 00:03.500:
  - Fast method: Starts at 00:03.500 (2.5s early!)
  - Accurate method: Starts at exactly 00:05.000

---

## Real-World Example

### Source Video
- Duration: 60 seconds
- Keyframes at: 0s, 2s, 4s, 6s, 8s, 10s, ... (every 2 seconds)

### Requested Cut
- Start: 00:05.000
- End: 00:12.000
- Expected duration: 7 seconds

### Method Comparison Results

**Accurate Method (Re-encode):**
- Actual start: 00:05.000 ✅
- Actual end: 00:12.000 ✅
- Actual duration: 7.000s ✅
- Quality: Excellent (CRF 18)
- Time taken: 12 seconds
- **Usable for production: YES**

**Fast Method (Stream copy):**
- Actual start: 00:04.000 (nearest keyframe) ❌
- Actual end: 00:12.000 (may vary) ⚠️
- Actual duration: 8.000s ❌ (1 second extra!)
- Quality: Lossless
- Time taken: 2 seconds
- **Usable for production: NO** (inaccurate timestamps)

---

## Why content-generation001 Uses Accurate Method

### Pipeline Requirements
1. **Qwen VL returns precise timestamps** (e.g., 12.3s - 18.7s)
2. **Remotion expects exact durations** for composition
3. **Captions must sync perfectly** with video segments
4. **B-roll clips must match script timing** exactly

### Production Quality Standards
- Instagram Reels require professional quality
- Timeline drift would break caption sync
- Corrupt clips would fail Remotion assembly
- User-facing output cannot have visual artifacts

### Cost-Benefit Analysis
- **Time cost**: 10-15s per clip (acceptable for MVP)
- **Quality benefit**: 100% reliability (critical)
- **Alternative**: Fast method fails 30-50% of clips (unacceptable)

**Decision: Accuracy > Speed for production pipeline**

---

## Optimization for Future

If cutting speed becomes a bottleneck, consider:

1. **Pre-cut B-roll library** (cache extracted clips)
2. **Parallel processing** (cut multiple clips concurrently)
3. **GPU encoding** (`-c:v h264_nvenc` on NVIDIA hardware)
4. **Preset tuning** (`-preset veryfast` instead of `ultrafast`)

**Do NOT use fast method** - corruption and inaccuracy are not worth the speed gain.

---

## Command Reference

### Accurate Cutting (Production)
```typescript
// TypeScript implementation (used in cut-clip.ts)
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
- `medium`: Balanced (use if encoding speed acceptable)

### CRF (Quality) Settings
- `18`: High quality (production - recommended)
- `23`: Good quality (web delivery)
- `28`: Acceptable quality (low-res mobile)

---

## Summary

| Aspect | Accurate Method | Fast Method |
|--------|----------------|-------------|
| **Speed** | Slow (10-15s/min) | Very fast (2s/min) |
| **Accuracy** | Frame-perfect ✅ | Keyframe-aligned ❌ |
| **Reliability** | 100% success ✅ | 50-70% success ❌ |
| **Quality** | Excellent (CRF 18) | Lossless |
| **Production Use** | **YES** ✅ | **NO** ❌ |
| **content-generation001** | **Used** | **NOT Used** |

**Recommendation:** Always use accurate method for content-generation001 pipeline. Speed optimization should come from parallelization and caching, not from sacrificing clip accuracy.
