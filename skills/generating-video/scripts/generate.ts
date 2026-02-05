#!/usr/bin/env tsx

/**
 * SORA Video Generation Script
 *
 * Creates a new video generation job from a text prompt.
 *
 * Usage:
 *   tsx generate.ts \
 *     --prompt "Wide shot of a modern office space, natural lighting" \
 *     --model sora-2 \
 *     --size 1280x720 \
 *     --seconds 5
 *
 * Output:
 *   JSON object with job ID and status printed to stdout
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';
import { createSoraClient } from './utils/sora-client.js';
import type { VideoGenerationRequest } from '../../../src/types.js';

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
      model: {
        type: 'string',
        short: 'm',
        default: 'sora-2',
      },
      size: {
        type: 'string',
        short: 's',
        default: '1280x720',
      },
      seconds: {
        type: 'string',
        short: 'd',
        default: '4',
      },
      'input-reference': {
        type: 'string',
      },
      'remix-video-id': {
        type: 'string',
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
SORA Video Generation Script

Usage:
  tsx generate.ts [options]

Options:
  -p, --prompt <text>         Video description prompt (required)
  -m, --model <model>         Model to use: sora-2 or sora-2-pro (default: sora-2)
  -s, --size <resolution>     Video resolution: 1280x720 or 1920x1080 (default: 1280x720)
  -d, --seconds <duration>    Video duration in seconds: 5-10 (default: 5)
  --input-reference <path>    Path to reference image for first frame (optional)
  --remix-video-id <id>       ID of video to remix instead of creating new (optional)
  -h, --help                  Show this help message

Examples:
  # Generate a 5-second B-roll video with sora-2
  tsx generate.ts \\
    --prompt "Wide shot of a modern office, natural lighting, slow camera pan" \\
    --model sora-2 \\
    --size 1280x720 \\
    --seconds 5

  # Generate high-quality 10-second video with sora-2-pro
  tsx generate.ts \\
    --prompt "Close-up of coffee being poured into a cup, morning sunlight" \\
    --model sora-2-pro \\
    --size 1920x1080 \\
    --seconds 10

  # Remix an existing video
  tsx generate.ts \\
    --remix-video-id video_abc123 \\
    --prompt "Change the color palette to warm tones"

Environment:
  OPENAI_API_KEY    OpenAI API key (required)

Output:
  JSON object with job information printed to stdout:
  {
    "id": "video_abc123",
    "status": "queued",
    "model": "sora-2",
    "prompt": "...",
    "size": "1280x720",
    "seconds": "5",
    "created_at": 1234567890
  }
`);
}

/**
 * Validate arguments
 */
function validateArguments(args: ReturnType<typeof parseArguments>) {
  const errors: string[] = [];

  // Check for required prompt (unless remixing)
  if (!args.prompt && !args['remix-video-id']) {
    errors.push('--prompt is required (unless using --remix-video-id)');
  }

  // Validate model
  if (args.model && !['sora-2', 'sora-2-pro'].includes(args.model)) {
    errors.push('--model must be either "sora-2" or "sora-2-pro"');
  }

  // Validate size (SORA API supported formats)
  if (args.size && !['720x1280', '1280x720', '1024x1792', '1792x1024'].includes(args.size)) {
    errors.push('--size must be one of: "720x1280", "1280x720", "1024x1792", "1792x1024"');
  }

  // Validate seconds
  if (args.seconds) {
    const seconds = parseInt(args.seconds);
    if (isNaN(seconds) || ![4, 8, 12].includes(seconds)) {
      errors.push('--seconds must be 4, 8, or 12');
    }
  }

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY environment variable is required');
  }

  return errors;
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
  const errors = validateArguments(args);
  if (errors.length > 0) {
    console.error('Error: Invalid arguments\n');
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error('\nUse --help for usage information');
    process.exit(1);
  }

  try {
    const client = createSoraClient();

    // Check if this is a remix operation
    if (args['remix-video-id']) {
      console.error(`[SORA] Creating remix of video ${args['remix-video-id']}`);
      console.error(`[SORA] Prompt: ${args.prompt}`);

      const job = await client.createRemix(
        args['remix-video-id'],
        args.prompt!
      );

      // Output job info as JSON to stdout
      console.log(JSON.stringify(job, null, 2));
      return;
    }

    // Build request object for new video generation
    const request: VideoGenerationRequest = {
      prompt: args.prompt!,
      model: args.model as 'sora-2' | 'sora-2-pro',
      size: args.size as '1280x720' | '1920x1080',
      seconds: parseInt(args.seconds!),
    };

    // Add optional reference image if provided
    if (args['input-reference']) {
      request.input_reference = args['input-reference'];
    }

    console.error('[SORA] Creating video generation job...');
    console.error(`[SORA] Model: ${request.model}`);
    console.error(`[SORA] Size: ${request.size}`);
    console.error(`[SORA] Duration: ${request.seconds}s`);
    console.error(`[SORA] Prompt: ${request.prompt}`);

    // Create the video generation job
    const job = await client.createVideo(request);

    console.error(`[SORA] Job created successfully: ${job.id}`);
    console.error(`[SORA] Initial status: ${job.status}`);

    // Output job info as JSON to stdout
    console.log(JSON.stringify(job, null, 2));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[SORA] Error creating video:', err.message);
    console.error('[SORA] Stack:', err.stack);

    // Output error as JSON for machine consumption
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
