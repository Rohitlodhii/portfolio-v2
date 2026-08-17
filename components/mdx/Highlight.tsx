import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Highlight({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "green" | "blue" | "amber" }) {
  return <span className={cn("rounded-md px-1.5 py-0.5 font-medium", {
    "bg-foreground/8 text-foreground": variant === "default",
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300": variant === "green",
    "bg-sky-500/10 text-sky-700 dark:text-sky-300": variant === "blue",
    "bg-amber-500/10 text-amber-700 dark:text-amber-300": variant === "amber",
  })}>{children}</span>;
}
