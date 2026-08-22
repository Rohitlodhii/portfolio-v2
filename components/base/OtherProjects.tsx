"use client"

import React, { Fragment, useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { motion, useReducedMotion } from 'motion/react'
import { IconArrowUpRight, IconCode } from '@tabler/icons-react'
import { otherProjects, type OtherProjectType } from '@/config/data/other-projects'
import { Seprator } from '@/components/base/Projects'
import { cn } from '@/lib/utils'

// Same easings as the hackathon rows, so the two lists read as one system.
const POP_EASE = 'ease-[cubic-bezier(0.34,1.56,0.64,1)]'
const EASE_OUT = 'ease-[cubic-bezier(0.23,1,0.32,1)]'

// Shared across every row so Motion slides the highlight between rows instead
// of cross-fading two separate backgrounds. Distinct from the hackathon list's
// id so hovering one list never drags the highlight into the other.
const HOVER_LAYOUT_ID = 'other-projects-hover'

interface OtherProjectRowProps {
  project: OtherProjectType
  isHovered: boolean
  anyHovered: boolean
  onHover: () => void
  reduceMotion: boolean
}

const OtherProjectRow = ({ project, isHovered, anyHovered, onHover, reduceMotion }: OtherProjectRowProps) => {
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
              <IconCode className="size-3.5 text-primary-foreground" />
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors duration-200 line-clamp-1 sm:line-clamp-none",
              anyHovered && !isHovered ? 'text-muted-foreground' : 'text-primary'
            )}>
              {project.title}
            </span>
          </span>
          <span className="text-sm text-muted-foreground">{project.date}</span>
        </Popover.Trigger>

        <div className="text-sm text-muted-foreground flex items-center gap-2 relative z-10">
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${project.title}`}
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
        {/* Portaled full-viewport dim so the whole page recedes behind the popup,
            over the dock and TopScrollBlur (both z-50) but under the popup itself. */}
        <Popover.Backdrop
          className={cn(
            'fixed inset-0 z-[80] bg-primary/10',
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
              'w-[min(20rem,var(--available-width))] lg:w-[min(36rem,var(--available-width))]',
              'bg-card dark:bg-secondary',
              'origin-(--transform-origin)',
              'transition-[opacity,scale] duration-300',
              POP_EASE,
              'data-[starting-style]:scale-75 data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-75 data-[ending-style]:opacity-0',
              'data-[instant]:duration-0',
              'motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <Popover.Title className="text-sm font-medium text-secondary-foreground">
                  {project.title}
                </Popover.Title>
                <p className="text-xs text-muted-foreground">
                  {project.subtitle}
                </p>
              </div>
            </div>

            <Popover.Description className="text-xs leading-relaxed text-muted-foreground flex flex-col gap-1.5">
              <p>{project.main}</p>
              {project.listitems && (
                <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px]">
                  {project.listitems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </Popover.Description>

            {project.languages && (
              <div className="flex flex-wrap gap-1">
                {project.languages.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {project.link && (
              <a
                href={project.link}
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

const OtherProjects = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section className="pt-4">
      <div className="text-sm font-medium text-muted-foreground">Other Projects</div>
      <Seprator />
      <div className="flex flex-col" onPointerLeave={() => setHoveredId(null)}>
        {otherProjects.map((item) => (
          <Fragment key={item.title}>
            <OtherProjectRow
              project={item}
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

export default OtherProjects
