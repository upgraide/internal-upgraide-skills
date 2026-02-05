#!/usr/bin/env ts-node
/**
 * Render Script with Validation
 *
 * Renders a Remotion composition and validates the output.
 *
 * Usage:
 *   tsx .claude/skills/assembling-video/scripts/render.ts <composition-id> [output-file]
 *   tsx .claude/skills/assembling-video/scripts/render.ts SimpleAvatar
 *   tsx .claude/skills/assembling-video/scripts/render.ts SimpleAvatar outputs/my-video.mp4
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ENTRY_POINT, DEFAULT_RENDER_OPTIONS, generateOutputFilename } from './remotion-config';

/**
 * Parse command line arguments
 */
function parseArgs(): { compositionId: string; outputFile: string } {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: Composition ID required');
    console.error('Usage: tsx render.ts <composition-id> [output-file]');
    process.exit(1);
  }

  const compositionId = args[0];
  const outputFile = args[1] || generateOutputFilename(compositionId.toLowerCase());

  return { compositionId, outputFile };
}

/**
 * Build Remotion CLI command
 */
function buildRenderCommand(compositionId: string, outputFile: string): string {
  const { codec, audioCodec, crf, jpegQuality, audioBitrate, concurrency } =
    DEFAULT_RENDER_OPTIONS;

  return `npx remotion render ${ENTRY_POINT} ${compositionId} ${outputFile} --codec=${codec} --crf=${crf} --audio-codec=${audioCodec} --audio-bitrate=${audioBitrate} --jpeg-quality=${jpegQuality} --concurrency=${concurrency}`;
}

/**
 * Validate output file
 */
function validateOutput(outputFile: string): {
  success: boolean;
  fileExists: boolean;
  fileSize: number;
  errors: string[];
} {
  const errors: string[] = [];

  // Check file exists
  if (!fs.existsSync(outputFile)) {
    return {
      success: false,
      fileExists: false,
      fileSize: 0,
      errors: ['Output file does not exist'],
    };
  }

  // Check file size
  const stats = fs.statSync(outputFile);
  const fileSizeMB = stats.size / (1024 * 1024);

  if (fileSizeMB < 0.01) {
    errors.push('Output file is suspiciously small (< 10KB)');
  }

  return {
    success: errors.length === 0,
    fileExists: true,
    fileSize: stats.size,
    errors,
  };
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(60));
  console.log('Remotion Render with Validation');
  console.log('='.repeat(60));
  console.log('');

  const { compositionId, outputFile } = parseArgs();

  console.log(`Composition: ${compositionId}`);
  console.log(`Output:      ${outputFile}`);
  console.log('');

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build and execute render command
  const command = buildRenderCommand(compositionId, outputFile);
  console.log('Rendering...\n');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error('\nRender failed:', error);
    process.exit(1);
  }

  // Validate output
  console.log('');
  console.log('Validating output...');

  const validation = validateOutput(outputFile);

  if (!validation.fileExists) {
    console.error('✗ Validation failed: Output file not created');
    process.exit(1);
  }

  console.log(`  File size: ${formatFileSize(validation.fileSize)}`);

  if (validation.errors.length > 0) {
    console.error('✗ Validation warnings:');
    validation.errors.forEach((err) => console.error(`  - ${err}`));
  }

  if (validation.success) {
    console.log('✓ Validation passed');
    console.log('');
    console.log('Render complete!');
    console.log(`Output: ${outputFile}`);
  } else {
    console.error('✗ Validation failed');
    process.exit(1);
  }
}

main();
