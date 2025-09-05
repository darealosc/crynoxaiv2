"use client";

import React from "react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export function TextHoverEffectDemo() {
  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  return (
    <div className="relative h-[600rem] flex items-center justify-center bg-black rounded-2xl">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true },
          fpsLimit: 60,
          particles: {
            number: { value: 200, density: { enable: true, area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.8, random: true },
            size: { value: 1.5, random: true },
            move: { enable: false, speed: 0.2, direction: "none", outModes: "out" },
          },
          interactivity: {
            events: { onHover: { enable: false }, onClick: { enable: true } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 -z-10"
      />
      <TextHoverEffect text="Crynox" className="text-white" />
    </div>
  );
}
