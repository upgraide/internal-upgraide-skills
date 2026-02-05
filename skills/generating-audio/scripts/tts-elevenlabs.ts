#!/usr/bin/env npx tsx

/**
 * ElevenLabs Text-to-Speech Script
 *
 * Usage:
 *   npx tsx .claude/skills/generating-audio/scripts/tts-elevenlabs.ts \
 *     --text "Hello world" \
 *     --output public/audio/speech.mp3
 *
 * Options:
 *   --text        Text to convert to speech (required)
 *   --output      Output file path (required)
 *   --voice-id    Voice ID (default: from env ELEVENLABS_VOICE_ID)
 *   --model       Model ID (default: eleven_multilingual_v2)
 *   --speed       Speech speed 0.25-4.0 (default: 1.1)
 *   --similarity  Voice similarity 0-1 (default: 0.8)
 *   --stability   Voice stability 0-1 (default: 0.5)
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

const API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'CZRDlhCl7tduiDHB6uFD';
const DEFAULT_MODEL = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

interface Args {
  text: string;
  output: string;
  voiceId: string;
  model: string;
  speed: number;
  similarity: number;
  stability: number;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const result: Partial<Args> = {
    voiceId: DEFAULT_VOICE_ID,
    model: DEFAULT_MODEL,
    speed: 1.1,        // Slightly faster than normal
    similarity: 0.8,   // 80% similarity
    stability: 0.5,    // Balanced stability
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--text':
        result.text = args[++i];
        break;
      case '--output':
        result.output = args[++i];
        break;
      case '--voice-id':
        result.voiceId = args[++i];
        break;
      case '--model':
        result.model = args[++i];
        break;
      case '--speed':
        result.speed = parseFloat(args[++i]);
        break;
      case '--similarity':
        result.similarity = parseFloat(args[++i]);
        break;
      case '--stability':
        result.stability = parseFloat(args[++i]);
        break;
    }
  }

  if (!result.text) {
    console.error('Error: --text is required');
    process.exit(1);
  }
  if (!result.output) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  return result as Args;
}

async function generateSpeech(args: Args): Promise<void> {
  if (!API_KEY) {
    console.error('Error: ELEVENLABS_API_KEY not found in environment');
    process.exit(1);
  }

  console.log(`[TTS] Generating speech...`);
  console.log(`  Voice: ${args.voiceId}`);
  console.log(`  Model: ${args.model}`);
  console.log(`  Speed: ${args.speed}x`);
  console.log(`  Similarity: ${args.similarity * 100}%`);
  console.log(`  Text: "${args.text.substring(0, 50)}..."`);

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${args.voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
    },
    body: JSON.stringify({
      text: args.text,
      model_id: args.model,
      voice_settings: {
        stability: args.stability,
        similarity_boost: args.similarity,
        style: 0.0,
        use_speaker_boost: true,
        speed: args.speed,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[TTS] API Error: ${response.status} ${response.statusText}`);
    console.error(errorText);
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(args.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write audio file
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(args.output, buffer);

  // Get file stats
  const stats = fs.statSync(args.output);

  console.log(`[TTS] Success!`);
  console.log(JSON.stringify({
    success: true,
    output: args.output,
    size: stats.size,
    voiceId: args.voiceId,
    model: args.model,
    textLength: args.text.length,
  }, null, 2));
}

// Main
const args = parseArgs();
generateSpeech(args).catch((err) => {
  console.error('[TTS] Error:', err);
  process.exit(1);
});
