import NextLink from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const linkStyles =
  "font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground";

/**
 * Links inside MDX. In-app routes navigate client-side, same-page anchors stay
 * plain, and anything off-site opens in a new tab with a marker so the jump is
 * not a surprise.
 */
export function Link({
  children,
  href,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  const target = href ?? "";

  if (target.startsWith("#")) {
    return (
      <a href={target} className={cn(linkStyles, className)} {...props}>
        {children}
      </a>
    );
  }

  if (target.startsWith("/")) {
    return (
      <NextLink href={target} className={cn(linkStyles, className)} {...props}>
        {children}
      </NextLink>
    );
  }

  return (
    <a
      href={target}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(linkStyles, className)}
      {...props}
    >
      {children}
      {/* `inline`, not `inline-flex`: the anchor has to stay wrappable mid-paragraph. */}
      <IconArrowUpRight
        aria-hidden="true"
        className="ml-0.5 inline size-3 align-[-0.1em] opacity-60"
      />
    </a>
  );
}
