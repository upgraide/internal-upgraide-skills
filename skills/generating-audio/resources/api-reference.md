# Fish Audio API Reference

Complete API documentation for Fish Audio TTS and voice model endpoints.

## Contents

- TTS Generation Endpoint
- Voice Model Creation Endpoint
- Voice Model List Endpoint
- Voice Model Details Endpoint
- Voice Model Delete Endpoint
- Authentication
- Error Codes
- Rate Limits

## Authentication

All API requests require Bearer token authentication:

```
Authorization: Bearer YOUR_API_KEY
```

Get your API key from https://fish.audio

Set in environment:
```bash
FISH_AUDIO_API_KEY=your_api_key_here
```

## TTS Generation Endpoint

**POST** `https://api.fish.audio/v1/tts`

Generate speech from text using specified voice model.

### Headers

- `Authorization`: Bearer token (required)
- `Content-Type`: application/json (required)
- `model`: Model name - speech-1.5, speech-1.6, or s1 (required)

### Request Body

```json
{
  "text": "Text to convert to speech",
  "temperature": 0.7,
  "top_p": 0.7,
  "reference_id": "voice-model-id",
  "format": "mp3",
  "normalize": true,
  "latency": "normal",
  "mp3_bitrate": 128,
  "opus_bitrate": 32
}
```

### Parameters

**text** (string, required)
- Text to convert to speech
- No hard character limit, but longer texts take more time

**temperature** (number, 0-1, default: 0.7 for speech-1.5/1.6, 0.9 for s1)
- Controls randomness
- Higher = more random/expressive
- Lower = more consistent/deterministic

**top_p** (number, 0-1, default: 0.7 for speech-1.5/1.6, 0.9 for s1)
- Nucleus sampling threshold
- Higher = more diversity
- Lower = more focused

**reference_id** (string, optional)
- ID of custom voice model to use
- Omit to use default voice

**format** (string, default: "mp3")
- Output audio format
- Options: mp3, wav, opus, pcm

**normalize** (boolean, default: true)
- Whether to normalize text
- Reduces latency but may affect number/date handling

**latency** (string, default: "normal")
- Options: normal, balanced
- balanced reduces latency but may degrade quality

**chunk_length** (integer, 100-300, default: 200)
- Text chunk size for processing

**sample_rate** (integer, optional)
- Output sample rate in Hz
- Defaults to format-specific standard

**mp3_bitrate** (integer, default: 128)
- MP3 bitrate in kbps
- Options: 64, 128, 192

**opus_bitrate** (integer, default: 32)
- Opus bitrate in kbps
- Options: -1000 (auto), 24, 32, 48, 64

### Response

Binary audio data in specified format.

### Example

```bash
curl -X POST https://api.fish.audio/v1/tts \
  -H "Authorization: Bearer $FISH_AUDIO_API_KEY" \
  -H "Content-Type: application/json" \
  -H "model: speech-1.5" \
  -d '{"text": "Hello world", "format": "mp3"}' \
  --output audio.mp3
```

## Voice Model Creation Endpoint

**POST** `https://api.fish.audio/model`

Create custom voice model from audio sample.

### Headers

- `Authorization`: Bearer token (required)
- `Content-Type`: multipart/form-data (required)

### Form Data

**type** (string, required)
- Set to "tts" for text-to-speech models

**train_mode** (string, required)
- Set to "fast" for instant availability
- "full" for higher quality (longer training time)

**title** (string, required)
- Voice model name/title
- Used for identification and search

**visibility** (string, default: "public")
- Options: public, unlist, private
- Controls who can see and use the model

**voices** (file, required)
- Audio file with voice sample
- Formats: mp3, wav, etc.
- Recommended: 15-30 seconds of clear speech

**texts** (string, optional)
- Transcription of audio
- If omitted, ASR will be performed automatically

**description** (string, optional)
- Human-readable description

**tags** (string[], optional)
- Tags for organization (e.g., language codes)

**enhance_audio_quality** (boolean, default: false)
- Whether to enhance audio quality during processing

