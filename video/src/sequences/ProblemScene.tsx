import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { colors, fonts } from "../styles";

const problems = [
  { icon: "🤖", text: "AI agents act autonomously" },
  { icon: "❓", text: "No proof they stayed in bounds" },
  { icon: "🔓", text: "Identity ≠ accountability" },
];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  // Fade out at end
  const fadeOut = interpolate(frame, [9 * fps, 10 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Section label */}
      <div
        style={{
          position: "absolute",
          top: 200,
          fontFamily: fonts.mono,
          fontSize: 16,
          color: colors.textMuted,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: titleSpring,
        }}
      >
        THE PROBLEM
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 260,
          fontFamily: fonts.mono,
          fontSize: 52,
          fontWeight: "bold",
          color: colors.textPrimary,
          textAlign: "center",
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          opacity: titleSpring,
        }}
      >
        Personhood is solved.{" "}
        <span style={{ color: colors.orange }}>Action legitimacy</span> is not.
      </div>

      {/* Problem cards */}
      <div
        style={{
          position: "absolute",
          top: 440,
          display: "flex",
          gap: 60,
          justifyContent: "center",
        }}
      >
        {problems.map((problem, i) => {
          const delay = 1 * fps + i * 0.6 * fps;
          const cardSpring = spring({
            frame,
            fps,
            delay,
            config: { damping: 15, stiffness: 80 },
          });

          return (
            <div
              key={i}
              style={{
                width: 380,
                padding: "40px 30px",
                background: `linear-gradient(180deg, rgba(255,68,68,0.08) 0%, rgba(255,68,68,0.02) 100%)`,
                border: `1px solid rgba(255,68,68,0.3)`,
                borderRadius: 12,
                textAlign: "center",
                transform: `translateY(${interpolate(cardSpring, [0, 1], [60, 0])}px) scale(${interpolate(cardSpring, [0, 1], [0.9, 1])})`,
                opacity: cardSpring,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 20 }}>{problem.icon}</div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 22,
                  color: "#ffaaaa",
                  lineHeight: 1.4,
                }}
              >
                {problem.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom line */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          fontFamily: fonts.mono,
          fontSize: 24,
          color: colors.textMuted,
          opacity: spring({
            frame,
            fps,
            delay: 4 * fps,
            config: { damping: 200 },
          }),
        }}
      >
        The missing layer:{" "}
        <span style={{ color: colors.orange, fontWeight: "bold" }}>
          proving an agent acted within its mandate
        </span>
      </div>
    </AbsoluteFill>
  );
};
