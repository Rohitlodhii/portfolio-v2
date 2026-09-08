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
  leftMobile?: string
  topMobile?: string
  sizeClass: string
  rotation: number
  outline: boolean
}

const floatingIcons: FloatingIconItem[] = [
  { src: "/floatingimages/claude-icon.svg", alt: "Claude", left: "14.8%", top: "20.3%", leftMobile: "84.6%", topMobile: "38.7%", sizeClass: "w-8 h-8 sm:w-9 sm:h-9", rotation: -12, outline: true },
  { src: "/floatingimages/contri.png", alt: "Contri", left: "56.5%", top: "6.2%", leftMobile: "45%", topMobile: "5%", sizeClass: "w-[90px] h-[90px] sm:w-[110px] sm:h-[110px]", rotation: -4, outline: true },
  { src: "/floatingimages/codex-color.svg", alt: "Codex", left: "77.8%", top: "52.2%", leftMobile: "76%", topMobile: "48%", sizeClass: "w-7 h-7 sm:w-8 sm:h-8", rotation: 10, outline: true },
  { src: "/floatingimages/gemini-color.svg", alt: "Gemini", left: "66.7%", top: "44.3%", leftMobile: "64%", topMobile: "36%", sizeClass: "w-7 h-7 sm:w-[30px] sm:h-[30px]", rotation: -8, outline: false },
  { src: "/floatingimages/pf2.webp", alt: "PF2", left: "37.3%", top: "34.5%", leftMobile: "40.2%", topMobile: "37.1%", sizeClass: "w-16 h-16 sm:w-24 sm:h-24", rotation: 6, outline: true },
  { src: "/icons/fastdroid.png", alt: "Fastdroid", left: "82.2%", top: "29.2%", leftMobile: "78%", topMobile: "22%", sizeClass: "w-9 h-9 sm:w-10 sm:h-10", rotation: 8, outline: false },
  { src: "/icons/opengg.png", alt: "OpenGG", left: "16.2%", top: "69.4%", leftMobile: "8%", topMobile: "67%", sizeClass: "w-9 h-9 sm:w-10 sm:h-10", rotation: 12, outline: true },
  { src: "/floatingimages/setup.jpeg", alt: "Setup", left: "9.1%", top: "37.7%", leftMobile: "3%", topMobile: "40%", sizeClass: "w-[120px] h-[72px] sm:w-[118px] sm:h-[78px]", rotation: 5, outline: true },
  { src: "/floatingimages/bike.jpeg", alt: "Bike", left: "47.2%", top: "63.5%", leftMobile: "40.9%", topMobile: "58.1%", sizeClass: "w-[100px] h-[70px] sm:w-[112px] sm:h-[76px]", rotation: -7, outline: true },
  { src: "/floatingimages/mountains.jpeg", alt: "Mountains", left: "28.1%", top: "64.9%", leftMobile: "19.3%", topMobile: "64.3%", sizeClass: "w-[68px] h-[100px] sm:w-[76px] sm:h-[112px]", rotation: -3, outline: true },
  { src: "/floatingimages/claudeusage.jpeg", alt: "Claude Usage", left: "26.1%", top: "4.2%", leftMobile: "11.9%", topMobile: "13.0%", sizeClass: "w-[100px] h-[68px] sm:w-[124px] sm:h-[84px]", rotation: 4, outline: true },
]

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])
  return isMobile
}

interface BulbPoint {
  x: number
  y: number
}

