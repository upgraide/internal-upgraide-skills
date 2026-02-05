---
name: analyzing-video
description: Understands video content using Gemini 3 Pro or Qwen3-VL vision models. Use when asking questions about videos, analyzing visual style, identifying scenes, or extracting timestamps.
---

# Analyzing Video

Ask any question about a video:

```bash
# Recommended: Gemini 3 Pro (best for quality review)
npx tsx scripts/ask-gemini.ts <video_path> "<question>"

# Alternative: Qwen3-VL
python3 scripts/ask.py <video_path> "<question>"
```

## Examples

```bash
# Quality review
npx tsx scripts/ask-gemini.ts preview.mp4 "Rate 1-10 on production quality. Be critical. List issues with timestamps."

# Content analysis
npx tsx scripts/ask-gemini.ts video.mp4 "What happens in this video second by second?"

# Style analysis
npx tsx scripts/ask-gemini.ts video.mp4 "Describe the pacing, transitions, and visual style"

# Find timestamps
npx tsx scripts/ask-gemini.ts video.mp4 "When does the speaker appear vs screen recordings?"
```

## Models

| Model | Script | Best For |
|-------|--------|----------|
| **Gemini 3 Pro** | `ask-gemini.ts` | Critical quality review, detailed analysis |
| qwen3-vl-235b | `ask.py` | General analysis |
| qwen3-omni-flash | `ask.py --model` | Audio+visual correlation |

## Requirements

**Environment:**
```
OPENROUTER_API_KEY=your_key    # For Gemini 3 Pro
DASHSCOPE_API_KEY=your_key     # For Qwen models
```

## Tips

- Use Gemini 3 Pro for quality review — it's harsher and more detailed
- Ask specific questions for better answers
- Request timestamps when timing matters
- Use chain-of-thought: "First describe what you see, then analyze the style"

**Advanced prompting:** See [resources/prompting-tips.md](resources/prompting-tips.md)
