/**
 * iOS Liquid Glass Card - Apple's iOS 18+ glass design language
 *
 * Replicates Apple's "liquid glass" notification style with:
 * - Two-layer white gradient (60% + 25%) for depth
 * - 100px backdrop blur for glass effect
 * - Subtle noise texture overlay
 * - Pill-shaped border radius (50px)
 * - Precise text colors from Apple Vibrant labels
 *
 * USE CASES:
 * - Notification cards for hook sequences
 * - App comparison cards (Siri vs Claude, etc.)
 * - Status/alert overlays on video content
 * - Tutorial step cards
 *
 * DESIGN REFERENCE: iOS 18+ notification center
 */

import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";

// ============================================================
// DESIGN TOKENS - iOS Liquid Glass
// ============================================================

/**
 * iOS Liquid Glass card styling
 *
 * Formula: Two white layers (60% + 25%) + 100px blur + subtle border
 * This creates the characteristic "frosted glass" look
 */
export const IOS_LIQUID_GLASS = {
  card: {
    background: `linear-gradient(
      rgba(255, 255, 255, 0.60),
      rgba(255, 255, 255, 0.60)
    ), rgba(255, 255, 255, 0.25)`,
    backdropFilter: "blur(100px)",
    WebkitBackdropFilter: "blur(100px)",
    borderRadius: 50, // Pill-shaped
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  },
  // Apple Vibrant label colors
  text: {
    primary: "#000000",
    secondary: "#7F7F7F",
    tertiary: "#3D3D3D",
  },
  // Accent colors
  accents: {
    error: "#FF453A",      // iOS red
    success: "#34C759",    // iOS green
    claude: "#D97757",     // Claude orange
    blue: "#007AFF",       // iOS blue
  },
} as const;

/**
 * Typography - Apple SF Pro Display style
 */
export const IOS_TYPOGRAPHY = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  // Card header (app name)
  appName: {
    fontSize: 44,
    fontWeight: 600 as const,
  },
  // Timestamp
  timestamp: {
    fontSize: 34,
    fontWeight: 700 as const,
  },
  // Main message
  message: {
    fontSize: 56,
    fontWeight: 600 as const,
    letterSpacing: -2,
    lineHeight: 1.2,
  },
} as const;

/**
 * Spring configurations for Apple-like motion
 */
export const IOS_SPRINGS = {
  // Card entrance - slide in with gentle bounce
  entrance: { damping: 18, stiffness: 200, mass: 0.7 },
  // Text punch - scale punch for emphasis
  textPunch: { damping: 12, stiffness: 300, mass: 0.5 },
  // Impact - big moment reveal
  impact: { damping: 8, stiffness: 400, mass: 0.4 },
} as const;

/**
 * Safe zones for Instagram Reels / TikTok
 * Keeps content visible and avoids platform UI overlays
 */
export const SAFE_ZONES = {
  horizontal: 70,       // Both sides
  top: 150,             // Status bar + dynamic island
  bottom: 350,          // Platform UI overlays
  maxContentWidth: 940, // 1080 - 2 * horizontal
} as const;

// Interpolation helper
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ============================================================
// TEXTURE OVERLAY - Apple's subtle noise on glass
// ============================================================

/**
 * Subtle noise texture that sits on top of glass cards
 * Creates the characteristic "gritty glass" feel
 */
export const TextureOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      opacity: 0.03,
      pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundSize: "100px 100px",
    }}
  />
);

// ============================================================
// iOS LIQUID GLASS CARD COMPONENT
// ============================================================

export interface iOSLiquidGlassCardProps {
  /**
   * App icon - path relative to public/ folder
   * Example: "icons/siri.png" or "icons/claude.png"
   */
  icon: string;

  /**
   * App name displayed in header
   */
  appName: string;

  /**
   * Timestamp text (e.g., "now", "10y ago", "searching...")
   */
  timestamp: string;

  /**
   * Main message content - can include JSX for colored words
   * Example: <>Can't search <span style={{color: "#FF453A"}}>emails</span></>
   */
  message: React.ReactNode;

  /**
   * Entrance animation delay in frames
   * @default 0
   */
  delay?: number;

  /**
   * Custom styles for the outer container
   */
  style?: React.CSSProperties;

  /**
   * Animation direction for entrance
   * @default "top"
   */
  entranceDirection?: "top" | "bottom";
}

