#!/usr/bin/env tsx

/**
 * Create custom voice model from audio sample using Fish Audio API
 *
 * Usage:
 *   tsx create-voice.ts --audio voice.mp3 --name "My Voice"
 *   tsx create-voice.ts --audio voice.wav --name "Pro Voice" --description "Clear narration"
 */

import { readFile, stat } from 'fs/promises';
import { resolve, basename } from 'path';

interface CreateVoiceArgs {
  audio: string;
  name: string;
  description?: string;
  language?: string;
}

interface VoiceMetadata {
  voiceId?: string;
  name: string;
  state: string;
  language?: string;
  createdAt: string;
  success: boolean;
  error?: string;
}

function parseArgs(): CreateVoiceArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<CreateVoiceArgs> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--audio':
        parsed.audio = value;
        break;
      case '--name':
        parsed.name = value;
        break;
      case '--description':
        parsed.description = value;
        break;
      case '--language':
        parsed.language = value;
        break;
    }
  }

  if (!parsed.audio || !parsed.name) {
    console.error('Usage: tsx create-voice.ts --audio <path> --name "<name>" [options]');
    console.error('Options:');
    console.error('  --description "<text>"   Voice description');
    console.error('  --language <code>        Language code (default: auto-detect)');
    process.exit(1);
  }

  return parsed as CreateVoiceArgs;
}

async function validateAudio(audioPath: string): Promise<void> {
  try {
    const stats = await stat(audioPath);

    // Basic file size check (should be at least 100KB for 15-30 seconds of audio)
    if (stats.size < 100 * 1024) {
      console.warn('⚠ Warning: Audio file seems small. For best results, use 15-30 second samples.');
    }

    // Very large files (>10MB) might be unnecessarily high quality
    if (stats.size > 10 * 1024 * 1024) {
      console.warn('⚠ Warning: Audio file is large. Consider compressing for faster upload.');
    }

  } catch (error) {
    throw new Error(`Cannot access audio file: ${audioPath}`);
  }
}

async function createVoiceModel(args: CreateVoiceArgs): Promise<VoiceMetadata> {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    throw new Error('FISH_AUDIO_API_KEY not found in environment. Set it in .env file');
  }

  const audioPath = resolve(args.audio);
  await validateAudio(audioPath);

  console.error('Validating audio file...');
  const audioBuffer = await readFile(audioPath);

  const url = 'https://api.fish.audio/model';

  let lastError: Error | null = null;
  const maxRetries = 3;

  // Retry with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.error(`[Attempt ${attempt}/${maxRetries}] Uploading audio and creating voice model...`);

      // Create FormData for multipart upload (using native FormData)
      const formData = new FormData();
      formData.append('type', 'tts');
      formData.append('train_mode', 'fast');
      formData.append('title', args.name);
      formData.append('visibility', 'private');

      // Create a Blob from the audio buffer
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      formData.append('voices', audioBlob, basename(audioPath));

      if (args.description) {
        formData.append('description', args.description);
      }

      // Language will be auto-detected if not specified
      if (args.language) {
        formData.append('tags', args.language);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      // With train_mode=fast, model should be instantly available
      const voiceId = result._id;
      const state = result.state || 'created';

      console.error('✓ Voice model created successfully');
      console.error(`  Voice ID: ${voiceId}`);
      console.error(`  Name: ${args.name}`);
      console.error(`  State: ${state}`);

      if (state === 'trained' || state === 'created') {
        console.error('\n✓ Voice model is ready to use!');
        console.error(`\nUse with TTS:`);
        console.error(`  tsx scripts/tts.ts --text "Your text" --voice-id "${voiceId}" --output audio.mp3`);
      } else {
        console.error('\n⚠ Model is still processing. Check status with list-voices.ts');
      }

      const metadata: VoiceMetadata = {
        voiceId,
        name: args.name,
        state,
        language: args.language,
        createdAt: new Date().toISOString(),
        success: true,
      };

      return metadata;

    } catch (error) {
      lastError = error as Error;
      console.error(`[Attempt ${attempt}/${maxRetries}] Failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        const delayMs = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
        console.error(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('Voice model creation failed after all retries');
}

async function main() {
  try {
    const args = parseArgs();
    const metadata = await createVoiceModel(args);

    // Output JSON for programmatic use
    console.log(JSON.stringify(metadata, null, 2));
    process.exit(0);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`✗ Error: ${errorMessage}`);

    const metadata: VoiceMetadata = {
      name: '',
      state: 'failed',
      createdAt: new Date().toISOString(),
      success: false,
      error: errorMessage,
    };

    console.log(JSON.stringify(metadata, null, 2));
    process.exit(1);
  }
}

main();