### Response

```json
{
  "_id": "voice-model-id",
  "type": "tts",
  "title": "Voice Name",
  "state": "created",
  "train_mode": "fast",
  "created_at": "2025-11-21T10:00:00Z"
}
```

### States

- **created**: Model created, ready to use (with train_mode=fast)
- **training**: Model is training (with train_mode=full)
- **trained**: Training complete, ready to use
- **failed**: Training failed

### Example

```bash
curl -X POST https://api.fish.audio/model \
  -H "Authorization: Bearer $FISH_AUDIO_API_KEY" \
  -F "type=tts" \
  -F "train_mode=fast" \
  -F "title=My Voice" \
  -F "visibility=private" \
  -F "voices=@voice-sample.mp3"
```

## Voice Model List Endpoint

**GET** `https://api.fish.audio/model`

List available voice models.

### Query Parameters

**page_size** (integer, default: 10)
- Number of results per page
- Max: 100

**page_number** (integer, default: 1)
- Page number for pagination

**self** (boolean, default: false)
- If true, only return models created by authenticated user

**title** (string, optional)
- Filter by title

**language** (string[], optional)
- Filter by language tags

**sort_by** (string, default: "score")
- Options: score, task_count, created_at

### Response

```json
{
  "total": 123,
  "items": [
    {
      "_id": "voice-id",
      "type": "tts",
      "title": "Voice Name",
      "description": "Description",
      "state": "trained",
      "languages": ["en"],
      "created_at": "2025-11-21T10:00:00Z",
      "author": {
        "_id": "user-id",
        "nickname": "Username"
      }
    }
  ]
}
```

## Voice Model Details Endpoint

**GET** `https://api.fish.audio/model/{id}`

Get details of specific voice model.

### Response

Same structure as individual item in list response.

## Voice Model Delete Endpoint

**DELETE** `https://api.fish.audio/model/{id}`

Delete a voice model (only works for your own models).

### Response

Success: 200 OK
Not found: 404
Unauthorized: 401

## Error Codes

### HTTP Status Codes

**400 Bad Request**
- Invalid parameters
- Malformed request

**401 Unauthorized**
- Missing or invalid API key
- Check FISH_AUDIO_API_KEY

**402 Payment Required**
- Insufficient credits
- Top up account at https://fish.audio

**404 Not Found**
- Voice model ID not found
- Verify ID with list-voices.ts

**422 Unprocessable Entity**
- Validation errors
- Check parameter types and ranges

**429 Too Many Requests**
- Rate limit exceeded
- Implement exponential backoff

**500 Internal Server Error**
- Server error
- Retry with exponential backoff

### Error Response Format

```json
{
  "status": 400,
  "message": "Error description"
}
```

Or for validation errors:

```json
[
  {
    "loc": ["field", "name"],
    "type": "value_error",
    "msg": "Error message"
  }
]
```

## Rate Limits

Fish Audio implements rate limiting. Recommended strategies:

1. **Exponential Backoff**: Retry with increasing delays (1s, 2s, 4s, 8s)
2. **Request Throttling**: Limit concurrent requests
3. **Batch Processing**: Group operations when possible

All scripts in this skill implement retry logic with exponential backoff (5 attempts for TTS, 3 for model operations).

## Best Practices

### TTS Generation

- Use appropriate temperature/top_p for use case
- Default values work well for most cases
- Higher values for creative/expressive content
- Lower values for consistent narration

### Voice Cloning

- Use 15-30 second samples for best results
- Clear speech, minimal background noise
- Natural speaking style matching target use
- train_mode=fast for instant availability
- train_mode=full for higher quality (if needed)

### Error Handling

- Always implement retry logic
- Use exponential backoff for rate limits
- Log errors for debugging
- Provide clear error messages to users

### Cost Optimization

- Cache generated audio when possible
- Use appropriate format (opus for streaming, mp3 for files)
- Choose model based on quality needs (speech-1.5 vs s1)
- Reuse voice models instead of creating duplicates
