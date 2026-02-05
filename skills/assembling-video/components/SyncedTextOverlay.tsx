/**
 * SyncedTextOverlay - Frame-synchronized captions with smart positioning
 *
 * **Production-ready component** for displaying captions perfectly synced with audio.
 * Uses word-level timestamps for precise synchronization.
 *
 * **Features:**
 * - Frame-perfect caption display (no drift)
 * - Smooth fade in/out animations (5 frames)
 * - Dynamic positioning (bottom for full screen, center for split-screen)
 * - Special CTA styling support
 * - Customizable fonts, colors, backgrounds
 * - Handles sequential cues automatically
 *
 * **Caption chunking strategy:**
 * - 1-3 words per caption for readability
 * - Grammar-aware (never ends on "a", "the", "of", etc.)
 * - Sentence boundary detection
 * - Natural pause detection (>0.3s gaps)
 *
 * **When to use:**
 * - Fast-paced videos with narration
 * - Instagram Reels requiring captions for engagement
 * - Videos where audio may be muted
 * - Emphasis on key phrases
 *
 * **Design notes:**
 * - White text on semi-transparent black background (default)
 * - CTA captions use transparent background for emphasis
 * - Special highlighting for keywords (e.g., "BRAND" in sky blue)
 * - Position switches automatically based on cue data
 *
 * **Tested in:** FastPacedPimelliDemo (dynamic caption positioning across all scenes)
 *
 * @example
 * const cues = [
 *   { text: "Welcome!", startFrame: 0, endFrame: 30, position: 'bottom' },
 *   { text: "Check this out", startFrame: 45, endFrame: 90, position: 'center' },
 * ];
 *
 * <SyncedTextOverlay cues={cues} />
 */

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface TextCue {
  text: string;
  startFrame: number;
  endFrame: number;
  position?: 'bottom' | 'center'; // Position in frame
  isCTA?: boolean; // Special CTA styling
}

interface SyncedTextOverlayProps {
  cues: TextCue[];
  style?: {
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
  };
}

export const SyncedTextOverlay: React.FC<SyncedTextOverlayProps> = ({
  cues,
  style = {},
}) => {
  const frame = useCurrentFrame();

  // Find active cue for current frame
  const activeCue = cues.find(
    (cue) => frame >= cue.startFrame && frame < cue.endFrame
  );

  if (!activeCue) {
    return null;
  }

  // Fade in/out animation (5 frames = ~0.17s at 30fps)
  const fadeInDuration = 5;
  const fadeOutDuration = 5;
  const cueProgress = frame - activeCue.startFrame;
  const cueRemaining = activeCue.endFrame - frame;

  let opacity = 1;
  if (cueProgress < fadeInDuration) {
    opacity = interpolate(cueProgress, [0, fadeInDuration], [0, 1]);
  } else if (cueRemaining < fadeOutDuration) {
    opacity = interpolate(cueRemaining, [0, fadeOutDuration], [0, 1]);
  }

  // CTA gets special styling
  const isCTA = activeCue.isCTA || false;

  // Check if caption is ONLY "brand" - make it extra large
  const isBrandOnly = isCTA && activeCue.text.toLowerCase().trim() === 'brand';

  const defaultStyle = {
    fontSize: isBrandOnly ? '140px' : (isCTA ? '96px' : '68px'),
    fontWeight: isBrandOnly ? '900' : '700',
    fontFamily: 'Inter, -apple-system, sans-serif',
    color: '#FFFFFF',
    backgroundColor: isCTA ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
    padding: isCTA ? '0' : '0.5rem 1.5rem',
  };

  const finalStyle = { ...defaultStyle, ...style };

  // Position based on cue setting: bottom for full avatar, center for split-screen
  const position = activeCue.position || 'bottom';
  const positionStyles =
    position === 'center'
      ? {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
      : {
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
        };

  // Render text with special styling for "brand" in CTA
  const renderText = () => {
    if (!isCTA) {
      return activeCue.text;
    }

    // Check if text contains "brand" (case insensitive)
    const words = activeCue.text.split(' ');
    return words.map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (lowerWord === 'brand') {
        // Capitalize and apply sky blue color
        return (
          <span
            key={index}
            style={{
              color: '#87CEEB',
              fontWeight: '900',
              textTransform: 'uppercase',
            }}
          >
            {word.toUpperCase()}
          </span>
        );
      }
      return <span key={index}>{word}</span>;
    }).reduce((prev, curr, idx) => {
      if (idx === 0) return [curr];
      return [...prev, ' ', curr];
    }, [] as React.ReactNode[]);
  };

  return (
    <div
      style={{
        position: 'absolute',
        textAlign: 'center',
        maxWidth: '90%',
        opacity,
        zIndex: 100,
        ...positionStyles,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          borderRadius: isCTA ? '0' : '8px',
          textShadow: '2px 2px 3px rgba(0, 0, 0, 0.8)',
          whiteSpace: 'nowrap',
          ...finalStyle,
        }}
      >
        {renderText()}
      </div>
    </div>
  );
};
