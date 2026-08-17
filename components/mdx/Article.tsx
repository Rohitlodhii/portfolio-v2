import type { ReactNode } from "react";

export function Article({ children }: { children: ReactNode }) {
  return (
    <article className="my-8 border-l-2 border-foreground/15 pl-5 text-base leading-8 text-foreground/90 [&>p]:my-0">
      {children}
    </article>
  );
}
