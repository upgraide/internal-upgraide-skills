/**
 * FlashTransition - Quick flash overlay for punchy scene transitions
 *
 * Creates a brief (1-2 frame) white/colored flash at transition points.
 * Synchronizes with sound effects to enhance visual rhythm.
 *
 * Usage:
 * <Sequence from={transitionFrame}>
 *   <FlashTransition duration={2} color="#ffffff" intensity={0.8} />
 * </Sequence>
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface FlashTransitionProps {
  /**
   * Duration of flash in frames (default: 2 frames)
   */
  duration?: number;

  /**
   * Flash color (default: white)
   */
  color?: string;

  /**
   * Maximum opacity/intensity (0-1, default: 0.6)
   */
  intensity?: number;

  /**
   * Flash style: 'instant' or 'fade'
   * - instant: Full opacity immediately, then fade out
   * - fade: Fade in and out quickly
   */
  style?: 'instant' | 'fade';
}

export const FlashTransition: React.FC<FlashTransitionProps> = ({
  duration = 2,
  color = '#ffffff',
  intensity = 0.6,
  style = 'instant',
}) => {
  const frame = useCurrentFrame();

  let opacity = 0;

  if (style === 'instant') {
    // Instant flash: full brightness immediately, then fade out
    opacity = interpolate(
      frame,
      [0, duration],
      [intensity, 0],
      {
        extrapolateRight: 'clamp',
      }
    );
  } else {
    // Fade style: quick fade in and out
    const midpoint = duration / 2;

    if (frame < midpoint) {
      // Fade in (first half)
      opacity = interpolate(
        frame,
        [0, midpoint],
        [0, intensity],
        {
          extrapolateRight: 'clamp',
        }
      );
    } else {
      // Fade out (second half)
      opacity = interpolate(
        frame,
        [midpoint, duration],
        [intensity, 0],
        {
          extrapolateRight: 'clamp',
        }
      );
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
