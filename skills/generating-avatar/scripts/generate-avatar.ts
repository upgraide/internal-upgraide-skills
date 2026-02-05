#!/usr/bin/env tsx

/**
 * Generate lip-synced avatar video using InfiniteTalk on RunPod
 *
 * Usage:
 *   tsx generate-avatar.ts --image person.jpg --audio speech.mp3 --output avatar.mp4
 */

import 'dotenv/config';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { resolve, dirname } from 'path';

interface AvatarArgs {
  image: string;
  audio: string;
  output: string;
  prompt?: string;
  width?: number;
  height?: number;
  timeout?: number;
  jobId?: string; // Resume an existing job
}

interface AvatarMetadata {
  jobId: string;
  filePath: string;
  inputImage: string;
  inputAudio: string;
  width: number;
  height: number;
  generatedAt: string;
  elapsedSeconds: number;
  success: boolean;
  error?: string;
}

const API_BASE = 'https://api.runpod.ai/v2/1p34ajxy6loyr2';

function parseArgs(): AvatarArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<AvatarArgs> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--image':
        parsed.image = value;
        break;
      case '--audio':
        parsed.audio = value;
        break;
      case '--output':
        parsed.output = value;
        break;
      case '--prompt':
        parsed.prompt = value;
        break;
      case '--width':
        parsed.width = parseInt(value, 10);
        break;
      case '--height':
        parsed.height = parseInt(value, 10);
        break;
      case '--timeout':
        parsed.timeout = parseInt(value, 10);
        break;
      case '--job-id':
        parsed.jobId = value;
        break;
    }
  }

  // If resuming a job, we only need output path
  if (parsed.jobId) {
    if (!parsed.output) {
      console.error('Usage: tsx generate-avatar.ts --job-id <id> --output <path>');
      console.error('Resume an existing job by providing the job ID.');
      process.exit(1);
    }
    // Set dummy values for required fields when resuming
    parsed.image = parsed.image || '';
    parsed.audio = parsed.audio || '';
    return parsed as AvatarArgs;
  }

  if (!parsed.image || !parsed.audio || !parsed.output) {
    console.error('Usage: tsx generate-avatar.ts --image <path> --audio <path> --output <path> [options]');
    console.error('Options:');
    console.error('  --prompt <text>    Action description (default: "A person is talking in a natural way.")');
    console.error('  --width <number>   Output width (default: 512)');
    console.error('  --height <number>  Output height (default: 512)');
    console.error('  --timeout <seconds> Max wait time in seconds (default: 1800)');
    console.error('  --job-id <id>      Resume polling an existing job');
    process.exit(1);
  }

  return parsed as AvatarArgs;
}

async function fileToBase64(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return buffer.toString('base64');
}

async function submitJob(args: AvatarArgs, apiKey: string): Promise<string> {
  const imageBase64 = await fileToBase64(args.image);
  const audioBase64 = await fileToBase64(args.audio);

  const requestBody = {
    input: {
      input_type: 'image',
      person_count: 'single',
      prompt: args.prompt || 'A person is talking in a natural way.',
      image_base64: imageBase64,
      wav_base64: audioBase64,
      width: args.width || 512,
      height: args.height || 512,
      network_volume: false, // We'll download directly
    },
  };

  const response = await fetch(`${API_BASE}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to submit job (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.id;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 5
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff, max 30s
      console.error(`  Network error (attempt ${attempt + 1}/${maxRetries}): ${lastError.message}`);
      console.error(`  Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

async function pollStatus(
  jobId: string,
  apiKey: string,
  maxWaitMs: number = 900000
): Promise<any> {
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const response = await fetchWithRetry(`${API_BASE}/status/${jobId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to poll status (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const status = result.status;

    console.error(`[${Math.round((Date.now() - startTime) / 1000)}s] Status: ${status}`);

    if (status === 'COMPLETED') {
      return result.output;
    }

    if (status === 'FAILED') {
      throw new Error(`Job failed: ${JSON.stringify(result.error || result)}`);
    }

    if (status === 'CANCELLED') {
      throw new Error('Job was cancelled');
    }

    // IN_QUEUE, IN_PROGRESS - keep polling
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Timeout waiting for job completion (${maxWaitMs / 1000}s)`);
}

async function downloadVideo(output: any, outputPath: string): Promise<void> {
  // The output could be a URL or base64 data depending on the API
  let videoData: Buffer;

  if (output.video) {
    // Direct base64 video data in "video" field
    videoData = Buffer.from(output.video, 'base64');
  } else if (output.video_url) {
    // Download from URL with retry
    const response = await fetchWithRetry(output.video_url, {});
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }
    videoData = Buffer.from(await response.arrayBuffer());
  } else if (output.video_base64) {
    // Decode base64
    videoData = Buffer.from(output.video_base64, 'base64');
  } else if (typeof output === 'string') {
    // Maybe it's just a URL string - download with retry
    const response = await fetchWithRetry(output, {});
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }
    videoData = Buffer.from(await response.arrayBuffer());
  } else {
    throw new Error(`Unexpected output format: ${JSON.stringify(output).slice(0, 200)}`);
  }

  // Ensure output directory exists
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, videoData);
}

