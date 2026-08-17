"use client"

import React, { Fragment, useState } from 'react'
import Image from 'next/image'
import { Popover } from '@base-ui/react/popover'
import { motion, useReducedMotion } from 'motion/react'
import { IconArrowUpRight, IconTrophy } from '@tabler/icons-react'
import { hackathon as hackathonsData } from '@/config/data/hackathons'
import { Seprator } from '@/components/base/Projects'
import { cn } from '@/lib/utils'

// Emil Kowalski style spring/overshoot easing for popovers
const POP_EASE = 'ease-[cubic-bezier(0.34,1.56,0.64,1)]'
const EASE_OUT = 'ease-[cubic-bezier(0.23,1,0.32,1)]'

// One highlight element is shared across every row via this layoutId, so Motion
// slides it between rows instead of cross-fading two separate backgrounds.
const HOVER_LAYOUT_ID = 'hackathon-hover'

interface HackathonType {
  title: string
  subtitle: string
  date: string
  languages: string[]
  main: string
  listitems?: string[]
  link?: string
  src?: string
}

interface HackathonRowProps {
  hackathon: HackathonType
  isHovered: boolean
  anyHovered: boolean
  onHover: () => void
  reduceMotion: boolean
}

/**
 * Built on Base UI's primitives rather than `components/ui/popover.tsx`: that
 * wrapper animates with `tw-animate-css` keyframes at 100ms, and keyframes restart
 * from zero instead of retargeting when a row is clicked twice in quick succession.
 * Transitions off `data-starting-style` / `data-ending-style` interrupt cleanly.
 */
