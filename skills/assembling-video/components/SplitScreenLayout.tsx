/**
 * SplitScreenLayout - Morphing split screen with shared element continuity
 *
 * Creates illusion of top section morphing into/from FloatingVideoCard.
 * - Fast 6-frame entry/exit animations
 * - Position/scale coordination with FloatingVideoCard
 * - Maintains 61.8 cuts/min fast pace (no overlaps)
 *
 * **Morphing behavior:**
 * - Entering from card: Top section starts at center (card position), morphs to top
 * - Exiting to card: Top section scales up and moves toward center
 * - Bottom section fades in/out during transitions
 */

import React from 'react';
import { AbsoluteFill, Video, Img, useCurrentFrame, interpolate, Easing } from 'remotion';

interface SplitScreenLayoutProps {
  topSource: string;
  bottomSource: string;
  topStartFrom?: number;
  bottomStartFrom?: number;
  splitRatio?: number;
  topVolume?: number;
  bottomVolume?: number;
  topType?: 'video' | 'image';
  bottomType?: 'video' | 'image';
  objectFit?: 'cover' | 'contain'; // How to fit videos in their sections

  // NEW: Morphing transition props
  durationInFrames?: number; // Required for exit animation
  isEnteringFromCard?: boolean; // True when transitioning FROM FloatingVideoCard
  isExitingToCard?: boolean; // True when transitioning TO FloatingVideoCard
  isHook?: boolean; // True for hook scene - adds zoom-out effect
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  topSource,
  bottomSource,
  topStartFrom = 0,
  bottomStartFrom = 0,
  splitRatio = 0.5,
  topVolume = 1.0,
  bottomVolume = 0.0,
  topType = 'video',
  bottomType = 'video',
  objectFit = 'cover',
  durationInFrames = 60,
  isEnteringFromCard = false,
  isExitingToCard = false,
  isHook = false,
}) => {
  const frame = useCurrentFrame();

  // ==================== HOOK ZOOM EFFECT ====================
  // Zoom-out animation: 1.2x → 1.0x over 6 frames (0.2s at 30fps)
  // Only applies to hook scene
  const hookZoomScale = isHook
    ? interpolate(
        frame,
        [0, 6],
        [1.2, 1.0], // Start at 120%, end at 100%
        {
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.ease),
        }
      )
    : 1.0;

  // ==================== ENTRY ANIMATION ====================
  // 6 frames (0.2s) - Fast snappy reveal

  let topEntryScale = 1.0;
  let topEntryY = 0;
  let bottomEntryY = 0;
  let entryOpacity = 1.0;

  if (isEnteringFromCard && frame < 6) {
    // Entering from card: Top section starts at center (where card was)
    // Morphs from card size/position to split position

    topEntryScale = interpolate(
      frame,
      [0, 6],
      [1.7, 1.0], // Card is ~1.7x larger than split top section
      {
        easing: Easing.out(Easing.cubic),
        extrapolateRight: 'clamp'
      }
    );

    topEntryY = interpolate(
      frame,
      [0, 6],
      [25, 0], // Move from center (25% down) to top (0%)
      {
        easing: Easing.out(Easing.cubic),
        extrapolateRight: 'clamp'
      }
    );

    bottomEntryY = interpolate(
      frame,
      [0, 6],
      [15, 0], // Slide up from slightly below
      {
        easing: Easing.out(Easing.cubic),
        extrapolateRight: 'clamp'
      }
    );

    entryOpacity = interpolate(
      frame,
      [0, 6],
      [0, 1],
      {
        easing: Easing.out(Easing.ease),
        extrapolateRight: 'clamp'
      }
    );
  } else if (!isEnteringFromCard && frame < 6) {
    // Standard entry (not from card): Simple slide-in

    // For hook scenes, skip slide animations to let zoom effect be visible
    if (!isHook) {
      topEntryY = interpolate(
        frame,
        [0, 6],
        [-10, 0],
        {
          easing: Easing.out(Easing.cubic),
          extrapolateRight: 'clamp'
        }
      );

      bottomEntryY = interpolate(
        frame,
        [0, 6],
        [10, 0],
        {
          easing: Easing.out(Easing.cubic),
          extrapolateRight: 'clamp'
        }
      );

      entryOpacity = interpolate(
        frame,
        [0, 6],
        [0, 1],
        {
          easing: Easing.out(Easing.ease),
          extrapolateRight: 'clamp'
        }
      );
    } else {
      // Hook scene: no slide or fade, start fully visible for zoom effect
      entryOpacity = 1.0;
    }
  }

  // ==================== EXIT ANIMATION ====================
  // 6 frames (0.2s) - Coordinates with FloatingVideoCard entry

  const exitStartFrame = durationInFrames - 6;
  const isExiting = frame >= exitStartFrame;

  let topExitScale = 1.0;
  let topExitY = 0;
  let bottomExitOpacity = 1.0;

  if (isExitingToCard && isExiting) {
    // Exiting to card: Top section scales up and moves toward center
    // Prepares for FloatingVideoCard entry

    topExitScale = interpolate(
      frame,
      [exitStartFrame, durationInFrames],
      [1.0, 1.3], // Scale up toward card size
      {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: 'clamp'
      }
    );

    topExitY = interpolate(
      frame,
      [exitStartFrame, durationInFrames],
      [0, 15], // Move down toward center
      {
        easing: Easing.in(Easing.cubic),
        extrapolateLeft: 'clamp'
      }
    );

    bottomExitOpacity = interpolate(
      frame,
      [exitStartFrame, durationInFrames],
      [1, 0.3], // Fade out bottom section
      {
        easing: Easing.in(Easing.ease),
        extrapolateLeft: 'clamp'
      }
    );
  }

  // ==================== COMBINED TRANSFORMS ====================

  const finalTopScale = topEntryScale * topExitScale;
  const finalTopY = topEntryY + topExitY;
  const finalBottomY = bottomEntryY;
  const finalOpacity = entryOpacity;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      {/* Hook zoom wrapper - applies zoom effect to entire composition from screen center */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transform: `scale(${hookZoomScale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Top section - Morphs to/from FloatingVideoCard */}
        <div
          style={{
            position: 'absolute',
            top: `${finalTopY}%`,
            width: '100%',
            height: `${splitRatio * 100}%`,
            overflow: 'hidden',
            transform: `scale(${finalTopScale})`,
            transformOrigin: 'center center',
            opacity: finalOpacity,
          }}
        >
        {/* Blurred background */}
        {topType === 'video' ? (
          <Video
            src={topSource}
            startFrom={topStartFrom}
            volume={0}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(20px) brightness(0.4)',
              transform: 'scale(1.1)',
            }}
          />
        ) : (
          <Img
            src={topSource}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(20px) brightness(0.4)',
              transform: 'scale(1.1)',
            }}
          />
        )}
        {/* Foreground - original aspect ratio */}
        {topType === 'video' ? (
          <Video
            src={topSource}
            startFrom={topStartFrom}
            volume={topVolume}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Img
            src={topSource}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </div>

      {/* Bottom section - Fades during transitions */}
      <div
        style={{
          position: 'absolute',
          top: `${splitRatio * 100 + finalBottomY}%`,
          width: '100%',
          height: `${(1 - splitRatio) * 100}%`,
          overflow: 'hidden',
          opacity: finalOpacity * bottomExitOpacity,
        }}
      >
        {/* Blurred background */}
        {bottomType === 'video' ? (
          <Video
            src={bottomSource}
            startFrom={bottomStartFrom}
            volume={0}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(20px) brightness(0.4)',
              transform: 'scale(1.1)',
            }}
          />
        ) : (
          <Img
            src={bottomSource}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(20px) brightness(0.4)',
              transform: 'scale(1.1)',
            }}
          />
        )}
        {/* Foreground - original aspect ratio */}
        {bottomType === 'video' ? (
          <Video
            src={bottomSource}
            startFrom={bottomStartFrom}
            volume={bottomVolume}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Img
            src={bottomSource}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </div>

      {/* Divider line (fades with content) */}
      <div
        style={{
          position: 'absolute',
          top: `${splitRatio * 100 + finalBottomY}%`,
          width: '100%',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          opacity: finalOpacity * bottomExitOpacity,
        }}
      />
      </div>
    </AbsoluteFill>
  );
};
