/**
 * Music-Synced Montage Pattern
 *
 * B-roll clips with hard cuts synced to music beats.
 * Text overlay builds cumulatively.
 *
 * Workflow:
 * 1. Extract beat timeline from audio (see processing-video skill)
 * 2. OR extract exact cuts from reference video via FFmpeg scene detection
 * 3. Define SCENES array with frame timings
 * 4. Hard cuts via Series, text via CumulativeTextOverlay
 */

import React from "react";
import {
  AbsoluteFill,
  Video,
  Audio,
  Series,
  staticFile,
} from "remotion";
import { CumulativeTextOverlay } from "../components/CumulativeTextOverlay";

const FPS = 30;

// Scene timings - typically from beat detection or reference video analysis
const SCENES = [
  {
    id: "intro",
    label: "how to CHANGE your life:",
    clip: "broll/01-intro.mp4",
    startFrame: 0,
    endFrame: 88,  // ~2.9s
  },
  {
    id: "nature",
    label: "1. nature",
    clip: "broll/02-nature.mp4",
    startFrame: 88,
    endFrame: 117,  // ~1s per item
  },
  {
    id: "recovery",
    label: "2. recovery",
    clip: "broll/03-recovery.mp4",
    startFrame: 117,
    endFrame: 146,
  },
  // ... add more scenes
];

const TOTAL_FRAMES = SCENES[SCENES.length - 1].endFrame;

// Scene clip component
const SceneClip: React.FC<{ clip: string }> = ({ clip }) => (
  <AbsoluteFill>
    <Video
      src={staticFile(clip)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  </AbsoluteFill>
);

// Main composition
export const MusicSyncedMontage: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Video layer - Series for hard cuts */}
      <Series>
        {SCENES.map((scene) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.endFrame - scene.startFrame}
          >
            <SceneClip clip={scene.clip} />
          </Series.Sequence>
        ))}
      </Series>

      {/* Text overlay layer */}
      <CumulativeTextOverlay
        scenes={SCENES}
        hookText="how to CHANGE your life:"
        fontSize={52}
        hookFontSize={68}
      />

      {/* Audio layer */}
      <Audio src={staticFile("audio/song.mp3")} volume={1} />
    </AbsoluteFill>
  );
};

/**
 * Timing extraction methods:
 *
 * 1. Beat detection (new videos):
 *    python .claude/skills/processing-video/scripts/detect-beats.py audio.mp3
 *    Outputs beat-timeline.json with frame positions
 *
 * 2. Scene detection (copying reference):
 *    ffmpeg -i reference.mp4 -filter:v "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep pts_time
 *    Extract exact cut points from reference video
 *
 * 3. Manual: 123 BPM = 0.488s per beat = ~15 frames at 30fps
 */

export default MusicSyncedMontage;
