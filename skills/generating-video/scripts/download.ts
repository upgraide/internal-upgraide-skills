#!/usr/bin/env tsx

/**
 * SORA Video Download Script
 *
 * Downloads a completed video to the workspace/generated directory.
 *
 * Usage:
 *   tsx download.ts <video_id> [--output ./workspace/generated] [--variant video]
 *
 * Output:
 *   Downloaded video file and metadata JSON
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createSoraClient } from './utils/sora-client.js';
import type { GeneratedVideo } from '../../../src/types.js';

/**
 * Parse command-line arguments
 */
function parseArguments() {
  const { values, positionals } = parseArgs({
    options: {
      output: {
        type: 'string',
        short: 'o',
        default: './workspace/generated',
      },
      variant: {
        type: 'string',
        short: 'v',
        default: 'video',
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
SORA Video Download Script

Usage:
  tsx download.ts <video_id> [options]

Arguments:
  video_id                    SORA job ID to download (required)

Options:
  -o, --output <directory>    Output directory (default: ./workspace/generated)
  -v, --variant <type>        Content variant: video, thumbnail, spritesheet (default: video)
  -h, --help                  Show this help message

Examples:
  # Download video to default location
  tsx download.ts video_abc123

  # Download to custom directory
  tsx download.ts video_abc123 --output ./outputs

  # Download thumbnail instead of video
  tsx download.ts video_abc123 --variant thumbnail

Environment:
  OPENAI_API_KEY    OpenAI API key (required)

Output:
  Files created:
    workspace/generated/[video_id].mp4       - The video file
    workspace/generated/[video_id].json      - Metadata JSON

  JSON metadata printed to stdout:
  {
    "jobId": "video_abc123",
    "filePath": "/path/to/video.mp4",
    "prompt": "...",
    "model": "sora-2",
    "duration": 5,
    "fileSize": 1234567,
    "size": "1280x720",
    "created_at": "2025-11-17T...",
    "downloaded_at": "2025-11-17T..."
  }
`);
}

/**
 * Get file extension for variant type
 */
function getFileExtension(variant: string): string {
  switch (variant) {
    case 'video':
      return 'mp4';
    case 'thumbnail':
      return 'webp';
    case 'spritesheet':
      return 'jpg';
    default:
      return 'bin';
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

  // Validate variant
  const variant = values.variant!;
  if (!['video', 'thumbnail', 'spritesheet'].includes(variant)) {
    console.error('Error: --variant must be video, thumbnail, or spritesheet');
    process.exit(1);
  }

  const outputDir = resolve(values.output!);

  try {
    const client = createSoraClient();

    console.error(`[SORA] Downloading ${variant}: ${videoId}`);

    // First, get the job status to retrieve metadata
    console.error('[SORA] Fetching job metadata...');
    const job = await client.getVideoStatus(videoId);

    // Check if job is completed
    if (job.status !== 'completed') {
      console.error(
        `[SORA] Error: Video is not completed (status: ${job.status})`
      );
      if (job.status === 'failed' && job.error) {
        console.error(`[SORA] Error: ${job.error.message}`);
      }
      process.exit(1);
    }

    // Download the video content
    console.error('[SORA] Downloading content...');
    const content = await client.downloadVideo(
      videoId,
      variant as 'video' | 'thumbnail' | 'spritesheet'
    );

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Determine output filename
    const fileExtension = getFileExtension(variant);
    const fileName = `${videoId}.${fileExtension}`;
    const filePath = join(outputDir, fileName);

    // Write the file
    console.error(`[SORA] Writing to: ${filePath}`);
    await writeFile(filePath, Buffer.from(content));

    // Get file size
    const fileSize = content.byteLength;

    console.error(
      `[SORA] ✓ Download complete (${formatBytes(fileSize)})`
    );

    // Create metadata object
    const metadata: GeneratedVideo = {
      jobId: job.id,
      filePath: resolve(filePath),
      prompt: '', // Not available from job status, would need to be passed separately
      model: job.model,
      duration: parseInt(job.seconds),
      fileSize,
      size: job.size,
      created_at: new Date(job.created_at * 1000).toISOString(),
      downloaded_at: new Date().toISOString(),
    };

    // Write metadata JSON
    const metadataPath = join(outputDir, `${videoId}.json`);
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.error(`[SORA] Metadata saved to: ${metadataPath}`);
    console.error('');
    console.error(`[SORA] Summary:`);
    console.error(`[SORA]   Job ID:    ${metadata.jobId}`);
    console.error(`[SORA]   Model:     ${metadata.model}`);
    console.error(`[SORA]   Size:      ${metadata.size}`);
    console.error(`[SORA]   Duration:  ${metadata.duration}s`);
    console.error(`[SORA]   File Size: ${formatBytes(metadata.fileSize)}`);
    console.error(`[SORA]   File Path: ${metadata.filePath}`);

    // Output metadata as JSON to stdout
    console.log(JSON.stringify(metadata, null, 2));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[SORA] Error downloading video:', err.message);
    console.error('[SORA] Stack:', err.stack);

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
