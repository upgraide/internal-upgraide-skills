#!/usr/bin/env ts-node
/**
 * Preview Script
 *
 * Launches Remotion Studio for previewing compositions in browser.
 *
 * Usage:
 *   tsx .claude/skills/assembling-video/scripts/preview.ts
 */

import { execSync } from 'child_process';
import { ENTRY_POINT } from './remotion-config';

function main() {
  console.log('='.repeat(60));
  console.log('Remotion Studio Preview');
  console.log('='.repeat(60));
  console.log('');
  console.log('Launching Remotion Studio...');
  console.log('Press Ctrl+C to stop');
  console.log('');

  const command = `npx remotion studio ${ENTRY_POINT}`;

  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    // User likely pressed Ctrl+C
    console.log('\nStudio closed.');
  }
}

main();
