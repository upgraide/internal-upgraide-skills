/**
 * Downgrade video quality/resolution for web optimization
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { DowngradeQualityParams, QualityTarget, FFmpegResult } from './types';

const execAsync = promisify(exec);

/**
 * Quality preset configurations
 */
const QUALITY_PRESETS: Record<QualityTarget, { height: number; crf: number; bitrate: string }> = {
  '1080p': { height: 1080, crf: 20, bitrate: '192k' },
  '720p': { height: 720, crf: 23, bitrate: '128k' },
  '480p': { height: 480, crf: 28, bitrate: '96k' },
};

/**
 * Downgrade video quality/resolution
 *
 * Converts high-resolution video to lower resolution for:
 * - Faster processing
 * - Smaller file size
 * - Web delivery optimization
 *
 * @param params - Downgrade operation parameters
 * @returns FFmpeg execution result
 * @throws Error if conversion fails after retries
 */
export async function downgradeQuality(params: DowngradeQualityParams): Promise<FFmpegResult> {
  const { inputPath, outputPath, target } = params;

  console.log(`📉 Downgrading quality: ${inputPath} → ${target}`);

  const preset = QUALITY_PRESETS[target];
  const command = buildDowngradeCommand(inputPath, outputPath, preset);

  // Execute with retry logic
  const result = await executeWithRetry(command, 5);

  if (result.success) {
    console.log(`✅ Downgraded video saved to: ${outputPath}`);
  } else {
    console.error(`❌ Quality downgrade failed: ${result.error}`);
  }

  return result;
}

/**
 * Build FFmpeg downgrade command
 *
 * @param inputPath - Input video path
 * @param outputPath - Output video path
 * @param preset - Quality preset configuration
 * @returns Complete FFmpeg command string
 */
function buildDowngradeCommand(
  inputPath: string,
  outputPath: string,
  preset: { height: number; crf: number; bitrate: string }
): string {
  return [
    'ffmpeg',
    '-hide_banner',
    '-y', // Overwrite output file
    `-i "${inputPath}"`,
    '-c:v libx264', // H.264 codec
    '-preset medium', // Balanced speed/compression
    `-crf ${preset.crf}`, // Quality setting
    `-vf "scale=-2:${preset.height}"`, // Scale to target height (keep aspect ratio)
    '-c:a aac', // AAC audio codec
    `-b:a ${preset.bitrate}`, // Audio bitrate
    '-movflags +faststart', // Web optimization
    `"${outputPath}"`,
  ].join(' ');
}

/**
 * Execute FFmpeg command with exponential backoff retry
 *
 * @param command - FFmpeg command to execute
 * @param maxRetries - Maximum retry attempts
 * @returns Execution result
 */
async function executeWithRetry(command: string, maxRetries: number = 5): Promise<FFmpegResult> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { stdout, stderr } = await execAsync(command);

      return {
        success: true,
        stdout,
        stderr,
      };
    } catch (error: any) {
      lastError = error.message;

      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt - 1);
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} (waiting ${waitTime}s)...`);
        await sleep(waitTime * 1000);
      }
    }
  }

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
 * Get recommended quality target based on input resolution
 *
 * @param width - Input video width
 * @param height - Input video height
 * @returns Recommended quality target
 */
export function getRecommendedTarget(width: number, height: number): QualityTarget {
  if (height >= 1080) {
    return '720p'; // 4K/1080p → 720p
  } else if (height >= 720) {
    return '480p'; // 720p → 480p
  } else {
    return '480p'; // Already low, keep at 480p
  }
}
