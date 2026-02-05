#!/usr/bin/env tsx

import 'dotenv/config';

const jobId = process.argv[2] || '0e834109-346d-42c5-adb7-4e37ef2a785e-e2';
const apiKey = process.env.RUNPOD_AVATAR_API_KEY;

if (!apiKey) {
  console.error('RUNPOD_AVATAR_API_KEY not found');
  process.exit(1);
}

async function main() {
  const response = await fetch(`https://api.runpod.ai/v2/1p34ajxy6loyr2/status/${jobId}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main();
