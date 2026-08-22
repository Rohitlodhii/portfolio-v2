import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconChevronDown } from "@tabler/icons-react";
import { getMdxByName } from "@/lib/mdx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import CustomVideoPlayer from "@/components/base/CustomVideoPlayer";
import { mdxComponents } from "@/mdx-components";
import rehypeHighlight from "rehype-highlight";
import { getMdxHeadings } from "@/lib/mdx-headings";
import { HeadingTree } from "@/components/mdx/HeadingTree";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectname: string }>;
}) {
  const { projectname } = await params;
  const project = await getMdxByName(`${projectname}.mdx`);

  if (!project) notFound();

  const headings = getMdxHeadings(project.content);

  const { content } = await compileMDX({
    source: project.content,
    components: mdxComponents,
    // MDX is first-party repo content; allow JSX expression props (e.g. <Table rows={[...]} />)
    options: { blockJS: false, mdxOptions: { rehypePlugins: [rehypeHighlight] } },
  });

  return (
    <main className="w-full">
      <div className="flex w-full flex-col gap-4 px-6 py-8  md:py-16 lg:flex-row lg:items-start lg:gap-0">
        <aside className="hidden lg:sticky lg:top-16 lg:flex lg:w-[calc((100%-36rem)/2)] lg:shrink-0 lg:flex-col lg:gap-6 lg:pl-32">
            <Link
              className="flex  max-w-fit  rounded-sm items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              href="/"
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
                href="/"
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

            <header className="flex flex-col gap-8">
              <div className="flex flex-col gap-0">
                <h1 className="text-lg font-medium tracking-tight">{project.frontmatter.title}</h1>
                <p className="text-xs text-muted-foreground">{project.frontmatter.lastupdated}</p>
              </div>
              <p className="text-sm font-medium">{project.frontmatter.smalldesc}</p>
            </header>

            {project.frontmatter.videolink && (
              <div className="w-full">
                <CustomVideoPlayer url={project.frontmatter.videolink} title={project.frontmatter.title} />
              </div>
            )}

            <article className="max-w-none overflow-hidden">
              {content}
            </article>
        </div>

        <div aria-hidden="true" className="hidden lg:block lg:flex-1" />
      </div>
    </main>
  );
}
