import React from 'react';
import { Audio, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, staticFile } from 'remotion';
import { ChatInputTimings, getPhaseRanges } from './presets/chatInputPresets';

export interface ChatInputCardProps {
  prompt: string;

  // Flexible timing control
  timings: ChatInputTimings;

  // Sound effects (paths relative to public/ folder)
  sounds?: {
    keyboardFolder?: string;      // e.g., 'sound_effects/Keyboard_Typing' (folder with Keyboard-01.wav, etc.)
    mouseClickSound?: string;     // e.g., 'sound_effects/mouse-click.wav' (for final button click)
    whooshSound?: string;         // e.g., 'sound_effects/whoosh.wav'
  };

  // Visual customization
  scale?: number;
  showLoadingPulse?: boolean;
}

export const ChatInputCard: React.FC<ChatInputCardProps> = ({
  prompt,
  timings,
  sounds = {},
  scale = 1,
  showLoadingPulse = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate phase boundaries
  const phases = getPhaseRanges(timings);

  // Don't render outside of our duration
  if (frame >= phases.total) {
    return null;
  }

  // === PHASE 1: ENTRANCE (first 9 frames) ===
  const entrancePhase = frame < 9;
  const entranceSpring = spring({
    frame: Math.min(frame, 9),
    fps,
    config: {
      damping: 20,
      stiffness: 100,
      mass: 1,
    },
  });

  const entranceScale = interpolate(
    entranceSpring,
    [0, 1],
    [0.85, 1]
  );

  const entranceY = interpolate(
    entranceSpring,
    [0, 1],
    [100, 0]
  );

  const entranceOpacity = interpolate(
    frame,
    [0, 9],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // === PHASE 2: TYPING ===
  const isTyping = frame >= 0 && frame < phases.typing.end;
  const typingFrame = Math.max(0, frame);
  const charsToShow = Math.floor(
    interpolate(
      typingFrame,
      [0, timings.typeInDuration],
      [0, prompt.length],
      { extrapolateRight: 'clamp' }
    )
  );
  const displayText = prompt.substring(0, charsToShow);

  // Cursor blinks every 10 frames
  const showCursor = isTyping && Math.floor(frame / 10) % 2 === 0;

  // === PHASE 3: PAUSE ===
  const isPaused = frame >= phases.pause.start && frame < phases.pause.end;
  const pauseFrame = frame - phases.pause.start;

  // Button glow intensifies during pause
  const buttonGlowIntensity = isPaused
    ? interpolate(pauseFrame, [0, timings.pauseAfterTyping], [1, 1.5], {
        extrapolateRight: 'clamp',
      })
    : 1;

  // === PHASE 4: BUTTON PRESS ===
  const isPressingButton = frame >= phases.buttonPress.start && frame < phases.buttonPress.end;
  const buttonPressFrame = frame - phases.buttonPress.start;

  // Button press animation: down → up → settle
  const buttonPressSpring = isPressingButton
    ? spring({
        frame: buttonPressFrame,
        fps,
        config: {
          damping: 15,
          stiffness: 200,
          mass: 0.5,
        },
      })
    : 0;

  const buttonPressScale = isPressingButton
    ? interpolate(
        buttonPressSpring,
        [0, 0.3, 1],
        [1, 0.95, 1.05],
        { extrapolateRight: 'clamp' }
      )
    : 1;

  // Card shake on button press (haptic feel)
  const cardShakeX = isPressingButton && buttonPressFrame < 10
    ? Math.sin(buttonPressFrame * 2) * 3
    : 0;

  // Sparkle burst particles
  const showSparkles = isPressingButton && buttonPressFrame < timings.buttonPressDuration / 2;

  // === PHASE 5: LOADING PULSE ===
  const isLoading = showLoadingPulse && frame >= phases.loading.start && frame < phases.loading.end;
  const loadingFrame = frame - phases.loading.start;

  // Pulsing waves emanate from button
  const pulseWave1 = isLoading
    ? interpolate(
        (loadingFrame % 20) / 20,
        [0, 1],
        [0, 1],
        { extrapolateRight: 'clamp' }
      )
    : 0;

  const pulseWave2 = isLoading
    ? interpolate(
        ((loadingFrame + 7) % 20) / 20,
        [0, 1],
        [0, 1],
        { extrapolateRight: 'clamp' }
      )
    : 0;

  const pulseWave3 = isLoading
    ? interpolate(
        ((loadingFrame + 14) % 20) / 20,
        [0, 1],
        [0, 1],
        { extrapolateRight: 'clamp' }
      )
    : 0;

  // === PHASE 6: EXIT ===
  const isExiting = frame >= phases.exit.start;
  const exitFrame = frame - phases.exit.start;

  const exitOpacity = isExiting
    ? interpolate(
        exitFrame,
        [0, timings.exitDuration],
        [1, 0],
        { extrapolateRight: 'clamp' }
      )
    : 1;

  const exitScale = isExiting
    ? interpolate(
        exitFrame,
        [0, timings.exitDuration],
        [1, 0.9],
        { extrapolateRight: 'clamp' }
      )
    : 1;

  // === FINAL TRANSFORMS ===
  const finalOpacity = Math.min(entranceOpacity, exitOpacity);
  const finalScale = entranceScale * exitScale * scale;

  // Subtle float animation (throughout)
  const floatY = Math.sin((frame / 30) * Math.PI * 2) * 3;

  // Sparkle rotation (always rotating)
  const sparkleRotation = (frame * 3) % 360;

  // Shimmer effect (accelerates during loading)
  const shimmerSpeed = isLoading ? 8 : 4;
  const shimmerPosition = ((frame * shimmerSpeed) % 200) - 100;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: finalOpacity,
          transform: `
            scale(${finalScale})
            translateY(${entranceY + floatY}px)
            translateX(${cardShakeX}px)
          `,
        }}
      >
        {/* CLEAN CHAT INPUT (no heavy shadows on white) */}
        <div
          style={{
            width: 900,
            height: 140,
            background: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 70,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px 0 50px',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.15),
              0 8px 20px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.15)
            `,
          }}
        >
          {/* PROMPT TEXT */}
          <div style={{ flex: 1, paddingRight: 30 }}>
            <p
              style={{
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 42,
                fontWeight: 400,
                color: '#fff',
                margin: 0,
                lineHeight: 1.3,
                letterSpacing: '-0.5px',
              }}
            >
              {displayText}
              {showCursor && <span style={{ opacity: 0.7 }}>|</span>}
            </p>
          </div>

          {/* GENERATE BUTTON */}
          <div
            style={{
              position: 'relative',
              transform: `scale(${buttonPressScale})`,
            }}
          >
            {/* BUTTON */}
            <div
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #d4ff00 0%, #c8f000 100%)',
                borderRadius: 50,
                padding: '20px 50px',
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                boxShadow: `
                  0 ${10 * buttonGlowIntensity}px ${30 * buttonGlowIntensity}px rgba(212, 255, 0, ${0.3 * buttonGlowIntensity * (isLoading ? 2 : 1)}),
                  0 ${5 * buttonGlowIntensity}px ${15 * buttonGlowIntensity}px rgba(212, 255, 0, ${0.2 * buttonGlowIntensity * (isLoading ? 2 : 1)}),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `,
                overflow: 'hidden',
                // Subtle scale pulse during loading - more Apple-like
                transform: isLoading ? `scale(${1 + Math.sin(loadingFrame / 10) * 0.03})` : 'scale(1)',
              }}
            >
              {/* SHIMMER EFFECT */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: shimmerPosition + '%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  pointerEvents: 'none',
                }}
              />

              {/* SPARKLE ICON */}
              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                  transform: `rotate(${sparkleRotation}deg)`,
                  transformOrigin: 'center',
                }}
              >
                ✦
              </div>

              {/* SPARKLE BURST PARTICLES */}
              {showSparkles && (
                <>
                  <Sparkle angle={0} distance={buttonPressFrame * 2} />
                  <Sparkle angle={90} distance={buttonPressFrame * 2} />
                  <Sparkle angle={180} distance={buttonPressFrame * 2} />
                  <Sparkle angle={270} distance={buttonPressFrame * 2} />
                </>
              )}

              {/* BUTTON TEXT */}
              <span
                style={{
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 38,
                  fontWeight: 600,
                  color: '#2a2a2a',
                  letterSpacing: '-0.5px',
                }}
              >
                Generate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SOUND EFFECTS - PERFECTLY SYNCED */}

      {/* Entrance whoosh */}
      {sounds.whooshSound && (
        <Sequence from={0} durationInFrames={15}>
          <Audio src={staticFile(sounds.whooshSound)} volume={0.2} />
        </Sequence>
      )}

      {/* Keyboard typing - ONE SOUND PER CHARACTER for perfect sync */}
      {sounds.keyboardFolder &&
        prompt.split('').map((char, charIndex) => {
          // Skip spaces - no sound
          if (char === ' ') {
            return null;
          }

          // Calculate exact frame when this character appears
          const charFrame = Math.floor((charIndex * timings.typeInDuration) / prompt.length);

          // Use different keyboard sounds for variety (14 variations)
          const soundIndex = (charIndex % 14) + 1;
          const soundFile = `${sounds.keyboardFolder}/Keyboard-${soundIndex.toString().padStart(2, '0')}.wav`;

          return (
            <Sequence key={`key-${charIndex}`} from={charFrame} durationInFrames={2}>
              <Audio
                src={staticFile(soundFile)}
                volume={0.35}
              />
            </Sequence>
          );
        })}

      {/* Mouse click on button press */}
      {sounds.mouseClickSound && (
        <Sequence from={phases.buttonPress.start} durationInFrames={10}>
          <Audio src={staticFile(sounds.mouseClickSound)} volume={0.35} />
        </Sequence>
      )}
    </>
  );
};

// === HELPER COMPONENTS ===

const PulseWave: React.FC<{ scale: number }> = ({ scale }) => (
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 200,
      height: 200,
      marginLeft: -100,
      marginTop: -100,
      borderRadius: '50%',
      border: `3px solid rgba(212, 255, 0, ${1 - scale})`,
      transform: `scale(${1 + scale * 2})`,
      pointerEvents: 'none',
    }}
  />
);

const Sparkle: React.FC<{ angle: number; distance: number }> = ({ angle, distance }) => {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 8,
        height: 8,
        marginLeft: -4 + x,
        marginTop: -4 + y,
        backgroundColor: '#fff',
        borderRadius: '50%',
        opacity: Math.max(0, 1 - distance / 30),
        boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
      }}
    />
  );
};
