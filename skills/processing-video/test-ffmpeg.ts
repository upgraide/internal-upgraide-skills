/**
 * Test script for FFmpeg skill operations
 *
 * Usage: npx tsx .claude/skills/processing-video/test-ffmpeg.ts
 */

import { resolve } from 'path';
import { getMetadata, getDuration, getResolution } from './scripts/get-metadata';
import { cutClip, secondsToTimestamp, validateTimestamp } from './scripts/cut-clip';
import { downgradeQuality, getRecommendedTarget } from './scripts/downgrade-quality';

// Test video paths
const TEST_VIDEOS = {
  video1: resolve('./get.mp4'),
  video2: resolve('./YTDown.com_YouTube_Unlock-Amazing-AI-Videos-5-JSON-Prompt-G_Media_Y8NqLfO3AEU_003_480p.mp4'),
};

// Output directory
const OUTPUT_DIR = resolve('./outputs');

async function main() {
  console.log('🧪 FFmpeg Skill Test Suite\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Metadata Extraction
    console.log('\n📊 TEST 1: Metadata Extraction\n');
    await testMetadataExtraction();

    // Test 2: Clip Cutting
    console.log('\n✂️  TEST 2: Clip Cutting\n');
    await testClipCutting();

    // Test 3: Quality Downgrade
    console.log('\n📉 TEST 3: Quality Downgrade\n');
    await testQualityDowngrade();

    // Test 4: Helper Functions
    console.log('\n🔧 TEST 4: Helper Functions\n');
    testHelperFunctions();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test metadata extraction operations
 */
async function testMetadataExtraction() {
  console.log('Testing with get.mp4...');

  // Test full metadata
  const metadata = await getMetadata(TEST_VIDEOS.video1);
  console.log(`  Full metadata:`, metadata);

  // Test duration only
  const duration = await getDuration(TEST_VIDEOS.video1);
  console.log(`  Duration: ${duration}s`);

  // Test resolution only
  const resolution = await getResolution(TEST_VIDEOS.video1);
  console.log(`  Resolution: ${resolution.width}x${resolution.height}\n`);

  console.log('Testing with YTDown video...');
  const metadata2 = await getMetadata(TEST_VIDEOS.video2);
  console.log(`  Full metadata:`, metadata2);
}

/**
 * Test clip cutting operations
 */
async function testClipCutting() {
  console.log('Cutting 5-second clip from get.mp4 (0:05 → 0:10)...');

  const outputPath1 = `${OUTPUT_DIR}/test-clip-001.mp4`;

  const result1 = await cutClip({
    inputPath: TEST_VIDEOS.video1,
    outputPath: outputPath1,
    startTime: '00:00:05.000',
    endTime: '00:00:10.000',
    precision: 'millisecond',
  });

  if (result1.success) {
    console.log(`  ✅ Clip saved to: ${outputPath1}`);

    // Verify output
    const clipDuration = await getDuration(outputPath1);
    console.log(`  Verification: ${clipDuration.toFixed(2)}s (expected ~5.0s)\n`);
  } else {
    throw new Error(`Clip cutting failed: ${result1.error}`);
  }

  console.log('Cutting 3-second clip from YTDown video (0:02 → 0:05)...');

  const outputPath2 = `${OUTPUT_DIR}/test-clip-002.mp4`;

  const result2 = await cutClip({
    inputPath: TEST_VIDEOS.video2,
    outputPath: outputPath2,
    startTime: '00:00:02',
    endTime: '00:00:05',
    precision: 'second',
  });

  if (result2.success) {
    console.log(`  ✅ Clip saved to: ${outputPath2}`);

    const clipDuration = await getDuration(outputPath2);
    console.log(`  Verification: ${clipDuration.toFixed(2)}s (expected ~3.0s)`);
  } else {
    throw new Error(`Clip cutting failed: ${result2.error}`);
  }
}

/**
 * Test quality downgrade operations
 */
async function testQualityDowngrade() {
  // Get resolution of test video
  const resolution = await getResolution(TEST_VIDEOS.video2);
  console.log(`Current resolution: ${resolution.width}x${resolution.height}`);

  // Get recommended target
  const recommended = getRecommendedTarget(resolution.width, resolution.height);
  console.log(`Recommended target: ${recommended}\n`);

  console.log(`Downgrading YTDown video to 480p...`);

  const outputPath = `${OUTPUT_DIR}/test-downgraded-480p.mp4`;

  const result = await downgradeQuality({
    inputPath: TEST_VIDEOS.video2,
    outputPath: outputPath,
    target: '480p',
  });

  if (result.success) {
    console.log(`  ✅ Downgraded video saved to: ${outputPath}`);

    // Verify output resolution
    const newResolution = await getResolution(outputPath);
    console.log(`  Verification: ${newResolution.width}x${newResolution.height} (expected 854x480)`);
  } else {
    throw new Error(`Quality downgrade failed: ${result.error}`);
  }
}

/**
 * Test helper functions
 */
function testHelperFunctions() {
  console.log('Testing timestamp validation...');

  const testTimestamps = [
    '45.5',           // Valid: seconds
    '01:30',          // Valid: MM:SS
    '00:01:30',       // Valid: HH:MM:SS
    '00:01:30.500',   // Valid: HH:MM:SS.mmm
    'invalid',        // Invalid
    '1:5',            // Invalid (should be 01:05)
  ];

  testTimestamps.forEach((ts) => {
    const isValid = validateTimestamp(ts);
    console.log(`  "${ts}" → ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });

  console.log('\nTesting timestamp conversion...');

  const testSeconds = [45.5, 90.123, 3661.789];

  testSeconds.forEach((sec) => {
    const tsSecond = secondsToTimestamp(sec, 'second');
    const tsMilli = secondsToTimestamp(sec, 'millisecond');
    console.log(`  ${sec}s → ${tsSecond} (second) | ${tsMilli} (millisecond)`);
  });
}

// Run tests
main();
