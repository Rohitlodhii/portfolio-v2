import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ListProps = {
  children: ReactNode;
  ordered?: boolean;
  className?: string;
};

export function List({ children, ordered = false, className }: ListProps) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={cn(
        "my-5 space-y-2 pl-6 text-sm leading-4 text-foreground/85 marker:text-muted-foreground",
        ordered ? "list-decimal" : "list-disc",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
