import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { colors, fonts } from "../styles";

const chainLinks = [
  { label: "Receipt", sub: "Immutable onchain proof", color: colors.orange, icon: "🧾" },
  { label: "Mandate", sub: "Bounded authority", color: "#00e07a", icon: "📜" },
  { label: "Self Proof", sub: "ZK passport hash", color: colors.cyan, icon: "🪪" },
  { label: "Verified Human", sub: "Real, unique person", color: colors.green, icon: "👤" },
];

export const TrustChainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

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
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 150,
          textAlign: "center",
          opacity: titleSpring,
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
          TRUST CHAIN
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 48,
            fontWeight: "bold",
            color: colors.textPrimary,
          }}
        >
          Every receipt traces back to a{" "}
          <span style={{ color: colors.green }}>verified human</span>
        </div>
      </div>

      {/* Chain visualization */}
      <div
        style={{
          display: "flex",
          gap: 0,
          alignItems: "center",
          marginTop: 60,
        }}
      >
        {chainLinks.map((link, i) => {
          const delay = 1 * fps + i * 0.8 * fps;
          const linkSpring = spring({
            frame,
            fps,
            delay,
            config: { damping: 12, stiffness: 80 },
          });

          // Connection line animation
          const lineDelay = delay + 0.4 * fps;
          const lineProgress = interpolate(
            frame,
            [lineDelay, lineDelay + 0.5 * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Glow when complete chain
          const allLinked = frame > 4.5 * fps;
          const glow = allLinked
            ? interpolate(
                Math.sin((frame - 4.5 * fps) * 0.06 + i * 0.8),
                [-1, 1],
                [0.7, 1]
              )
            : 1;

          return (
            <React.Fragment key={i}>
              {/* Chain link */}
              <div
                style={{
                  width: 280,
                  padding: "40px 24px",
                  background: `radial-gradient(ellipse at center, ${link.color}12 0%, transparent 70%)`,
                  border: `2px solid ${link.color}`,
                  borderRadius: 16,
                  textAlign: "center",
                  transform: `scale(${interpolate(linkSpring, [0, 1], [0.5, 1])})`,
                  opacity: linkSpring * glow,
                  boxShadow: allLinked ? `0 0 ${25 * glow}px ${link.color}25, inset 0 0 ${15 * glow}px ${link.color}08` : "none",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{link.icon}</div>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 22,
                    fontWeight: "bold",
                    color: link.color,
                    marginBottom: 8,
                  }}
                >
                  {link.label}
                </div>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 14,
                    color: colors.textMuted,
                  }}
                >
                  {link.sub}
                </div>
              </div>

              {/* Arrow connector */}
              {i < chainLinks.length - 1 && (
                <div
                  style={{
                    width: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: `${lineProgress * 100}%`,
                      height: 2,
                      background: `linear-gradient(90deg, ${link.color}, ${chainLinks[i + 1].color})`,
                      boxShadow: `0 0 8px ${link.color}60`,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 24,
                      color: chainLinks[i + 1].color,
                      opacity: lineProgress,
                      marginLeft: -8,
                      textShadow: `0 0 10px ${chainLinks[i + 1].color}`,
                    }}
                  >
                    →
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Full chain text */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          fontFamily: fonts.mono,
          fontSize: 24,
          color: colors.textSecondary,
          opacity: spring({
            frame,
            fps,
            delay: 5 * fps,
            config: { damping: 200 },
          }),
          letterSpacing: 2,
        }}
      >
        receipt → mandate → selfProofHash → verified human
      </div>

      {/* "Fully traceable" */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          fontFamily: fonts.mono,
          fontSize: 18,
          color: colors.green,
          opacity: spring({
            frame,
            fps,
            delay: 6 * fps,
            config: { damping: 200 },
          }),
          textShadow: `0 0 15px ${colors.green}40`,
        }}
      >
        Fully traceable onchain. Zero trust required.
      </div>
    </AbsoluteFill>
  );
};
