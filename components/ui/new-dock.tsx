"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { IconHome, IconBook, IconChevronUp, Icon3dCubeSphere, IconSun, IconDotsVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/lib/use-haptics";


interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  /** Blog posts live under /blogs/[blogid], so this can't be plain equality. */
  match: (pathname: string) => boolean;
}

const navItems: NavItem[] = [
  { icon: IconHome, label: "Home", href: "/", match: (path) => path === "/" },
  {
    icon: IconBook,
    label: "Blogs",
    href: "/blogs",
    match: (path) => path.startsWith("/blogs"),
  },
];

// Drawn in a 20x20 viewBox, so r=8 with a 2.5 stroke sits fully inside it.
const RING_RADIUS = 8;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * How far the current route has been scrolled, 0 to 1.
 *
 * Keyed on `pathname` so every route measures its own document: a client-side
 * navigation replaces the content without firing `resize`, so the effect has to
 * re-run to pick up the new page's height and the reset scroll position.
 *
 * Returns a MotionValue rather than state on purpose — this updates on every
 * scroll frame, and re-rendering the dock (and its motion components) that often
 * is a real cost on mobile for a value only one SVG attribute reads.
 */
function useScrollProgress() {
  const pathname = usePathname();
  const progress = useMotionValue(0);




  useEffect(() => {
    const measure = () => {
      // `documentElement` is the scrolling element here — html/body set no overflow.
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      // Nothing to scroll on a page shorter than the viewport, so don't divide by it.
      const value = distance <= 0 ? 0 : window.scrollY / distance;
      progress.set(Math.min(1, Math.max(0, value)));
    };

    measure();

    // The observer catches content that lands after mount (images, dynamic data).
    // It can't be authoritative — `app/page.tsx` pins its wrapper to `h-screen` and
    // overflows it, so body's own box stops growing — but every scroll event
    // remeasures, and at scroll 0 the progress is 0 whatever the height is.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    observer.observe(document.documentElement);

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [pathname, progress]);

  return progress;
}

export function NewDock() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollProgress = useScrollProgress();
  
  const { trigger, isEnabled: hapticsEnabled, setEnabled: setHapticsEnabled } = useHaptics();

  const toggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    // Confirm the switch by feel, but only when turning on — off should be silent.
    if (next) trigger("selection");
  };


    
  // Dash pattern of C draws the whole circle at offset 0 and none of it at offset C.
  const ringOffset = useTransform(scrollProgress, (value) => RING_LENGTH * (1 - value));

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        animate={{
          width: isExpanded ? 256 : 172,
          height: isExpanded ? 176 : 48,
          borderRadius: isExpanded ? 28 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 26,
        }}
        className="relative flex flex-col justify-end bg-white/10 dark:bg-black/35 backdrop-blur-xl border border-white/20 dark:border-white/10 p-1 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_rgba(255,255,255,0.6),0_12px_40px_rgba(0,0,0,0.12)] select-none overflow-hidden"
        style={{ transformOrigin: "center bottom" }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 w-full flex flex-col justify-center items-center gap-3 px-1 pb-2 pt-1"
            >
              <div className="w-full h-full bg-border rounded-2xl flex gap-1 p-1">
                <div className="flex flex-col w-full gap-1">
                  <div className="w-full h-full  backdrop-blur-lg rounded-xl">
                    <div className="flex items-center justify-between p-2">
                        <h2 className="text-sm text-muted-foreground ">Web Haptics</h2>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={hapticsEnabled}
                          aria-label="Web haptics"
                          onClick={toggleHaptics}
                          className="bg-background/60 w-16 rounded-lg h-6 p-0.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60"
                        >
                            {/* x is a % of the thumb's own width, and the thumb is
                                half the track, so 100% lands it flush on the right. */}
                            <motion.div
                              animate={{ x: hapticsEnabled ? "100%" : "0%" }}
                              transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.6 }}
                              className={cn(
                                "h-full w-1/2 rounded-md transition-colors duration-200",
                                hapticsEnabled ? "bg-blue-300" : "bg-foreground/20"
                              )}
                            />
                        </button>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom controls row (remains at original place, centered with mx-auto) */}
        <div className="flex items-center gap-1 w-[164px] mx-auto h-10 shrink-0">
          <div className="flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const isActive = item.match(pathname);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className="group relative select-none outline-none touch-manipulation"
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 450, damping: 16 }}
                    className={cn(
                      "relative size-10 rounded-full flex items-center justify-center transition-all cursor-pointer select-none",
                      isActive
                        ? "bg-white/10 dark:bg-white/5 border border-black/10 dark:border-white/10 border-t-white/40 dark:border-t-white/20 border-b-black/20 dark:border-b-black/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.08)] text-orange-200"
                        : "text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    <motion.div
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 12 }}
                    >
                      <Icon
                        className={cn(
                          "size-5",
                          isActive ? "text-blue-300 scale-110" : "group-hover:text-foreground"
                        )}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Subtle tooltip on hover */}
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="h-10 flex items-center justify-center w-[76px] gap-1 bg-border/70 backdrop-blur-lg rounded-full p-1 shrink-0">
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label="Toggle settings panel"
              className="h-full flex items-center justify-center bg-background/90 hover:bg-background dark:bg-background/60 dark:hover:bg-background/80 backdrop-blur-2xl aspect-square rounded-full w-8 cursor-pointer outline-none transition-colors border border-black/5 dark:border-white/5 shadow-sm"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center"
                onClick={() => trigger([
                    { duration: 30 },
                    { delay: 60, duration: 40, intensity: 1 },
                  ])
                  }
              >
              
                <IconChevronUp className="size-4 text-muted-foreground" />
              </motion.div>
            </button>
            {/* Scroll progress for the current route. Not a control, so it's a div
                rather than a button — and aria-hidden, because the scroll position is
                already exposed to assistive tech natively and a ring driven by a
                MotionValue can't keep an aria-valuenow in sync without re-rendering. */}
            <div
              aria-hidden="true"
              className="h-full flex items-center justify-center bg-background/90 dark:bg-background/60 backdrop-blur-2xl aspect-square rounded-full w-8 border border-black/5 dark:border-white/5 shadow-sm"
            >
              {/* -rotate-90 starts the arc at 12 o'clock instead of 3. */}
              <svg viewBox="0 0 20 20" className="size-5 -rotate-90">
                {/* The disc body. Faint blue so the well reads as filled at 0%. */}
                <circle cx="10" cy="10" r={RING_RADIUS} className="fill-blue-300/15" />
                <circle
                  cx="10"
                  cy="10"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="2.5"
                  className="stroke-foreground/15"
                />
                <motion.circle
                  cx="10"
                  cy="10"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="stroke-blue-300"
                  style={{ strokeDasharray: RING_LENGTH, strokeDashoffset: ringOffset }}
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
