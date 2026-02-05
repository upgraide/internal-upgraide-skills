/**
 * SplitScreenCaptions - Animated labels for split-screen layouts
 *
 * Displays bold labels centered in each half of a split-screen composition.
 * Labels animate in with fade + slide, synced to voiceover timing.
 *
 * **Use when:**
 * - Split-screen showing two related concepts (e.g., "MULTI-AI" / "AI MEMORY")
 * - Educational content requiring visual labels
 * - Comparison layouts
 *
 * **Features:**
 * - 8-frame fade-in + slide animation
 * - Impact typography (bold, uppercase, strong shadow)
 * - Configurable appear timing for each label
 * - Works with any split ratio
 *
 * @example
 * <SplitScreenCaptions
 *   topLabel="MULTI-AI"
 *   bottomLabel="AI MEMORY"
 *   topAppearFrame={0}
 *   bottomAppearFrame={69}  // 2.3s at 30fps
 * />
 */

import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface SplitScreenCaptionsProps {
  topLabel: string;
  topSubtitle?: string;
  bottomLabel: string;
  bottomSubtitle?: string;
  topAppearFrame?: number;
  bottomAppearFrame?: number;
  splitRatio?: number;
}

export const SplitScreenCaptions: React.FC<SplitScreenCaptionsProps> = ({
  topLabel,
  topSubtitle,
  bottomLabel,
  bottomSubtitle,
  topAppearFrame = 0,
  bottomAppearFrame = 30,
  splitRatio = 0.5,
}) => {
  const frame = useCurrentFrame();

  // Animation for top label
  const topOpacity = interpolate(
    frame,
    [topAppearFrame, topAppearFrame + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.ease) }
  );
  const topSlide = interpolate(
    frame,
    [topAppearFrame, topAppearFrame + 8],
    [15, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Animation for bottom label
  const bottomOpacity = interpolate(
    frame,
    [bottomAppearFrame, bottomAppearFrame + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.ease) }
  );
  const bottomSlide = interpolate(
    frame,
    [bottomAppearFrame, bottomAppearFrame + 8],
    [15, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const labelStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  };

  const mainLabelStyle: React.CSSProperties = {
    fontFamily: "'Impact', 'Arial Black', 'Helvetica Neue', sans-serif",
    fontSize: 72,
    fontWeight: 900,
    color: "#FFFFFF",
    textAlign: "center",
    textTransform: "uppercase",
    textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)",
    letterSpacing: "0.02em",
    lineHeight: 1.1,
  };

  return (
    <>
      {/* Top section label - centered in top half */}
      <div
        style={{
          ...labelStyle,
          top: `${(splitRatio * 100) / 2 - 5}%`,
          opacity: topOpacity,
          transform: `translateX(-50%) translateY(${topSlide}px)`,
        }}
      >
        <div style={mainLabelStyle}>{topLabel}</div>
      </div>

      {/* Bottom section label - centered in bottom half */}
      <div
        style={{
          ...labelStyle,
          top: `${splitRatio * 100 + ((1 - splitRatio) * 100) / 2 - 5}%`,
          opacity: bottomOpacity,
          transform: `translateX(-50%) translateY(${bottomSlide}px)`,
        }}
      >
        <div style={mainLabelStyle}>{bottomLabel}</div>
      </div>
    </>
  );
};
