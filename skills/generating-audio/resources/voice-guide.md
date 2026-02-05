# Voice Selection and Cloning Guide

Best practices for choosing voices and creating custom voice models.

## Voice Selection Strategy

### When to Use Default Voices

Default voices work well for:
- Quick prototyping
- Generic narration
- Multi-language content
- Testing and iteration

### When to Create Custom Voices

Create custom voices when:
- Brand consistency matters
- Specific personality needed
- Unique accent or style required
- Repeated use with same voice

## Recording Audio for Voice Cloning

### Optimal Recording Specifications

**Duration**: 15-30 seconds
- Minimum: 10 seconds
- Sweet spot: 20-25 seconds
- Maximum: No hard limit, but longer doesn't always help

**Content**:
- Natural speaking style
- Varied intonation (not monotone)
- Complete sentences
- Representative of target use case

**Quality**:
- Clear speech (no mumbling)
- Minimal background noise
- Consistent volume
- No music or sound effects

**Format**:
- MP3, WAV, or other common formats
- Bitrate: 128kbps or higher
- Sample rate: 44.1kHz or higher

### Recording Environment

**Best**:
- Quiet room
- Minimal echo (soft furnishings help)
- Close microphone placement (6-12 inches)
- Pop filter if available

**Acceptable**:
- Quiet home environment
- Some room tone is fine
- Built-in laptop mic works in quiet space

**Avoid**:
- Traffic noise
- Air conditioning hum
- Echo-heavy rooms (bathrooms, empty rooms)
- Wind noise (outdoor recordings)

### Recording Tips

1. **Warm up voice**: Read for 1-2 minutes before recording
2. **Speak naturally**: Don't over-enunciate or use unnatural tone
3. **Maintain energy**: Keep consistent energy throughout
4. **Record multiple takes**: Choose best quality take
5. **Listen back**: Check for clarity and background noise

### Sample Content Ideas

**Narration style:**
> "Welcome to our comprehensive guide. In this tutorial, we'll explore the key concepts and practical applications. Whether you're a beginner or experienced user, you'll find valuable insights throughout this presentation."

**Conversational style:**
> "Hey there! So today we're going to talk about something really interesting. I've been working on this for a while, and I'm excited to share what I've learned. Let's dive right in and see what this is all about."

**Professional style:**
> "Good morning. Thank you for joining us today. We'll be discussing the quarterly results and strategic initiatives for the upcoming period. Please direct your attention to the following key metrics and projections."

## Text Formatting for Natural Speech

### Punctuation and Pacing

**Use periods for pauses:**
```
Slow down the pace. Add natural breaks. Between thoughts.
```

**Commas for breath marks:**
```
First point, second point, and finally, the conclusion.
```

**Ellipsis for hesitation:**
```
Well... I think that might work, but... we'll need to test it.
```

### Emphasis Techniques

**ALL CAPS for strong emphasis:**
```
This is REALLY important to understand.
```

**Italics or quotes for mild emphasis** (if supported):
```
The *key* thing to remember is timing.
```

**Repetition for emphasis:**
```
Important. Really, really important.
```

### Dialogue and Characters

**Use quotation marks:**
```
She said, "I'll meet you at three." He replied, "Perfect, see you then."
```

**Separate speakers with new lines:**
```
John: How's the project going?
Sarah: It's progressing well, thanks for asking.
```

### Numbers and Dates

**Spell out for clarity:**
```
Wrong: "The meeting is at 3:30 PM on 11/21/2025"
Better: "The meeting is at three thirty PM on November twenty-first, twenty twenty-five"
```

**Use context for large numbers:**
```
Wrong: "The revenue was 1234567"
Better: "The revenue was one point two million dollars"
```

### Handling Special Content

**URLs and emails**: Spell out or describe
```
Wrong: "Visit https://example.com"
Better: "Visit example dot com"
```

**Acronyms**: Decide pronunciation
```
NASA (as word: "nasa")
FBI (spell out: "F B I")
```

