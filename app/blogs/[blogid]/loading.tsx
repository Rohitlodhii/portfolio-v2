import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

function Bar({ className }: { className?: string }) {
  return <div className={`rounded bg-secondary ${className ?? ""}`} />;
}

/**
 * Instant shell for /blogs/[blogid].
 *
 * Needed as its own file, not just for symmetry: `app/blogs/loading.tsx` wraps
 * child segments too, so without this override, opening a post would flash the
 * blog *list* skeleton before the article arrived. This post page is heavier
 * than the list — a Prisma lookup plus an MDX compile — so it benefits most.
 */
export default function Loading() {
  return (
    <main className="w-full">
      <div className="flex w-full flex-col gap-4 px-6 py-8 md:py-16 lg:flex-row lg:items-start lg:gap-0">
        <aside className="hidden lg:sticky lg:top-18 lg:flex lg:w-[calc((100%-36rem)/2)] lg:shrink-0 lg:flex-col lg:gap-6 lg:pl-32">
          <Link
            className="flex max-w-fit rounded-sm items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            href="/blogs"
          >
            <IconArrowLeft className="size-4" />
            Back
          </Link>

          {/* Heading tree — count is unknowable until the MDX is parsed. */}
          <div className="flex flex-col gap-2 animate-pulse">
            <Bar className="h-3 w-32" />
            <Bar className="h-3 w-24 ml-3" />
            <Bar className="h-3 w-28 ml-3" />
            <Bar className="h-3 w-20" />
          </div>
        </aside>

        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 lg:mx-0 lg:shrink-0">
          <div className="flex items-center justify-between lg:hidden">
            <Link
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              href="/blogs"
            >
              <IconArrowLeft className="size-4" />
              Back
            </Link>
          </div>

          <div className="animate-pulse flex flex-col gap-6" role="status" aria-label="Loading post">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <Bar className="h-5 w-2/3" />
                <Bar className="h-3 w-48" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Bar className="h-3.5 w-full" />
                <Bar className="h-3.5 w-4/5" />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Bar className="h-5 w-16 rounded-md" />
                <Bar className="h-5 w-20 rounded-md" />
                <Bar className="h-5 w-14 rounded-md" />
              </div>

              {/* Cover image well. Fixed 16/9 so the article below doesn't jump
                  as far when the real image (unknown height) lands. */}
              <div className="overflow-hidden rounded-xl border border-border p-1">
                <div className="aspect-video w-full rounded-[10px] bg-secondary" />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Bar className="h-3.5 w-full" />
              <Bar className="h-3.5 w-11/12" />
              <Bar className="h-3.5 w-full" />
              <Bar className="h-3.5 w-3/4" />
              <Bar className="h-3.5 w-5/6 mt-4" />
              <Bar className="h-3.5 w-full" />
              <Bar className="h-3.5 w-2/3" />
            </div>

            <span className="sr-only">Loading post…</span>
          </div>
        </div>

        <div aria-hidden="true" className="hidden lg:block lg:flex-1" />
      </div>
    </main>
  );
}
