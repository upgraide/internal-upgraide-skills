#!/usr/bin/env tsx

/**
 * List available voice models from Fish Audio API
 *
 * Usage:
 *   tsx list-voices.ts              # List all voices
 *   tsx list-voices.ts --self       # List only your custom voices
 */

interface ListVoicesArgs {
  self?: boolean;
}

interface Voice {
  _id: string;
  title: string;
  description: string;
  type: string;
  state: string;
  languages: string[];
  visibility: string;
  created_at: string;
  author?: {
    _id: string;
    nickname: string;
  };
}

interface VoicesSummary {
  total: number;
  voices: Voice[];
  success: boolean;
  error?: string;
}

function parseArgs(): ListVoicesArgs {
  const args = process.argv.slice(2);
  const parsed: ListVoicesArgs = {};

  if (args.includes('--self')) {
    parsed.self = true;
  }

  return parsed;
}

async function listVoices(args: ListVoicesArgs): Promise<VoicesSummary> {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    throw new Error('FISH_AUDIO_API_KEY not found in environment. Set it in .env file');
  }

  // Build query parameters
  const params = new URLSearchParams({
    page_size: '50',
    page_number: '1',
  });

  if (args.self) {
    params.set('self', 'true');
  }

  const url = `https://api.fish.audio/model?${params.toString()}`;

  let lastError: Error | null = null;
  const maxRetries = 3;

  // Retry with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.error(`[Attempt ${attempt}/${maxRetries}] Fetching voice models...`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      const voices: Voice[] = result.items || [];
      const total = result.total || 0;

      // Filter for TTS models only
      const ttsVoices = voices.filter((v: Voice) => v.type === 'tts');

      console.error(`✓ Found ${ttsVoices.length} TTS voice model(s)`);
      console.error('');

      // Display summary
      if (ttsVoices.length === 0) {
        console.error('No voice models found.');
        if (!args.self) {
          console.error('Use --self to see only your custom voices.');
        }
      } else {
        ttsVoices.forEach((voice) => {
          console.error(`Voice: ${voice.title}`);
          console.error(`  ID: ${voice._id}`);
          console.error(`  State: ${voice.state}`);
          console.error(`  Languages: ${voice.languages.join(', ') || 'auto'}`);
          if (voice.description) {
            console.error(`  Description: ${voice.description}`);
          }
          if (voice.author) {
            console.error(`  Author: ${voice.author.nickname}`);
          }
          console.error(`  Created: ${new Date(voice.created_at).toLocaleString()}`);
          console.error('');
        });
      }

      const summary: VoicesSummary = {
        total: ttsVoices.length,
        voices: ttsVoices,
        success: true,
      };

      return summary;

    } catch (error) {
      lastError = error as Error;
      console.error(`[Attempt ${attempt}/${maxRetries}] Failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.error(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('Failed to list voices after all retries');
}

async function main() {
  try {
    const args = parseArgs();
    const summary = await listVoices(args);

    // Output JSON for programmatic use
    console.log(JSON.stringify(summary, null, 2));
    process.exit(0);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`✗ Error: ${errorMessage}`);

    const summary: VoicesSummary = {
      total: 0,
      voices: [],
      success: false,
      error: errorMessage,
    };

    console.log(JSON.stringify(summary, null, 2));
    process.exit(1);
  }
}

main();
