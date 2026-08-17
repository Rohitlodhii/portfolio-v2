"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";

export interface DockItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

export interface DockProps {
  items: DockItem[];
  activeIndex?: number;
  defaultActiveIndex?: number;
  onSelect?: (index: number) => void;
  strength?: number;
  depth?: number;
  chromaticAberration?: number;
  className?: string;
  /** Whether to fix the dock at the bottom center of the viewport */
  fixed?: boolean;
}

// Helper: SVG Displacement Map data URI
function getDisplacementMap(height: number, width: number, radius: number, depth: number) {
  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>.mix { mix-blend-mode: screen; }</style>
      <defs>
          <linearGradient id="Y" x1="0" x2="0" y1="${Math.ceil((radius / height) * 15)}%" y2="${Math.floor(100 - (radius / height) * 15)}%">
              <stop offset="0%" stop-color="#0F0" />
              <stop offset="100%" stop-color="#000" />
          </linearGradient>
          <linearGradient id="X" x1="${Math.ceil((radius / width) * 15)}%" x2="${Math.floor(100 - (radius / width) * 15)}%" y1="0" y2="0">
              <stop offset="0%" stop-color="#F00" />
              <stop offset="100%" stop-color="#000" />
          </linearGradient>
      </defs>
      <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
      <g filter="blur(2px)">
        <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
        <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" className="mix" />
        <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" className="mix" />
        <rect x="${depth}" y="${depth}" height="${height - 2 * depth}" width="${width - 2 * depth}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${depth}px)" />
      </g>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// Helper: SVG Displacement Filter data URI
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
              <feDisplacementMap transform-origin="center" in="SourceGraphic" in2="displacementMap" scale="${strength + chromaticAberration * 2}" xChannelSelector="R" yChannelSelector="G" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedR" />
              <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${strength + chromaticAberration}" xChannelSelector="R" yChannelSelector="G" />
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedG" />
              <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${strength}" xChannelSelector="R" yChannelSelector="G" />
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="displacedB" />
              <feBlend in="displacedR" in2="displacedG" mode="screen"/>
              <feBlend in2="displacedB" mode="screen"/>
          </filter>
      </defs>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#displace";
}

export function NewDock({
  items,
  activeIndex: controlledActiveIndex,
  defaultActiveIndex = 0,
  onSelect,
  strength = 75,
  depth = 8,
  chromaticAberration = 3,
  className,
  fixed = true,
}: DockProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState(defaultActiveIndex);
  const [svgFilterSupport, setSvgFilterSupport] = useState(false);
  const [dockFilter, setDockFilter] = useState<string | null>(null);

  const dockControls = useAnimation();
  const activeIndex = controlledActiveIndex ?? internalActiveIndex;

  // Detect SVG Filter support in backdrop-filter
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = /chrome|chromium|crios|edg/.test(userAgent) && !/firefox|fxios/.test(userAgent);
    setSvgFilterSupport(isChrome);
  }, []);

  // Dynamically calculate dock width based on item count
  const estimatedWidth = Math.max(items.length * 48 + 16, 120);
  const dockHeight = 56;
  const dockRadius = 28;

  // Regenerate displacement filter when params or item count change
  useEffect(() => {
    const filter = getDisplacementFilter(
      dockHeight,
      estimatedWidth,
      dockRadius,
      depth,
      strength,
      chromaticAberration
    );
    setDockFilter(filter);
  }, [estimatedWidth, depth, strength, chromaticAberration]);

  const handleTabClick = (idx: number, item: DockItem) => {
    if (controlledActiveIndex === undefined) {
      setInternalActiveIndex(idx);
    }
    onSelect?.(idx);
    item.onClick?.();

    // Springy press effect on entire dock
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

  const containerClass = fixed
    ? "fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    : "relative z-50";

  return (
    <div className={cn(containerClass, className)}>
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
        <div className="flex items-center gap-1">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIndex;

            return (
              <motion.button
                key={idx}
                onPointerDown={() => handleTabClick(idx, item)}
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

                <div className="bg-secondary h-full w-10">
                        hey
                </div>

                {/* Tooltip */}
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm whitespace-nowrap">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}