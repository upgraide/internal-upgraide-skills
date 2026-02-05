# TTS Model Comparison

Technical comparison of Fish Audio TTS models and selection guidance.

## Available Models

### speech-1.5 (Default)

**Best for**: General purpose narration, balanced quality and speed

**Characteristics**:
- Balanced quality and generation speed
- Good naturalness for most use cases
- Wide language support
- Stable and reliable
- Cost-effective

**Recommended settings**:
- Temperature: 0.7 (default)
- Top P: 0.7 (default)

**Use when**:
- Creating standard narration
- Budget is a consideration
- Speed matters
- Content is straightforward

### speech-1.6

**Best for**: Enhanced naturalness, latest improvements

**Characteristics**:
- Latest model improvements
- Enhanced naturalness and prosody
- Better emotion and expression
- Slightly slower than 1.5
- Similar cost to 1.5

**Recommended settings**:
- Temperature: 0.7 (default)
- Top P: 0.7 (default)

**Use when**:
- Quality improvements over 1.5 desired
- Natural conversation important
- Emotional content
- Professional voiceovers

### s1 (Premium)

**Best for**: Highest quality, maximum expressiveness

**Characteristics**:
- Highest quality output
- Maximum expressiveness and emotion
- Best prosody and intonation
- Slower generation
- Higher cost

**Recommended settings**:
- Temperature: 0.9 (default)
- Top P: 0.9 (default)
- Higher values suit this model's capabilities

**Use when**:
- Premium quality required
- Expressive content (storytelling, character voices)
- Final production audio
- Budget allows

## Model Selection Matrix

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| Standard narration | speech-1.5 | Balanced quality/speed |
| Tutorial voiceovers | speech-1.5 | Clear, consistent |
| Product demos | speech-1.6 | Enhanced naturalness |
| Marketing content | speech-1.6 or s1 | Professional quality |
| Character voices | s1 | Expressiveness |
| Audiobook narration | s1 | Quality matters |
| Rapid prototyping | speech-1.5 | Speed matters |
| Bulk generation | speech-1.5 | Cost-effective |
| Emotional content | s1 | Best prosody |
| Multilingual | speech-1.6 | Good language support |

## Performance Comparison

### Generation Speed

**speech-1.5**: ⚡⚡⚡⚡⚡ Fastest
**speech-1.6**: ⚡⚡⚡⚡ Fast
**s1**: ⚡⚡⚡ Moderate

### Quality

**speech-1.5**: ⭐⭐⭐⭐ Good
**speech-1.6**: ⭐⭐⭐⭐⭐ Excellent
**s1**: ⭐⭐⭐⭐⭐⭐ Premium

### Naturalness

**speech-1.5**: Good for most content
**speech-1.6**: Enhanced prosody and flow
**s1**: Maximum expressiveness

### Cost (Relative)

**speech-1.5**: $ Base cost
**speech-1.6**: $ Similar to 1.5
**s1**: $$$ Premium pricing

## Language Support

All models support 30+ languages including:

- English (US, UK, AU, etc.)
- Spanish (ES, MX, etc.)
- French
- German
- Italian
- Portuguese (BR, PT)
- Chinese (Mandarin, Cantonese)
- Japanese
- Korean
- Russian
- Arabic
- Hindi
- And many more

**Note**: Speech quality may vary by language. English generally has best results across all models.

## Quality Factors

### Prosody

How naturally the voice rises and falls:
- **speech-1.5**: Good, appropriate for narration
- **speech-1.6**: Excellent, natural conversation flow
- **s1**: Outstanding, captures subtle emotion

### Intonation

Emphasis and stress patterns:
- **speech-1.5**: Clear and consistent
- **speech-1.6**: Enhanced natural patterns
- **s1**: Most natural, context-aware

### Expressiveness

Emotional range and character:
- **speech-1.5**: Neutral to moderate
- **speech-1.6**: Good emotional range
- **s1**: Full emotional spectrum

### Consistency

Voice stability across generation:
- **speech-1.5**: Highly consistent
- **speech-1.6**: Consistent with variation
- **s1**: Expressive with controlled variation

## Parameter Tuning by Model

### Temperature and Top P

**speech-1.5 & speech-1.6**:
- Default: 0.7 / 0.7
- More consistent: 0.5 / 0.5
- More varied: 0.8 / 0.8