const HackathonRow = ({ hackathon, isHovered, anyHovered, onHover, reduceMotion }: HackathonRowProps) => {
  const [imgError, setImgError] = useState(false)

  // Touch taps synthesise a mouse enter, which would leave the highlight stranded
  // on whichever row was last tapped.
  const handlePointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    onHover()
  }

  return (
    <Popover.Root>
      <div
        onPointerEnter={handlePointerEnter}
        className="group relative flex items-center gap-2 px-1 py-1"
      >
        {isHovered && (
          <motion.span
            layoutId={HOVER_LAYOUT_ID}
            className="absolute inset-0 bg-secondary bg-gradient-to-b from-white/30 dark:from-white/12 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] rounded-xl -z-10"
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }
            }
          />
        )}

        <Popover.Trigger
          className={cn(
            'relative flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-lg text-left outline-none touch-manipulation z-10 min-w-0',
            'focus-visible:ring-2 focus-visible:ring-ring/50'
          )}
        >
          <span className="flex items-center gap-4 min-w-0">
            <div className={cn(
              "size-[25px] rounded-lg bg-primary flex items-center justify-center overflow-hidden shrink-0 transition duration-200 p-0.5",
              anyHovered && !isHovered ? 'grayscale' : 'grayscale-0'
            )}>
              {hackathon.src && !imgError ? (
                <Image
                  src={
                    hackathon.src.startsWith('/hackathons')
                      ? hackathon.src
                      : `/hackathons${hackathon.src}`
                  }
                  height={21}
                  width={21}
                  alt=""
                  onError={() => setImgError(true)}
                  className={cn(
                    "aspect-square object-contain",
                    hackathon.title.toLowerCase().includes("bolt") && "invert dark:invert-0"
                  )}
                />
              ) : (
                <IconTrophy className="size-3.5 text-primary-foreground" />
              )}
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors duration-200 line-clamp-1 sm:line-clamp-none",
              anyHovered && !isHovered ? 'text-muted-foreground' : 'text-primary'
            )}>
              {hackathon.title}
            </span>
          </span>
          <span className="text-sm text-muted-foreground">{hackathon.date}</span>
        </Popover.Trigger>

        <div className="text-sm text-muted-foreground flex items-center gap-2 relative z-10">
          {hackathon.link ? (
            <a
              href={hackathon.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${hackathon.title}`}
              className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-lg transition ease-in"
            >
              <IconArrowUpRight className="size-5 font-medium transition group-hover:text-black dark:group-hover:text-white ease-in group-hover:rotate-45" />
            </a>
          ) : (
            <div className="p-1 opacity-20 cursor-default select-none">
              <IconArrowUpRight className="size-5 font-medium" />
            </div>
          )}
        </div>
      </div>

      <Popover.Portal>
        {/* The focus overlay. Portaled to body, so `fixed inset-0` is measured
            against the viewport and can't be clipped by an ancestor — and z-[80]
            puts it over the dock and TopScrollBlur (both z-50) but under the popover,
            so the entire page recedes rather than just the strip behind the row. */}
        <Popover.Backdrop
          className={cn(
            'fixed inset-0 z-[80] bg-primary/10',
            // Opacity only, on the panel's timing, so the two read as one surface.
            'transition-opacity duration-200',
            EASE_OUT,
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0'
          )}
        />
        <Popover.Positioner
          side="top"
          align="center"
          sideOffset={10}
          collisionPadding={16}
          className="isolate z-[100]"
        >
          <Popover.Popup
            className={cn(
              'flex flex-col gap-2.5 rounded-2xl border border-black/10 p-3 shadow-lg outline-none lg:p-4 dark:border-white/10 z-[100]',
              // 36rem is the max-w-xl token, so on desktop the panel lines up with
              // the page's content column. --available-width keeps it off the edges.
              'w-[min(20rem,var(--available-width))] lg:w-[min(36rem,var(--available-width))]',
              // Solid background to prevent backdrop bleed and maintain contrast.
              'bg-card dark:bg-secondary',
              // Scales out of the row that was clicked — Base UI resolves
              // --transform-origin to the trigger's anchor point.
              'origin-(--transform-origin)',
              // Tailwind v4 compiles `scale-*` to the standalone `scale` property,
              // which `transition-property: transform` does not cover.
              'transition-[opacity,scale] duration-300',
              POP_EASE,
              'data-[starting-style]:scale-75 data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-75 data-[ending-style]:opacity-0',
              // Base UI flags re-opens and dismissals that shouldn't replay the motion.
              'data-[instant]:duration-0',
              // Reduced motion keeps the crossfade and drops the movement.
              'motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <Popover.Title className="text-sm font-medium text-secondary-foreground">
                  {hackathon.title}
                </Popover.Title>
                <p className="text-xs text-muted-foreground">
                  {hackathon.subtitle}
                </p>
              </div>
            </div>

            <Popover.Description className="text-xs leading-relaxed text-muted-foreground flex flex-col gap-1.5">
              <p>{hackathon.main}</p>
              {hackathon.listitems && (
                <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px]">
                  {hackathon.listitems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </Popover.Description>

            {hackathon.languages && (
              <div className="flex flex-wrap gap-1">
                {hackathon.languages.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {hackathon.link && (
              <a
                href={hackathon.link}
                target="_blank"
                rel="noreferrer"
                className="group/link flex items-center justify-between gap-2 rounded-lg px-1 py-1 text-xs font-medium text-secondary-foreground transition-colors duration-150 ease-out hover:bg-foreground/5"
              >
                <span>View Project Source</span>
                <IconArrowUpRight className="size-4 transition-transform duration-150 ease-out group-hover/link:rotate-45 motion-reduce:transition-none motion-reduce:group-hover/link:rotate-0" />
              </a>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

const Hackathon = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section className="pt-14">
      <div className="text-sm font-medium text-muted-foreground">Hackathons</div>
      <Seprator />
      {/* Clearing on the list rather than per row means crossing a separator
          doesn't blink the highlight out and back. */}
      <div className="flex flex-col" onPointerLeave={() => setHoveredId(null)}>
        {hackathonsData.map((item) => (
          <Fragment key={item.title}>
            <HackathonRow
              hackathon={item}
              isHovered={hoveredId === item.title}
              anyHovered={hoveredId !== null}
              onHover={() => setHoveredId(item.title)}
              reduceMotion={reduceMotion}
            />
            <Seprator />
          </Fragment>
        ))}
      </div>
    </section>
  )
}

export default Hackathon
