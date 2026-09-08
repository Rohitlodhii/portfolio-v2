"use client"

import { motion } from "motion/react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { IconBulb, IconBulbOff } from "@tabler/icons-react"
import { Patrick_Hand } from "next/font/google"
import { useHaptics } from "@/lib/use-haptics"

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
})

interface FloatingIconItem {
  src: string
  alt: string
  left: string
  top: string
  sizeClass: string
  rotation: number
  outline: boolean
}

const floatingIcons: FloatingIconItem[] = [
  { src: "/floatingimages/claude-icon.svg", alt: "Claude", left: "14.8%", top: "20.3%", sizeClass: "w-7 h-7 sm:w-9 sm:h-9", rotation: -12, outline: true },
  { src: "/floatingimages/contri.png", alt: "Contri", left: "56.5%", top: "6.2%", sizeClass: "w-[72px] h-[72px] sm:w-[110px] sm:h-[110px]", rotation: -4, outline: true },
  { src: "/floatingimages/codex-color.svg", alt: "Codex", left: "77.8%", top: "52.2%", sizeClass: "w-[26px] h-[26px] sm:w-8 sm:h-8", rotation: 10, outline: true },
  { src: "/floatingimages/gemini-color.svg", alt: "Gemini", left: "66.7%", top: "44.3%", sizeClass: "w-6 h-6 sm:w-[30px] sm:h-[30px]", rotation: -8, outline: false },
  { src: "/floatingimages/pf2.webp", alt: "PF2", left: "37.3%", top: "34.5%", sizeClass: "w-14 h-14 sm:w-24 sm:h-24", rotation: 6, outline: true },
  { src: "/icons/fastdroid.png", alt: "Fastdroid", left: "82.2%", top: "29.2%", sizeClass: "w-8 h-8 sm:w-10 sm:h-10", rotation: 8, outline: false },
  { src: "/icons/opengg.png", alt: "OpenGG", left: "16.2%", top: "69.4%", sizeClass: "w-8 h-8 sm:w-10 sm:h-10", rotation: 12, outline: true },
  { src: "/floatingimages/setup.jpeg", alt: "Setup", left: "9.1%", top: "37.7%", sizeClass: "w-[140px] h-[80px] sm:w-[118px] sm:h-[78px]", rotation: 5, outline: true },
  { src: "/floatingimages/bike.jpeg", alt: "Bike", left: "47.2%", top: "63.5%", sizeClass: "w-[80px] h-[56px] sm:w-[112px] sm:h-[76px]", rotation: -7, outline: true },
  { src: "/floatingimages/mountains.jpeg", alt: "Mountains", left: "28.1%", top: "64.9%", sizeClass: "w-[56px] h-[84px] sm:w-[76px] sm:h-[112px]", rotation: -3, outline: true },
  { src: "/floatingimages/claudeusage.jpeg", alt: "Claude Usage", left: "26.1%", top: "4.2%", sizeClass: "w-[88px] h-[60px] sm:w-[124px] sm:h-[84px]", rotation: 4, outline: true },
]

interface BulbPoint {
  x: number
  y: number
}

// Generate hanging fairy light wire with uneven curve sizes spanning the full container width
function getWireData(width: number): { d: string; bulbs: BulbPoint[] } {
  // Spans edge-to-edge past container boundaries to increase overall width across the full div
  const startX = -6
  const endX = width + 6
  const totalSpan = endX - startX

  const targetAvgWidth = 78
  const numWaves = Math.max(3, Math.round(totalSpan / targetAvgWidth))

  // Organic uneven proportions for each curve
  const baseWeights = [1.18, 0.84, 1.14, 0.90, 1.20, 0.82, 1.06, 0.94]
  const weights: number[] = []
  let totalWeight = 0
  for (let i = 0; i < numWaves; i++) {
    const w = baseWeights[i % baseWeights.length]
    weights.push(w)
    totalWeight += w
  }

  // Exact pixel widths summing precisely to totalSpan
  const waveWidths = weights.map((w) => (w / totalWeight) * totalSpan)

  // Arches smoothly up above the top border into overflow-hidden, intersecting the top border cleanly
  const yPeak = -6
  const bulbs: BulbPoint[] = []
  let d = `M ${startX.toFixed(1)} ${yPeak}`

  let currentX = startX
  for (let i = 0; i < numWaves; i++) {
    const ww = waveWidths[i]
    const x0 = currentX
    const xMid = x0 + ww * 0.5
    const x1 = x0 + ww

    // Organic sag depth naturally proportional to curve width (16px to 21px, gentle and less swiggly)
    const ratio = ww / targetAvgWidth
    const yTrough = Math.round(15 + ratio * 4.5)

    // Descent from (x0, yPeak) down to (xMid, yTrough) with horizontal tangents for silky curvature
    const cx0 = x0 + ww * 0.22
    const cy0 = yPeak
    const cx1 = xMid - ww * 0.22
    const cy1 = yTrough

    // Ascent from (xMid, yTrough) up to (x1, yPeak) with horizontal tangents
    const cx2 = xMid + ww * 0.22
    const cy2 = yTrough
    const cx3 = x1 - ww * 0.22
    const cy3 = yPeak

    d += ` C ${cx0.toFixed(1)} ${cy0.toFixed(1)}, ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${xMid.toFixed(1)} ${yTrough.toFixed(1)}`
    d += ` C ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${cx3.toFixed(1)} ${cy3.toFixed(1)}, ${x1.toFixed(1)} ${yPeak.toFixed(1)}`

    // Place bulb directly on the descent at the center of each wave sag
    bulbs.push({
      x: Number(xMid.toFixed(1)),
      y: Number(yTrough.toFixed(1)),
    })

    currentX = x1
  }

  return { d, bulbs }
}

