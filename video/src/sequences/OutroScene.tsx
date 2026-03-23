import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { colors, fonts } from "../styles";

const sponsors = [
  { name: "Self Protocol", role: "Personhood", color: colors.green },
  { name: "MetaMask", role: "Delegations", color: "#00e07a" },
  { name: "Venice AI", role: "Private Reasoning", color: colors.cyan },
  { name: "Protocol Labs", role: "ERC-8004", color: colors.blue },
  { name: "Synthesis", role: "Open Track", color: colors.orange },
];

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Tagline
  const taglineSpring = spring({
    frame,
    fps,
    delay: 1 * fps,
    config: { damping: 200 },
  });

  // Glow pulse
  const glowPulse = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [15, 35]
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* MEL Logo */}
      <div
        style={{
          textAlign: "center",
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.6, 1])})`,
          opacity: logoSpring,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 80,
            fontWeight: "bold",
            background: `linear-gradient(135deg, ${colors.green}, ${colors.cyan})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 ${glowPulse}px ${colors.green}30`,
            letterSpacing: -2,
          }}
        >
          MANDATE EXECUTION LAYER
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 24,
          fontFamily: fonts.mono,
          fontSize: 28,
          color: colors.textSecondary,
          opacity: taglineSpring,
          transform: `translateY(${interpolate(taglineSpring, [0, 1], [20, 0])}px)`,
          textAlign: "center",
        }}
      >
        The missing primitive between identity and autonomy.
      </div>

      {/* Subtitle */}
      <div
        style={{
          marginTop: 12,
          fontFamily: fonts.mono,
          fontSize: 18,
          color: colors.textMuted,
          opacity: taglineSpring,
        }}
      >
        Humans define boundaries. Agents execute within them. Anyone can verify — onchain.
      </div>

      {/* Sponsor badges */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          display: "flex",
          gap: 24,
        }}
      >
        {sponsors.map((sponsor, i) => {
          const badgeSpring = spring({
            frame,
            fps,
            delay: 2 * fps + i * 0.3 * fps,
            config: { damping: 200 },
          });

          return (
            <div
              key={i}
              style={{
                padding: "10px 20px",
                border: `1px solid ${sponsor.color}60`,
                borderRadius: 6,
                opacity: badgeSpring,
                transform: `translateY(${interpolate(badgeSpring, [0, 1], [20, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 13,
                  color: sponsor.color,
                  fontWeight: "bold",
                }}
              >
                {sponsor.name}
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  color: colors.textMuted,
                  marginTop: 2,
                }}
              >
                {sponsor.role}
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub + Chain */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          display: "flex",
          gap: 40,
          opacity: spring({
            frame,
            fps,
            delay: 4 * fps,
            config: { damping: 200 },
          }),
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.textMuted }}>
          github.com/mxber2022/MandateExecutionLayer
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.textMuted }}>
          •
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.cyan }}>
          Base Sepolia (84532)
        </div>
      </div>
    </AbsoluteFill>
  );
};
