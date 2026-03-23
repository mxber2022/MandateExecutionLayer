import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { colors, fonts } from "../styles";

const txHashes = [
  { label: "Mandate Created", hash: "0x3c8efa6f...5828" },
  { label: "send_message ✅", hash: "0x682e35f3...719c" },
  { label: "transfer_funds 🛑", hash: "0x6283bd9f...64ae" },
  { label: "query_api ✅", hash: "0xd62eede3...b53" },
  { label: "admin_override 🛑", hash: "0x89e22500...02c2" },
  { label: "send_message 🛑", hash: "0xa66d43ee...7682" },
  { label: "Mandate Revoked", hash: "0x90c02562...7094" },
];

export const VerifyScene: React.FC = () => {
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
          top: 120,
          textAlign: "center",
          opacity: titleSpring,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 60,
            fontWeight: "bold",
            color: colors.textPrimary,
          }}
        >
          Don't trust us.{" "}
          <span
            style={{
              color: colors.green,
              textShadow: `0 0 20px ${colors.green}60`,
            }}
          >
            Verify.
          </span>
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 20,
            color: colors.textMuted,
            marginTop: 16,
          }}
        >
          sepolia.basescan.org — Every transaction is public
        </div>
      </div>

      {/* Transaction list */}
      <div
        style={{
          marginTop: 80,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: 800,
        }}
      >
        {txHashes.map((tx, i) => {
          const delay = 1 * fps + i * 0.4 * fps;
          const rowSpring = spring({
            frame,
            fps,
            delay,
            config: { damping: 200 },
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 24px",
                background: `${colors.green}08`,
                border: `1px solid ${colors.green}20`,
                borderRadius: 8,
                opacity: rowSpring,
                transform: `translateX(${interpolate(rowSpring, [0, 1], [60, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 16,
                  color: colors.textSecondary,
                }}
              >
                {tx.label}
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 16,
                  color: colors.cyan,
                  letterSpacing: 1,
                }}
              >
                {tx.hash}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          display: "flex",
          gap: 80,
          opacity: spring({
            frame,
            fps,
            delay: 5 * fps,
            config: { damping: 200 },
          }),
        }}
      >
        {[
          { value: "7", label: "ONCHAIN TXS", color: colors.green },
          { value: "5", label: "RECEIPTS", color: colors.cyan },
          { value: "100%", label: "VERIFIABLE", color: colors.orange },
          { value: "0", label: "TRUST REQUIRED", color: colors.green },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 44,
                fontWeight: "bold",
                color: stat.color,
                textShadow: `0 0 15px ${stat.color}40`,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 12,
                color: colors.textMuted,
                letterSpacing: 3,
                marginTop: 4,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
