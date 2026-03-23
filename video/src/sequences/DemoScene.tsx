import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { colors, fonts } from "../styles";

const actions = [
  {
    num: 1,
    action: "send_message",
    context: "In mandate",
    result: "EXECUTED",
    compliant: true,
    tx: "0x682e35f3...719c",
  },
  {
    num: 2,
    action: "transfer_funds",
    context: "Not in allowed actions",
    result: "BLOCKED",
    compliant: false,
    tx: "0x6283bd9f...64ae",
  },
  {
    num: 3,
    action: "query_api",
    context: "In mandate",
    result: "EXECUTED",
    compliant: true,
    tx: "0xd62eede3...b53",
  },
  {
    num: 4,
    action: "admin_override",
    context: "Not in allowed actions",
    result: "BLOCKED",
    compliant: false,
    tx: "0x89e22500...02c2",
  },
  {
    num: 5,
    action: "send_message",
    context: "After revocation",
    result: "BLOCKED",
    compliant: false,
    tx: "0xa66d43ee...7682",
  },
];

export const DemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  // Fade out
  const fadeOut = interpolate(frame, [28 * fps, 30 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 80,
        opacity: fadeOut,
      }}
    >
      {/* Title */}
      <div
        style={{
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
            marginBottom: 12,
          }}
        >
          LIVE DEMO — BASE SEPOLIA
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 48,
            fontWeight: "bold",
            color: colors.textPrimary,
          }}
        >
          Mandate #10 — 5 Actions, 7 Transactions
        </div>
      </div>

      {/* Mandate creation indicator */}
      <div
        style={{
          marginTop: 40,
          padding: "16px 40px",
          border: `1px solid ${colors.green}40`,
          borderRadius: 8,
          fontFamily: fonts.mono,
          fontSize: 16,
          color: colors.green,
          opacity: spring({ frame, fps, delay: 1 * fps, config: { damping: 200 } }),
        }}
      >
        ✓ Mandate created — allowed: [send_message, query_api] — expires: 24h
      </div>

      {/* Action rows */}
      <div style={{ marginTop: 40, width: 1400 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            padding: "12px 20px",
            borderBottom: `1px solid ${colors.gridLine}`,
            opacity: spring({ frame, fps, delay: 2 * fps, config: { damping: 200 } }),
          }}
        >
          {["#", "ACTION", "CONTEXT", "RESULT", "TX HASH"].map((h, i) => (
            <div
              key={h}
              style={{
                flex: i === 0 ? "0 0 60px" : i === 4 ? "0 0 280px" : 1,
                fontFamily: fonts.mono,
                fontSize: 13,
                color: colors.textMuted,
                letterSpacing: 3,
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {actions.map((action, i) => {
          const rowDelay = 3 * fps + i * 1.5 * fps;
          const rowSpring = spring({
            frame,
            fps,
            delay: rowDelay,
            config: { damping: 200 },
          });

          // Processing animation
          const isProcessing =
            frame >= rowDelay && frame < rowDelay + 0.8 * fps;
          const processingPulse = isProcessing
            ? interpolate(Math.sin((frame - rowDelay) * 0.3), [-1, 1], [0.3, 0.8])
            : 0;

          // Result flash
          const resultDelay = rowDelay + 0.8 * fps;
          const resultSpring = spring({
            frame,
            fps,
            delay: resultDelay,
            config: { damping: 15, stiffness: 200 },
          });

          const resultColor = action.compliant ? colors.executed : colors.blocked;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                padding: "16px 20px",
                borderBottom: `1px solid ${colors.gridLine}40`,
                opacity: rowSpring,
                transform: `translateX(${interpolate(rowSpring, [0, 1], [-40, 0])}px)`,
                background: isProcessing
                  ? `linear-gradient(90deg, transparent, ${colors.cyan}${Math.floor(processingPulse * 15).toString(16)}0, transparent)`
                  : frame >= resultDelay
                    ? `linear-gradient(90deg, transparent, ${resultColor}08, transparent)`
                    : "transparent",
              }}
            >
              <div
                style={{
                  flex: "0 0 60px",
                  fontFamily: fonts.mono,
                  fontSize: 18,
                  color: colors.textMuted,
                }}
              >
                {action.num}
              </div>
              <div
                style={{
                  flex: 1,
                  fontFamily: fonts.mono,
                  fontSize: 20,
                  color: colors.textPrimary,
                  fontWeight: "bold",
                }}
              >
                {action.action}
              </div>
              <div
                style={{
                  flex: 1,
                  fontFamily: fonts.mono,
                  fontSize: 16,
                  color: colors.textMuted,
                }}
              >
                {action.context}
              </div>
              <div
                style={{
                  flex: 1,
                  fontFamily: fonts.mono,
                  fontSize: 20,
                  fontWeight: "bold",
                  color: resultColor,
                  opacity: resultSpring,
                  transform: `scale(${interpolate(resultSpring, [0, 0.5, 1], [0.8, 1.15, 1])})`,
                  textShadow: resultSpring > 0.5 ? `0 0 15px ${resultColor}60` : "none",
                }}
              >
                {action.compliant ? "✅ " : "🛑 "}
                {action.result}
              </div>
              <div
                style={{
                  flex: "0 0 280px",
                  fontFamily: fonts.mono,
                  fontSize: 14,
                  color: colors.cyan,
                  opacity: resultSpring * 0.7,
                }}
              >
                {action.tx}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revocation indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          display: "flex",
          gap: 40,
          alignItems: "center",
          opacity: spring({
            frame,
            fps,
            delay: 10.5 * fps,
            config: { damping: 200 },
          }),
        }}
      >
        <div
          style={{
            padding: "12px 24px",
            border: `1px solid ${colors.orange}60`,
            borderRadius: 8,
            fontFamily: fonts.mono,
            fontSize: 16,
            color: colors.orange,
          }}
        >
          ⚠ Mandate revoked after action #4
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 16,
            color: colors.textMuted,
          }}
        >
          Action #5 blocked post-revocation — system works as designed
        </div>
      </div>
    </AbsoluteFill>
  );
};