/* TEMP POSITION SETTER — uncomment to re-edit positions
const initialIcons: FloatingIconItem[] = floatingIcons

  // panel state + handlers for position tool
  // const [panelIcons, setPanelIcons] = useState<FloatingIconItem[]>(initialIcons)
  // const [copied, setCopied] = useState(false)
  // const handleDragEnd = (idx: number) => { ... }
  // const copyPositions = async () => { ... }
*/

const WorkTogether = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { trigger } = useHaptics()
  const [isOn, setIsOn] = useState(false)
  const [containerWidth, setContainerWidth] = useState(540)
  // const [panelIcons, setPanelIcons] = useState<FloatingIconItem[]>(floatingIcons)
  // const [copied, setCopied] = useState(false)
  // const handleDragEnd = (idx: number) => { const container = containerRef.current; const el = document.querySelector(`[data-icon-idx="${idx}"]`) as HTMLElement | null; if (!container || !el) return; const cRect = container.getBoundingClientRect(); const eRect = el.getBoundingClientRect(); const newLeft = ((eRect.left - cRect.left) / cRect.width) * 100; const newTop = ((eRect.top - cRect.top) / cRect.height) * 100; const clampedLeft = Math.max(0, Math.min(92, newLeft)); const clampedTop = Math.max(0, Math.min(88, newTop)); setPanelIcons((prev) => prev.map((it, i) => (i === idx ? { ...it, left: `${clampedLeft.toFixed(1)}%`, top: `${clampedTop.toFixed(1)}%` } : it))); }
  // const copyPositions = async () => { const payload = panelIcons.map(({ src, alt, left, top, sizeClass, rotation, outline }) => ({ src, alt, left, top, sizeClass, rotation, outline })); await navigator.clipboard.writeText(JSON.stringify(payload, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  // Track container width for responsive path and bulb generation
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0) {
          setContainerWidth(rect.width)
        }
      }
    }

    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Calculate wire path and bulb points in sync with container width
  const { d: wirePath, bulbs } = useMemo(
    () => getWireData(containerWidth),
    [containerWidth]
  )

  return (
    <div className="relative w-full my-10">
      <style>{`
        @keyframes fairyGlowBreathe {
          0%, 100% {
            opacity: 0.88;
            transform: scale(1);
          }
          50% {
            opacity: 0.58;
            transform: scale(0.93);
          }
        }
        .fairy-glow-pulse {
          animation: fairyGlowBreathe 3.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .fairy-glow-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <div
        ref={containerRef}
        className="h-96 w-full flex flex-col items-center justify-center bg-secondary rounded-2xl relative overflow-hidden select-none"
        style={{ cursor: "url('/floatingicon/cursor.svg') 0 0, url('/floatingimages/cursor.svg') 0 0, auto" }}
      >
        {/* Subtle background grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(212 212 212 / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(212 212 212 / 0.35) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Warm color ambient glow emitting from the top fairy lights downward across the whole div */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-700 ease-out z-[2] ${
            isOn ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Main top-to-bottom warm radiance */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(100% 80% at 50% 0%, rgba(245, 158, 11, 0.28) 0%, rgba(234, 88, 12, 0.15) 35%, rgba(180, 83, 9, 0.05) 65%, transparent 90%)",
            }}
          />

          {/* Directional downward light sweep */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(to bottom, rgba(251, 191, 36, 0.20) 0%, rgba(245, 158, 11, 0.12) 25%, rgba(234, 88, 12, 0.04) 55%, transparent 85%)",
            }}
          />

          {/* Ambient illumination along top border under the wire */}
          <div
            className="absolute inset-x-0 top-0 h-28"
            style={{
              background:
                "linear-gradient(to bottom, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.08) 60%, transparent 100%)",
            }}
          />
        </div>

        {/* Fairy light wire + bulbs — commented for now, bulb still toggles warm glow
        <svg
          className="absolute top-0 left-0 w-full h-32 pointer-events-none z-30 overflow-visible"
          viewBox={`0 0 ${containerWidth} 128`}
          fill="none"
          aria-hidden="true"
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter id="softGlowBlur" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <filter id="coreGlowBlur" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <radialGradient id="bulbRadialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="28%" stopColor="#f59e0b" stopOpacity="0.70" />
              <stop offset="58%" stopColor="#f97316" stopOpacity="0.30" />
              <stop offset="82%" stopColor="#ea580c" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d={wirePath}
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-600 dark:text-neutral-400"
          />
          {bulbs.map((pt, i) => (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={18} fill="url(#bulbRadialGlow)" filter="url(#softGlowBlur)" className={`transition-opacity duration-500 pointer-events-none ${isOn ? "opacity-90 fairy-glow-pulse" : "opacity-0"}`} style={{ animationDelay: `${(i % 5) * 0.5}s`, transformOrigin: `${pt.x}px ${pt.y}px` }} />
              <circle cx={pt.x} cy={pt.y} r={9} fill="#f59e0b" filter="url(#coreGlowBlur)" className={`transition-opacity duration-300 pointer-events-none ${isOn ? "opacity-75" : "opacity-0"}`} />
              <circle cx={pt.x} cy={pt.y} r={2.5} fill="currentColor" className="pointer-events-none text-neutral-600 dark:text-neutral-400" />
              <circle cx={pt.x} cy={pt.y} r={isOn ? 2.4 : 2.0} fill={isOn ? "#f59e0b" : "currentColor"} opacity={isOn ? 1 : 0.8} className="transition-all duration-300 pointer-events-none text-neutral-600 dark:text-neutral-400" />
              <circle cx={pt.x} cy={pt.y} r={1.3} fill="#fbbf24" className={`transition-opacity duration-300 pointer-events-none ${isOn ? "opacity-100" : "opacity-0"}`} />
            </g>
          ))}
        </svg>
        */}

        {/* Floating draggable bulb switch icon & annotation */}
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0.12}
          dragMomentum={false}
          whileDrag={{ scale: 1.08 }}
          className="absolute touch-none z-30 select-none right-3.5 bottom-3.5 sm:right-10 sm:bottom-10"
          style={{ cursor: "url('/floatingicon/cursor.svg') 0 0, url('/floatingimages/cursor.svg') 0 0, auto" }}
        >
          {/* Floating "click on this" annotation with hand-drawn arrow pointing to bulb switch */}
          <div className="absolute right-[calc(100%+0px)] sm:right-[calc(100%+0px)] bottom-12 sm:bottom-8 pointer-events-none select-none flex flex-col items-end">
            <span
              className={`${patrickHand.className} text-xs sm:text-base text-neutral-600 dark:text-neutral-300 -rotate-6 whitespace-nowrap`}
            >
              click on this
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/floatingimages/arrow.svg"
              alt="Arrow pointing to bulb"
              draggable={false}
              className="w-8 h-6 sm:w-11 -rotate-12 sm:h-8.5 mr-0.5 sm:mr-1 -mt-1 dark:invert opacity-80 pointer-events-none select-none "
            />
          </div>

          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onTap={() => {
              trigger("selection")
              setIsOn((prev) => !prev)
            }}
            role="switch"
            aria-checked={isOn}
            aria-label={isOn ? "Turn fairy lights off" : "Turn fairy lights on"}
            title={isOn ? "Click to turn fairy lights off" : "Click to turn fairy lights on"}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-md backdrop-blur-md cursor-pointer ${
              isOn
                ? "bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-md"
                : "bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 shadow-sm"
            }`}
            style={{ rotate: "6deg" }}
          >
            {isOn ? (
              <IconBulb className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900 dark:text-neutral-100" />
            ) : (
              <IconBulbOff className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400 dark:text-neutral-500" />
            )}
          </motion.div>
        </motion.div>

        {/* Floating draggable icons — all with button-style dashed border */}
        {floatingIcons.map((item) => (
          <motion.div
            key={item.src}
            drag
            dragConstraints={containerRef}
            dragElastic={0.12}
            dragMomentum={false}
            whileDrag={{ scale: 1.12 }}
            className="absolute touch-none z-20"
            style={{ left: item.left, top: item.top, cursor: "url('/floatingicon/cursor.svg') 0 0, url('/floatingimages/cursor.svg') 0 0, auto" }}
          >
            <div
              className={`${item.sizeClass} bg-neutral-800 dark:bg-neutral-200 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl`}
              style={{ rotate: `${item.rotation}deg` }}
            >
              <div className="w-full h-full bg-neutral-800 dark:bg-neutral-200 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  draggable={false}
                  className="w-full h-full object-cover rounded-md sm:rounded-lg pointer-events-none select-none"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* TEMP POSITION SETTER — uncomment when needed
      <div className="mt-3 rounded-xl border bg-background p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-medium text-muted-foreground">Position tool — drag icons, then copy</p>
          <button onClick={copyPositions} className="text-xs px-2.5 py-1 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90">
            {copied ? "Copied!" : "Copy positions"}
          </button>
        </div>
        <pre className="text-[11px] leading-3 bg-secondary rounded-md p-2 overflow-auto max-h-48 whitespace-pre-wrap break-all">
          {JSON.stringify(panelIcons.map(({ src, left, top }) => ({ src: src.split("/").pop(), left, top })), null, 2)}
        </pre>
        <p className="text-[10px] text-muted-foreground mt-1">Paste back to hardcode left/top.</p>
      </div>
      */}
    </div>
  )
}

export default WorkTogether
