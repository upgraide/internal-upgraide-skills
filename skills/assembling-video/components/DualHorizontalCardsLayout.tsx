/**
 * DualHorizontalCardsLayout - Two stacked horizontal B-roll cards with 3D animations
 *
 * Features:
 * - Two independent horizontal 16:9 cards with FloatingVideoCard-style shadows
 * - Each card has independent 3D animations (never sync exactly)
 * - 3-layer shadow system (ambient, direct, glow) for premium depth
 * - Fast entry/exit transitions with morphing support
 * - Configurable spacing and sizing
 *
 * Use cases:
 * - Before/after comparisons
 * - Dual product showcases
 * - Split narrative moments
 * - High-energy multi-content scenes
 */

import React from "react";
import { AbsoluteFill, Video, Img, interpolate, useCurrentFrame, Easing } from "remotion";

interface DualHorizontalCardsLayoutProps {
  // Top card props
  topVideoSource: string;
  topStartFrom?: number;
  topVolume?: number;
  topType?: 'video' | 'image';

  // Bottom card props
  bottomVideoSource: string;
  bottomStartFrom?: number;
  bottomVolume?: number;
  bottomType?: 'video' | 'image';

  // Shared props
  durationInFrames?: number;
  cardSpacing?: number; // Gap between cards in pixels (default: 20)
  cardWidth?: string; // Width as percentage (default: "80%")
}

