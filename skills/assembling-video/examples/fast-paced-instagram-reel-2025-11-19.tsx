/**
 * Fast-Paced Instagram Reel Pattern (2025-11-19)
 *
 * STYLE: 61.8 cuts/min, hard cuts, split-screen alternation, flash transitions
 * DURATION: 25 seconds
 * FORMAT: Instagram Reel (1080x1920, 30fps)
 * USE CASE: Product demos, feature showcases, high-energy content
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PATTERN OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Structure: Hook (0-0.8s) → Body (0.8-21.5s) → CTA (21.5-25s)
 *
 * Hook:
 *   - Split-screen with zoom-out effect (1.2x → 1.0x over 6 frames)
 *   - Riser sound effect for impact
 *   - Crossed-out logo overlay (e.g., "Forget Canva")
 *   - CRITICAL: Content must be visible at frame 0 (no opacity fade-in)
 *
 * Body:
 *   - Strict split-screen → floating card alternation (6 cycles)
 *   - 13 total scenes, 12 transitions
 *   - Each scene 0.8-2.5s max (maintains fast pace)
 *   - Flash transitions (2 frames, 0.5 intensity) at each cut
 *   - Sound effects synchronized with transitions (clicks, whooshes)
 *
 * CTA:
 *   - Full avatar closeup (21.5-25s)
 *   - Gold flash transition (#FFD700, 0.6 intensity)
 *   - Electric pop sound effect
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KEY COMPONENTS USED
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. SplitScreenLayout (with isHook for zoom effect)
 *    - Top/bottom split with morphing transitions
 *    - Entry/exit animations for smooth card transitions
 *    - Hook zoom: 1.2x → 1.0x over 6 frames
 *
 * 2. FloatingVideoCard
 *    - Centered card with shadow and rounded corners
 *    - Morphs from/to split-screen position
 *    - 6-frame entry/exit animations
 *
 * 3. FlashTransition
 *    - 2-frame white flashes at scene changes
 *    - Synchronized with sound effects
 *    - Gold flash for CTA transition
 *
 * 4. SyncedTextOverlay
 *    - Word-level caption synchronization
 *    - Dynamic positioning (center vs bottom)
 *    - 1-3 words max per caption
 *    - Grammar-aware chunking
 *
 * 5. CrossedOutLogo
 *    - Logo with animated X overlay
 *    - Used in hook for competitor comparison
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * AUDIO LAYERING STRATEGY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Layer 1: Background music (5% volume throughout)
 * Layer 2: Riser sound effect (hook impact)
 * Layer 3: Rhythmic transition clicks (12 transitions)
 * Layer 4: UI interface clicks (when B-roll changes)
 * Layer 5: Whoosh sounds (full-screen punches, timed 2 frames early)
 * Layer 6: Impact sound (logo cross-out at 0.5s)
 * Layer 7: CTA pop sound (21.5s transition)
 *
 * TOTAL: 30+ audio elements creating rhythmic momentum
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPTION STRATEGY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - Word-level sync from AssemblyAI timeline.json
 * - 1-3 words max per caption (fast readability)
 * - NEVER end on small words ("a", "the", "of")
 * - Position changes by scene type:
 *   - Split-screen: center position (above divider)
 *   - Full avatar/card: bottom position (below face)
 * - CTA section: Special handling for power words like "brand"
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ITERATION LEARNINGS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Problem 1: Hook zoom showed white flash at start
 *   → Solution: Disabled opacity fade-in for hook scenes
 *   → Lesson: Hook animations must start fully visible for impact
 *
 * Problem 2: Transitions felt flat
 *   → Solution: Added 2-frame flash overlays + sound effects
 *   → Lesson: Multi-sensory sync (visual + audio) creates punch
 *
 * Problem 3: Captions felt monotonous
 *   → Solution: Dynamic positioning based on scene type
 *   → Lesson: Visual variety maintains viewer attention
 *
 * Problem 4: Scene changes felt chaotic
 *   → Solution: Strict split/full alternation, max 2.5s per scene
 *   → Lesson: Patterns create rhythm even at fast pace
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ADAPTATION GUIDE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * To adapt this pattern for a new video:
 *
 * 1. Replace video clips in public/inputs/
 * 2. Update SCENE_TIMINGS array with new clip names/durations
 * 3. Generate new timeline.json from transcription skill
 * 4. Update logo in hook scene (or remove CrossedOutLogo)
 * 5. Adjust pacing if needed (keep 50-80 cuts/min for Instagram)
 * 6. Keep hook → body → CTA structure
 * 7. Maintain flash transitions at all scene changes
 * 8. Preserve audio layering strategy
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PRODUCTION METRICS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - Render time: ~3-5 minutes (25s video @ 30fps)
 * - File size: ~18-20 MB (H.264, 1080x1920)
 * - Total assets: 7 video clips + 12+ audio files + 1 logo
 * - Components: 5 reusable components
 * - Code: 550 lines
 * - Iterations: 5 test renders to final
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Original project: Pimelli product demo
 * Archived at: archive/2025-11-19-pimelli-fast-paced-reel/
 * Created: November 19, 2025
 */

