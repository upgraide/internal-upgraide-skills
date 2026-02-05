---
name: transcribing-audio
description: Transcribes audio/video files using AssemblyAI with word-level timestamps and WebVTT captions. Use when generating captions, timeline data, or analyzing speech timing.
---

# Transcribing Audio

Transcribe any audio/video file:

```bash
npx tsx scripts/transcribe.ts <file> [output-dir]
```

**Examples:**
```bash
# Transcribe video, output to current directory
npx tsx scripts/transcribe.ts video.mp4 ./

# Transcribe to specific directory
npx tsx scripts/transcribe.ts input/recording.mp4 output/transcripts/
```

## Output Files

Saves to specified output directory:

- `timeline.json` - Word timestamps + phrase chunks
- `captions.vtt` - WebVTT captions
- `timeline-blueprint.json` - Segments with keywords/emphasis

See [resources/examples/sample-output.json](resources/examples/sample-output.json) for output format.

## Requirements

**Environment:**
```
ASSEMBLY_AI_API_KEY=your_key_here
```

**Dependencies:**
```bash
npm install assemblyai dotenv
```

## Error Handling

Script includes automatic retry with exponential backoff (5 attempts).

**"ASSEMBLY_AI_API_KEY not found"**: Add key to `.env` file

**"Input file not found"**: Check file path exists

**"No words found"**: Ensure audio has audible speech
