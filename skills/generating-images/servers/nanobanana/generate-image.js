#!/usr/bin/env node

import 'dotenv/config';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google AI Studio API endpoint
const GOOGLE_AI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Helper: Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    prompt: null,
    aspectRatio: '9:16',  // Default to vertical for Reels
    output: null,
    forceNew: false,
    category: null,
    model: 'gemini-3-pro-image-preview', // Pro model with reasoning
    imageSize: null, // Only for gemini-3-pro-image-preview: "1K", "2K", "4K"
    inputImages: [], // Array of image paths to combine
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prompt' && args[i + 1]) {
      parsed.prompt = args[i + 1];
      i++;
    } else if (args[i] === '--aspect-ratio' && args[i + 1]) {
      parsed.aspectRatio = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      parsed.output = args[i + 1];
      i++;
    } else if (args[i] === '--force-new') {
      parsed.forceNew = true;
    } else if (args[i] === '--category' && args[i + 1]) {
      parsed.category = args[i + 1];
      i++;
    } else if (args[i] === '--model' && args[i + 1]) {
      parsed.model = args[i + 1];
      i++;
    } else if (args[i] === '--image-size' && args[i + 1]) {
      parsed.imageSize = args[i + 1];
      i++;
    } else if (args[i] === '--images' && args[i + 1]) {
      // Comma-separated list of image paths
      parsed.inputImages = args[i + 1].split(',').map(p => p.trim());
      i++;
    }
  }

  if (!parsed.prompt) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing required parameter: --prompt',
      usage: {
        basic: '--prompt "description" --aspect-ratio "9:16"',
        pro: '--prompt "description" --model "gemini-3-pro-image-preview" --image-size "2K"',
        withReference: '--prompt "Edit this image..." --images "/path/to/ref.jpg"'
      },
      models: {
        fast: 'gemini-2.5-flash-image (default, optimized for speed)',
        pro: 'gemini-3-pro-image-preview (advanced, supports 2K/4K, thinking mode)'
      }
    }));
    process.exit(1);
  }

  // Validate aspect ratio
  const validRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];
  if (!validRatios.includes(parsed.aspectRatio)) {
    console.error(JSON.stringify({
      success: false,
      error: `Invalid aspect ratio: ${parsed.aspectRatio}. Supported: ${validRatios.join(', ')}`
    }));
    process.exit(1);
  }

  // Validate image size (only for pro model)
  if (parsed.imageSize && !['1K', '2K', '4K'].includes(parsed.imageSize)) {
    console.error(JSON.stringify({
      success: false,
      error: `Invalid image size: ${parsed.imageSize}. Supported: 1K, 2K, 4K (pro model only)`
    }));
    process.exit(1);
  }

  return parsed;
}

// Helper: Sleep function for retries
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Retry logic with exponential backoff
async function withRetry(fn, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, 8s, 16s
      console.error(`Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`, { stream: process.stderr });
      await sleep(delay);
    }
  }
}

// Helper: Sanitize string for filename
function sanitizeForFilename(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

// Helper: Get timestamp
function getTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '-');
}

// Helper: Extract tags from prompt
function extractTags(prompt) {
  const keywords = [
    'christmas', 'group', 'portrait', 'painting', 'friends', 'family',
    'office', 'workspace', 'laptop', 'team', 'modern', 'professional',
    'collaboration', 'product', 'abstract', 'coffee', 'cafe', 'plants',
    'meeting', 'desk', 'background', 'gradient', 'minimal', 'clean',
    'illustration', 'holiday', 'festive', 'snow', 'winter', 'cozy',
    'sports', 'tennis', 'athlete', 'action', 'dramatic', 'cinematic',
  ];

  const promptLower = prompt.toLowerCase();
  return keywords.filter(keyword => promptLower.includes(keyword));
}

// Helper: Auto-categorize based on prompt
function categorizePrompt(prompt) {
  const promptLower = prompt.toLowerCase();

  if (promptLower.includes('portrait') || promptLower.includes('person') || promptLower.includes('people') || promptLower.includes('group')) {
    return 'portraits';
  }
  if (promptLower.includes('product') || promptLower.includes('mockup')) {
    return 'products';
  }
  if (promptLower.includes('background') || promptLower.includes('gradient') || promptLower.includes('abstract')) {
    return 'backgrounds';
  }
  return 'broll';
}

