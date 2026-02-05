/**
 * CrossedOutLogo - Display a logo with animated red cross bar
 *
 * **Production-ready component** for "Forget X" or "No more X" hook effects.
 * Creates visual impact by showing a brand logo that gets dramatically crossed out.
 *
 * **Features:**
 * - Smooth fade-in animation (8 frames default)
 * - Diagonal red cross bar with bouncy effect
 * - Rounded corners for modern look
 * - Configurable size, position, timing, and colors
 * - Red glow effect on cross for extra impact
 *
 * **When to use:**
 * - "Forget [brand]" or "No more [brand]" hooks
 * - Comparison videos highlighting alternatives
 * - Disruption/replacement messaging
 * - Opening hooks that grab attention
 *
 * **Timing recommendations:**
 * - Start logo during or just before brand mention
 * - Allow 8-10 frames for fade-in before cross appears
 * - Total duration: 20-30 frames (0.67-1s at 30fps) for maximum impact
 *
 * **Tested in:** FastPacedPimelliDemo (Pimelli vs Canva hook)
 *
 * @example
 * // Basic usage - appears during "Forget Canva" (frames 5-30)
 * <Sequence from={5} durationInFrames={25}>
 *   <CrossedOutLogo logoSource={staticFile('logos/canva.png')} />
 * </Sequence>
 *
 * @example
 * // Customized - smaller, top-center, faster animation
 * <Sequence from={10} durationInFrames={20}>
 *   <CrossedOutLogo
 *     logoSource={staticFile('logos/competitor.png')}
 *     logoSize={200}
 *     position="top-center"
 *     crossDelay={5}
 *     borderRadius={16}
 *   />
 * </Sequence>
 */

import React from 'react';
import { useCurrentFrame, interpolate, Img, Easing } from 'remotion';

interface CrossedOutLogoProps {
  /** Path to logo image (use staticFile()) */
  logoSource: string;

  /** Logo size in pixels (square) */
  logoSize?: number;

  /** Position on screen */
  position?: 'top-center' | 'center' | 'above-caption';

  /** Cross bar color */
  crossColor?: string;

  /** Cross bar thickness */
  crossThickness?: number;

  /** Animation delay in frames before cross appears */
  crossDelay?: number;

  /** Border radius for rounded corners */
  borderRadius?: number;
}

export const CrossedOutLogo: React.FC<CrossedOutLogoProps> = ({
  logoSource,
  logoSize = 260,
  position = 'above-caption',
  crossColor = '#FF0000',
  crossThickness = 10,
  crossDelay = 10,
  borderRadius = 24,
}) => {
  const frame = useCurrentFrame();

  // Logo fade in (slower - 8 frames for more impact)
  const logoOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });

  // Cross bar animation: slides in diagonally after delay (slower - 12 frames)
  const crossProgress = interpolate(
    frame,
    [crossDelay, crossDelay + 12], // Cross appears over 12 frames (slower)
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.5)), // Bouncy effect
    }
  );

  // Position styles
  const positionStyles = (() => {
    switch (position) {
      case 'top-center':
        return { top: '10%', left: '50%', transform: 'translateX(-50%)' };
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'above-caption':
        return { bottom: '23%', left: '50%', transform: 'translateX(-50%)' };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  })();

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 90,
        ...positionStyles,
      }}
    >
      {/* Logo container with fade in */}
      <div
        style={{
          position: 'relative',
          width: logoSize,
          height: logoSize,
          opacity: logoOpacity,
          borderRadius: borderRadius,
          overflow: 'hidden',
        }}
      >
        {/* Logo image */}
        <Img
          src={logoSource}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />

        {/* Red cross bar - diagonal slash from top-left to bottom-right */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${Math.sqrt(2) * logoSize * crossProgress}px`, // Diagonal length
            height: crossThickness,
            backgroundColor: crossColor,
            transform: `translate(-50%, -50%) rotate(-45deg)`,
            transformOrigin: 'center',
            borderRadius: crossThickness / 2,
            boxShadow: `0 0 ${crossThickness * 2}px rgba(255, 0, 0, 0.8)`,
          }}
        />
      </div>
    </div>
  );
};
