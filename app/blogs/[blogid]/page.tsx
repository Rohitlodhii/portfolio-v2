import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { IconArrowLeft, IconChevronDown } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { mdxComponents } from "@/mdx-components";
import rehypeHighlight from "rehype-highlight";
import { getMdxHeadings } from "@/lib/mdx-headings";
import { HeadingTree } from "@/components/mdx/HeadingTree";
import { getBlogPostBySlug } from "@/lib/blogs";
import { formatBlogDateLong, resolveBlogCoverImage } from "@/lib/blog-utils";

// Posts come from the database, which can change while the server is running.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/blogs/[blogid]">): Promise<Metadata> {
  const { blogid } = await params;
  const post = await getBlogPostBySlug(blogid);

  if (!post) return { title: "Blog post not found" };

  const images = [resolveBlogCoverImage(post)];

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.date.toISOString(),
      tags: post.tags,
      images,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images },
  };
}

export default async function BlogPage({ params }: PageProps<"/blogs/[blogid]">) {
  const { blogid } = await params;
  const post = await getBlogPostBySlug(blogid);

  if (!post) notFound();

  const headings = getMdxHeadings(post.content);

  const { content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
    // MDX is first-party repo content; allow JSX expression props (e.g. <Table rows={[...]} />)
    options: { blockJS: false, mdxOptions: { rehypePlugins: [rehypeHighlight] } },
  });

  return (
    <main className="w-full">
      <div className="flex w-full flex-col gap-4 px-6 py-8  md:py-16 lg:flex-row lg:items-start lg:gap-0">
        <aside className="hidden lg:sticky lg:top-18 lg:flex lg:w-[calc((100%-36rem)/2)] lg:shrink-0 lg:flex-col lg:gap-6 lg:pl-32">
            <Link
              className="flex  max-w-fit  rounded-sm items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              href="/blogs"
            >
              <IconArrowLeft className="size-4" />
              Back
            </Link>

            {headings.length > 0 && <HeadingTree headings={headings} />}
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

              {headings.length > 0 && (
                <Popover>
                  <PopoverTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />}>
                    <IconChevronDown className="size-4" />
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 max-h-80 overflow-y-auto">
                    <HeadingTree headings={headings} />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <header className="flex flex-col gap-6">
              <div className="flex flex-col gap-0">
                <h1 className="text-lg font-medium tracking-tight">{post.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {formatBlogDateLong(post.date)} · {post.readTimeMinutes} min read
                </p>
              </div>

              {post.introductionText && (
                <p className="text-sm font-medium text-muted-foreground">{post.introductionText}</p>
              )}

              {post.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              <div className="overflow-hidden rounded-xl border border-border p-1">
                {/* Natural aspect ratio, no crop. `max-h` guards against a portrait
                    `imageUrl` — those are arbitrary remote URLs from the admin API. */}
                <img
                  src={resolveBlogCoverImage(post)}
                  alt={post.title}
                  className="h-auto max-h-[70vh] w-full rounded-[10px] object-cover"
                />
              </div>
            </header>

            <article className="max-w-none overflow-hidden">
              {content}
            </article>
        </div>

        <div aria-hidden="true" className="hidden lg:block lg:flex-1" />
      </div>
    </main>
  );
}