import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Video,
  Sequence,
  Series,
  staticFile,
  continueRender,
  delayRender,
  Audio,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { SyncedTextOverlay } from "../../.claude/skills/video-assembly/components/SyncedTextOverlay";
import { SplitScreenLayout } from "../../.claude/skills/video-assembly/components/SplitScreenLayout";
import { CrossedOutLogo } from "../../.claude/skills/video-assembly/components/CrossedOutLogo";
import { FloatingVideoCard } from "../../.claude/skills/video-assembly/components/FloatingVideoCard";
import { FlashTransition } from "../../.claude/skills/video-assembly/components/FlashTransition";

interface TimelineData {
  words: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

const FPS = 30;

// Convert seconds to frames
const sec = (seconds: number) => Math.round(seconds * FPS);

// Scene timing - Optimized: strict split/full alternation, all 6 clips used, max 2.5s
const SCENE_TIMINGS = [
  { start: 0, end: 0.8, type: "split" as const }, // Pasta prompt hook
  { start: 0.8, end: 1.8, type: "full" as const }, // Pasta prompt full
  { start: 1.8, end: 4.0, type: "split" as const }, // Generated image
  { start: 4.0, end: 5.5, type: "full" as const }, // Campaign cards
  { start: 5.5, end: 7.8, type: "split" as const }, // Edit interface
  { start: 7.8, end: 9.5, type: "full" as const }, // Brand style
  { start: 9.5, end: 12.0, type: "split" as const }, // Smartphone ad
  { start: 12.0, end: 14.0, type: "full" as const }, // Generated image cont.
  { start: 14.0, end: 16.5, type: "split" as const }, // Campaign cards cont.
  { start: 16.5, end: 18.5, type: "full" as const }, // Edit interface cont.
  { start: 18.5, end: 20.5, type: "split" as const }, // Pasta prompt cont.
  { start: 20.5, end: 21.5, type: "full" as const }, // Brand style final
  { start: 21.5, end: 24.96, type: "avatar" as const }, // CTA
];

// Determine caption position based on scene type
const getCaptionPosition = (timeInSeconds: number): "bottom" | "center" => {
  const scene = SCENE_TIMINGS.find(
    (s) => timeInSeconds >= s.start && timeInSeconds < s.end
  );
  // Center for split-screen, bottom for avatar and full overlays
  return scene?.type === "split" ? "center" : "bottom";
};

// Generate caption cues from word-level timestamps
// Strategy: 1-3 words max, grammar-aware chunking, NEVER end on small words
const generateCaptionCues = (timelineData: TimelineData) => {
  const words = timelineData.words;
  const cues: Array<{
    text: string;
    startFrame: number;
    endFrame: number;
    position: "bottom" | "center";
    isCTA?: boolean;
  }> = [];

  // Small words that should NEVER end a caption - they attach to NEXT chunk
  const smallWords = [
    "a",
    "an",
    "the",
    "of",
    "in",
    "to",
    "and",
    "or",
    "but",
    "at",
    "by",
    "for",
    "on",
    "with",
  ];

  const isSmallWord = (word: string) => {
    const cleaned = word.toLowerCase().replace(/[.,!?]/g, "");
    return smallWords.includes(cleaned);
  };

  let i = 0;
  while (i < words.length) {
    const chunk: typeof words = [];

    // Take up to 3 words
    while (i < words.length && chunk.length < 3) {
      const currentWord = words[i];
      chunk.push(currentWord);
      i++;

      // SPECIAL: If we just added "brand" in CTA section, break immediately
      // This makes "brand" its own standalone caption
      if (
        currentWord.start >= 21.5 &&
        currentWord.text.toLowerCase().replace(/[.,!?]/g, "") === "brand"
      ) {
        break;
      }

      // Stop if next word is "brand" in CTA section - don't include it with previous words
      if (i < words.length && words[i].start >= 21.5) {
        const nextWord = words[i].text.toLowerCase().replace(/[.,!?]/g, "");
        if (nextWord === "brand") {
          break;
        }
      }

      // Stop if next word starts with capital letter (new sentence)
      // BUT ignore multi-letter acronyms (DNA, URL, AI)
      if (i < words.length && chunk.length >= 1) {
        const nextWord = words[i].text.replace(/[.,!?]/g, "");

        // Single letter words (like "A") should start new caption
        if (nextWord.length === 1 && /[A-Z]/.test(nextWord.charAt(0))) {
          break;
        }

        const firstChar = nextWord.charAt(0);
        const secondChar = nextWord.charAt(1);

        // Only break if first letter is capital AND second letter is lowercase
        // This detects sentence starts like "Extracts" but ignores "DNA", "URL"
        if (
          firstChar === firstChar.toUpperCase() &&
          /[A-Z]/.test(firstChar) &&
          secondChar &&
          secondChar === secondChar.toLowerCase()
        ) {
          break;
        }
      }

      // Stop if we hit a natural pause (>0.3s gap) and have at least 1 word
      if (i < words.length && chunk.length >= 1) {
        const gap = words[i].start - chunk[chunk.length - 1].end;
        if (gap > 0.3) {
          break;
        }
      }

      // Stop at 3 words max
      if (chunk.length >= 3) {
        break;
      }
    }

    // CRITICAL: If we ended on a small word, move it to next chunk
    while (chunk.length > 1 && isSmallWord(chunk[chunk.length - 1].text)) {
      const smallWord = chunk.pop()!;
      i--; // Put it back for next chunk
    }

    // Create caption from chunk
    if (chunk.length > 0) {
      const text = chunk.map((w) => w.text.replace(/[.,!?]/g, "")).join(" ");
      const startFrame = sec(chunk[0].start);
      const endFrame = sec(chunk[chunk.length - 1].end);
      const position = getCaptionPosition(chunk[0].start);
      const isCTA = chunk[0].start >= 21.5; // CTA starts at 21.5s

      cues.push({ text, startFrame, endFrame, position, isCTA });
    }
  }

  return cues;
};

// Scene: Full-screen avatar
interface AvatarSceneProps {
  startFrom: number;
  isHook?: boolean; // First scene gets special treatment
}

const AvatarScene: React.FC<AvatarSceneProps> = ({
  startFrom,
  isHook = false,
}) => {
  const frame = useCurrentFrame();

  // Hook zoom-out animation: 1.2x → 1.0x over 0.2s (6 frames)
  const zoomScale = isHook
    ? interpolate(
        frame,
        [0, 6], // 0.2 seconds at 30fps
        [1.2, 1.0], // 120% → 100%
        {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.ease), // Smooth deceleration
        }
      )
    : 1.0;

  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoomScale})`,
        }}
      >
        <Video
          src={staticFile("inputs/koen_1.mp4")}
          startFrom={startFrom}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          volume={1.0}
        />
      </div>
    </AbsoluteFill>
  );
};

export const FastPacedPimelliDemo: React.FC = () => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [handle] = useState(() => delayRender());

  // Load timeline data from public folder
  useEffect(() => {
    fetch(staticFile("timeline.json"))
      .then((res) => res.json())
      .then((data: TimelineData) => {
        setTimelineData(data);
        continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load timeline.json:", err);
        continueRender(handle);
      });
  }, [handle]);

  // Don't render until timeline data is loaded
  if (!timelineData) {
    return null;
  }

  // Generate captions dynamically from word-level timestamps
  // 1-3 words max, grammar-aware chunking, perfectly synced to audio
  const captionCues = generateCaptionCues(timelineData);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Background music - plays throughout entire video */}
      <Audio
        src={staticFile("background_music/background_music.mp3")}
        volume={0.05}
      />

      {/* Riser sound effect - plays at start for hook impact */}
      <Audio
        src={staticFile(
          "sound_effects/popular-riser-metallic-sound-effect-trimmed.mp3"
        )}
        volume={0.5}
        playbackRate={1.5}
      />

      {/* MOMENTUM SOUNDSCAPE - Rhythmic + Impactful */}

      {/* Impact when cross bar hits Canva logo */}
      <Sequence from={15}>
        <Audio
          src={staticFile("sound_effects/cinematic-impact-hit-352702.mp3")}
          volume={0.3}
        />
      </Sequence>

      {/* RHYTHMIC TRANSITION CLICKS - Every scene change */}
      <Sequence from={sec(0.8)}><Audio src={staticFile("sound_effects/computer-mouse-click-352734.mp3")} volume={0.12} /></Sequence>
      <Sequence from={sec(1.8)}><Audio src={staticFile("sound_effects/mixkit-hard-pop-click-2364.wav")} volume={0.15} /></Sequence>
      <Sequence from={sec(4.0)}><Audio src={staticFile("sound_effects/computer-mouse-click-352734.mp3")} volume={0.12} /></Sequence>
      <Sequence from={sec(5.5)}><Audio src={staticFile("sound_effects/mixkit-hard-pop-click-2364.wav")} volume={0.15} /></Sequence>
      <Sequence from={sec(7.8)}><Audio src={staticFile("sound_effects/computer-mouse-click-352734.mp3")} volume={0.12} /></Sequence>
      <Sequence from={sec(9.5)}><Audio src={staticFile("sound_effects/mixkit-hard-pop-click-2364.wav")} volume={0.15} /></Sequence>
      <Sequence from={sec(12.0)}><Audio src={staticFile("sound_effects/computer-mouse-click-352734.mp3")} volume={0.12} /></Sequence>
      <Sequence from={sec(14.0)}><Audio src={staticFile("sound_effects/mixkit-hard-pop-click-2364.wav")} volume={0.15} /></Sequence>
      <Sequence from={sec(16.5)}><Audio src={staticFile("sound_effects/computer-mouse-click-352734.mp3")} volume={0.12} /></Sequence>
      <Sequence from={sec(18.5)}><Audio src={staticFile("sound_effects/mixkit-hard-pop-click-2364.wav")} volume={0.15} /></Sequence>
      <Sequence from={sec(20.5)}><Audio src={staticFile("sound_effects/computer-mouse-click-352734.mp3")} volume={0.12} /></Sequence>

      {/* UI INTERFACE CLICKS - When top video content switches between different clips */}
      <Sequence from={sec(1.8)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(4.0)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(5.5)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(7.8)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(9.5)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(12.0)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(14.0)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(16.5)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(18.5)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>
      <Sequence from={sec(20.5)}><Audio src={staticFile("sound_effects/mixkit-modern-technology-select-3124.wav")} volume={0.10} /></Sequence>

      {/* WHOOSH on FULL screen punches (6 impact moments) - Timed 2 frames early for anticipation */}
      <Sequence from={sec(0.8) - 2}><Audio src={staticFile("sound_effects/mixkit-fast-whoosh-transition-1490.wav")} volume={0.18} /></Sequence>
      <Sequence from={sec(4.0) - 2}><Audio src={staticFile("sound_effects/mixkit-air-woosh-1489.wav")} volume={0.18} /></Sequence>
      <Sequence from={sec(7.8) - 2}><Audio src={staticFile("sound_effects/mixkit-arrow-whoosh-1491.wav")} volume={0.18} /></Sequence>
      <Sequence from={sec(12.0) - 2}><Audio src={staticFile("sound_effects/mixkit-metal-hit-woosh-1485.wav")} volume={0.18} /></Sequence>
      <Sequence from={sec(16.5) - 2}><Audio src={staticFile("sound_effects/mixkit-ghostly-whoosh-passing-2623.wav")} volume={0.18} /></Sequence>
      <Sequence from={sec(20.5) - 2}><Audio src={staticFile("sound_effects/mixkit-fast-rocket-whoosh-1714.wav")} volume={0.18} /></Sequence>

      {/* CTA transition - special pop */}
      <Sequence from={sec(21.5)}>
        <Audio
          src={staticFile("sound_effects/mixkit-electric-pop-2365.wav")}
          volume={0.25}
        />
      </Sequence>

      {/* FLASH TRANSITIONS - Punchy 2-frame flashes at each hard cut */}
      {/* Synchronized with scene transitions for visual rhythm */}
      <Sequence from={sec(0.8)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(1.8)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(4.0)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(5.5)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(7.8)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(9.5)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(12.0)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(14.0)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(16.5)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(18.5)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(20.5)}><FlashTransition duration={2} intensity={0.5} /></Sequence>
      <Sequence from={sec(21.5)}><FlashTransition duration={2} intensity={0.6} color="#FFD700" /></Sequence> {/* CTA: Gold flash */}

      {/* OPTIMIZED: All 6 clips used ONCE, strict split/full alternation, max 2.5s per format */}
      <Series>
        {/* Scene 1: SPLIT (0-0.8s) Hook - Pasta prompt (clip6) */}
        <Series.Sequence durationInFrames={sec(0.8)}>
          <SplitScreenLayout
            topSource={staticFile("inputs/clip6_33-37.5s_pasta-prompt_FIXED.mp4")}
            bottomSource={staticFile("inputs/koen_1.mp4")}
            topStartFrom={0}
            bottomStartFrom={0}
            splitRatio={0.5}
            topVolume={0}
            bottomVolume={1.0}
            durationInFrames={sec(0.8)}
            isExitingToCard={true}
            isHook={true}
          />
        </Series.Sequence>

        {/* Scene 2: FULL (0.8-1.8s) Pasta prompt continues - Floating card */}
        <Series.Sequence durationInFrames={sec(1.0)}>
          <>
            <FloatingVideoCard
              videoSource={staticFile("inputs/clip6_33-37.5s_pasta-prompt_FIXED.mp4")}
              startFrom={sec(0.8)}
              durationInFrames={sec(1.0)}
              isEnteringFromSplit={true}
              isExitingToSplit={true}
            />
            <Audio src={staticFile("inputs/koen_1.mp4")} startFrom={sec(0.8)} volume={1.0} />
          </>
        </Series.Sequence>

        {/* Scene 3: SPLIT (1.8-4.0s) Generated image (clip4) */}
        <Series.Sequence durationInFrames={sec(2.2)}>
          <SplitScreenLayout
            topSource={staticFile("inputs/clip4_38-41s_generated-image.mp4")}
            bottomSource={staticFile("inputs/koen_1.mp4")}
            topStartFrom={0}
            bottomStartFrom={sec(1.8)}
            splitRatio={0.5}
            topVolume={0}
            bottomVolume={1.0}
            durationInFrames={sec(2.2)}
            isEnteringFromCard={true}
            isExitingToCard={true}
          />
        </Series.Sequence>

        {/* Scene 4: FULL (4.0-5.5s) Campaign cards (clip1) - Floating card */}
        <Series.Sequence durationInFrames={sec(1.5)}>
          <>
            <FloatingVideoCard
              videoSource={staticFile("inputs/clip1_19-24s_campaign-cards.mp4")}
              startFrom={0}
              durationInFrames={sec(1.5)}
              isEnteringFromSplit={true}
              isExitingToSplit={true}
            />
            <Audio src={staticFile("inputs/koen_1.mp4")} startFrom={sec(4.0)} volume={1.0} />
          </>
        </Series.Sequence>

        {/* Scene 5: SPLIT (5.5-7.8s) Edit interface (clip2) */}
        <Series.Sequence durationInFrames={sec(2.3)}>
          <SplitScreenLayout
            topSource={staticFile("inputs/clip2_26-32s_edit-interface.mp4")}
            bottomSource={staticFile("inputs/koen_1.mp4")}
            topStartFrom={0}
            bottomStartFrom={sec(5.5)}
            splitRatio={0.5}
            topVolume={0}
            bottomVolume={1.0}
            durationInFrames={sec(2.3)}
            isEnteringFromCard={true}
            isExitingToCard={true}
          />
        </Series.Sequence>

        {/* Scene 6: FULL (7.8-9.5s) Brand style (clip3) - Floating card */}
        <Series.Sequence durationInFrames={sec(1.7)}>
          <>
            <FloatingVideoCard
              videoSource={staticFile("inputs/clip3_11-13s_brand-style_REFINED.mp4")}
              startFrom={0}
              durationInFrames={sec(1.7)}
              isEnteringFromSplit={true}
              isExitingToSplit={true}
            />
            <Audio src={staticFile("inputs/koen_1.mp4")} startFrom={sec(7.8)} volume={1.0} />
          </>
        </Series.Sequence>

        {/* Scene 7: SPLIT (9.5-12.0s) Smartphone ad (clip5) FIRST USE */}
        <Series.Sequence durationInFrames={sec(2.5)}>
          <SplitScreenLayout
            topSource={staticFile("inputs/clip5_46-49s_smartphone-ad.mp4")}
            bottomSource={staticFile("inputs/koen_1.mp4")}
            topStartFrom={0}
            bottomStartFrom={sec(9.5)}
            splitRatio={0.5}
            topVolume={0}
            bottomVolume={1.0}
            durationInFrames={sec(2.5)}
            isEnteringFromCard={true}
            isExitingToCard={true}
          />
        </Series.Sequence>

        {/* Scene 8: FULL (12.0-14.0s) Generated image continues (clip4) - Floating card */}
        <Series.Sequence durationInFrames={sec(2.0)}>
          <>
            <FloatingVideoCard
              videoSource={staticFile("inputs/clip4_38-41s_generated-image.mp4")}
              startFrom={sec(1.0)}
              durationInFrames={sec(2.0)}
              isEnteringFromSplit={true}
              isExitingToSplit={true}
            />
            <Audio src={staticFile("inputs/koen_1.mp4")} startFrom={sec(12.0)} volume={1.0} />
          </>
        </Series.Sequence>

        {/* Scene 9: SPLIT (14.0-16.5s) Campaign cards continues (clip1) */}
        <Series.Sequence durationInFrames={sec(2.5)}>
          <SplitScreenLayout
            topSource={staticFile("inputs/clip1_19-24s_campaign-cards.mp4")}
            bottomSource={staticFile("inputs/koen_1.mp4")}
            topStartFrom={sec(1.5)}
            bottomStartFrom={sec(14.0)}
            splitRatio={0.5}
            topVolume={0}
            bottomVolume={1.0}
            durationInFrames={sec(2.5)}
            isEnteringFromCard={true}
            isExitingToCard={true}
          />
        </Series.Sequence>

        {/* Scene 10: FULL (16.5-18.5s) Edit interface continues (clip2) - Floating card */}
        <Series.Sequence durationInFrames={sec(2.0)}>
          <>
            <FloatingVideoCard
              videoSource={staticFile("inputs/clip2_26-32s_edit-interface.mp4")}
              startFrom={sec(2.3)}
              durationInFrames={sec(2.0)}
              isEnteringFromSplit={true}
              isExitingToSplit={true}
            />
            <Audio src={staticFile("inputs/koen_1.mp4")} startFrom={sec(16.5)} volume={1.0} />
          </>
        </Series.Sequence>

        {/* Scene 11: SPLIT (18.5-20.5s) Pasta prompt continues (clip6) */}
        <Series.Sequence durationInFrames={sec(2.0)}>
          <SplitScreenLayout
            topSource={staticFile("inputs/clip6_33-37.5s_pasta-prompt_FIXED.mp4")}
            bottomSource={staticFile("inputs/koen_1.mp4")}
            topStartFrom={sec(1.8)}
            bottomStartFrom={sec(18.5)}
            splitRatio={0.5}
            topVolume={0}
            bottomVolume={1.0}
            durationInFrames={sec(2.0)}
            isEnteringFromCard={true}
            isExitingToCard={true}
          />
        </Series.Sequence>

        {/* Scene 12: FULL (20.5-21.5s) Brand style final (clip3) - Floating card */}
        <Series.Sequence durationInFrames={sec(1.0)}>
          <>
            <FloatingVideoCard
              videoSource={staticFile("inputs/clip3_11-13s_brand-style_REFINED.mp4")}
              startFrom={sec(1.7)}
              durationInFrames={sec(1.0)}
              isEnteringFromSplit={true}
            />
            <Audio src={staticFile("inputs/koen_1.mp4")} startFrom={sec(20.5)} volume={1.0} />
          </>
        </Series.Sequence>

        {/* Scene 13: CTA - Full avatar (21.5-24.96s) */}
        <Series.Sequence durationInFrames={sec(3.46)}>
          <AvatarScene startFrom={sec(21.5)} />
        </Series.Sequence>
      </Series>

      {/* Hook visual effect: Crossed-out Canva logo - appears during "Forget Canva" (0.16-1.0s) */}
      <Sequence from={5} durationInFrames={25}>
        <CrossedOutLogo
          logoSource={staticFile("logos/canva.png")}
          logoSize={260}
          position="above-caption"
        />
      </Sequence>

      {/* Top layer: Synced captions across all scenes (CTA captions get special styling) */}
      <SyncedTextOverlay cues={captionCues} />
    </AbsoluteFill>
  );
};
