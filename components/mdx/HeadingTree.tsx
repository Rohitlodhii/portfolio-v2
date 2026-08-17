"use client";

import { motion } from "motion/react";
import type { MdxHeading } from "@/lib/mdx-headings";

export function HeadingTree({ headings }: { headings: MdxHeading[] }) {
  return (
    <nav aria-label="On this page" className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-4">
      <ul className="space-y-2 text-xs text-muted-foreground">
        {headings.map((heading) => (
          <HeadingTreeItem key={heading.id} heading={heading} />
        ))}
      </ul>
    </nav>
  );
}

function HeadingTreeItem({ heading }: { heading: MdxHeading }) {
  function scrollToHeading(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${heading.id}`);
  }

  return (
    <motion.li initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
      <a
        href={`#${heading.id}`}
        onClick={scrollToHeading}
        className="block transition-colors hover:text-foreground"
      >
        {heading.text}
      </a>
      {heading.children.length > 0 && (
        <ul className="mt-2 space-y-2 pl-3">
          {heading.children.map((child) => (
            <HeadingTreeItem key={child.id} heading={child} />
          ))}
        </ul>
      )}
    </motion.li>
  );
}
