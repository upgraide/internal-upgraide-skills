#!/usr/bin/env tsx

/**
 * Generate video from image and audio using Wan 2.5 i2v API
 *
 * Usage:
 *   tsx generate-wan25.ts \
 *     --image inputs/first-frame.png \
 *     --audio inputs/narration.mp3 \
 *     --prompt "Cinematic scene description with camera movement, subject action, lighting" \
 *     [--duration 3-10] \
 *     [--resolution 480p|720p|1080p] \
 *     [--output outputs/wan25-output.mp4]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }

  return parsed;
}

// Validate required environment variables
function validateEnv() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    console.error('Error: DASHSCOPE_API_KEY environment variable not set');
    console.error('Add to .env file in project root');
    process.exit(1);
  }
  return apiKey;
}

// Read file and convert to base64
function fileToBase64(filePath: string): string {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const base64 = fileBuffer.toString('base64');

  // Detect MIME type
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
  };

  const mimeType = mimeTypes[ext];
  if (!mimeType) {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  return `data:${mimeType};base64,${base64}`;
}

// Create avatar generation task
async function createTask(params: {
  image: string;
  audio: string;
  prompt: string;
  duration: number;
  resolution: string;
  promptExtend: boolean;
  watermark: boolean;
  seed?: number;
  apiKey: string;
}) {
  const url = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis';

  // Convert files to base64
  console.log('Converting image to base64...');
  const imgUrl = fileToBase64(params.image);

  console.log('Converting audio to base64...');
  const audioUrl = fileToBase64(params.audio);

  const requestBody = {
    model: 'wan2.5-i2v-preview',
    input: {
      prompt: params.prompt,
      img_url: imgUrl,
      audio_url: audioUrl
    },
    parameters: {
      resolution: params.resolution.toUpperCase(),
      duration: params.duration,
      prompt_extend: params.promptExtend,
      watermark: params.watermark,
      ...(params.seed !== undefined && { seed: params.seed })
    }
  };

  console.log('\nCreating avatar generation task...');
  console.log(`Prompt: "${params.prompt}"`);
  console.log(`Duration: ${params.duration}s`);
  console.log(`Resolution: ${params.resolution}`);
  console.log(`Prompt extend: ${params.promptExtend}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    },
    body: JSON.stringify(requestBody)
  });

  const result = await response.json();

  if (!response.ok || result.code) {
    throw new Error(`API Error: ${result.code || response.status} - ${result.message || response.statusText}`);
  }

  return result;
}

// Poll task status
async function pollTaskStatus(taskId: string, apiKey: string, maxAttempts = 60) {
  const url = `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`;

  console.log(`\nPolling task status (task_id: ${taskId})...`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15s between polls

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const result = await response.json();

    if (!response.ok || result.code) {
      throw new Error(`Poll Error: ${result.code || response.status} - ${result.message || response.statusText}`);
    }

    const status = result.output.task_status;
    console.log(`[${new Date().toISOString()}] Status: ${status}`);

    if (status === 'SUCCEEDED') {
      console.log('✓ Generation completed successfully!');
      return result;
    }

    if (status === 'FAILED') {
      throw new Error(`Task failed: ${result.output.message || 'Unknown error'}`);
    }

    if (status === 'CANCELED') {
      throw new Error('Task was canceled');
    }

    // Continue polling for PENDING or RUNNING
  }

  throw new Error('Task timeout: exceeded maximum polling attempts');
}

// Download video from URL
async function downloadVideo(videoUrl: string, outputPath: string) {
  console.log(`\nDownloading video...`);
  console.log(`URL: ${videoUrl.substring(0, 80)}...`);

  const response = await fetch(videoUrl);

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);

  const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✓ Video saved to: ${outputPath}`);
  console.log(`  File size: ${fileSizeMB} MB`);

  return buffer.length;
}

// Save metadata
function saveMetadata(outputPath: string, data: any) {
  const metadataPath = outputPath.replace(/\.[^.]+$/, '-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2));
  console.log(`✓ Metadata saved to: ${metadataPath}`);
}

// Main execution with retry logic
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  operation = 'Operation'
): Promise<T> {
  const delays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      if (isLastAttempt) {
        throw error;
      }

      const delay = delays[attempt];
      console.error(`\n${operation} failed (attempt ${attempt + 1}/${maxRetries}): ${error}`);
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`${operation} failed after ${maxRetries} attempts`);
}

// Main function
async function main() {
  const args = parseArgs();

  // Validate required arguments
  if (!args.image || !args.audio || !args.prompt) {
    console.error('Usage: tsx generate-avatar.ts \\');
    console.error('  --image <path> \\');
    console.error('  --audio <path> \\');
    console.error('  --prompt <description> \\');
    console.error('  [--duration 3-10] \\');
    console.error('  [--resolution 480p|720p|1080p] \\');
    console.error('  [--output <path>] \\');
    console.error('  [--no-prompt-extend] \\');
    console.error('  [--watermark] \\');
    console.error('  [--seed <number>]');
    process.exit(1);
  }

  const apiKey = validateEnv();

  const image = args.image as string;
  const audio = args.audio as string;
  const prompt = args.prompt as string;
  const duration = parseInt(args.duration as string || '5');
  const resolution = (args.resolution as string || '720p').toLowerCase();
  const output = args.output as string || 'inputs/avatar.mp4';
  const promptExtend = !args['no-prompt-extend'];
  const watermark = !!args.watermark;
  const seed = args.seed ? parseInt(args.seed as string) : undefined;

  // Validate duration and resolution
  if (duration < 3 || duration > 10) {
    console.error('Error: duration must be between 3 and 10 seconds');
    process.exit(1);
  }

  if (!['480p', '720p', '1080p'].includes(resolution)) {
    console.error('Error: resolution must be 480p, 720p, or 1080p');
    process.exit(1);
  }

  console.log('=== Wan 2.5 Video Generation ===\n');
  console.log(`Image: ${image}`);
  console.log(`Audio: ${audio}`);
  console.log(`Output: ${output}\n`);

  try {
    // Create task
    const createResult = await executeWithRetry(
      () => createTask({ image, audio, prompt, duration, resolution, promptExtend, watermark, seed, apiKey }),
      5,
      'Task creation'
    );

    const taskId = createResult.output.task_id;
    console.log(`✓ Task created: ${taskId}`);

    // Poll for completion
    const pollResult = await pollTaskStatus(taskId, apiKey);

    const videoUrl = pollResult.output.video_url;
    if (!videoUrl) {
      throw new Error('No video URL in response');
    }

    // Download video
    const fileSize = await executeWithRetry(
      () => downloadVideo(videoUrl, output),
      3,
      'Video download'
    );

    // Save metadata
    const metadata = {
      task_id: taskId,
      image_path: image,
      audio_path: audio,
      output_path: output,
      prompt: prompt,
      actual_prompt: pollResult.output.actual_prompt || prompt,
      duration: duration,
      resolution: resolution.toUpperCase(),
      file_size: fileSize,
      created_at: new Date().toISOString(),
      task_status: 'SUCCEEDED',
      submit_time: pollResult.output.submit_time,
      scheduled_time: pollResult.output.scheduled_time,
      end_time: pollResult.output.end_time,
      usage: pollResult.usage
    };

    saveMetadata(output, metadata);

    console.log('\n=== Generation Complete ===');
    console.log(`Video: ${output}`);
    console.log(`Duration: ${duration}s`);
    console.log(`Resolution: ${resolution}`);
    console.log(`File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

    if (pollResult.output.actual_prompt && pollResult.output.actual_prompt !== prompt) {
      console.log('\nAI-enhanced prompt:');
      console.log(`"${pollResult.output.actual_prompt}"`);
    }

  } catch (error) {
    console.error('\n=== Generation Failed ===');
    console.error(error);
    process.exit(1);
  }
}

main();
