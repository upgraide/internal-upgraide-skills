#!/usr/bin/env npx tsx

/**
 * Generate video from image using Wan 2.5 i2v via Replicate
 *
 * This version works WITHOUT audio - just image + prompt.
 * Supports public figures and human faces.
 *
 * Usage:
 *   npx tsx generate-wan25-i2v.ts \
 *     --image public/broll/portrait.png \
 *     --prompt "Athletic man intensely focused, slight head movement, cinematic" \
 *     [--duration 5|10] \
 *     [--resolution 480p|720p|1080p] \
 *     [--output public/broll/output.mp4]
 */

import Replicate from "replicate";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const replicate = new Replicate();

// Parse command line arguments
function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      }
    }
  }

  return parsed;
}

// Convert local file to data URI
async function fileToDataUri(filePath: string): Promise<string> {
  const absolutePath = path.resolve(filePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const buffer = await readFile(absolutePath);
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };

  const mimeType = mimeTypes[ext];
  if (!mimeType) {
    throw new Error(`Unsupported image type: ${ext}. Use jpg, png, or webp.`);
  }

  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Generate timestamp-based filename
function generateOutputPath(basePath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dir = path.dirname(basePath);
  const ext = path.extname(basePath);
  const name = path.basename(basePath, ext);
  return path.join(dir, `${name}-${timestamp}${ext}`);
}

// Main generation function
async function generateVideo(params: {
  image: string;
  prompt: string;
  duration: number;
  resolution: string;
  output: string;
  audio?: string;
}) {
  console.log('\n=== Wan 2.5 Image-to-Video Generation ===\n');
  console.log(`Image: ${params.image}`);
  console.log(`Prompt: ${params.prompt}`);
  console.log(`Duration: ${params.duration}s`);
  console.log(`Resolution: ${params.resolution}`);
  console.log(`Output: ${params.output}`);
  if (params.audio) {
    console.log(`Audio: ${params.audio}`);
  }
  console.log('');

  // Convert image to data URI
  console.log('Converting image to data URI...');
  const imageDataUri = await fileToDataUri(params.image);

  // Prepare input
  const input: Record<string, any> = {
    image: imageDataUri,
    prompt: params.prompt,
    duration: params.duration,
    resolution: params.resolution,
    enable_prompt_expansion: true,
    negative_prompt: "blurry, low quality, distorted, deformed"
  };

  // Add audio if provided
  if (params.audio) {
    console.log('Converting audio to data URI...');
    const audioDataUri = await fileToDataUri(params.audio);
    input.audio = audioDataUri;
  }

  console.log('\nStarting video generation...');
  console.log('This typically takes 5-10 minutes. Please wait...\n');

  const startTime = Date.now();
  let lastLog = startTime;

  // Progress indicator
  const progressInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    process.stdout.write(`\r⏳ Generating... ${minutes}m ${seconds}s elapsed`);
  }, 1000);

  try {
    const output = await replicate.run("wan-video/wan-2.5-i2v", { input });

    clearInterval(progressInterval);
    console.log('\n');

    // Get video URL
    let videoUrl: string;
    if (typeof output === 'object' && output !== null && 'url' in output) {
      videoUrl = typeof (output as any).url === 'function'
        ? (output as any).url()
        : (output as any).url;
    } else if (typeof output === 'string') {
      videoUrl = output;
    } else {
      throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
    }

    console.log(`✓ Video generated!`);
    console.log(`  URL: ${videoUrl.substring(0, 80)}...`);

    // Ensure output directory exists
    const outputDir = path.dirname(params.output);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // Download the video
    console.log('\nDownloading video...');
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(params.output, buffer);

    const fileSizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✓ Video saved to: ${params.output}`);
    console.log(`  File size: ${fileSizeMB} MB`);
    console.log(`  Total time: ${totalTime}s`);

    // Output JSON for scripting
    const result = {
      success: true,
      filePath: params.output,
      staticFile: params.output.replace('public/', ''),
      remotionUsage: `staticFile('${params.output.replace('public/', '')}')`,
      duration: params.duration,
      resolution: params.resolution,
      fileSize: buffer.length,
      generationTime: parseFloat(totalTime),
      videoUrl: videoUrl
    };

    console.log('\n' + JSON.stringify(result, null, 2));

    return result;

  } catch (error: any) {
    clearInterval(progressInterval);
    console.log('\n');

    const errorResult = {
      success: false,
      error: error.message || 'Unknown error',
      hint: error.message?.includes('content')
        ? 'Try adjusting the prompt to avoid content policy issues'
        : 'Check your REPLICATE_API_TOKEN and try again'
    };

    console.error('✗ Generation failed:', error.message);
    console.log('\n' + JSON.stringify(errorResult, null, 2));

    throw error;
  }
}

// Main execution
async function main() {
  const args = parseArgs();

  // Validate required arguments
  if (!args.image || !args.prompt) {
    console.log('Wan 2.5 Image-to-Video Generator');
    console.log('================================\n');
    console.log('Usage:');
    console.log('  npx tsx generate-wan25-i2v.ts \\');
    console.log('    --image <path>              # Input image (required)');
    console.log('    --prompt <description>      # Motion/action prompt (required)');
    console.log('    [--duration 5|10]           # Video duration in seconds (default: 5)');
    console.log('    [--resolution 480p|720p|1080p]  # Output resolution (default: 720p)');
    console.log('    [--output <path>]           # Output path (default: public/broll/wan25-output.mp4)');
    console.log('    [--audio <path>]            # Optional audio for lip-sync');
    console.log('\nExample:');
    console.log('  npx tsx generate-wan25-i2v.ts \\');
    console.log('    --image public/broll/athlete-portrait.png \\');
    console.log('    --prompt "Athlete turns head slowly, intense gaze, dramatic lighting" \\');
    console.log('    --duration 5 \\');
    console.log('    --output public/broll/athlete-video.mp4');
    process.exit(1);
  }

  const duration = parseInt(args.duration || '5');
  const resolution = args.resolution || '720p';
  const output = args.output || generateOutputPath('public/broll/wan25-output.mp4');

  // Validate duration
  if (![5, 10].includes(duration)) {
    console.error('Error: duration must be 5 or 10 seconds');
    process.exit(1);
  }

  // Validate resolution
  if (!['480p', '720p', '1080p'].includes(resolution)) {
    console.error('Error: resolution must be 480p, 720p, or 1080p');
    process.exit(1);
  }

  try {
    await generateVideo({
      image: args.image,
      prompt: args.prompt,
      duration,
      resolution,
      output,
      audio: args.audio
    });
  } catch (error) {
    process.exit(1);
  }
}

main();
