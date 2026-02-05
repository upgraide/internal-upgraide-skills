/**
 * FloatingVideoCard - Casino-level animated floating card for maximum retention
 *
 * Features bold 3D animations inspired by casino roulette physics:
 * - Continuous 3D rotation (never fully static)
 * - Layered rhythm system (multiple cycles that never repeat exactly)
 * - Independent shadow parallax (creates premium depth)
 * - Fast snappy entry/exit transitions
 * - Momentum-based scaling with deceleration curves
 */

import React from "react";
import { AbsoluteFill, Video, interpolate, useCurrentFrame, Easing } from "remotion";

interface FloatingVideoCardProps {
  videoSource: string;
  startFrom: number;
  volume?: number;
  durationInFrames?: number; // Required for exit animation timing

  // NEW: Morphing transition props
  isEnteringFromSplit?: boolean; // True when transitioning FROM SplitScreenLayout
  isExitingToSplit?: boolean; // True when transitioning TO SplitScreenLayout
}

export const FloatingVideoCard: React.FC<FloatingVideoCardProps> = ({
  videoSource,
  startFrom,
  volume = 0,
  durationInFrames = 60, // Default 2 seconds if not specified
  isEnteringFromSplit = false,
  isExitingToSplit = false,
}) => {
  const frame = useCurrentFrame();

  // ==================== LAYERED RHYTHM SYSTEM ====================
  // Uses prime-like numbers to ensure organic, never-repeating motion

  // Enhanced vertical float: ±12px (stronger than subtle version)
  const floatY = interpolate(
    frame % 60, // 2.0 seconds
    [0, 30, 60],
    [0, -12, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // Momentum-based scale: roulette-inspired deceleration
  const momentumScale = interpolate(
    frame % 87, // 2.9 seconds (prime-like)
    [0, 22, 65, 87],
    [1.0, 1.04, 1.015, 1.0], // Speed up → cruise → slow down
    { easing: Easing.bezier(0.61, 1.0, 0.88, 1.0) } // Custom ease-out-sine
  );

  // Bold 3D tilt X-axis: ±3° rotation
  const tiltX = interpolate(
    frame % 173, // 5.77 seconds (prime-like)
    [0, 43, 87, 130, 173],
    [0, -3, 0, 3, 0], // degrees
    { easing: Easing.inOut(Easing.sin) }
  );

  // Bold 3D tilt Y-axis: ±2° rotation (different timing creates organic feel)
  const tiltY = interpolate(
    frame % 241, // 8.03 seconds (prime-like)
    [0, 60, 120, 181, 241],
    [0, 2, 0, -2, 0], // degrees
    { easing: Easing.inOut(Easing.sin) }
  );

  // ==================== SHADOW PARALLAX SYSTEM ====================

  // Shadow floats at 60% of card speed (parallax depth illusion)
  const shadowFloatY = interpolate(
    frame % 79, // 2.63 seconds (offset from card cycle)
    [0, 40, 79],
    [0, -7, 0], // 60% of card's 12px movement
    { easing: Easing.inOut(Easing.ease) }
  );

  // Shadow intensity pulse (independent from card)
  const shadowPulse = interpolate(
    frame % 127, // 4.23 seconds (prime-like)
    [0, 64, 127],
    [0, 0.1, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // Dynamic shadow blur based on tilt angle (simulated light source)
  const tiltIntensity = Math.abs(tiltX) + Math.abs(tiltY);
  const shadowBlur = 60 + (tiltIntensity * 3);
  const shadowSpread = 16 + (tiltIntensity * 2);

  // 3-layer shadow system
  const ambientShadow = `0 ${20 + shadowFloatY * 0.5}px ${shadowBlur}px rgba(0,0,0,${0.25 + shadowPulse})`;
  const directShadow = `0 ${8 + shadowFloatY}px ${shadowSpread}px rgba(0,0,0,${0.18 + tiltIntensity * 0.01})`;
  const glowShadow = `0 ${4 + shadowFloatY * 1.5}px 12px rgba(255,255,255,${0.12})`;

  // ==================== FAST ENTRY/EXIT ANIMATIONS ====================

  // Fast entry (6 frames = 0.2s): Coordinates with SplitScreenLayout

  let entranceScale = 1.0;
  let entranceY = 0;
  let entranceOpacity = 1.0;

  if (frame < 6) {
    if (isEnteringFromSplit) {
      // Morphing from split: Start from split top position (larger, higher)
      entranceScale = interpolate(
        frame,
        [0, 6],
        [0.58, 1.0], // Split top section is ~58% size of card (1/1.7)
        {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }
      );

      entranceY = interpolate(
        frame,
        [0, 6],
        [-25, 0], // Move from top (-25% up from center) to center
        {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }
      );

      entranceOpacity = interpolate(
        frame,
        [0, 4],
        [0.3, 1], // Start slightly visible (continuity from split)
        {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.ease),
        }
      );
    } else {
      // Standard entry (not from split): Original animation
      entranceScale = interpolate(
        frame,
        [0, 3, 6],
        [0.88, 1.08, 1.0], // Overshoot for snappy feel
        {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.back(2.0)),
        }
      );

      entranceY = interpolate(
        frame,
        [0, 6],
        [50, 0], // Slide from 50px below
        {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }
      );

      entranceOpacity = interpolate(
        frame,
        [0, 5],
        [0, 1],
        {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.ease),
        }
      );
    }
  }

  // Fast exit (6 frames = 0.2s): Coordinates with SplitScreenLayout
  const exitStartFrame = durationInFrames - 6;
  const isExiting = frame >= exitStartFrame;

  let exitScale = 1.0;
  let exitY = 0;
  let exitOpacity = 1.0;
  let exitRotate = 0;

  if (isExiting) {
    if (isExitingToSplit) {
      // Morphing to split: Shrink to split top size and move to top
      exitScale = interpolate(
        frame,
        [exitStartFrame, durationInFrames],
        [1.0, 0.77], // Shrink toward split size (1/1.3)
        {
          extrapolateLeft: "clamp",
          easing: Easing.in(Easing.cubic),
        }
      );

      exitY = interpolate(
        frame,
        [exitStartFrame, durationInFrames],
        [0, -15], // Move toward top (-15% up from center)
        {
          extrapolateLeft: "clamp",
          easing: Easing.in(Easing.cubic),
        }
      );

      exitOpacity = interpolate(
        frame,
        [exitStartFrame, durationInFrames],
        [1, 0.4], // Fade but stay visible (continuity to split)
        {
          extrapolateLeft: "clamp",
          easing: Easing.in(Easing.ease),
        }
      );

      exitRotate = 0; // No rotation for morphing transition
    } else {
      // Standard exit (not to split): Original animation
      exitScale = interpolate(
        frame,
        [exitStartFrame, durationInFrames],
        [1.0, 0.85],
        {
          extrapolateLeft: "clamp",
          easing: Easing.in(Easing.cubic),
        }
      );

      exitOpacity = interpolate(
        frame,
        [exitStartFrame, durationInFrames],
        [1, 0],
        {
          extrapolateLeft: "clamp",
          easing: Easing.in(Easing.ease),
        }
      );

      exitRotate = interpolate(
        frame,
        [exitStartFrame, durationInFrames],
        [0, -5],
        {
          extrapolateLeft: "clamp",
          easing: Easing.in(Easing.ease),
        }
      );
    }
  }

  // ==================== COMBINED TRANSFORMS ====================

  const finalScale = momentumScale * entranceScale * exitScale;
  const finalOpacity = entranceOpacity * exitOpacity;
  const finalY = floatY + entranceY + exitY;

  // Subtle radial gradient background (changes based on tilt for depth)
  const gradientX = 50 + (tiltY * 5);
  const gradientY = 50 + (tiltX * 5);
  const backgroundColor = `radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(255,255,255,1) 0%, rgba(252,252,254,1) 100%)`;

  return (
    <AbsoluteFill style={{ background: backgroundColor }}>
      {/* Centered video card with bold 3D animation and layered shadows */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `
            translate(-50%, calc(-50% + ${finalY}px))
            perspective(1000px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            rotateZ(${exitRotate}deg)
            scale(${finalScale})
          `,
          width: "85%",
          height: "auto",
          aspectRatio: "16/9",
          maxHeight: "60%",
          boxShadow: `${ambientShadow}, ${directShadow}, ${glowShadow}`,
          borderRadius: "16px",
          overflow: "hidden",
          opacity: finalOpacity,
          transformStyle: "preserve-3d",
        }}
      >
        <Video
          src={videoSource}
          startFrom={startFrom}
          volume={volume}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