function getWireData(width: number): { d: string; bulbs: BulbPoint[] } {
  const startX = -6
  const endX = width + 6
  const totalSpan = endX - startX
  const targetAvgWidth = 78
  const numWaves = Math.max(3, Math.round(totalSpan / targetAvgWidth))
  const baseWeights = [1.18, 0.84, 1.14, 0.90, 1.20, 0.82, 1.06, 0.94]
  const weights: number[] = []
  let totalWeight = 0
  for (let i = 0; i < numWaves; i++) {
    const w = baseWeights[i % baseWeights.length]
    weights.push(w)
    totalWeight += w
  }
  const waveWidths = weights.map((w) => (w / totalWeight) * totalSpan)
  const yPeak = -6
  const bulbs: BulbPoint[] = []
  let d = `M ${startX.toFixed(1)} ${yPeak}`
  let currentX = startX
  for (let i = 0; i < numWaves; i++) {
    const ww = waveWidths[i]
    const x0 = currentX
    const xMid = x0 + ww * 0.5
    const x1 = x0 + ww
    const ratio = ww / targetAvgWidth
    const yTrough = Math.round(15 + ratio * 4.5)
    const cx0 = x0 + ww * 0.22
    const cy0 = yPeak
    const cx1 = xMid - ww * 0.22
    const cy1 = yTrough
    const cx2 = xMid + ww * 0.22
    const cy2 = yTrough
    const cx3 = x1 - ww * 0.22
    const cy3 = yPeak
    d += ` C ${cx0.toFixed(1)} ${cy0.toFixed(1)}, ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${xMid.toFixed(1)} ${yTrough.toFixed(1)}`
    d += ` C ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${cx3.toFixed(1)} ${cy3.toFixed(1)}, ${x1.toFixed(1)} ${yPeak.toFixed(1)}`
    bulbs.push({ x: Number(xMid.toFixed(1)), y: Number(yTrough.toFixed(1)) })
    currentX = x1
  }
  return { d, bulbs }
}

