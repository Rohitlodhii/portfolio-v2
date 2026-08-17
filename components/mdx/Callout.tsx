import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "warning" | "success";

export function Callout({ children, title, variant = "info" }: { children: ReactNode; title?: string; variant?: CalloutVariant }) {
  return <aside className={cn("my-6 rounded-lg border px-4 py-3.5 text-sm leading-6", {
    "border-border bg-muted/35": variant === "info",
    "border-amber-500/25 bg-amber-500/5": variant === "warning",
    "border-emerald-500/25 bg-emerald-500/5": variant === "success",
  })}>
    {title && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground">{title}</p>}
    <div className="text-muted-foreground">{children}</div>
  </aside>;
}
