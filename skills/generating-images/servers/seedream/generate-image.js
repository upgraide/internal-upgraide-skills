#!/usr/bin/env node

import Replicate from 'replicate';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Helper: Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    prompt: null,
    aspectRatio: '9:16',  // Default to vertical for Reels
    output: null,
    forceNew: false,
    category: null,
    // Seedream-4 specific features
    references: [],        // Reference image paths (multiple supported)
    refStrength: 0.8,      // How closely to match reference (0.1-1.0)
    editInstruction: null, // Natural language edit instruction
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
    } else if (args[i] === '--reference' && args[i + 1]) {
      parsed.references.push(args[i + 1]);
      i++;
    } else if (args[i] === '--ref-strength' && args[i + 1]) {
      parsed.refStrength = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--edit' && args[i + 1]) {
      parsed.editInstruction = args[i + 1];
      i++;
    }
  }

  if (!parsed.prompt) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing required parameter: --prompt',
      usage: {
        basic: '--prompt "scene description" --aspect-ratio "9:16"',
        withReference: '--prompt "Same character in new scene" --reference "/path/to/ref.jpg" --ref-strength 0.9',
        multiReference: '--prompt "scene with face" --reference "/path/to/scene.jpg" --reference "/path/to/face.jpg"',
        editing: '--prompt "base scene" --edit "change background to sunset"'
      }
    }));
    process.exit(1);
  }

  // Validate ref-strength range
  if (parsed.refStrength < 0.1 || parsed.refStrength > 1.0) {
    console.error(JSON.stringify({
      success: false,
      error: '--ref-strength must be between 0.1 and 1.0',
      hint: '0.3-0.5 copies vibe/composition, 0.8-0.9 copies subject identity exactly'
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
    'office', 'workspace', 'laptop', 'team', 'modern', 'professional',
    'collaboration', 'product', 'abstract', 'coffee', 'cafe', 'plants',
    'meeting', 'desk', 'background', 'gradient', 'minimal', 'clean',
    'cozy', 'lifestyle', 'software', 'app', 'dashboard', 'mobile'
  ];
  const lower = prompt.toLowerCase();
  return keywords.filter(kw => lower.includes(kw));
}

// Helper: Determine category from prompt
function determineCategory(prompt, override = null) {
  if (override) return override;

  const lower = prompt.toLowerCase();

  // Check for background indicators
  if (lower.includes('background') || lower.includes('gradient') ||
      lower.includes('abstract') || lower.includes('pattern') ||
      lower.includes('texture')) {
    return 'backgrounds';
  }

  // Check for product indicators
  if (lower.includes('product') || lower.includes('mockup') ||
      lower.includes('device') || lower.includes('phone') ||
      lower.includes('laptop') || lower.includes('bottle') ||
      lower.includes('packaging')) {
    return 'products';
  }

  // Default to broll
  return 'broll';
}

// Helper: Check for similar assets in catalog
async function checkForSimilar(tags, aspectRatio, catalogPath) {
  if (!existsSync(catalogPath)) return null;

  const catalogData = await readFile(catalogPath, 'utf-8');
  const catalog = JSON.parse(catalogData);

  // Find assets with 50%+ tag overlap and matching aspect ratio
  for (const asset of catalog.assets) {
    if (asset.type !== 'generated') continue;
    if (asset.aspectRatio !== aspectRatio) continue;

    const overlap = tags.filter(tag => asset.tags?.includes(tag));
    const similarity = tags.length > 0 ? overlap.length / tags.length : 0;

    if (similarity >= 0.5) {
      return { ...asset, similarity };
    }
  }

  return null;
}

// Helper: Update catalog
async function updateCatalog(newAsset, catalogPath) {
  let catalog;

  if (existsSync(catalogPath)) {
    const catalogData = await readFile(catalogPath, 'utf-8');
    catalog = JSON.parse(catalogData);
  } else {
    catalog = {
      version: '1.0.0',
      assets: [],
      stats: {}
    };
  }

  catalog.assets.push(newAsset);
  catalog.lastUpdated = new Date().toISOString();

  // Update stats
  catalog.stats.totalAssets = catalog.assets.length;
  catalog.stats.generatedImages = catalog.assets.filter(a => a.type === 'generated').length;
  catalog.stats.logos = catalog.assets.filter(a => a.type === 'logo').length;
  catalog.stats.totalStorageBytes = catalog.assets.reduce((sum, a) => sum + (a.fileSize || 0), 0);

  // Find most used asset
  const sorted = [...catalog.assets].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  if (sorted.length > 0) {
    catalog.stats.mostUsedAsset = sorted[0].id;
  }

  await writeFile(catalogPath, JSON.stringify(catalog, null, 2));
}

// Helper: Generate image via Replicate
async function generateImage(prompt, aspectRatio, references = [], refStrength = 0.8, editInstruction = null) {
  const input = {
    prompt: prompt,
    aspect_ratio: aspectRatio
  };

  // Add reference images if provided (for character/style consistency)
  // Use data URI format which Replicate accepts for image_input
  if (references.length > 0) {
    const imageDataUris = [];
    for (const reference of references) {
      try {
        const imageBuffer = await readFile(reference);
        const ext = path.extname(reference).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : (ext === '.avif' ? 'image/avif' : 'image/jpeg');
        const dataUri = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        imageDataUris.push(dataUri);
      } catch (err) {
        console.error(JSON.stringify({
          warning: `Could not load reference image: ${reference} - ${err.message}`,
          continuing: 'with other references'
        }));
      }
    }
    if (imageDataUris.length > 0) {
      input.image_input = imageDataUris;
      console.error(JSON.stringify({
        info: 'Using reference images',
        count: imageDataUris.length,
        references,
        hint: 'Seedream-4 will use these images for identity/style consistency'
      }));
    }
  }

  // Add edit instruction if provided
  if (editInstruction) {
    input.prompt = `${prompt}. Edit instruction: ${editInstruction}`;
  }

  let output;
  try {
    output = await replicate.run('bytedance/seedream-4', { input });
  } catch (apiError) {
    // Provide actionable error info
    throw new Error(`Seedream-4 API error: ${apiError.message}. Try: 1) Simplify prompt 2) Check API token 3) Reduce ref-strength if using reference`);
  }

  if (!output || output.length === 0) {
    throw new Error('Seedream-4 returned empty response. Try: 1) Rephrase prompt 2) Remove contradictory styles 3) Use simpler composition');
  }

  return output[0];
}

// Helper: Download image from URL
async function downloadImage(url) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Helper: Get image dimensions from buffer (simple check)
function getImageDimensions(aspectRatio) {
  // Standard dimensions based on aspect ratio
  const dimensions = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:5': { width: 1080, height: 1350 },
    '1:1': { width: 1080, height: 1080 },
    '4:3': { width: 1920, height: 1440 },
  };

  return dimensions[aspectRatio] || { width: 1920, height: 1080 };
}

// Helper: Convert image file to base64 for API
async function imageToBase64(imagePath) {
  const imageBuffer = await readFile(imagePath);
  return imageBuffer.toString('base64');
}

// Main function
async function main() {
  try {
    const { prompt, aspectRatio, output, forceNew, category, references, refStrength, editInstruction } = parseArgs();

    // Verify API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error(JSON.stringify({
        success: false,
        error: 'REPLICATE_API_TOKEN environment variable not set',
        fix: 'Add REPLICATE_API_TOKEN to your .env file'
      }));
      process.exit(1);
    }

    // Validate reference images exist if provided
    for (const ref of references) {
      if (!existsSync(ref)) {
        console.error(JSON.stringify({
          success: false,
          error: `Reference image not found: ${ref}`,
          fix: 'Provide a valid path to an existing image file'
        }));
        process.exit(1);
      }
    }

    // Determine paths - save to public/ for Remotion compatibility
    const projectRoot = path.resolve(__dirname, '../../../../..');
    const catalogPath = path.join(projectRoot, 'assets/catalog.json');

    // Extract metadata
    const tags = extractTags(prompt);
    const detectedCategory = determineCategory(prompt, category);

    // Always generate fresh images (no similarity check)
    // Generate new image (with optional reference support)
    const outputUrl = await withRetry(() => generateImage(prompt, aspectRatio, references, refStrength, editInstruction));

    // Construct file path - save to public/ for Remotion compatibility
    const timestamp = getTimestamp();
    const filename = `${sanitizeForFilename(prompt)}-${timestamp}.jpg`;
    // Map categories to public/ subdirectories
    const categoryToDir = {
      'broll': 'public/broll',
      'backgrounds': 'public/broll',  // Remotion uses broll for all generated
      'products': 'public/broll'
    };
    const dirPath = path.join(projectRoot, categoryToDir[detectedCategory] || 'public/broll');
    const filePath = output || path.join(dirPath, filename);

    // Ensure directory exists
    await mkdir(path.dirname(filePath), { recursive: true });

    // Download and save image
    const imageBuffer = await withRetry(() => downloadImage(outputUrl));
    await writeFile(filePath, imageBuffer);

    // Get dimensions
    const dimensions = getImageDimensions(aspectRatio);

    // Create catalog metadata
    const metadata = {
      id: `gen-${detectedCategory}-${timestamp}`,
      type: 'generated',
      category: detectedCategory,
      filePath: path.relative(projectRoot, filePath),
      prompt,
      aspectRatio,
      generatedAt: new Date().toISOString(),
      model: 'seedream-4',
      fileSize: imageBuffer.length,
      dimensions,
      tags,
      usageCount: 0,
      usedInVideos: []
    };

    // Update catalog
    await updateCatalog(metadata, catalogPath);

    // Calculate Remotion staticFile path
    const relativePath = path.relative(projectRoot, filePath);
    const staticFilePath = relativePath.replace(/^public\//, '');

    // Output result with Remotion-compatible path
    console.log(JSON.stringify({
      success: true,
      reused: false,
      filePath: relativePath,
      staticFile: staticFilePath,  // Use with staticFile() in Remotion
      remotionUsage: `staticFile('${staticFilePath}')`,
      assetId: metadata.id,
      url: outputUrl,
      category: detectedCategory,
      tags,
      fileSize: imageBuffer.length,
      catalogUpdated: true
    }));

  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }));
    process.exit(1);
  }
}

main();
