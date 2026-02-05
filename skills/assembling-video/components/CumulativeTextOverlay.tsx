/**
 * CumulativeTextOverlay - Text list that builds up item-by-item
 *
 * Use for: Listicle videos where each point appears and stays visible
 * Pattern: Hook text centered → builds cumulative list as scenes progress
 */

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";

interface Scene {
  id: string;
  label: string;
  startFrame: number;
  endFrame: number;
}

interface CumulativeTextOverlayProps {
  scenes: Scene[];
  hookText?: string;
  fontSize?: number;
  hookFontSize?: number;
}

const textStyle: React.CSSProperties = {
  fontFamily: "'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontWeight: 600,
  color: "#FFFFFF",
  textAlign: "center",
  lineHeight: 1.4,
  letterSpacing: "-0.02em",
  textShadow: `
    0 0 20px rgba(0,0,0,0.9),
    0 2px 4px rgba(0,0,0,0.8),
    0 4px 8px rgba(0,0,0,0.6)
  `,
  WebkitTextStroke: "1px rgba(0,0,0,0.3)",
};

export const CumulativeTextOverlay: React.FC<CumulativeTextOverlayProps> = ({
  scenes,
  hookText = "how to CHANGE your life:",
  fontSize = 52,
  hookFontSize = 68,
}) => {
  const frame = useCurrentFrame();

  // Find current scene
  const currentSceneIndex = scenes.findIndex(
    (scene) => frame >= scene.startFrame && frame < scene.endFrame
  );

  if (currentSceneIndex === -1) return null;

  const currentScene = scenes[currentSceneIndex];
  const isIntro = currentSceneIndex === 0;

  // Entrance animation
  const sceneFrame = frame - currentScene.startFrame;
  const textOpacity = interpolate(sceneFrame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });
  const textScale = interpolate(sceneFrame, [0, 8], [0.95, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  // Intro: Centered hook
  if (isIntro) {
    return (
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            ...textStyle,
            fontSize: hookFontSize,
            fontWeight: 700,
            opacity: textOpacity,
            transform: `scale(${textScale})`,
          }}
        >
          {hookText}
        </div>
      </AbsoluteFill>
    );
  }

  // After intro: Cumulative list
  const visibleItems = scenes.slice(1, currentSceneIndex + 1);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {visibleItems.map((item, index) => {
          const isLatest = index === visibleItems.length - 1;
          return (
            <div
              key={item.id}
              style={{
                ...textStyle,
                fontSize,
                opacity: isLatest ? textOpacity : 1,
                transform: `scale(${isLatest ? textScale : 1})`,
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default CumulativeTextOverlay;
