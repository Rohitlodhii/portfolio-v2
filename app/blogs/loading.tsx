import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

/** One shimmering bar. Width is passed in so each row can vary. */
function Bar({ className }: { className?: string }) {
  return <div className={`rounded bg-secondary ${className ?? ""}`} />;
}

/**
 * Instant shell for /blogs.
 *
 * `page.tsx` is `force-dynamic` and awaits a Prisma query, so without this the
 * dock's Blogs link sits on the old route until the database answers. The
 * wrapper markup is copied from `page.tsx` — the chrome that doesn't depend on
 * data (Back links, the heading) renders for real, and only the list is faked,
 * so the swap is a fill-in rather than a re-layout.
 */
export default function Loading() {
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

          <div className="flex flex-col animate-pulse" role="status" aria-label="Loading blogs">
            {/* Featured card — mirrors the index === 0 branch of BlogList. */}
            <div className="flex flex-col rounded-xl bg-blue-300">
              <div className="px-3 py-1 flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-orange-950/80 w-full">
                <span>Latest Post</span>
              </div>

              <div className="flex flex-col w-full gap-6 rounded-xl border border-border bg-background p-2 pb-2 md:pb-2">
                <div className="flex flex-col justify-between gap-6 px-1">
                  <div className="flex flex-col gap-1">
                    <Bar className="h-4 sm:h-5 w-3/4" />
                    <div className="flex flex-col gap-1 pt-1">
                      <Bar className="h-3 w-full" />
                      <Bar className="h-3 w-5/6" />
                    </div>
                    <Bar className="h-3 w-44 mt-2" />
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    <Bar className="h-4 w-16 rounded-sm" />
                    <Bar className="h-4 w-12 rounded-sm" />
                    <Bar className="h-4 w-20 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 mb-1">
              <div className="text-muted-foreground text-xs sm:text-sm font-medium">Other Blogs</div>
              <div className="h-[1px] w-full my-0.5 bg-secondary" />
            </div>

            {/* Rows. Widths alternate so it doesn't read as a repeating block. */}
            {["w-2/3", "w-1/2", "w-3/5", "w-2/5", "w-1/2"].map((width, index) => (
              <div key={index}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 px-2 py-2.5">
                  <Bar className={`h-3.5 ${width}`} />
                  <Bar className="h-3 w-36 shrink-0" />
                </div>
                <div className="h-[1px] w-full my-0.5 bg-secondary" />
              </div>
            ))}

            <span className="sr-only">Loading blogs…</span>
          </div>
        </div>

        <div aria-hidden="true" className="hidden lg:block lg:flex-1" />
      </div>
    </main>
  );
}
