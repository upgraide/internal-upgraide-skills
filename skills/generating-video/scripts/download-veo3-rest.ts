#!/usr/bin/env tsx

/**
 * VEO3 Video Download Script (REST API)
 *
 * Downloads a completed VEO3 video using the REST API.
 *
 * Usage:
 *   tsx download-veo3-rest.ts <operation-name-or-json-file>
 *
 * Options:
 *   --output <path>       Output directory (default: outputs)
 *   --filename <name>     Custom filename without extension (default: auto-generated)
 *
 * Output:
 *   JSON object with file path and metadata printed to stdout
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';
import { writeFileSync, mkdirSync, existsSync, readFileSync, createWriteStream } from 'node:fs';
import { join, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Parse command-line arguments
 */
function parseArguments() {
  const { values, positionals } = parseArgs({
    options: {
      output: {
        type: 'string',
        short: 'o',
        default: 'outputs',
      },
      filename: {
        type: 'string',
        short: 'f',
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
    operationNameOrFile: positionals[0],
    outputDir: values.output!,
    filename: values.filename,
    help: values.help,
  };
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
VEO3 Video Download Script (REST API)

Usage:
  tsx download-veo3-rest.ts <operation-name-or-json-file> [options]

Arguments:
  operation-name-or-json-file    Operation name or path to JSON file from poll-veo3-rest.ts

Options:
  -o, --output <path>     Output directory (default: outputs)
  -f, --filename <name>   Custom filename without extension (default: auto-generated)
  -h, --help              Show this help message

Examples:
  # Download using operation name
  tsx download-veo3-rest.ts models/veo-3.1-generate-preview/operations/abc123

  # Download using JSON file from polling
  tsx download-veo3-rest.ts operation-result.json

  # Custom output location
  tsx download-veo3-rest.ts models/veo-3.1-generate-preview/operations/abc123 --output outputs

Environment:
  GOOGLE_GENAI_API_KEY    Google GenAI API key (required)

Output:
  JSON object with file information printed to stdout
`);
}

/**
 * Generate filename from operation name
 */
function generateFilename(operationName: string): string {
  const parts = operationName.split('/');
  const id = parts[parts.length - 1];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `veo3-${id}-${timestamp}`;
}

/**
 * Get operation status
 */
async function getOperation(operationName: string, apiKey: string): Promise<any> {
  const url = `${BASE_URL}/${operationName}`;
  const response = await fetch(url, {
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
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
  if (!args.operationNameOrFile) {
    console.error('Error: Operation name or JSON file is required');
    console.error('\nUsage: tsx download-veo3-rest.ts <operation-name-or-json-file>');
    console.error('Use --help for more information');
    process.exit(1);
  }

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.error('Error: GOOGLE_GENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY!;
    let operation: any;
    let operationName: string;

    // Check if input is a JSON file or operation name
    if (args.operationNameOrFile.endsWith('.json') && existsSync(args.operationNameOrFile)) {
      console.error(`[VEO3] Loading operation from file: ${args.operationNameOrFile}`);
      const fileContent = readFileSync(args.operationNameOrFile, 'utf-8');
      operation = JSON.parse(fileContent);
      operationName = operation.name;
    } else {
      operationName = args.operationNameOrFile;
      console.error(`[VEO3] Fetching operation status: ${operationName}`);
      operation = await getOperation(operationName, apiKey);
    }

    // Verify operation is complete
    if (!operation.done) {
      console.error('[VEO3] Error: Operation is not completed yet');
      console.error('[VEO3] Use poll-veo3-rest.ts to wait for completion first');
      process.exit(1);
    }

    if (operation.error) {
      console.error(`[VEO3] Error: Operation failed: ${operation.error.message || JSON.stringify(operation.error)}`);
      process.exit(1);
    }

    // Extract video URI from response
    const videoUri = operation.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (!videoUri) {
      console.error('[VEO3] Error: No video URI found in operation response');
      console.error('[VEO3] Response:', JSON.stringify(operation.response, null, 2));
      process.exit(1);
    }

    console.error(`[VEO3] Video URI: ${videoUri}`);

    // Ensure output directory exists
    const outputDir = resolve(args.outputDir);
    if (!existsSync(outputDir)) {
      console.error(`[VEO3] Creating output directory: ${outputDir}`);
      mkdirSync(outputDir, { recursive: true });
    }

    // Generate or use custom filename
    const baseFilename = args.filename || generateFilename(operationName);
    const filename = `${baseFilename}.mp4`;
    const filePath = join(outputDir, filename);

    console.error(`[VEO3] Downloading video to: ${filePath}`);

    // Download the video
    const videoResponse = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoResponse.ok) {
      throw new Error(`HTTP ${videoResponse.status}: ${await videoResponse.text()}`);
    }

    if (!videoResponse.body) {
      throw new Error('No response body');
    }

    // Stream the video to file
    await pipeline(
      Readable.fromWeb(videoResponse.body as any),
      createWriteStream(filePath)
    );

    console.error('[VEO3] Download completed successfully');

    // Get file size
    const fs = await import('node:fs/promises');
    const stats = await fs.stat(filePath);

    // Output metadata as JSON to stdout
    const metadata = {
      operationName,
      filePath: resolve(filePath),
      filename: filename,
      fileSize: stats.size,
      videoUri,
      createdAt: operation.metadata?.createTime || new Date().toISOString(),
      downloadedAt: new Date().toISOString(),
    };

    console.log(JSON.stringify(metadata, null, 2));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[VEO3] Error downloading video:', err.message);

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
