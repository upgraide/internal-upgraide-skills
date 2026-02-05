/**
 * Chat Input Card Animation Presets
 *
 * Pre-configured timing profiles for different video pacing needs.
 * All durations are in frames (30fps).
 */

export interface ChatInputTimings {
  typeInDuration: number;       // Frames to type out the text
  pauseAfterTyping: number;     // Frames to pause before button press
  buttonPressDuration: number;  // Frames for button press animation
  loadingPulseDuration: number; // Frames showing loading/processing effect
  exitDuration: number;         // Frames to fade out and exit
}

export const CHAT_INPUT_PRESETS: Record<string, ChatInputTimings> = {
  /**
   * ULTRA FAST - Maximum energy, TikTok-style rapid cuts
   * Total: ~60 frames / 2.0 seconds
   * Use for: High-energy montages, rapid demonstrations
   */
  ultraFast: {
    typeInDuration: 15,        // 0.5s - blink and you miss it
    pauseAfterTyping: 9,       // 0.3s - barely a breath
    buttonPressDuration: 9,    // 0.3s - instant response
    loadingPulseDuration: 15,  // 0.5s - quick pulse
    exitDuration: 12,          // 0.4s - rapid exit
  },

  /**
   * ENERGETIC - Fast & punchy, perfect for demos
   * Total: ~105 frames / 3.5 seconds
   * Use for: Product demos, feature showcases, energetic content
   */
  energetic: {
    typeInDuration: 24,        // 0.8s - readable but quick
    pauseAfterTyping: 15,      // 0.5s - moment to anticipate
    buttonPressDuration: 15,   // 0.5s - satisfying press
    loadingPulseDuration: 30,  // 1.0s - visible processing
    exitDuration: 21,          // 0.7s - smooth exit
  },

  /**
   * DRAMATIC - Lets animations breathe, high impact
   * Total: ~147 frames / 4.9 seconds
   * Use for: Hero sections, important reveals, tutorial content
   */
  dramatic: {
    typeInDuration: 30,        // 1.0s - every character visible
    pauseAfterTyping: 24,      // 0.8s - build anticipation
    buttonPressDuration: 18,   // 0.6s - deliberate press
    loadingPulseDuration: 45,  // 1.5s - extended processing
    exitDuration: 30,          // 1.0s - graceful exit
  },

  /**
   * MINIMAL - Just the essentials, super snappy
   * Total: ~45 frames / 1.5 seconds
   * Use for: Quick transitions, B-roll inserts
   */
  minimal: {
    typeInDuration: 12,        // 0.4s
    pauseAfterTyping: 6,       // 0.2s
    buttonPressDuration: 6,    // 0.2s
    loadingPulseDuration: 0,   // 0s - skip loading
    exitDuration: 9,           // 0.3s
  },
};

/**
 * Helper to calculate total duration for a preset
 */
export function getTotalDuration(timings: ChatInputTimings): number {
  return (
    timings.typeInDuration +
    timings.pauseAfterTyping +
    timings.buttonPressDuration +
    timings.loadingPulseDuration +
    timings.exitDuration
  );
}

/**
 * Get frame ranges for each phase
 */
export function getPhaseRanges(timings: ChatInputTimings) {
  let currentFrame = 0;

  return {
    typing: {
      start: currentFrame,
      end: (currentFrame += timings.typeInDuration),
    },
    pause: {
      start: currentFrame,
      end: (currentFrame += timings.pauseAfterTyping),
    },
    buttonPress: {
      start: currentFrame,
      end: (currentFrame += timings.buttonPressDuration),
    },
    loading: {
      start: currentFrame,
      end: (currentFrame += timings.loadingPulseDuration),
    },
    exit: {
      start: currentFrame,
      end: (currentFrame += timings.exitDuration),
    },
    total: currentFrame,
  };
}
