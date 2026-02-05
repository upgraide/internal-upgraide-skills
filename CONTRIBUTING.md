# Contributing to UpgradeSkills

## Before Adding a Skill

1. **Read the best practices**: [docs/best-practices.md](docs/best-practices.md)
2. **Evaluate first**: Test the skill with real usage before adding
3. **Start with the template**: [templates/SKILL.template.md](templates/SKILL.template.md)

## Skill Quality Checklist

### Core Quality

- [ ] Name: lowercase, hyphens, gerund form (`processing-pdfs`)
- [ ] Description: third person, specific, includes "Use when..."
- [ ] SKILL.md body under 500 lines
- [ ] References one level deep only
- [ ] No time-sensitive information
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract

### Structure

- [ ] Progressive disclosure used (detailed content in separate files)
- [ ] Workflows have clear steps
- [ ] Error handling documented

### For Skills with Code

- [ ] Scripts handle errors explicitly (don't punt to Claude)
- [ ] No magic numbers (all values justified)
- [ ] Required packages listed
- [ ] Unix-style paths only (forward slashes)

### Testing

- [ ] Tested with real usage scenarios
- [ ] Works with intended models (Sonnet, Opus, Haiku if applicable)

## Evaluation Process

1. **Copy skill to a test project**
2. **Run 3+ real tasks** that should trigger the skill
3. **Document observations**:
   - Did Claude discover the skill correctly?
   - Did Claude follow instructions?
   - What failed or could be improved?
4. **Iterate** based on findings
5. **Only then** add to UpgradeSkills

## File Structure

```
skills/
└── skill-name/
    ├── SKILL.md           # Main instructions (<500 lines)
    ├── resources/         # Reference files (loaded on demand)
    │   └── guide.md
    └── scripts/           # Utility scripts (if applicable)
        └── tool.ts
```

## Naming Convention

Use **gerund form** (verb + -ing):

✅ Good:
- `generating-audio`
- `processing-video`
- `transcribing-audio`

❌ Avoid:
- `audio-generator`
- `video`
- `utils`

## Description Format

```yaml
description: [What it does] using [key technology]. Use when [specific triggers].
```

Examples:
- `"Transcribes audio files using AssemblyAI with word-level timestamps. Use when generating captions or analyzing speech timing."`
- `"Generates speech from text using Fish Audio TTS. Use when creating voiceovers or narration."`

## Questions?

Open an issue or ask in the team channel.
