import { IconArrowLeft } from '@tabler/icons-react'
import Link from 'next/link'
import React from 'react'
import { listBlogPosts } from '@/lib/blogs'
import { BlogList } from '@/components/ui/blog-list';


export const dynamic = "force-dynamic";

const page = async () => {
  const posts = await listBlogPosts()

  return (
    <main className="w-full">
      <div className="flex w-full flex-col gap-4 px-3 py-4 md:px-4 md:py-12 lg:flex-row lg:items-start lg:gap-0">
        <aside className="hidden lg:sticky lg:top-16 lg:flex lg:w-[calc((100%-36rem)/2)] lg:shrink-0 lg:flex-col lg:gap-6 lg:pl-32">
          <Link
            className="flex max-w-fit rounded-sm items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            href="/"
          >
            <IconArrowLeft className="size-4" />
            Back
          </Link>
        </aside>

        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 md:gap-6 lg:mx-0 lg:shrink-0">
          <div className="flex items-center justify-between lg:hidden">
            <Link
              className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
              href="/"
            >
              <IconArrowLeft className="size-3.5 sm:size-4" />
              Back
            </Link>
          </div>
          <div className="text-lg sm:text-xl font-semibold tracking-tight">All Blogs</div>

          {/* Blogs List */}
          <BlogList posts={posts} />
        </div>

        <div aria-hidden="true" className="hidden lg:block lg:flex-1" />
      </div>
    </main>
  )
}

export default page