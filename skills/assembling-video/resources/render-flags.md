# Render Flags

## HDR to SDR (critical for iPhone footage)

iPhone videos use HDR (bt2020/HLG) which renders washed-out by default.

**Fix:** Add these flags:

```bash
npx remotion render src/remotion/index.ts CompositionName out/video.mp4 \
  --color-space=bt709 \
  --image-format=png \
  --gl=angle
```

**Why each flag:**
- `--color-space=bt709` - Standard color space for Instagram/TikTok
- `--image-format=png` - Lossless intermediate frames (prevents color banding)
- `--gl=angle` - Correct color handling on macOS

## Quality Settings

```bash
--crf=18        # High quality (18-23 recommended, lower = better)
--codec=h264    # Instagram/TikTok compatible
```

## Troubleshooting

**Washed out colors?** Add all three HDR flags above.

**MOV timeout errors?** Convert to MP4 first:
```bash
ffmpeg -i input.MOV -c:v libx264 -preset slow -crf 18 output.mp4
```
