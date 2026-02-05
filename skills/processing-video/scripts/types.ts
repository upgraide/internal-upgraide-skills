/**
 * Shared types for FFmpeg skill operations
 */

/**
 * Video metadata extracted from file
 */
export interface VideoMetadata {
  duration: number;        // Duration in seconds (float)
  width: number;           // Video width in pixels
  height: number;          // Video height in pixels
  codec: string;           // Video codec name (e.g., "h264")
  bitrate: number;         // Bitrate in kb/s
  fps: number;             // Frame rate
}

/**
 * Timestamp format options for clip cutting
 */
export type TimestampPrecision = 'second' | 'millisecond';

/**
 * Cut clip operation parameters
 */
export interface CutClipParams {
  inputPath: string;        // Absolute path to input video
  outputPath: string;       // Absolute path to output video
  startTime: string;        // Start timestamp (MM:SS or HH:MM:SS or HH:MM:SS.mmm)
  endTime: string;          // End timestamp (absolute, not duration)
  precision?: TimestampPrecision;  // Default: 'second'
}

/**
 * Quality/resolution target for downgrading
 */
export type QualityTarget = '1080p' | '720p' | '480p';

/**
 * Downgrade quality operation parameters
 */
export interface DowngradeQualityParams {
  inputPath: string;        // Absolute path to input video
  outputPath: string;       // Absolute path to output video
  target: QualityTarget;    // Target resolution
}

/**
 * FFmpeg execution result
 */
export interface FFmpegResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}
