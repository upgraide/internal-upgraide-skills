/**
 * Remotion Configuration Constants
 *
 * Default values for Instagram Reels / TikTok video format (9:16)
 */

/** Video dimensions for Instagram/TikTok (9:16 aspect ratio) */
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Frames per second */
export const FPS = 30;

/** Entry point for Remotion CLI */
export const ENTRY_POINT = 'src/remotion/index.ts';

/** Default render options for Instagram/TikTok compatibility */
export const DEFAULT_RENDER_OPTIONS = {
  codec: 'h264' as const,
  audioCodec: 'aac' as const,
  crf: 18, // Lower = better quality (18 = visually lossless)
  jpegQuality: 90,
  audioBitrate: '192k',
  concurrency: 4,
} as const;

/** Output directory for rendered videos */
export const OUTPUT_DIR = 'outputs';

/**
 * Generate timestamped output filename
 */
export function generateOutputFilename(baseName: string): string {
  const timestamp = Date.now();
  return `${OUTPUT_DIR}/${baseName}-${timestamp}.mp4`;
}