/**
 * iOS Liquid Glass Card
 *
 * A notification-style card with Apple's liquid glass design.
 * Includes smooth entrance animation.
 *
 * @example
 * // Basic usage
 * <iOSLiquidGlassCard
 *   icon="icons/siri.png"
 *   appName="Siri"
 *   timestamp="10y ago"
 *   message={<>Is Legitimately <span style={{color: "#FF453A"}}>Useless</span></>}
 * />
 *
 * @example
 * // With entrance delay and custom direction
 * <iOSLiquidGlassCard
 *   icon="icons/claude.png"
 *   appName="Claude"
 *   timestamp="now"
 *   message={<>Get your <span style={{color: "#D97757"}}>AI assistant</span></>}
 *   delay={8}
 *   entranceDirection="bottom"
 * />
 */
export const iOSLiquidGlassCard: React.FC<iOSLiquidGlassCardProps> = ({
  icon,
  appName,
  timestamp,
  message,
  delay = 0,
  style,
  entranceDirection = "top",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const localFrame = frame - delay;
  const entranceSpring = spring({
    frame: localFrame,
    fps,
    config: IOS_SPRINGS.entrance,
  });

  const directionMultiplier = entranceDirection === "top" ? -1 : 1;
  const slideY = interpolate(entranceSpring, [0, 1], [80 * directionMultiplier, 0]);
  const opacity = interpolate(localFrame, [0, 6], [0, 1], clamp);
  const scale = interpolate(entranceSpring, [0, 1], [0.95, 1], clamp);

  // Text punch animation (slightly delayed from card entrance)
  const textDelay = delay + 3;
  const textLocalFrame = frame - textDelay;
  const textSpring = spring({
    frame: textLocalFrame,
    fps,
    config: IOS_SPRINGS.textPunch,
  });
  const textScale = interpolate(textSpring, [0, 1], [1.1, 1], clamp);
  const textOpacity = interpolate(textLocalFrame, [0, 4], [0, 1], clamp);

  return (
    <div
      style={{
        transform: `translateY(${slideY}px) scale(${scale})`,
        opacity,
        width: "100%",
        maxWidth: SAFE_ZONES.maxContentWidth,
        ...style,
      }}
    >
      <div
        style={{
          ...IOS_LIQUID_GLASS.card,
          padding: "32px 36px",
          display: "flex",
          alignItems: "center",
          gap: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <TextureOverlay />

        {/* App Icon */}
        <Img
          src={staticFile(icon)}
          style={{
            width: 100,
            height: 100,
            objectFit: "contain",
            flexShrink: 0,
          }}
        />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header: App name + Timestamp */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                ...IOS_TYPOGRAPHY.appName,
                color: IOS_LIQUID_GLASS.text.primary,
                fontFamily: IOS_TYPOGRAPHY.fontFamily,
              }}
            >
              {appName}
            </span>
            <span
              style={{
                ...IOS_TYPOGRAPHY.timestamp,
                color: "#000000",
                fontFamily: IOS_TYPOGRAPHY.fontFamily,
              }}
            >
              {timestamp}
            </span>
          </div>

          {/* Message with text punch animation */}
          <div
            style={{
              transform: `scale(${textScale})`,
              transformOrigin: "left center",
              opacity: textOpacity,
            }}
          >
            <span
              style={{
                ...IOS_TYPOGRAPHY.message,
                color: IOS_LIQUID_GLASS.text.primary,
                fontFamily: IOS_TYPOGRAPHY.fontFamily,
                display: "block",
              }}
            >
              {message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STACKED NOTIFICATION LAYOUT
// ============================================================

export interface StackedNotificationsProps {
  children: React.ReactNode;
  /**
   * Vertical gap between cards
   * @default 20
   */
  gap?: number;
  /**
   * Top padding from safe zone
   * @default SAFE_ZONES.top
   */
  paddingTop?: number;
}

/**
 * Container for stacking multiple iOS notifications
 *
 * @example
 * <StackedNotifications>
 *   <iOSLiquidGlassCard ... />
 *   <iOSLiquidGlassCard delay={8} ... />
 * </StackedNotifications>
 */
export const StackedNotifications: React.FC<StackedNotificationsProps> = ({
  children,
  gap = 20,
  paddingTop = SAFE_ZONES.top,
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "52%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap,
      paddingTop,
      paddingLeft: SAFE_ZONES.horizontal,
      paddingRight: SAFE_ZONES.horizontal,
    }}
  >
    {children}
  </div>
);

// ============================================================
// TYPING INDICATOR - iOS bouncing dots
// ============================================================

/**
 * iOS-style typing indicator with three bouncing dots
 */
export const TypingIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[0, 1, 2].map((i) => {
        const bounce = Math.sin((frame + i * 5) * 0.3) * 5;
        return (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.35)",
              transform: `translateY(${bounce}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// ============================================================
// EXPORTS
// ============================================================

export default iOSLiquidGlassCard;
