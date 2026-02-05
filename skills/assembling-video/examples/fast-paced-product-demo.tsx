/**
 * Fast-Paced Product Demo - Instagram Reel Pattern
 *
 * **Production-quality example** for creating fast-paced product marketing videos.
 * Hook + Demo + CTA structure optimized for Instagram Reels and TikTok.
 *
 * **Style characteristics:**
 * - Pacing: 61.8 cuts/min (aggressive, attention-grabbing)
 * - Duration: ~25 seconds (optimal for Reels)
 * - Format: 1080×1920 (9:16 vertical)
 * - Transitions: Hard cuts (no fades)
 * - Audio: Background music + sound effects + narration
 *
 * **Three-act structure:**
 * 1. **Hook** (0-1.08s): Grab attention with competitor comparison
 *    - Full-screen avatar with zoom animation
 *    - Crossed-out competitor logo
 *    - Riser sound effect for impact
 *
 * 2. **Demo** (1.08-21.5s): Show product features rapidly
 *    - 9 split-screen scenes (UI top, speaker bottom)
 *    - 2-2.5s per scene (fast pacing)
 *    - Dynamic caption positioning (center for splits)
 *
 * 3. **CTA** (21.5-24.96s): Clear call-to-action
 *    - Return to full-screen avatar
 *    - Special caption styling (transparent bg, highlighted keywords)
 *    - Bottom-positioned captions
 *
 * **Key features that make this work:**
 *
 * **1. Hook Impact:**
 * - Zoom animation (1.2x → 1.0x) creates visual interest
 * - CrossedOutLogo component reinforces "forget competitor" message
 * - Riser sound effect adds energy
 * - Timing: Logo appears during mention (frames 5-30)
 *
 * **2. Smart Caption System:**
 * - Word-level timestamps for frame-perfect sync
 * - Grammar-aware chunking (never ends on "a", "the", "of", etc.)
 * - 1-3 words per caption for readability
 * - Position switches based on scene type:
 *   - Bottom for full-screen avatar
 *   - Center for split-screen (avoids overlap)
 * - Special CTA styling with keyword highlighting
 *
 * **3. Split-Screen Demo:**
 * - 50/50 ratio keeps both elements balanced
 * - UI/product on top, speaker on bottom
 * - Continuous audio (no restarts between cuts)
 * - Avatar video synced to timeline (uses startFrom for continuity)
 *
 * **4. Audio Mixing:**
 * - Narration: Full volume (1.0) from avatar video
 * - Background music: Low volume (0.1) for atmosphere
 * - Sound effects: Medium volume (0.5) for emphasis
 * - Playback rate adjustment (1.5x) on riser for intensity
 *
 * **Iterative refinement notes:**
 * - Logo size increased from 180px → 260px for better visibility
 * - Logo position moved closer to caption (bottom: 23%)
 * - Rounded corners added (24px radius) for modern look
 * - Cross animation slowed (8→12 frames) for more impact
 * - Logo appears earlier (frame 5 vs 12) for longer presence
 * - Caption "brand" isolated as standalone for CTA emphasis
 *
 * **Component usage:**
 * - `SplitScreenLayout`: 9 scenes with 50/50 split
 * - `SyncedTextOverlay`: Dynamic positioning, CTA styling
 * - `CrossedOutLogo`: Hook visual effect
 * - `AvatarScene`: Custom component with zoom hook
 *
 * **Data requirements:**
 * - `timeline.json`: Word-level timestamps from transcription
 * - Avatar video: Speaker/narrator (continuous audio source)
 * - B-roll clips: Product UI demos, features, screenshots
 * - Competitor logo: For crossed-out effect
 * - Background music: Low-volume atmospheric track
 * - Sound effects: Riser or impact sound for hook
 *
 * **Use this pattern for:**
 * - Product launches and demos
 * - SaaS feature showcases
 * - App walkthroughs
 * - Tool comparisons ("Forget X, use Y")
 * - Fast-paced marketing content
 * - Instagram Reels / TikTok videos
 *
 * **Adaptation tips:**
 * - Adjust scene timings based on your narration pace
 * - Replace B-roll clips with your product footage
 * - Update SCENE_TIMINGS array to match your scenes
 * - Customize caption chunking for different languages
 * - Change split ratio if UI needs more/less prominence
 *
 * **Performance notes:**
 * - Renders in ~40-60s on M1 Mac
 * - File size: ~10-15MB at CRF 18
 * - No performance issues with 11 scenes + overlays
 * - Loads timeline.json dynamically using delayRender()
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
import { SyncedTextOverlay } from "../components/SyncedTextOverlay";
import { SplitScreenLayout } from "../components/SplitScreenLayout";
import { CrossedOutLogo } from "../components/CrossedOutLogo";

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

// Scene timing for position detection
const SCENE_TIMINGS = [
  { start: 0, end: 1.08, type: "avatar" as const },
  { start: 1.08, end: 3.5, type: "split" as const },
  { start: 3.5, end: 6.0, type: "split" as const },
  { start: 6.0, end: 8.5, type: "split" as const },
  { start: 8.5, end: 11.0, type: "split" as const },
  { start: 11.0, end: 13.5, type: "split" as const },
  { start: 13.5, end: 16.0, type: "split" as const },
  { start: 16.0, end: 18.5, type: "split" as const },
  { start: 18.5, end: 20.5, type: "split" as const },
  { start: 20.5, end: 21.5, type: "split" as const },
  { start: 21.5, end: 24.96, type: "avatar" as const }, // CTA is full avatar
];

// Determine caption position based on scene type
const getCaptionPosition = (timeInSeconds: number): "bottom" | "center" => {
  const scene = SCENE_TIMINGS.find(
    (s) => timeInSeconds >= s.start && timeInSeconds < s.end
  );
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
          src={staticFile("inputs/avatar.mp4")}
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

export const FastPacedProductDemo: React.FC = () => {
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
        volume={0.1}
      />

      {/* Riser sound effect - plays at start for hook impact */}
      <Audio
        src={staticFile(
          "sound_effects/popular-riser-metallic-sound-effect-trimmed.mp3"
        )}
        volume={0.5}
        playbackRate={1.5}
      />

      {/* Fast-paced scene cuts */}
      <Series>
        {/* Scene 1: Hook - Avatar only (0-1.08s) with ZOOM animation */}
        <Series.Sequence durationInFrames={sec(1.08)}>
          <AvatarScene startFrom={0} isHook={true} />
        </Series.Sequence>

        {/* Scene 2: Split screen (1.08-3.5s) */}
        <Series.Sequence durationInFrames={sec(2.42)}>
          <SplitScreenLayout
            topSource={staticFile("inputs/broll/demo1.mp4")}
            bottomSource={staticFile("inputs/avatar.mp4")}
            topStartFrom={0}
            bottomStartFrom={sec(1.08)}
            splitRatio={0.5}
            topVolume={0}
            bottomVolume={1.0}
          />
        </Series.Sequence>

        {/* Additional scenes follow same pattern... */}
        {/* See source file for complete scene breakdown */}

        {/* Final scene: CTA - Full screen avatar (21.5-24.96s) */}
        <Series.Sequence durationInFrames={sec(3.46)}>
          <AvatarScene startFrom={sec(21.5)} />
        </Series.Sequence>
      </Series>

      {/* Hook visual effect: Crossed-out competitor logo */}
      <Sequence from={5} durationInFrames={25}>
        <CrossedOutLogo
          logoSource={staticFile("logos/competitor.png")}
          logoSize={260}
          position="above-caption"
        />
      </Sequence>

      {/* Top layer: Synced captions across all scenes */}
      <SyncedTextOverlay cues={captionCues} />
    </AbsoluteFill>
  );
};
