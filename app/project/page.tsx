import { IconArrowLeft } from '@tabler/icons-react'
import Link from 'next/link'
import { Suspense } from 'react'
import React from 'react'
import { getProjects } from '@/config/data/files'
import ProjectsPage from '@/components/base/Projects'
import CurrentProject from '@/components/base/CurrentProject'
import OtherProjects from '@/components/base/OtherProjects'


// Project data comes from a JSON file that can change while the server is running.
export const dynamic = "force-dynamic";

const page = async () => {
  const projects = await getProjects()

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
          <div className="text-lg sm:text-xl font-semibold tracking-tight">All Projects</div>

          {/* The project currently being worked on, with its latest GitHub commits.
              Streamed via Suspense so the GitHub round-trip never blocks the list. */}
          <Suspense
            fallback={
              <div className="rounded-xl border border-black/10 dark:border-white/10 bg-gradient-to-b from-white/30 dark:from-white/12 to-transparent p-3 h-32 animate-pulse" />
            }
          >
            <CurrentProject />
          </Suspense>

          {/* Pinned list. The section renders its own "Pinned Projects" label,
              matching the Other Projects heading below. */}
          <ProjectsPage data={projects} heading="Pinned Projects" className="pt-4" />

          <OtherProjects />
        </div>

        <div aria-hidden="true" className="hidden lg:block lg:flex-1" />
      </div>
    </main>
  )
}

export default page
