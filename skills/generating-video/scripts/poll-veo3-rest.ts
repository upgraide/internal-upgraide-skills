#!/usr/bin/env tsx

/**
 * VEO3 Operation Polling Script (REST API)
 *
 * Polls a VEO3 video generation operation using the REST API until it completes.
 *
 * Usage:
 *   tsx poll-veo3-rest.ts <operation-name>
 *   tsx poll-veo3-rest.ts models/veo-3.1-generate-preview/operations/abc123
 *
 * Options:
 *   --interval <ms>    Polling interval in milliseconds (default: 10000)
 *   --quiet           Suppress progress updates to stderr
 *
 * Output:
 *   JSON object with final operation status printed to stdout
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

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

  return {
    operationName: positionals[0],
    interval: parseInt(values.interval!),
    quiet: values.quiet,
    help: values.help,
  };
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
VEO3 Operation Polling Script (REST API)

Usage:
  tsx poll-veo3-rest.ts <operation-name> [options]

Arguments:
  operation-name          Operation name from generate-veo3.ts

Options:
  -i, --interval <ms>    Polling interval in milliseconds (default: 10000)
  -q, --quiet            Suppress progress updates to stderr
  -h, --help             Show this help message

Examples:
  # Poll with default 10s interval
  tsx poll-veo3-rest.ts models/veo-3.1-generate-preview/operations/abc123

  # Poll every 5 seconds
  tsx poll-veo3-rest.ts models/veo-3.1-generate-preview/operations/abc123 --interval 5000

Environment:
  GOOGLE_GENAI_API_KEY    Google GenAI API key (required)

Output:
  Final operation status printed to stdout as JSON
`);
}

/**
 * Format elapsed time
 */
function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
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
  if (!args.operationName) {
    console.error('Error: Operation name is required');
    console.error('\nUsage: tsx poll-veo3-rest.ts <operation-name>');
    console.error('Use --help for more information');
    process.exit(1);
  }

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.error('Error: GOOGLE_GENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    const url = `${BASE_URL}/${args.operationName}`;

    if (!args.quiet) {
      console.error(`[VEO3] Polling operation: ${args.operationName}`);
      console.error(`[VEO3] Interval: ${args.interval}ms`);
    }

    const startTime = Date.now();
    let pollCount = 0;
    let operation: any = null;

    // Poll until operation is complete
    while (true) {
      pollCount++;
      const elapsed = Date.now() - startTime;

      if (!args.quiet) {
        console.error(`[VEO3] Poll #${pollCount} (elapsed: ${formatElapsedTime(elapsed)}) - Checking status...`);
      }

      // Fetch operation status via REST API
      const response = await fetch(url, {
        headers: {
          'x-goog-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      operation = await response.json();

      // Check if done
      if (operation.done === true) {
        if (!args.quiet) {
          console.error(`[VEO3] Operation completed in ${formatElapsedTime(elapsed)}`);
        }
        break;
      }

      // Check for error
      if (operation.error) {
        if (!args.quiet) {
          console.error(`[VEO3] Operation failed: ${operation.error.message || JSON.stringify(operation.error)}`);
        }
        console.log(JSON.stringify(operation, null, 2));
        process.exit(1);
      }

      if (!args.quiet) {
        console.error(`[VEO3] Still processing... (waiting ${args.interval / 1000}s)`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, args.interval));
    }

    // Output final operation info as JSON to stdout
    console.log(JSON.stringify(operation, null, 2));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[VEO3] Error polling operation:', err.message);

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
