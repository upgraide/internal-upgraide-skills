#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    assetId: null,
    videoId: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--asset-id' && args[i + 1]) {
      parsed.assetId = args[i + 1];
      i++;
    } else if (args[i] === '--video-id' && args[i + 1]) {
      parsed.videoId = args[i + 1];
      i++;
    }
  }

  if (!parsed.assetId) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing required parameter: --asset-id'
    }));
    process.exit(1);
  }

  if (!parsed.videoId) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing required parameter: --video-id'
    }));
    process.exit(1);
  }

  return parsed;
}

// Main function
async function main() {
  try {
    const { assetId, videoId } = parseArgs();

    // Determine paths
    const projectRoot = path.resolve(__dirname, '../../../..');
    const catalogPath = path.join(projectRoot, 'assets/catalog.json');

    // Check if catalog exists
    if (!existsSync(catalogPath)) {
      console.error(JSON.stringify({
        success: false,
        error: 'Catalog not found (no assets generated yet)'
      }));
      process.exit(1);
    }

    // Read catalog
    const catalogData = await readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(catalogData);

    // Find asset
    const asset = catalog.assets.find(a => a.id === assetId);

    if (!asset) {
      console.error(JSON.stringify({
        success: false,
        error: `Asset ${assetId} not found in catalog`
      }));
      process.exit(1);
    }

    // Update usage count
    asset.usageCount = (asset.usageCount || 0) + 1;

    // Add video ID to usedInVideos array if not already present
    if (!asset.usedInVideos) {
      asset.usedInVideos = [];
    }

    if (!asset.usedInVideos.includes(videoId)) {
      asset.usedInVideos.push(videoId);
    }

    // Update catalog
    catalog.lastUpdated = new Date().toISOString();

    // Recalculate stats
    catalog.stats.totalAssets = catalog.assets.length;
    catalog.stats.generatedImages = catalog.assets.filter(a => a.type === 'generated').length;
    catalog.stats.logos = catalog.assets.filter(a => a.type === 'logo').length;
    catalog.stats.totalStorageBytes = catalog.assets.reduce((sum, a) => sum + (a.fileSize || 0), 0);

    // Find most used asset
    const sorted = [...catalog.assets].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    if (sorted.length > 0) {
      catalog.stats.mostUsedAsset = sorted[0].id;
    }

    // Write updated catalog
    await writeFile(catalogPath, JSON.stringify(catalog, null, 2));

    // Output result
    console.log(JSON.stringify({
      success: true,
      assetId,
      videoId,
      newUsageCount: asset.usageCount,
      totalVideos: asset.usedInVideos.length,
      message: `Usage tracked successfully`
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