**s1**:
- Default: 0.9 / 0.9 (higher for this model)
- More consistent: 0.7 / 0.7
- More expressive: 0.95 / 0.95

### Format Selection

All models support:
- **mp3**: Best for files, good compression (128kbps default)
- **wav**: Uncompressed, highest quality
- **opus**: Best for streaming, excellent compression
- **pcm**: Raw audio, for further processing

**Recommendation**: Use mp3 (128kbps) for most use cases, wav for premium production.

## Migration Between Models

### From speech-1.5 to speech-1.6

**Why migrate**:
- Want improved naturalness
- Minimal cost/speed impact
- Easy drop-in replacement

**How**:
- Change `--model speech-1.6`
- Keep same voice models
- No other changes needed

**Expect**:
- Slightly more natural prosody
- Minimal speed difference
- Similar costs

### From speech-1.5/1.6 to s1

**Why migrate**:
- Need premium quality
- Expressiveness important
- Final production audio

**How**:
- Change `--model s1`
- Adjust temperature/top_p to 0.9 (or keep for more consistency)
- Budget for higher costs

**Expect**:
- Noticeably better quality
- More expressive output
- Slower generation
- Higher costs

### Testing Migration

Always test with representative content:

```bash
# Generate with current model
tsx scripts/tts.ts --text "Test text" --model speech-1.5 --output test-1.5.mp3

# Generate with new model
tsx scripts/tts.ts --text "Test text" --model speech-1.6 --output test-1.6.mp3

# Compare outputs
```

## Cost Optimization

### By Model Selection

1. **Prototyping phase**: Use speech-1.5
2. **Review phase**: Generate samples with all models
3. **Production**: Use minimum model that meets quality bar

### By Volume

- Generate in batches
- Reuse generated audio when possible
- Cache results for identical text+voice+model combinations

### By Format

- Use mp3 (128kbps) for distribution
- Use opus for streaming
- Reserve wav for archival or further processing

## Decision Framework

Ask these questions:

**1. What's the use case?**
- Tutorial/documentation → speech-1.5
- Marketing/commercial → speech-1.6 or s1
- Character/storytelling → s1

**2. What's the budget?**
- Limited → speech-1.5
- Flexible → speech-1.6
- Premium → s1

**3. Is speed critical?**
- Yes → speech-1.5
- Somewhat → speech-1.6
- No → s1

**4. How important is quality?**
- Good enough → speech-1.5
- Professional → speech-1.6
- Best possible → s1

**5. Will this be reused?**
- One-off → speech-1.5 (fast)
- Reused → s1 (amortize cost)

## Best Practices

### Start Simple

1. Begin with speech-1.5
2. Test with actual content
3. Upgrade only if quality insufficient

### A/B Test

Generate samples with different models:
- Same text
- Same voice
- Different models
- Compare results

### Document Decisions

Keep track of what works:
- Model used
- Temperature/top_p settings
- Voice ID
- Quality assessment
- Use case

### Consider Context

**Internal use** (training, prototypes):
- speech-1.5 usually sufficient

**External use** (customers, marketing):
- speech-1.6 or s1 recommended

**Brand consistency**:
- Pick one model, use consistently
- Quality matters more than speed

## Quick Reference

### Model Selection Shortcut

- **Fast prototype** → speech-1.5
- **Production narration** → speech-1.6
- **Premium quality** → s1
- **Character work** → s1
- **Bulk content** → speech-1.5
- **Not sure** → speech-1.6 (good middle ground)

### Command Examples

```bash
# Standard quality
tsx scripts/tts.ts --text "Hello" --model speech-1.5 --output audio.mp3

# Enhanced quality
tsx scripts/tts.ts --text "Hello" --model speech-1.6 --output audio.mp3

# Premium quality
tsx scripts/tts.ts --text "Hello" --model s1 --output audio.mp3
```

### Settings Quick Copy

**speech-1.5 / speech-1.6**:
```
--temperature 0.7 --top-p 0.7
```

**s1**:
```
--temperature 0.9 --top-p 0.9
```

**More consistent** (any model):
```
--temperature 0.5 --top-p 0.5
```

**More expressive** (any model):
```
--temperature 0.9 --top-p 0.9
```
