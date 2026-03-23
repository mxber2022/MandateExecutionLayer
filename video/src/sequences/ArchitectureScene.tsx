import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { colors, fonts } from "../styles";

const layers = [
  { name: "PERSONHOOD", sub: "Self Protocol ZK", color: colors.green, icon: "🪪" },
  { name: "MANDATE", sub: "MandateRegistry.sol", color: "#00e07a", icon: "📜" },
  { name: "IDENTITY", sub: "ERC-8004 Agent", color: colors.cyan, icon: "🤖" },
  { name: "REASONING", sub: "Venice AI Private", color: colors.blue, icon: "🧠" },
  { name: "RECEIPT", sub: "ActionReceipt.sol", color: colors.orange, icon: "🧾" },
];

export const ArchitectureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  // Fade out
  const fadeOut = interpolate(frame, [14 * fps, 15 * fps], [1, 0], {
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
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 100,
          textAlign: "center",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 16,
            color: colors.textMuted,
            letterSpacing: 6,
            marginBottom: 16,
          }}
        >
          THE SOLUTION
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 56,
            fontWeight: "bold",
            color: colors.textPrimary,
          }}
        >
          Mandate Execution Layer
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            color: colors.textSecondary,
            marginTop: 10,
          }}
        >
          Five load-bearing layers. Every one is critical.
        </div>
      </div>

      {/* Architecture layers */}
      <div
        style={{
          position: "absolute",
          top: 300,
          display: "flex",
          gap: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {layers.map((layer, i) => {
          const delay = 1.5 * fps + i * 0.5 * fps;
          const layerSpring = spring({
            frame,
            fps,
            delay,
            config: { damping: 12, stiffness: 100 },
          });

          // Glow pulse after all layers are shown
          const allIn = frame > 4 * fps;
          const glowPulse = allIn
            ? interpolate(
                Math.sin((frame - 4 * fps) * 0.08 + i * 0.5),
                [-1, 1],
                [0.6, 1]
              )
            : 1;

          // Arrow between layers
          const showArrow = i < layers.length - 1;
          const arrowOpacity = spring({
            frame,
            fps,
            delay: delay + 0.3 * fps,
            config: { damping: 200 },
          });

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  width: 260,
                  padding: "30px 20px",
                  background: `linear-gradient(180deg, ${layer.color}18 0%, ${layer.color}04 100%)`,
                  border: `1.5px solid ${layer.color}`,
                  borderRadius: 10,
                  textAlign: "center",
                  transform: `translateY(${interpolate(layerSpring, [0, 1], [80, 0])}px) scale(${interpolate(layerSpring, [0, 1], [0.8, 1])})`,
                  opacity: layerSpring * glowPulse,
                  boxShadow: allIn ? `0 0 ${20 * glowPulse}px ${layer.color}30` : "none",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{layer.icon}</div>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 16,
                    fontWeight: "bold",
                    color: layer.color,
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  {layer.name}
                </div>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 12,
                    color: colors.textMuted,
                  }}
                >
                  {layer.sub}
                </div>
              </div>
              {showArrow && (
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 28,
                    color: layer.color,
                    opacity: arrowOpacity,
                    textShadow: `0 0 10px ${layer.color}`,
                  }}
                >
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* "Each layer is load-bearing" text */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          display: "flex",
          gap: 40,
          justifyContent: "center",
        }}
      >
        {layers.map((layer, i) => {
          const entryDelay = 5 * fps + i * 0.3 * fps;
          const entrySpring = spring({
            frame,
            fps,
            delay: entryDelay,
            config: { damping: 200 },
          });

          const descriptions = [
            "Proves human, not bot",
            "Defines the boundary",
            "Verifiable agent ID",
            "Private compliance",
            "Immutable proof",
          ];

          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                opacity: entrySpring,
                transform: `translateY(${interpolate(entrySpring, [0, 1], [20, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 14,
                  color: layer.color,
                  fontWeight: "bold",
                }}
              >
                {layer.name}
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 13,
                  color: colors.textMuted,
                  marginTop: 4,
                }}
              >
                {descriptions[i]}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
