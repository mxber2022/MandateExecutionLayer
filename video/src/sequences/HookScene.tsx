import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { colors, fonts } from "../styles";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "What if every AI action..." typewriter
  const line1 = "What if every AI action";
  const line2 = "had a receipt?";

  const charsLine1 = Math.min(
    Math.floor(interpolate(frame, [0, 1.5 * fps], [0, line1.length], { extrapolateRight: "clamp" })),
    line1.length
  );

  const charsLine2 = Math.min(
    Math.floor(
      interpolate(frame, [1.8 * fps, 3 * fps], [0, line2.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    ),
    line2.length
  );

  // Cursor blink
  const cursorVisible = Math.floor(frame / (fps * 0.4)) % 2 === 0;

  // Glow pulse on "receipt"
  const glowIntensity = frame > 3.5 * fps
    ? interpolate(Math.sin((frame - 3.5 * fps) * 0.1), [-1, 1], [10, 30])
    : 0;

  // Fade in the whole scene
  const opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], { extrapolateRight: "clamp" });

  // Fade out
  const fadeOut = interpolate(frame, [4.5 * fps, 5 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: opacity * fadeOut,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 72,
            color: colors.textPrimary,
            letterSpacing: -1,
            lineHeight: 1.3,
          }}
        >
          {line1.slice(0, charsLine1)}
          {charsLine1 < line1.length && cursorVisible && (
            <span style={{ color: colors.green }}>▌</span>
          )}
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 88,
            fontWeight: "bold",
            color: colors.green,
            letterSpacing: -1,
            lineHeight: 1.3,
            textShadow: `0 0 ${glowIntensity}px ${colors.green}`,
          }}
        >
          {line2.slice(0, charsLine2)}
          {charsLine2 > 0 && charsLine2 < line2.length && cursorVisible && (
            <span>▌</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
