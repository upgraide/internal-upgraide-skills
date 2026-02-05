/**
 * ⚠️ WORK IN PROGRESS - NOT PRODUCTION QUALITY ⚠️
 *
 * Fast-Paced Tech Demo Pattern
 *
 * **Status:** First iteration - starting point only, requires significant refinement
 *
 * **Style:** Fast-paced Instagram Reel matching tech demo reference
 * - Alternating full avatar and split-screen layouts
 * - Hard cuts (no transitions)
 * - Real captions from transcription with smart positioning
 * - Opening zoom hook effect
 *
 * **What works:**
 * ✅ Split-screen layout (B-roll top, avatar bottom)
 * ✅ Zoom hook at beginning (1.3x → 1.0x over 0.5s)
 * ✅ Avatar lip-sync maintained (continuous audio, synced video cuts)
 * ✅ Caption positioning (centered on split-screens, bottom on full avatar)
 * ✅ Real transcription data integration
 *
 * **Known issues / Needs significant improvement:**
 * ❌ Caption timing precision - needs manual adjustment per video
 * ❌ Scene durations are rough estimates - requires tuning
 * ❌ No scene-to-caption semantic matching
 * ❌ Split ratio (50/50) may not be optimal for all content
 * ❌ Text overlay timing may not align perfectly with narration
 * ❌ Zoom hook amount/duration needs testing with different content
 * ❌ No consideration for music/background audio ducking
 * ❌ B-roll clip selection is manual - not automated
 *
 * **Iterative notes from development:**
 * - Started with 1.15x zoom, increased to 1.3x for better hook effect
 * - Reduced zoom duration from 1.5s to 0.5s per user feedback
 * - Text positioning: tried bottom-only, added center for split-screens for symmetry
 * - Avatar sync was broken initially (restarting on each cut), fixed by using composition timeline
 *
 * **Use as starting point for:**
 * - Fast-paced tech tutorials
 * - Product demos with split-screen UI + speaker
 * - Instagram Reels with high-energy pacing
 * - Videos with multiple brand mentions
 *
 * **DO NOT use as-is. Requires:**
 * 1. Manual scene timing adjustment based on your specific narration
 * 2. Caption text and timing refinement
 * 3. B-roll clip selection and placement
 * 4. Testing and iteration with real user feedback
 * 5. Potential audio mixing if adding background music
 */

import React from 'react';
import {
  AbsoluteFill,
  Series,
  Video,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import { SplitScreenLayout } from '../components/SplitScreenLayout';
import { SyncedTextOverlay } from '../components/SyncedTextOverlay';
import timelineData from '../../../workspace/timeline.json';

interface Scene {
  type: 'avatar' | 'split';
  durationInFrames: number;
  brollSource?: string;
  brollStartFrom?: number;
}

export const FastPacedTechDemoWIP: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Opening zoom hook (1.3x → 1.0x over 0.5 seconds)
  const hookZoomDuration = 15; // 0.5s at 30fps
  const hookZoom =
    frame < hookZoomDuration
      ? interpolate(frame, [0, hookZoomDuration], [1.3, 1.0], {
          extrapolateRight: 'clamp',
        })
      : 1.0;

  // Scene structure: Alternate between full avatar and split-screen
  // NOTE: These timings are rough - adjust based on your narration
  const scenes: Scene[] = [
    { type: 'avatar', durationInFrames: 45 }, // 0-1.5s
    {
      type: 'split',
      durationInFrames: 150, // 1.5-6.5s
      brollSource: 'inputs/broll/clip1.mp4',
      brollStartFrom: 0,
    },
    { type: 'avatar', durationInFrames: 75 }, // 6.5-9s
    {
      type: 'split',
      durationInFrames: 150, // 9-14s
      brollSource: 'inputs/broll/clip2.mp4',
      brollStartFrom: 0,
    },
    // Add more scenes as needed...
  ];

  // Calculate scene timings
  let currentFrame = 0;
  const sceneTimings = scenes.map((scene) => {
    const start = currentFrame;
    currentFrame += scene.durationInFrames;
    return { ...scene, startFrame: start, endFrame: currentFrame };
  });

  // Convert timeline phrases to captions
  // Position: center for split-screens, bottom for full avatar
  const textCues = timelineData.phrases.map((phrase: any) => {
    const startFrame = Math.round(phrase.start * fps);
    const endFrame = Math.round(phrase.end * fps);

    const isSplitScreen = sceneTimings.some(
      (scene) =>
        scene.type === 'split' &&
        startFrame >= scene.startFrame &&
        startFrame < scene.endFrame
    );

    return {
      text: phrase.text,
      startFrame,
      endFrame,
      position: isSplitScreen ? ('center' as const) : ('bottom' as const),
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Continuous audio from avatar */}
      <Audio src={staticFile('inputs/avatar.mp4')} volume={1.0} />

      {/* Video scenes with zoom hook */}
      <AbsoluteFill
        style={{
          transform: `scale(${hookZoom})`,
          transformOrigin: 'center center',
        }}
      >
        <Series>
          {sceneTimings.map((scene, index) => (
            <Series.Sequence
              key={index}
              durationInFrames={scene.durationInFrames}
            >
              {scene.type === 'avatar' && (
                <Video
                  src={staticFile('inputs/avatar.mp4')}
                  startFrom={scene.startFrame} // Sync with audio timeline
                  volume={0}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}

              {scene.type === 'split' && scene.brollSource && (
                <SplitScreenLayout
                  topSource={staticFile(scene.brollSource)}
                  bottomSource={staticFile('inputs/avatar.mp4')}
                  topStartFrom={scene.brollStartFrom || 0}
                  bottomStartFrom={scene.startFrame}
                  splitRatio={0.5}
                  topVolume={0}
                  bottomVolume={0}
                />
              )}
            </Series.Sequence>
          ))}
        </Series>
      </AbsoluteFill>

      {/* Text overlays (outside zoom container) */}
      <SyncedTextOverlay cues={textCues} />
    </AbsoluteFill>
  );
};
