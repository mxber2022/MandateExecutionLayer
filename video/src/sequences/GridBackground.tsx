import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { colors } from "../styles";

export const GridBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle scan line effect
  const scanY = interpolate(frame % (4 * fps), [0, 4 * fps], [0, 1080]);

  // Slow grid drift
  const gridOffset = interpolate(frame, [0, 60 * fps], [0, 40]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgLight} 50%, ${colors.bg} 100%)`,
      }}
    >
      {/* Grid pattern */}
      <svg width="1920" height="1080" style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0, ${gridOffset})`}
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={colors.gridLine} strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid)" />
      </svg>

      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          top: scanY,
          left: 0,
          width: "100%",
          height: 2,
          background: colors.green,
          opacity: 0.04,
        }}
      />

      {/* Corner brackets */}
      <svg width="1920" height="1080" style={{ position: "absolute", top: 0, left: 0 }}>
        <g opacity="0.4">
          <path d="M 40 40 L 40 80 M 40 40 L 80 40" stroke={colors.green} strokeWidth="2" fill="none" />
          <path d="M 1880 40 L 1880 80 M 1880 40 L 1840 40" stroke={colors.green} strokeWidth="2" fill="none" />
          <path d="M 40 1040 L 40 1000 M 40 1040 L 80 1040" stroke={colors.cyan} strokeWidth="2" fill="none" />
          <path d="M 1880 1040 L 1880 1000 M 1880 1040 L 1840 1040" stroke={colors.cyan} strokeWidth="2" fill="none" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
