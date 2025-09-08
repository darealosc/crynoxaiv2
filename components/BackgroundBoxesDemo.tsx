"use client";
import React from "react";
import { Boxes } from "./ui/background-boxes";
import { cn } from "@/lib/utils";
import "@/app/globals.css";
import { FocusCards } from "@/components/ui/focus-cards";
export function BackgroundBoxesDemo() {
  return (
    <div className="h-800 relative w-350 overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-md">
      <div className="absolute inset-0  bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      < FocusCards />
    </div>
  );
}
