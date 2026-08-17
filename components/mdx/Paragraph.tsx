import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Paragraph({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }) {
  return (
    <p
      className={cn("my-4 text-sm font-medium  leading-5 text-foreground/85", className)}
      {...props}
    >
      {children}
    </p>
  );
}
