#!/usr/bin/env tsx

/**
 * VEO3 Video Extension Script (REST API)
 *
 * Extends a previously generated VEO3 video by 7 seconds using REST API.
 *
 * Usage:
 *   tsx extend-veo3-rest.ts \
 *     --video-uri "https://generativelanguage.googleapis.com/v1beta/files/xyz:download?alt=media" \
 *     --prompt "Camera continues panning right"
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Parse command-line arguments
 */
function parseArguments() {
  const { values } = parseArgs({
    options: {
      prompt: {
        type: 'string',
        short: 'p',
      },
      'video-uri': {
        type: 'string',
        short: 'u',
      },
      model: {
        type: 'string',
        short: 'm',
        default: 'veo-3.1-generate-preview',
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false,
      },
    },
  });

  return values;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
VEO3 Video Extension Script (REST API)

Extends a VEO-generated video by 7 seconds.

Usage:
  tsx extend-veo3-rest.ts [options]

Options:
  -p, --prompt <text>        Description of the extension (required)
  -u, --video-uri <uri>      Video URI from previous generation (required)
  -m, --model <model>        Model to use (default: veo-3.1-generate-preview)
  -h, --help                 Show this help message

Example:
  tsx extend-veo3-rest.ts \\
    --video-uri "https://generativelanguage.googleapis.com/v1beta/files/abc:download?alt=media" \\
    --prompt "Camera continues panning to reveal more of the scene"

Environment:
  GOOGLE_GENAI_API_KEY    Google GenAI API key (required)

Output:
  JSON object with new operation name
`);
}

/**
 * Main execution
 */
async function main() {
  const args = parseArguments();

  // Show help if requested
  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Validate arguments
  const errors: string[] = [];
  if (!args.prompt) errors.push('--prompt is required');
  if (!args['video-uri']) errors.push('--video-uri is required');
  if (!process.env.GOOGLE_GENAI_API_KEY) errors.push('GOOGLE_GENAI_API_KEY environment variable is required');

  if (errors.length > 0) {
    console.error('Error: Invalid arguments\n');
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error('\nUse --help for usage information');
    process.exit(1);
  }

  try {
    console.error('[EXTEND] Creating video extension job...');
    console.error(`[EXTEND] Model: ${args.model}`);
    console.error(`[EXTEND] Prompt: ${args.prompt}`);
    console.error(`[EXTEND] Video URI: ${args['video-uri']}`);

    // Call REST API to extend video
    const response = await fetch(
      `${BASE_URL}/models/${args.model}:predictLongRunning`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GOOGLE_GENAI_API_KEY!,
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: args.prompt,
              video: {
                uri: args['video-uri'],
              },
            },
          ],
          parameters: {
            resolution: '720p',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    console.error(`[EXTEND] Operation created: ${result.name}`);
    console.error('[EXTEND] Extension started successfully');

    // Output operation info
    console.log(
      JSON.stringify(
        {
          name: result.name,
          prompt: args.prompt,
          extensionOf: args['video-uri'],
        },
        null,
        2
      )
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[EXTEND] Error:', err.message);
    console.error('[EXTEND] Stack:', err.stack);

    console.log(
      JSON.stringify(
        {
          error: {
            message: err.message,
            stack: err.stack,
          },
        },
        null,
        2
      )
    );

    process.exit(1);
  }
}

main();
