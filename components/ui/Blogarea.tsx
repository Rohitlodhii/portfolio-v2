"use client"

import React, { Fragment, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { formatBlogDateLong } from '@/lib/blog-utils'
import { Seprator } from '@/components/ui/blog-list'

// Projects.tsx also lives on the home page and animates its highlight with the
// `hoveredBg` layoutId — a shared id would make the pill fly between sections.
const HOVER_LAYOUT_ID = 'blogarea-hover'

type BlogAreaPost = {
  slug: string
  title: string
  date: Date
  readTimeMinutes: number
}

/**
 * Home-page blog list: the same row treatment `BlogList` uses for its
 * "Other Blogs" items, applied to every post — including the latest one, which
 * simply sits on top instead of getting the featured card.
 */
export function Blogarea({ posts }: { posts: BlogAreaPost[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (posts.length === 0) return null

  return (
    <section className="pt-4">
      <div className="text-muted-foreground text-sm font-medium pb-2 ">Blogs</div>
      <Seprator />
      {/* Clearing on the list rather than per row means crossing a separator
          doesn't blink the highlight out and back. */}
      <div className="flex flex-col" onMouseLeave={() => setHoveredId(null)}>
        {posts.map((post) => (
          <Fragment key={post.slug}>
            <Link
              href={`/blogs/${post.slug}`}
              onMouseEnter={() => setHoveredId(post.slug)}
              className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 group px-1 py-2.5 rounded-lg cursor-pointer"
            >
              {hoveredId === post.slug && (
                <motion.span
                  layoutId={HOVER_LAYOUT_ID}
                  className="absolute inset-0 bg-secondary bg-gradient-to-b from-white/30 dark:from-white/12 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] rounded-lg -z-10"
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}

              {/* Title (Top-Left on Mobile & Desktop) */}
              <h2
                className={`text-sm font-medium tracking-tight transition-colors line-clamp-1 duration-200 relative z-10 ${
                  hoveredId !== null && hoveredId !== post.slug
                    ? 'text-muted-foreground'
                    : 'text-primary'
                }`}
              >
                {post.title}
              </h2>

              {/* Date & Read Time */}
              <div className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 relative z-10 shrink-0">
                <span>{formatBlogDateLong(post.date)}</span>
                <span>●</span>
                <span>{post.readTimeMinutes} mins read</span>
              </div>
            </Link>
            <Seprator />
          </Fragment>
        ))}
      </div>
    </section>
  )
}

export default Blogarea