const JOB_FILE = '/tmp/avatar-job-id.txt';

async function saveJobId(jobId: string, outputPath: string): Promise<void> {
  const data = JSON.stringify({ jobId, outputPath, timestamp: new Date().toISOString() });
  await writeFile(JOB_FILE, data);
  console.error(`  Job ID saved to ${JOB_FILE} for recovery`);
}

async function generateAvatar(args: AvatarArgs): Promise<AvatarMetadata> {
  const apiKey = process.env.RUNPOD_AVATAR_API_KEY;
  if (!apiKey) {
    throw new Error('RUNPOD_AVATAR_API_KEY not found in environment. Set it in .env file');
  }

  const startTime = Date.now();
  let jobId: string;

  // Resume mode: use provided job ID
  if (args.jobId) {
    jobId = args.jobId;
    console.error(`Resuming job: ${jobId}`);
  } else {
    // Normal mode: submit new job
    console.error('Submitting avatar generation job...');
    console.error(`  Image: ${args.image}`);
    console.error(`  Audio: ${args.audio}`);
    console.error(`  Size: ${args.width || 512}x${args.height || 512}`);

    jobId = await submitJob(args, apiKey);
    console.error(`Job submitted: ${jobId}`);

    // Save job ID immediately for recovery
    await saveJobId(jobId, args.output);
  }

  const timeoutMs = (args.timeout || 1800) * 1000; // Default 30 minutes
  console.error(`Polling for completion (timeout: ${timeoutMs / 1000}s)...`);
  const output = await pollStatus(jobId, apiKey, timeoutMs);

  console.error('Downloading video...');
  const outputPath = resolve(args.output);
  await downloadVideo(output, outputPath);

  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

  return {
    jobId,
    filePath: outputPath,
    inputImage: args.image || '(resumed job)',
    inputAudio: args.audio || '(resumed job)',
    width: args.width || (args.jobId ? 0 : 512), // 0 = unknown when resuming
    height: args.height || (args.jobId ? 0 : 512),
    generatedAt: new Date().toISOString(),
    elapsedSeconds,
    success: true,
  };
}

async function main() {
  try {
    const args = parseArgs();
    const metadata = await generateAvatar(args);

    console.error('✓ Avatar video generated successfully');
    console.error(`  File: ${metadata.filePath}`);
    if (metadata.width > 0 && metadata.height > 0) {
      console.error(`  Size: ${metadata.width}x${metadata.height}`);
    }
    console.error(`  Time: ${metadata.elapsedSeconds}s`);

    // Output JSON for programmatic use
    console.log(JSON.stringify(metadata, null, 2));
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`✗ Error: ${errorMessage}`);

    const metadata: AvatarMetadata = {
      jobId: '',
      filePath: '',
      inputImage: '',
      inputAudio: '',
      width: 0,
      height: 0,
      generatedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      success: false,
      error: errorMessage,
    };

    console.log(JSON.stringify(metadata, null, 2));
    process.exit(1);
  }
}

main();
