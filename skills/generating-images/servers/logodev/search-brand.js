#!/usr/bin/env node

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    brand: null,
    size: 128,
    format: 'png',
    theme: 'light',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--brand' && args[i + 1]) {
      parsed.brand = args[i + 1];
      i++;
    } else if (args[i] === '--size' && args[i + 1]) {
      parsed.size = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--format' && args[i + 1]) {
      parsed.format = args[i + 1];
      i++;
    } else if (args[i] === '--theme' && args[i + 1]) {
      parsed.theme = args[i + 1];
      i++;
    }
  }

  if (!parsed.brand) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing required parameter: --brand'
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

// Helper: Sanitize brand name for filename
function sanitizeBrandName(brand) {
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Helper: Check logo cache in catalog
async function checkLogoCache(brand, catalogPath) {
  if (!existsSync(catalogPath)) return null;

  const catalogData = await readFile(catalogPath, 'utf-8');
  const catalog = JSON.parse(catalogData);

  return catalog.assets.find(
    a => a.type === 'logo' && a.brand.toLowerCase() === brand.toLowerCase()
  );
}

// Helper: Search brand via logo.dev API
async function searchBrand(brand, apiKey) {
  const url = `https://api.logo.dev/search?q=${encodeURIComponent(brand)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Brand search failed: ${response.statusText}`);
  }

  const results = await response.json();
  return results;
}

// Helper: Build logo URL
function buildLogoUrl(domain, options) {
  const { size, format, theme, publicToken } = options;

  let url = `https://img.logo.dev/${domain}?token=${publicToken}`;

  if (size) url += `&size=${size}`;
  if (format) url += `&format=${format}`;
  if (theme && theme !== 'light') url += `&theme=${theme}`;

  return url;
}

// Helper: Download logo image
async function downloadLogo(logoUrl) {
  const response = await fetch(logoUrl);

  if (!response.ok) {
    throw new Error(`Failed to download logo: ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
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

// Main function
async function main() {
  try {
    const { brand, size, format, theme } = parseArgs();

    // Verify API keys
    const apiKey = process.env.LOGO_SEARCH_KEY;
    const publicToken = process.env.LOGO_PUBLIC_TOKEN;

    if (!apiKey) {
      console.error(JSON.stringify({
        success: false,
        error: 'LOGO_SEARCH_KEY environment variable not set'
      }));
      process.exit(1);
    }

    if (!publicToken) {
      console.error(JSON.stringify({
        success: false,
        error: 'LOGO_PUBLIC_TOKEN environment variable not set'
      }));
      process.exit(1);
    }

    // Determine paths
    const projectRoot = path.resolve(__dirname, '../../../../..');
    const catalogPath = path.join(projectRoot, 'assets/catalog.json');

    // Check cache first
    const cached = await checkLogoCache(brand, catalogPath);
    if (cached) {
      console.log(JSON.stringify({
        success: true,
        cached: true,
        brand,
        domain: cached.domain,
        logoUrl: cached.logoUrl,
        filePath: cached.filePath,
        message: 'Logo found in cache'
      }));
      return;
    }

    // Search brand via logo.dev
    const searchResults = await withRetry(() => searchBrand(brand, apiKey));

    if (!searchResults || searchResults.length === 0) {
      console.error(JSON.stringify({
        success: false,
        error: `Brand "${brand}" not found`,
        suggestions: 'Try alternative spelling or check brand name'
      }));
      process.exit(1);
    }

    // Get best match (first result)
    const { domain } = searchResults[0];

    // Build logo URL
    const logoUrl = buildLogoUrl(domain, { size, format, theme, publicToken });

    // Construct file path
    const filename = `${sanitizeBrandName(brand)}.${format}`;
    const dirPath = path.join(projectRoot, 'assets/logos');
    const filePath = path.join(dirPath, filename);

    // Ensure directory exists
    await mkdir(dirPath, { recursive: true });

    // Download logo
    const imageBuffer = await withRetry(() => downloadLogo(logoUrl));
    await writeFile(filePath, imageBuffer);

    // Create catalog metadata
    const metadata = {
      id: `logo-${sanitizeBrandName(brand)}`,
      type: 'logo',
      brand,
      domain,
      filePath: path.relative(projectRoot, filePath),
      logoUrl,
      format,
      size,
      theme,
      downloadedAt: new Date().toISOString(),
      fileSize: imageBuffer.length,
      usageCount: 0,
      usedInVideos: []
    };

    // Update catalog
    await updateCatalog(metadata, catalogPath);

    // Prepare alternatives (other search results)
    const alternatives = searchResults.slice(1, 4).map(r => ({
      name: r.name,
      domain: r.domain
    }));

    // Output result
    console.log(JSON.stringify({
      success: true,
      cached: false,
      brand,
      domain,
      logoUrl,
      filePath: path.relative(projectRoot, filePath),
      alternatives,
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
