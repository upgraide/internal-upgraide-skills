#!/usr/bin/env tsx

/**
 * SORA Video Status Polling Script
 *
 * Monitors a video generation job until completion or failure.
 *
 * Usage:
 *   tsx poll-status.ts <video_id> [--interval 10000] [--quiet]
 *
 * Output:
 *   Progress updates to stderr
 *   Final job status as JSON to stdout
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';
import { createSoraClient } from './utils/sora-client.js';

/**
 * Parse command-line arguments
 */
function parseArguments() {
  const { values, positionals } = parseArgs({
    options: {
      interval: {
        type: 'string',
        short: 'i',
        default: '10000',
      },
      quiet: {
        type: 'boolean',
        short: 'q',
        default: false,
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false,
      },
    },
    allowPositionals: true,
  });

  return { values, videoId: positionals[0] };
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
SORA Video Status Polling Script

Usage:
  tsx poll-status.ts <video_id> [options]

Arguments:
  video_id                    SORA job ID to monitor (required)

Options:
  -i, --interval <ms>         Polling interval in milliseconds (default: 10000)
  -q, --quiet                 Suppress progress updates (only show final status)
  -h, --help                  Show this help message

Examples:
  # Poll every 10 seconds with progress updates
  tsx poll-status.ts video_abc123

  # Poll every 5 seconds
  tsx poll-status.ts video_abc123 --interval 5000

  # Quiet mode (no progress updates)
  tsx poll-status.ts video_abc123 --quiet

Environment:
  OPENAI_API_KEY    OpenAI API key (required)

Output:
  Progress updates printed to stderr (unless --quiet)
  Final job status as JSON printed to stdout:
  {
    "id": "video_abc123",
    "status": "completed",
    "progress": 100,
    "model": "sora-2",
    "size": "1280x720",
    "seconds": "5"
  }
`);
}

/**
 * Draw a progress bar for terminal output
 */
function drawProgressBar(progress: number, width: number = 30): string {
  const filled = Math.floor((progress / 100) * width);
  const empty = width - filled;
  return `[${'='.repeat(filled)}${'-'.repeat(empty)}]`;
}

/**
 * Main execution
 */
async function main() {
  const { values, videoId } = parseArguments();

  // Show help if requested
  if (values.help) {
    showHelp();
    process.exit(0);
  }

  // Validate video ID
  if (!videoId) {
    console.error('Error: video_id argument is required');
    console.error('\nUse --help for usage information');
    process.exit(1);
  }

  // Validate API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  // Parse interval
  const interval = parseInt(values.interval!);
  if (isNaN(interval) || interval < 1000) {
    console.error('Error: --interval must be at least 1000 milliseconds');
    process.exit(1);
  }

  const quiet = values.quiet || false;

  try {
    const client = createSoraClient();

    if (!quiet) {
      console.error(`[SORA] Polling video status: ${videoId}`);
      console.error(`[SORA] Interval: ${interval}ms`);
      console.error('');
    }

    let lastProgress = -1;

    const finalJob = await client.pollUntilComplete(
      videoId,
      interval,
      (job) => {
        if (quiet) return;

        // Only update if progress changed
        const currentProgress = job.progress ?? 0;
        if (currentProgress === lastProgress) return;

        lastProgress = currentProgress;

        // Determine status text
        const statusText =
          job.status === 'queued'
            ? 'Queued'
            : job.status === 'in_progress'
            ? 'Processing'
            : job.status;

        // Draw progress bar
        const bar = drawProgressBar(currentProgress);

        // Print progress update (overwrite previous line)
        process.stderr.write(
          `\r${statusText}: ${bar} ${currentProgress.toFixed(1)}%`
        );
      }
    );

    // Move to new line after progress bar
    if (!quiet) {
      process.stderr.write('\n\n');
    }

    // Check final status
    if (finalJob.status === 'completed') {
      if (!quiet) {
        console.error(`[SORA] ✓ Video generation completed successfully`);
        console.error(`[SORA] Job ID: ${finalJob.id}`);
        console.error(`[SORA] Model: ${finalJob.model}`);
        console.error(`[SORA] Size: ${finalJob.size}`);
        console.error(`[SORA] Duration: ${finalJob.seconds}s`);
      }

      // Output final job status as JSON to stdout
      console.log(JSON.stringify(finalJob, null, 2));
    } else if (finalJob.status === 'failed') {
      if (!quiet) {
        console.error(`[SORA] ✗ Video generation failed`);
        console.error(`[SORA] Error: ${finalJob.error?.message || 'Unknown error'}`);
      }

      // Output error as JSON to stdout
      console.log(JSON.stringify(finalJob, null, 2));
      process.exit(1);
    } else {
      // Unexpected final status
      if (!quiet) {
        console.error(`[SORA] Unexpected status: ${finalJob.status}`);
      }

      console.log(JSON.stringify(finalJob, null, 2));
      process.exit(1);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (!quiet) {
      console.error('[SORA] Error polling status:', err.message);
      console.error('[SORA] Stack:', err.stack);
    }

    // Output error as JSON
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
