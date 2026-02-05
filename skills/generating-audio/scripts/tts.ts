#!/usr/bin/env tsx

/**
 * Text-to-Speech generation using Fish Audio API
 *
 * Usage:
 *   tsx tts.ts --text "Hello world" --output audio.mp3
 *   tsx tts.ts --text "Hello" --voice-id "voice-123" --model "s1" --output audio.wav
 */

import { writeFile } from 'fs/promises';
import { resolve } from 'path';

interface TTSArgs {
  text: string;
  output: string;
  model?: 'speech-1.5' | 'speech-1.6' | 's1';
  voiceId?: string;
  format?: 'mp3' | 'wav' | 'opus' | 'pcm';
  temperature?: number;
  topP?: number;
}

interface TTSMetadata {
  filePath: string;
  format: string;
  model: string;
  voiceId?: string;
  textLength: number;
  generatedAt: string;
  success: boolean;
  error?: string;
}

// Default temperature and top_p based on model
function getDefaults(model: string) {
  if (model === 's1') {
    return { temperature: 0.9, topP: 0.9 };
  }
  return { temperature: 0.7, topP: 0.7 };
}

function parseArgs(): TTSArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<TTSArgs> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--text':
        parsed.text = value;
        break;
      case '--output':
        parsed.output = value;
        break;
      case '--model':
        if (['speech-1.5', 'speech-1.6', 's1'].includes(value)) {
          parsed.model = value as TTSArgs['model'];
        } else {
          console.error(`Invalid model: ${value}. Use speech-1.5, speech-1.6, or s1`);
          process.exit(1);
        }
        break;
      case '--voice-id':
        parsed.voiceId = value;
        break;
      case '--format':
        if (['mp3', 'wav', 'opus', 'pcm'].includes(value)) {
          parsed.format = value as TTSArgs['format'];
        } else {
          console.error(`Invalid format: ${value}. Use mp3, wav, opus, or pcm`);
          process.exit(1);
        }
        break;
      case '--temperature':
        parsed.temperature = parseFloat(value);
        if (isNaN(parsed.temperature) || parsed.temperature < 0 || parsed.temperature > 1) {
          console.error('Temperature must be between 0 and 1');
          process.exit(1);
        }
        break;
      case '--top-p':
        parsed.topP = parseFloat(value);
        if (isNaN(parsed.topP) || parsed.topP < 0 || parsed.topP > 1) {
          console.error('Top P must be between 0 and 1');
          process.exit(1);
        }
        break;
    }
  }

  if (!parsed.text || !parsed.output) {
    console.error('Usage: tsx tts.ts --text "Your text" --output audio.mp3 [options]');
    console.error('Options:');
    console.error('  --model <speech-1.5|speech-1.6|s1>  (default: speech-1.5)');
    console.error('  --voice-id <id>                      Custom voice model ID');
    console.error('  --format <mp3|wav|opus|pcm>          (default: mp3)');
    console.error('  --temperature <0-1>                  Randomness (default: 0.7 or 0.9 for s1)');
    console.error('  --top-p <0-1>                        Nucleus sampling (default: 0.7 or 0.9 for s1)');
    process.exit(1);
  }

  return parsed as TTSArgs;
}

async function generateTTS(args: TTSArgs): Promise<TTSMetadata> {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    throw new Error('FISH_AUDIO_API_KEY not found in environment. Set it in .env file');
  }

  const model = args.model || 'speech-1.5';
  const format = args.format || 'mp3';
  const defaults = getDefaults(model);
  const temperature = args.temperature ?? defaults.temperature;
  const topP = args.topP ?? defaults.topP;

  const requestBody: any = {
    text: args.text,
    temperature,
    top_p: topP,
    format,
    normalize: true,
    latency: 'normal',
  };

  if (args.voiceId) {
    requestBody.reference_id = args.voiceId;
  }

  // Set format-specific options
  if (format === 'mp3') {
    requestBody.mp3_bitrate = 128;
  } else if (format === 'opus') {
    requestBody.opus_bitrate = 32;
  }

  const url = 'https://api.fish.audio/v1/tts';
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'model': model,
  };

  let lastError: Error | null = null;
  const maxRetries = 5;

  // Retry with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.error(`[Attempt ${attempt}/${maxRetries}] Generating speech...`);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const audioData = await response.arrayBuffer();
      const outputPath = resolve(args.output);
      await writeFile(outputPath, Buffer.from(audioData));

      const metadata: TTSMetadata = {
        filePath: outputPath,
        format,
        model,
        voiceId: args.voiceId,
        textLength: args.text.length,
        generatedAt: new Date().toISOString(),
        success: true,
      };

      return metadata;

    } catch (error) {
      lastError = error as Error;
      console.error(`[Attempt ${attempt}/${maxRetries}] Failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.error(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('TTS generation failed after all retries');
}

async function main() {
  try {
    const args = parseArgs();
    const metadata = await generateTTS(args);

    console.error(`✓ Audio generated successfully`);
    console.error(`  File: ${metadata.filePath}`);
    console.error(`  Format: ${metadata.format}`);
    console.error(`  Model: ${metadata.model}`);
    if (metadata.voiceId) {
      console.error(`  Voice ID: ${metadata.voiceId}`);
    }

    // Output JSON for programmatic use
    console.log(JSON.stringify(metadata, null, 2));
    process.exit(0);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`✗ Error: ${errorMessage}`);

    const metadata: TTSMetadata = {
      filePath: '',
      format: '',
      model: '',
      textLength: 0,
      generatedAt: new Date().toISOString(),
      success: false,
      error: errorMessage,
    };

    console.log(JSON.stringify(metadata, null, 2));
    process.exit(1);
  }
}

main();
