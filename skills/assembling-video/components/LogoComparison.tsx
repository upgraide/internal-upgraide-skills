/**
 * LogoComparison - "X + Y" comparison with animated strikethrough
 *
 * USE WHEN:
 * - Hook comparing your product to competitors ("better than X + Y combined")
 * - Any "versus" or "replaces" messaging
 * - Showing what you're disrupting/replacing
 *
 * FEATURES:
 * - Supports 2+ logos with staggered entrance
 * - Animated strikethrough sweep
 * - Customizable separator ("+" or "vs" or custom)
 * - Spring-based animations
 *
 * EXAMPLE:
 * ```tsx
 * <LogoComparison
 *   logos={[
 *     { src: staticFile("logos/competitor1.png"), name: "Competitor", delay: 0 },
 *     { src: staticFile("logos/competitor2.png"), name: "Other", delay: 14 },
 *   ]}
 *   separator="+"
 *   strikethrough={{ progress: strikethroughProgress, color: "#FF3B30" }}
 * />
 * ```
 */

import React from "react";
import {
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface LogoItem {
  /** Path to logo image (use staticFile()) */
  src: string;
  /** Display name next to logo */
  name: string;
  /** Frame delay for staggered entrance (0 = immediate) */
  delay: number;
}

interface StrikethroughConfig {
  /** Progress 0-100 (animate this value) */
  progress: number;
  /** Line color (default: Apple red #FF3B30) */
  color?: string;
  /** Line height in pixels (default: 6) */
  height?: number;
}

interface LogoComparisonProps {
  /** Array of logos to display */
  logos: LogoItem[];
  /** Separator between logos (default: "+") */
  separator?: string;
  /** Strikethrough configuration (omit to disable) */
  strikethrough?: StrikethroughConfig;
  /** Scale factor for the entire component (default: 1) */
  scale?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLING
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  cardBg: "#FFFFFF",
  text: "#1D1D1F",
  textSecondary: "#86868B",
  strikethrough: "#FF3B30", // Apple red
};

const TYPOGRAPHY = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
};

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 200,
  mass: 0.7,
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGO PILL COMPONENT (internal)
// ═══════════════════════════════════════════════════════════════════════════

interface LogoPillProps {
  logoSrc: string;
  name: string;
  delay: number;
}

const LogoPill: React.FC<LogoPillProps> = ({ logoSrc, name, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const springValue = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG,
  });

  const scale = interpolate(springValue, [0, 1], [0.8, 1.0], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(springValue, [0, 1], [30, 0]);
  const opacity = interpolate(frame - delay, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Logo card */}
      <div
        style={{
          backgroundColor: COLORS.cardBg,
          padding: 16,
          borderRadius: 22,
          boxShadow: "0 14px 44px rgba(0, 0, 0, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={logoSrc}
          style={{ width: 88, height: 88, objectFit: "contain" }}
        />
      </div>

      {/* Name text */}
      <span
        style={{
          fontSize: 72,
          fontWeight: 600,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          letterSpacing: -3,
        }}
      >
        {name}
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LogoComparison: React.FC<LogoComparisonProps> = ({
  logos,
  separator = "+",
  strikethrough,
  scale = 1,
}) => {
  const frame = useCurrentFrame();

  // Find the latest delay to know when separator should appear
  const maxDelay = Math.max(...logos.map((l) => l.delay));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        position: "relative",
        transform: `scale(${scale})`,
      }}
    >
      {logos.map((logo, index) => {
        const isVisible = frame >= logo.delay;
        if (!isVisible) return null;

        const isLast = index === logos.length - 1;

        return (
          <React.Fragment key={`${logo.name}-${index}`}>
            <LogoPill
              logoSrc={logo.src}
              name={logo.name}
              delay={logo.delay}
            />

            {/* Separator (between logos, not after last) */}
            {!isLast && frame >= logos[index + 1]?.delay && (
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 300,
                  color: COLORS.textSecondary,
                  opacity: interpolate(
                    frame - logos[index + 1].delay,
                    [0, 6],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }
                  ),
                }}
              >
                {separator}
              </span>
            )}
          </React.Fragment>
        );
      })}

      {/* Strikethrough line */}
      {strikethrough && strikethrough.progress > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "5%",
            width: `${strikethrough.progress * 0.9}%`,
            height: strikethrough.height ?? 6,
            backgroundColor: strikethrough.color ?? COLORS.strikethrough,
            borderRadius: (strikethrough.height ?? 6) / 2,
            transform: "translateY(-50%)",
            boxShadow: `0 2px 8px ${strikethrough.color ?? COLORS.strikethrough}66`,
          }}
        />
      )}
    </div>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ```tsx
 * import { LogoComparison } from '.claude/skills/assembling-video/components/LogoComparison';
 * import { useCurrentFrame, interpolate, staticFile } from 'remotion';
 *
 * const MyHook: React.FC = () => {
 *   const frame = useCurrentFrame();
 *
 *   // Animate strikethrough from 0 to 100 over 8 frames
 *   const strikethroughProgress = interpolate(
 *     frame,
 *     [STRIKETHROUGH_START, STRIKETHROUGH_START + 8],
 *     [0, 100],
 *     { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
 *   );
 *
 *   return (
 *     <LogoComparison
 *       logos={[
 *         { src: staticFile("logos/gamma.png"), name: "Gamma", delay: 72 },
 *         { src: staticFile("logos/canva.png"), name: "Canva", delay: 86 },
 *       ]}
 *       separator="+"
 *       strikethrough={{
 *         progress: strikethroughProgress,
 *         color: "#FF3B30",
 *       }}
 *     />
 *   );
 * };
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TIMING TIPS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - Stagger logo delays by 10-15 frames for nice cascade
 * - Start strikethrough 6-8 frames after last logo settles
 * - Strikethrough sweep should be 6-10 frames (fast = decisive)
 * - Sync with voice: strikethrough on "combined" or "replaced"
 *
 */

export default LogoComparison;
