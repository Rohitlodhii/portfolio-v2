"use client"

import React, { Fragment, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { formatBlogDateLong } from '@/lib/blog-utils'
import { IconStar } from '@tabler/icons-react'

export const Seprator = () => {
  return <div className="h-[1px] w-full my-0.5 bg-secondary" />
}

export function BlogList({ posts }: { posts: any[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (posts.length === 0) {
    return <p className="text-xs text-muted-foreground">No blogs published yet.</p>
  }

  return (
    <div className="flex flex-col" onMouseLeave={() => setHoveredId(null)}>
      {posts.map((post, index) => {
        // 0th Index Blog: Featured Card
        if (index === 0) {
          return (
            <Fragment key={post.slug}>
              {/* Section Header for 0th Blog */}

              <Link
                href={`/blogs/${post.slug}`}
                className="group flex flex-col  rounded-xl  transition-all"
              >
                {/* Top Bar: Latest Post Header */}
                <div className="px-4 py-0.5 flex items-center gap-1.5 text-[12px] text-base font-medium  bg-blue-400 max-w-fit rounded-t-xl text-white border border-border border-b-0 ">

                  <span>Latest Post</span>
                </div>

                {/* Inner Card Box */}
                <div className="flex flex-col w-full gap-6 rounded-xl rounded-tl-none border border-border bg-background p-2 pb-2 md:pb-2">
                  {/* Title, Summary, Date & Read Time, Tags */}
                  <div className="flex flex-col justify-between gap-6 px-1">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-sm sm:text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {post.title}
                      </h2>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {post.summary}
                      </p>

                      {/* Date & Read Time moved inside below summary */}
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground pt-1">
                        <span>{formatBlogDateLong(post.date)}</span>
                        <span>●</span>
                        <span>{post.readTimeMinutes} mins read</span>
                      </div>
                    </div>

                    {/* Bottom Tag List */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-xs text-muted-foreground pt-1">
                        {post.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </Fragment>
          )
        }

        // Subsequent Blogs: Mobile Responsive Animated Items
        return (
          <Fragment key={post.slug}>
            {/* Top-Left Section Title with Gap above Other Blogs */}
            {index === 1 && (
              <div className="mt-6 mb-1">
                <div className="text-muted-foreground text-xs sm:text-sm font-medium">
                  Other Blogs
                </div>
                <Seprator />
              </div>
            )}

            <Link
              href={`/blogs/${post.slug}`}
              onMouseEnter={() => setHoveredId(post.slug)}
              className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 group px-2 py-2.5 rounded-lg cursor-pointer"
            >
              {hoveredId === post.slug && (
                <motion.span
                  layoutId="hoveredBg"
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
        )
      })}
    </div>
  )
}
