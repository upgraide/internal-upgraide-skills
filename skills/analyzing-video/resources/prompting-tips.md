# Video Analysis Prompting Tips

Techniques that improve Qwen VL responses based on multimodal LLM research.

## Chain-of-Thought Prompting

Ask the model to explain reasoning before conclusions:

```
"First describe what you observe in each scene, then analyze the overall editing style."
```

```
"List the visual elements you see, then explain how they create the intended mood."
```

## Temporal Precision

Request explicit timestamps when timing matters:

```
"At what second does each scene transition occur? List as: [timestamp] - [description]"
```

```
"Create a timeline: for each 5-second segment, describe what's on screen."
```

## Comparative Analysis

Reference specific elements to compare:

```
"Compare the first 10 seconds to the last 10 seconds. What changes in pacing, framing, or style?"
```

## Structured Requests

For complex analysis, specify the structure you want:

```
"Analyze this video's style. Include: 1) Shot lengths 2) Transition types 3) Color treatment 4) Text overlay patterns"
```

## Long Video Strategies

For videos over 60 seconds, focus on segments:

```
"Focus on seconds 0-30. What visual techniques are used in this opening?"
```

## Audio-Visual (Omni Model)

When using qwen3-omni-flash with remote URLs:

```
"How does the music tempo relate to cut frequency? Are edits aligned with beats?"
```

```
"When does background music duck for voiceover?"
```
