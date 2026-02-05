#!/usr/bin/env tsx

import 'dotenv/config';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

const jobId = process.argv[2] || '0e834109-346d-42c5-adb7-4e37ef2a785e-e2';
const outputPath = process.argv[3] || 'public/avatar/talking.mp4';
const apiKey = process.env.RUNPOD_AVATAR_API_KEY;

if (!apiKey) {
  console.error('RUNPOD_AVATAR_API_KEY not found');
  process.exit(1);
}

async function main() {
  console.log(`Fetching job ${jobId}...`);

  const response = await fetch(`https://api.runpod.ai/v2/1p34ajxy6loyr2/status/${jobId}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await response.json();

  if (data.status !== 'COMPLETED') {
    console.error(`Job not completed. Status: ${data.status}`);
    process.exit(1);
  }

  console.log('Job completed! Downloading video...');

  const output = data.output;
  let videoData: Buffer;

  if (output.video) {
    videoData = Buffer.from(output.video, 'base64');
  } else if (output.video_base64) {
    videoData = Buffer.from(output.video_base64, 'base64');
  } else if (output.video_url) {
    const videoResponse = await fetch(output.video_url);
    videoData = Buffer.from(await videoResponse.arrayBuffer());
  } else {
    console.error('No video data found in output');
    process.exit(1);
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, videoData);

  console.log(`✓ Video saved to ${outputPath}`);
  console.log(`  Size: ${(videoData.length / 1024 / 1024).toFixed(2)} MB`);
}

main();
