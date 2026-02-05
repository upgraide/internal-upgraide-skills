#!/usr/bin/env npx tsx

/**
 * Video Analysis with Gemini 3 Pro via OpenRouter
 * Supports single video or reference comparison (two videos)
 *
 * Usage:
 *   # Single video analysis
 *   npx tsx ask-gemini.ts <video_path> "<question>"
 *
 *   # Compare against reference video
 *   npx tsx ask-gemini.ts <video_path> --reference <ref_video_path> "<question>"
 *
 * Examples:
 *   npx tsx scripts/ask-gemini.ts preview.mp4 "Rate quality 1-10"
 *   npx tsx scripts/ask-gemini.ts preview.mp4 --reference archive/viral.mp4 "Compare quality to reference"
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-3-pro-preview';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

async function encodeVideoToBase64(videoPath: string): Promise<string> {
  const absolutePath = path.resolve(videoPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Video file not found: ${absolutePath}`);
  }

  const videoBuffer = fs.readFileSync(absolutePath);
  const base64Video = videoBuffer.toString('base64');

  // Detect MIME type from extension
  const ext = path.extname(videoPath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mpeg': 'video/mpeg',
    '.mov': 'video/mov',
    '.webm': 'video/webm',
  };
  const mimeType = mimeTypes[ext] || 'video/mp4';

  return `data:${mimeType};base64,${base64Video}`;
}

interface AnalyzeOptions {
  videoPath: string;
  referencePath?: string;
  question: string;
}

async function analyzeVideo(options: AnalyzeOptions): Promise<string> {
  const { videoPath, referencePath, question } = options;

  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not found in environment');
  }

  console.error(`[Gemini VL] Analyzing: ${videoPath}`);
  if (referencePath) {
    console.error(`[Gemini VL] Reference: ${referencePath}`);
  }
  console.error(`[Gemini VL] Question: ${question.substring(0, 50)}...`);

  // Build content array
  const content: Array<any> = [];

  // Add reference video first (if provided)
  if (referencePath) {
    console.error(`[Gemini VL] Encoding reference video...`);
    const refBase64 = await encodeVideoToBase64(referencePath);
    const refSizeMB = (Buffer.byteLength(refBase64, 'utf8') / 1024 / 1024).toFixed(2);
    console.error(`[Gemini VL] Reference encoded (${refSizeMB} MB)`);

    content.push({
      type: 'text',
      text: '## REFERENCE VIDEO (the quality standard to match):',
    });
    content.push({
      type: 'video_url',
      video_url: { url: refBase64 },
    });
  }

  // Add main video
  console.error(`[Gemini VL] Encoding main video...`);
  const mainBase64 = await encodeVideoToBase64(videoPath);
  const mainSizeMB = (Buffer.byteLength(mainBase64, 'utf8') / 1024 / 1024).toFixed(2);
  console.error(`[Gemini VL] Main video encoded (${mainSizeMB} MB)`);

  if (referencePath) {
    content.push({
      type: 'text',
      text: '## VIDEO TO ANALYZE (compare against reference above):',
    });
  }
  content.push({
    type: 'video_url',
    video_url: { url: mainBase64 },
  });

  // Add the question
  content.push({
    type: 'text',
    text: question,
  });

  console.error(`[Gemini VL] Sending to ${MODEL}...`);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://spielberg.ai',
      'X-Title': 'Spielberg Video Analysis',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as OpenRouterResponse;

  if (data.error) {
    throw new Error(`API Error: ${data.error.message}`);
  }

  const result = data.choices?.[0]?.message?.content;
  if (!result) {
    throw new Error('No response content from API');
  }

  console.error(`[Gemini VL] Done`);
  return result;
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(`Usage:
  npx tsx ask-gemini.ts <video_path> "<question>"
  npx tsx ask-gemini.ts <video_path> --reference <ref_path> "<question>"
`);
    process.exit(1);
  }

  // Parse args
  const videoPath = args[0];
  let referencePath: string | undefined;
  let questionParts: string[] = [];

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--reference' || args[i] === '-r') {
      referencePath = args[++i];
    } else {
      questionParts.push(args[i]);
    }
  }

  const question = questionParts.join(' ');

  if (!question) {
    console.error('Error: Question is required');
    process.exit(1);
  }

  try {
    const result = await analyzeVideo({ videoPath, referencePath, question });
    console.log(result);
  } catch (error) {
    console.error(`[Gemini VL] Error:`, error);
    process.exit(1);
  }
}

main();
