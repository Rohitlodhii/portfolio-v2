"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import {
  IconHome,
  IconSearch,
  IconMessage2,
  IconBell,
  IconSettings,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface DockItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

// 1. Helper function to generate SVG Displacement Map data URI
function getDisplacementMap(height: number, width: number, radius: number, depth: number) {
  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
          .mix { mix-blend-mode: screen; }
      </style>
      <defs>
          <linearGradient 
            id="Y" 
            x1="0" 
            x2="0" 
            y1="${Math.ceil((radius / height) * 15)}%" 
            y2="${Math.floor(100 - (radius / height) * 15)}%">
              <stop offset="0%" stop-color="#0F0" />
              <stop offset="100%" stop-color="#000" />
          </linearGradient>
          <linearGradient 
            id="X" 
            x1="${Math.ceil((radius / width) * 15)}%" 
            x2="${Math.floor(100 - (radius / width) * 15)}%"
            y1="0" 
            y2="0">
              <stop offset="0%" stop-color="#F00" />
              <stop offset="100%" stop-color="#000" />
          </linearGradient>
      </defs>

      <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
      <g filter="blur(2px)">
        <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
        <rect
            x="0"
            y="0"
            height="${height}"
            width="${width}"
            fill="url(#Y)"
            className="mix"
        />
        <rect
            x="0"
            y="0"
            height="${height}"
            width="${width}"
            fill="url(#X)"
            className="mix"
        />
        <rect
            x="${depth}"
            y="${depth}"
            height="${height - 2 * depth}"
            width="${width - 2 * depth}"
            fill="#808080"
            rx="${radius}"
            ry="${radius}"
            filter="blur(${depth}px)"
        />
      </g>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// 2. Helper function to generate SVG Displacement Filter data URI
function getDisplacementFilter(
  height: number,
  width: number,
  radius: number,
  depth: number,
  strength = 100,
  chromaticAberration = 0
) {
  const displacementMapUrl = getDisplacementMap(height, width, radius, depth);
  
  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <filter id="displace" color-interpolation-filters="sRGB">
              <feImage x="0" y="0" height="${height}" width="${width}" href="${displacementMapUrl}" result="displacementMap" />
              <feDisplacementMap
                  transform-origin="center"
                  in="SourceGraphic"
                  in2="displacementMap"
                  scale="${strength + chromaticAberration * 2}"
                  xChannelSelector="R"
                  yChannelSelector="G"
              />
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
                result="displacedR"
              />
              <feDisplacementMap
                  in="SourceGraphic"
                  in2="displacementMap"
                  scale="${strength + chromaticAberration}"
                  xChannelSelector="R"
                  yChannelSelector="G"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0
                        0 1 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
                result="displacedG"
              />
              <feDisplacementMap
                  in="SourceGraphic"
                  in2="displacementMap"
                  scale="${strength}"
                  xChannelSelector="R"
                  yChannelSelector="G"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 1 0 0
                        0 0 0 1 0"
                result="displacedB"
              />
              <feBlend in="displacedR" in2="displacedG" mode="screen"/>
              <feBlend in2="displacedB" mode="screen"/>
          </filter>
      </defs>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#displace";
}

export default function ExamplePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [svgFilterSupport, setSvgFilterSupport] = useState(false);

  // Dynamic Liquid glass parameters controlled from the top panel
  const [strength, setStrength] = useState(75);
  const [depth, setDepth] = useState(8);
  const [chromaticAberration, setChromaticAberration] = useState(3);

  // Generated dynamic filter URIs
  const [dockFilter, setDockFilter] = useState<string | null>(null);

  // Animation controller for the whole dock container press effect
  const dockControls = useAnimation();

  const dockItems: DockItem[] = [
    { icon: IconHome, label: "Home" },
    { icon: IconSearch, label: "Search" },
    { icon: IconMessage2, label: "Messages" },
    { icon: IconBell, label: "Notifications" },
    { icon: IconSettings, label: "Settings" },
  ];

  // Detect SVG Filter Support in backdrop-filter
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = /chrome|chromium|crios|edg/.test(userAgent) && !/firefox|fxios/.test(userAgent);
    setSvgFilterSupport(isChrome);
  }, []);

  // Regenerate displacement filter for the Dock container when parameters change
  useEffect(() => {
    // Dock dimensions: width 280px, height 56px, radius 28px
    const dFilter = getDisplacementFilter(56, 280, 28, depth, strength, chromaticAberration);
    setDockFilter(dFilter);
  }, [strength, depth, chromaticAberration]);

  // Handle clicking a tab: sets index and triggers springy press animation on the whole dock
  const handleTabClick = (idx: number) => {
    setActiveIndex(idx);
    
    // Smooth physical spring: set scale to 0.97 instantly, then spring back to 1.0
    dockControls.set({ scale: 0.97 });
    dockControls.start({
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 280,
        damping: 16,
        mass: 0.7,
      },
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center">
      {/* Background glowing gradients to create depth for backdrop-blur */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[90px]" />
        <div className="absolute top-[50%] right-[15%] w-[450px] h-[450px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-[110px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[380px] h-[380px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Background Content Layout (Scrollable behind the floating Dock) */}
      <div className="w-full max-w-4xl px-6 py-16 flex flex-col gap-10 pb-36">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
            Liquid Glass Experiment
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Workspace Design Studio
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Adjust the glass refraction parameters below. Click any icon on the floating bottom dock to trigger a springy click animation on the entire dock container.
          </p>
        </header>

        {/* Glass Configuration Panel at the Top */}
        <div className="w-full p-6 bg-card/40 border border-border/60 rounded-2xl shadow-sm backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Strength Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Displacement Strength</span>
              <span className="font-mono text-primary">{strength}</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-secondary accent-primary cursor-pointer"
            />
          </div>

          {/* Depth Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Edge Glass Depth</span>
              <span className="font-mono text-primary">{depth}</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-secondary accent-primary cursor-pointer"
            />
          </div>

          {/* Chromatic Aberration Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Chromatic Aberration</span>
              <span className="font-mono text-primary">{chromaticAberration}</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={chromaticAberration}
              onChange={(e) => setChromaticAberration(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-secondary accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Content Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl flex flex-col gap-4 shadow-sm hover:border-border transition-colors">
            <div className="h-40 w-full rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-300 opacity-90" />
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Design System</span>
              <h3 className="text-lg font-semibold text-foreground">Interactive Tokens</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              A comprehensive system mapping design tokens, shadows, spacing, and micro-interactions seamlessly across devices.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl flex flex-col gap-4 shadow-sm hover:border-border transition-colors">
            <div className="h-40 w-full rounded-lg bg-gradient-to-tr from-emerald-500 to-emerald-300 opacity-90" />
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">Engineering</span>
              <h3 className="text-lg font-semibold text-foreground">Dynamic Refractions</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Leveraging advanced SVG displacement filtering on client-side backdrop filters to mock real-world physical glass behaviors.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl flex flex-col gap-4 shadow-sm hover:border-border transition-colors">
            <div className="h-40 w-full rounded-lg bg-gradient-to-tr from-rose-500 to-rose-300 opacity-90" />
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Case Study</span>
              <h3 className="text-lg font-semibold text-foreground">Aesthetic & Utility</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Stripping away unnecessary visual borders and using native fluid math for cleaner interfaces.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl flex flex-col gap-4 shadow-sm hover:border-border transition-colors">
            <div className="h-40 w-full rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 opacity-90" />
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">Research</span>
              <h3 className="text-lg font-semibold text-foreground">Chromatics & Dispersion</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Experimenting with simulated prism effects by offsetting color channels during SVG pixel displacements.
            </p>
          </div>
        </section>
      </div>

      {/* Floating Bottom Center Glassy Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          animate={dockControls}
          className="relative flex items-center bg-white/10 dark:bg-black/35 border border-white/20 dark:border-white/10 rounded-full p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)]"
          style={{
            backdropFilter:
              svgFilterSupport && dockFilter
                ? `blur(1.5px) url('${dockFilter}') blur(1px) brightness(1.05) saturate(1.15)`
                : "blur(16px)",
            transformOrigin: "center bottom",
          }}
        >
          {/* Navigation Items */}
          <div className="flex items-center ga">
            {dockItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeIndex;

              return (
                <motion.button
                  key={idx}
                  onPointerDown={() => handleTabClick(idx)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 450, damping: 16 }}
                  className={cn(
                    "group relative size-10 rounded-full flex items-center justify-center outline-none transition-all select-none cursor-pointer",
                    isActive
                      ? "bg-white/10 dark:bg-white/5 border border-black/10 dark:border-white/10 border-t-white/40 dark:border-t-white/20 border-b-black/20 dark:border-b-black/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.08)]"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                  aria-label={item.label}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        isActive ? "text-primary scale-110" : "group-hover:text-foreground"
                      )}
                    />
                  </motion.div>
                  {/* Subtle tooltip on hover */}
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