export const DualHorizontalCardsLayout: React.FC<DualHorizontalCardsLayoutProps> = ({
  topVideoSource,
  topStartFrom = 0,
  topVolume = 0,
  topType = 'video',
  bottomVideoSource,
  bottomStartFrom = 0,
  bottomVolume = 0,
  bottomType = 'video',
  durationInFrames = 60,
  cardSpacing = 20,
  cardWidth = "80%",
}) => {
  const frame = useCurrentFrame();

  // ==================== TOP CARD ANIMATIONS ====================
  // Uses prime-like cycle lengths to ensure never-repeating organic motion

  // Top card vertical float: ±8px
  const topFloatY = interpolate(
    frame % 67, // 2.23 seconds
    [0, 34, 67],
    [0, -8, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // Top card momentum scale
  const topMomentumScale = interpolate(
    frame % 97, // 3.23 seconds
    [0, 24, 73, 97],
    [1.0, 1.03, 1.012, 1.0],
    { easing: Easing.bezier(0.61, 1.0, 0.88, 1.0) }
  );

  // Top card 3D tilt X-axis: ±2.5°
  const topTiltX = interpolate(
    frame % 181, // 6.03 seconds
    [0, 45, 90, 135, 181],
    [0, -2.5, 0, 2.5, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // Top card 3D tilt Y-axis: ±1.5°
  const topTiltY = interpolate(
    frame % 251, // 8.37 seconds
    [0, 63, 125, 188, 251],
    [0, 1.5, 0, -1.5, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // ==================== BOTTOM CARD ANIMATIONS ====================
  // Different cycle lengths create independent motion

  // Bottom card vertical float: ±8px (offset timing)
  const bottomFloatY = interpolate(
    frame % 73, // 2.43 seconds (different from top)
    [0, 37, 73],
    [0, -8, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // Bottom card momentum scale (different timing)
  const bottomMomentumScale = interpolate(
    frame % 103, // 3.43 seconds
    [0, 26, 77, 103],
    [1.0, 1.032, 1.011, 1.0],
    { easing: Easing.bezier(0.61, 1.0, 0.88, 1.0) }
  );

  // Bottom card 3D tilt X-axis: ±2.5° (offset)
  const bottomTiltX = interpolate(
    frame % 193, // 6.43 seconds
    [0, 48, 97, 145, 193],
    [0, 2.5, 0, -2.5, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // Bottom card 3D tilt Y-axis: ±1.5° (offset)
  const bottomTiltY = interpolate(
    frame % 263, // 8.77 seconds
    [0, 66, 132, 197, 263],
    [0, -1.5, 0, 1.5, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  // ==================== SHADOW SYSTEMS ====================

  // Top card shadows
  const topTiltIntensity = Math.abs(topTiltX) + Math.abs(topTiltY);
  const topShadowBlur = 50 + (topTiltIntensity * 3);
  const topShadowSpread = 14 + (topTiltIntensity * 2);

  const topShadowFloatY = interpolate(
    frame % 83, // 2.77 seconds
    [0, 42, 83],
    [0, -6, 0],
    { easing: Easing.inOut(Easing.ease) }
  );

  const topShadowPulse = interpolate(
    frame % 137, // 4.57 seconds
    [0, 69, 137],
    [0, 0.08, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  const topAmbientShadow = `0 ${16 + topShadowFloatY * 0.5}px ${topShadowBlur}px rgba(0,0,0,${0.22 + topShadowPulse})`;
  const topDirectShadow = `0 ${7 + topShadowFloatY}px ${topShadowSpread}px rgba(0,0,0,${0.16 + topTiltIntensity * 0.01})`;
  const topGlowShadow = `0 ${3 + topShadowFloatY * 1.5}px 10px rgba(255,255,255,${0.1})`;

  // Bottom card shadows (offset timing)
  const bottomTiltIntensity = Math.abs(bottomTiltX) + Math.abs(bottomTiltY);
  const bottomShadowBlur = 50 + (bottomTiltIntensity * 3);
  const bottomShadowSpread = 14 + (bottomTiltIntensity * 2);

  const bottomShadowFloatY = interpolate(
    frame % 89, // 2.97 seconds
    [0, 45, 89],
    [0, -6, 0],
    { easing: Easing.inOut(Easing.ease) }
  );

  const bottomShadowPulse = interpolate(
    frame % 149, // 4.97 seconds
    [0, 75, 149],
    [0, 0.08, 0],
    { easing: Easing.inOut(Easing.sin) }
  );

  const bottomAmbientShadow = `0 ${16 + bottomShadowFloatY * 0.5}px ${bottomShadowBlur}px rgba(0,0,0,${0.22 + bottomShadowPulse})`;
  const bottomDirectShadow = `0 ${7 + bottomShadowFloatY}px ${bottomShadowSpread}px rgba(0,0,0,${0.16 + bottomTiltIntensity * 0.01})`;
  const bottomGlowShadow = `0 ${3 + bottomShadowFloatY * 1.5}px 10px rgba(255,255,255,${0.1})`;

  // ==================== ENTRY/EXIT ANIMATIONS ====================

  // Fast entry (6 frames = 0.2s)
  let entranceScale = 1.0;
  let entranceOpacity = 1.0;

  if (frame < 6) {
    entranceScale = interpolate(
      frame,
      [0, 3, 6],
      [0.85, 1.05, 1.0],
      {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(2.0)),
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

  // Fast exit (6 frames = 0.2s)
  const exitStartFrame = durationInFrames - 6;
  const isExiting = frame >= exitStartFrame;

  let exitScale = 1.0;
  let exitOpacity = 1.0;

  if (isExiting) {
    exitScale = interpolate(
      frame,
      [exitStartFrame, durationInFrames],
      [1.0, 0.88],
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
  }

  // ==================== COMBINED TRANSFORMS ====================

  const topFinalScale = topMomentumScale * entranceScale * exitScale;
  const bottomFinalScale = bottomMomentumScale * entranceScale * exitScale;
  const finalOpacity = entranceOpacity * exitOpacity;

  // Subtle gradient backgrounds that shift with tilt
  const topGradientX = 50 + (topTiltY * 5);
  const topGradientY = 50 + (topTiltX * 5);
  const topBackgroundColor = `radial-gradient(circle at ${topGradientX}% ${topGradientY}%, rgba(255,255,255,1) 0%, rgba(252,252,254,1) 100%)`;

  const bottomGradientX = 50 + (bottomTiltY * 5);
  const bottomGradientY = 50 + (bottomTiltX * 5);
  const bottomBackgroundColor = `radial-gradient(circle at ${bottomGradientX}% ${bottomGradientY}%, rgba(255,255,255,1) 0%, rgba(252,252,254,1) 100%)`;

  // Calculate vertical positioning (cards stacked with spacing)
  const cardHeight = `calc((100% - ${cardSpacing}px) / 2)`;
  const topCardTop = "50%";
  const topCardTranslateY = `calc(-100% - ${cardSpacing / 2}px + ${topFloatY}px)`;
  const bottomCardTop = "50%";
  const bottomCardTranslateY = `calc(${cardSpacing / 2}px + ${bottomFloatY}px)`;

  return (
    <AbsoluteFill style={{ background: "#f8f8f8" }}>
      {/* TOP CARD */}
      <div
        style={{
          position: "absolute",
          top: topCardTop,
          left: "50%",
          transform: `
            translate(-50%, ${topCardTranslateY})
            perspective(1000px)
            rotateX(${topTiltX}deg)
            rotateY(${topTiltY}deg)
            scale(${topFinalScale})
          `,
          width: cardWidth,
          height: cardHeight,
          maxHeight: "45%",
          boxShadow: `${topAmbientShadow}, ${topDirectShadow}, ${topGlowShadow}`,
          borderRadius: "14px",
          overflow: "hidden",
          opacity: finalOpacity,
          transformStyle: "preserve-3d",
          background: topBackgroundColor,
        }}
      >
        {topType === 'video' ? (
          <Video
            src={topVideoSource}
            startFrom={topStartFrom}
            volume={topVolume}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Img
            src={topVideoSource}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>

      {/* BOTTOM CARD */}
      <div
        style={{
          position: "absolute",
          top: bottomCardTop,
          left: "50%",
          transform: `
            translate(-50%, ${bottomCardTranslateY})
            perspective(1000px)
            rotateX(${bottomTiltX}deg)
            rotateY(${bottomTiltY}deg)
            scale(${bottomFinalScale})
          `,
          width: cardWidth,
          height: cardHeight,
          maxHeight: "45%",
          boxShadow: `${bottomAmbientShadow}, ${bottomDirectShadow}, ${bottomGlowShadow}`,
          borderRadius: "14px",
          overflow: "hidden",
          opacity: finalOpacity,
          transformStyle: "preserve-3d",
          background: bottomBackgroundColor,
        }}
      >
        {bottomType === 'video' ? (
          <Video
            src={bottomVideoSource}
            startFrom={bottomStartFrom}
            volume={bottomVolume}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Img
            src={bottomVideoSource}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
