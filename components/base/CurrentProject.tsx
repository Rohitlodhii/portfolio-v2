import { IconArrowUpRight, IconGitCommit } from '@tabler/icons-react'
import { Seprator } from '@/components/base/Projects'

/** The repo behind the newest entry in projects.json — kept here because the
    JSON schema carries live-site URLs only, not sources. */
const REPO = 'Rohitlodhii/morrit'
const COMMITS_SHOWN = 4

interface Commit {
  sha: string
  html_url: string
  commit: {
    message: string
    author: { name: string; date: string } | null
  }
}

async function fetchLatestCommits(): Promise<Commit[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/commits?per_page=${COMMITS_SHOWN}`,
      // GitHub rejects unauthenticated requests without a User-Agent.
      { headers: { 'User-Agent': 'portfolio' }, signal: AbortSignal.timeout(8000) }
    )
    if (!response.ok) return []
    return (await response.json()) as Commit[]
  } catch {
    return []
  }
}

function timeAgo(dateString?: string): string {
  if (!dateString) return ''
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const units: [number, string][] = [
    [60, 'minute'],
    [60, 'hour'],
    [24, 'day'],
  ]
  let value = seconds
  let unit = 'second'
  for (const [step, name] of units) {
    value = Math.floor(value / step)
    unit = name
    if (value < step) break
  }
  if (unit === 'day' && value >= 30) {
    const months = Math.floor(value / 30)
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`
}

/**
 * The card under "All Projects" for whatever is currently being worked on.
 * A Server Component on purpose: commits change slowly, and keeping the fetch
 * (and the whole commit list) out of the client bundle is cheaper than any
 * client-side polling would be.
 */
const CurrentProject = async () => {
  const commits = await fetchLatestCommits()

  return (
    <section className="pt-0">
      <div className="text-sm px-2 bg-blue-400  font-medium border border-black/10 dark:border-white/10 w-fit border-b-0 rounded-tl-xl rounded-tr-xl  text-white">Currently building</div>

      <div className="rounded-xl rounded-tl-none border border-black/10 dark:border-white/10 bg-gradient-to-b from-white/30 dark:from-white/12 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] p-3">
        {/* Header row: name + one-liner, with repo / live-site links on the right. */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="text-sm font-medium">Morrit</div>
            <p className="text-xs text-muted-foreground">A compile time react-inspector</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={`https://github.com/${REPO}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the Morrit repository"
              className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-lg transition ease-in"
            >
              <IconGitCommit className="size-5" />
            </a>
            <a
              href="https://morrit.vercel.app"
              target="_blank"
              rel="noreferrer"
              aria-label="Open the Morrit site"
              className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-lg transition ease-in"
            >
              <IconArrowUpRight className="size-5" />
            </a>
          </div>
        </div>

        <div className="mt-2 mb-1 flex items-center gap-2">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">Latest commits</span>
        </div>

        {commits.length > 0 ? (
          <ul className="flex flex-col">
            {commits.map((commit) => {
              // The API returns full messages; the first line is the summary.
              const summary = commit.commit.message.split('\n')[0]
              return (
                <li key={commit.sha}>
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-3 px-1 py-1 rounded-lg outline-none transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <code className="shrink-0 rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {commit.sha.slice(0, 7)}
                      </code>
                      <span className="text-xs truncate text-primary group-hover:text-foreground transition-colors">
                        {summary}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {timeAgo(commit.commit.author?.date)}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-1 py-1 text-xs text-muted-foreground">
            Couldn&apos;t load recent commits right now.
          </p>
        )}
      </div>
    </section>
  )
}

export default CurrentProject
