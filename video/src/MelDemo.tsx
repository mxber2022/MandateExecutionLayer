import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { GridBackground } from "./sequences/GridBackground";
import { HookScene } from "./sequences/HookScene";
import { ProblemScene } from "./sequences/ProblemScene";
import { ArchitectureScene } from "./sequences/ArchitectureScene";
import { DemoScene } from "./sequences/DemoScene";
import { TrustChainScene } from "./sequences/TrustChainScene";
import { VerifyScene } from "./sequences/VerifyScene";
import { OutroScene } from "./sequences/OutroScene";

// Load fonts
loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });
loadInter("normal", { weights: ["400", "700"], subsets: ["latin"] });

/*
 * Video Timeline (90 seconds at 30fps = 2700 frames)
 *
 * Scene 1: Hook         0s  -  5s   (0   - 150)   "What if every AI action had a receipt?"
 * Scene 2: Problem      5s  - 15s   (150 - 450)   AI agents act autonomously, no proof
 * Scene 3: Architecture 15s - 30s   (450 - 900)   5-layer MEL architecture
 * Scene 4: Live Demo    30s - 60s   (900 - 1800)  Actual demo with tx hashes
 * Scene 5: Trust Chain  60s - 70s   (1800 - 2100) receipt → mandate → proof → human
 * Scene 6: Verify       70s - 80s   (2100 - 2400) "Don't trust us. Verify."
 * Scene 7: Outro        80s - 90s   (2400 - 2700) Logo, tagline, sponsors
 */

export const MelDemo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Persistent background */}
      <GridBackground />

      {/* Scene 1: Hook (0s - 5s) */}
      <Sequence from={0} durationInFrames={5 * fps} premountFor={fps}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Problem (5s - 15s) */}
      <Sequence from={5 * fps} durationInFrames={10 * fps} premountFor={fps}>
        <ProblemScene />
      </Sequence>

      {/* Scene 3: Architecture (15s - 30s) */}
      <Sequence from={15 * fps} durationInFrames={15 * fps} premountFor={fps}>
        <ArchitectureScene />
      </Sequence>

      {/* Scene 4: Live Demo (30s - 60s) */}
      <Sequence from={30 * fps} durationInFrames={30 * fps} premountFor={fps}>
        <DemoScene />
      </Sequence>

      {/* Scene 5: Trust Chain (60s - 70s) */}
      <Sequence from={60 * fps} durationInFrames={10 * fps} premountFor={fps}>
        <TrustChainScene />
      </Sequence>

      {/* Scene 6: Verify (70s - 80s) */}
      <Sequence from={70 * fps} durationInFrames={10 * fps} premountFor={fps}>
        <VerifyScene />
      </Sequence>

      {/* Scene 7: Outro (80s - 90s) */}
      <Sequence from={80 * fps} durationInFrames={10 * fps} premountFor={fps}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