// Helper: Convert base64 image to buffer
function base64ToBuffer(base64String) {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Helper: Convert image file to base64 for API
async function imageToBase64(imagePath) {
  const imageBuffer = await readFile(imagePath);
  return imageBuffer.toString('base64');
}

// Helper: Detect MIME type from file extension
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

// Main: Generate image with Google AI Studio (Gemini)
async function generateImage(prompt, aspectRatio, model, imageSize, inputImages = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  console.error(`Generating image with ${model}...`, { stream: process.stderr });
  console.error(`Prompt: ${prompt}`, { stream: process.stderr });
  console.error(`Aspect Ratio: ${aspectRatio}`, { stream: process.stderr });
  if (imageSize) {
    console.error(`Image Size: ${imageSize}`, { stream: process.stderr });
  }
  if (inputImages.length > 0) {
    console.error(`Input images: ${inputImages.length}`, { stream: process.stderr });
  }

  const result = await withRetry(async () => {
    // Build content parts
    const parts = [];

    // Add text prompt
    parts.push({ text: prompt });

    // Add input images if provided
    for (const imagePath of inputImages) {
      const base64Data = await imageToBase64(imagePath);
      const mimeType = getMimeType(imagePath);
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
    }

    // Build generation config
    const generationConfig = {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    };

    // Add image size for pro model
    if (imageSize && model.includes('pro')) {
      generationConfig.imageConfig.imageSize = imageSize;
    }

    // Build request body
    const requestBody = {
      contents: [{
        parts: parts,
      }],
      generationConfig: generationConfig,
    };

    // Make API request
    const apiUrl = `${GOOGLE_AI_API_BASE}/${model}:generateContent`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  });

  // Extract generated image from response
  if (!result) {
    throw new Error('API returned null response');
  }

  if (!result.candidates || !result.candidates[0]) {
    throw new Error(`API returned unexpected structure. Got keys: ${JSON.stringify(Object.keys(result))}`);
  }

  const content = result.candidates[0].content;
  if (!content || !content.parts) {
    throw new Error('No content in response');
  }

  // Find image part in response
  let imageData = null;
  let textResponse = '';

  for (const part of content.parts) {
    if (part.text) {
      textResponse += part.text;
    }
    if (part.inlineData && part.inlineData.data) {
      // Skip thought images (interim drafts)
      if (part.thought) {
        console.error('Skipping thought/interim image', { stream: process.stderr });
        continue;
      }
      imageData = part.inlineData.data;
    }
  }

  if (!imageData) {
    throw new Error(`No image in response. Text response: "${textResponse.substring(0, 200)}..."`);
  }

  console.error('Image generated successfully', { stream: process.stderr });

  return {
    imageData,
    textResponse,
  };
}

// Main: Save image to file
async function saveImage(imageData, outputPath) {
  const imageBuffer = base64ToBuffer(imageData);

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(outputPath, imageBuffer);
  console.error(`Image saved to: ${outputPath}`, { stream: process.stderr });
}

// Main: Update catalog
async function updateCatalog(assetData) {
  const catalogPath = path.join(__dirname, '../../../../assets/catalog.json');

  let catalog = {
    assets: [],
    stats: {
      totalAssets: 0,
      totalGenerated: 0,
      totalLogos: 0,
    },
  };

  // Load existing catalog if exists
  if (existsSync(catalogPath)) {
    try {
      const catalogContent = await readFile(catalogPath, 'utf-8');
      catalog = JSON.parse(catalogContent);
    } catch (error) {
      console.error('Warning: Could not parse catalog.json, reinitializing', { stream: process.stderr });
    }
  }

  // Add new asset
  catalog.assets.push(assetData);
  catalog.stats.totalAssets++;
  catalog.stats.totalGenerated++;

  // Ensure directory exists
  const catalogDir = path.dirname(catalogPath);
  if (!existsSync(catalogDir)) {
    await mkdir(catalogDir, { recursive: true });
  }

  // Save updated catalog
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2));
  console.error('Catalog updated', { stream: process.stderr });
}

// Main entry point
async function main() {
  try {
    const args = parseArgs();

    // Verify API key
    if (!process.env.GEMINI_API_KEY) {
      console.error(JSON.stringify({
        success: false,
        error: 'Missing GEMINI_API_KEY environment variable',
        hint: 'Set GEMINI_API_KEY in your .env file or environment'
      }));
      process.exit(1);
    }

    // Validate input images if provided
    if (args.inputImages.length > 0) {
      for (const imagePath of args.inputImages) {
        if (!existsSync(imagePath)) {
          console.error(JSON.stringify({
            success: false,
            error: `Input image not found: ${imagePath}`
          }));
          process.exit(1);
        }
      }
    }

    // Generate image
    const { imageData, textResponse } = await generateImage(
      args.prompt,
      args.aspectRatio,
      args.model,
      args.imageSize,
      args.inputImages
    );

    // Determine output path - save to public/broll/ for Remotion
    const category = args.category || categorizePrompt(args.prompt);
    const sanitizedPrompt = sanitizeForFilename(args.prompt);
    const timestamp = getTimestamp();
    const projectRoot = path.resolve(__dirname, '../../../../..');
    const filename = `${sanitizedPrompt}-${timestamp}.png`;
    const defaultOutputPath = path.join(projectRoot, `public/broll/${filename}`);
    const outputPath = args.output || defaultOutputPath;

    // Save image
    await saveImage(imageData, outputPath);

    // Extract tags
    const tags = extractTags(args.prompt);

    // Create asset metadata
    const assetId = `gen-${category}-${timestamp}`;
    const assetData = {
      id: assetId,
      type: 'generated',
      category,
      filePath: outputPath,
      prompt: args.prompt,
      aspectRatio: args.aspectRatio,
      generator: 'google-ai-studio',
      model: args.model,
      imageSize: args.imageSize,
      tags,
      textResponse,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      usedInVideos: [],
    };

    // Update catalog
    await updateCatalog(assetData);

    // Calculate Remotion staticFile path
    const relativePath = path.relative(projectRoot, outputPath);
    const staticFilePath = relativePath.replace(/^public\//, '');

    // Output success result
    console.log(JSON.stringify({
      success: true,
      assetId,
      filePath: relativePath,
      staticFile: staticFilePath,  // Use: staticFile('broll/filename.png')
      category,
      tags,
      aspectRatio: args.aspectRatio,
      generator: 'google-ai-studio',
      model: args.model,
      imageSize: args.imageSize,
      textResponse,
    }, null, 2));

  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
    }));
    process.exit(1);
  }
}

main();