const WorkTogether = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { trigger } = useHaptics()
  const [isOn, setIsOn] = useState(false)
  const [containerWidth, setContainerWidth] = useState(540)
  const isMobile = useIsMobile()

  const [setterEnabled, setSetterEnabled] = useState(false)
  const [setterMode, setSetterMode] = useState<"desktop" | "mobile">("desktop")
  const [panelIcons, setPanelIcons] = useState<FloatingIconItem[]>(floatingIcons)
  const [copied, setCopied] = useState(false)

  const iconsToRender = setterEnabled ? panelIcons : floatingIcons

  const handleDragEnd = (idx: number) => {
    if (!setterEnabled) return
    const container = containerRef.current
    const el = document.querySelector(`[data-icon-idx="${idx}"]`) as HTMLElement | null
    if (!container || !el) return
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    const newLeft = ((eRect.left - cRect.left) / cRect.width) * 100
    const newTop = ((eRect.top - cRect.top) / cRect.height) * 100
    const clampedLeft = Math.max(0, Math.min(92, newLeft))
    const clampedTop = Math.max(0, Math.min(88, newTop))
    setPanelIcons((prev) =>
      prev.map((it, i) =>
        i === idx
          ? setterMode === "mobile"
            ? { ...it, leftMobile: `${clampedLeft.toFixed(1)}%`, topMobile: `${clampedTop.toFixed(1)}%` }
            : { ...it, left: `${clampedLeft.toFixed(1)}%`, top: `${clampedTop.toFixed(1)}%` }
          : it,
      ),
    )
  }

  const copyPositions = async () => {
    const payload = panelIcons.map(({ src, alt, left, top, leftMobile, topMobile, sizeClass, rotation, outline }) => ({
      src,
      alt,
      left,
      top,
      leftMobile: leftMobile ?? left,
      topMobile: topMobile ?? top,
      sizeClass,
      rotation,
      outline,
    }))
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0) setContainerWidth(rect.width)
      }
    }
    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const { d: wirePath, bulbs } = useMemo(() => getWireData(containerWidth), [containerWidth])

  return (
    <div className="relative w-full my-10">
      <style>{`
        @keyframes fairyGlowBreathe {
          0%, 100% { opacity: 0.88; transform: scale(1); }
          50% { opacity: 0.58; transform: scale(0.93); }
        }
        .fairy-glow-pulse { animation: fairyGlowBreathe 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .fairy-glow-pulse { animation: none !important; } }
      `}</style>

      <div
        ref={containerRef}
        className="h-96 w-full flex flex-col items-center justify-center bg-secondary rounded-2xl relative overflow-hidden select-none"
        style={{ cursor: "url('/floatingicon/cursor.svg') 0 0, url('/floatingimages/cursor.svg') 0 0, auto" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(212 212 212 / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(212 212 212 / 0.35) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-700 ease-out z-[2] ${isOn ? "opacity-100" : "opacity-0"}`}
        >
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(100% 80% at 50% 0%, rgba(245, 158, 11, 0.28) 0%, rgba(234, 88, 12, 0.15) 35%, rgba(180, 83, 9, 0.05) 65%, transparent 90%)",
            }}
          />
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(to bottom, rgba(251, 191, 36, 0.20) 0%, rgba(245, 158, 11, 0.12) 25%, rgba(234, 88, 12, 0.04) 55%, transparent 85%)",
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-28"
            style={{
              background:
                "linear-gradient(to bottom, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.08) 60%, transparent 100%)",
            }}
          />
        </div>

        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0.12}
          dragMomentum={false}
          whileDrag={{ scale: 1.08 }}
          className="absolute touch-none z-40 select-none right-4 bottom-4 sm:right-10 sm:bottom-10"
          style={{ cursor: "url('/floatingicon/cursor.svg') 0 0, url('/floatingimages/cursor.svg') 0 0, auto" }}
        >
          <div className="absolute right-[calc(100%+6px)] bottom-10 sm:bottom-8 pointer-events-none select-none flex flex-col items-end z-50">
            <span className={`${patrickHand.className} text-xs sm:text-base text-neutral-600 dark:text-neutral-300 -rotate-6 whitespace-nowrap drop-shadow-sm`}>
              click on this
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/floatingimages/arrow.svg"
              alt="Arrow pointing to bulb"
              draggable={false}
              className="w-8 h-6 sm:w-11 sm:h-8.5 -rotate-12 mr-0.5 sm:mr-1 -mt-1 dark:invert opacity-80 pointer-events-none select-none"
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
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-md backdrop-blur-md cursor-pointer ${
              isOn
                ? "bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-md"
                : "bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 shadow-sm"
            }`}
            style={{ rotate: "6deg" }}
          >
            {isOn ? (
              <IconBulb className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900 dark:text-neutral-100" />
            ) : (
              <IconBulbOff className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </motion.div>
        </motion.div>

        {iconsToRender.map((item, idx) => {
          const left = isMobile && item.leftMobile ? item.leftMobile : item.left
          const top = isMobile && item.topMobile ? item.topMobile : item.top
          return (
            <motion.div
              key={item.src}
              data-icon-idx={idx}
              drag={setterEnabled}
              dragConstraints={containerRef}
              dragElastic={0.12}
              dragMomentum={false}
              whileDrag={{ scale: 1.12 }}
              onDragEnd={() => handleDragEnd(idx)}
              className={`absolute touch-none z-20 ${setterEnabled ? "cursor-grab active:cursor-grabbing" : ""}`}
              style={{
                left,
                top,
                cursor: setterEnabled ? undefined : "url('/floatingicon/cursor.svg') 0 0, url('/floatingimages/cursor.svg') 0 0, auto",
              }}
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
          )
        })}
      </div>

      {/* Adjust positions — commented for now
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSetterEnabled((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-full border bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {setterEnabled ? "Done" : "Adjust positions"}
        </button>
        {setterEnabled && (
          <>
            <div className="flex rounded-full border bg-secondary p-0.5">
              <button
                type="button"
                onClick={() => setSetterMode("desktop")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${setterMode === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setSetterMode("mobile")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${setterMode === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Mobile
              </button>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">Drag icons → copy</span>
            <button
              type="button"
              onClick={copyPositions}
              className="ml-auto text-xs px-2.5 py-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              {copied ? "Copied!" : `Copy ${setterMode}`}
            </button>
          </>
        )}
      </div>

      {setterEnabled && (
        <div className="mt-3 rounded-xl border bg-background p-3 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Editing {setterMode} positions {isMobile ? "(you are on mobile viewport)" : "(desktop viewport)"} — drag icons inside the card
          </p>
          <pre className="text-[11px] leading-3 bg-secondary rounded-md p-2 overflow-auto max-h-48 whitespace-pre-wrap break-all">
            {JSON.stringify(
              panelIcons.map((it) => ({
                src: it.src,
                left: it.left,
                top: it.top,
                leftMobile: it.leftMobile,
                topMobile: it.topMobile,
              })),
              null,
              2,
            )}
          </pre>
        </div>
      )}
      */}
    </div>
  )
}

export default WorkTogether
