/**
 * SliderCard - Before/After Video Comparison Slider
 *
 * Use when: Hook sections comparing transformations, any before/after reveal
 *
 * Features:
 * - Animated clip-path reveal from left to right
 * - Glowing slider line at reveal edge
 * - Before/After labels that fade based on slider position
 * - Spring-based entrance and slider animations
 *
 * @example
 * <SliderCard
 *   beforeSrc="hook/before.mp4"
 *   afterSrc="hook/after.mp4"
 *   entranceFrame={5}
 *   top={250}
 *   sliderDelay={15}
 * />
 */

import React from "react";
import {
  Video,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";

// Tested spring configs
const SPRINGS = {
  entrance: { damping: 15, stiffness: 200, mass: 0.8 },
  slider: { damping: 28, stiffness: 80, mass: 1.2 },
};

interface SliderCardProps {
  /** Path relative to public/ for before video */
  beforeSrc: string;
  /** Path relative to public/ for after video */
  afterSrc: string;
  /** Frame when card enters */
  entranceFrame: number;
  /** Y position from top */
  top: number;
  /** Card width (default: 860) */
  width?: number;
  /** Card height (default: 360) */
  height?: number;
  /** Frames after entrance before slider starts (default: 15) */
  sliderDelay?: number;
  /** Optional zoom for video content */
  videoZoom?: { scale: number; originX: string; originY: string };
}

export const SliderCard: React.FC<SliderCardProps> = ({
  beforeSrc,
  afterSrc,
  entranceFrame,
  top,
  width = 860,
  height = 360,
  sliderDelay = 15,
  videoZoom,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < entranceFrame) return null;

  const localFrame = frame - entranceFrame;

  // Card entrance from right
  const entranceSpring = spring({
    frame: localFrame,
    fps,
    config: SPRINGS.entrance,
  });

  const translateX = interpolate(entranceSpring, [0, 1], [400, 0]);
  const entranceScale = interpolate(entranceSpring, [0, 1], [0.9, 1]);
  const opacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Slider reveal animation (0% to 100%)
  const sliderSpring = spring({
    frame: localFrame - sliderDelay,
    fps,
    config: SPRINGS.slider,
  });

  const sliderPosition = interpolate(
    sliderSpring,
    [0, 1],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const videoStyle: React.CSSProperties = videoZoom
    ? {
        transform: `scale(${videoZoom.scale})`,
        transformOrigin: `${videoZoom.originX} ${videoZoom.originY}`,
      }
    : {};

  // Center card horizontally (assuming 1080px width)
  const cardLeft = (1080 - width) / 2;

  return (
    <Sequence from={entranceFrame}>
      <div
        style={{
          position: "absolute",
          top,
          left: cardLeft,
          width,
          height,
          opacity,
          transform: `translateX(${translateX}px) scale(${entranceScale})`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Before video (full, underneath) */}
        <Video
          src={staticFile(beforeSrc)}
          volume={0}
          loop
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...videoStyle,
          }}
        />

        {/* After video (clipped from left) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Video
            src={staticFile(afterSrc)}
            volume={0}
            loop
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              ...videoStyle,
            }}
          />
        </div>

        {/* Slider line with glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${sliderPosition}%`,
            width: 4,
            height: "100%",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 0 12px rgba(255,255,255,0.8)",
            transform: "translateX(-50%)",
            opacity: sliderPosition > 2 && sliderPosition < 98 ? 1 : 0,
          }}
        />

        {/* Before label (fades when slider passes 50%) */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            padding: "5px 12px",
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 6,
            fontSize: 16,
            fontWeight: 600,
            color: "#fff",
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            opacity: sliderPosition < 50 ? 1 : 0,
          }}
        >
          BEFORE
        </div>

        {/* After label (appears when slider passes 50%) */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            padding: "5px 12px",
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 6,
            fontSize: 16,
            fontWeight: 600,
            color: "#fff",
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            opacity: sliderPosition > 50 ? 1 : 0,
          }}
        >
          AFTER
        </div>
      </div>
    </Sequence>
  );
};

export default SliderCard;
