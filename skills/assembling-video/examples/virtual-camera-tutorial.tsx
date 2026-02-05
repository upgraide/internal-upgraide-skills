/**
 * Virtual Camera Tutorial Pattern
 *
 * ARCHITECTURE:
 * Instead of moving content, we create a tall "page" and move a virtual camera.
 * Content is positioned at fixed Y coordinates on the page.
 * Camera Y position is interpolated between keyframes.
 *
 * WHY THIS PATTERN:
 * - Content positions are independent of timing
 * - Camera movements are discrete "snaps" with holds
 * - Easy to add/remove content without recalculating everything
 * - Enables complex scrolling tutorials
 *
 * HOW IT WORKS:
 * 1. Define Y positions for all content (absolute on the tall page)
 * 2. Define CAMERA keyframes (frame → Y position)
 * 3. Wrap all content in a container with translateY(-cameraY)
 * 4. Content appears/animates based on frame, camera reveals it
 *
 * USAGE:
 * - Copy this pattern and replace placeholder content
 * - Adjust Y positions based on your content layout
 * - Adjust CAMERA keyframes based on your timing
 */

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - Adjust these for your video
// ═══════════════════════════════════════════════════════════════════════════

const FPS = 30;

/**
 * Y positions on the virtual "page" (in pixels)
 *
 * Think of this as a tall document. Screen height is 1920px.
 * Position content where you want it on this tall page.
 * Camera will scroll down to reveal it.
 *
 * TIP: Start with positions that fit on screen (0-1920),
 * then add content below that requires scrolling.
 */
const Y = {
  // ─── Visible without scrolling (camera at 0) ───
  SECTION_1_TITLE: 100,
  SECTION_1_CONTENT: 400,

  // ─── Requires scroll (camera moves down) ───
  SECTION_2_TITLE: 2000,
  SECTION_2_CONTENT: 2400,

  SECTION_3_TITLE: 4000,
  SECTION_3_CONTENT: 4400,

  // Total page height
  TOTAL: 5500,
};

/**
 * Camera keyframes - Controls when camera moves
 *
 * Pattern: HOLD → SNAP → HOLD → SNAP
 * - Camera stays still during content
 * - Quick snap to next position for section changes
 *
 * Structure:
 *   frames: [frame1, frame2, frame3, ...]
 *   y:      [yPos1,  yPos2,  yPos3,  ...]
 *
 * The camera Y is interpolated between these keyframes.
 */
const CAMERA = {
  frames: [
    // Section 1: Stay at top
    0,
    90, // Hold until frame 90

    // Snap to Section 2
    100, // Arrive at new position by frame 100

    // Section 2: Hold
    190,

    // Snap to Section 3
    200,

    // Section 3: Hold until end
    300,
  ],
  y: [
    // Section 1
    0,
    0,

    // Section 2 (content at Y:2000, so camera at ~1900 shows it near top)
    1900,

    // Hold
    1900,

    // Section 3
    3900,

    // Hold
    3900,
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS - Replace with your actual content
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  background: "#F0F0F0",
  card: "#FFFFFF",
  text: "#1D1D1F",
};

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

/**
 * Example content block with spring entrance
 */
interface ContentBlockProps {
  yPosition: number;
  entranceFrame: number;
  title: string;
  children?: React.ReactNode;
}

const ContentBlock: React.FC<ContentBlockProps> = ({
  yPosition,
  entranceFrame,
  title,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < entranceFrame) return null;

  const entranceSpring = spring({
    frame: frame - entranceFrame,
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.8 },
  });

  const entranceY = interpolate(entranceSpring, [0, 1], [40, 0]);
  const entranceOpacity = interpolate(frame - entranceFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: yPosition,
        left: 80,
        right: 80,
        opacity: entranceOpacity,
        transform: `translateY(${entranceY}px)`,
      }}
    >
      <h2
        style={{
          fontSize: 72,
          fontWeight: 700,
          fontFamily: FONT_FAMILY,
          color: COLORS.text,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
};

/**
 * Example card component
 */
interface CardProps {
  yPosition: number;
  entranceFrame: number;
}

const Card: React.FC<CardProps> = ({ yPosition, entranceFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < entranceFrame) return null;

  const entranceSpring = spring({
    frame: frame - entranceFrame,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.7 },
  });

  const entranceX = interpolate(entranceSpring, [0, 1], [100, 0]);
  const entranceOpacity = interpolate(frame - entranceFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: yPosition,
        left: "50%",
        width: 920,
        transform: `translateX(-50%) translateX(${entranceX}px)`,
        opacity: entranceOpacity,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          padding: 40,
          minHeight: 400,
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            color: COLORS.text,
          }}
        >
          Your content here
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════

