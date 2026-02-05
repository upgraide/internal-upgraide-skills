---
name: processing-video
description: Processes video with FFmpeg for clip cutting, quality downgrading, and metadata extraction. Use when cutting segments, converting quality, or extracting video properties.
---

# Processing Video

## Operations

### Cut Video Clips

Extract precise time segments with frame-perfect accuracy:

```typescript
import { cutClip } from './scripts/cut-clip';

const result = await cutClip({
  inputPath: '/absolute/path/to/input.mp4',
  outputPath: '/absolute/path/to/output.mp4',
  startTime: '00:05.000',    // Start at 5 seconds
  endTime: '00:12.500',      // End at 12.5 seconds
  precision: 'millisecond',  // or 'second'
});
```

**Timestamp formats:** `45.5`, `01:30`, `00:01:30`, `00:01:30.500`

**Why re-encode method:** Slower but 100% reliable. Stream copy can corrupt clips.

### Downgrade Quality

Convert to lower resolution:

```typescript
import { downgradeQuality } from './scripts/downgrade-quality';

const result = await downgradeQuality({
  inputPath: '/absolute/path/to/high-res.mp4',
  outputPath: '/absolute/path/to/low-res.mp4',
  target: '720p',  // or '1080p', '480p'
});
```

**Quality targets:**
- `1080p`: 1920x1080, CRF 20
- `720p`: 1280x720, CRF 23
- `480p`: 854x480, CRF 28

### Extract Metadata

```typescript
import { getMetadata, getDuration, getResolution } from './scripts/get-metadata';

const metadata = await getMetadata('/path/to/video.mp4');
// { duration: 45.2, width: 1920, height: 1080, codec: 'h264', bitrate: 5000, fps: 30 }

const duration = await getDuration('/path/to/video.mp4'); // 45.2
const { width, height } = await getResolution('/path/to/video.mp4');
```

## Helper Functions

```typescript
import { validateTimestamp, secondsToTimestamp } from './scripts/cut-clip';

validateTimestamp('00:01:30.500');  // true
secondsToTimestamp(90.5, 'millisecond');  // "00:01:30.500"

import { getRecommendedTarget } from './scripts/downgrade-quality';
getRecommendedTarget(1920, 1080);  // '720p'
```

## Requirements

**System:** FFmpeg must be installed and in PATH.

## Error Handling

All operations auto-retry with exponential backoff (5 attempts).

**"No such file"**: Use absolute paths

**"Invalid timestamp"**: Use `validateTimestamp()` helper

**Output too large**: Downgrade quality first

## Performance

| Operation | Time (1080p) |
|-----------|--------------|
| Cut 1min clip (re-encode) | ~10-15s |
| Downgrade 10min to 720p | ~30-45s |
| Metadata extraction | <1s |

See [resources/cutting-methods.md](resources/cutting-methods.md) for detailed FFmpeg comparison.
