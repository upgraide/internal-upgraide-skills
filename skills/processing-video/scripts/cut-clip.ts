/**
 * Accurate video clip cutting with frame-perfect precision
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { CutClipParams, FFmpegResult } from './types';

const execAsync = promisify(exec);

/**
 * Cut video clip with accurate re-encode method
 *
 * Uses the slow but reliable re-encode approach:
 * - -ss/-to AFTER -i for accurate frame positioning
 * - Re-encodes video (not stream copy) to prevent keyframe issues
 * - Supports second and millisecond precision
 *
 * @param params - Cut operation parameters
 * @returns FFmpeg execution result
 * @throws Error if cutting fails after retries
 */
export async function cutClip(params: CutClipParams): Promise<FFmpegResult> {
  const { inputPath, outputPath, startTime, endTime, precision = 'second' } = params;

  console.log(`✂️  Cutting clip: ${inputPath}`);
  console.log(`   Start: ${startTime}, End: ${endTime} (${precision} precision)`);

  // Build FFmpeg command (accurate method)
  const command = buildCutCommand(inputPath, outputPath, startTime, endTime);

  // Execute with retry logic
  const result = await executeWithRetry(command, 5);

  if (result.success) {
    console.log(`✅ Clip saved to: ${outputPath}`);
  } else {
    console.error(`❌ Clip cutting failed: ${result.error}`);
  }

  return result;
}

/**
 * Build FFmpeg cut command with accurate method
 *
 * @param inputPath - Input video path
 * @param outputPath - Output video path
 * @param startTime - Start timestamp
 * @param endTime - End timestamp
 * @returns Complete FFmpeg command string
 */
function buildCutCommand(
  inputPath: string,
  outputPath: string,
  startTime: string,
  endTime: string
): string {
  // Accurate method: -ss/-to AFTER -i, re-encode (not -c copy)
  return [
    'ffmpeg',
    '-hide_banner',
    '-y', // Overwrite output file
    `-i "${inputPath}"`,
    `-ss ${startTime}`,
    `-to ${endTime}`,
    '-c:v libx264', // Re-encode video (accurate)
    '-preset ultrafast', // Fast encoding
    '-crf 18', // High quality
    '-c:a aac', // Re-encode audio
    '-movflags +faststart', // Web optimization
    `"${outputPath}"`,
  ].join(' ');
}

/**
 * Execute FFmpeg command with exponential backoff retry
 *
 * @param command - FFmpeg command to execute
 * @param maxRetries - Maximum retry attempts (default: 5)
 * @returns Execution result
 */
async function executeWithRetry(command: string, maxRetries: number = 5): Promise<FFmpegResult> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { stdout, stderr } = await execAsync(command);

      // FFmpeg writes progress to stderr, not an error
      return {
        success: true,
        stdout,
        stderr,
      };
    } catch (error: any) {
      lastError = error.message;

      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} (waiting ${waitTime}s)...`);
        await sleep(waitTime * 1000);
      }
    }
  }

  // All retries exhausted
  return {
    success: false,
    stdout: '',
    stderr: '',
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
  };
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate timestamp format
 *
 * @param timestamp - Timestamp string to validate
 * @returns True if valid format
 */
export function validateTimestamp(timestamp: string): boolean {
  // Accepts: MM:SS, HH:MM:SS, HH:MM:SS.mmm, or seconds (float)
  const patterns = [
    /^\d+(\.\d+)?$/, // Seconds: 45 or 45.5
    /^\d{1,2}:\d{2}$/, // MM:SS: 01:30
    /^\d{1,2}:\d{2}:\d{2}$/, // HH:MM:SS: 00:01:30
    /^\d{1,2}:\d{2}:\d{2}\.\d{1,3}$/, // HH:MM:SS.mmm: 00:01:30.500
  ];

  return patterns.some((pattern) => pattern.test(timestamp));
}

/**
 * Convert seconds to timestamp string
 *
 * @param seconds - Time in seconds (float)
 * @param precision - Output precision ('second' or 'millisecond')
 * @returns Formatted timestamp (HH:MM:SS or HH:MM:SS.mmm)
 */
export function secondsToTimestamp(seconds: number, precision: 'second' | 'millisecond' = 'second'): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  if (precision === 'millisecond') {
    const ss = Math.floor(secs).toString().padStart(2, '0');
    const mmm = Math.round((secs - Math.floor(secs)) * 1000)
      .toString()
      .padStart(3, '0');
    return `${hh}:${mm}:${ss}.${mmm}`;
  } else {
    const ss = Math.round(secs).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}