export const VirtualCameraTutorial: React.FC = () => {
  const frame = useCurrentFrame();

  // ─── Calculate camera position ───
  // Snappy out easing for quick, decisive moves
  const cameraY = interpolate(frame, CAMERA.frames, CAMERA.y, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.background, overflow: "hidden" }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          VIRTUAL CAMERA CONTAINER

          This is the key pattern:
          - Container has full height of the "page" (Y.TOTAL)
          - translateY(-cameraY) moves the camera down
          - Content stays at fixed positions, camera reveals it
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: Y.TOTAL,
          transform: `translateY(${-cameraY}px)`,
        }}
      >
        {/* ─── Section 1 ─────────────────────────────────────────────────── */}
        <ContentBlock
          yPosition={Y.SECTION_1_TITLE}
          entranceFrame={0}
          title="Section 1: Introduction"
        />

        <Card yPosition={Y.SECTION_1_CONTENT} entranceFrame={15} />

        {/* ─── Section 2 ─────────────────────────────────────────────────── */}
        <ContentBlock
          yPosition={Y.SECTION_2_TITLE}
          entranceFrame={100}
          title="Section 2: Main Content"
        />

        <Card yPosition={Y.SECTION_2_CONTENT} entranceFrame={115} />

        {/* ─── Section 3 ─────────────────────────────────────────────────── */}
        <ContentBlock
          yPosition={Y.SECTION_3_TITLE}
          entranceFrame={200}
          title="Section 3: Conclusion"
        />

        <Card yPosition={Y.SECTION_3_CONTENT} entranceFrame={215} />
      </div>
    </AbsoluteFill>
  );
};

// Export duration for Root.tsx registration
export const VIRTUAL_CAMERA_TUTORIAL_DURATION = 300; // 10 seconds

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUDIO-SYNCED TIMING ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * For videos synced to narration, convert transcription timestamps to frame
 * constants. This creates a single source of truth for all animations.
 *
 * STEP 1: Get word-level timestamps from transcription (Assembly AI, etc.)
 *
 * STEP 2: Convert to frame constants:
 *
 *   const FPS = 30;
 *
 *   const WORDS = {
 *     // HOOK
 *     this: Math.floor(0.16 * FPS),        // 5
 *     transform: Math.floor(1.16 * FPS),   // 35
 *     anything: Math.floor(3.0 * FPS),     // 90
 *
 *     // PROBLEM
 *     but: Math.floor(3.44 * FPS),         // 103
 *     robotic: Math.floor(4.6 * FPS),      // 138
 *
 *     // TUTORIAL
 *     heres: Math.floor(6.0 * FPS),        // 180
 *     step_1: Math.floor(8.4 * FPS),       // 252
 *     step_2: Math.floor(11.36 * FPS),     // 341
 *     done: Math.floor(16.92 * FPS),       // 508
 *   };
 *
 * STEP 3: Define scene boundaries using WORDS:
 *
 *   const FRAMES = {
 *     HOOK_START: 0,
 *     PROBLEM_START: WORDS.but,           // Section changes at "but"
 *     TUTORIAL_START: WORDS.heres,        // Section changes at "here's"
 *     STEP_1: WORDS.step_1,
 *     STEP_2: WORDS.step_2,
 *     TOTAL: 620,
 *   };
 *
 * STEP 4: Reference everywhere:
 *
 *   // Camera keyframes
 *   const CAMERA = {
 *     frames: [0, FRAMES.PROBLEM_START - 10, FRAMES.PROBLEM_START, ...],
 *     y: [0, 0, 1100, ...],
 *   };
 *
 *   // Section sequencing
 *   <Sequence from={FRAMES.PROBLEM_START} durationInFrames={FRAMES.TUTORIAL_START - FRAMES.PROBLEM_START}>
 *
 *   // SFX timing
 *   <Sequence from={WORDS.anything}>
 *     <Audio src={staticFile("audio/impact.wav")} />
 *   </Sequence>
 *
 *   // Text entrances
 *   if (frame >= WORDS.transform) { showText = true; }
 *
 * WHY THIS WORKS:
 * - Change a timestamp → all dependent animations update
 * - Easy to re-sync if audio changes
 * - Clear relationship between audio and visuals
 * - Self-documenting: WORDS.anything tells you when "anything" is spoken
 *
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOW TO ADAPT THIS PATTERN
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. PLAN YOUR LAYOUT
 *    - Sketch where content should appear on the "tall page"
 *    - Screen is 1920px tall, so Y:0-1920 is visible without scrolling
 *    - Content below Y:1920 requires camera movement
 *
 * 2. DEFINE Y POSITIONS
 *    - Add entries to the Y object for each piece of content
 *    - Space content appropriately (consider card heights)
 *
 * 3. DEFINE CAMERA KEYFRAMES
 *    - Determine when camera should move (section transitions)
 *    - Use HOLD → SNAP pattern: stay still during content, quick move between
 *    - Camera Y should be ~100px above content you want visible at top
 *
 * 4. ADD YOUR CONTENT
 *    - Position each element using yPosition={Y.YOUR_ELEMENT}
 *    - Use entranceFrame to control when it animates in
 *    - Content should animate in AFTER camera arrives at that section
 *
 * 5. SYNC WITH AUDIO (if applicable)
 *    - Time camera snaps to section transitions in voiceover
 *    - Time content entrances to specific words
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - Camera arrives BEFORE content animates in (gives settling time)
 * - Use Easing.out(Easing.cubic) for snappy camera moves
 * - Keep camera still during important content (avoid motion during reading)
 * - Test in Remotion Studio to fine-tune timing
 *
 */
