/**
 * Extract video metadata using ffprobe
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { VideoMetadata } from './types';

const execAsync = promisify(exec);

/**
 * Extract complete video metadata from file
 *
 * @param inputPath - Absolute path to video file
 * @returns Video metadata (duration, resolution, codec, bitrate, fps)
 * @throws Error if ffprobe fails or file doesn't exist
 */
export async function getMetadata(inputPath: string): Promise<VideoMetadata> {
  console.log(`📊 Extracting metadata from: ${inputPath}`);

  // Use ffprobe to get JSON output with all metadata
  const command = `ffprobe -v error -show_format -show_streams -print_format json "${inputPath}"`;

  try {
    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);

    // Extract video stream (first video stream)
    const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
    if (!videoStream) {
      throw new Error('No video stream found in file');
    }

    // Parse duration (from format or stream)
    const duration = parseFloat(data.format.duration || videoStream.duration || '0');

    // Parse frame rate (may be in "30/1" format)
    let fps = 30; // default
    if (videoStream.r_frame_rate) {
      const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
      fps = den ? num / den : num;
    }

    const metadata: VideoMetadata = {
      duration,
      width: videoStream.width || 0,
      height: videoStream.height || 0,
      codec: videoStream.codec_name || 'unknown',
      bitrate: parseInt(data.format.bit_rate || videoStream.bit_rate || '0') / 1000, // Convert to kb/s
      fps,
    };

    console.log(`✅ Metadata extracted: ${metadata.width}x${metadata.height}, ${metadata.duration.toFixed(2)}s, ${metadata.codec}`);

    return metadata;
  } catch (error: any) {
    const errorMsg = `Failed to extract metadata: ${error.message}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

/**
 * Get just the duration (faster than full metadata)
 *
 * @param inputPath - Absolute path to video file
 * @returns Duration in seconds (float)
 */
export async function getDuration(inputPath: string): Promise<number> {
  const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;

  try {
    const { stdout } = await execAsync(command);
    const duration = parseFloat(stdout.trim());
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    return duration;
  } catch (error: any) {
    throw new Error(`Failed to get duration: ${error.message}`);
  }
}

/**
 * Get just the resolution (faster than full metadata)
 *
 * @param inputPath - Absolute path to video file
 * @returns Object with width and height
 */
export async function getResolution(inputPath: string): Promise<{ width: number; height: number }> {
  const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${inputPath}"`;

  try {
    const { stdout } = await execAsync(command);
    const [width, height] = stdout.trim().split(',').map(Number);
    console.log(`📐 Resolution: ${width}x${height}`);
    return { width, height };
  } catch (error: any) {
    throw new Error(`Failed to get resolution: ${error.message}`);
  }
}
