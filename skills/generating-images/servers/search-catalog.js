#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    tags: [],
    type: null,
    category: null,
    brand: null,
    limit: 10,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tags' && args[i + 1]) {
      parsed.tags = args[i + 1].split(',').map(t => t.trim().toLowerCase());
      i++;
    } else if (args[i] === '--type' && args[i + 1]) {
      parsed.type = args[i + 1];
      i++;
    } else if (args[i] === '--category' && args[i + 1]) {
      parsed.category = args[i + 1];
      i++;
    } else if (args[i] === '--brand' && args[i + 1]) {
      parsed.brand = args[i + 1];
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      parsed.limit = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return parsed;
}

// Helper: Calculate tag similarity
function calculateSimilarity(assetTags, searchTags) {
  if (!assetTags || assetTags.length === 0 || searchTags.length === 0) {
    return 0;
  }

  const overlap = searchTags.filter(tag => assetTags.includes(tag));
  return overlap.length / searchTags.length;
}

// Main function
async function main() {
  try {
    const { tags, type, category, brand, limit } = parseArgs();

    // Determine paths
    const projectRoot = path.resolve(__dirname, '../../../..');
    const catalogPath = path.join(projectRoot, 'assets/catalog.json');

    // Check if catalog exists
    if (!existsSync(catalogPath)) {
      console.log(JSON.stringify({
        success: true,
        results: [],
        total: 0,
        message: 'Catalog not found (no assets generated yet)'
      }));
      return;
    }

    // Read catalog
    const catalogData = await readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(catalogData);

    // Filter assets
    let results = catalog.assets.filter(asset => {
      // Filter by type
      if (type && asset.type !== type) return false;

      // Filter by category
      if (category && asset.category !== category) return false;

      // Filter by brand (for logos)
      if (brand && asset.brand?.toLowerCase() !== brand.toLowerCase()) return false;

      return true;
    });

    // If tags provided, calculate similarity and sort
    if (tags && tags.length > 0) {
      results = results.map(asset => {
        const similarity = calculateSimilarity(asset.tags, tags);
        return { ...asset, similarity };
      })
      .filter(asset => asset.similarity > 0) // Only include assets with some tag match
      .sort((a, b) => b.similarity - a.similarity); // Sort by similarity descending
    } else {
      // No tags - sort by usage count
      results = results.map(asset => ({
        ...asset,
        similarity: null
      })).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    }

    // Limit results
    const limitedResults = results.slice(0, limit);

    // Output results
    console.log(JSON.stringify({
      success: true,
      results: limitedResults,
      total: results.length,
      showing: limitedResults.length,
      filters: {
        tags: tags.length > 0 ? tags : null,
        type,
        category,
        brand
      }
    }, null, 2));

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
