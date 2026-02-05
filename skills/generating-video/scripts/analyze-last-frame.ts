#!/usr/bin/env tsx

/**
 * Analyze Last Frame Helper
 *
 * Extracts and analyzes the last frame of a video to inform better extension prompts.
 *
 * Usage:
 *   tsx analyze-last-frame.ts --video public/broll/video.mp4
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';
import { execSync } from 'node:child_process';
import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Parse command-line arguments
 */
function parseArguments() {
  const { values } = parseArgs({
    options: {
      video: {
        type: 'string',
        short: 'v',
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
Analyze Last Frame Helper

Extracts the last frame from a video and analyzes it to help write better extension prompts.

Usage:
  tsx analyze-last-frame.ts --video <path>

Options:
  -v, --video <path>    Path to video file (required)
  -h, --help            Show this help message

Output:
  JSON with last frame analysis and suggested continuation context
`);
}

/**
 * Extract last frame from video using ffmpeg
 */
function extractLastFrame(videoPath: string): string {
  const tempFrame = join(tmpdir(), `last-frame-${Date.now()}.jpg`);

  console.error('[ANALYZE] Extracting last frame with ffmpeg...');

  try {
    // Extract last frame: seek to end minus 0.1 seconds, take one frame
    execSync(
      `ffmpeg -sseof -0.1 -i "${videoPath}" -vframes 1 -q:v 2 "${tempFrame}" -y`,
      { stdio: ['pipe', 'pipe', 'inherit'] }
    );

    if (!existsSync(tempFrame)) {
      throw new Error('Failed to extract frame');
    }

    console.error(`[ANALYZE] Frame extracted to: ${tempFrame}`);
    return tempFrame;
  } catch (error) {
    throw new Error(`ffmpeg extraction failed: ${error}`);
  }
}

/**
 * Analyze frame with Gemini Vision
 */
async function analyzeFrame(framePath: string): Promise<string> {
  console.error('[ANALYZE] Analyzing frame with Gemini Vision...');

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
  });

  // Read frame as base64
  const imageBuffer = readFileSync(framePath);
  const imageBase64 = imageBuffer.toString('base64');

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: [
      {
        parts: [
          {
            text: `Analyze this video frame in detail. Describe:
1. Main subject position and pose
2. Camera angle and perspective
3. Motion blur or direction of movement
4. Background elements and environment
5. Lighting and atmosphere
6. What action appears to be happening next

Be specific and concise. This will help create a coherent video extension prompt.`,
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
        ],
      },
    ],
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to analyze frame';
}

/**
 * Main execution
 */
async function main() {
  const args = parseArguments();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.video) {
    console.error('Error: --video is required');
    console.error('\nUse --help for usage information');
    process.exit(1);
  }

  if (!existsSync(args.video)) {
    console.error(`Error: Video file not found: ${args.video}`);
    process.exit(1);
  }

  let tempFrame: string | null = null;

  try {
    // Extract last frame
    tempFrame = extractLastFrame(args.video);

    // Analyze with vision
    const analysis = await analyzeFrame(tempFrame);

    console.error('[ANALYZE] Analysis complete\n');

    // Output results
    console.log(JSON.stringify({
      videoPath: args.video,
      lastFramePath: tempFrame,
      analysis,
      suggestion: "Use this analysis to write a coherent extension prompt that continues from the current scene state."
    }, null, 2));

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[ANALYZE] Error:', err.message);

    console.log(JSON.stringify({
      error: {
        message: err.message,
        stack: err.stack,
      }
    }, null, 2));

    process.exit(1);
  } finally {
    // Cleanup temp frame
    if (tempFrame && existsSync(tempFrame)) {
      unlinkSync(tempFrame);
      console.error('[ANALYZE] Cleaned up temporary frame');
    }
  }
}

main();
