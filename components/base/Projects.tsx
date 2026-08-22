"use client"
import { IconArrowUpRight } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { Fragment, useState } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'motion/react'
import { projectType } from '@/config/data/files.schema'
import { slugifyHeading } from '@/lib/mdx-headings'
import { cn } from '@/lib/utils'


export const Seprator = () => {
    return (
        <div className="h-[1.5px] w-full my-1 bg-secondary"></div>
    )
}

/**
 * `projects.json` carries no slug of its own — the MDX case studies in
 * `config/data/mdx` are named after the title, so `Radian` resolves to
 * `radian.mdx` through `/project/radian`.
 */
const caseStudyHref = (title: string) => `/project/${slugifyHeading(title).replace(/^-|-$/g, '')}`

/** `projects.json` stores bare hosts, so the protocol has to be added back. */
const liveSiteHref = (url: string) => (url.startsWith('http') ? url : `https://${url}`)


const ProjectsPage = ({
  data,
  heading = 'Projects',
  className,
}: {
  data: projectType[]
  /** `null` on `/project`, which supplies its own "All Projects" heading. */
  heading?: string | null
  className?: string
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  const handleMouseEnter = (e: React.MouseEvent, id: number) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
    setHoveredId(id)
  }

  return (
    <section className={cn('pt-4', className)}>
        {heading && (
          <>
            <div className="text-muted-foreground text-sm font-medium">
                {heading}
            </div>
            <Seprator/>
          </>
        )}
        <div className="flex flex-col" onMouseLeave={() => setHoveredId(null)}>
            {data.map((project) => (
                <Fragment key={project.id}>
                {/* A div rather than an anchor: the row opens the case study while
                    the arrow opens the live site, and an <a> nested in an <a> is
                    invalid HTML. The two links are layered by z-index below. */}
                <div
                    onMouseEnter={(e) => handleMouseEnter(e, project.id)}
                    onMouseMove={handleMouseMove}
                    className="relative flex px-1 py-1 rounded-lg items-center justify-between"
                >
                    {hoveredId === project.id && (
                        <motion.span
                            layoutId="hoveredBg"
                            className="absolute inset-0 bg-secondary bg-gradient-to-b from-white/30 dark:from-white/12 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] rounded-xl -z-10"
                            transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 30,
                            }}
                        />
                    )}
                    <AnimatePresence>
                        {hoveredId === project.id && (
                            <motion.div
                                style={{
                                    position: 'fixed',
                                    left: 0,
                                    top: 0,
                                    x: mouseX,
                                    y: mouseY,
                                    translateX: "-50%",
                                    translateY: "-130%",
                                }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="z-50 mb-2 px-3 py-1.5 bg-secondary bg-gradient-to-b from-white/30 dark:from-white/12 to-transparent text-secondary-foreground rounded-2xl shadow-lg border border-black/10 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] pointer-events-none text-xs sm:text-sm font-medium whitespace-nowrap"
                            >
                                {project.tooltip}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Stretched over the whole row so the labels stay clickable
                        without wrapping them, at z-10 — above the content, below
                        the arrow. */}
                    <Link
                        href={caseStudyHref(project.title)}
                        aria-label={`${project.title} case study`}
                        className="absolute inset-0 z-10 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-4 items-center relative z-0">
                        <Image
                            src={`/icons/${project.logo}`}
                            height={25}
                            width={25}
                            alt={project.title}
                            className={`transition bg-primary duration-200 rounded-lg aspect-square  ${project.id === 1 ? "p-1" : "p-0"} ${
                                hoveredId !== null && hoveredId !== project.id
                                    ? 'grayscale'
                                    : 'grayscale-0'
                            }`}
                        />
                        <h2 className={`transition-colors text-sm font-medium  duration-200 ${
                            hoveredId !== null && hoveredId !== project.id
                                ? 'text-muted-foreground'
                                : 'text-primary'
                        }`}>{project.title}</h2>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 relative z-0">
                        <p>{project.date}</p>
                        <a
                            href={liveSiteHref(project.url)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open the ${project.title} site`}
                            className="relative z-20 p-1 hover:bg-white dark:hover:bg-white/10 group rounded-lg transition ease-in "
                        >

                        <IconArrowUpRight className="size-5 font-medium transition group-hover:text-black dark:group-hover:text-white ease-in group-hover:rotate-45 "/>
                        </a>
                    </div>
                </div>
                <Seprator/>

                </Fragment>
            ))}
        </div>
    </section>
  )
}

export default ProjectsPage