**Technical terms**: Use phonetic spelling if needed
```
"Kubernetes" → "koo-ber-net-eez" (if mispronounced)
```

## Voice Model Management

### Naming Conventions

Use descriptive names:
- ✓ "Professional Male - Corporate Narration"
- ✓ "Energetic Female - Product Demos"
- ✓ "Calm British - Tutorial Voice"
- ✗ "Voice 1"
- ✗ "Test"

### Organization Strategy

**By use case:**
- Narration voices
- Character voices
- Commercial voices
- Tutorial voices

**By style:**
- Professional/formal
- Casual/conversational
- Energetic/excited
- Calm/soothing

**By demographic:**
- Male/female
- Age range
- Accent/region

### Testing New Voices

Always test with representative content:

1. Generate short sample (10-15 seconds)
2. Check for naturalness and clarity
3. Test with actual script excerpt
4. Compare to alternatives
5. Adjust temperature/top_p if needed

## Troubleshooting Voice Quality

### Problem: Unnatural Prosody

**Symptoms**: Robotic, monotone, odd pauses

**Solutions**:
- Increase temperature (0.8-0.9)
- Improve voice sample (more varied intonation)
- Adjust punctuation in text
- Try different model (s1 for expressiveness)

### Problem: Inconsistent Voice

**Symptoms**: Voice changes mid-sentence

**Solutions**:
- Use consistent voice model
- Check voice sample quality
- Lower temperature for consistency
- Avoid very long texts (split into chunks)

### Problem: Mispronunciations

**Symptoms**: Wrong word pronunciation, wrong emphasis

**Solutions**:
- Use phonetic spelling
- Add context sentences
- Adjust punctuation
- Spell out acronyms if needed

### Problem: Poor Audio Quality

**Symptoms**: Static, artifacts, compression issues

**Solutions**:
- Use higher quality format (wav instead of mp3)
- Check voice sample quality
- Try different bitrate settings
- Report persistent issues to Fish Audio

## Advanced Techniques

### Creating Character Voices

For distinct character voices:
1. Record sample in character voice
2. Exaggerate distinctive traits slightly
3. Test with dialogue
4. Maintain consistency across recordings

### Accent and Language Considerations

**Native speakers**: Best results with native language samples

**Accents**: Clear accent in sample = clear accent in output

**Multilingual**: Separate voice models for each language

**Code-switching**: Works best with language-appropriate voice

### Style Matching

Match voice sample style to intended use:
- Narration sample → narration voice
- Conversational sample → conversational voice
- Dramatic reading → expressive voice
- News reading → professional voice

### Combining with Audio Post-Processing

Voice generation works well with:
- Noise reduction (subtle)
- Normalization
- EQ adjustments
- Compression (for consistency)

Avoid:
- Heavy effects (reverb, delay)
- Pitch shifting
- Time stretching
- Over-compression

## Best Practices Summary

1. **Quality input = quality output**: Good voice samples produce better results
2. **Test iteratively**: Generate small samples, adjust, repeat
3. **Match style to use**: Recording style should match intended use
4. **Format text naturally**: Use punctuation to control pacing
5. **Organize voice library**: Clear naming and categorization
6. **Reuse successful voices**: Don't recreate what already works
7. **Document settings**: Note temperature/top_p values that work well
8. **Keep samples**: Save audio files used to create models

## Quick Reference

### Voice Sample Checklist

- [ ] 15-30 seconds duration
- [ ] Clear, natural speech
- [ ] Minimal background noise
- [ ] Consistent volume
- [ ] Representative style
- [ ] Varied intonation
- [ ] Complete sentences
- [ ] High quality format

### TTS Generation Checklist

- [ ] Text properly formatted
- [ ] Punctuation for pacing
- [ ] Numbers spelled out
- [ ] Special terms phonetic
- [ ] Appropriate voice selected
- [ ] Model matches quality needs
- [ ] Format appropriate for use
- [ ] Settings documented
