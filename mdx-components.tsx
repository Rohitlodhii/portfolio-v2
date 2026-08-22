import type { MDXComponents } from "mdx/types";
import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { Architecture, Article, Badge, Callout, CodeBlock, Feature, FeatureGrid, Highlight, Link, List, Paragraph, Screenshot, TechStack, Terminal, Image, OptionsTable, Table } from "@/components/mdx";
import { slugifyHeading } from "@/lib/mdx-headings";

function getHeadingText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (isValidElement(child)) {
        return getHeadingText((child.props as { children?: ReactNode }).children);
      }
      return "";
    })
    .join("");
}

function Heading({ level, children, className }: { level: 1 | 2 | 3; children?: ReactNode; className: string }) {
  const id = slugifyHeading(getHeadingText(children));
  const Tag = `h${level}` as "h1" | "h2" | "h3";

  return <Tag id={id} className={className}>{children}</Tag>;
}

export const mdxComponents = {
  Architecture, Article, Badge, Callout, CodeBlock, Feature, FeatureGrid, Highlight, Link, List, P: Paragraph, Screenshot, TechStack, Terminal, Image, OptionsTable, Table,
  pre: CodeBlock,
  h1: ({ children }: { children?: ReactNode }) => <Heading level={1} className="scroll-mt-36 mb-5 mt-10 text-lg font-normal tracking-tight first:mt-0">{children}</Heading>,
  h2: ({ children }: { children?: ReactNode }) => <Heading level={2} className="scroll-mt-36 mb-3 mt-10 border-b border-border/70 pb-2 text-md font-normal tracking-tight">{children}</Heading>,
  h3: ({ children }: { children?: ReactNode }) => <Heading level={3} className="scroll-mt-36 mb-2 mt-7 text-base font-medium tracking-tight">{children}</Heading>,
  p: Paragraph,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="my-4 list-disc space-y-2 pl-5 text-sm leading-6 text-foreground/85">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="my-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-foreground/85">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="my-6 border-l-2 border-border pl-4 italic text-muted-foreground">{children}</blockquote>,
  a: Link,
  // `---` renders nothing at all — deliberately not a rule.
  hr: () => null,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-foreground">{children}</strong>,
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => <code className={className ?? "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"}>{children}</code>,
  img: ({ src, alt }: { src?: string; alt?: string }) => <img src={src} alt={alt ?? ""} loading="lazy" className="my-6 h-auto max-w-full rounded-lg border border-border" />,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents { return mdxComponents; }
